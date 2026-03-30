import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Account from '@/models/Account';
import Purchase from '@/models/Purchase';
import Transaction from '@/models/Transaction';
import User from '@/models/User';
import { getSession } from '@/lib/auth-mongo';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const { accountId, quantity } = await req.json();
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const session = await getSession(token);

    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = session.userId as any; // User document
    const userId = user._id.toString();

    // 1. Get Account
    // We explicitly select +bulkLogs to get the hidden field
    const account = await Account.findById(accountId).select(
      '+bulkLogs +vpnType +description +subcategory +type',
    );

    console.debug({account})

    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    if (account.status !== 'Available') {
      return NextResponse.json(
        { error: 'Account is not available' },
        { status: 400 },
      );
    }

    // 2. Check Stock
    // Use the actual array length or the 'logs' counter.
    // Assuming bulkLogs contains the actual credentials.
    if (!account.bulkLogs || account.bulkLogs.length < quantity) {
      return NextResponse.json(
        { error: 'Insufficient stock' },
        { status: 400 },
      );
    }

    // 3. Check Balance
    const totalCost = account.price * quantity;
    if (user.walletBalance < totalCost) {
      return NextResponse.json(
        { error: 'Insufficient balance' },
        { status: 400 },
      );
    }

    // 4. Perform Transaction (Atomic-ish)

    // Extract credentials to give to user
    const purchasedCredentials = account.bulkLogs.slice(0, quantity);
    const remainingBulkLogs = account.bulkLogs.slice(quantity);

    // Decrement User Balance
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $inc: { walletBalance: -totalCost, purchasedAccounts: quantity },
      },
      { new: true },
    );

    // Update Account Stock and status if sold out
    await Account.findByIdAndUpdate(accountId, {
      logs: remainingBulkLogs.length,
      bulkLogs: remainingBulkLogs,
      ...(remainingBulkLogs.length === 0 && { status: 'Sold Out' }),
    });

    // Determine the type value - use vpnType first, then description as fallback
    const accountObj = account.toObject() as any;
    const typeValue = accountObj.vpnType || accountObj.description || accountObj.type || '';

    // Create Purchase Record with credentials
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

    // Create Transaction Record
    await Transaction.create({
      userUUID: userId,
      type: 'purchase',
      amount: totalCost,
      status: 'successful',
      description: `Purchased ${quantity} ${account.platform} account(s)`,
      reference: purchase._id.toString(),
    });

    return NextResponse.json({
      success: true,
      purchase: {
        ...purchase.toObject(),
        credentials: purchasedCredentials, // Send back credentials immediately
      },
      newBalance: updatedUser?.walletBalance,
    });
  } catch (error: any) {
    console.error('Purchase error:', error);
    return NextResponse.json({ error: 'Purchase failed' }, { status: 500 });
  }
}
