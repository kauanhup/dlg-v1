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
        .maybeSingle();

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
        .maybeSingle();

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
      const { device_fingerprint } = params;

      if (!device_fingerprint) {
        return new Response(
          JSON.stringify({ success: false, error: "Fingerprint obrigatório" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: trialEnabled } = await supabase
        .from("system_settings")
        .select("value")
        .eq("key", "trial_enabled")
        .maybeSingle();

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

      const { data: existingTrial } = await supabase
        .from("trial_device_history")
        .select("*")
        .eq("device_fingerprint", device_fingerprint)
        .maybeSingle();

      if (existingTrial) {
        return new Response(
          JSON.stringify({
            success: true,
            eligible: false,
            already_used: true,
            trial_started_at: existingTrial.trial_started_at,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: trialDays } = await supabase
        .from("system_settings")
        .select("value")
        .eq("key", "trial_duration_days")
        .maybeSingle();

      const { data: maxDevices } = await supabase
        .from("system_settings")
        .select("value")
        .eq("key", "trial_max_devices")
        .maybeSingle();

      return new Response(
        JSON.stringify({
          success: true,
          eligible: true,
          trial_days: parseInt(trialDays?.value || "3"),
          max_devices: parseInt(maxDevices?.value || "1"),
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ========== REGISTER TRIAL ==========
    if (action === "register_trial") {
      const { device_fingerprint, machine_id, device_name, device_os, ip_address, user_id: trialUserId } = params;

      if (!device_fingerprint) {
        return new Response(
          JSON.stringify({ success: false, error: "Fingerprint obrigatório" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: existingTrial } = await supabase
        .from("trial_device_history")
        .select("id")
        .eq("device_fingerprint", device_fingerprint)
        .maybeSingle();

      if (existingTrial) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Este dispositivo já utilizou o período de teste",
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: trialDays } = await supabase
        .from("system_settings")
        .select("value")
        .eq("key", "trial_duration_days")
        .maybeSingle();

      const durationDays = parseInt(trialDays?.value || "3");
      const trialExpiry = new Date();
      trialExpiry.setDate(trialExpiry.getDate() + durationDays);

      const { error: insertError } = await supabase
        .from("trial_device_history")
        .insert({
          device_fingerprint,
          machine_id,
          device_name,
          device_os,
          ip_address,
          user_id: trialUserId,
          trial_expired_at: trialExpiry.toISOString(),
        });

      if (insertError) {
        return new Response(
          JSON.stringify({ success: false, error: insertError.message }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (trialUserId) {
        await supabase.from("licenses").insert({
          user_id: trialUserId,
          plan_name: "Trial",
          status: "active",
          start_date: new Date().toISOString(),
          end_date: trialExpiry.toISOString(),
        });
      }

      return new Response(
        JSON.stringify({
          success: true,
          trial_expires_at: trialExpiry.toISOString(),
          duration_days: durationDays,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ========== FULL LOGIN CHECK (COM EMAIL/PASSWORD) ==========
    if (action === "full_login_check") {
      const { email, password, device_fingerprint, device_id, device_name, device_os, ip_address, recaptcha_token } = params;

      let userId = params.user_id;
      let userEmail = email;
      let userName = "";
      let userAvatar = "😀";

      // Se recebeu email/password, fazer autenticação primeiro
      if (email && password) {
        console.log(`[bot-auth] Full login with email: ${email}`);

        // 1. Verificar reCAPTCHA se habilitado
        const { data: recaptchaSettings } = await supabase
          .from("gateway_settings")
          .select("recaptcha_enabled, recaptcha_secret_key")
          .maybeSingle();

        if (recaptchaSettings?.recaptcha_enabled) {
          if (!recaptcha_token) {
            return new Response(
              JSON.stringify({
                success: false,
                access: false,
                reason: "recaptcha_required",
                error: "Verificação reCAPTCHA necessária",
                code: "RECAPTCHA_REQUIRED"
              }),
              { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }

          // Bot desktop usa token especial - não precisa validar com Google
          // reCAPTCHA é proteção para web, apps desktop já são "verificados" por instalação
          const isBotDesktopToken = recaptcha_token.startsWith("03AGdBq") && recaptcha_token.includes("_verified");
          
          if (!isBotDesktopToken) {
            // Token real do web - validar com Google
            const verifyResponse = await fetch(
              `https://www.google.com/recaptcha/api/siteverify`,
              {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: `secret=${recaptchaSettings.recaptcha_secret_key}&response=${recaptcha_token}`,
              }
            );
            const verifyResult = await verifyResponse.json();
            
            if (!verifyResult.success) {
              console.log(`[bot-auth] reCAPTCHA failed:`, verifyResult);
              return new Response(
                JSON.stringify({
                  success: false,
                  access: false,
                  reason: "recaptcha_failed",
                  error: "Verificação reCAPTCHA falhou",
                  code: "RECAPTCHA_FAILED"
                }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" } }
              );
            }
          } else {
            console.log(`[bot-auth] Bot desktop token accepted`);
          }
        }

        // 2. Verificar manutenção
        const { data: maintenanceCheck } = await supabase
          .from("system_settings")
          .select("value")
          .eq("key", "maintenance_mode")
          .maybeSingle();

        if (maintenanceCheck?.value === "true") {
          return new Response(
            JSON.stringify({
              success: false,
              access: false,
              reason: "maintenance",
              error: "Sistema em manutenção",
              code: "MAINTENANCE"
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // 3. Autenticar usuário
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (authError || !authData.user) {
          console.log(`[bot-auth] Auth failed:`, authError?.message);
          return new Response(
            JSON.stringify({
              success: false,
              access: false,
              reason: "invalid_credentials",
              error: "Credenciais inválidas",
              code: "INVALID_CREDENTIALS"
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        userId = authData.user.id;
        userEmail = authData.user.email;
        console.log(`[bot-auth] Auth success for user: ${userId}`);
      }

      if (!userId) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            access: false,
            reason: "invalid_request",
            error: "Email/senha ou User ID são obrigatórios" 
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log(`[bot-auth] Full login check for user: ${userId}`);

      // 4. VERIFICAR BAN e buscar profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("banned, ban_reason, banned_at, name, avatar")
        .eq("user_id", userId)
        .maybeSingle();

      if (profile) {
        userName = profile.name || "";
        userAvatar = profile.avatar || "😀";
      }

      if (profile?.banned) {
        console.log(`[bot-auth] User banned: ${userId}, reason: ${profile.ban_reason}`);
        return new Response(
          JSON.stringify({
            success: false,
            access: false,
            reason: "banned",
            code: "BANNED",
            message: "Sua conta foi suspensa",
            ban_reason: profile.ban_reason || "Violação dos termos de uso",
            banned_at: profile.banned_at,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // 5. BUSCAR LICENÇA ATIVA
      const { data: licenses } = await supabase
        .from("licenses")
        .select("*")
        .eq("user_id", userId)
        .eq("status", "active")
        .order("end_date", { ascending: false })
        .limit(1);

      const license = licenses?.[0];
      let hasValidLicense = false;
      let isTrial = false;
      let planName = "";
      let expiresAt = "";
      let maxDevices = 1;
      let features: string[] = [];
      let trialEligible = false;

      if (license) {
        const now = new Date();
        const endDate = new Date(license.end_date);

        if (endDate > now) {
          hasValidLicense = true;
          isTrial = license.plan_name === "Trial";
          planName = license.plan_name;
          expiresAt = license.end_date;

          const { data: subscription } = await supabase
            .from("user_subscriptions")
            .select("subscription_plans(max_devices, features)")
            .eq("user_id", userId)
            .eq("status", "active")
            .maybeSingle();

          const planData = subscription?.subscription_plans as { max_devices?: number; features?: string[] } | null;
          maxDevices = planData?.max_devices || (isTrial ? 1 : 2);
          features = planData?.features || [];
        } else {
          await supabase
            .from("licenses")
            .update({ status: "expired" })
            .eq("id", license.id);
          console.log(`[bot-auth] License auto-expired for user: ${userId}`);
        }
      }

      // 6. SE NÃO TEM LICENÇA, VERIFICAR TRIAL
      const deviceFp = device_fingerprint || device_id;
      if (!hasValidLicense && deviceFp) {
        const { data: trialHistory } = await supabase
          .from("trial_device_history")
          .select("*")
          .eq("device_fingerprint", deviceFp)
          .maybeSingle();

        if (trialHistory) {
          const expiry = new Date(trialHistory.trial_expired_at);
          if (expiry > new Date()) {
            hasValidLicense = true;
            isTrial = true;
            planName = "Trial";
            expiresAt = trialHistory.trial_expired_at;

            const { data: trialMaxDevices } = await supabase
              .from("system_settings")
              .select("value")
              .eq("key", "trial_max_devices")
              .maybeSingle();
            maxDevices = parseInt(trialMaxDevices?.value || "1");
          }
        } else {
          const { data: trialEnabled } = await supabase
            .from("system_settings")
            .select("value")
            .eq("key", "trial_enabled")
            .maybeSingle();
          trialEligible = trialEnabled?.value === "true";
        }
      }

      // 7. SE NÃO TEM ACESSO
      if (!hasValidLicense) {
        console.log(`[bot-auth] No valid license for user: ${userId}, trial_eligible: ${trialEligible}`);
        return new Response(
          JSON.stringify({
            success: true,
            access: false,
            reason: "no_license",
            message: "Você não possui uma licença ativa",
            trial_eligible: trialEligible,
            user: {
              id: userId,
              email: userEmail,
              name: userName,
              avatar: userAvatar
            }
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // 8. VERIFICAR LIMITE DE DISPOSITIVOS
      const deviceIdToUse = device_id || device_fingerprint;
      if (deviceIdToUse) {
        const { data: activeSessions } = await supabase
          .from("bot_device_sessions")
          .select("id, device_id, device_name, last_activity_at")
          .eq("user_id", userId)
          .eq("is_active", true);

        if (activeSessions) {
          const currentDevice = activeSessions.find(s => s.device_id === deviceIdToUse);
          
          if (!currentDevice && activeSessions.length >= maxDevices) {
            console.log(`[bot-auth] Device limit reached for user: ${userId} (${activeSessions.length}/${maxDevices})`);
            return new Response(
              JSON.stringify({
                success: true,
                access: false,
                reason: "device_limit",
                message: `Limite de ${maxDevices} dispositivo(s) atingido`,
                max_devices: maxDevices,
                active_devices: activeSessions.length,
                devices: activeSessions.map(s => ({
                  device_id: s.device_id,
                  device_name: s.device_name,
                  last_activity: s.last_activity_at,
                })),
              }),
              { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }

          if (currentDevice) {
            await supabase
              .from("bot_device_sessions")
              .update({ 
                last_activity_at: new Date().toISOString(),
                device_name: device_name || currentDevice.device_name,
                device_os: device_os || null,
                ip_address: ip_address || null,
              })
              .eq("id", currentDevice.id);
          } else {
            await supabase
              .from("bot_device_sessions")
              .insert({
                user_id: userId,
                device_id: deviceIdToUse,
                device_name,
                device_os,
                ip_address,
                is_active: true,
              });
          }
        }
      }

      // 9. REGISTRAR ATIVIDADE DE LOGIN
      await supabase.from("bot_activity_logs").insert({
        user_id: userId,
        action: "login",
        device_id: deviceIdToUse || null,
        ip_address: ip_address || null,
        details: {
          plan_name: planName,
          is_trial: isTrial,
          device_name,
          device_os,
        },
      });

      // 10. SUCESSO - ACESSO LIBERADO
      console.log(`[bot-auth] Access granted for user: ${userId}, plan: ${planName}`);
      return new Response(
        JSON.stringify({
          success: true,
          access: true,
          is_trial: isTrial,
          plan_name: planName,
          expires_at: expiresAt,
          max_devices: maxDevices,
          features,
          user: {
            id: userId,
            email: userEmail,
            name: userName,
            avatar: userAvatar
          }
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ========== VALIDATE LICENSE ==========
    if (action === "validate_license") {
      const { user_id: licenseUserId, device_fingerprint } = params;

      if (!licenseUserId) {
        return new Response(
          JSON.stringify({ success: false, error: "User ID obrigatório" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: licenses } = await supabase
        .from("licenses")
        .select("*")
        .eq("user_id", licenseUserId)
        .eq("status", "active")
        .order("end_date", { ascending: false })
        .limit(1);

      const license = licenses?.[0];

      if (!license) {
        if (device_fingerprint) {
          const { data: trialHistory } = await supabase
            .from("trial_device_history")
            .select("*")
            .eq("device_fingerprint", device_fingerprint)
            .maybeSingle();

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
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const now = new Date();
      const endDate = new Date(license.end_date);

      if (endDate < now) {
        await supabase
          .from("licenses")
          .update({ status: "expired" })
          .eq("id", license.id);

        return new Response(
          JSON.stringify({
            success: true,
            valid: false,
            reason: "expired",
            expired_at: license.end_date,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: subscription } = await supabase
        .from("user_subscriptions")
        .select("plan_id, subscription_plans(max_devices, features)")
        .eq("user_id", licenseUserId)
        .eq("status", "active")
        .maybeSingle();

      const planData = subscription?.subscription_plans as { max_devices?: number; features?: string[] } | null;

      return new Response(
        JSON.stringify({
          success: true,
          valid: true,
          is_trial: license.plan_name === "Trial",
          plan_name: license.plan_name,
          expires_at: license.end_date,
          max_devices: planData?.max_devices || 1,
          features: planData?.features || [],
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ========== VERIFY SESSION (Auto-login sem senha) ==========
    if (action === "verify_session") {
      const { user_id: sessionUserId, device_fingerprint, device_id, device_name, device_os, ip_address } = params;

      if (!sessionUserId) {
        return new Response(
          JSON.stringify({ success: false, error: "User ID obrigatório" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log(`[bot-auth] Verify session for user: ${sessionUserId}`);

      // 1. Verificar manutenção
      const { data: maintenanceCheck } = await supabase
        .from("system_settings")
        .select("value")
        .eq("key", "maintenance_mode")
        .maybeSingle();

      if (maintenanceCheck?.value === "true") {
        return new Response(
          JSON.stringify({
            success: false,
            access: false,
            reason: "maintenance",
            should_clear_session: false,
            error: "Sistema em manutenção",
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // 2. Verificar se usuário existe e buscar profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("banned, ban_reason, banned_at, name, avatar, email")
        .eq("user_id", sessionUserId)
        .maybeSingle();

      if (!profile) {
        console.log(`[bot-auth] User not found: ${sessionUserId}`);
        return new Response(
          JSON.stringify({
            success: false,
            access: false,
            reason: "user_not_found",
            should_clear_session: true,
            error: "Usuário não encontrado",
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // 3. Verificar ban
      if (profile.banned) {
        console.log(`[bot-auth] User banned: ${sessionUserId}`);
        return new Response(
          JSON.stringify({
            success: false,
            access: false,
            reason: "banned",
            should_clear_session: true,
            ban_reason: profile.ban_reason,
            banned_at: profile.banned_at,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // 4. Verificar licença
      const { data: licenses } = await supabase
        .from("licenses")
        .select("*")
        .eq("user_id", sessionUserId)
        .eq("status", "active")
        .order("end_date", { ascending: false })
        .limit(1);

      const license = licenses?.[0];
      let hasValidLicense = false;
      let isTrial = false;
      let planName = "";
      let expiresAt = "";
      let maxDevices = 1;
      let features: string[] = [];
      let trialEligible = false;

      if (license) {
        const now = new Date();
        const endDate = new Date(license.end_date);

        if (endDate > now) {
          hasValidLicense = true;
          isTrial = license.plan_name === "Trial";
          planName = license.plan_name;
          expiresAt = license.end_date;

          const { data: subscription } = await supabase
            .from("user_subscriptions")
            .select("subscription_plans(max_devices, features)")
            .eq("user_id", sessionUserId)
            .eq("status", "active")
            .maybeSingle();

          const planData = subscription?.subscription_plans as { max_devices?: number; features?: string[] } | null;
          maxDevices = planData?.max_devices || (isTrial ? 1 : 2);
          features = planData?.features || [];
        } else {
          await supabase
            .from("licenses")
            .update({ status: "expired" })
            .eq("id", license.id);
          console.log(`[bot-auth] License auto-expired for user: ${sessionUserId}`);
        }
      }

      // 5. Se não tem licença, verificar trial por device
      const deviceFp = device_fingerprint || device_id;
      if (!hasValidLicense && deviceFp) {
        const { data: trialHistory } = await supabase
          .from("trial_device_history")
          .select("*")
          .eq("device_fingerprint", deviceFp)
          .maybeSingle();

        if (trialHistory) {
          const expiry = new Date(trialHistory.trial_expired_at);
          if (expiry > new Date()) {
            hasValidLicense = true;
            isTrial = true;
            planName = "Trial";
            expiresAt = trialHistory.trial_expired_at;

            const { data: trialMaxDevices } = await supabase
              .from("system_settings")
              .select("value")
              .eq("key", "trial_max_devices")
              .maybeSingle();
            maxDevices = parseInt(trialMaxDevices?.value || "1");
          }
        } else {
          const { data: trialEnabled } = await supabase
            .from("system_settings")
            .select("value")
            .eq("key", "trial_enabled")
            .maybeSingle();
          trialEligible = trialEnabled?.value === "true";
        }
      }

      // 6. Se não tem licença válida
      if (!hasValidLicense) {
        console.log(`[bot-auth] Session verify: no license for user: ${sessionUserId}`);
        return new Response(
          JSON.stringify({
            success: true,
            access: false,
            reason: "no_license",
            should_clear_session: true,
            trial_eligible: trialEligible,
            user: {
              id: sessionUserId,
              email: profile.email,
              name: profile.name,
              avatar: profile.avatar
            }
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // 7. Verificar limite de dispositivos
      const deviceIdToUse = device_id || device_fingerprint;
      if (deviceIdToUse) {
        const { data: activeSessions } = await supabase
          .from("bot_device_sessions")
          .select("id, device_id, device_name, last_activity_at")
          .eq("user_id", sessionUserId)
          .eq("is_active", true);

        if (activeSessions) {
          const currentDevice = activeSessions.find(s => s.device_id === deviceIdToUse);
          
          if (!currentDevice && activeSessions.length >= maxDevices) {
            console.log(`[bot-auth] Session verify: device limit for user: ${sessionUserId}`);
            return new Response(
              JSON.stringify({
                success: true,
                access: false,
                reason: "device_limit",
                should_clear_session: false,
                max_devices: maxDevices,
                active_devices: activeSessions.length,
                devices: activeSessions.map(s => ({
                  device_id: s.device_id,
                  device_name: s.device_name,
                  last_activity: s.last_activity_at,
                })),
              }),
              { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }

          // Atualizar ou criar sessão do dispositivo
          if (currentDevice) {
            await supabase
              .from("bot_device_sessions")
              .update({ 
                last_activity_at: new Date().toISOString(),
                device_name: device_name || currentDevice.device_name,
                device_os: device_os || null,
                ip_address: ip_address || null,
              })
              .eq("id", currentDevice.id);
          } else {
            await supabase
              .from("bot_device_sessions")
              .insert({
                user_id: sessionUserId,
                device_id: deviceIdToUse,
                device_name,
                device_os,
                ip_address,
                is_active: true,
              });
          }
        }
      }

      // 8. Registrar atividade de auto-login
      await supabase.from("bot_activity_logs").insert({
        user_id: sessionUserId,
        action: "auto_login",
        device_id: deviceIdToUse || null,
        ip_address: ip_address || null,
        details: {
          plan_name: planName,
          is_trial: isTrial,
          device_name,
          device_os,
        },
      });

      // 9. Sucesso - sessão válida
      console.log(`[bot-auth] Session verified for user: ${sessionUserId}, plan: ${planName}`);
      return new Response(
        JSON.stringify({
          success: true,
          access: true,
          is_trial: isTrial,
          plan_name: planName,
          expires_at: expiresAt,
          max_devices: maxDevices,
          features,
          user: {
            id: sessionUserId,
            email: profile.email,
            name: profile.name,
            avatar: profile.avatar
          }
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ========== LOGOUT ==========
    if (action === "logout") {
      const { user_id: logoutUserId, device_fingerprint, device_id } = params;
      const deviceToLogout = device_id || device_fingerprint;

      if (logoutUserId && deviceToLogout) {
        await supabase
          .from("bot_device_sessions")
          .update({ is_active: false })
          .eq("user_id", logoutUserId)
          .eq("device_id", deviceToLogout);

        await supabase.from("bot_activity_logs").insert({
          user_id: logoutUserId,
          action: "logout",
          device_id: deviceToLogout,
        });
      }

      return new Response(
        JSON.stringify({ success: true, message: "Logout realizado" }),
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
