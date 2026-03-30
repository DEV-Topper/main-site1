import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { getSession, getTokenFromRequest } from '@/lib/auth-mongo';

export async function PUT(req: Request) {
  try {
    const { username, email } = await req.json();
    const token = await getTokenFromRequest(req);

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const session = await getSession(token);

    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const existing = await User.findOne({
      $or: [{ username }, { email }],
      _id: { $ne: session.userId._id },
    });

    if (existing) {
      if (existing.email === email)
        return NextResponse.json(
          { error: 'Email already in use' },
          { status: 400 },
        );
      if (existing.username === username)
        return NextResponse.json(
          { error: 'Username already taken' },
          { status: 400 },
        );
    }

    const updatedUser = await User.findByIdAndUpdate(
      session.userId._id,
      { username, email },
      { new: true, runValidators: true },
    );

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error: any) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: error.message || 'Update failed' },
      { status: 500 },
    );
  }
}
