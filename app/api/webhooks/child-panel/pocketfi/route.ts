import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function POST(req: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Missing Supabase environment variables');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500, headers: corsHeaders });
    }

    // We use the ANON key here because the RPC function is "SECURITY DEFINER" (it has its own power)
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const url = new URL(req.url);
    const panelId = url.searchParams.get('panelId');

    if (!panelId) {
      console.error('Webhook Error: Missing panelId in query parameters');
      return NextResponse.json({ error: 'Missing panelId' }, { status: 400, headers: corsHeaders });
    }

    const data = await req.json();
    console.log(`Received PocketFi Webhook for Panel: ${panelId}`, JSON.stringify(data, null, 2));

    // PocketFi Webhook Structure
    const transaction = data.transaction || {};
    const order = data.order || {};
    const reference = transaction.reference || order.reference;
    const amount = Number(order.settlement_amount || order.amount || 0);
    
    // Identify the user by virtual account number
    const accountNumber = (
      transaction.account || 
      transaction.accountNumber || 
      order.account || 
      data.account_number || 
      ''
    ).toString().trim();

    if (!accountNumber || amount <= 0) {
      return NextResponse.json({ message: 'Invalid transaction data' }, { status: 200, headers: corsHeaders });
    }

    // Call our "Smart Function" in Supabase
    const { data: result, error: rpcError } = await supabase.rpc('handle_child_panel_payment', {
      p_panel_id: panelId,
      p_account_number: accountNumber,
      p_amount: amount,
      p_reference: reference
    });

    if (rpcError) {
      console.error('RPC Error:', rpcError);
      throw new Error(`RPC Failed: ${rpcError.message}`);
    }

    return NextResponse.json({ message: 'Webhook processed successfully', result }, { status: 200, headers: corsHeaders });

  } catch (error: any) {
    console.error('PocketFi Multi-Tenant Webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: corsHeaders });
  }
}
