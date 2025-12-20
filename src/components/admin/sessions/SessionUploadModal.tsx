import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { X, CheckCircle, XCircle, RefreshCw, Download } from "lucide-react";

interface SessionUploadModalProps {
  isOpen: boolean;
  uploadType: 'brasileiras' | 'estrangeiras';
  selectedFiles: File[];
  isUploading: boolean;
  uploadResult: { success: boolean; totalUploaded: number } | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export const SessionUploadModal = ({
  isOpen,
  uploadType,
  selectedFiles,
  isUploading,
  uploadResult,
  onConfirm,
  onCancel,
}: SessionUploadModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onCancel}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="w-full max-w-md bg-card border border-border rounded-lg p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">
                  Upload {uploadType === 'brasileiras' ? '🇧🇷 Brasileiras' : '🌍 Estrangeiras'}
                </h2>
                <button onClick={onCancel} className="text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {uploadResult ? (
                <div className={cn(
                  "p-4 rounded-lg text-center",
                  uploadResult.success ? "bg-success/10" : "bg-destructive/10"
                )}>
                  {uploadResult.success ? (
                    <>
                      <CheckCircle className="w-10 h-10 text-success mx-auto mb-2" />
                      <p className="text-success font-medium">
                        {uploadResult.totalUploaded} arquivo(s) importado(s) com sucesso!
                      </p>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-10 h-10 text-destructive mx-auto mb-2" />
                      <p className="text-destructive font-medium">Erro ao fazer upload</p>
                    </>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {selectedFiles.length} arquivo(s) selecionado(s)
                    </p>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {selectedFiles.map((file, idx) => (
                        <div key={idx} className="text-xs bg-muted/30 px-2 py-1 rounded flex justify-between">
                          <span className="truncate">{file.name}</span>
                          <span className="text-muted-foreground ml-2">
                            {(file.size / 1024).toFixed(1)}KB
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-3 pt-2">
                    <Button variant="outline" className="flex-1" onClick={onCancel}>
                      Cancelar
                    </Button>
                    <Button 
                      className="flex-1" 
                      onClick={onConfirm}
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          Fazer Upload
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
