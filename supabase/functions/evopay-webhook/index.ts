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

    const body = await req.json();
    console.log('EvoPay webhook received:', JSON.stringify(body, null, 2));

    // EvoPay webhook payload structure
    // { id, amount, status, type, externalId, qrCodeText, qrCodeUrl, payerDocument, payerName, createdAt, updatedAt }
    const { id: transactionId, externalId, status, amount, payerDocument, payerName } = body;

    if (!externalId) {
      console.log('No externalId in webhook, ignoring');
      return new Response(
        JSON.stringify({ success: true, message: 'No externalId' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing EvoPay webhook for order: ${externalId}, status: ${status}`);

    // Check if order exists
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, user_id, status, product_type, quantity')
      .eq('id', externalId)
      .single();

    if (orderError || !order) {
      console.error('Order not found for externalId:', externalId);
      return new Response(
        JSON.stringify({ success: false, error: 'Order not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Skip if already completed
    if (order.status === 'completed') {
      console.log('Order already completed, skipping');
      return new Response(
        JSON.stringify({ success: true, message: 'Order already completed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Map EvoPay status to our status
    // EvoPay statuses: PENDING, COMPLETED, CANCELED
    let newOrderStatus = order.status;
    let newPaymentStatus = 'pending';

    if (status === 'COMPLETED') {
      newOrderStatus = 'paid';
      newPaymentStatus = 'paid';
    } else if (status === 'CANCELED') {
      newOrderStatus = 'cancelled';
      newPaymentStatus = 'failed';
    } else if (status === 'PENDING') {
      newOrderStatus = 'pending';
      newPaymentStatus = 'pending';
    }

    console.log(`Updating order ${externalId} to status: ${newOrderStatus}`);

    // Update order status
    const { error: updateOrderError } = await supabase
      .from('orders')
      .update({ 
        status: newOrderStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', externalId);

    if (updateOrderError) {
      console.error('Error updating order:', updateOrderError);
    }

    // Update payment record
    const paymentUpdate: any = { 
      status: newPaymentStatus,
    };
    
    if (newPaymentStatus === 'paid') {
      paymentUpdate.paid_at = new Date().toISOString();
    }

    const { error: updatePaymentError } = await supabase
      .from('payments')
      .update(paymentUpdate)
      .eq('order_id', externalId);

    if (updatePaymentError) {
      console.error('Error updating payment:', updatePaymentError);
    }

    // If payment completed, process order fulfillment
    if (status === 'COMPLETED' && order.status !== 'completed') {
      console.log('Payment completed, processing order fulfillment...');
      
      const { data: rpcResult, error: rpcError } = await supabase.rpc('complete_order_atomic', {
        _order_id: externalId,
        _user_id: order.user_id,
        _product_type: order.product_type,
        _quantity: order.quantity
      });

      if (rpcError) {
        console.error('Error completing order:', rpcError);
      } else {
        console.log('Order completion result:', rpcResult);
      }
    }

    console.log('EvoPay webhook processed successfully');

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error processing EvoPay webhook:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
