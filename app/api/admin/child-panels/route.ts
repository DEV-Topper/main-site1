import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ChildPanel from '@/models/ChildPanel';

export const dynamic = 'force-dynamic';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-super-admin-key',
};

// Validate the super admin secret key
function isAuthorized(req: Request) {
  const key = req.headers.get('x-super-admin-key');
  return key === process.env.SUPER_ADMIN_SECRET_KEY;
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

// GET — list all panels (with optional status filter)
export async function GET(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
  }

  try {
    await connectDB();
    const url = new URL(req.url);
    const status = url.searchParams.get('status');

    const query = status ? { status } : {};
    const panels = await ChildPanel.find(query).sort({ createdAt: -1 }).lean();

    return NextResponse.json({
      success: true,
      panels: panels.map((p: any) => ({
        id: p._id.toString(),
        domain: p.domain,
        adminName: p.adminName,
        status: p.status,
        createdAt: p.createdAt,
        userId: p.userId?.toString(),
      })),
    }, { headers: corsHeaders });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: corsHeaders });
  }
}

// PATCH — approve or reject a panel
export async function PATCH(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
  }

  try {
    await connectDB();
    const { panelId, status } = await req.json();

    if (!panelId || !['active', 'rejected', 'cancelled'].includes(status)) {
      return NextResponse.json({ error: 'Invalid panelId or status' }, { status: 400, headers: corsHeaders });
    }

    const panel = await ChildPanel.findByIdAndUpdate(panelId, { status }, { new: true });

    if (!panel) {
      return NextResponse.json({ error: 'Panel not found' }, { status: 404, headers: corsHeaders });
    }

    return NextResponse.json({
      success: true,
      panel: {
        id: panel._id.toString(),
        domain: panel.domain,
        status: panel.status,
      },
    }, { headers: corsHeaders });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: corsHeaders });
  }
}
