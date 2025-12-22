import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Package, Trash2, FileText, Clock } from "lucide-react";
import { SessionFile } from "@/hooks/useAdminSessions";
import { motion, AnimatePresence } from "framer-motion";

interface SessionFilesListProps {
  files: SessionFile[];
  onDelete: (fileId: string, filePath: string) => Promise<void>;
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pt-BR', { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const SessionFilesList = ({ files, onDelete }: SessionFilesListProps) => {
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDeleteClick = (fileId: string) => {
    setDeleteConfirm(fileId);
  };

  const handleConfirmDelete = async (fileId: string, filePath: string) => {
    setIsDeleting(fileId);
    try {
      await onDelete(fileId, filePath);
    } finally {
      setIsDeleting(null);
      setDeleteConfirm(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirm(null);
  };

  const availableFiles = files.filter(f => f.status === 'available').length;
  const soldFiles = files.filter(f => f.status === 'sold').length;

  return (
    <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 sm:w-9 sm:h-9 bg-primary/10 rounded-lg flex items-center justify-center">
          <FileText className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm sm:text-base font-semibold text-foreground">
            Arquivos de Session
          </h3>
          <p className="text-xs text-muted-foreground">
            {availableFiles} disponíveis • {soldFiles} vendidos • {files.length} total
          </p>
        </div>
      </div>
      
      {files.length === 0 ? (
        <div className="text-center py-8 sm:py-12 bg-muted/30 rounded-lg border border-dashed border-border">
          <Package className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 text-muted-foreground/50" />
          <p className="text-sm font-medium text-muted-foreground">Nenhum arquivo importado</p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            Use o botão "Importar Sessions" para adicionar arquivos
          </p>
        </div>
      ) : (
        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {files.slice(0, 50).map((file) => (
            <motion.div 
              key={file.id} 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col xs:flex-row xs:items-center justify-between p-3 sm:p-4 bg-muted/30 rounded-lg gap-2 hover:bg-muted/50 transition-colors border border-transparent hover:border-border/50"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className={cn(
                  "w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-lg",
                  file.type === 'brasileiras' ? "bg-success/10" : "bg-primary/10"
                )}>
                  {file.type === 'brasileiras' ? '🇧🇷' : '🌍'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-foreground truncate">{file.file_name}</p>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <p className="text-[10px] sm:text-xs">{formatDate(file.uploaded_at)}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 justify-end">
                <span className={cn(
                  "text-[10px] sm:text-xs px-2 py-1 rounded-md font-medium whitespace-nowrap",
                  file.status === 'available' ? "bg-success/10 text-success border border-success/20" :
                  file.status === 'sold' ? "bg-muted text-muted-foreground border border-border" :
                  "bg-warning/10 text-warning border border-warning/20"
                )}>
                  {file.status === 'available' ? '✓ Disponível' : file.status === 'sold' ? 'Vendido' : 'Reservado'}
                </span>
                
                {file.status === 'available' && (
                  <>
                    {deleteConfirm === file.id ? (
                      <div className="flex items-center gap-1">
                        <Button 
                          size="sm" 
                          variant="destructive"
                          className="h-7 px-2 text-xs"
                          onClick={() => handleConfirmDelete(file.id, file.file_path)}
                          disabled={isDeleting === file.id}
                        >
                          {isDeleting === file.id ? "..." : "Sim"}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          className="h-7 px-2 text-xs"
                          onClick={handleCancelDelete}
                          disabled={isDeleting === file.id}
                        >
                          Não
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeleteClick(file.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          ))}
          {files.length > 50 && (
            <p className="text-xs text-center text-muted-foreground pt-3 border-t border-border mt-3">
              Mostrando 50 de {files.length} arquivos
            </p>
          )}
        </div>
      )}
    </div>
  );
};
