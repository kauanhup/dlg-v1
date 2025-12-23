import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey);

    // Validate that caller is an admin
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser(token);

    if (userError || !user) {
      console.error('Auth error:', userError);
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check admin role
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (roleError || roleData?.role !== 'admin') {
      console.error('Admin check failed:', { roleError, role: roleData?.role });
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[sync-sessions-inventory] Starting sync for admin:', user.id);

    // Sincronizar brasileiras - count only available (not reserved or sold)
    const { count: brCount, error: brError } = await supabaseAdmin
      .from('session_files')
      .select('*', { count: 'exact', head: true })
      .eq('type', 'brasileiras')
      .eq('status', 'available');

    if (brError) {
      console.error('Error counting brasileiras:', brError);
      throw brError;
    }

    // Update or create brasileiras inventory
    const { data: brInv } = await supabaseAdmin
      .from('sessions_inventory')
      .select('id')
      .eq('type', 'brasileiras')
      .maybeSingle();

    if (brInv) {
      await supabaseAdmin
        .from('sessions_inventory')
        .update({ quantity: brCount || 0, updated_at: new Date().toISOString() })
        .eq('id', brInv.id);
    } else {
      await supabaseAdmin
        .from('sessions_inventory')
        .insert({ type: 'brasileiras', quantity: brCount || 0 });
    }

    // Sincronizar estrangeiras
    const { count: extCount, error: extError } = await supabaseAdmin
      .from('session_files')
      .select('*', { count: 'exact', head: true })
      .eq('type', 'estrangeiras')
      .eq('status', 'available');

    if (extError) {
      console.error('Error counting estrangeiras:', extError);
      throw extError;
    }

    // Update or create estrangeiras inventory
    const { data: extInv } = await supabaseAdmin
      .from('sessions_inventory')
      .select('id')
      .eq('type', 'estrangeiras')
      .maybeSingle();

    if (extInv) {
      await supabaseAdmin
        .from('sessions_inventory')
        .update({ quantity: extCount || 0, updated_at: new Date().toISOString() })
        .eq('id', extInv.id);
    } else {
      await supabaseAdmin
        .from('sessions_inventory')
        .insert({ type: 'estrangeiras', quantity: extCount || 0 });
    }

    console.log('[sync-sessions-inventory] Sync complete:', { brasileiras: brCount, estrangeiras: extCount });

    return new Response(
      JSON.stringify({ 
        success: true, 
        brasileiras: brCount || 0,
        estrangeiras: extCount || 0
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[sync-sessions-inventory] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
