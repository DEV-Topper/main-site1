import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

/**
 * Admin endpoint to manually fix wallet balance
 * This is temporary and should be removed after use
 */

export async function POST(req: Request) {
  try {
    const { userId, newBalance } = await req.json();

    if (!userId || newBalance === undefined) {
      return NextResponse.json({ error: 'Missing userId or newBalance' }, { status: 400 });
    }

    await connectDB();

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const oldBalance = user.walletBalance;
    user.walletBalance = newBalance;
    await user.save();

    console.log(`✅ Balance corrected for ${user.email}:`);
    console.log(`   Old: ₦${oldBalance}`);
    console.log(`   New: ₦${newBalance}`);

    return NextResponse.json(
      {
        success: true,
        user: {
          email: user.email,
          oldBalance,
          newBalance,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
