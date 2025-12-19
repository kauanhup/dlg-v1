import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Mercado Pago API base URL
const MP_API_URL = 'https://api.mercadopago.com';

// SECURITY: Helper to verify admin role
async function isAdmin(supabase: any, userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .single();
  
  return !error && data?.role === 'admin';
}

// SECURITY: Extract user from JWT token
async function getUserFromRequest(req: Request, supabase: any): Promise<{ userId: string | null; isAuthenticated: boolean }> {
  const authHeader = req.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { userId: null, isAuthenticated: false };
  }

  const token = authHeader.replace('Bearer ', '');
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return { userId: null, isAuthenticated: false };
    }
    return { userId: user.id, isAuthenticated: true };
  } catch {
    return { userId: null, isAuthenticated: false };
  }
}

// Get Mercado Pago settings from database
async function getMPSettings(supabase: any) {
  const { data, error } = await supabase
    .from('gateway_settings')
    .select('mercadopago_enabled, mercadopago_access_token, mercadopago_public_key')
    .eq('provider', 'pixup')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Error fetching MP settings:', error);
    return null;
  }

  return data;
}

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

    const { action, ...params } = await req.json();
    console.log(`MercadoPago action: ${action}`);

    // Get user authentication
    const { userId, isAuthenticated } = await getUserFromRequest(req, supabaseAuth);

    // Define which actions require authentication
    const adminOnlyActions = ['test_connection', 'get_settings'];
    const authRequiredActions = ['create_preference', 'get_payment_status'];

    if (adminOnlyActions.includes(action)) {
      if (!isAuthenticated || !userId) {
        return new Response(
          JSON.stringify({ error: 'Authentication required' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const adminCheck = await isAdmin(supabaseAdmin, userId);
      if (!adminCheck) {
        return new Response(
          JSON.stringify({ error: 'Admin access required' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    if (authRequiredActions.includes(action)) {
      if (!isAuthenticated || !userId) {
        return new Response(
          JSON.stringify({ error: 'Authentication required' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    switch (action) {
      case 'test_connection':
        return await testConnection(supabaseAdmin);
      
      case 'get_settings':
        return await getSettings(supabaseAdmin);
      
      case 'get_public_settings':
        return await getPublicSettings(supabaseAdmin);
      
      case 'create_preference':
        return await createPreference(supabaseAdmin, params, userId!);
      
      case 'get_payment_status':
        return await getPaymentStatus(supabaseAdmin, params);
      
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in mercadopago function:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function getSettings(supabase: any) {
  const settings = await getMPSettings(supabase);
  
  return new Response(
    JSON.stringify({ 
      success: true, 
      data: settings ? {
        mercadopago_enabled: settings.mercadopago_enabled || false,
        mercadopago_public_key: settings.mercadopago_public_key || '',
        has_access_token: !!settings.mercadopago_access_token
      } : null 
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function getPublicSettings(supabase: any) {
  const settings = await getMPSettings(supabase);
  
  return new Response(
    JSON.stringify({ 
      success: true, 
      data: settings ? {
        mercadopago_enabled: settings.mercadopago_enabled || false,
        mercadopago_public_key: settings.mercadopago_public_key || ''
      } : { mercadopago_enabled: false, mercadopago_public_key: '' }
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function testConnection(supabase: any) {
  const settings = await getMPSettings(supabase);

  if (!settings?.mercadopago_access_token) {
    return new Response(
      JSON.stringify({ success: false, error: 'Access Token não configurado' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Test connection by getting user info
    const response = await fetch(`${MP_API_URL}/users/me`, {
      headers: {
        'Authorization': `Bearer ${settings.mercadopago_access_token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('MP API error:', errorData);
      return new Response(
        JSON.stringify({ success: false, error: 'Credenciais inválidas ou expiradas' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userData = await response.json();
    console.log('Mercado Pago connection test successful:', userData.email);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Conexão estabelecida com sucesso',
        data: {
          user_id: userData.id,
          email: userData.email,
          site_id: userData.site_id
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Connection test failed:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Falha na conexão com Mercado Pago' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function createPreference(supabase: any, params: {
  order_id: string;
  title: string;
  description?: string;
  amount: number;
  quantity?: number;
  payer_email?: string;
  back_urls?: {
    success?: string;
    failure?: string;
    pending?: string;
  };
}, userId: string) {
  const { order_id, title, description, amount, quantity = 1, payer_email, back_urls } = params;

  if (!order_id || !title || !amount) {
    return new Response(
      JSON.stringify({ error: 'order_id, title and amount are required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // SECURITY: Validate that the order belongs to the authenticated user
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('user_id, amount, status')
    .eq('id', order_id)
    .single();

  if (orderError || !order) {
    return new Response(
      JSON.stringify({ error: 'Pedido não encontrado' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  if (order.user_id !== userId) {
    console.log(`User ${userId} attempted to create preference for order owned by ${order.user_id}`);
    return new Response(
      JSON.stringify({ error: 'Não autorizado' }),
      { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Validate amount matches
  if (Math.abs(Number(order.amount) - amount) > 0.01) {
    return new Response(
      JSON.stringify({ error: 'Valor não corresponde ao pedido' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Get MP settings
  const settings = await getMPSettings(supabase);

  if (!settings?.mercadopago_enabled || !settings?.mercadopago_access_token) {
    console.log('Mercado Pago not configured, returning error');
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Mercado Pago não está configurado'
      }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Get the webhook URL
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const webhookUrl = `${supabaseUrl}/functions/v1/mercadopago-webhook`;

    // Create preference
    const preferenceData = {
      items: [
        {
          id: order_id,
          title: title,
          description: description || title,
          quantity: quantity,
          currency_id: 'BRL',
          unit_price: amount
        }
      ],
      payer: payer_email ? { email: payer_email } : undefined,
      back_urls: {
        success: back_urls?.success || `${Deno.env.get('VITE_SUPABASE_URL')?.replace('/rest/v1', '')}/dashboard?payment=success`,
        failure: back_urls?.failure || `${Deno.env.get('VITE_SUPABASE_URL')?.replace('/rest/v1', '')}/dashboard?payment=failure`,
        pending: back_urls?.pending || `${Deno.env.get('VITE_SUPABASE_URL')?.replace('/rest/v1', '')}/dashboard?payment=pending`
      },
      auto_return: 'approved',
      external_reference: order_id,
      notification_url: webhookUrl,
      statement_descriptor: 'SWEXTRACTOR',
      expires: true,
      expiration_date_from: new Date().toISOString(),
      expiration_date_to: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutes
    };

    console.log('Creating MP preference:', JSON.stringify(preferenceData, null, 2));

    const response = await fetch(`${MP_API_URL}/checkout/preferences`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${settings.mercadopago_access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(preferenceData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('MP Preference creation error:', errorData);
      return new Response(
        JSON.stringify({ success: false, error: 'Erro ao criar preferência de pagamento' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const preference = await response.json();
    console.log('MP Preference created:', preference.id);

    // Update order with payment method
    await supabase
      .from('orders')
      .update({ payment_method: 'mercadopago' })
      .eq('id', order_id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: {
          preference_id: preference.id,
          init_point: preference.init_point,
          sandbox_init_point: preference.sandbox_init_point
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error creating preference:', error);
    return new Response(
      JSON.stringify({ error: 'Erro interno ao criar preferência' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function getPaymentStatus(supabase: any, params: { payment_id: string }) {
  const { payment_id } = params;

  if (!payment_id) {
    return new Response(
      JSON.stringify({ error: 'payment_id is required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const settings = await getMPSettings(supabase);

  if (!settings?.mercadopago_access_token) {
    return new Response(
      JSON.stringify({ error: 'Mercado Pago não configurado' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const response = await fetch(`${MP_API_URL}/v1/payments/${payment_id}`, {
      headers: {
        'Authorization': `Bearer ${settings.mercadopago_access_token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: 'Pagamento não encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const payment = await response.json();

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: {
          id: payment.id,
          status: payment.status,
          status_detail: payment.status_detail,
          external_reference: payment.external_reference,
          amount: payment.transaction_amount,
          date_approved: payment.date_approved
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error getting payment status:', error);
    return new Response(
      JSON.stringify({ error: 'Erro ao consultar pagamento' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}
