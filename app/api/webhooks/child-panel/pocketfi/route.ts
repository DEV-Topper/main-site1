import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Force the route to be dynamic to prevent build-time crashes
export const dynamic = 'force-dynamic';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ error: 'Config Error: Missing Supabase keys in Vercel' }, { status: 500, headers: corsHeaders });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Safer way to get the panelId using nextUrl
    const panelId = req.nextUrl.searchParams.get('panelId');

    if (!panelId) {
      return NextResponse.json({ error: 'Request Error: Missing panelId in URL' }, { status: 400, headers: corsHeaders });
    }

    let data;
    try {
      data = await req.json();
    } catch (e) {
      return NextResponse.json({ error: 'Data Error: Invalid JSON body' }, { status: 400, headers: corsHeaders });
    }
    
    const transaction = data.transaction || {};
    const order = data.order || {};
    const reference = transaction.reference || order.reference;
    const amount = Number(order.settlement_amount || order.amount || 0);
    
    const accountNumber = (
      transaction.account || 
      transaction.accountNumber || 
      order.account || 
      data.account_number || 
      ''
    ).toString().trim();

    if (!accountNumber || amount <= 0) {
      return NextResponse.json({ 
        error: 'Data Error: Missing account number or amount',
        received_account: accountNumber,
        received_amount: amount
      }, { status: 200, headers: corsHeaders }); // Return 200 to PocketFi so it stops retrying invalid data
    }

    // Call RPC Function
    const { data: result, error: rpcError } = await supabase.rpc('handle_child_panel_payment', {
      p_panel_id: panelId,
      p_account_number: accountNumber,
      p_amount: amount,
      p_reference: reference
    });

    if (rpcError) {
      return NextResponse.json({ 
        error: `Database Error: ${rpcError.message}`, 
        code: rpcError.code 
      }, { status: 500, headers: corsHeaders });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Webhook processed successfully', 
      result 
    }, { status: 200, headers: corsHeaders });

  } catch (error: any) {
    console.error('Webhook Crash:', error);
    return NextResponse.json({ error: `System Crash: ${error.message}` }, { status: 500, headers: corsHeaders });
  }
}
