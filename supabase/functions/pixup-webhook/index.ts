import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    const payload = await req.json()
    
    console.log('PixUp Webhook received:', JSON.stringify(payload, null, 2))

    // PixUp/BSPAY webhook payload structure
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
