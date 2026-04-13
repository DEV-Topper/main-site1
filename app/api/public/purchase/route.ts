import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Account from '@/models/Account';
import Purchase from '@/models/Purchase';
import Transaction from '@/models/Transaction';
import User from '@/models/User';

export async function POST(req: Request) {
  try {
    const { accountId, quantity } = await req.json();
    const apiKey = req.headers.get("x-api-key");

    if (!apiKey) {
      return NextResponse.json({ error: 'API Key is required' }, { status: 401 });
    }

    if (!accountId || !quantity || quantity <= 0) {
      return NextResponse.json({ error: 'Invalid account ID or quantity' }, { status: 400 });
    }

    await connectDB();
    
    // Find user by API Key instead of session
    const user = await User.findOne({ apiKey });

    if (!user) {
      return NextResponse.json({ error: 'Invalid API Key' }, { status: 401 });
    }

    const userId = user._id.toString();

    const account = await Account.findById(accountId).select(
      '+bulkLogs +vpnType +description +subcategory +type',
    );

    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    if (account.status !== 'Available') {
      return NextResponse.json(
        { error: 'Account is not available' },
        { status: 400 },
      );
    }

    if (!account.bulkLogs || account.bulkLogs.length < quantity) {
      return NextResponse.json(
        { error: 'Insufficient stock' },
        { status: 400 },
      );
    }

    const totalCost = account.price * quantity;
    if (user.walletBalance < totalCost) {
      return NextResponse.json(
        { error: 'Insufficient balance' },
        { status: 400 },
      );
    }

    const purchasedCredentials = account.bulkLogs.slice(0, quantity);
    const remainingBulkLogs = account.bulkLogs.slice(quantity);

    // Update user balance and purchased count
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $inc: { walletBalance: -totalCost, purchasedAccounts: quantity },
      },
      { new: true },
    );

    // Update account stock
    await Account.findByIdAndUpdate(accountId, {
      logs: remainingBulkLogs.length,
      bulkLogs: remainingBulkLogs,
      ...(remainingBulkLogs.length === 0 && { status: 'Sold Out' }),
    });

    const accountObj = account.toObject() as any;
    const typeValue = accountObj.vpnType || accountObj.description || accountObj.type || '';

    // Create purchase record
    const purchase = await Purchase.create({
      userUUID: userId,
      quantity,
      platform: account.platform,
      totalAmount: totalCost,
      status: 'completed',
      credentials: purchasedCredentials,
      accountId: accountId,
      subcategory: account.subcategory || '',
      type: typeValue,
      followers: account.followers || 0,
    });

    // Create transaction record
    await Transaction.create({
      userUUID: userId,
      type: 'purchase',
      amount: totalCost,
      status: 'successful',
      description: `Public API Purchase: ${quantity} ${account.platform} account(s)`,
      reference: purchase._id.toString(),
    });

    return NextResponse.json({
      success: true,
      purchase: {
        ...purchase.toObject(),
        credentials: purchasedCredentials,
      },
      newBalance: updatedUser?.walletBalance,
    });
  } catch (error: any) {
    console.error('Public Purchase error:', error);
    return NextResponse.json({ error: 'Purchase failed' }, { status: 500 });
  }
}
