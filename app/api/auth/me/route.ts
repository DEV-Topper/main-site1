import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-mongo';
import { cookies } from 'next/headers';

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    let token = cookieStore.get('session_token')?.value;

    if (!token) {
      const authHeader = req.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const session = await getSession(token);

    if (!session || !session.userId) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    // Return user info (session.userId is populated)
    return NextResponse.json({
      user: session.userId,
      success: true,
    });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({ user: null }, { status: 500 });
  }
}
