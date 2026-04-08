import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import ChildPanel from '@/models/ChildPanel';
import Transaction from '@/models/Transaction';
import { getSession, getTokenFromRequest } from '@/lib/auth-mongo';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { domain, adminName, adminPassword } = await req.json();
    const token = await getTokenFromRequest(req);

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const session = await getSession(token);

    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = session.userId as any;
    const userId = user._id.toString();

    // 1. Validate inputs
    if (!domain || !adminName || !adminPassword) {
      return NextResponse.json({ error: 'Please provide all required fields' }, { status: 400 });
    }

    // 2. Check for unique domain
    const existingPanel = await ChildPanel.findOne({ domain });
    if (existingPanel) {
      return NextResponse.json({ error: 'Domain is already registered' }, { status: 400 });
    }

    // 3. Check user balance (Price: $10.99 = ₦14,287)
    const priceInNaira = 14287;
    const priceInUsd = 10.99;

    if (user.walletBalance < priceInNaira) {
      return NextResponse.json(
        { error: `Insufficient balance. You need ₦${priceInNaira.toLocaleString()} to purchase a child panel.` },
        { status: 400 }
      );
    }

    // 4. Hash admin password
    const hashedAdminPassword = await bcrypt.hash(adminPassword, 10);

    // 5. Debit user wallet
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $inc: { walletBalance: -priceInNaira },
      },
      { new: true }
    );

    // 6. Create Child Panel record
    const childPanel = await ChildPanel.create({
      userId: user._id,
      domain,
      adminName,
      adminPassword: hashedAdminPassword,
      priceInUsd,
      priceInNaira,
      status: 'pending',
    });

    // 7. Create Transaction record
    await Transaction.create({
      userUUID: userId,
      type: 'purchase',
      amount: priceInNaira,
      amountUSD: priceInUsd,
      status: 'successful',
      description: `Child Panel Subscription for ${domain}`,
      reference: childPanel._id.toString(),
    });

    return NextResponse.json({
      success: true,
      message: 'Child panel request submitted successfully',
      newBalance: updatedUser?.walletBalance,
    });

  } catch (error: any) {
    console.error('Child Panel Submission Error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
