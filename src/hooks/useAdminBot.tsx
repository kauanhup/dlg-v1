import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface BotFile {
  id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  version: string;
  is_active: boolean;
  uploaded_at: string;
  updated_at: string;
}

export const useAdminBot = () => {
  const [botFile, setBotFile] = useState<BotFile | null>(null);
  const [botHistory, setBotHistory] = useState<BotFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isActivating, setIsActivating] = useState(false);

  const fetchBotFiles = async () => {
    try {
      // Fetch active bot
      const { data: activeBot, error: activeError } = await supabase
        .from('bot_files')
        .select('*')
        .eq('is_active', true)
        .order('uploaded_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (activeError) throw activeError;
      setBotFile(activeBot);

      // Fetch version history (all bots, ordered by date)
      const { data: history, error: historyError } = await supabase
        .from('bot_files')
        .select('*')
        .order('uploaded_at', { ascending: false });

      if (historyError) throw historyError;
      setBotHistory(history || []);
    } catch (error) {
      console.error('Error fetching bot files:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBotFiles();
  }, []);

  // Check if version already exists
  const versionExists = (version: string): boolean => {
    return botHistory.some(file => file.version === version);
  };

  const uploadBotFile = async (file: File, version: string): Promise<boolean> => {
    // Check for duplicate version
    if (versionExists(version)) {
      toast.error(`Versão ${version} já existe. Use uma versão diferente.`);
      return false;
    }

    setIsUploading(true);
    let uploadedFilePath: string | null = null;
    
    try {
      // Deactivate previous bot files
      const { error: deactivateError } = await supabase
        .from('bot_files')
        .update({ is_active: false })
        .eq('is_active', true);

      if (deactivateError) {
        console.error('Error deactivating previous versions:', deactivateError);
        // Continue anyway - not critical
      }

      // Upload to storage
      const fileName = `DLGConnect_${version}.exe`;
      const filePath = `${Date.now()}_${fileName}`;
      uploadedFilePath = filePath;
      
      const { error: uploadError } = await supabase.storage
        .from('bot-files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Create database record
      const { error: dbError } = await supabase
        .from('bot_files')
        .insert({
          file_name: fileName,
          file_path: filePath,
          file_size: file.size,
          version: version,
          is_active: true
        });

      if (dbError) {
        // Rollback: delete file from storage if DB insert fails
        console.error('DB insert failed, rolling back storage upload:', dbError);
        await supabase.storage.from('bot-files').remove([filePath]);
        throw dbError;
      }

      toast.success('Bot enviado com sucesso!');
      await fetchBotFiles();
      return true;
    } catch (error: any) {
      console.error('Error uploading bot file:', error);
      toast.error('Erro ao enviar arquivo: ' + error.message);
      return false;
    } finally {
      setIsUploading(false);
    }
  };

  const deleteBotFile = async (id: string, filePath: string) => {
    try {
      // Delete from storage first
      const { error: storageError } = await supabase.storage
        .from('bot-files')
        .remove([filePath]);

      if (storageError) {
        console.error('Storage delete error:', storageError);
        // Continue with DB delete even if storage fails (file might not exist)
      }

      // Delete from database
      const { error } = await supabase
        .from('bot_files')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Arquivo removido');
      await fetchBotFiles();
    } catch (error: any) {
      console.error('Error deleting bot file:', error);
      toast.error('Erro ao remover arquivo: ' + error.message);
    }
  };

  const getDownloadUrl = async (filePath?: string): Promise<string | null> => {
    const path = filePath || botFile?.file_path;
    if (!path) {
      toast.error('Arquivo não encontrado');
      return null;
    }
    
    const { data, error } = await supabase.storage
      .from('bot-files')
      .createSignedUrl(path, 3600); // 1 hour expiry
    
    if (error) {
      console.error('Error creating signed URL:', error);
      toast.error('Erro ao gerar link de download');
      return null;
    }
    return data.signedUrl;
  };

  const setActiveVersion = async (id: string): Promise<boolean> => {
    // Prevent race condition with lock
    if (isActivating) {
      toast.error('Aguarde a ativação anterior concluir');
      return false;
    }

    setIsActivating(true);
    try {
      // Deactivate all in a single operation
      const { error: deactivateError } = await supabase
        .from('bot_files')
        .update({ is_active: false })
        .eq('is_active', true);

      if (deactivateError) {
        throw new Error('Erro ao desativar versão anterior: ' + deactivateError.message);
      }

      // Activate selected
      const { error: activateError } = await supabase
        .from('bot_files')
        .update({ is_active: true })
        .eq('id', id);

      if (activateError) {
        // Try to rollback - reactivate the first one in history
        console.error('Activation failed, state may be inconsistent:', activateError);
        throw activateError;
      }

      toast.success('Versão ativada com sucesso!');
      await fetchBotFiles();
      return true;
    } catch (error: any) {
      console.error('Error setting active version:', error);
      toast.error('Erro ao ativar versão: ' + error.message);
      // Refresh to show current state
      await fetchBotFiles();
      return false;
    } finally {
      setIsActivating(false);
    }
  };

  return {
    botFile,
    botHistory,
    isLoading,
    isUploading,
    isActivating,
    uploadBotFile,
    deleteBotFile,
    getDownloadUrl,
    setActiveVersion,
    versionExists,
    refetch: fetchBotFiles
  };
};
