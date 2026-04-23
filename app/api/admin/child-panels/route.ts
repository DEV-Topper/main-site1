import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ChildPanel from '@/models/ChildPanel';
import User from '@/models/User';
import Transaction from '@/models/Transaction';

export const dynamic = 'force-dynamic';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-super-admin-key',
};

function isAuthorized(req: Request) {
  const key = req.headers.get('x-super-admin-key');
  const masterSecret = process.env.SUPER_ADMIN_SECRET_KEY || "dsp_master_secret_2025_security_bypass";
  return key === masterSecret;
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

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

    // Enrich active panels with live stats from their Supabase instance via bridge
    const enrichedPanels = await Promise.all(panels.map(async (p: any) => {
      const panelData = {
        id: p._id.toString(),
        domain: p.domain,
        adminName: p.adminName,
        status: p.status,
        createdAt: p.createdAt,
        userId: p.userId?.toString(),
        priceInNaira: p.priceInNaira,
        priceInUsd: p.priceInUsd,
        stats: { totalUsers: 0, totalDeposits: 0, totalRevenue: 0 }
      };

      if (p.status === 'active') {
        try {
          const pId = p._id.toString();
          const masterSecret = process.env.SUPER_ADMIN_SECRET_KEY || "dsp_master_secret_2025_security_bypass";
          
          const statsResp = await fetch(`https://${p.domain}/api/dsp?action=admin-data&panelId=${pId}`, {
            headers: {
              'x-super-admin-key': masterSecret
            },
            cache: 'no-store' // FORCE LIVE DATA, NO CACHING
          });
          
          if (!statsResp.ok) {
            console.error(`Bridge Error for ${p.domain}: Status ${statsResp.status}`);
          }

          const statsData = await statsResp.json();
          if (statsData.success && statsData.data?.stats) {
            panelData.stats = {
              totalUsers: statsData.data.stats.total_users || 0,
              totalDeposits: statsData.data.stats.total_deposits || 0,
              totalRevenue: statsData.data.stats.total_revenue || 0
            };
          } else {
            (panelData.stats as any).error = statsData.error || `HTTP ${statsResp.status}`;
          }
        } catch (err: any) {
          console.error(`Failed to connect to ${p.domain} bridge:`, err);
          (panelData.stats as any).error = err.message || "Connection Failed";
        }
      }
      return panelData;
    }));

    return NextResponse.json({
      success: true,
      panels: enrichedPanels,
    }, { headers: corsHeaders });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: corsHeaders });
  }
}

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

    // Auto-refund the user's DeSocialPlug wallet when a panel is rejected
    if (status === 'rejected' && panel.userId && panel.priceInNaira) {
      await User.findByIdAndUpdate(panel.userId, {
        $inc: { walletBalance: panel.priceInNaira },
      });
      await Transaction.create({
        userUUID: panel.userId.toString(),
        type: 'refund',
        amount: panel.priceInNaira,
        amountUSD: panel.priceInUsd || 10.99,
        status: 'successful',
        description: `Refund: Child Panel for ${panel.domain} was rejected`,
        reference: panel._id.toString(),
      });
    }

    // Automatically delete the domain from Vercel so they can re-use it
    if ((status === 'rejected' || status === 'cancelled') && process.env.VERCEL_ACCESS_TOKEN) {
      try {
        await fetch(`https://api.vercel.com/v10/projects/prj_D4yIoSpvWjjjP8r28sOHRZoMuJNY/domains/${panel.domain}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${process.env.VERCEL_ACCESS_TOKEN}`
          }
        });
      } catch (err) {
        console.error('Failed to remove domain from Vercel during rejection:', err);
      }
    }

    return NextResponse.json({
      success: true,
      panel: { id: panel._id.toString(), domain: panel.domain, status: panel.status },
    }, { headers: corsHeaders });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: corsHeaders });
  }
}
