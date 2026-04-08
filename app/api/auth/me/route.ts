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

    // Cast to any to access toObject (populated IUser)
    const userData = (session.userId as any).toObject();
    delete userData.password;

    // Fetch virtual account if it exists to enable zero-loading frontend
    await import('@/lib/mongodb').then(m => m.default());
    const PaymentpointVirtualAccount = (await import('@/models/PaymentpointVirtualAccount')).default;
    const virtualAccount = await PaymentpointVirtualAccount.findOne({ userId: userData._id }).sort({ createdAt: -1 });

    return NextResponse.json({
      user: {
        ...userData,
        virtualAccount: virtualAccount ? virtualAccount.toObject() : null
      },
      success: true,
    });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({ user: null }, { status: 500 });
  }
}
