import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Transaction from '@/models/Transaction';
import { verifyHeleketeSignature } from '@/lib/heleket';

// Default exchange rate: 1 USD = 1,383 Naira (updated 28-03-2026)
const DEFAULT_USD_TO_NAIRA_RATE = 1383;

interface HeleketeWebhook {
  type: string;
  uuid: string;
  order_id: string;
  amount: string;           // invoice amount (USD)
  payment_amount: string;   // amount paid in payer's crypto currency (e.g. BTC)
  payment_amount_usd: string; // ✅ actual USD equivalent of what was paid
  merchant_amount: string;  // what merchant receives (USD after fees)
  commission: string;
  is_final: boolean;
  status: string;
  from?: string;
  network?: string;
  currency: string;
  payer_currency: string;
  txid?: string;
  sign: string;
  [key: string]: any;
}

/**
 * Get current USD to Naira exchange rate
 */
async function getExchangeRate(): Promise<number> {
  try {
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    if (response.ok) {
      const data = await response.json();
      const nairaRate = data.rates?.NGN;
      if (nairaRate) {
        console.log(`💱 Current exchange rate: 1 USD = ₦${nairaRate}`);
        return nairaRate;
      }
    }
  } catch (error) {
    console.warn('Exchange rate API failed, using default');
  }
  return DEFAULT_USD_TO_NAIRA_RATE;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as HeleketeWebhook;

    console.log('📨 Heleket webhook received:', {
      orderId: body.order_id,
      status: body.status,
      uuid: body.uuid,
      // Log all amount fields for debugging
      amount: body.amount,
      payment_amount: body.payment_amount,
      payment_amount_usd: body.payment_amount_usd,
      merchant_amount: body.merchant_amount,
      payer_currency: body.payer_currency,
      currency: body.currency,
      is_final: body.is_final,
    });

    // ── Verify webhook signature ──────────────────────────────────────────
    const { sign, ...dataWithoutSign } = body;

    const isValid = verifyHeleketeSignature(dataWithoutSign, sign);

    if (!isValid) {
      console.error('❌ Webhook signature verification FAILED — rejecting request');
      // Return 200 so Heleket doesn't keep retrying with an invalid sig,
      // but do NOT process the payment.
      return NextResponse.json({ error: 'Invalid signature' }, { status: 200 });
    }

    console.log('✅ Signature verified OK');

    await connectDB();

    const { order_id, status, payment_amount_usd, merchant_amount, amount, currency, uuid } = body;

    if (!order_id) {
      return NextResponse.json({ error: 'Invalid order_id' }, { status: 400 });
    }

    // Extract userId from order_id (format: userId-timestamp)
    const userId = order_id.split('-')[0];
    if (!userId) {
      return NextResponse.json({ error: 'Invalid order_id format' }, { status: 400 });
    }

    // ── Only process final statuses ───────────────────────────────────────
    // Heleket sends many intermediate statuses (waiting, process, check, etc.)
    // We only care about final outcomes.
    const successStatuses = ['paid', 'paid_over', 'wrong_amount', 'confirm_check'];
    const failureStatuses = ['fail', 'system_fail', 'cancel', 'refund_paid'];
    const allHandledStatuses = [...successStatuses, ...failureStatuses];

    if (!allHandledStatuses.includes(status)) {
      console.log(`ℹ️  Skipping non-final status: "${status}"`);
      return NextResponse.json({ success: true }, { status: 200 });
    }

    // ── Idempotency check ────────────────────────────────────────────────
    // Heleket may retry webhooks. Prevent double-crediting by checking uuid.
    if (uuid) {
      const existing = await Transaction.findOne({ reference: uuid });
      if (existing) {
        console.log(`⚠️  Duplicate webhook for uuid=${uuid} — already processed. Ignoring.`);
        return NextResponse.json({ success: true }, { status: 200 });
      }
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // ── Determine the USD amount ──────────────────────────────────────────
    // payment_amount_usd = USD value of what the payer actually sent
    // merchant_amount    = USD the merchant receives after fees (fallback)
    // amount             = original invoice amount (last resort fallback)
    //
    // DO NOT use `payment_amount` — that is in the payer's crypto (e.g. BTC)
    // and will be a tiny number like 0.00001, not USD.
    const depositAmountUSD =
      parseFloat(payment_amount_usd) ||
      parseFloat(merchant_amount) ||
      parseFloat(amount) ||
      0;

    if (depositAmountUSD <= 0) {
      console.error(`❌ Could not determine USD deposit amount. Raw fields:`, {
        payment_amount_usd,
        merchant_amount,
        amount,
      });
      return NextResponse.json({ error: 'Invalid payment amount' }, { status: 400 });
    }

    // ── Convert USD → Naira ───────────────────────────────────────────────
    const exchangeRate = await getExchangeRate();
    const depositAmountNaira = Math.round(depositAmountUSD * exchangeRate * 100) / 100;

    console.log(
      `💱 Converting: $${depositAmountUSD} USD (@ ₦${exchangeRate}) => ₦${depositAmountNaira.toLocaleString()}`,
    );

    // ── Process by status ────────────────────────────────────────────────
    if (successStatuses.includes(status)) {
      // Credit the user's wallet
      user.walletBalance = (user.walletBalance || 0) + depositAmountNaira;
      await user.save();

      const isOverpaid = status === 'paid_over';
      const isWrongAmount = status === 'wrong_amount';
      const suffix = isOverpaid
        ? ' (Overpaid)'
        : isWrongAmount
          ? ' (Wrong amount paid)'
          : '';

      const desc = `Crypto deposit via Heleket (USD) $${depositAmountUSD.toFixed(2)} => ₦${depositAmountNaira.toLocaleString()}${suffix}`;

      await Transaction.create({
        userUUID: userId,
        type: 'deposit',
        amount: depositAmountNaira,
        status: 'successful',
        description: desc,
        reference: uuid,
      });

      console.log(`✅ Credited +₦${depositAmountNaira.toLocaleString()} to user ${userId} (${user.email})`);
      return NextResponse.json({ success: true }, { status: 200 });
    }

    // Failure statuses
    await Transaction.create({
      userUUID: userId,
      type: 'deposit',
      amount: depositAmountNaira,
      status: 'failed',
      description: `Crypto deposit failed (${status})`,
      reference: uuid,
    });

    console.log(`❌ Payment failed for user ${userId} — status: ${status}`);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
