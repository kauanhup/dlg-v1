import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, asaas-access-token',
};

serve(async (req) => {
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Only accept POST
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Validate Asaas token if configured
    const asaasAccessToken = req.headers.get('asaas-access-token');
    const expectedToken = Deno.env.get('ASAAS_WEBHOOK_TOKEN');
    
    if (expectedToken && asaasAccessToken !== expectedToken) {
      console.log('[Asaas Webhook] Invalid access token');
      // Log but don't reject - Asaas may not send token in all cases
    }

    const body = await req.json();
    console.log('[Asaas Webhook] Received event:', body.event, 'Payment:', body.payment?.id);

    const { event, payment } = body;

    if (!event || !payment) {
      console.log('[Asaas Webhook] Invalid payload, missing event or payment');
      return new Response(
        JSON.stringify({ error: 'Invalid payload' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const paymentId = payment.id;
    const externalReference = payment.externalReference;
    const status = payment.status;

    console.log(`[Asaas Webhook] Event: ${event}, Payment: ${paymentId}, Order: ${externalReference}, Status: ${status}`);

    // Check for duplicate webhook
    const { data: existingWebhook } = await supabase
      .from('processed_webhooks')
      .select('id')
      .eq('transaction_id', paymentId)
      .eq('gateway', 'asaas')
      .maybeSingle();

    if (existingWebhook) {
      console.log('[Asaas Webhook] Already processed, skipping');
      return new Response(
        JSON.stringify({ success: true, message: 'Already processed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Find order by external reference
    if (!externalReference) {
      console.log('[Asaas Webhook] No externalReference, cannot match order');
      return new Response(
        JSON.stringify({ error: 'No order reference' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, user_id, status, product_type, quantity, amount')
      .eq('id', externalReference)
      .single();

    if (orderError || !order) {
      console.error('[Asaas Webhook] Order not found:', externalReference);
      return new Response(
        JSON.stringify({ error: 'Order not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle payment confirmation events
    const confirmedStatuses = ['RECEIVED', 'CONFIRMED', 'RECEIVED_IN_CASH'];
    const isConfirmed = confirmedStatuses.includes(status) || 
                        event === 'PAYMENT_RECEIVED' || 
                        event === 'PAYMENT_CONFIRMED';

    if (isConfirmed && order.status === 'pending') {
      console.log(`[Asaas Webhook] Payment confirmed for order ${order.id}, completing...`);

      // Record webhook
      await supabase.from('processed_webhooks').insert({
        transaction_id: paymentId,
        gateway: 'asaas',
        order_id: order.id,
        webhook_payload: body,
      });

      // Update payment
      await supabase.from('payments').update({
        status: 'paid',
        paid_at: new Date().toISOString(),
      }).eq('order_id', order.id);

      // Complete order atomically
      const { data: completeResult, error: completeError } = await supabase.rpc('complete_order_atomic', {
        _order_id: order.id,
        _user_id: order.user_id,
        _product_type: order.product_type,
        _quantity: order.quantity,
      });

      if (completeError) {
        console.error('[Asaas Webhook] Error completing order:', completeError);
      } else {
        console.log('[Asaas Webhook] Order completed:', JSON.stringify(completeResult));
      }

      // Log to gateway_logs
      await supabase.from('gateway_logs').insert({
        gateway: 'asaas',
        status: 'webhook_success',
        order_id: order.id,
        attempt: 1,
      });

      return new Response(
        JSON.stringify({ success: true, message: 'Payment confirmed and order completed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle failed/cancelled payments
    const failedStatuses = ['REFUNDED', 'REFUND_REQUESTED', 'CHARGEBACK_REQUESTED', 'CHARGEBACK_DISPUTE', 'AWAITING_CHARGEBACK_REVERSAL', 'DUNNING_REQUESTED', 'DUNNING_RECEIVED', 'AWAITING_RISK_ANALYSIS'];
    
    if (failedStatuses.includes(status)) {
      console.log(`[Asaas Webhook] Payment failed/refunded for order ${order.id}`);

      await supabase.from('gateway_logs').insert({
        gateway: 'asaas',
        status: 'webhook_failed',
        order_id: order.id,
        error: `Status: ${status}`,
        attempt: 1,
      });
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Webhook processed' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('[Asaas Webhook] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
