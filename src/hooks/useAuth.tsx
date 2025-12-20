import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { z } from "zod";
import { toast } from "sonner";

// Profile update validation schema
const profileUpdateSchema = z.object({
  name: z.string()
    .min(2, 'Nome muito curto')
    .max(100, 'Nome muito longo')
    .optional(),
  whatsapp: z.string()
    .regex(/^\+?[0-9]{10,15}$/, 'WhatsApp inválido')
    .optional(),
  avatar: z.string().max(50, 'Avatar inválido').optional(),
});

interface AuthState {
  user: User | null;
  session: Session | null;
  role: string | null;
  profile: {
    id: string;
    name: string;
    email: string;
    whatsapp: string;
    avatar: string;
    created_at: string;
  } | null;
  isLoading: boolean;
}

export const useAuth = (requiredRole?: 'admin' | 'user') => {
  const navigate = useNavigate();
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    role: null,
    profile: null,
    isLoading: true,
  });

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setAuthState(prev => ({
          ...prev,
          session,
          user: session?.user ?? null,
        }));

        // Fetch role and profile after auth change (deferred to avoid deadlock)
        if (session?.user) {
          setTimeout(() => {
            fetchUserData(session.user.id);
          }, 0);
        } else {
          setAuthState(prev => ({
            ...prev,
            role: null,
            profile: null,
            isLoading: false,
          }));
          
          // Redirect to login if no session
          if (event === 'SIGNED_OUT') {
            navigate('/login');
          }
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setAuthState(prev => ({
          ...prev,
          session,
          user: session.user,
        }));
        fetchUserData(session.user.id);
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }));
        navigate('/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Check role requirement after role is loaded
  useEffect(() => {
    if (!authState.isLoading && authState.role && requiredRole) {
      if (requiredRole === 'admin' && authState.role !== 'admin') {
        navigate('/dashboard');
      }
    }
  }, [authState.isLoading, authState.role, requiredRole, navigate]);

  const fetchUserData = async (userId: string) => {
    try {
      // Fetch role
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();

      // Fetch profile (includes banned check)
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      // Check if user was banned - force logout immediately
      if (profileData?.banned === true) {
        toast.error("Conta suspensa - Entre em contato com o suporte");
        await signOut();
        return;
      }

      const userRole = roleData?.role || 'user';

      // SEGURANÇA: Verificar modo manutenção - deslogar usuários não-admin
      if (userRole !== 'admin') {
        const { data: maintenanceData } = await supabase
          .from('system_settings')
          .select('value')
          .eq('key', 'maintenance_mode')
          .maybeSingle();

        if (maintenanceData?.value === 'true') {
          toast.error("Sistema em manutenção - Tente novamente mais tarde");
          await signOut();
          return;
        }
      }

      setAuthState(prev => ({
        ...prev,
        role: userRole,
        profile: profileData ? {
          id: profileData.id,
          name: profileData.name,
          email: profileData.email,
          whatsapp: profileData.whatsapp,
          avatar: profileData.avatar || '😀',
          created_at: profileData.created_at,
        } : null,
        isLoading: false,
      }));
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const signOut = async () => {
    // Clear local state first
    setAuthState({
      user: null,
      session: null,
      role: null,
      profile: null,
      isLoading: false,
    });
    
    try {
      await supabase.auth.signOut();
    } catch {
      // Silent fail - navigation will handle redirect
    }
    
    // Always navigate to login
    navigate('/login');
  };

  const updateProfile = async (updates: Partial<{ name: string; whatsapp: string; avatar: string }>) => {
    if (!authState.user) return { error: 'Not authenticated' };

    try {
      // Validate input data with Zod
      const validated = profileUpdateSchema.parse(updates);
      
      const { error } = await supabase
        .from('profiles')
        .update(validated)
        .eq('user_id', authState.user.id);

      if (!error && authState.profile) {
        setAuthState(prev => ({
          ...prev,
          profile: prev.profile ? { ...prev.profile, ...validated } : null,
        }));
      }

      return { error };
    } catch (err) {
      if (err instanceof z.ZodError) {
        return { error: err.errors[0].message };
      }
      return { error: 'Erro ao atualizar perfil' };
    }
  };

  return {
    ...authState,
    signOut,
    updateProfile,
    isAdmin: authState.role === 'admin',
  };
};