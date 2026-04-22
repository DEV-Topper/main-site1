import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function POST(req: Request) {
  try {
    const { panelId, settings } = await req.json();

    if (!panelId || !settings) {
      return NextResponse.json({ error: 'Missing data' }, { status: 400, headers: corsHeaders });
    }

    // Perform the upsert using the Service Role Key (bypassing RLS safely on the server)
    const { data, error } = await supabase
      .from('site_settings')
      .upsert({
        ...settings,
        panel_id: panelId,
        // Ensure we don't accidentally overwrite with a different panel_id
      }, { onConflict: 'panel_id' })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, data }, { headers: corsHeaders });

  } catch (error: any) {
    console.error('Save Settings Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}
