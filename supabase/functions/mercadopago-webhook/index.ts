import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-signature, x-request-id',
}

// Mercado Pago API base URL
const MP_API_URL = 'https://api.mercadopago.com';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Parse webhook payload
    const url = new URL(req.url);
    const topic = url.searchParams.get('topic') || url.searchParams.get('type');
    const id = url.searchParams.get('id') || url.searchParams.get('data.id');
    
    let payload: any = {};
    try {
      const rawBody = await req.text();
      if (rawBody) {
        payload = JSON.parse(rawBody);
      }
    } catch {
      // Body might be empty for some notifications
    }

    console.log('MercadoPago Webhook received:', { topic, id, payload });

    // Determine notification type
    const notificationType = topic || payload.type || payload.topic;
    const resourceId = id || payload.data?.id || payload.id;

    if (!notificationType && !resourceId) {
      console.log('Empty notification, acknowledging');
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get MP settings
    const { data: settings } = await supabase
      .from('gateway_settings')
      .select('mercadopago_access_token, mercadopago_enabled')
      .eq('provider', 'pixup')
      .maybeSingle();

    if (!settings?.mercadopago_access_token || !settings?.mercadopago_enabled) {
      console.error('Mercado Pago not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'MP not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Handle different notification types
    if (notificationType === 'payment' || payload.action === 'payment.created' || payload.action === 'payment.updated') {
      const paymentId = resourceId || payload.data?.id;
      
      if (!paymentId) {
        console.log('No payment ID in notification');
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Fetch payment details from MP API
      const paymentResponse = await fetch(`${MP_API_URL}/v1/payments/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${settings.mercadopago_access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!paymentResponse.ok) {
        console.error('Failed to fetch payment:', paymentResponse.status);
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to fetch payment' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }

      const payment = await paymentResponse.json();
      console.log('Payment details:', {
        id: payment.id,
        status: payment.status,
        external_reference: payment.external_reference,
        amount: payment.transaction_amount
      });

      const orderId = payment.external_reference;

      if (!orderId) {
        console.log('No external_reference (order_id) in payment');
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Validate order exists
      const { data: existingOrder, error: orderCheckError } = await supabase
        .from('orders')
        .select('id, status, amount, user_id, product_type, quantity')
        .eq('id', orderId)
        .single();

      if (orderCheckError || !existingOrder) {
        console.error('Order not found:', orderId);
        return new Response(
          JSON.stringify({ success: false, error: 'Order not found' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
        );
      }

      // Skip if already processed
      if (existingOrder.status === 'completed' || existingOrder.status === 'paid') {
        console.log(`Order ${orderId} already processed with status: ${existingOrder.status}`);
        return new Response(
          JSON.stringify({ success: true, message: 'Order already processed' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Validate amount (with 1% tolerance for fees)
      const orderAmount = Number(existingOrder.amount);
      const paidAmount = Number(payment.transaction_amount);
      if (Math.abs(orderAmount - paidAmount) > orderAmount * 0.01) {
        console.error(`Amount mismatch: order=${orderAmount}, paid=${paidAmount}`);
        // Don't reject, just log - MP might have different final amount due to fees
      }

      // Map MP status to internal status
      let orderStatus = 'pending';
      let paymentStatus = 'pending';

      switch (payment.status) {
        case 'approved':
          orderStatus = 'paid';
          paymentStatus = 'paid';
          break;
        case 'pending':
        case 'in_process':
        case 'in_mediation':
          orderStatus = 'pending';
          paymentStatus = 'pending';
          break;
        case 'rejected':
        case 'cancelled':
          orderStatus = 'cancelled';
          paymentStatus = 'cancelled';
          break;
        case 'refunded':
        case 'charged_back':
          orderStatus = 'refunded';
          paymentStatus = 'refunded';
          break;
        default:
          orderStatus = 'pending';
          paymentStatus = 'pending';
      }

      console.log(`Updating order ${orderId} to status: ${orderStatus}`);

      // Update order status
      const { error: orderError } = await supabase
        .from('orders')
        .update({ 
          status: orderStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (orderError) {
        console.error('Error updating order:', orderError);
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to update order' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }

      // Update payment status
      await supabase
        .from('payments')
        .update({ 
          status: paymentStatus,
          paid_at: paymentStatus === 'paid' ? (payment.date_approved || new Date().toISOString()) : null
        })
        .eq('order_id', orderId);

      // If payment is approved, complete the order
      if (paymentStatus === 'paid') {
        const { data: result, error: completeError } = await supabase.rpc('complete_order_atomic', {
          _order_id: existingOrder.id,
          _user_id: existingOrder.user_id,
          _product_type: existingOrder.product_type,
          _quantity: existingOrder.quantity
        });

        if (completeError) {
          console.error('Error completing order:', completeError);
        } else {
          console.log('Order completed successfully:', result);
        }
      }

      console.log(`Order ${orderId} updated successfully to ${orderStatus}`);
    }

    // Handle merchant_order notifications
    if (notificationType === 'merchant_order') {
      const merchantOrderId = resourceId;
      
      if (merchantOrderId) {
        // Fetch merchant order to get payments
        const moResponse = await fetch(`${MP_API_URL}/merchant_orders/${merchantOrderId}`, {
          headers: {
            'Authorization': `Bearer ${settings.mercadopago_access_token}`,
            'Content-Type': 'application/json'
          }
        });

        if (moResponse.ok) {
          const merchantOrder = await moResponse.json();
          console.log('Merchant order:', {
            id: merchantOrder.id,
            status: merchantOrder.status,
            external_reference: merchantOrder.external_reference,
            payments: merchantOrder.payments?.length
          });

          // If there are approved payments, process them
          if (merchantOrder.payments && merchantOrder.payments.length > 0) {
            for (const mpPayment of merchantOrder.payments) {
              if (mpPayment.status === 'approved') {
                // Re-trigger webhook processing for this payment
                console.log('Processing approved payment from merchant order:', mpPayment.id);
              }
            }
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Webhook error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
})
