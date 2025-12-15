import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface AdminUser {
  id: string;
  user_id: string;
  name: string;
  email: string;
  whatsapp: string;
  avatar: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export const useAdminUsers = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch roles for all users
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Merge profiles with roles
      const usersWithRoles: AdminUser[] = (profiles || []).map(profile => {
        const userRole = roles?.find(r => r.user_id === profile.user_id);
        return {
          id: profile.id,
          user_id: profile.user_id,
          name: profile.name,
          email: profile.email,
          whatsapp: profile.whatsapp,
          avatar: profile.avatar || '😀',
          role: userRole?.role || 'user',
          created_at: profile.created_at,
          updated_at: profile.updated_at,
        };
      });

      setUsers(usersWithRoles);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Erro ao carregar usuários');
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: 'admin' | 'user') => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ role: newRole })
        .eq('user_id', userId);

      if (error) throw error;

      // Update local state
      setUsers(prev => prev.map(user => 
        user.user_id === userId ? { ...user, role: newRole } : user
      ));

      return { success: true };
    } catch (err) {
      console.error('Error updating role:', err);
      return { success: false, error: 'Erro ao atualizar role' };
    }
  };

  const banUser = async (userId: string) => {
    // For now, we'll just remove from display - in a real app, you'd have a banned column
    try {
      // This would typically update a 'banned' or 'status' column
      // For demo, we'll just refetch
      await fetchUsers();
      return { success: true };
    } catch (err) {
      console.error('Error banning user:', err);
      return { success: false, error: 'Erro ao banir usuário' };
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    isLoading,
    error,
    refetch: fetchUsers,
    updateUserRole,
    banUser,
    totalUsers: users.length,
    adminCount: users.filter(u => u.role === 'admin').length,
    userCount: users.filter(u => u.role === 'user').length,
  };
};
