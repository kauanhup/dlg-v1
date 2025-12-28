import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { action, ...params } = await req.json();
    console.log(`[bot-auth] Action: ${action}`);

    // ========== GET RECAPTCHA SETTINGS ==========
    if (action === "get_recaptcha_settings") {
      const { data: settings } = await supabase
        .from("gateway_settings")
        .select("recaptcha_enabled, recaptcha_site_key")
        .single();

      return new Response(
        JSON.stringify({
          success: true,
          enabled: settings?.recaptcha_enabled || false,
          site_key: settings?.recaptcha_site_key || "",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ========== VERIFY RECAPTCHA ==========
    if (action === "verify_recaptcha") {
      const { token } = params;

      const { data: settings } = await supabase
        .from("gateway_settings")
        .select("recaptcha_secret_key, recaptcha_enabled")
        .single();

      if (!settings?.recaptcha_enabled) {
        return new Response(
          JSON.stringify({ success: true, message: "reCAPTCHA disabled" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (!token) {
        return new Response(
          JSON.stringify({ success: false, error: "Token não fornecido" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const verifyResponse = await fetch(
        `https://www.google.com/recaptcha/api/siteverify`,
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: `secret=${settings.recaptcha_secret_key}&response=${token}`,
        }
      );

      const verifyResult = await verifyResponse.json();
      console.log(`[bot-auth] reCAPTCHA result:`, verifyResult);

      return new Response(
        JSON.stringify({
          success: verifyResult.success === true,
          score: verifyResult.score,
          error: verifyResult.success ? null : "Verificação falhou",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ========== CHECK TRIAL ELIGIBILITY ==========
    if (action === "check_trial_eligibility") {
      const { device_fingerprint, machine_id } = params;

      if (!device_fingerprint) {
        return new Response(
          JSON.stringify({ success: false, error: "Fingerprint obrigatório" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Verificar se trial está habilitado
      const { data: trialEnabled } = await supabase
        .from("system_settings")
        .select("value")
        .eq("key", "trial_enabled")
        .single();

      if (trialEnabled?.value !== "true") {
        return new Response(
          JSON.stringify({
            success: false,
            eligible: false,
            error: "Período de teste não está disponível",
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Verificar se dispositivo já usou trial
      const { data: existingTrial } = await supabase
        .from("trial_device_history")
        .select("*")
        .eq("device_fingerprint", device_fingerprint)
        .single();

      if (existingTrial) {
        console.log(`[bot-auth] Device already used trial:`, device_fingerprint);
        return new Response(
          JSON.stringify({
            success: true,
            eligible: false,
            already_used: true,
            trial_started_at: existingTrial.trial_started_at,
            message: "Este dispositivo já utilizou o período de teste gratuito",
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Buscar configurações de trial
      const { data: trialDays } = await supabase
        .from("system_settings")
        .select("value")
        .eq("key", "trial_duration_days")
        .single();

      const { data: maxDevices } = await supabase
        .from("system_settings")
        .select("value")
        .eq("key", "trial_max_devices")
        .single();

      const { data: maxActions } = await supabase
        .from("system_settings")
        .select("value")
        .eq("key", "trial_max_actions_per_day")
        .single();

      return new Response(
        JSON.stringify({
          success: true,
          eligible: true,
          trial_days: parseInt(trialDays?.value || "3"),
          max_devices: parseInt(maxDevices?.value || "1"),
          max_actions_per_day: parseInt(maxActions?.value || "50"),
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ========== REGISTER TRIAL ==========
    if (action === "register_trial") {
      const { device_fingerprint, machine_id, device_name, device_os, ip_address, user_id } = params;

      if (!device_fingerprint) {
        return new Response(
          JSON.stringify({ success: false, error: "Fingerprint obrigatório" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Verificar novamente se já usou trial (double-check)
      const { data: existingTrial } = await supabase
        .from("trial_device_history")
        .select("id")
        .eq("device_fingerprint", device_fingerprint)
        .single();

      if (existingTrial) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Este dispositivo já utilizou o período de teste",
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Buscar duração do trial
      const { data: trialDays } = await supabase
        .from("system_settings")
        .select("value")
        .eq("key", "trial_duration_days")
        .single();

      const durationDays = parseInt(trialDays?.value || "3");
      const trialExpiry = new Date();
      trialExpiry.setDate(trialExpiry.getDate() + durationDays);

      // Registrar trial
      const { error: insertError } = await supabase
        .from("trial_device_history")
        .insert({
          device_fingerprint,
          machine_id,
          device_name,
          device_os,
          ip_address,
          user_id,
          trial_expired_at: trialExpiry.toISOString(),
        });

      if (insertError) {
        console.error(`[bot-auth] Trial insert error:`, insertError);
        return new Response(
          JSON.stringify({ success: false, error: insertError.message }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Se tem user_id, criar licença trial
      if (user_id) {
        const now = new Date();
        await supabase.from("licenses").insert({
          user_id,
          plan_name: "Trial",
          status: "active",
          start_date: now.toISOString(),
          end_date: trialExpiry.toISOString(),
        });
      }

      console.log(`[bot-auth] Trial registered for device:`, device_fingerprint);

      return new Response(
        JSON.stringify({
          success: true,
          trial_expires_at: trialExpiry.toISOString(),
          duration_days: durationDays,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ========== VALIDATE LICENSE ==========
    if (action === "validate_license") {
      const { user_id, device_fingerprint } = params;

      if (!user_id) {
        return new Response(
          JSON.stringify({ success: false, error: "User ID obrigatório" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Buscar licença ativa
      const { data: license } = await supabase
        .from("licenses")
        .select("*")
        .eq("user_id", user_id)
        .eq("status", "active")
        .order("end_date", { ascending: false })
        .limit(1)
        .single();

      if (!license) {
        // Verificar se pode usar trial
        if (device_fingerprint) {
          const { data: trialHistory } = await supabase
            .from("trial_device_history")
            .select("*")
            .eq("device_fingerprint", device_fingerprint)
            .single();

          if (trialHistory) {
            const expiry = new Date(trialHistory.trial_expired_at);
            if (expiry > new Date()) {
              return new Response(
                JSON.stringify({
                  success: true,
                  valid: true,
                  is_trial: true,
                  plan_name: "Trial",
                  expires_at: trialHistory.trial_expired_at,
                }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" } }
              );
            }
          }
        }

        return new Response(
          JSON.stringify({
            success: true,
            valid: false,
            reason: "no_license",
            message: "Nenhuma licença ativa encontrada",
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const now = new Date();
      const endDate = new Date(license.end_date);

      if (endDate < now) {
        // Expirar licença
        await supabase
          .from("licenses")
          .update({ status: "expired" })
          .eq("id", license.id);

        return new Response(
          JSON.stringify({
            success: true,
            valid: false,
            reason: "expired",
            message: "Sua licença expirou",
            expired_at: license.end_date,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Buscar max_devices do plano
      const { data: subscription } = await supabase
        .from("user_subscriptions")
        .select("plan_id, subscription_plans(max_devices, features)")
        .eq("user_id", user_id)
        .eq("status", "active")
        .single();

      const planData = subscription?.subscription_plans as { max_devices?: number; features?: string[] } | null;
      const maxDevices = planData?.max_devices || 1;
      const features = planData?.features || [];

      return new Response(
        JSON.stringify({
          success: true,
          valid: true,
          is_trial: license.plan_name === "Trial",
          plan_name: license.plan_name,
          expires_at: license.end_date,
          max_devices: maxDevices,
          features,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: "Ação inválida" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    console.error("[bot-auth] Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
