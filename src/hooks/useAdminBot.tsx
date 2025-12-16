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

  const uploadBotFile = async (file: File, version: string) => {
    setIsUploading(true);
    try {
      // Deactivate previous bot files
      await supabase
        .from('bot_files')
        .update({ is_active: false })
        .eq('is_active', true);

      // Upload to storage
      const fileName = `SWEXTRACTOR_${version}.exe`;
      const filePath = `${Date.now()}_${fileName}`;
      
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

      if (dbError) throw dbError;

      toast.success('Bot enviado com sucesso!');
      await fetchBotFiles();
    } catch (error: any) {
      console.error('Error uploading bot file:', error);
      toast.error('Erro ao enviar arquivo: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const deleteBotFile = async (id: string, filePath: string) => {
    try {
      // Delete from storage
      await supabase.storage
        .from('bot-files')
        .remove([filePath]);

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

  const getDownloadUrl = (filePath?: string) => {
    const path = filePath || botFile?.file_path;
    if (!path) return null;
    
    const { data } = supabase.storage
      .from('bot-files')
      .getPublicUrl(path);
    
    return data.publicUrl;
  };

  const setActiveVersion = async (id: string) => {
    try {
      // Deactivate all
      await supabase
        .from('bot_files')
        .update({ is_active: false })
        .eq('is_active', true);

      // Activate selected
      const { error } = await supabase
        .from('bot_files')
        .update({ is_active: true })
        .eq('id', id);

      if (error) throw error;

      toast.success('Versão ativada com sucesso!');
      await fetchBotFiles();
    } catch (error: any) {
      console.error('Error setting active version:', error);
      toast.error('Erro ao ativar versão: ' + error.message);
    }
  };

  return {
    botFile,
    botHistory,
    isLoading,
    isUploading,
    uploadBotFile,
    deleteBotFile,
    getDownloadUrl,
    setActiveVersion,
    refetch: fetchBotFiles
  };
};
