import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { UserProfileSidebar } from "@/components/ui/menu";
import { avatars } from "@/components/ui/avatar-picker";
import { useAuth } from "@/hooks/useAuth";
import { useUserDashboard } from "@/hooks/useUserDashboard";
import { MorphingSquare } from "@/components/ui/morphing-square";
import { Spinner } from "@/components/ui/spinner";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DownloadBotButton } from "@/components/ui/download-bot-button";
import AnimatedShaderBackground from "@/components/ui/animated-shader-background";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { 
  Key, 
  CheckCircle, 
  AlertTriangle,
  Plus,
  LogOut,
  User,
  CreditCard,
  Settings,
  HelpCircle,
  Copy,
  Shield,
  Zap,
  MessageCircle,
  Sparkles,
  Lock,
  History,
  Moon,
  Bell,
  Globe,
  Download,
  Sun,
  Monitor,
  Clock,
  Eye,
  EyeOff
} from "lucide-react";

const fadeIn = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.08
    }
  }
};

const staggerItem = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

const LojaSection = ({ 
  onCheckout, 
  combos, 
  inventory 
}: { 
  onCheckout: (type: string, qty: number, price: string) => void;
  combos: { id: string; type: string; quantity: number; price: number; is_popular: boolean }[];
  inventory: { type: string; quantity: number; custom_quantity_enabled: boolean; custom_quantity_min: number; custom_price_per_unit: number }[];
}) => {
  const navigate = useNavigate();
  const [brSelectedComboId, setBrSelectedComboId] = useState<string | null>(null);
  const [intlSelectedComboId, setIntlSelectedComboId] = useState<string | null>(null);
  const [showBrConfirm, setShowBrConfirm] = useState(false);
  const [showIntlConfirm, setShowIntlConfirm] = useState(false);
  
  // Custom quantity state
  const [brUseCustom, setBrUseCustom] = useState(false);
  const [intlUseCustom, setIntlUseCustom] = useState(false);
  const [brCustomQty, setBrCustomQty] = useState("");
  const [intlCustomQty, setIntlCustomQty] = useState("");

  const brCombos = combos.filter(c => c.type === 'brasileiras');
  const intlCombos = combos.filter(c => c.type === 'estrangeiras');
  const brInventory = inventory.find(i => i.type === 'brasileiras');
  const intlInventory = inventory.find(i => i.type === 'estrangeiras');
  const brStock = brInventory?.quantity || 0;
  const intlStock = intlInventory?.quantity || 0;
  
  // Custom quantity settings
  const brCustomEnabled = brInventory?.custom_quantity_enabled || false;
  const brCustomMin = brInventory?.custom_quantity_min || 1;
  const brCustomPrice = brInventory?.custom_price_per_unit || 0;
  const intlCustomEnabled = intlInventory?.custom_quantity_enabled || false;
  const intlCustomMin = intlInventory?.custom_quantity_min || 1;
  const intlCustomPrice = intlInventory?.custom_price_per_unit || 0;

  // Check if combo has enough stock
  const hasEnoughStock = (combo: { quantity: number; type: string }) => {
    const stock = combo.type === 'brasileiras' ? brStock : intlStock;
    return stock >= combo.quantity;
  };
  
  // Check if custom quantity has enough stock
  const hasEnoughCustomStock = (qty: number, type: string) => {
    const stock = type === 'brasileiras' ? brStock : intlStock;
    return stock >= qty;
  };

  // Get available combos (with enough stock)
  const availableBrCombos = brCombos.filter(hasEnoughStock);
  const availableIntlCombos = intlCombos.filter(hasEnoughStock);

  // Set default selections (only from available combos)
  useEffect(() => {
    if (availableBrCombos.length > 0 && (!brSelectedComboId || !availableBrCombos.find(c => c.id === brSelectedComboId))) {
      setBrSelectedComboId(availableBrCombos[0].id);
    } else if (availableBrCombos.length === 0) {
      setBrSelectedComboId(null);
    }
    if (availableIntlCombos.length > 0 && (!intlSelectedComboId || !availableIntlCombos.find(c => c.id === intlSelectedComboId))) {
      setIntlSelectedComboId(availableIntlCombos[0].id);
    } else if (availableIntlCombos.length === 0) {
      setIntlSelectedComboId(null);
    }
  }, [brCombos, intlCombos, brStock, intlStock]);

  const formatPrice = (value: number) => {
    return `R$ ${Number(value).toFixed(2).replace('.', ',')}`;
  };

  const getSelectedBrCombo = () => brCombos.find(c => c.id === brSelectedComboId);
  const getSelectedIntlCombo = () => intlCombos.find(c => c.id === intlSelectedComboId);

  const getBrTotal = () => {
    if (brUseCustom) {
      const qty = parseInt(brCustomQty) || 0;
      return formatPrice(qty * brCustomPrice);
    }
    const combo = getSelectedBrCombo();
    return combo ? formatPrice(combo.price) : '';
  };

  const getBrQty = () => {
    if (brUseCustom) {
      return parseInt(brCustomQty) || 0;
    }
    const combo = getSelectedBrCombo();
    return combo?.quantity || 0;
  };

  const getIntlTotal = () => {
    if (intlUseCustom) {
      const qty = parseInt(intlCustomQty) || 0;
      return formatPrice(qty * intlCustomPrice);
    }
    const combo = getSelectedIntlCombo();
    return combo ? formatPrice(combo.price) : '';
  };

  const getIntlQty = () => {
    if (intlUseCustom) {
      return parseInt(intlCustomQty) || 0;
    }
    const combo = getSelectedIntlCombo();
    return combo?.quantity || 0;
  };

  // Check if selected combo can be purchased
  const canPurchaseBr = () => {
    if (brUseCustom) {
      const qty = parseInt(brCustomQty) || 0;
      return qty >= brCustomMin && hasEnoughCustomStock(qty, 'brasileiras');
    }
    const combo = getSelectedBrCombo();
    return combo && hasEnoughStock(combo);
  };

  const canPurchaseIntl = () => {
    if (intlUseCustom) {
      const qty = parseInt(intlCustomQty) || 0;
      return qty >= intlCustomMin && hasEnoughCustomStock(qty, 'estrangeiras');
    }
    const combo = getSelectedIntlCombo();
    return combo && hasEnoughStock(combo);
  };

  // Get appropriate button text
  const getBrButtonText = () => {
    if (brUseCustom) {
      const qty = parseInt(brCustomQty) || 0;
      if (qty < brCustomMin) return `Mínimo: ${brCustomMin} sessions`;
      if (!hasEnoughCustomStock(qty, 'brasileiras')) return 'Estoque insuficiente';
      return `Comprar ${getBrTotal()}`;
    }
    const combo = getSelectedBrCombo();
    if (!combo) return 'Selecione um pacote';
    if (!hasEnoughStock(combo)) return 'Sem estoque';
    return `Comprar ${getBrTotal()}`;
  };

  const getIntlButtonText = () => {
    if (intlUseCustom) {
      const qty = parseInt(intlCustomQty) || 0;
      if (qty < intlCustomMin) return `Mínimo: ${intlCustomMin} sessions`;
      if (!hasEnoughCustomStock(qty, 'estrangeiras')) return 'Estoque insuficiente';
      return `Comprar ${getIntlTotal()}`;
    }
    const combo = getSelectedIntlCombo();
    if (!combo) return 'Selecione um pacote';
    if (!hasEnoughStock(combo)) return 'Sem estoque';
    return `Comprar ${getIntlTotal()}`;
  };
  
  // Handle custom quantity toggle
  const handleBrCustomToggle = () => {
    setBrUseCustom(!brUseCustom);
    if (!brUseCustom) {
      setBrCustomQty(String(brCustomMin));
    }
  };
  
  const handleIntlCustomToggle = () => {
    setIntlUseCustom(!intlUseCustom);
    if (!intlUseCustom) {
      setIntlCustomQty(String(intlCustomMin));
    }
  };

  const handleBrCheckout = () => {
    navigate('/checkout', { 
      state: { 
        type: 'Sessions Brasileiras', 
        qty: getBrQty(), 
        price: getBrTotal() 
      } 
    });
  };

  const handleIntlCheckout = () => {
    navigate('/checkout', { 
      state: { 
        type: 'Sessions Estrangeiras', 
        qty: getIntlQty(), 
        price: getIntlTotal() 
      } 
    });
  };

  return (
    <motion.div {...fadeIn} className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-foreground">Loja</h1>
        <p className="text-sm text-muted-foreground">Adquira pacotes de sessions</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {/* Sessions Brasileiras */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-card border border-border rounded-md p-5 space-y-4 hover:shadow-md hover:shadow-success/5 transition-shadow duration-200"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-success/10 rounded-md flex items-center justify-center">
                <Globe className="w-5 h-5 text-success" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-sm">Sessions Brasileiras</h3>
                <p className="text-xs text-muted-foreground">Números do Brasil</p>
              </div>
            </div>
            <span className={cn(
              "text-xs px-2 py-1 rounded-md font-medium",
              brStock > 0 ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
            )}>{brStock} disponíveis</span>
          </div>
          <div className="space-y-2">
            {brCombos.map((combo) => {
              const isAvailable = hasEnoughStock(combo);
              return (
                <div 
                  key={combo.id}
                  onClick={() => {
                    if (isAvailable) {
                      setBrSelectedComboId(combo.id);
                      setBrUseCustom(false);
                    }
                  }}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-md text-sm transition-all duration-150",
                    !isAvailable 
                      ? "bg-muted/30 opacity-50 cursor-not-allowed" 
                      : !brUseCustom && brSelectedComboId === combo.id
                        ? "bg-primary/10 border border-primary/20 cursor-pointer" 
                        : "bg-muted/50 hover:bg-muted cursor-pointer"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors duration-150",
                      !isAvailable 
                        ? "border-muted-foreground/50" 
                        : !brUseCustom && brSelectedComboId === combo.id ? "border-primary" : "border-muted-foreground"
                    )}>
                      {!brUseCustom && brSelectedComboId === combo.id && isAvailable && <div className="w-2 h-2 rounded-full bg-primary" />}
                    </div>
                    <span className={cn("text-sm", isAvailable ? "text-foreground" : "text-muted-foreground")}>+{combo.quantity} sessions</span>
                    {combo.is_popular && isAvailable && (
                      <span className="text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded font-medium">TOP</span>
                    )}
                    {!isAvailable && (
                      <span className="text-[10px] bg-destructive/10 text-destructive px-1.5 py-0.5 rounded font-medium">Sem estoque</span>
                    )}
                  </div>
                  <span className={cn("font-semibold text-sm", isAvailable ? "text-primary" : "text-muted-foreground")}>{formatPrice(combo.price)}</span>
                </div>
              );
            })}
            
            {/* Custom Quantity Option - Brasileiras */}
            {brCustomEnabled && (
              <div 
                onClick={() => {
                  if (brStock >= brCustomMin) {
                    handleBrCustomToggle();
                  }
                }}
                className={cn(
                  "p-3 rounded-md text-sm transition-all duration-150",
                  brStock < brCustomMin
                    ? "bg-muted/30 opacity-50 cursor-not-allowed"
                    : brUseCustom
                      ? "bg-primary/10 border border-primary/20 cursor-pointer"
                      : "bg-muted/50 hover:bg-muted cursor-pointer"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors duration-150",
                      brUseCustom ? "border-primary" : "border-muted-foreground"
                    )}>
                      {brUseCustom && <div className="w-2 h-2 rounded-full bg-primary" />}
                    </div>
                    <span className="text-sm text-foreground">Quantidade personalizada</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{formatPrice(brCustomPrice)}/un</span>
                </div>
                {brUseCustom && (
                  <div className="mt-3 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="number"
                      min={brCustomMin}
                      max={brStock}
                      value={brCustomQty}
                      onChange={(e) => setBrCustomQty(e.target.value)}
                      className="flex-1 px-3 py-1.5 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder={`Mín: ${brCustomMin}`}
                    />
                    <span className="text-xs text-muted-foreground whitespace-nowrap">= {getBrTotal()}</span>
                  </div>
                )}
              </div>
            )}
          </div>
          <AlertDialog open={showBrConfirm} onOpenChange={setShowBrConfirm}>
            <AlertDialogTrigger asChild>
              <Button size="sm" className="w-full h-9 active:scale-[0.99] transition-transform" disabled={!canPurchaseBr()}>
                {getBrButtonText()}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-card border-border">
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar Compra</AlertDialogTitle>
                <AlertDialogDescription className="space-y-3">
                  <p>Você está prestes a comprar sessions brasileiras.</p>
                  <div className="bg-muted/50 rounded-md p-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Produto</span>
                      <span className="text-foreground font-medium">Sessions Brasileiras</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Quantidade</span>
                      <span className="text-foreground font-medium">{getBrQty()} sessions</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total</span>
                      <span className="text-primary font-semibold">{getBrTotal()}</span>
                    </div>
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleBrCheckout}>Ir para pagamento</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </motion.div>

        {/* Sessions Estrangeiras */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-card border border-border rounded-md p-5 space-y-4 hover:shadow-md hover:shadow-primary/5 transition-shadow duration-200"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-md flex items-center justify-center">
                <Globe className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-sm">Sessions Estrangeiras</h3>
                <p className="text-xs text-muted-foreground">Números internacionais</p>
              </div>
            </div>
            <span className={cn(
              "text-xs px-2 py-1 rounded-md font-medium",
              intlStock > 0 ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"
            )}>{intlStock} disponíveis</span>
          </div>
          <div className="space-y-2">
            {intlCombos.map((combo) => {
              const isAvailable = hasEnoughStock(combo);
              return (
                <div 
                  key={combo.id}
                  onClick={() => {
                    if (isAvailable) {
                      setIntlSelectedComboId(combo.id);
                      setIntlUseCustom(false);
                    }
                  }}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-md text-sm transition-all duration-150",
                    !isAvailable 
                      ? "bg-muted/30 opacity-50 cursor-not-allowed" 
                      : !intlUseCustom && intlSelectedComboId === combo.id
                        ? "bg-primary/10 border border-primary/20 cursor-pointer" 
                        : "bg-muted/50 hover:bg-muted cursor-pointer"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors duration-150",
                      !isAvailable 
                        ? "border-muted-foreground/50" 
                        : !intlUseCustom && intlSelectedComboId === combo.id ? "border-primary" : "border-muted-foreground"
                    )}>
                      {!intlUseCustom && intlSelectedComboId === combo.id && isAvailable && <div className="w-2 h-2 rounded-full bg-primary" />}
                    </div>
                    <span className={cn("text-sm", isAvailable ? "text-foreground" : "text-muted-foreground")}>+{combo.quantity} sessions</span>
                    {combo.is_popular && isAvailable && (
                      <span className="text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded font-medium">MELHOR</span>
                    )}
                    {!isAvailable && (
                      <span className="text-[10px] bg-destructive/10 text-destructive px-1.5 py-0.5 rounded font-medium">Sem estoque</span>
                    )}
                  </div>
                  <span className={cn("font-semibold text-sm", isAvailable ? "text-primary" : "text-muted-foreground")}>{formatPrice(combo.price)}</span>
                </div>
              );
            })}
            
            {/* Custom Quantity Option - Estrangeiras */}
            {intlCustomEnabled && (
              <div 
                onClick={() => {
                  if (intlStock >= intlCustomMin) {
                    handleIntlCustomToggle();
                  }
                }}
                className={cn(
                  "p-3 rounded-md text-sm transition-all duration-150",
                  intlStock < intlCustomMin
                    ? "bg-muted/30 opacity-50 cursor-not-allowed"
                    : intlUseCustom
                      ? "bg-primary/10 border border-primary/20 cursor-pointer"
                      : "bg-muted/50 hover:bg-muted cursor-pointer"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors duration-150",
                      intlUseCustom ? "border-primary" : "border-muted-foreground"
                    )}>
                      {intlUseCustom && <div className="w-2 h-2 rounded-full bg-primary" />}
                    </div>
                    <span className="text-sm text-foreground">Quantidade personalizada</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{formatPrice(intlCustomPrice)}/un</span>
                </div>
                {intlUseCustom && (
                  <div className="mt-3 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="number"
                      min={intlCustomMin}
                      max={intlStock}
                      value={intlCustomQty}
                      onChange={(e) => setIntlCustomQty(e.target.value)}
                      className="flex-1 px-3 py-1.5 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder={`Mín: ${intlCustomMin}`}
                    />
                    <span className="text-xs text-muted-foreground whitespace-nowrap">= {getIntlTotal()}</span>
                  </div>
                )}
              </div>
            )}
          </div>
          <AlertDialog open={showIntlConfirm} onOpenChange={setShowIntlConfirm}>
            <AlertDialogTrigger asChild>
              <Button size="sm" className="w-full h-9 active:scale-[0.99] transition-transform" disabled={!canPurchaseIntl()}>
                {getIntlButtonText()}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-card border-border">
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar Compra</AlertDialogTitle>
                <AlertDialogDescription className="space-y-3">
                  <p>Você está prestes a comprar sessions estrangeiras.</p>
                  <div className="bg-muted/50 rounded-md p-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Produto</span>
                      <span className="text-foreground font-medium">Sessions Estrangeiras</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Quantidade</span>
                      <span className="text-foreground font-medium">{getIntlQty()} sessions</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total</span>
                      <span className="text-primary font-semibold">{getIntlTotal()}</span>
                    </div>
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleIntlCheckout}>Ir para pagamento</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </motion.div>
      </div>
    </motion.div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, profile, isLoading, signOut, updateProfile } = useAuth();
  const { license, sessionFiles, orders, combos, inventory, loginHistory, isLoading: dashboardLoading, downloadSessionFile } = useUserDashboard(user?.id);
  const [activeTab, setActiveTab] = useState("licencas");
  const [isDarkTheme, setIsDarkTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      return saved ? saved === 'dark' : true;
    }
    return true;
  });
  const [notifications, setNotifications] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('notifications');
      return saved ? JSON.parse(saved) : { email: true, license: true, promos: true };
    }
    return { email: true, license: true, promos: true };
  });
  const [showPassword, setShowPassword] = useState(false);
  const [selectedAvatarId, setSelectedAvatarId] = useState<number>(1);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedUpgradePlan, setSelectedUpgradePlan] = useState(1);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handlePasswordChange = async () => {
    if (newPassword.length < 8) {
      toast.error("A senha deve ter no mínimo 8 caracteres");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }

    setIsChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      
      if (error) {
        toast.error("Erro ao alterar senha: " + error.message);
        return;
      }

      toast.success("Senha alterada com sucesso!");
      setNewPassword("");
      setConfirmPassword("");
      
      // Sign out user for security
      await signOut();
    } catch (error) {
      toast.error("Erro ao alterar senha");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const upgradePlans = [
    { name: "Plano 60 Dias", price: "R$ 49,90", discount: "Economize 15%" },
    { name: "Plano 90 Dias", price: "R$ 69,90", discount: "Economize 25%", popular: true },
    { name: "Plano Anual", price: "R$ 199,90", discount: "Economize 40%" },
  ];

  // Apply theme to document
  useEffect(() => {
    if (isDarkTheme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', isDarkTheme ? 'dark' : 'light');
  }, [isDarkTheme]);

  // Save notifications to localStorage
  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Sync avatar from profile
  useEffect(() => {
    if (profile?.avatar) {
      const avatarIndex = avatars.findIndex(a => a.alt === profile.avatar);
      if (avatarIndex >= 0) {
        setSelectedAvatarId(avatars[avatarIndex].id);
      }
    }
  }, [profile]);

  const handleAvatarChange = async (avatar: typeof avatars[0]) => {
    setSelectedAvatarId(avatar.id);
    await updateProfile({ avatar: avatar.alt });
  };
  
  // Calculate license info from real data
  const getLicenseInfo = () => {
    if (!license) return null;
    
    const startDate = new Date(license.start_date);
    const endDate = new Date(license.end_date);
    const now = new Date();
    const daysLeft = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
    };
    
    return {
      key: `SWEX-${license.id.slice(0, 4).toUpperCase()}-${license.id.slice(4, 8).toUpperCase()}-${license.id.slice(8, 12).toUpperCase()}`,
      plan: license.plan_name,
      expiresAt: formatDate(endDate),
      daysLeft,
      totalDays,
      activatedAt: formatDate(startDate),
      status: license.status
    };
  };
  
  const userLicense = getLicenseInfo();

  // User data from auth
  const userData = {
    name: profile?.name || "Usuário",
    email: profile?.email || user?.email || "",
    initials: (profile?.name || "U").split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
    plan: "Plano Pro"
  };

  const sidebarTabs = ["perfil", "preferencias", "historico", "ajuda"];
  
  const profileNavItems = [
    { label: "Minha Conta", icon: <User className="h-full w-full" />, onClick: () => setActiveTab("perfil") },
    { label: "Preferências", icon: <Settings className="h-full w-full" />, onClick: () => setActiveTab("preferencias") },
    { label: "Histórico", icon: <History className="h-full w-full" />, onClick: () => setActiveTab("historico") },
    { label: "Ajuda", icon: <HelpCircle className="h-full w-full" />, onClick: () => setActiveTab("ajuda"), isSeparator: true },
  ];

  const sidebarActiveIndex = sidebarTabs.indexOf(activeTab);
  
  const handleSidebarChange = (index: number) => {
    setActiveTab(sidebarTabs[index]);
  };

  const logoutItem = {
    label: "Sair",
    icon: <LogOut className="h-full w-full" />,
    onClick: signOut,
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen w-full relative flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <AnimatedShaderBackground className="w-full h-full" />
        </div>
        <div className="relative z-10">
          <MorphingSquare message="Carregando..." className="bg-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex flex-col w-[256px] sticky top-0 h-screen flex-shrink-0 border-r border-border">
        <UserProfileSidebar 
          user={{
            name: userData.name,
            email: userData.email,
            initials: userData.initials,
            selectedAvatarId: selectedAvatarId
          }}
          navItems={profileNavItems}
          logoutItem={logoutItem}
          onAvatarChange={(avatar) => setSelectedAvatarId(avatar.id)}
          activeIndex={sidebarActiveIndex >= 0 ? sidebarActiveIndex : null}
          onActiveChange={handleSidebarChange}
          className="h-full border-r-0"
        />
      </aside>

      {/* Mobile/Tablet Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b border-border">
        <div className="flex items-center h-14 px-4">
          {/* Profile dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-9 h-9 rounded-md overflow-hidden bg-muted border border-border flex items-center justify-center hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary/50">
                {selectedAvatarId ? (
                  <div className="w-9 h-9 flex items-center justify-center [&>svg]:w-9 [&>svg]:h-9">
                    {avatars.find(a => a.id === selectedAvatarId)?.svg}
                  </div>
                ) : (
                  <span className="text-xs font-semibold text-primary-foreground bg-primary w-full h-full flex items-center justify-center">{userData.initials}</span>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 bg-card border border-border">
              <DropdownMenuLabel className="font-normal px-3 py-2">
                <p className="text-sm font-medium text-foreground">{userData.name}</p>
                <p className="text-xs text-muted-foreground">{userData.email}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setActiveTab("perfil")} className="px-3 py-2 cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                Minha Conta
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveTab("preferencias")} className="px-3 py-2 cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                Preferências
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveTab("historico")} className="px-3 py-2 cursor-pointer">
                <History className="mr-2 h-4 w-4" />
                Histórico
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setActiveTab("ajuda")} className="px-3 py-2 cursor-pointer">
                <HelpCircle className="mr-2 h-4 w-4" />
                Ajuda
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/")} className="px-3 py-2 cursor-pointer text-destructive focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Center: Navigation */}
          <nav className="flex-1 flex justify-center absolute left-1/2 -translate-x-1/2">
            <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-md relative">
              {[
                { label: "Licenças", tab: "licencas", icon: Key },
                { label: "Sessions", tab: "numeros", icon: Globe },
                { label: "Loja", tab: "comprar", icon: CreditCard },
              ].map((item) => (
                <motion.button
                  key={item.tab}
                  onClick={() => setActiveTab(item.tab)}
                  className={cn(
                    "relative flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-colors",
                    activeTab === item.tab
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  whileTap={{ scale: 0.95 }}
                >
                  {activeTab === item.tab && (
                    <motion.div
                      layoutId="mobile-tab-bg"
                      className="absolute inset-0 bg-card rounded shadow-sm"
                      initial={false}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <item.icon className="w-3.5 h-3.5 relative z-10" />
                  <span className="hidden sm:inline relative z-10">{item.label}</span>
                </motion.button>
              ))}
            </div>
          </nav>

          {/* Spacer to balance the layout */}
          <div className="w-9 h-9" />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-14 lg:pt-0 min-w-0">
        {/* Desktop Header */}
        <header className="hidden lg:flex items-center justify-between h-14 px-6 border-b border-border bg-card sticky top-0 z-40">
          <nav className="flex items-center gap-1 relative">
              {[
                { label: "Licenças", tab: "licencas", icon: Key },
                { label: "Sessions", tab: "numeros", icon: Globe },
                { label: "Loja", tab: "comprar", icon: CreditCard },
              ].map((item) => (
                <motion.button
                  key={item.tab}
                  onClick={() => setActiveTab(item.tab)}
                className={cn(
                  "relative flex items-center gap-2 px-4 py-2 text-[13px] font-medium rounded-md transition-colors",
                  activeTab === item.tab
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
                whileTap={{ scale: 0.97 }}
              >
                {activeTab === item.tab && (
                  <motion.div
                    layoutId="header-tab-bg"
                    className="absolute inset-0 bg-muted rounded-md"
                    initial={false}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <item.icon className="w-4 h-4 relative z-10" />
                <span className="relative z-10">{item.label}</span>
              </motion.button>
            ))}
          </nav>
        </header>
        
        {/* Content */}
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        
        {/* Licenças */}
{activeTab === "licencas" && (
          <motion.div {...fadeIn} className="space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-lg font-semibold text-foreground">Minhas Licenças</h1>
              <p className="text-sm text-muted-foreground">Gerencie suas licenças ativas</p>
            </div>

            {/* No License State */}
            {!userLicense ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card border border-border rounded-md p-8 text-center space-y-4"
              >
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto">
                  <Key className="w-6 h-6 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Nenhuma licença ativa</h3>
                  <p className="text-xs text-muted-foreground mt-1">Adquira uma licença para começar a usar o sistema</p>
                </div>
                <Button size="sm" onClick={() => navigate("/comprar")}>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Ver Planos
                </Button>
              </motion.div>
            ) : (
              /* Main License Card */
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="bg-card border border-border rounded-md p-5 space-y-5 hover:shadow-lg hover:shadow-primary/5 transition-shadow duration-300"
              >
                {/* License Info Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <motion.div 
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.2 }}
                      className="w-10 h-10 bg-primary/10 rounded-md flex items-center justify-center"
                    >
                      <Key className="w-5 h-5 text-primary" />
                    </motion.div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">{userLicense.plan}</h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <div className={cn(
                          "w-1.5 h-1.5 rounded-full animate-pulse",
                          userLicense.status === 'active' ? "bg-success" : "bg-destructive"
                        )} />
                        <span className={cn(
                          "text-xs font-medium",
                          userLicense.status === 'active' ? "text-success" : "text-destructive"
                        )}>
                          {userLicense.status === 'active' ? 'Ativa' : 'Expirada'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 gap-1.5 hover:scale-[1.02] active:scale-[0.98] transition-transform"
                    onClick={() => navigator.clipboard.writeText(userLicense.key)}
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline text-xs">Copiar</span>
                  </Button>
                </div>

                {/* License Details Grid */}
                <motion.div 
                  variants={staggerContainer}
                  initial="initial"
                  animate="animate"
                  className="grid grid-cols-1 sm:grid-cols-3 gap-3"
                >
                  {[
                    { label: "Chave", value: userLicense.key, mono: true },
                    { label: "Ativada em", value: userLicense.activatedAt },
                    { label: "Expira em", value: userLicense.expiresAt }
                  ].map((item, i) => (
                    <motion.div 
                      key={i}
                      variants={staggerItem}
                      className="bg-muted/50 rounded-md p-3 hover:bg-muted/70 transition-colors duration-200"
                    >
                      <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
                      <p className={cn("text-sm text-foreground truncate", item.mono && "font-mono")}>{item.value}</p>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tempo restante</span>
                    <span className="text-foreground font-medium">{userLicense.daysLeft} de {userLicense.totalDays} dias</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(userLicense.daysLeft / userLicense.totalDays) * 100}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="h-full bg-primary rounded-full"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  {userLicense.daysLeft <= 1 ? (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" className="h-9 text-xs sm:text-sm">
                          <Zap className="w-4 h-4 mr-1.5 sm:mr-2 flex-shrink-0" />
                          <span>Renovar Licença</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-card border-border">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Renovar Licença</AlertDialogTitle>
                          <AlertDialogDescription className="space-y-3">
                            <p>Renove sua licença para continuar usando todos os recursos.</p>
                            <div className="bg-muted/50 rounded-md p-3 space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Plano atual</span>
                                <span className="text-foreground font-medium">{userLicense.plan}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Renovação</span>
                                <span className="text-foreground font-medium">+{userLicense.totalDays} dias</span>
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground">Você será redirecionado para a página de planos.</p>
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => navigate('/comprar')}>
                            Ver Planos
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  ) : (
                    <Button size="sm" className="h-9 text-xs sm:text-sm opacity-50 cursor-not-allowed" disabled>
                      <Zap className="w-4 h-4 mr-1.5 sm:mr-2 flex-shrink-0" />
                      <span>Renovar ({userLicense.daysLeft} dias restantes)</span>
                    </Button>
                  )}

                  <AlertDialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="h-9 text-xs sm:text-sm">
                        <Sparkles className="w-4 h-4 mr-1.5 sm:mr-2 flex-shrink-0" />
                        <span>Upgrade</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-card border-border">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Fazer Upgrade</AlertDialogTitle>
                        <AlertDialogDescription className="space-y-3">
                          <p>Escolha um plano superior para obter mais benefícios.</p>
                          <div className="space-y-2">
                            {upgradePlans.map((plan, i) => (
                              <div 
                                key={i}
                                onClick={() => setSelectedUpgradePlan(i)}
                                className={cn(
                                  "rounded-md p-3 border cursor-pointer transition-colors",
                                  selectedUpgradePlan === i 
                                    ? "bg-primary/10 border-primary/30" 
                                    : "bg-muted/50 border-border hover:border-primary/50"
                                )}
                              >
                                <div className="flex justify-between items-center">
                                  <div className="flex items-center gap-2">
                                    <div className={cn(
                                      "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                                      selectedUpgradePlan === i ? "border-primary" : "border-muted-foreground"
                                    )}>
                                      {selectedUpgradePlan === i && <div className="w-2 h-2 rounded-full bg-primary" />}
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <p className="text-sm font-medium text-foreground">{plan.name}</p>
                                        {plan.popular && (
                                          <span className="text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded font-medium">POPULAR</span>
                                        )}
                                      </div>
                                      <p className="text-xs text-muted-foreground">{plan.discount}</p>
                                    </div>
                                  </div>
                                  <span className="text-primary font-semibold">{plan.price}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => {
                          const plan = upgradePlans[selectedUpgradePlan];
                          navigate('/checkout', { state: { type: 'Upgrade', plan: plan.name, price: plan.price } });
                        }}>
                          Continuar para pagamento
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </motion.div>
            )}

            {/* Download Bot Card */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="bg-card border border-border rounded-md p-5 hover:shadow-lg hover:shadow-primary/5 transition-shadow duration-300"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-md flex items-center justify-center">
                    <Download className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">Baixar Bot</h3>
                    <p className="text-xs text-muted-foreground">SWEXTRACTOR.exe - Insira sua chave de licença</p>
                  </div>
                </div>
                <DownloadBotButton />
              </div>
            </motion.div>

            {/* Warning Alert */}
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="bg-warning/10 border border-warning/30 rounded-md p-4 flex items-center gap-3"
            >
              <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-foreground">Sua licença expira em breve! <span className="text-warning font-medium">10% de desconto</span> na renovação.</p>
              </div>
              <Button size="sm" variant="outline" className="hidden sm:flex h-8 border-warning/30 text-warning hover:bg-warning/10 hover:text-warning hover:scale-[1.02] active:scale-[0.98] transition-all">
                Renovar
              </Button>
            </motion.div>
          </motion.div>
        )}

        {/* Sessions */}
        {activeTab === "numeros" && (
          <motion.div {...fadeIn} className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-lg font-semibold text-foreground">Minhas Sessions</h1>
                <p className="text-sm text-muted-foreground">Sessions disponíveis para download</p>
              </div>
              <Button size="sm" className="h-9" onClick={() => setActiveTab("comprar")}>
                <Plus className="w-4 h-4 mr-2" />
                Comprar mais
              </Button>
            </div>

            {/* No Sessions State */}
            {sessionFiles.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card border border-border rounded-md p-8 text-center space-y-4"
              >
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto">
                  <Globe className="w-6 h-6 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Nenhuma session encontrada</h3>
                  <p className="text-xs text-muted-foreground mt-1">Compre sessions para começar a usar</p>
                </div>
                <Button size="sm" onClick={() => setActiveTab("comprar")}>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Ver Pacotes
                </Button>
              </motion.div>
            ) : (
              <>
                {/* Group sessions by type */}
                {['brasileiras', 'estrangeiras'].map((type) => {
                  const typeFiles = sessionFiles.filter(f => f.type === type);
                  if (typeFiles.length === 0) return null;
                  
                  const isBr = type === 'brasileiras';
                  
                  return (
                    <motion.div 
                      key={type}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: isBr ? 0.1 : 0.2 }}
                      className={cn(
                        "bg-card border border-border rounded-md overflow-hidden hover:shadow-lg transition-shadow duration-300",
                        isBr ? "hover:shadow-success/5" : "hover:shadow-primary/5"
                      )}
                    >
                      <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-8 h-8 rounded-md flex items-center justify-center",
                            isBr ? "bg-success/10" : "bg-primary/10"
                          )}>
                            <Globe className={cn("w-4 h-4", isBr ? "text-success" : "text-primary")} />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">
                              Sessions {isBr ? 'Brasileiras' : 'Estrangeiras'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {typeFiles.length} session{typeFiles.length !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="divide-y divide-border">
                        {typeFiles.map((file, i) => (
                          <motion.div 
                            key={file.id} 
                            initial={{ opacity: 0, x: -5 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.25, delay: 0.15 + i * 0.05 }}
                            className="p-3 flex items-center justify-between hover:bg-muted/30 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "w-7 h-7 rounded flex items-center justify-center",
                                isBr ? "bg-success/10" : "bg-primary/10"
                              )}>
                                <span className={cn("text-xs font-semibold", isBr ? "text-success" : "text-primary")}>
                                  {i + 1}
                                </span>
                              </div>
                              <div>
                                <p className="text-sm text-foreground font-mono truncate max-w-[200px]">
                                  {file.file_name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {file.sold_at ? new Date(file.sold_at).toLocaleDateString('pt-BR') : ''}
                                </p>
                              </div>
                            </div>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-7 w-7 p-0 hover:scale-110 active:scale-95 transition-transform"
                              onClick={() => downloadSessionFile(file.id, file.file_path, file.file_name)}
                            >
                              <Download className={cn("w-4 h-4", "text-muted-foreground hover:text-foreground")} />
                            </Button>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  );
                })}
              </>
            )}

            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="bg-muted/30 border border-border rounded-md p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div>
                <p className="text-sm font-medium text-foreground">Precisa de mais sessions?</p>
                <p className="text-sm text-muted-foreground">Compre com desconto especial</p>
              </div>
              <Button size="sm" variant="outline" className="h-9 hover:scale-[1.02] active:scale-[0.98] transition-transform" onClick={() => setActiveTab("comprar")}>
                Ver pacotes
              </Button>
            </motion.div>
          </motion.div>
        )}

        {/* Comprar */}
        {activeTab === "comprar" && (
          <LojaSection onCheckout={() => {}} combos={combos} inventory={inventory} />
        )}

        {/* Preferências */}
        {activeTab === "preferencias" && (
          <motion.div {...fadeIn} className="space-y-6">
            <div>
              <h1 className="text-lg font-semibold text-foreground">Preferências</h1>
              <p className="text-sm text-muted-foreground">Personalize sua experiência</p>
            </div>

            <div className="space-y-4">
              {/* Avatar - só mobile/tablet */}
              <div className="lg:hidden bg-card border border-border rounded-md p-5 space-y-4">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" />
                  Avatar
                </h3>
                <div className="flex flex-wrap gap-2">
                  {avatars.map((avatar) => (
                    <motion.button
                      key={avatar.id}
                      onClick={() => handleAvatarChange(avatar)}
                      className={cn(
                        "relative w-12 h-12 rounded-md overflow-hidden border-2 transition-colors",
                        selectedAvatarId === avatar.id 
                          ? "border-primary bg-primary/10" 
                          : "border-border hover:border-muted-foreground hover:bg-muted/50"
                      )}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div className="w-full h-full flex items-center justify-center">
                        {avatar.svg}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Tema */}
              <div className="bg-card border border-border rounded-md p-5 space-y-4">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Moon className="w-4 h-4 text-primary" />
                  Aparência
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setIsDarkTheme(true)}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-md border transition-colors",
                      isDarkTheme ? "border-primary bg-primary/10" : "border-border hover:bg-muted/50"
                    )}
                  >
                    <Moon className="w-4 h-4" />
                    <span className="text-sm font-medium">Escuro</span>
                  </button>
                  <button
                    onClick={() => setIsDarkTheme(false)}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-md border transition-colors",
                      !isDarkTheme ? "border-primary bg-primary/10" : "border-border hover:bg-muted/50"
                    )}
                  >
                    <Sun className="w-4 h-4" />
                    <span className="text-sm font-medium">Claro</span>
                  </button>
                </div>
              </div>

              {/* Notificações */}
              <div className="bg-card border border-border rounded-md p-5 space-y-4">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Bell className="w-4 h-4 text-primary" />
                  Notificações
                </h3>
                <div className="space-y-2">
                  {[
                    { key: 'email', label: "Notificações por email", desc: "Receba atualizações por email" },
                    { key: 'license', label: "Alertas de licença", desc: "Aviso quando expirar" },
                    { key: 'promos', label: "Novidades e promoções", desc: "Ofertas exclusivas" },
                  ].map((item) => {
                    const isEnabled = notifications[item.key as keyof typeof notifications];
                    return (
                      <div key={item.key} className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                        <div>
                          <p className="text-sm font-medium text-foreground">{item.label}</p>
                          <p className="text-xs text-muted-foreground">{item.desc}</p>
                        </div>
                        <button
                          onClick={() => setNotifications(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof prev] }))}
                          className={cn(
                            "w-10 h-5 rounded-full relative cursor-pointer transition-colors",
                            isEnabled ? "bg-primary" : "bg-muted-foreground/30"
                          )}
                        >
                          <div className={cn(
                            "absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all",
                            isEnabled ? "right-0.5" : "left-0.5"
                          )} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Histórico */}
        {activeTab === "historico" && (
          <motion.div {...fadeIn} className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-lg font-semibold text-foreground">Histórico</h1>
                <p className="text-sm text-muted-foreground">Veja suas atividades recentes</p>
              </div>
            </div>

            {/* Grid de cards */}
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Histórico de Compras */}
              <div className="bg-card border border-border rounded-md p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-primary" />
                    Compras Recentes
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-primary hover:text-primary/80"
                    onClick={() => navigate('/pagamentos')}
                  >
                    Ver todos
                  </Button>
                </div>
                <div className="space-y-2">
                  {orders && orders.length > 0 ? (
                    orders.slice(0, 5).map((order) => {
                      const date = new Date(order.created_at);
                      const formattedDate = date.toLocaleDateString('pt-BR', { 
                        day: '2-digit', 
                        month: 'short', 
                        year: 'numeric' 
                      });
                      const statusMap: Record<string, { label: string; color: string }> = {
                        'completed': { label: 'Aprovado', color: 'text-success' },
                        'pending': { label: 'Pendente', color: 'text-warning' },
                        'cancelled': { label: 'Cancelado', color: 'text-destructive' },
                        'failed': { label: 'Falhou', color: 'text-destructive' },
                      };
                      const status = statusMap[order.status] || { label: order.status, color: 'text-muted-foreground' };
                      
                      return (
                        <div key={order.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-md transition-all hover:bg-muted/70">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-8 h-8 rounded-lg flex items-center justify-center",
                              order.status === 'completed' ? "bg-success/10" : 
                              order.status === 'pending' ? "bg-warning/10" : "bg-destructive/10"
                            )}>
                              {order.status === 'completed' 
                                ? <CheckCircle className="w-4 h-4 text-success" />
                                : order.status === 'pending'
                                  ? <Clock className="w-4 h-4 text-warning" />
                                  : <AlertTriangle className="w-4 h-4 text-destructive" />
                              }
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">{order.product_name}</p>
                              <p className="text-xs text-muted-foreground">{formattedDate}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-foreground">
                              R$ {Number(order.amount).toFixed(2).replace('.', ',')}
                            </p>
                            <p className={`text-xs ${status.color}`}>{status.label}</p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                      <CreditCard className="w-8 h-8 text-muted-foreground/50 mb-2" />
                      <p className="text-sm text-muted-foreground">Nenhuma compra realizada</p>
                      <p className="text-xs text-muted-foreground/70">Suas compras aparecerão aqui</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Histórico de Logins */}
              <div className="bg-card border border-border rounded-md p-5 space-y-4">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  Logins Recentes
                </h3>
                <div className="space-y-2">
                  {loginHistory && loginHistory.length > 0 ? (
                    loginHistory.slice(0, 5).map((login) => {
                      const date = new Date(login.created_at);
                      const formattedDate = date.toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      });
                      
                      return (
                        <div key={login.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-md transition-all hover:bg-muted/70">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-8 h-8 rounded-lg flex items-center justify-center",
                              login.status === "success" ? "bg-success/10" : "bg-destructive/10"
                            )}>
                              {login.status === "success" 
                                ? <CheckCircle className="w-4 h-4 text-success" />
                                : <AlertTriangle className="w-4 h-4 text-destructive" />
                              }
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">{login.device || 'Navegador'}</p>
                              <p className="text-xs text-muted-foreground">{login.location || 'Localização desconhecida'}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">{formattedDate}</p>
                            <span className={`text-xs font-medium ${
                              login.status === 'success' ? 'text-success' : 'text-destructive'
                            }`}>
                              {login.status === 'success' ? 'Sucesso' : login.failure_reason || 'Falhou'}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                      <Shield className="w-8 h-8 text-muted-foreground/50 mb-2" />
                      <p className="text-sm text-muted-foreground">Nenhum login registrado</p>
                      <p className="text-xs text-muted-foreground/70">Seus logins aparecerão aqui</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Sessões Ativas - Bot (Funcionalidade futura) */}
              <motion.div 
                className="bg-card border border-border rounded-md p-5 space-y-4 sm:col-span-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Monitor className="w-4 h-4 text-primary" />
                    Sessões Ativas (Bot)
                  </h3>
                </div>
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">Nenhuma sessão ativa no momento</p>
                  <p className="text-xs text-muted-foreground mt-1">As sessões do bot aparecerão aqui quando conectadas</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Ajuda */}
        {activeTab === "ajuda" && (
          <motion.div {...fadeIn} className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-lg font-semibold text-foreground">Ajuda</h1>
                <p className="text-sm text-muted-foreground">Precisa de suporte?</p>
              </div>
            </div>

            {/* WhatsApp Card */}
            <motion.div 
              className="bg-card border border-border rounded-md p-6 sm:p-8"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-[#25D366]/10 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-8 h-8 text-[#25D366]" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-lg font-semibold text-foreground">Fale com a gente</h2>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    Nosso time de suporte está pronto para te ajudar. Respondemos rapidamente pelo WhatsApp!
                  </p>
                </div>
                <Button 
                  size="lg" 
                  className="mt-4 gap-2 bg-[#25D366] hover:bg-[#25D366]/90 text-white shadow-lg shadow-[#25D366]/20"
                  onClick={() => window.open("https://wa.me/5511999999999", "_blank")}
                >
                  <MessageCircle className="w-5 h-5" />
                  Chamar no WhatsApp
                </Button>
                <p className="text-xs text-muted-foreground">
                  Atendimento de Seg a Sex, 9h às 18h
                </p>
              </div>
            </motion.div>

            {/* Info Cards */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="bg-card border border-border rounded-md p-4 transition-all hover:bg-muted/50">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Tempo de resposta</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Respondemos em até 2 horas durante o horário comercial</p>
                  </div>
                </div>
              </div>
              <div className="bg-card border border-border rounded-md p-4 transition-all hover:bg-muted/50">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Suporte especializado</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Time pronto para resolver qualquer problema</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Perfil Expandido */}
        {activeTab === "perfil" && (
          <motion.div {...fadeIn} className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-lg font-semibold text-foreground">Minha Conta</h1>
                <p className="text-sm text-muted-foreground">Gerencie suas informações</p>
              </div>
            </div>

            {/* Profile Card */}
            <div className="bg-card border border-border rounded-md p-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-muted flex items-center justify-center border border-border flex-shrink-0">
                  {selectedAvatarId ? (
                    <div className="w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full">
                      {avatars.find(a => a.id === selectedAvatarId)?.svg}
                    </div>
                  ) : (
                    <div className="w-full h-full bg-primary flex items-center justify-center">
                      <span className="text-xl font-semibold text-primary-foreground">{userData.initials}</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-base font-semibold text-foreground">{userData.name}</h2>
                  <p className="text-sm text-muted-foreground">Bem-vindo de volta! 👋</p>
                </div>
              </div>
            </div>

            {/* Grid de cards */}
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Informações */}
              <div className="bg-card border border-border rounded-md p-5 space-y-4">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" />
                  Informações
                </h3>
                <div className="space-y-3">
                  <div className="p-3 bg-muted/50 rounded-md transition-all hover:bg-muted/70">
                    <div>
                      <p className="text-xs text-muted-foreground">Nome</p>
                      <p className="text-sm text-foreground mt-0.5">{profile?.name || userData.name}</p>
                    </div>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-md transition-all hover:bg-muted/70">
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="text-sm text-foreground mt-0.5">{profile?.email || userData.email}</p>
                    </div>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-md transition-all hover:bg-muted/70">
                    <div>
                      <p className="text-xs text-muted-foreground">WhatsApp</p>
                      <p className="text-sm text-foreground mt-0.5">{profile?.whatsapp || 'Não informado'}</p>
                    </div>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-md transition-all hover:bg-muted/70">
                    <div>
                      <p className="text-xs text-muted-foreground">Plano</p>
                      <p className="text-sm text-foreground mt-0.5">{userLicense?.plan || 'Sem licença ativa'}</p>
                    </div>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-md transition-all hover:bg-muted/70">
                    <div>
                      <p className="text-xs text-muted-foreground">Membro desde</p>
                      <p className="text-sm text-foreground mt-0.5">
                        {profile?.created_at 
                          ? new Date(profile.created_at).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
                          : 'Data não disponível'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Segurança - Alterar Senha */}
              <motion.div 
                className="bg-card border border-border rounded-md p-5 space-y-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  Alterar Senha
                </h3>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground">Nova senha</label>
                    <div className="relative group">
                      <input 
                        type={showPassword ? "text" : "password"}
                        placeholder="Mínimo 8 caracteres"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full h-10 px-3 pr-10 text-sm bg-muted/50 border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground">Confirmar nova senha</label>
                    <input 
                      type="password"
                      placeholder="Repita a nova senha"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full h-10 px-3 text-sm bg-muted/50 border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    />
                  </div>
                  <div className="pt-2 space-y-2">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          size="sm" 
                          className="w-full h-9 bg-gradient-primary hover:opacity-90 transition-all shadow-lg shadow-primary/20"
                          disabled={!newPassword || !confirmPassword || isChangingPassword}
                        >
                          <Lock className="w-3.5 h-3.5 mr-2" />
                          {isChangingPassword ? "Alterando..." : "Alterar senha"}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="max-w-md">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="flex items-center gap-2">
                            <Shield className="w-5 h-5 text-primary" />
                            Confirmar alteração de senha
                          </AlertDialogTitle>
                          <AlertDialogDescription className="text-left">
                            Tem certeza que deseja alterar sua senha? Por motivos de segurança, você será desconectado de todos os dispositivos e precisará fazer login novamente.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={handlePasswordChange}
                            disabled={isChangingPassword}
                            className="bg-primary hover:bg-primary/90"
                          >
                            {isChangingPassword ? <Spinner size="sm" className="mr-2" /> : null}
                            {isChangingPassword ? "Alterando..." : "Sim, alterar senha"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    <p className="text-[10px] text-muted-foreground text-center">
                      Por segurança, você será desconectado após alterar a senha
                    </p>
                  </div>
                </div>
              </motion.div>

            </div>
          </motion.div>
        )}
        </div>

        {/* Footer */}
        <footer className="mt-auto py-4 px-4 border-t border-border bg-card/50">
          <p className="text-xs text-muted-foreground text-center">
            © 2025 SWEXTRATOR. Desenvolvido por{" "}
            <a 
              href="https://wa.me/5565996498222" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline transition-colors"
            >
              Kauan Hup
            </a>
          </p>
        </footer>
      </main>
    </div>
  );
};

export default Dashboard;
