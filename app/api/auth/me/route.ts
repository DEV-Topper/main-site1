import { NextResponse } from 'next/server';
import { getSession, getTokenFromRequest } from '@/lib/auth-mongo';

export async function GET(req: Request) {
  try {
    const token = await getTokenFromRequest(req);

    if (!token) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const session = await getSession(token);

    if (!session || !session.userId) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    return NextResponse.json({
      user: session.userId,
      success: true,
    });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({ user: null }, { status: 500 });
  }
}
