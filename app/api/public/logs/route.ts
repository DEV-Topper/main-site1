import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Account from "@/models/Account";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const apiKey = req.headers.get("x-api-key");
  
  const platform = searchParams.get("platform"); 
  const subcategory = searchParams.get("subcategory"); 

  if (!apiKey) {
    return NextResponse.json({ error: "API Key is required" }, { status: 401, headers: corsHeaders });
  }

  try {
    await connectDB();
    const user = await User.findOne({ apiKey });
    if (!user) {
      return NextResponse.json({ error: "Invalid API Key" }, { status: 401, headers: corsHeaders });
    }

    let query: any = {
      status: 'Available',
      $or: [{ visibleToUsers: true }, { visibleToUsers: { $exists: false } }],
    };

    if (platform && platform !== 'all') {
      query.platform = { $regex: platform, $options: 'i' };
    }
    
    if (subcategory) {
      query.subcategory = { $regex: subcategory, $options: 'i' };
    }

    // Fetch accounts WITH bulkLogs included
    const accounts = await Account.find(query).select('+bulkLogs').lean();

    // Group the data: { [platform]: { [subcategory]: [ items... ] } }
    const groupedData: Record<string, Record<string, any[]>> = {};

    accounts.forEach((acc: any) => {
      const plat = (acc.platform || 'uncategorized').toLowerCase().trim();
      const sub = acc.subcategory?.trim() || 'General';

      if (!groupedData[plat]) {
        groupedData[plat] = {};
      }
      if (!groupedData[plat][sub]) {
        groupedData[plat][sub] = [];
      }

      groupedData[plat][sub].push({
        itemId: acc._id,
        type: acc.type || '',
        name: acc.account || acc.olaz || '',
        price: acc.price || 0,
        followers: acc.followers || 0,
        logsCount: acc.logs || 0,
        availableLogsCount: acc.bulkLogs ? acc.bulkLogs.length : 0,
        description: acc.description || '',
        vpnType: acc.vpnType || '',
        mailIncluded: acc.mailIncluded || false,
        logs: acc.bulkLogs || []
      });
    });

    return NextResponse.json(groupedData, { headers: corsHeaders });
  } catch (error) {
    console.error('Error fetching public logs API:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500, headers: corsHeaders });
  }
}
