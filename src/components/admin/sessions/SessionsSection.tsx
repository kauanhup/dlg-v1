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
  ShoppingCart,
  Settings,
  Layers,
  ArrowUpRight,
} from "lucide-react";

// Sub-components
import { SessionStatsCards } from "./SessionStatsCards";
import { SessionFilesList } from "./SessionFilesList";
import { SessionCombosSection } from "./SessionCombosSection";
import { SessionTypeSelectorModal } from "./SessionTypeSelectorModal";
import { SessionUploadModal } from "./SessionUploadModal";
import { SessionCustomQuantitySection } from "./SessionCustomQuantitySection";
import { SessionCostSection } from "./SessionCostSection";
import { SessionOrdersSection } from "./SessionOrdersSection";

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
    
    isLoading, 
    isUploading,
    uploadSessionFiles,
    deleteSessionFile,
    updateInventory, 
    updateCombo: updateDbCombo, 
    addCombo: addDbCombo, 
    deleteCombo,
    syncInventory,
    getCombosByType,
    getFilesByType,
    stats,
    refetch
  } = useAdminSessions();
  
  // Tab state
  const [activeTab, setActiveTab] = useState<"estoque" | "configuracoes" | "combos" | "pedidos">("estoque");
  
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
    // Validate input: only allow positive numbers for quantity
    if (field === 'quantity') {
      const numValue = parseInt(value);
      if (value !== '' && (isNaN(numValue) || numValue < 0)) return;
    }
    // Validate price: only allow valid decimal format
    if (field === 'price') {
      const cleaned = value.replace(',', '.');
      if (value !== '' && !/^\d*\.?\d{0,2}$/.test(cleaned)) return;
    }
    
    setComboEdits(prev => ({
      ...prev,
      [comboId]: { ...prev[comboId], [field]: value }
    }));
  }, []);

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      // Parse and validate values
      const costBrValue = Math.max(0, parseFloat(costBrasileiras.replace(',', '.')) || 0);
      const costEstValue = Math.max(0, parseFloat(costEstrangeiras.replace(',', '.')) || 0);
      const customBrMin = Math.max(1, parseInt(customQtyBrMin) || 1);
      const customBrPrice = Math.max(0, parseFloat(customQtyBrPrice.replace(',', '.')) || 0);
      const customEstMin = Math.max(1, parseInt(customQtyEstMin) || 1);
      const customEstPrice = Math.max(0, parseFloat(customQtyEstPrice.replace(',', '.')) || 0);
      
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

      // Get current valid combo IDs from DB to avoid updating deleted combos
      const validComboIds = new Set(dbCombos.map(c => c.id));

      // Validate and save combo edits in parallel (only for existing combos)
      const comboUpdates = Object.entries(comboEdits)
        .filter(([comboId, edit]) => {
          // Only update combos that still exist in DB
          if (!validComboIds.has(comboId)) return false;
          const quantity = parseInt(edit.quantity) || 0;
          const price = parseFloat(edit.price.replace(',', '.')) || 0;
          return quantity > 0 && price >= 0; // Only save valid combos
        })
        .map(([comboId, edit]) => {
          const quantity = Math.max(1, parseInt(edit.quantity) || 1);
          const price = Math.max(0, parseFloat(edit.price.replace(',', '.')) || 0);
          return updateDbCombo(comboId, { quantity, price });
        });
      
      await Promise.all(comboUpdates);

      // Clean up stale combo edits for deleted combos
      setComboEdits(prev => {
        const cleaned: Record<string, { quantity: string; price: string }> = {};
        Object.entries(prev).forEach(([id, edit]) => {
          if (validComboIds.has(id)) {
            cleaned[id] = edit;
          }
        });
        return cleaned;
      });

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
      // Sync inventory first, then refetch
      await syncInventory();
      toast.success("Dados atualizados e sincronizados!");
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

  const tabs = [
    { id: "estoque" as const, label: "Estoque", shortLabel: "Est.", icon: Layers },
    { id: "configuracoes" as const, label: "Configurações", shortLabel: "Config.", icon: Settings },
    { id: "combos" as const, label: "Combos", shortLabel: "Combos", icon: Package },
    { id: "pedidos" as const, label: "Pedidos", shortLabel: "Pedidos", icon: ShoppingCart },
  ];

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <motion.div 
      initial="initial"
      animate="animate"
      className="space-y-4 sm:space-y-6"
    >
      {/* Header Card */}
      <motion.div {...fadeIn} className="bg-card border border-border rounded-lg p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
              <Package className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              Gerenciamento de Sessions
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Gerencie estoque, combos, configurações e pedidos
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full border border-border/50 w-fit">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span>{stats.totalAvailable} disponíveis</span>
          </div>
        </div>

        {/* Quick Summary */}
        <div className="mt-4 sm:mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-success/5 rounded-lg border border-success/20">
            <p className="text-xs text-muted-foreground">🇧🇷 Brasileiras</p>
            <p className="text-lg sm:text-xl font-bold text-success">{stats.totalBrasileiras}</p>
          </div>
          <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
            <p className="text-xs text-muted-foreground">🌍 Estrangeiras</p>
            <p className="text-lg sm:text-xl font-bold text-primary">{stats.totalEstrangeiras}</p>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg border border-border">
            <p className="text-xs text-muted-foreground">Combos BR</p>
            <p className="text-lg sm:text-xl font-bold text-foreground">{brasileirasCombos.length}</p>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg border border-border">
            <p className="text-xs text-muted-foreground">Combos EST</p>
            <p className="text-lg sm:text-xl font-bold text-foreground">{estrangeirasCombos.length}</p>
          </div>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <motion.div {...fadeIn} className="w-full overflow-x-auto pb-2 -mb-2">
        <div className="flex gap-1 bg-muted/50 p-1 rounded-lg w-fit min-w-full sm:min-w-0 border border-border/50">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium rounded-md transition-all flex items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap",
                activeTab === tab.id 
                  ? "bg-background text-foreground shadow-sm border border-border/50" 
                  : "text-muted-foreground hover:text-foreground hover:bg-background/50"
              )}
            >
              <tab.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">{tab.label}</span>
              <span className="xs:hidden">{tab.shortLabel}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Estoque Tab */}
      {activeTab === "estoque" && (
        <motion.div {...fadeIn} className="space-y-4 sm:space-y-6">
          {/* Actions */}
          <div className="flex flex-col xs:flex-row justify-end gap-2">
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
              className="w-full xs:w-auto"
            >
              <RefreshCw className={cn("w-4 h-4 mr-2", isRefreshing && "animate-spin")} />
              Atualizar
            </Button>
            <Button size="sm" disabled={isUploading} onClick={() => setShowTypeSelector(true)} className="w-full xs:w-auto">
              <Plus className="w-4 h-4 mr-2" /> Importar Sessions
            </Button>
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
            </>
          )}
        </motion.div>
      )}

      {/* Configurações Tab */}
      {activeTab === "configuracoes" && (
        <motion.div {...fadeIn}>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner size="lg" />
              <span className="ml-3 text-muted-foreground">Carregando dados...</span>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {/* Configurações de Quantidade Customizada */}
              <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Settings className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-semibold text-foreground">Quantidade Personalizada</h2>
                    <p className="text-xs text-muted-foreground">Configurações de quantidade customizada</p>
                  </div>
                </div>

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
              </div>

              {/* Custos */}
              <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 bg-success/10 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-success" />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-semibold text-foreground">Custos por Session</h2>
                    <p className="text-xs text-muted-foreground">Valor de custo para cálculo de lucro</p>
                  </div>
                </div>

                <SessionCostSection
                  costBrasileiras={costBrasileiras}
                  costEstrangeiras={costEstrangeiras}
                  onCostBrasileirasChange={setCostBrasileiras}
                  onCostEstrangeirasChange={setCostEstrangeiras}
                />
              </div>

              {/* Save Button */}
              <div className="flex justify-end">
                <Button onClick={handleSaveAll} disabled={isSaving} size="lg">
                  {isSaving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  {isSaving ? "Salvando..." : "Salvar Configurações"}
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Combos Tab */}
      {activeTab === "combos" && (
        <motion.div {...fadeIn}>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner size="lg" />
              <span className="ml-3 text-muted-foreground">Carregando dados...</span>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
                <SessionCombosSection
                  title="🇧🇷 Combos Brasileiras"
                  icon={Package}
                  combos={brasileirasCombos}
                  comboEdits={comboEdits}
                  onComboEdit={handleComboEdit}
                  onAddCombo={() => handleAddCombo('brasileiras')}
                  onDeleteCombo={handleDeleteCombo}
                />
                <SessionCombosSection
                  title="🌍 Combos Estrangeiras"
                  icon={Globe}
                  combos={estrangeirasCombos}
                  comboEdits={comboEdits}
                  onComboEdit={handleComboEdit}
                  onAddCombo={() => handleAddCombo('estrangeiras')}
                  onDeleteCombo={handleDeleteCombo}
                />
              </div>

              {/* Save Button */}
              <div className="flex justify-end">
                <Button onClick={handleSaveAll} disabled={isSaving} size="lg">
                  {isSaving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  {isSaving ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Pedidos Tab */}
      {activeTab === "pedidos" && (
        <motion.div {...fadeIn}>
          <SessionOrdersSection />
        </motion.div>
      )}
    </motion.div>
  );
};
