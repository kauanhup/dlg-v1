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

export interface SessionFile {
  id: string;
  file_name: string;
  file_path: string;
  type: string;
  status: 'available' | 'sold' | 'reserved';
  uploaded_at: string;
  sold_at: string | null;
  order_id: string | null;
  user_id: string | null;
}

export const useAdminSessions = () => {
  const [inventory, setInventory] = useState<SessionInventory[]>([]);
  const [combos, setCombos] = useState<SessionCombo[]>([]);
  const [sessionFiles, setSessionFiles] = useState<SessionFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
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

      // Fetch session files
      const { data: filesData, error: filesError } = await supabase
        .from('session_files')
        .select('*')
        .order('uploaded_at', { ascending: false });

      if (filesError) throw filesError;
      setSessionFiles((filesData || []) as SessionFile[]);
    } catch (err) {
      console.error('Error fetching sessions data:', err);
      setError('Erro ao carregar dados de sessions');
    } finally {
      setIsLoading(false);
    }
  };

  const uploadSessionFiles = async (files: File[], type: 'brasileiras' | 'estrangeiras') => {
    setIsUploading(true);
    const results: { success: boolean; fileName: string; error?: string }[] = [];

    try {
      for (const file of files) {
        const timestamp = Date.now();
        const filePath = `${type}/${timestamp}_${file.name}`;

        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from('sessions')
          .upload(filePath, file);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          results.push({ success: false, fileName: file.name, error: uploadError.message });
          continue;
        }

        // Create record in session_files table
        const { error: insertError } = await supabase
          .from('session_files')
          .insert({
            file_name: file.name,
            file_path: filePath,
            type: type,
            status: 'available'
          });

        if (insertError) {
          console.error('Insert error:', insertError);
          // Try to delete the uploaded file if record creation failed
          await supabase.storage.from('sessions').remove([filePath]);
          results.push({ success: false, fileName: file.name, error: insertError.message });
          continue;
        }

        results.push({ success: true, fileName: file.name });
      }

      // Update inventory count
      const successCount = results.filter(r => r.success).length;
      if (successCount > 0) {
        const currentInventory = inventory.find(i => i.type === type);
        if (currentInventory) {
          await supabase
            .from('sessions_inventory')
            .update({ quantity: currentInventory.quantity + successCount })
            .eq('type', type);
        } else {
          // Create inventory record if it doesn't exist
          await supabase
            .from('sessions_inventory')
            .insert({ type, quantity: successCount, cost_per_session: 0, sale_price_per_session: 0 });
        }
      }

      // Refetch data
      await fetchData();

      return { 
        success: results.every(r => r.success), 
        results,
        totalUploaded: successCount
      };
    } catch (err) {
      console.error('Error uploading files:', err);
      return { success: false, results, error: 'Erro ao fazer upload dos arquivos' };
    } finally {
      setIsUploading(false);
    }
  };

  const deleteSessionFile = async (fileId: string, filePath: string) => {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('sessions')
        .remove([filePath]);

      if (storageError) {
        console.error('Storage delete error:', storageError);
        // Continue anyway to delete the record
      }

      // Get file type before deleting
      const file = sessionFiles.find(f => f.id === fileId);
      const fileType = file?.type;

      // Delete record
      const { error: deleteError } = await supabase
        .from('session_files')
        .delete()
        .eq('id', fileId);

      if (deleteError) throw deleteError;

      // Update inventory count
      if (fileType) {
        const currentInventory = inventory.find(i => i.type === fileType);
        if (currentInventory && currentInventory.quantity > 0) {
          await supabase
            .from('sessions_inventory')
            .update({ quantity: currentInventory.quantity - 1 })
            .eq('type', fileType);
        }
      }

      // Update local state
      setSessionFiles(prev => prev.filter(f => f.id !== fileId));
      await fetchData();

      return { success: true };
    } catch (err) {
      console.error('Error deleting session file:', err);
      return { success: false, error: 'Erro ao excluir arquivo' };
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
  const getFilesByType = (type: string) => sessionFiles.filter(f => f.type === type);
  const getAvailableFilesByType = (type: string) => sessionFiles.filter(f => f.type === type && f.status === 'available');

  const stats = {
    brasileiras: getInventoryByType('brasileiras'),
    estrangeiras: getInventoryByType('estrangeiras'),
    totalAvailable: sessionFiles.filter(f => f.status === 'available').length,
    totalBrasileiras: getAvailableFilesByType('brasileiras').length,
    totalEstrangeiras: getAvailableFilesByType('estrangeiras').length,
  };

  return {
    inventory,
    combos,
    sessionFiles,
    isLoading,
    isUploading,
    error,
    refetch: fetchData,
    uploadSessionFiles,
    deleteSessionFile,
    updateInventory,
    updateCombo,
    addCombo,
    deleteCombo,
    getInventoryByType,
    getCombosByType,
    getFilesByType,
    getAvailableFilesByType,
    stats,
  };
};
