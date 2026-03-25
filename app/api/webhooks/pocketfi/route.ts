import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import PocketfiCheckout from '@/models/PocketfiCheckout';
import PocketfiVirtualAccount from '@/models/PocketfiVirtualAccount';
import User from '@/models/User';
import Transaction from '@/models/Transaction';
import Notification from '@/models/Notification';
import { timingSafeEqual } from 'crypto';

async function readRawBody(req: Request): Promise<string> {
  return await req.text();
}

export async function POST(req: Request) {
  try {
    const secret = process.env.POCKETFI_WEBHOOK_SECRET;
    if (!secret) {
      return NextResponse.json(
        { error: 'Webhook not configured' },
        { status: 500 }
      );
    }

    const rawBody = await readRawBody(req);
    // Signature verification logic here if needed (commented out in original)

    const data = JSON.parse(rawBody || '{}');
    const order = data.order || {};
    const transactionData = data.transaction || {};
    const reference: string | undefined = transactionData.reference;

    if (!reference) {
      return NextResponse.json(
        { error: 'Missing transaction reference' },
        { status: 400 }
      );
    }

    await connectDB();

    // 1. Check Checkouts
    const checkout = await PocketfiCheckout.findOne({
      paymentId: reference,
      status: 'pending'
    });

    let userId: string | null = null;
    let paidAmount: number | null = null;

    if (checkout) {
      userId = checkout.userId;
      paidAmount = Number(
        order.settlement_amount || order.amount || checkout.amount
      );
    }

    // 2. Check Virtual Accounts if no checkout match
    if (!userId) {
      const accountNumber = (
        transactionData.account ||
        transactionData.accountNumber ||
        order.account ||
        data.account_number ||
        ''
      ).toString().trim();

      if (accountNumber) {
        const va = await PocketfiVirtualAccount.findOne({
          accountNumber,
          status: 'active'
        });

        if (va) {
          userId = va.userId;
          paidAmount = Number(order.settlement_amount || order.amount || 0);
        }
      }
    }

    if (!userId || !paidAmount || paidAmount <= 0) {
      return NextResponse.json(
        { message: 'No matching checkout or virtual account' },
        { status: 200 }
      );
    }

    // 3. Update User Balance & Referrals
    const user = await User.findById(userId);
    if (!user) {
      // User not found?
      return NextResponse.json({ message: 'User not found' }, { status: 200 });
    }

    // Start a session for transaction if you want, or just do updates.
    // Sequential updates:

    // Calculate commission
    const commission = user.referredBy ? Number((paidAmount * 0.03).toFixed(2)) : 0;

    // Update User Balance
    user.walletBalance = Number((user.walletBalance + paidAmount).toFixed(2));
    await user.save();

    // Handle Referral
    if (user.referredBy && commission > 0) {
      // Find referrer
      // referredBy field in User model stores the ID of the referrer (string)
      const referrer = await User.findById(user.referredBy);
      if (referrer) {
        referrer.referralBalance = Number((referrer.referralBalance + commission).toFixed(2));
        
        // Update specific referral entry
        const referralEntry = referrer.referrals.find((r: any) => r.uid === userId);
        if (referralEntry) {
          referralEntry.earnings = Number((referralEntry.earnings + commission).toFixed(2));
          referralEntry.date = new Date();
        } else {
          referrer.referrals.push({
            uid: userId,
            username: user.username,
            date: new Date(),
            earnings: commission
          });
        }
        await referrer.save();
      }
    }

    // 4. Create Transaction Record
    await Transaction.create({
      userUUID: userId,
      type: 'deposit',
      amount: paidAmount,
      status: 'successful',
      reference,
      description: `Funded wallet via PocketFi (Ref: ${reference})`
    });

    // 5. Create Notification
    await Notification.create({
      userUUID: userId,
      type: 'payment',
      title: 'Wallet Funded',
      message: `Successfully added ₦${paidAmount.toLocaleString()} to your account`,
      read: false,
      source: 'notifications'
    });

    // 6. Update Checkout Status if applicable
    if (checkout) {
      checkout.status = 'completed';
      await checkout.save();
    }

    return NextResponse.json({ message: 'success' }, { status: 200 });

  } catch (error: any) {
    console.error('PocketFi webhook error', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
