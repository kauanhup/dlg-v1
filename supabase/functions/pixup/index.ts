import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const BSPAY_API_URL = "https://api.bspay.co";

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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    // Use service role for database operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    // Use anon key for auth verification
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey);

    const { action, ...params } = await req.json();
    console.log(`PixUp action: ${action}`);

    // Get user authentication
    const { userId, isAuthenticated } = await getUserFromRequest(req, supabaseAuth);

    // SECURITY: Define which actions require authentication and admin role
    const adminOnlyActions = ['save_credentials', 'get_settings', 'test_connection'];
    const authRequiredActions = ['create_pix'];

    if (adminOnlyActions.includes(action)) {
      if (!isAuthenticated || !userId) {
        return new Response(
          JSON.stringify({ error: 'Authentication required' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const adminCheck = await isAdmin(supabaseAdmin, userId);
      if (!adminCheck) {
        console.log(`User ${userId} attempted admin action ${action} without admin role`);
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
      
      case 'save_credentials':
        return await saveCredentials(supabaseAdmin, params);
      
      case 'get_settings':
        return await getSettings(supabaseAdmin);
      
      case 'create_pix':
        return await createPixCharge(supabaseAdmin, params, userId!);
      
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in pixup function:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function getSettings(supabase: any) {
  const { data, error } = await supabase
    .from('gateway_settings')
    .select('*')
    .eq('provider', 'pixup')
    .eq('is_active', true)
    .maybeSingle();

  if (error) {
    console.error('Error fetching settings:', error);
    throw new Error('Failed to fetch gateway settings');
  }

  // SECURITY: Never return client_secret in the response
  return new Response(
    JSON.stringify({ 
      success: true, 
      data: data ? {
        client_id: data.client_id,
        webhook_url: data.webhook_url,
        is_active: data.is_active,
        has_secret: !!data.client_secret // Only indicate if secret exists, never expose it
      } : null 
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function saveCredentials(supabase: any, params: { client_id: string; client_secret?: string; webhook_url?: string }) {
  const { client_id, client_secret, webhook_url } = params;

  if (!client_id) {
    return new Response(
      JSON.stringify({ error: 'client_id is required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Check if settings exist
  const { data: existing } = await supabase
    .from('gateway_settings')
    .select('id, client_secret')
    .eq('provider', 'pixup')
    .maybeSingle();

  // If no existing settings and no secret provided, error
  if (!existing && !client_secret) {
    return new Response(
      JSON.stringify({ error: 'client_secret is required for new configuration' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  let result;
  if (existing) {
    const updateData: any = {
      client_id,
      webhook_url: webhook_url || null,
      is_active: true,
      updated_at: new Date().toISOString()
    };
    
    // Only update secret if provided
    if (client_secret) {
      updateData.client_secret = client_secret;
    }
    
    result = await supabase
      .from('gateway_settings')
      .update(updateData)
      .eq('id', existing.id);
  } else {
    result = await supabase
      .from('gateway_settings')
      .insert({
        provider: 'pixup',
        client_id,
        client_secret,
        webhook_url: webhook_url || null,
        is_active: true
      });
  }

  if (result.error) {
    console.error('Error saving credentials:', result.error);
    throw new Error('Failed to save credentials');
  }

  console.log('Credentials saved successfully');
  return new Response(
    JSON.stringify({ success: true, message: 'Credentials saved successfully' }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function getAccessToken(client_id: string, client_secret: string): Promise<string> {
  const credentials = btoa(`${client_id}:${client_secret}`);
  
  const response = await fetch(`${BSPAY_API_URL}/v2/oauth/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials'
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Token error:', errorText);
    throw new Error('Failed to get access token');
  }

  const data = await response.json();
  return data.access_token;
}

async function testConnection(supabase: any) {
  // Get credentials from database
  const { data: settings, error } = await supabase
    .from('gateway_settings')
    .select('client_id, client_secret')
    .eq('provider', 'pixup')
    .maybeSingle();

  if (error || !settings?.client_id || !settings?.client_secret) {
    return new Response(
      JSON.stringify({ success: false, error: 'Credentials not configured' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const token = await getAccessToken(settings.client_id, settings.client_secret);
    console.log('Connection test successful, token obtained');
    
    // Update is_active to true
    await supabase
      .from('gateway_settings')
      .update({ is_active: true })
      .eq('provider', 'pixup');

    return new Response(
      JSON.stringify({ success: true, message: 'Connection successful' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Connection test failed:', error);
    
    // Update is_active to false
    await supabase
      .from('gateway_settings')
      .update({ is_active: false })
      .eq('provider', 'pixup');

    return new Response(
      JSON.stringify({ success: false, error: 'Connection failed - check credentials' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function createPixCharge(supabase: any, params: { 
  amount: number; 
  description?: string; 
  external_id?: string;
  orderId?: string;
  payer_name?: string;
  payer_document?: string;
}, userId: string) {
  const { amount, description, external_id, orderId, payer_name, payer_document } = params;
  const externalId = external_id || orderId;

  if (!amount || amount <= 0) {
    return new Response(
      JSON.stringify({ error: 'Invalid amount' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // SECURITY: Validate that the order belongs to the authenticated user
  if (externalId) {
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('user_id, amount')
      .eq('id', externalId)
      .single();

    if (orderError || !order) {
      return new Response(
        JSON.stringify({ error: 'Order not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (order.user_id !== userId) {
      console.log(`User ${userId} attempted to create PIX for order owned by ${order.user_id}`);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate amount matches
    if (Math.abs(Number(order.amount) - amount) > 0.01) {
      return new Response(
        JSON.stringify({ error: 'Amount mismatch' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  }

  // Get credentials
  const { data: settings, error } = await supabase
    .from('gateway_settings')
    .select('client_id, client_secret')
    .eq('provider', 'pixup')
    .eq('is_active', true)
    .maybeSingle();

  if (error || !settings?.client_id || !settings?.client_secret) {
    console.log('Gateway not configured, returning mock response for testing');
    // Return a mock response for testing without gateway
    return new Response(
      JSON.stringify({ 
        success: true,
        data: {
          id: `mock_${Date.now()}`,
          pixCode: null,
          qrCodeBase64: null,
          transactionId: `mock_${Date.now()}`,
          status: 'pending',
          message: 'Gateway não configurado. Pedido criado para aprovação manual.'
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const token = await getAccessToken(settings.client_id, settings.client_secret);

    const pixResponse = await fetch(`${BSPAY_API_URL}/v2/pix/qrcode`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount,
        description: description || 'Payment',
        external_id: externalId || `pix_${Date.now()}`,
        payer: payer_name && payer_document ? {
          name: payer_name,
          document: payer_document
        } : undefined
      })
    });

    if (!pixResponse.ok) {
      const errorText = await pixResponse.text();
      console.error('PIX creation error:', errorText);
      throw new Error('Failed to create PIX charge');
    }

    const pixData = await pixResponse.json();
    console.log('PIX charge created successfully');

    // Normalize response format
    return new Response(
      JSON.stringify({ 
        success: true, 
        data: {
          id: pixData.id || pixData.transactionId,
          pixCode: pixData.qrcode || pixData.pixCode || pixData.pix_code,
          qrCodeBase64: pixData.qrcode_base64 || pixData.qrCodeBase64,
          transactionId: pixData.transactionId || pixData.id,
          expiresAt: pixData.expires_at || pixData.expiresAt,
          status: pixData.status || 'pending'
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error creating PIX:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}