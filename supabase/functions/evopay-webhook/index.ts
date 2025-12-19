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

    // EvoPay webhook payload structure from docs:
    // { id, status, amount, type, qrCodeText, qrCodeUrl, payerDocument, payerName }
    const { id: transactionId, status, amount, payerDocument, payerName } = body;

    if (!transactionId) {
      console.log('No transaction ID in webhook, ignoring');
      return new Response(
        JSON.stringify({ success: true, message: 'No transaction ID' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing EvoPay webhook for transaction: ${transactionId}, status: ${status}`);

    // Find payment by transaction ID stored in pix_code field
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('id, order_id, status')
      .eq('pix_code', transactionId)
      .eq('payment_method', 'evopay_pix')
      .single();

    if (paymentError || !payment) {
      console.error('Payment not found for transaction:', transactionId);
      return new Response(
        JSON.stringify({ success: false, error: 'Payment not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const orderId = payment.order_id;

    // Check if order exists
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, user_id, status, product_type, quantity')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      console.error('Order not found:', orderId);
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

    console.log(`Updating order ${orderId} to status: ${newOrderStatus}`);

    // Update order status
    const { error: updateOrderError } = await supabase
      .from('orders')
      .update({ 
        status: newOrderStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);

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
      .eq('order_id', orderId);

    if (updatePaymentError) {
      console.error('Error updating payment:', updatePaymentError);
    }

    // If payment completed, process order fulfillment
    if (status === 'COMPLETED' && order.status !== 'completed') {
      console.log('Payment completed, processing order fulfillment...');
      
      const { data: rpcResult, error: rpcError } = await supabase.rpc('complete_order_atomic', {
        _order_id: orderId,
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
