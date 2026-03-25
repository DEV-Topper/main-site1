import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { getSession } from '@/lib/auth-mongo'; // Assuming we'll rename/use this
import { cookies } from 'next/headers';

export async function PUT(req: Request) {
  try {
    const { username, email } = await req.json();
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

    // Check if username/email already taken by another user
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
