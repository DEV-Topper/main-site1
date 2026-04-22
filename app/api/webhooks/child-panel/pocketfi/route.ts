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
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase environment variables');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500, headers: corsHeaders });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
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

    // 1. Find the profile in Supabase that matches the virtual account and panelId
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('virtual_account_number', accountNumber)
      .eq('panel_id', panelId)
      .maybeSingle();

    if (profileError || !profile) {
      console.error(`Webhook Error: No matching profile found for account ${accountNumber} in panel ${panelId}`);
      return NextResponse.json({ message: 'Profile not found' }, { status: 200, headers: corsHeaders });
    }

    // 2. Prevent duplicate transactions
    const { data: existingTxn } = await supabase
      .from('transactions')
      .select('id')
      .eq('transaction_id', reference)
      .eq('panel_id', panelId)
      .maybeSingle();

    if (existingTxn) {
      return NextResponse.json({ message: 'Duplicate transaction ignored' }, { status: 200, headers: corsHeaders });
    }

    // 3. Update the user's wallet balance
    const newBalance = Number(profile.wallet_balance || 0) + amount;
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ wallet_balance: newBalance })
      .eq('user_id', profile.user_id)
      .eq('panel_id', panelId);

    if (updateError) {
      throw new Error(`Failed to update wallet: ${updateError.message}`);
    }

    // 4. Record the transaction
    await supabase
      .from('transactions')
      .insert({
        user_id: profile.user_id,
        panel_id: panelId,
        transaction_id: reference,
        type: 'deposit',
        amount: amount,
        description: `Funded wallet via PocketFi (Ref: ${reference})`,
        status: 'successful'
      });

    return NextResponse.json({ message: 'Webhook processed successfully' }, { status: 200, headers: corsHeaders });

  } catch (error: any) {
    console.error('PocketFi Multi-Tenant Webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: corsHeaders });
  }
}
