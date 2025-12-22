import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { SessionCombo } from "@/hooks/useAdminSessions";
import { LucideIcon } from "lucide-react";

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

  return (
    <div className="bg-card border border-border rounded-lg p-3 sm:p-5">
      <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2 mb-3 sm:mb-4">
        <h3 className="font-semibold text-foreground flex items-center gap-2 text-sm sm:text-base">
          <Icon className="w-4 h-4 text-primary" />
          {title}
        </h3>
        <Button size="sm" variant="outline" onClick={onAddCombo} className="w-full xs:w-auto">
          <Plus className="w-4 h-4 mr-1" /> Adicionar
        </Button>
      </div>
      <div className="space-y-2 sm:space-y-3">
        {combos.length === 0 ? (
          <p className="text-xs sm:text-sm text-muted-foreground text-center py-4">
            Nenhum combo configurado
          </p>
        ) : (
          combos.map((combo) => (
            <div key={combo.id} className="flex flex-col xs:flex-row xs:items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-muted/30 rounded-lg">
              <div className="flex-1 grid grid-cols-2 gap-2 sm:gap-3">
                <div>
                  <label className="text-[10px] sm:text-xs text-muted-foreground mb-1 block">Quantidade</label>
                  <input
                    type="number"
                    value={comboEdits[combo.id]?.quantity ?? combo.quantity.toString()}
                    onChange={(e) => onComboEdit(combo.id, 'quantity', e.target.value)}
                    className="w-full px-2 py-1 sm:py-1.5 text-xs sm:text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                    min="1"
                  />
                </div>
                <div>
                  <label className="text-[10px] sm:text-xs text-muted-foreground mb-1 block">Preço (R$)</label>
                  <input
                    type="text"
                    value={comboEdits[combo.id]?.price ?? combo.price.toFixed(2)}
                    onChange={(e) => onComboEdit(combo.id, 'price', e.target.value)}
                    className="w-full px-2 py-1 sm:py-1.5 text-xs sm:text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>
              
              <div className="flex justify-end xs:justify-center">
                {deleteConfirm === combo.id ? (
                  <div className="flex items-center gap-1">
                    <Button 
                      size="sm" 
                      variant="destructive"
                      className="h-6 sm:h-7 px-1.5 sm:px-2 text-[10px] sm:text-xs"
                      onClick={() => handleConfirmDelete(combo.id)}
                    >
                      Sim
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      className="h-6 sm:h-7 px-1.5 sm:px-2 text-[10px] sm:text-xs"
                      onClick={handleCancelDelete}
                    >
                      Não
                    </Button>
                  </div>
                ) : (
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-7 w-7 sm:h-8 sm:w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => handleDeleteClick(combo.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
