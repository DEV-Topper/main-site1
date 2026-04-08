import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Transaction from '@/models/Transaction';
import ChildPanel from '@/models/ChildPanel';
import { getSession, getTokenFromRequest } from '@/lib/auth-mongo';

export async function POST(req: Request) {
  try {
    await connectDB();
    const token = await getTokenFromRequest(req);
    const session = await getSession(token);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.userId._id;
    const body = await req.json();
    const { domain, adminUsername, adminPassword, confirmPassword } = body;

    // 1. Validation
    if (!domain || !adminUsername || !adminPassword || !confirmPassword) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    if (adminPassword !== confirmPassword) {
      return NextResponse.json({ error: 'Passwords do not match' }, { status: 400 });
    }

    // 2. Check balance
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const price = 20000;
    if (user.walletBalance < price) {
      return NextResponse.json({ 
        error: 'Insufficient balance', 
        insufficient: true,
        needed: price - user.walletBalance 
      }, { status: 400 });
    }

    // 3. Process Transaction (Atomic-ish)
    // In a production environment with replica sets, you'd use a transaction.
    // For Mongoose on a single node, we can use findOneAndUpdate for atomicity.
    
    const updatedUser = await User.findOneAndUpdate(
      { _id: userId, walletBalance: { $gte: price } },
      { $inc: { walletBalance: -price } },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ error: 'Payment failed (Insufficient balance during processing)' }, { status: 400 });
    }

    // 4. Create Transaction Log
    await Transaction.create({
      userUUID: user._id.toString(),
      type: 'purchase',
      amount: price,
      status: 'successful',
      description: `Child Panel Setup - ${domain}`,
    });

    // 5. Create Child Panel Request
    const childPanel = await ChildPanel.create({
      userUUID: user._id.toString(),
      domain,
      adminUsername,
      adminPassword, // Note: In a real app, hash this or better yet, don't store plain passwords
      status: 'pending',
      price,
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Child panel order placed successfully!',
      data: childPanel
    });

  } catch (error: any) {
    console.error('Child Panel Purchase Error:', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again later.' }, { status: 500 });
  }
}
