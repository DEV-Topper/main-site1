import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { getSession } from '@/lib/auth-mongo';
import { cookies } from 'next/headers';

export async function GET(req: Request) {
  try {
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

    // We need to fetch the user again to get the latest referral data if session user is stale
    // (Session population might be cached or light).
    // Let's fetch full user data.
    const user = await User.findById(session.userId._id).select(
      'referralCode referralBalance referrals',
    );

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        referralCode: user.referralCode,
        referralBalance: user.referralBalance,
        referrals: user.referrals || [],
      },
    });
  } catch (error: any) {
    console.error('Referrals fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch referrals' },
      { status: 500 },
    );
  }
}
