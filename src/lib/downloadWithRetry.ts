import { toast } from 'sonner';

export async function downloadWithRetry(
  url: string,
  filename: string,
  maxAttempts: number = 3
): Promise<boolean> {
  let attempt = 0;
  
  while (attempt < maxAttempts) {
    try {
      attempt++;
      
      if (attempt > 1) {
        toast.loading(`Tentativa ${attempt}/${maxAttempts}...`, { id: 'download-retry' });
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
      toast.dismiss('download-retry');
      toast.success('Download concluído!');
      return true;
      
    } catch (error) {
      console.error(`Tentativa ${attempt} falhou:`, error);
      
      if (attempt === maxAttempts) {
        toast.dismiss('download-retry');
        toast.error('Falha no download após 3 tentativas', {
          description: 'Verifique sua conexão e tente novamente',
          action: {
            label: 'Tentar Novamente',
            onClick: () => downloadWithRetry(url, filename, maxAttempts)
          }
        });
        return false;
      }
      
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
    }
  }
  
  return false;
}

export async function downloadBlobWithRetry(
  blob: Blob,
  filename: string
): Promise<boolean> {
  try {
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
    
    toast.success('Download concluído!');
    return true;
  } catch (error) {
    console.error('Download failed:', error);
    toast.error('Falha no download', {
      description: 'Verifique sua conexão e tente novamente'
    });
    return false;
  }
}