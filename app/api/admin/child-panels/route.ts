import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import ChildPanel from '@/models/ChildPanel';
import { getSession, getTokenFromRequest } from '@/lib/auth-mongo';

export async function GET(req: Request) {
  try {
    const token = await getTokenFromRequest(req);
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const session = await getSession(token);
    if (!session || !session.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Verify Super Admin Role
    const user = await User.findById(session.userId);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Super Admin access required' }, { status: 403 });
    }

    // Fetch all child panels and populate owner info
    const panels = await ChildPanel.find()
      .populate('userId', 'username email walletBalance')
      .sort({ createdAt: -1 })
      .lean();

    console.log(`[SuperAdmin] Found ${panels.length} panels`);
    
    return NextResponse.json({ success: true, panels }, { status: 200 });
  } catch (error: any) {
    console.error('Super Admin Panels GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Update panel status (Approve/Reject/Suspend)
export async function PATCH(req: Request) {
  try {
    const token = await getTokenFromRequest(req);
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { panelId, status, expiresAt, autoRenew } = await req.json();

    await connectDB();
    const session = await getSession(token);
    if (!session || !session.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await User.findById(session.userId);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updatedPanel = await ChildPanel.findByIdAndUpdate(
      panelId,
      { status, expiresAt, autoRenew },
      { new: true }
    );

    return NextResponse.json({ success: true, panel: updatedPanel }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
