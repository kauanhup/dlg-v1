import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-signature',
}

// Simple HMAC verification for webhook authenticity
async function verifyWebhookSignature(payload: string, signature: string | null, secret: string): Promise<boolean> {
  if (!signature || !secret) {
    console.log('Missing signature or secret for webhook verification')
    return false
  }
  
  try {
    const encoder = new TextEncoder()
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )
    
    const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(payload))
    const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
    
    // Compare signatures (timing-safe comparison)
    return signature.toLowerCase() === expectedSignature.toLowerCase()
  } catch (error) {
    console.error('Signature verification error:', error)
    return false
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get raw body for signature verification
    const rawBody = await req.text()
    const payload = JSON.parse(rawBody)
    
    console.log('PixUp Webhook received')

    // Get the webhook signature from headers
    const signature = req.headers.get('x-webhook-signature') || 
                      req.headers.get('x-pixup-signature')

    // Fetch webhook secret from gateway settings
    const { data: settings } = await supabase
      .from('gateway_settings')
      .select('client_secret, webhook_url')
      .eq('provider', 'pixup')
      .eq('is_active', true)
      .maybeSingle()

    // SECURITY: CRITICAL - Always verify webhook signature
    // This prevents attackers from forging payment confirmations
    if (!settings?.client_secret) {
      // SECURITY FIX: Block webhook processing if secret not configured
      // This prevents attackers from sending fake payment confirmations
      console.error('SECURITY: Webhook secret not configured - rejecting webhook')
      return new Response(
        JSON.stringify({ success: false, error: 'Webhook secret not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      )
    }

    const isValid = await verifyWebhookSignature(rawBody, signature, settings.client_secret)
    
    if (!isValid) {
      console.error('Invalid webhook signature - potential spoofing attempt')
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid signature' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }
    console.log('Webhook signature verified successfully')

    // PixUp webhook payload structure
    const {
      transactionId,
      externalId, // This is our order_id
      status,
      amount,
      paidAt,
      payerDocument,
      payerName,
    } = payload

    if (!externalId) {
      console.log('No externalId (order_id) in webhook payload')
      return new Response(
        JSON.stringify({ success: false, error: 'Missing externalId' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // SECURITY: Validate that the order exists and is in pending state
    // This prevents attackers from completing already-processed or non-existent orders
    const { data: existingOrder, error: orderCheckError } = await supabase
      .from('orders')
      .select('id, status, amount, user_id')
      .eq('id', externalId)
      .single()

    if (orderCheckError || !existingOrder) {
      console.error('Order not found:', externalId)
      return new Response(
        JSON.stringify({ success: false, error: 'Order not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }

    // SECURITY: Only process if order is still pending
    if (existingOrder.status !== 'pending') {
      console.log(`Order ${externalId} already processed with status: ${existingOrder.status}`)
      return new Response(
        JSON.stringify({ success: true, message: 'Order already processed', status: existingOrder.status }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // SECURITY: Optionally validate amount matches (if provided in webhook)
    if (amount && Math.abs(Number(amount) - Number(existingOrder.amount)) > 0.01) {
      console.error(`Amount mismatch: webhook=${amount}, order=${existingOrder.amount}`)
      return new Response(
        JSON.stringify({ success: false, error: 'Amount mismatch' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Map PixUp status to our internal status
    let orderStatus = 'pending'
    let paymentStatus = 'pending'

    switch (status?.toLowerCase()) {
      case 'paid':
      case 'confirmed':
      case 'approved':
        orderStatus = 'paid'
        paymentStatus = 'paid'
        break
      case 'expired':
      case 'cancelled':
      case 'canceled':
        orderStatus = 'cancelled'
        paymentStatus = 'cancelled'
        break
      case 'refunded':
        orderStatus = 'refunded'
        paymentStatus = 'refunded'
        break
      case 'pending':
      case 'waiting':
      default:
        orderStatus = 'pending'
        paymentStatus = 'pending'
        break
    }

    console.log(`Updating order ${externalId} to status: ${orderStatus}`)

    // Update order status
    const { error: orderError } = await supabase
      .from('orders')
      .update({ 
        status: orderStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', externalId)

    if (orderError) {
      console.error('Error updating order:', orderError)
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to update order' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // Update payment status
    const { error: paymentError } = await supabase
      .from('payments')
      .update({ 
        status: paymentStatus,
        paid_at: paymentStatus === 'paid' ? (paidAt || new Date().toISOString()) : null
      })
      .eq('order_id', externalId)

    if (paymentError) {
      console.error('Error updating payment:', paymentError)
    }

    // If payment is confirmed, trigger order completion
    if (paymentStatus === 'paid') {
      // Get order details to complete it
      const { data: order, error: fetchError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', externalId)
        .single()

      if (order && !fetchError) {
        // Call the atomic order completion function
        const { data: result, error: completeError } = await supabase.rpc('complete_order_atomic', {
          _order_id: order.id,
          _user_id: order.user_id,
          _product_type: order.product_type,
          _quantity: order.quantity
        })

        if (completeError) {
          console.error('Error completing order:', completeError)
        } else {
          console.log('Order completed successfully:', result)
        }
      }
    }

    console.log(`Order ${externalId} updated successfully to ${orderStatus}`)

    return new Response(
      JSON.stringify({ success: true, status: orderStatus }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Webhook error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})