import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// SYNCHRONIZED: Cancel orders at same time as PIX expiration (15 min)
// This eliminates the "limbo" state where banner is gone but order is still pending
const GRACE_PERIOD_MINUTES = 15;

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Cleanup expired orders: Starting...');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Calculate the cutoff time (orders created more than GRACE_PERIOD_MINUTES ago)
    const cutoffTime = new Date();
    cutoffTime.setMinutes(cutoffTime.getMinutes() - GRACE_PERIOD_MINUTES);
    const cutoffISO = cutoffTime.toISOString();

    console.log(`Looking for pending orders created before: ${cutoffISO}`);

    // Find pending orders that are older than the grace period
    const { data: expiredOrders, error: fetchError } = await supabase
      .from('orders')
      .select('id, user_id, product_name, amount, created_at')
      .eq('status', 'pending')
      .lt('created_at', cutoffISO);

    if (fetchError) {
      console.error('Error fetching expired orders:', fetchError);
      throw fetchError;
    }

    if (!expiredOrders || expiredOrders.length === 0) {
      console.log('No expired orders to cancel');
      return new Response(
        JSON.stringify({ success: true, cancelled: 0, message: 'No expired orders found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${expiredOrders.length} expired orders to cancel`);

    // Cancel each expired order and its associated payment
    let cancelledCount = 0;
    const errors: string[] = [];

    for (const order of expiredOrders) {
      try {
        console.log(`Cancelling order ${order.id} (created: ${order.created_at})`);

        // CRITICAL: First release any reserved sessions for this order
        const { data: releasedSessions, error: releaseError } = await supabase
          .from('session_files')
          .update({ 
            status: 'available',
            reserved_for_order: null,
            reserved_at: null
          })
          .eq('reserved_for_order', order.id)
          .eq('status', 'reserved')
          .select('id, type');

        if (releaseError) {
          console.error(`Error releasing sessions for order ${order.id}:`, releaseError);
          errors.push(`Session release for order ${order.id}: ${releaseError.message}`);
        } else if (releasedSessions && releasedSessions.length > 0) {
          console.log(`Released ${releasedSessions.length} sessions for order ${order.id}`);
          
          // Sync inventory for released sessions
          const brReleased = releasedSessions.filter(s => s.type === 'brasileiras').length;
          const extReleased = releasedSessions.filter(s => s.type === 'estrangeiras').length;
          
          if (brReleased > 0) {
            const { count: brCount } = await supabase
              .from('session_files')
              .select('*', { count: 'exact', head: true })
              .eq('type', 'brasileiras')
              .eq('status', 'available');
            
            await supabase
              .from('sessions_inventory')
              .update({ quantity: brCount || 0, updated_at: new Date().toISOString() })
              .eq('type', 'brasileiras');
          }
          
          if (extReleased > 0) {
            const { count: extCount } = await supabase
              .from('session_files')
              .select('*', { count: 'exact', head: true })
              .eq('type', 'estrangeiras')
              .eq('status', 'available');
            
            await supabase
              .from('sessions_inventory')
              .update({ quantity: extCount || 0, updated_at: new Date().toISOString() })
              .eq('type', 'estrangeiras');
          }
        }

        // Cancel the order
        const { error: orderError } = await supabase
          .from('orders')
          .update({ status: 'cancelled', updated_at: new Date().toISOString() })
          .eq('id', order.id)
          .eq('status', 'pending'); // Extra safety: only cancel if still pending

        if (orderError) {
          console.error(`Error cancelling order ${order.id}:`, orderError);
          errors.push(`Order ${order.id}: ${orderError.message}`);
          continue;
        }

        // Cancel associated payments
        const { error: paymentError } = await supabase
          .from('payments')
          .update({ status: 'cancelled' })
          .eq('order_id', order.id)
          .eq('status', 'pending'); // Extra safety: only cancel if still pending

        if (paymentError) {
          console.error(`Error cancelling payment for order ${order.id}:`, paymentError);
          errors.push(`Payment for order ${order.id}: ${paymentError.message}`);
        }

        cancelledCount++;
        console.log(`Successfully cancelled order ${order.id}`);
      } catch (err) {
        console.error(`Unexpected error cancelling order ${order.id}:`, err);
        errors.push(`Order ${order.id}: Unexpected error`);
      }
    }

    console.log(`Cleanup complete: cancelled ${cancelledCount}/${expiredOrders.length} orders`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        cancelled: cancelledCount,
        total: expiredOrders.length,
        errors: errors.length > 0 ? errors : undefined
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Cleanup expired orders failed:', error);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
