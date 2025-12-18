import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AdminActionRequest {
  action: 'ban_user' | 'invalidate_sessions' | 'enable_maintenance';
  userId?: string;
  banned?: boolean;
  enabled?: boolean;
}

/**
 * ADMIN ACTIONS EDGE FUNCTION
 * 
 * Handles admin-only operations that require service_role:
 * - Ban/unban user with session invalidation
 * - Invalidate all sessions for a user
 * - Enable/disable maintenance mode with session invalidation
 */
serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get authorization header to verify admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: "Não autorizado" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify the requesting user is an admin
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });
    
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: "Não autorizado" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user is admin
    const { data: roleData } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle();

    if (roleData?.role !== 'admin') {
      return new Response(
        JSON.stringify({ success: false, error: "Acesso negado" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body: AdminActionRequest = await req.json();
    const { action, userId, banned, enabled } = body;

    console.log(`Admin action: ${action} by admin: ${user.id}`);

    // ==========================================
    // ACTION: BAN/UNBAN USER
    // ==========================================
    if (action === 'ban_user') {
      if (!userId) {
        return new Response(
          JSON.stringify({ success: false, error: "userId é obrigatório" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Update banned status in profiles
      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({ banned: banned ?? true })
        .eq('user_id', userId);

      if (updateError) {
        console.error('Error updating ban status:', updateError);
        return new Response(
          JSON.stringify({ success: false, error: "Erro ao atualizar status" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // If banning, invalidate all user sessions
      if (banned === true) {
        try {
          await supabaseAdmin.auth.admin.signOut(userId, 'global');
          console.log(`Sessions invalidated for banned user: ${userId}`);
        } catch (signOutError) {
          console.error('Error invalidating sessions:', signOutError);
        }
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: banned ? "Usuário banido e sessões encerradas" : "Usuário desbanido"
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ==========================================
    // ACTION: INVALIDATE SESSIONS
    // ==========================================
    if (action === 'invalidate_sessions') {
      if (!userId) {
        return new Response(
          JSON.stringify({ success: false, error: "userId é obrigatório" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      try {
        await supabaseAdmin.auth.admin.signOut(userId, 'global');
        console.log(`All sessions invalidated for user: ${userId}`);
      } catch (signOutError) {
        console.error('Error invalidating sessions:', signOutError);
        return new Response(
          JSON.stringify({ success: false, error: "Erro ao encerrar sessões" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, message: "Sessões encerradas" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ==========================================
    // ACTION: ENABLE/DISABLE MAINTENANCE MODE
    // ==========================================
    if (action === 'enable_maintenance') {
      const maintenanceValue = enabled ? 'true' : 'false';
      
      // Update maintenance mode setting
      const { error: updateError } = await supabaseAdmin
        .from('system_settings')
        .update({ value: maintenanceValue })
        .eq('key', 'maintenance_mode');

      if (updateError) {
        console.error('Error updating maintenance mode:', updateError);
        return new Response(
          JSON.stringify({ success: false, error: "Erro ao atualizar configuração" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // If enabling maintenance, invalidate all non-admin sessions
      if (enabled === true) {
        try {
          // Get all non-admin users
          const { data: nonAdminUsers } = await supabaseAdmin
            .from('user_roles')
            .select('user_id')
            .eq('role', 'user');

          if (nonAdminUsers) {
            for (const userData of nonAdminUsers) {
              try {
                await supabaseAdmin.auth.admin.signOut(userData.user_id, 'global');
              } catch (e) {
                // Continue even if one fails
              }
            }
            console.log(`Invalidated sessions for ${nonAdminUsers.length} non-admin users due to maintenance mode`);
          }
        } catch (signOutError) {
          console.error('Error invalidating sessions for maintenance:', signOutError);
        }
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: enabled ? "Manutenção ativada, sessões de usuários encerradas" : "Manutenção desativada"
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: "Ação inválida" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error in admin-actions function:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Erro interno do servidor" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
