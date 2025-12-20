import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAdminSessions, SessionCombo } from "@/hooks/useAdminSessions";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";
import {
  DollarSign,
  Package,
  Save,
  RefreshCw,
  Plus,
  Globe,
  TrendingUp,
} from "lucide-react";

// Sub-components
import { SessionStatsCards } from "./SessionStatsCards";
import { SessionFilesList } from "./SessionFilesList";
import { SessionCombosSection } from "./SessionCombosSection";
import { SessionSalesHistory } from "./SessionSalesHistory";
import { SessionTypeSelectorModal } from "./SessionTypeSelectorModal";
import { SessionUploadModal } from "./SessionUploadModal";
import { SessionCustomQuantitySection } from "./SessionCustomQuantitySection";
import { SessionCostSection } from "./SessionCostSection";

const fadeIn = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 }
};

export const SessionsSection = () => {
  const { 
    inventory, 
    combos: dbCombos, 
    sessionFiles,
    soldSessions,
    isLoading, 
    isUploading,
    uploadSessionFiles,
    deleteSessionFile,
    updateInventory, 
    updateCombo: updateDbCombo, 
    addCombo: addDbCombo, 
    deleteCombo,
    getCombosByType,
    getFilesByType,
    stats,
    refetch
  } = useAdminSessions();
  
  // Modal states
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadType, setUploadType] = useState<'brasileiras' | 'estrangeiras'>('brasileiras');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadResult, setUploadResult] = useState<{ success: boolean; totalUploaded: number } | null>(null);
  
  // Form states
  const [isSaving, setIsSaving] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [costBrasileiras, setCostBrasileiras] = useState("");
  const [costEstrangeiras, setCostEstrangeiras] = useState("");
  
  // Combo edits - using ref to track initialization
  const [comboEdits, setComboEdits] = useState<Record<string, { quantity: string; price: string }>>({});
  const initializedCombosRef = useRef<Set<string>>(new Set());
  
  // Custom quantity settings
  const [customQtyBrEnabled, setCustomQtyBrEnabled] = useState(false);
  const [customQtyBrMin, setCustomQtyBrMin] = useState("1");
  const [customQtyBrPrice, setCustomQtyBrPrice] = useState("0.00");
  const [customQtyEstEnabled, setCustomQtyEstEnabled] = useState(false);
  const [customQtyEstMin, setCustomQtyEstMin] = useState("1");
  const [customQtyEstPrice, setCustomQtyEstPrice] = useState("0.00");

  // Initialize inventory state from DB (runs once when stats change)
  useEffect(() => {
    if (stats.brasileiras) {
      setCostBrasileiras(stats.brasileiras.cost_per_session?.toFixed(2) || "0.00");
      setCustomQtyBrEnabled(stats.brasileiras.custom_quantity_enabled || false);
      setCustomQtyBrMin(String(stats.brasileiras.custom_quantity_min || 1));
      setCustomQtyBrPrice((stats.brasileiras.custom_price_per_unit || 0).toFixed(2));
    }
    if (stats.estrangeiras) {
      setCostEstrangeiras(stats.estrangeiras.cost_per_session?.toFixed(2) || "0.00");
      setCustomQtyEstEnabled(stats.estrangeiras.custom_quantity_enabled || false);
      setCustomQtyEstMin(String(stats.estrangeiras.custom_quantity_min || 1));
      setCustomQtyEstPrice((stats.estrangeiras.custom_price_per_unit || 0).toFixed(2));
    }
  }, [stats.brasileiras, stats.estrangeiras]);

  // Initialize combo edits only for NEW combos (fixes useEffect loop bug)
  useEffect(() => {
    const newEdits: Record<string, { quantity: string; price: string }> = {};
    let hasNew = false;
    
    dbCombos.forEach(combo => {
      if (!initializedCombosRef.current.has(combo.id)) {
        newEdits[combo.id] = { 
          quantity: combo.quantity.toString(), 
          price: combo.price.toFixed(2) 
        };
        initializedCombosRef.current.add(combo.id);
        hasNew = true;
      }
    });
    
    if (hasNew) {
      setComboEdits(prev => ({ ...prev, ...newEdits }));
    }
  }, [dbCombos]);

  // Computed values
  const brasileirasCombos = getCombosByType('brasileiras');
  const estrangeirasCombos = getCombosByType('estrangeiras');

  // ==========================================
  // HANDLERS
  // ==========================================

  const handleSelectType = (type: 'brasileiras' | 'estrangeiras') => {
    setUploadType(type);
    setShowTypeSelector(false);
    document.getElementById('session-upload')?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFiles(Array.from(files));
      setShowUploadModal(true);
    }
    e.target.value = '';
  };

  const handleConfirmUpload = async () => {
    if (selectedFiles.length === 0) return;
    
    const result = await uploadSessionFiles(selectedFiles, uploadType);
    setUploadResult({ success: result.success, totalUploaded: result.totalUploaded || 0 });
    
    if (result.success) {
      toast.success(`${result.totalUploaded} arquivo(s) importado(s) com sucesso!`);
      setTimeout(() => {
        setShowUploadModal(false);
        setSelectedFiles([]);
        setUploadResult(null);
      }, 2000);
    } else {
      toast.error("Erro ao fazer upload de alguns arquivos");
    }
  };

  const handleCancelUpload = () => {
    setShowUploadModal(false);
    setSelectedFiles([]);
    setUploadResult(null);
  };

  const handleComboEdit = useCallback((comboId: string, field: 'quantity' | 'price', value: string) => {
    setComboEdits(prev => ({
      ...prev,
      [comboId]: { ...prev[comboId], [field]: value }
    }));
  }, []);

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      // Parse values
      const costBrValue = parseFloat(costBrasileiras.replace(',', '.')) || 0;
      const costEstValue = parseFloat(costEstrangeiras.replace(',', '.')) || 0;
      const customBrMin = parseInt(customQtyBrMin) || 1;
      const customBrPrice = parseFloat(customQtyBrPrice.replace(',', '.')) || 0;
      const customEstMin = parseInt(customQtyEstMin) || 1;
      const customEstPrice = parseFloat(customQtyEstPrice.replace(',', '.')) || 0;
      
      // Save inventory settings in parallel
      await Promise.all([
        updateInventory('brasileiras', { 
          cost_per_session: costBrValue,
          custom_quantity_enabled: customQtyBrEnabled,
          custom_quantity_min: customBrMin,
          custom_price_per_unit: customBrPrice
        }),
        updateInventory('estrangeiras', { 
          cost_per_session: costEstValue,
          custom_quantity_enabled: customQtyEstEnabled,
          custom_quantity_min: customEstMin,
          custom_price_per_unit: customEstPrice
        })
      ]);

      // Validate and save combo edits in parallel
      const comboUpdates = Object.entries(comboEdits)
        .filter(([_, edit]) => {
          const quantity = parseInt(edit.quantity) || 0;
          const price = parseFloat(edit.price.replace(',', '.')) || 0;
          return quantity > 0 && price >= 0; // Only save valid combos
        })
        .map(([comboId, edit]) => {
          const quantity = parseInt(edit.quantity) || 0;
          const price = parseFloat(edit.price.replace(',', '.')) || 0;
          return updateDbCombo(comboId, { quantity, price });
        });
      
      await Promise.all(comboUpdates);

      toast.success("Configurações salvas com sucesso!");
    } catch (error) {
      console.error('Save error:', error);
      toast.error("Erro ao salvar configurações");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast.success("Dados atualizados!");
    } catch (error) {
      toast.error("Erro ao atualizar dados");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleAddCombo = async (type: string) => {
    const result = await addDbCombo(type, 10, 49.90);
    if (result.success) {
      toast.success("Combo adicionado!");
    } else {
      toast.error("Erro ao adicionar combo");
    }
  };

  const handleDeleteCombo = async (comboId: string) => {
    const result = await deleteCombo(comboId);
    if (result.success) {
      // Clean up local state
      setComboEdits(prev => {
        const newEdits = { ...prev };
        delete newEdits[comboId];
        return newEdits;
      });
      initializedCombosRef.current.delete(comboId);
      toast.success("Combo removido!");
    } else {
      toast.error("Erro ao remover combo");
    }
  };

  const handleDeleteFile = async (fileId: string, filePath: string) => {
    const result = await deleteSessionFile(fileId, filePath);
    if (result.success) {
      toast.success("Arquivo excluído!");
    } else {
      toast.error(result.error || "Erro ao excluir arquivo");
    }
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <motion.div {...fadeIn} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Sessions</h1>
          <p className="text-sm text-muted-foreground">Gerenciar estoque de sessions importadas (.session)</p>
        </div>
        <div className="flex gap-2">
          <input
            type="file"
            accept=".session"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            id="session-upload"
          />
          <Button 
            size="sm" 
            variant="outline" 
            onClick={handleRefresh} 
            disabled={isRefreshing || isLoading}
          >
            <RefreshCw className={cn("w-4 h-4 mr-2", isRefreshing && "animate-spin")} />
            Atualizar
          </Button>
          <Button size="sm" disabled={isUploading} onClick={() => setShowTypeSelector(true)}>
            <Plus className="w-4 h-4 mr-2" /> Importar Sessions
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
          <span className="ml-3 text-muted-foreground">Carregando dados...</span>
        </div>
      )}

      {/* Modals */}
      <SessionTypeSelectorModal 
        isOpen={showTypeSelector}
        onClose={() => setShowTypeSelector(false)}
        onSelect={handleSelectType}
      />
      
      <SessionUploadModal
        isOpen={showUploadModal}
        uploadType={uploadType}
        selectedFiles={selectedFiles}
        isUploading={isUploading}
        uploadResult={uploadResult}
        onConfirm={handleConfirmUpload}
        onCancel={handleCancelUpload}
      />

      {/* Content - only show when not loading */}
      {!isLoading && (
        <>
          {/* Stats Cards */}
          <SessionStatsCards 
            stats={stats} 
            totalFiles={sessionFiles.length} 
          />

          {/* Session Files List */}
          <SessionFilesList 
            files={sessionFiles}
            onDelete={handleDeleteFile}
          />

          {/* Cost Section */}
          <SessionCostSection
            costBrasileiras={costBrasileiras}
            costEstrangeiras={costEstrangeiras}
            onCostBrasileirasChange={setCostBrasileiras}
            onCostEstrangeirasChange={setCostEstrangeiras}
          />

          {/* Custom Quantity Section */}
          <SessionCustomQuantitySection
            customQtyBrEnabled={customQtyBrEnabled}
            customQtyBrMin={customQtyBrMin}
            customQtyBrPrice={customQtyBrPrice}
            customQtyEstEnabled={customQtyEstEnabled}
            customQtyEstMin={customQtyEstMin}
            customQtyEstPrice={customQtyEstPrice}
            onCustomQtyBrEnabledChange={setCustomQtyBrEnabled}
            onCustomQtyBrMinChange={setCustomQtyBrMin}
            onCustomQtyBrPriceChange={setCustomQtyBrPrice}
            onCustomQtyEstEnabledChange={setCustomQtyEstEnabled}
            onCustomQtyEstMinChange={setCustomQtyEstMin}
            onCustomQtyEstPriceChange={setCustomQtyEstPrice}
          />

          {/* Combos Brasileiras */}
          <SessionCombosSection
            title="Combos Sessions Brasileiras"
            icon={Package}
            combos={brasileirasCombos}
            comboEdits={comboEdits}
            onComboEdit={handleComboEdit}
            onAddCombo={() => handleAddCombo('brasileiras')}
            onDeleteCombo={handleDeleteCombo}
          />

          {/* Combos Estrangeiras */}
          <SessionCombosSection
            title="Combos Sessions Estrangeiras"
            icon={Globe}
            combos={estrangeirasCombos}
            comboEdits={comboEdits}
            onComboEdit={handleComboEdit}
            onAddCombo={() => handleAddCombo('estrangeiras')}
            onDeleteCombo={handleDeleteCombo}
          />

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSaveAll} disabled={isSaving}>
              {isSaving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              {isSaving ? "Salvando..." : "Salvar Configurações"}
            </Button>
          </div>

          {/* Sales History */}
          <SessionSalesHistory sales={soldSessions} />
        </>
      )}
    </motion.div>
  );
};
