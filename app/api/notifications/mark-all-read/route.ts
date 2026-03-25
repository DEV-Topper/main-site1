import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Notification from '@/models/Notification';
import { getSession } from '@/lib/auth-mongo';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
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

    const userId = session.userId._id.toString();

    const result = await Notification.updateMany(
      {
        $or: [
          { userUUID: userId, read: false },
          { userUUID: null, read: false },
        ],
      },
      { $set: { read: true } },
    );

    return NextResponse.json({
      success: true,
      modifiedCount: result.modifiedCount ?? 0,
      message: 'All notifications marked as read',
    });
  } catch (error: any) {
    console.error('Mark all as read error:', error);
    return NextResponse.json(
      { error: 'Failed to mark all notifications as read' },
      { status: 500 },
    );
  }
}
