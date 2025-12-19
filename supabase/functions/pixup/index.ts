import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Hostinger proxy configuration
const PROXY_URL = Deno.env.get('PIXUP_PROXY_URL') || '';
const PROXY_SECRET = Deno.env.get('PIXUP_PROXY_SECRET') || '';

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

// Call proxy with secret authentication
async function callProxy(action: string, params: any): Promise<any> {
  if (!PROXY_URL || !PROXY_SECRET) {
    throw new Error('Proxy not configured');
  }

  console.log(`Calling proxy for action: ${action}`);
  
  const response = await fetch(PROXY_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Proxy-Secret': PROXY_SECRET
    },
    body: JSON.stringify({
      action,
      ...params
    })
  });

  const data = await response.json();
  
  if (!response.ok || data.error) {
    console.error('Proxy error:', data);
    throw new Error(data.error || 'Proxy request failed');
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
    
    // Use service role for database operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    // Use anon key for auth verification
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey);

    const { action, ...params } = await req.json();
    console.log(`PixUp action: ${action}`);

    // Get user authentication
    const { userId, isAuthenticated } = await getUserFromRequest(req, supabaseAuth);

    // SECURITY: Define which actions require authentication and admin role
    const adminOnlyActions = ['save_credentials', 'get_settings', 'test_connection', 'save_email_settings', 'save_feature_toggles', 'save_recaptcha_settings', 'save_email_template', 'save_evopay_settings'];
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
      
      case 'get_public_settings':
        return await getPublicSettings(supabaseAdmin);
      
      case 'save_email_settings':
        return await saveEmailSettings(supabaseAdmin, params);
      
      case 'save_feature_toggles':
        return await saveFeatureToggles(supabaseAdmin, params);
      
      case 'save_recaptcha_settings':
        return await saveRecaptchaSettings(supabaseAdmin, params);
      
      case 'save_email_template':
        return await saveEmailTemplate(supabaseAdmin, params);
      
      
      case 'save_evopay_settings':
        return await saveEvopaySettings(supabaseAdmin, params);
      
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
  // Use limit(1) to handle potential duplicates gracefully
  const { data, error } = await supabase
    .from('gateway_settings')
    .select('*')
    .eq('provider', 'pixup')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Error fetching settings:', error);
    throw new Error('Failed to fetch gateway settings');
  }

  // SECURITY: Never return client_secret, resend_api_key, or recaptcha_secret_key in the response
  return new Response(
    JSON.stringify({ 
      success: true, 
      data: data ? {
        client_id: data.client_id,
        webhook_url: data.webhook_url,
        is_active: data.is_active,
        has_secret: !!data.client_secret,
        // Email settings
        resend_from_email: data.resend_from_email,
        resend_from_name: data.resend_from_name,
        email_enabled: data.email_enabled,
        has_resend_key: !!data.resend_api_key,
        // reCAPTCHA settings
        recaptcha_enabled: data.recaptcha_enabled,
        recaptcha_site_key: data.recaptcha_site_key,
        has_recaptcha_secret: !!data.recaptcha_secret_key,
        // Feature toggles
        password_recovery_enabled: data.password_recovery_enabled,
        email_verification_enabled: data.email_verification_enabled,
        // Email template settings
        email_template_title: data.email_template_title || '✉️ Verificação de Email',
        email_template_greeting: data.email_template_greeting || 'Olá {name}!',
        email_template_message: data.email_template_message || 'Seu código de verificação é:',
        email_template_expiry_text: data.email_template_expiry_text || 'Este código expira em 15 minutos.',
        email_template_footer: data.email_template_footer || 'DLG Connect - Sistema de Gestão',
        email_template_bg_color: data.email_template_bg_color || '#0a0a0a',
        email_template_accent_color: data.email_template_accent_color || '#4ade80',
        email_template_show_logo: data.email_template_show_logo !== false,
        email_template_logo_url: data.email_template_logo_url || '',
        // EvoPay settings
        evopay_enabled: data.evopay_enabled || false,
        has_evopay_key: !!data.evopay_api_key,
        evopay_webhook_url: data.evopay_webhook_url || ''
      } : null 
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Public settings (no auth required)
async function getPublicSettings(supabase: any) {
  const { data, error } = await supabase
    .from('gateway_settings')
    .select('password_recovery_enabled, email_verification_enabled, email_enabled, recaptcha_enabled, recaptcha_site_key')
    .eq('provider', 'pixup')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Error fetching public settings:', error);
    return new Response(
      JSON.stringify({ success: true, data: null }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      data: data ? {
        password_recovery_enabled: data.password_recovery_enabled && data.email_enabled,
        email_verification_enabled: data.email_verification_enabled && data.email_enabled,
        recaptcha_enabled: data.recaptcha_enabled || false,
        recaptcha_site_key: data.recaptcha_site_key || ''
      } : null 
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Helper function to ensure single settings record exists and get its ID
async function getOrCreateSettingsId(supabase: any): Promise<string> {
  const { data: existing } = await supabase
    .from('gateway_settings')
    .select('id')
    .eq('provider', 'pixup')
    .maybeSingle();

  if (existing) {
    return existing.id;
  }

  // Create new record if none exists
  const { data: created, error } = await supabase
    .from('gateway_settings')
    .insert({ provider: 'pixup' })
    .select('id')
    .single();

  if (error) {
    throw new Error('Failed to create settings record');
  }

  return created.id;
}

async function saveFeatureToggles(supabase: any, params: { 
  password_recovery_enabled?: boolean; 
  email_verification_enabled?: boolean;
}) {
  const { password_recovery_enabled, email_verification_enabled } = params;

  const settingsId = await getOrCreateSettingsId(supabase);

  const updateData: any = { updated_at: new Date().toISOString() };
  
  if (password_recovery_enabled !== undefined) {
    updateData.password_recovery_enabled = password_recovery_enabled;
  }
  if (email_verification_enabled !== undefined) {
    updateData.email_verification_enabled = email_verification_enabled;
  }

  const { error } = await supabase
    .from('gateway_settings')
    .update(updateData)
    .eq('id', settingsId);

  if (error) {
    console.error('Error saving feature toggles:', error);
    throw new Error('Failed to save feature toggles');
  }

  return new Response(
    JSON.stringify({ success: true }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function saveRecaptchaSettings(supabase: any, params: { 
  recaptcha_enabled?: boolean; 
  recaptcha_site_key?: string;
  recaptcha_secret_key?: string;
}) {
  const { recaptcha_enabled, recaptcha_site_key, recaptcha_secret_key } = params;

  const settingsId = await getOrCreateSettingsId(supabase);

  const updateData: any = { updated_at: new Date().toISOString() };
  
  if (recaptcha_enabled !== undefined) {
    updateData.recaptcha_enabled = recaptcha_enabled;
  }
  if (recaptcha_site_key !== undefined) {
    updateData.recaptcha_site_key = recaptcha_site_key;
  }
  if (recaptcha_secret_key) {
    updateData.recaptcha_secret_key = recaptcha_secret_key;
  }

  const { error } = await supabase
    .from('gateway_settings')
    .update(updateData)
    .eq('id', settingsId);

  if (error) {
    console.error('Error saving reCAPTCHA settings:', error);
    throw new Error('Failed to save reCAPTCHA settings');
  }

  console.log('reCAPTCHA settings saved successfully');
  return new Response(
    JSON.stringify({ success: true }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// SECURITY: Sanitize HTML to prevent XSS in email templates
function sanitizeHtml(input: string): string {
  if (!input) return '';
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// SECURITY: Validate input length to prevent DoS
function validateLength(value: string | undefined, maxLength: number): boolean {
  if (!value) return true;
  return value.length <= maxLength;
}

async function saveEmailTemplate(supabase: any, params: { 
  email_template_title?: string;
  email_template_greeting?: string;
  email_template_message?: string;
  email_template_expiry_text?: string;
  email_template_footer?: string;
  email_template_bg_color?: string;
  email_template_accent_color?: string;
  email_template_show_logo?: boolean;
  email_template_logo_url?: string;
}) {
  const { 
    email_template_title,
    email_template_greeting,
    email_template_message,
    email_template_expiry_text,
    email_template_footer,
    email_template_bg_color,
    email_template_accent_color,
    email_template_show_logo,
    email_template_logo_url
  } = params;

  // SECURITY: Validate input lengths
  const maxLengths: { [key: string]: number } = {
    email_template_title: 100,
    email_template_greeting: 200,
    email_template_message: 500,
    email_template_expiry_text: 200,
    email_template_footer: 200,
    email_template_bg_color: 20,
    email_template_accent_color: 20,
    email_template_logo_url: 500
  };

  for (const [key, maxLen] of Object.entries(maxLengths)) {
    const value = params[key as keyof typeof params];
    if (typeof value === 'string' && !validateLength(value, maxLen)) {
      return new Response(
        JSON.stringify({ error: `${key} exceeds maximum length of ${maxLen} characters` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  }

  const settingsId = await getOrCreateSettingsId(supabase);

  const updateData: any = { updated_at: new Date().toISOString() };
  
  // SECURITY: Sanitize text inputs to prevent XSS
  if (email_template_title !== undefined) updateData.email_template_title = sanitizeHtml(email_template_title);
  if (email_template_greeting !== undefined) updateData.email_template_greeting = sanitizeHtml(email_template_greeting);
  if (email_template_message !== undefined) updateData.email_template_message = sanitizeHtml(email_template_message);
  if (email_template_expiry_text !== undefined) updateData.email_template_expiry_text = sanitizeHtml(email_template_expiry_text);
  if (email_template_footer !== undefined) updateData.email_template_footer = sanitizeHtml(email_template_footer);
  
  // Colors don't need sanitization but validate format
  if (email_template_bg_color !== undefined) {
    const colorRegex = /^#[0-9A-Fa-f]{6}$/;
    updateData.email_template_bg_color = colorRegex.test(email_template_bg_color) ? email_template_bg_color : '#0a0a0a';
  }
  if (email_template_accent_color !== undefined) {
    const colorRegex = /^#[0-9A-Fa-f]{6}$/;
    updateData.email_template_accent_color = colorRegex.test(email_template_accent_color) ? email_template_accent_color : '#4ade80';
  }
  
  // Logo settings
  if (email_template_show_logo !== undefined) updateData.email_template_show_logo = email_template_show_logo;
  if (email_template_logo_url !== undefined) {
    // Validate URL format
    const urlRegex = /^https?:\/\/.+/;
    updateData.email_template_logo_url = urlRegex.test(email_template_logo_url) ? email_template_logo_url : null;
  }

  const { error } = await supabase
    .from('gateway_settings')
    .update(updateData)
    .eq('id', settingsId);

  if (error) {
    console.error('Error saving email template:', error);
    throw new Error('Failed to save email template');
  }

  console.log('Email template saved successfully');
  return new Response(
    JSON.stringify({ success: true }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Mercado Pago removido

async function saveEvopaySettings(supabase: any, params: { 
  evopay_enabled?: boolean; 
  evopay_api_key?: string | null;
  evopay_webhook_url?: string | null;
}) {
  const { evopay_enabled, evopay_api_key, evopay_webhook_url } = params;

  const settingsId = await getOrCreateSettingsId(supabase);

  const updateData: any = { updated_at: new Date().toISOString() };
  
  if (evopay_enabled !== undefined) {
    updateData.evopay_enabled = evopay_enabled;
  }
  if (evopay_api_key) {
    updateData.evopay_api_key = evopay_api_key;
  }
  if (evopay_webhook_url !== undefined) {
    updateData.evopay_webhook_url = evopay_webhook_url || null;
  }

  const { error } = await supabase
    .from('gateway_settings')
    .update(updateData)
    .eq('id', settingsId);

  if (error) {
    console.error('Error saving EvoPay settings:', error);
    throw new Error('Failed to save EvoPay settings');
  }

  console.log('EvoPay settings saved successfully');
  return new Response(
    JSON.stringify({ success: true }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function saveCredentials(supabase: any, params: { client_id: string; client_secret?: string; webhook_url?: string; is_active?: boolean }) {
  const { client_id, client_secret, webhook_url, is_active } = params;

  if (!client_id) {
    return new Response(
      JSON.stringify({ error: 'client_id is required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const settingsId = await getOrCreateSettingsId(supabase);

  // Check if we have a secret already
  const { data: existing } = await supabase
    .from('gateway_settings')
    .select('client_secret')
    .eq('id', settingsId)
    .single();

  // If no existing secret and no new secret provided, error
  if (!existing?.client_secret && !client_secret) {
    return new Response(
      JSON.stringify({ error: 'client_secret is required for new configuration' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const updateData: any = {
    client_id,
    webhook_url: webhook_url || null,
    updated_at: new Date().toISOString()
  };
  
  // Update is_active if provided
  if (is_active !== undefined) {
    updateData.is_active = is_active;
  }
  
  // Only update secret if provided - and reset is_active when secret changes
  if (client_secret) {
    updateData.client_secret = client_secret;
    updateData.is_active = false; // Force re-test when secret changes
  }
  
  const { error } = await supabase
    .from('gateway_settings')
    .update(updateData)
    .eq('id', settingsId);

  if (error) {
    console.error('Error saving credentials:', error);
    throw new Error('Failed to save credentials');
  }

  console.log('Credentials saved successfully');
  return new Response(
    JSON.stringify({ success: true, message: 'Credentials saved successfully' }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function saveEmailSettings(supabase: any, params: { 
  resend_api_key?: string; 
  resend_from_email: string; 
  resend_from_name?: string;
  email_enabled?: boolean;
}) {
  const { resend_api_key, resend_from_email, resend_from_name, email_enabled } = params;

  if (!resend_from_email) {
    return new Response(
      JSON.stringify({ error: 'resend_from_email is required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const settingsId = await getOrCreateSettingsId(supabase);

  // Check if we have an API key already
  const { data: existing } = await supabase
    .from('gateway_settings')
    .select('resend_api_key')
    .eq('id', settingsId)
    .single();

  // If no existing key and no new key provided, error
  if (!existing?.resend_api_key && !resend_api_key) {
    return new Response(
      JSON.stringify({ error: 'resend_api_key is required for new configuration' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const updateData: any = {
    resend_from_email,
    resend_from_name: resend_from_name || 'DLG Connect',
    email_enabled: email_enabled !== false,
    updated_at: new Date().toISOString()
  };
  
  if (resend_api_key) {
    updateData.resend_api_key = resend_api_key;
  }
  
  const { error } = await supabase
    .from('gateway_settings')
    .update(updateData)
    .eq('id', settingsId);

  if (error) {
    console.error('Error saving email settings:', error);
    throw new Error('Failed to save email settings');
  }

  console.log('Email settings saved successfully');
  return new Response(
    JSON.stringify({ success: true, message: 'Email settings saved successfully' }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function testConnection(supabase: any) {
  // Get credentials from database
  const { data: settings, error } = await supabase
    .from('gateway_settings')
    .select('client_id, client_secret')
    .eq('provider', 'pixup')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !settings?.client_id || !settings?.client_secret) {
    return new Response(
      JSON.stringify({ success: false, error: 'Credentials not configured' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Use proxy to test connection
    const result = await callProxy('test_connection', {
      client_id: settings.client_id,
      client_secret: settings.client_secret
    });
    
    console.log('Connection test via proxy successful');
    
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
      JSON.stringify({ success: false, error: 'Connection failed - check credentials or proxy configuration' }),
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
    // Use proxy to create PIX charge
    const result = await callProxy('create_pix', {
      client_id: settings.client_id,
      client_secret: settings.client_secret,
      amount,
      description: description || 'Payment',
      external_id: externalId || `pix_${Date.now()}`,
      payer_name,
      payer_document
    });
    
    console.log('PIX charge created successfully via proxy');

    // Normalize response format
    return new Response(
      JSON.stringify({ 
        success: true, 
        data: {
          id: result.data?.id || result.data?.transactionId,
          pixCode: result.data?.pixCode || result.data?.qrcode || result.data?.pix_code,
          qrCodeBase64: result.data?.qrCodeBase64 || result.data?.qrcode_base64,
          transactionId: result.data?.transactionId || result.data?.id,
          expiresAt: result.data?.expiresAt || result.data?.expires_at,
          status: result.data?.status || 'pending'
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error creating PIX via proxy:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}
