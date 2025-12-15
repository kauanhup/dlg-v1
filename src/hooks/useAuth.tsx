import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";

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

      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      setAuthState(prev => ({
        ...prev,
        role: roleData?.role || 'user',
        profile: profileData ? {
          id: profileData.id,
          name: profileData.name,
          email: profileData.email,
          whatsapp: profileData.whatsapp,
          avatar: profileData.avatar || '😀',
        } : null,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error fetching user data:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const updateProfile = async (updates: Partial<{ name: string; whatsapp: string; avatar: string }>) => {
    if (!authState.user) return { error: 'Not authenticated' };

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', authState.user.id);

    if (!error && authState.profile) {
      setAuthState(prev => ({
        ...prev,
        profile: prev.profile ? { ...prev.profile, ...updates } : null,
      }));
    }

    return { error };
  };

  return {
    ...authState,
    signOut,
    updateProfile,
    isAdmin: authState.role === 'admin',
  };
};