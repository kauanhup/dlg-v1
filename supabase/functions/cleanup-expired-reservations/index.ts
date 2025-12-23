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
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('[cleanup-expired-reservations] Starting cleanup');

    // Get timestamp from 30 minutes ago
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();

    // Find expired/cancelled orders with pending or cancelled status older than 30 minutes
    const { data: expiredOrders, error: ordersError } = await supabase
      .from('orders')
      .select('id')
      .in('status', ['pending', 'cancelled', 'expired'])
      .lt('created_at', thirtyMinutesAgo);

    if (ordersError) {
      console.error('Error fetching expired orders:', ordersError);
      throw ordersError;
    }

    let releasedCount = 0;

    if (expiredOrders && expiredOrders.length > 0) {
      const orderIds = expiredOrders.map(o => o.id);
      
      console.log(`[cleanup-expired-reservations] Found ${orderIds.length} expired orders to clean up`);

      // Release reserved sessions back to available
      const { data: released, error: releaseError } = await supabase
        .from('session_files')
        .update({ 
          status: 'available',
          reserved_for_order: null,
          reserved_at: null
        })
        .in('reserved_for_order', orderIds)
        .select('id');

      if (releaseError) {
        console.error('Error releasing sessions:', releaseError);
        throw releaseError;
      }

      releasedCount = released?.length || 0;
      console.log(`[cleanup-expired-reservations] Released ${releasedCount} sessions`);

      // Update expired orders status
      await supabase
        .from('orders')
        .update({ status: 'expired' })
        .in('id', orderIds)
        .eq('status', 'pending');

      // Also sync inventory after releasing sessions
      if (releasedCount > 0) {
        // Recalculate brasileiras count
        const { count: brCount } = await supabase
          .from('session_files')
          .select('*', { count: 'exact', head: true })
          .eq('type', 'brasileiras')
          .eq('status', 'available');

        await supabase
          .from('sessions_inventory')
          .update({ quantity: brCount || 0, updated_at: new Date().toISOString() })
          .eq('type', 'brasileiras');

        // Recalculate estrangeiras count
        const { count: extCount } = await supabase
          .from('session_files')
          .select('*', { count: 'exact', head: true })
          .eq('type', 'estrangeiras')
          .eq('status', 'available');

        await supabase
          .from('sessions_inventory')
          .update({ quantity: extCount || 0, updated_at: new Date().toISOString() })
          .eq('type', 'estrangeiras');

        console.log('[cleanup-expired-reservations] Inventory synced:', { brasileiras: brCount, estrangeiras: extCount });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        expiredOrders: expiredOrders?.length || 0,
        releasedSessions: releasedCount
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[cleanup-expired-reservations] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
