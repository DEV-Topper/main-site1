import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Transaction from '@/models/Transaction';
import crypto from 'crypto';

/**
 * Test endpoint to manually process Heleket webhook
 * This allows processing webhooks without signature verification for debugging
 * 
 * Usage: POST /api/payments/heleket-webhook-test
 * Body: Full webhook payload from Heleket
 */

export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log('🧪 TEST WEBHOOK - Processing manually:', {
      orderId: body.order_id,
      status: body.status,
      amount: body.payment_amount,
      uuid: body.uuid,
    });

    // Skip signature verification for testing
    console.log('⚠️  SKIPPING SIGNATURE VERIFICATION (TEST MODE)');

    await connectDB();

    const { order_id, status, payment_amount, currency, uuid } = body;

    if (!order_id) {
      return NextResponse.json({ error: 'Invalid order_id' }, { status: 400 });
    }

    // Extract userId from order_id (format: userId-timestamp)
    const userId = order_id.split('-')[0];

    if (!userId) {
      return NextResponse.json({ error: 'Invalid order_id format' }, { status: 400 });
    }

    const user = await User.findById(userId);
    if (!user) {
      console.error(`User not found: ${userId}`);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log(`👤 User found: ${user.email}`);

    // Convert payment_amount to number
    const depositAmount = parseFloat(payment_amount);

    // Handle different payment statuses
    if (status === 'paid' || status === 'confirm_check' || status === 'paid_over') {
      console.log(`Processing successful payment...`);

      // Add funds to user wallet
      const previousBalance = user.walletBalance || 0;
      user.walletBalance = previousBalance + depositAmount;
      await user.save();

      console.log(
        `💰 Wallet updated: ${previousBalance} → ${user.walletBalance}`,
      );

      // Create transaction record
      const transaction = await Transaction.create({
        userUUID: userId,
        type: 'deposit',
        amount: depositAmount,
        status: 'successful',
        description: `Crypto deposit via Heleket (${currency})${status === 'paid_over' ? ' - Overpaid' : ''}`,
        reference: uuid,
      });

      console.log(`✅ Transaction created:`, {
        id: transaction._id,
        amount: depositAmount,
        status: 'successful',
      });

      return NextResponse.json(
        {
          success: true,
          message: 'Payment processed',
          user: {
            id: user._id,
            email: user.email,
            newBalance: user.walletBalance,
          },
          transaction: {
            id: transaction._id,
            amount: depositAmount,
          },
        },
        { status: 200 },
      );
    } else if (status === 'wrong_amount') {
      user.walletBalance = (user.walletBalance || 0) + depositAmount;
      await user.save();

      await Transaction.create({
        userUUID: userId,
        type: 'deposit',
        amount: depositAmount,
        status: 'successful',
        description: `Crypto deposit via Heleket - wrong amount paid`,
        reference: uuid,
      });

      return NextResponse.json(
        { success: true, message: 'Payment processed (wrong amount)' },
        { status: 200 },
      );
    } else if (status === 'fail' || status === 'system_fail') {
      await Transaction.create({
        userUUID: userId,
        type: 'deposit',
        amount: depositAmount,
        status: 'failed',
        description: `Crypto deposit failed (${status})`,
        reference: uuid,
      });

      console.log(`❌ Payment failed for user ${userId}: ${status}`);

      return NextResponse.json({ success: true, message: 'Payment failed' }, { status: 200 });
    }

    console.log(`Webhook with status "${status}" processed`);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Test webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 },
    );
  }
}
