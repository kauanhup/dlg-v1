import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { MorphingSquare } from "@/components/ui/morphing-square";
import AnimatedShaderBackground from "@/components/ui/animated-shader-background";
import { supabase } from "@/integrations/supabase/client";
import { 
  ArrowLeft, 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  RefreshCw,
  Receipt,
  Calendar,
  DollarSign
} from "lucide-react";
import { cn } from "@/lib/utils";

const PIX_EXPIRATION_MINUTES = 15;

interface Payment {
  id: string;
  user_id: string;
  order_id: string | null;
  amount: number;
  status: string;
  payment_method: string;
  pix_code: string | null;
  paid_at: string | null;
  created_at: string;
  order?: {
    product_name: string;
    product_type: string;
    quantity: number;
  } | null;
}

const fadeIn = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35 }
};

const Pagamentos = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [user, setUser] = useState<any>(null);
  const [now, setNow] = useState(new Date());

  // Update current time every second for countdown
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/login');
        return;
      }

      setUser(session.user);
      await fetchPayments(session.user.id);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        navigate('/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchPayments = async (userId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          order:orders(product_name, product_type, quantity)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // SECURITY FIX: Do NOT auto-cancel expired payments here
      // The backend cron job handles this to prevent race conditions with webhooks
      // We only update the UI display status, not the database
      setPayments(data || []);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeLeft = (createdAt: string) => {
    const created = new Date(createdAt);
    const expiresAt = new Date(created.getTime() + PIX_EXPIRATION_MINUTES * 60 * 1000);
    const diff = expiresAt.getTime() - now.getTime();
    
    if (diff <= 0) return null;
    
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return { minutes, seconds };
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'paid':
      case 'completed':
        return { label: 'Pago', icon: CheckCircle2, color: 'text-success', bg: 'bg-success/10' };
      case 'pending':
        return { label: 'Pendente', icon: Clock, color: 'text-warning', bg: 'bg-warning/10' };
      case 'cancelled':
      case 'expired':
        return { label: 'Cancelado', icon: XCircle, color: 'text-destructive', bg: 'bg-destructive/10' };
      case 'refunded':
        return { label: 'Reembolsado', icon: RefreshCw, color: 'text-muted-foreground', bg: 'bg-muted' };
      default:
        return { label: status, icon: Clock, color: 'text-muted-foreground', bg: 'bg-muted' };
    }
  };

  const handlePayNow = (payment: Payment) => {
    if (payment.order) {
      navigate('/checkout', {
        state: {
          type: payment.order.product_name,
          qty: payment.order.quantity,
          price: `R$ ${Number(payment.amount).toFixed(2).replace('.', ',')}`
        }
      });
    }
  };

  // Calculate statistics
  const stats = {
    total: payments.length,
    paid: payments.filter(p => p.status === 'paid' || p.status === 'completed').length,
    pending: payments.filter(p => p.status === 'pending').length,
    totalAmount: payments
      .filter(p => p.status === 'paid' || p.status === 'completed')
      .reduce((sum, p) => sum + Number(p.amount), 0)
  };

  if (isLoading) {
    return (
      <div className="min-h-screen w-full relative flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <AnimatedShaderBackground className="w-full h-full" />
        </div>
        <div className="relative z-10">
          <MorphingSquare message="Carregando pagamentos..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <AnimatedShaderBackground className="w-full h-full" />
      </div>

      <main className="relative z-10 pt-8 pb-16 min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
          <motion.div {...fadeIn}>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <Link 
                  to="/dashboard" 
                  className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Link>
                <div>
                  <h1 className="text-xl font-bold text-foreground">Histórico de Pagamentos</h1>
                  <p className="text-sm text-muted-foreground">Acompanhe todas as suas transações</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => user && fetchPayments(user.id)}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Atualizar
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              <div className="bg-card/90 backdrop-blur-xl border border-border/50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Receipt className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Total</span>
                </div>
                <span className="text-2xl font-bold">{stats.total}</span>
              </div>
              <div className="bg-card/90 backdrop-blur-xl border border-border/50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  <span className="text-xs text-muted-foreground">Pagos</span>
                </div>
                <span className="text-2xl font-bold text-success">{stats.paid}</span>
              </div>
              <div className="bg-card/90 backdrop-blur-xl border border-border/50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-warning" />
                  <span className="text-xs text-muted-foreground">Pendentes</span>
                </div>
                <span className="text-2xl font-bold text-warning">{stats.pending}</span>
              </div>
              <div className="bg-card/90 backdrop-blur-xl border border-border/50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-primary" />
                  <span className="text-xs text-muted-foreground">Volume</span>
                </div>
                <span className="text-lg font-bold text-primary">{formatPrice(stats.totalAmount)}</span>
              </div>
            </div>

            {/* Payments List */}
            <div className="bg-card/90 backdrop-blur-xl border border-border/50 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-border/50">
                <h2 className="font-semibold flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Transações
                </h2>
              </div>

              {payments.length === 0 ? (
                <div className="p-8 text-center">
                  <Receipt className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Nenhum pagamento encontrado</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-4"
                    onClick={() => navigate('/dashboard')}
                  >
                    Ir para Loja
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-border/50">
                  {payments.map((payment, index) => {
                    const statusInfo = getStatusInfo(payment.status);
                    const StatusIcon = statusInfo.icon;
                    const timeLeft = payment.status === 'pending' ? getTimeLeft(payment.created_at) : null;
                    const isExpired = payment.status === 'pending' && !timeLeft;
                    
                    return (
                      <motion.div
                        key={payment.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-4 hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0", statusInfo.bg)}>
                              <StatusIcon className={cn("w-5 h-5", statusInfo.color)} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-foreground truncate">
                                  {payment.order?.product_name || 'Pagamento'}
                                </span>
                                <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", statusInfo.bg, statusInfo.color)}>
                                  {isExpired ? 'Expirado' : statusInfo.label}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {formatDate(payment.created_at)}
                                </span>
                                {payment.order?.quantity && (
                                  <span>{payment.order.quantity}x sessions</span>
                                )}
                                <span className="uppercase">{payment.payment_method}</span>
                              </div>
                              {payment.paid_at && (
                                <p className="text-xs text-success mt-1">
                                  Pago em {formatDate(payment.paid_at)}
                                </p>
                              )}
                              
                              {/* Pending payment: show countdown and pay button */}
                              {payment.status === 'pending' && timeLeft && (
                                <div className="flex items-center gap-3 mt-2">
                                  <span className={cn(
                                    "text-xs font-mono font-bold px-2 py-1 rounded bg-warning/10",
                                    timeLeft.minutes < 5 ? "text-destructive" : "text-warning"
                                  )}>
                                    <Clock className="w-3 h-3 inline mr-1" />
                                    {String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
                                  </span>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    className="h-7 text-xs bg-primary/10 border-primary/30 hover:bg-primary/20 text-primary"
                                    onClick={() => handlePayNow(payment)}
                                  >
                                    <CreditCard className="w-3 h-3 mr-1" />
                                    Pagar Agora
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <span className="text-lg font-bold">{formatPrice(Number(payment.amount))}</span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Pagamentos;
