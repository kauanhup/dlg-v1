import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Package } from "lucide-react";
import { SessionCombo } from "@/hooks/useAdminSessions";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface SessionCombosSectionProps {
  title: string;
  icon: LucideIcon;
  combos: SessionCombo[];
  comboEdits: Record<string, { quantity: string; price: string }>;
  onComboEdit: (comboId: string, field: 'quantity' | 'price', value: string) => void;
  onAddCombo: () => void;
  onDeleteCombo: (comboId: string) => void;
}

export const SessionCombosSection = ({
  title,
  icon: Icon,
  combos,
  comboEdits,
  onComboEdit,
  onAddCombo,
  onDeleteCombo,
}: SessionCombosSectionProps) => {
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleDeleteClick = (comboId: string) => {
    setDeleteConfirm(comboId);
  };

  const handleConfirmDelete = (comboId: string) => {
    onDeleteCombo(comboId);
    setDeleteConfirm(null);
  };

  const handleCancelDelete = () => {
    setDeleteConfirm(null);
  };

  const isBrasileiras = title.includes('Brasileiras');

  return (
    <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className={cn(
          "w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center",
          isBrasileiras ? "bg-success/10" : "bg-primary/10"
        )}>
          <Icon className={cn("w-4 h-4", isBrasileiras ? "text-success" : "text-primary")} />
        </div>
        <div className="flex-1">
          <h3 className="text-sm sm:text-base font-semibold text-foreground">{title}</h3>
          <p className="text-xs text-muted-foreground">{combos.length} combos configurados</p>
        </div>
        <Button size="sm" variant="outline" onClick={onAddCombo}>
          <Plus className="w-4 h-4 mr-1" /> Adicionar
        </Button>
      </div>

      <div className="space-y-2 sm:space-y-3">
        {combos.length === 0 ? (
          <div className="text-center py-6 sm:py-8 bg-muted/30 rounded-lg border border-dashed border-border">
            <Package className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
            <p className="text-xs sm:text-sm text-muted-foreground">
              Nenhum combo configurado
            </p>
            <p className="text-[10px] sm:text-xs text-muted-foreground/70 mt-1">
              Clique em "Adicionar" para criar um combo
            </p>
          </div>
        ) : (
          combos.map((combo, index) => (
            <motion.div 
              key={combo.id} 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex flex-col xs:flex-row xs:items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-muted/30 rounded-lg border border-transparent hover:border-border/50 transition-colors"
            >
              <div className="flex-1 grid grid-cols-2 gap-2 sm:gap-3">
                <div>
                  <label className="text-[10px] sm:text-xs text-muted-foreground mb-1.5 block font-medium">
                    Quantidade
                  </label>
                  <input
                    type="number"
                    value={comboEdits[combo.id]?.quantity ?? combo.quantity.toString()}
                    onChange={(e) => onComboEdit(combo.id, 'quantity', e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    min="1"
                    aria-label={`Quantidade do combo ${index + 1}`}
                  />
                </div>
                <div>
                  <label className="text-[10px] sm:text-xs text-muted-foreground mb-1.5 block font-medium">
                    Preço (R$)
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={comboEdits[combo.id]?.price ?? combo.price.toFixed(2)}
                    onChange={(e) => onComboEdit(combo.id, 'price', e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    aria-label={`Preço do combo ${index + 1}`}
                  />
                </div>
              </div>
              
              <div className="flex justify-end xs:justify-center pt-1 xs:pt-0">
                {deleteConfirm === combo.id ? (
                  <div className="flex items-center gap-2">
                    <Button 
                      size="sm" 
                      variant="destructive"
                      className="h-9 px-4 text-sm font-medium"
                      onClick={() => handleConfirmDelete(combo.id)}
                      aria-label="Confirmar exclusão do combo"
                    >
                      Excluir
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="h-9 px-4 text-sm"
                      onClick={handleCancelDelete}
                      aria-label="Cancelar exclusão"
                    >
                      Cancelar
                    </Button>
                  </div>
                ) : (
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-9 w-9 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => handleDeleteClick(combo.id)}
                    aria-label={`Excluir combo de ${combo.quantity} sessions`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};
