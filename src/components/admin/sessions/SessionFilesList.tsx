import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Package, Trash2, AlertCircle } from "lucide-react";
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

  return (
    <div className="bg-card border border-border rounded-lg p-5">
      <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
        <Package className="w-4 h-4 text-primary" />
        Arquivos de Session ({files.length})
      </h3>
      
      {files.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Package className="w-10 h-10 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Nenhum arquivo importado ainda</p>
          <p className="text-xs">Use o botão "Importar Sessions" para adicionar arquivos</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {files.slice(0, 50).map((file) => (
            <div key={file.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-lg">{file.type === 'brasileiras' ? '🇧🇷' : '🌍'}</span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{file.file_name}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(file.uploaded_at)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn(
                  "text-xs px-2 py-1 rounded-md",
                  file.status === 'available' ? "bg-success/10 text-success" :
                  file.status === 'sold' ? "bg-muted text-muted-foreground" :
                  "bg-warning/10 text-warning"
                )}>
                  {file.status === 'available' ? 'Disponível' : file.status === 'sold' ? 'Vendido' : 'Reservado'}
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
                          {isDeleting === file.id ? "..." : "Confirmar"}
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
            </div>
          ))}
          {files.length > 50 && (
            <p className="text-xs text-center text-muted-foreground pt-2">
              Mostrando 50 de {files.length} arquivos
            </p>
          )}
        </div>
      )}
    </div>
  );
};
