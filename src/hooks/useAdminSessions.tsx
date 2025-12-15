import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface SessionInventory {
  id: string;
  type: string;
  quantity: number;
  cost_per_session: number;
  sale_price_per_session: number;
  updated_at: string;
}

export interface SessionCombo {
  id: string;
  type: string;
  quantity: number;
  price: number;
  is_popular: boolean;
  is_active: boolean;
  created_at: string;
}

export const useAdminSessions = () => {
  const [inventory, setInventory] = useState<SessionInventory[]>([]);
  const [combos, setCombos] = useState<SessionCombo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch inventory
      const { data: inventoryData, error: inventoryError } = await supabase
        .from('sessions_inventory')
        .select('*');

      if (inventoryError) throw inventoryError;
      setInventory(inventoryData || []);

      // Fetch combos
      const { data: combosData, error: combosError } = await supabase
        .from('session_combos')
        .select('*')
        .order('quantity', { ascending: true });

      if (combosError) throw combosError;
      setCombos(combosData || []);
    } catch (err) {
      console.error('Error fetching sessions data:', err);
      setError('Erro ao carregar dados de sessions');
    } finally {
      setIsLoading(false);
    }
  };

  const updateInventory = async (type: string, data: Partial<SessionInventory>) => {
    try {
      const { error } = await supabase
        .from('sessions_inventory')
        .update(data)
        .eq('type', type);

      if (error) throw error;

      setInventory(prev => prev.map(inv => 
        inv.type === type ? { ...inv, ...data } : inv
      ));

      return { success: true };
    } catch (err) {
      console.error('Error updating inventory:', err);
      return { success: false, error: 'Erro ao atualizar estoque' };
    }
  };

  const updateCombo = async (comboId: string, data: Partial<SessionCombo>) => {
    try {
      const { error } = await supabase
        .from('session_combos')
        .update(data)
        .eq('id', comboId);

      if (error) throw error;

      setCombos(prev => prev.map(combo => 
        combo.id === comboId ? { ...combo, ...data } : combo
      ));

      return { success: true };
    } catch (err) {
      console.error('Error updating combo:', err);
      return { success: false, error: 'Erro ao atualizar combo' };
    }
  };

  const addCombo = async (type: string, quantity: number, price: number) => {
    try {
      const { data, error } = await supabase
        .from('session_combos')
        .insert({ type, quantity, price, is_popular: false, is_active: true })
        .select()
        .single();

      if (error) throw error;

      setCombos(prev => [...prev, data].sort((a, b) => a.quantity - b.quantity));

      return { success: true, data };
    } catch (err) {
      console.error('Error adding combo:', err);
      return { success: false, error: 'Erro ao adicionar combo' };
    }
  };

  const deleteCombo = async (comboId: string) => {
    try {
      const { error } = await supabase
        .from('session_combos')
        .delete()
        .eq('id', comboId);

      if (error) throw error;

      setCombos(prev => prev.filter(combo => combo.id !== comboId));

      return { success: true };
    } catch (err) {
      console.error('Error deleting combo:', err);
      return { success: false, error: 'Erro ao remover combo' };
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getInventoryByType = (type: string) => inventory.find(i => i.type === type);
  const getCombosByType = (type: string) => combos.filter(c => c.type === type && c.is_active);

  const stats = {
    brasileiras: getInventoryByType('brasileiras'),
    estrangeiras: getInventoryByType('estrangeiras'),
    totalAvailable: inventory.reduce((sum, i) => sum + i.quantity, 0),
  };

  return {
    inventory,
    combos,
    isLoading,
    error,
    refetch: fetchData,
    updateInventory,
    updateCombo,
    addCombo,
    deleteCombo,
    getInventoryByType,
    getCombosByType,
    stats,
  };
};
