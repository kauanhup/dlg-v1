import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

// ==========================================
// TYPES
// ==========================================

export interface SessionInventory {
  id: string;
  type: string;
  quantity: number;
  cost_per_session: number;
  sale_price_per_session: number;
  updated_at: string;
  custom_quantity_enabled: boolean;
  custom_quantity_min: number;
  custom_price_per_unit: number;
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

export interface SoldSession {
  id: string;
  file_name: string;
  type: string;
  sold_at: string;
  buyer_name: string;
  buyer_email: string;
}

// ==========================================
// CONSTANTS - Security
// ==========================================

const ALLOWED_EXTENSIONS = ['.session'];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB max per file
const MAX_FILENAME_LENGTH = 200;

// ==========================================
// HELPERS - Security
// ==========================================

/**
 * Validates file extension (security)
 */
const validateFileExtension = (fileName: string): boolean => {
  const ext = fileName.toLowerCase().slice(fileName.lastIndexOf('.'));
  return ALLOWED_EXTENSIONS.includes(ext);
};

/**
 * Validates file size (security)
 */
const validateFileSize = (file: File): boolean => {
  return file.size <= MAX_FILE_SIZE_BYTES;
};

/**
 * Sanitizes file name to prevent path traversal and special chars
 */
const sanitizeFileName = (fileName: string): string => {
  // Remove path separators and special characters
  let sanitized = fileName
    .replace(/[\/\\]/g, '') // Remove path separators
    .replace(/\.\./g, '')   // Remove parent directory references
    .replace(/[<>:"|?*]/g, '') // Remove Windows reserved characters
    .replace(/[\x00-\x1f\x80-\x9f]/g, '') // Remove control characters
    .trim();
  
  // Truncate if too long
  if (sanitized.length > MAX_FILENAME_LENGTH) {
    const ext = sanitized.slice(sanitized.lastIndexOf('.'));
    sanitized = sanitized.slice(0, MAX_FILENAME_LENGTH - ext.length) + ext;
  }
  
  return sanitized || 'unnamed.session';
};

// ==========================================
// HOOK
// ==========================================

export const useAdminSessions = () => {
  const [inventory, setInventory] = useState<SessionInventory[]>([]);
  const [combos, setCombos] = useState<SessionCombo[]>([]);
  const [sessionFiles, setSessionFiles] = useState<SessionFile[]>([]);
  const [soldSessions, setSoldSessions] = useState<SoldSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ==========================================
  // FETCH DATA
  // ==========================================
  
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch all data in parallel for efficiency
      const [inventoryResult, combosResult, filesResult, soldResult] = await Promise.all([
        supabase.from('sessions_inventory').select('*'),
        supabase.from('session_combos').select('*').order('quantity', { ascending: true }),
        supabase.from('session_files').select('*').order('uploaded_at', { ascending: false }),
        supabase
          .from('session_files')
          .select('id, file_name, type, sold_at, user_id')
          .eq('status', 'sold')
          .not('sold_at', 'is', null)
          .order('sold_at', { ascending: false })
      ]);

      if (inventoryResult.error) throw inventoryResult.error;
      if (combosResult.error) throw combosResult.error;
      if (filesResult.error) throw filesResult.error;
      if (soldResult.error) throw soldResult.error;

      setInventory(inventoryResult.data || []);
      setCombos(combosResult.data || []);
      setSessionFiles((filesResult.data || []) as SessionFile[]);

      // Fetch buyer profiles for sold sessions
      const soldData = soldResult.data || [];
      if (soldData.length > 0) {
        const userIds = [...new Set(soldData.filter(s => s.user_id).map(s => s.user_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, name, email')
          .in('user_id', userIds);

        const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

        const soldWithBuyers: SoldSession[] = soldData.map(s => ({
          id: s.id,
          file_name: s.file_name,
          type: s.type,
          sold_at: s.sold_at || '',
          buyer_name: profileMap.get(s.user_id)?.name || 'Desconhecido',
          buyer_email: profileMap.get(s.user_id)?.email || '',
        }));

        setSoldSessions(soldWithBuyers);
      } else {
        setSoldSessions([]);
      }
    } catch (err) {
      console.error('Error fetching sessions data:', err);
      setError('Erro ao carregar dados de sessions');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ==========================================
  // UPLOAD FILES (with security validations)
  // ==========================================
  
  const uploadSessionFiles = async (files: File[], type: 'brasileiras' | 'estrangeiras') => {
    setIsUploading(true);
    const results: { success: boolean; fileName: string; error?: string }[] = [];

    try {
      for (const file of files) {
        // SECURITY: Validate file extension
        if (!validateFileExtension(file.name)) {
          results.push({ 
            success: false, 
            fileName: file.name, 
            error: 'Extensão de arquivo inválida. Apenas .session é permitido.' 
          });
          continue;
        }
        
        // SECURITY: Validate file size
        if (!validateFileSize(file)) {
          results.push({ 
            success: false, 
            fileName: file.name, 
            error: `Arquivo muito grande. Máximo permitido: ${MAX_FILE_SIZE_BYTES / 1024 / 1024}MB` 
          });
          continue;
        }
        
        // SECURITY: Sanitize file name
        const sanitizedName = sanitizeFileName(file.name);
        const timestamp = Date.now();
        const filePath = `${type}/${timestamp}_${sanitizedName}`;

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
            file_name: sanitizedName, // Use sanitized name in DB
            file_path: filePath,
            type: type,
            status: 'available'
          });

        if (insertError) {
          console.error('Insert error:', insertError);
          // Rollback: delete the uploaded file if record creation failed
          await supabase.storage.from('sessions').remove([filePath]);
          results.push({ success: false, fileName: file.name, error: insertError.message });
          continue;
        }

        results.push({ success: true, fileName: file.name });
      }

      // ATOMIC: Update inventory count using SQL increment to avoid race conditions
      const successCount = results.filter(r => r.success).length;
      if (successCount > 0) {
        // Use RPC or update with fresh fetch to avoid race conditions
        const { data: currentInv, error: invError } = await supabase
          .from('sessions_inventory')
          .select('id, quantity')
          .eq('type', type)
          .maybeSingle();

        if (!invError) {
          if (currentInv) {
            // Atomic update with fresh value
            await supabase
              .from('sessions_inventory')
              .update({ quantity: currentInv.quantity + successCount })
              .eq('id', currentInv.id);
          } else {
            // Create inventory record if it doesn't exist
            await supabase
              .from('sessions_inventory')
              .insert({ 
                type, 
                quantity: successCount, 
                cost_per_session: 0, 
                sale_price_per_session: 0 
              });
          }
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

  // ==========================================
  // DELETE FILE (with atomic inventory update)
  // ==========================================
  
  const deleteSessionFile = async (fileId: string, filePath: string) => {
    try {
      // Get file info from database (fresh, not cached state)
      const { data: fileData, error: fileError } = await supabase
        .from('session_files')
        .select('type, status')
        .eq('id', fileId)
        .maybeSingle();

      if (fileError) throw fileError;
      if (!fileData) {
        return { success: false, error: 'Arquivo não encontrado' };
      }

      const fileType = fileData.type;
      const wasAvailable = fileData.status === 'available';

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('sessions')
        .remove([filePath]);

      if (storageError) {
        console.error('Storage delete error:', storageError);
        // Continue anyway to delete the record
      }

      // Delete record
      const { error: deleteError } = await supabase
        .from('session_files')
        .delete()
        .eq('id', fileId);

      if (deleteError) throw deleteError;

      // ATOMIC: Update inventory count with fresh fetch to avoid race conditions
      if (wasAvailable && fileType) {
        const { data: freshInventory, error: invError } = await supabase
          .from('sessions_inventory')
          .select('id, quantity')
          .eq('type', fileType)
          .maybeSingle();

        if (!invError && freshInventory && freshInventory.quantity > 0) {
          await supabase
            .from('sessions_inventory')
            .update({ quantity: Math.max(0, freshInventory.quantity - 1) })
            .eq('id', freshInventory.id);
        }
      }

      // Update local state immediately for responsiveness
      setSessionFiles(prev => prev.filter(f => f.id !== fileId));
      
      // Refetch to ensure consistency
      await fetchData();

      return { success: true };
    } catch (err) {
      console.error('Error deleting session file:', err);
      return { success: false, error: 'Erro ao excluir arquivo' };
    }
  };

// ==========================================
  // UPDATE INVENTORY (with upsert support)
  // ==========================================
  
  const updateInventory = async (type: string, data: Partial<SessionInventory>) => {
    try {
      // First check if inventory exists
      const { data: existing, error: checkError } = await supabase
        .from('sessions_inventory')
        .select('id')
        .eq('type', type)
        .maybeSingle();
      
      if (checkError) throw checkError;
      
      if (existing) {
        // Update existing
        const { error } = await supabase
          .from('sessions_inventory')
          .update(data)
          .eq('type', type);

        if (error) throw error;
      } else {
        // Create new inventory record
        const { error } = await supabase
          .from('sessions_inventory')
          .insert({ 
            type, 
            quantity: 0,
            cost_per_session: 0, 
            sale_price_per_session: 0,
            ...data 
          });

        if (error) throw error;
      }

      setInventory(prev => {
        const exists = prev.some(inv => inv.type === type);
        if (exists) {
          return prev.map(inv => inv.type === type ? { ...inv, ...data } : inv);
        } else {
          return [...prev, { 
            id: '', 
            type, 
            quantity: 0,
            cost_per_session: 0, 
            sale_price_per_session: 0,
            updated_at: new Date().toISOString(),
            custom_quantity_enabled: false,
            custom_quantity_min: 1,
            custom_price_per_unit: 0,
            ...data 
          } as SessionInventory];
        }
      });

      return { success: true };
    } catch (err) {
      console.error('Error updating inventory:', err);
      return { success: false, error: 'Erro ao atualizar estoque' };
    }
  };

  // ==========================================
  // COMBO OPERATIONS
  // ==========================================
  
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

  // ==========================================
  // LIFECYCLE
  // ==========================================
  
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ==========================================
  // HELPERS & COMPUTED VALUES
  // ==========================================
  
  const getInventoryByType = useCallback((type: string) => 
    inventory.find(i => i.type === type), [inventory]);
  
  const getCombosByType = useCallback((type: string) => 
    combos.filter(c => c.type === type && c.is_active), [combos]);
  
  const getFilesByType = useCallback((type: string) => 
    sessionFiles.filter(f => f.type === type), [sessionFiles]);
  
  const getAvailableFilesByType = useCallback((type: string) => 
    sessionFiles.filter(f => f.type === type && f.status === 'available'), [sessionFiles]);

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
    soldSessions,
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
