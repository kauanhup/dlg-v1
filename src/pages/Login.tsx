import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import AnimatedShaderBackground from "@/components/ui/animated-shader-background";
import { useAlertToast } from "@/hooks/use-alert-toast";
import { MorphingSquare } from "@/components/ui/morphing-square";
import { supabase } from "@/integrations/supabase/client";
import { Ban, MessageCircle, X, AlertTriangle, Wrench } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SystemSettings {
  maintenanceMode: boolean;
  allowRegistration: boolean;
}

const MAX_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [whatsappError, setWhatsappError] = useState("");
  const [nameError, setNameError] = useState("");
  const [honeypot, setHoneypot] = useState(""); // Honeypot field - should stay empty
  const [rateLimitError, setRateLimitError] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showBannedModal, setShowBannedModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    maintenanceMode: false,
    allowRegistration: true,
  });
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const toast = useAlertToast();
  
  const redirectUrl = searchParams.get("redirect") || "/dashboard";

  useEffect(() => {
    // Fetch system settings
    const fetchSystemSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('system_settings')
          .select('key, value');

        if (!error && data) {
          const settings: SystemSettings = {
            maintenanceMode: false,
            allowRegistration: true,
          };

          data.forEach((setting) => {
            if (setting.key === 'maintenance_mode') {
              settings.maintenanceMode = setting.value === 'true';
            }
            if (setting.key === 'allow_registrations') {
              settings.allowRegistration = setting.value === 'true';
            }
          });

          setSystemSettings(settings);

          // Show maintenance modal if in maintenance mode
          if (settings.maintenanceMode) {
            setShowMaintenanceModal(true);
          }
        }
      } catch (err) {
        console.error('Error fetching system settings:', err);
      }
    };

    fetchSystemSettings();

    // Check if user is already logged in
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // Check if user is banned
        const isBanned = await checkIfBanned(session.user.id);
        if (isBanned) {
          await supabase.auth.signOut();
          setShowBannedModal(true);
          setIsLoading(false);
          return;
        }
        
        // User is logged in, check their role and redirect
        const role = await getUserRole(session.user.id);
        if (role === 'admin') {
          navigate("/admin");
        } else {
          navigate(redirectUrl);
        }
      }
      
      setIsLoading(false);
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // Only synchronous state updates here
        if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session) {
          // Defer Supabase calls with setTimeout to avoid deadlock
          setTimeout(async () => {
            // Check if user is banned
            const isBanned = await checkIfBanned(session.user.id);
            if (isBanned) {
              await supabase.auth.signOut();
              setShowBannedModal(true);
              return;
            }
            
            const role = await getUserRole(session.user.id);
            if (role === 'admin') {
              navigate("/admin");
            } else {
              navigate(redirectUrl);
            }
          }, 0);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate, redirectUrl]);

  const checkIfBanned = async (userId: string): Promise<boolean> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('banned')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error || !data) {
      console.error('Error checking banned status:', error);
      return false;
    }
    
    return (data as any).banned === true;
  };

  const getUserRole = async (userId: string): Promise<string> => {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error || !data) {
      console.error('Error fetching user role:', error);
      return 'user';
    }
    
    return data.role;
  };

  const logLoginAttempt = async (userId: string, status: 'success' | 'failed', failureReason?: string) => {
    try {
      // Get browser/device info
      const userAgent = navigator.userAgent;
      let device = 'Navegador desconhecido';
      if (userAgent.includes('Chrome')) device = 'Google Chrome';
      else if (userAgent.includes('Firefox')) device = 'Mozilla Firefox';
      else if (userAgent.includes('Safari')) device = 'Safari';
      else if (userAgent.includes('Edge')) device = 'Microsoft Edge';

      await supabase.from('login_history').insert({
        user_id: userId,
        device,
        location: 'Brasil',
        status,
        failure_reason: failureReason || null,
      });
    } catch (error) {
      console.error('Error logging login attempt:', error);
    }
  };

  const validateEmail = (value: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  const validatePassword = (value: string) => {
    return value.length >= 8;
  };

  const validateWhatsapp = (value: string) => {
    return /^\+?[0-9]{10,15}$/.test(value.replace(/\s/g, ''));
  };

  const validateName = (value: string) => {
    return value.trim().length >= 2;
  };

  // Rate limiting using localStorage (works without auth)
  const getRateLimitKey = (emailToCheck: string) => `rate_limit_${emailToCheck.toLowerCase()}`;
  
  const checkRateLimit = (emailToCheck: string): boolean => {
    try {
      const key = getRateLimitKey(emailToCheck);
      const data = localStorage.getItem(key);
      
      if (!data) return true;
      
      const { attempts, lockedUntil } = JSON.parse(data);
      
      // Check if still locked
      if (lockedUntil && Date.now() < lockedUntil) {
        return false;
      }
      
      // Reset if lockout expired
      if (lockedUntil && Date.now() >= lockedUntil) {
        localStorage.removeItem(key);
        return true;
      }
      
      return attempts < MAX_ATTEMPTS;
    } catch {
      return true;
    }
  };
  
  const recordFailedAttempt = (emailToCheck: string) => {
    try {
      const key = getRateLimitKey(emailToCheck);
      const data = localStorage.getItem(key);
      
      let attempts = 1;
      let lockedUntil = null;
      
      if (data) {
        const parsed = JSON.parse(data);
        // Reset if lockout expired
        if (parsed.lockedUntil && Date.now() >= parsed.lockedUntil) {
          attempts = 1;
        } else {
          attempts = (parsed.attempts || 0) + 1;
        }
      }
      
      // Lock if max attempts reached
      if (attempts >= MAX_ATTEMPTS) {
        lockedUntil = Date.now() + LOCKOUT_MINUTES * 60 * 1000;
      }
      
      localStorage.setItem(key, JSON.stringify({ attempts, lockedUntil }));
    } catch {
      // Ignore localStorage errors
    }
  };
  
  const clearRateLimit = (emailToCheck: string) => {
    try {
      localStorage.removeItem(getRateLimitKey(emailToCheck));
    } catch {
      // Ignore
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Block all access if in maintenance mode
    if (systemSettings.maintenanceMode) {
      setShowMaintenanceModal(true);
      return;
    }

    // Block signup if registrations are disabled
    if (!isLogin && !systemSettings.allowRegistration) {
      toast.error("Cadastro desabilitado", "Novos registros estão temporariamente desabilitados.");
      return;
    }

    let valid = true;

    // Reset errors
    setEmailError("");
    setPasswordError("");
    setWhatsappError("");
    setNameError("");
    setRateLimitError("");

    if (!validateEmail(email)) {
      setEmailError("Por favor, insira um email válido.");
      valid = false;
    }

    if (!validatePassword(password)) {
      setPasswordError("A senha deve ter pelo menos 8 caracteres.");
      valid = false;
    }

    if (!isLogin) {
      if (!validateName(name)) {
        setNameError("Por favor, insira seu nome.");
        valid = false;
      }
      
      if (!validateWhatsapp(whatsapp)) {
        setWhatsappError("Por favor, insira um número válido.");
        valid = false;
      }
    }

    // Honeypot check - if filled, it's a bot
    if (honeypot) {
      // Silently reject - don't reveal it's a bot trap
      toast.error("Erro", "Ocorreu um erro inesperado. Tente novamente.");
      return;
    }

    // Rate limiting check (only for login)
    if (isLogin) {
      const allowed = checkRateLimit(email);
      if (!allowed) {
        setRateLimitError(`Muitas tentativas. Aguarde ${LOCKOUT_MINUTES} minutos.`);
        toast.error("Muitas tentativas", `Por segurança, aguarde ${LOCKOUT_MINUTES} minutos antes de tentar novamente.`);
        return;
      }
    }

    if (!valid) {
      toast.error("Erro de validação", "Verifique os campos e tente novamente.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (isLogin) {
        // Login
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          // Record failed attempt for rate limiting
          recordFailedAttempt(email);
          
          if (error.message.includes('Invalid login credentials')) {
            toast.error("Erro no login", "Email ou senha incorretos.");
          } else if (error.message.includes('Email not confirmed')) {
            toast.error("Erro no login", "Confirme seu email antes de entrar.");
          } else {
            toast.error("Erro no login", error.message);
          }
          setIsSubmitting(false);
          return;
        }

        // Check if user is banned after successful login
        if (data.user) {
          const isBanned = await checkIfBanned(data.user.id);
          if (isBanned) {
            await logLoginAttempt(data.user.id, 'failed', 'Conta banida');
            await supabase.auth.signOut();
            setShowBannedModal(true);
            setIsSubmitting(false);
            return;
          }
          
          // Log successful login and clear rate limit
          await logLoginAttempt(data.user.id, 'success');
          clearRateLimit(email);
        }

        toast.success("Login realizado!", "Bem-vindo de volta.");
        setIsSubmitting(false);
        
        // Redirect is handled by onAuthStateChange
      } else {
        // Signup
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              name: name.trim(),
              whatsapp: whatsapp.replace(/\s/g, ''),
            },
          },
        });

        if (error) {
          if (error.message.includes('User already registered')) {
            toast.error("Erro no cadastro", "Este email já está cadastrado.");
          } else {
            toast.error("Erro no cadastro", error.message);
          }
          setIsSubmitting(false);
          return;
        }

        toast.success("Conta criada!", "Sua conta foi criada com sucesso.");
        setIsSubmitting(false);
        
        // Redirect is handled by onAuthStateChange
      }
    } catch (error: any) {
      toast.error("Erro", error.message || "Ocorreu um erro inesperado.");
      setIsSubmitting(false);
    }
  };

  if (isLoading || isTransitioning) {
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

  const handleToggleMode = () => {
    // Block switching to signup if registrations are disabled
    if (isLogin && !systemSettings.allowRegistration) {
      toast.error("Cadastro desabilitado", "Novos registros estão temporariamente desabilitados.");
      return;
    }

    setIsTransitioning(true);
    setEmailError("");
    setPasswordError("");
    setWhatsappError("");
    setNameError("");
    setRateLimitError("");
    setHoneypot("");
    setTimeout(() => {
      setIsLogin(!isLogin);
      setIsTransitioning(false);
    }, 800);
  };

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center overflow-hidden px-4 py-8 sm:py-12">
      {/* Aurora Shader Background */}
      <div className="absolute inset-0 z-0">
        <AnimatedShaderBackground className="w-full h-full" />
      </div>

      {/* Decorative Grid - hidden on mobile */}
      <div className="absolute inset-0 z-[1] opacity-20 hidden sm:block">
        <div className="absolute top-[15%] left-[10%] w-px h-[200px] bg-gradient-to-b from-transparent via-primary/50 to-transparent" />
        <div className="absolute top-[25%] left-[10%] w-[100px] h-px bg-gradient-to-r from-primary/50 to-transparent" />
        <div className="absolute bottom-[20%] right-[15%] w-px h-[150px] bg-gradient-to-b from-transparent via-primary/50 to-transparent" />
        <div className="absolute bottom-[20%] right-[15%] w-[80px] h-px bg-gradient-to-l from-primary/50 to-transparent" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-sm sm:max-w-md animate-fade-in">

        {/* Form Card */}
        <div className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-2xl">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-display font-bold text-foreground">
              {isLogin ? "Entrar" : "Criar Conta"}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {isLogin 
                ? "Bem-vindo de volta! Entre na sua conta." 
                : "Crie sua conta para começar."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium text-foreground">
                  Nome completo
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="Seu nome"
                  className={`text-sm w-full py-3 px-4 border rounded-lg focus:outline-none focus:ring-2 bg-background text-foreground focus:ring-primary/50 transition-all ${
                    nameError ? "border-destructive" : "border-border/50"
                  }`}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isSubmitting}
                />
                {nameError && (
                  <p className="text-xs text-destructive">{nameError}</p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="seu@email.com"
                className={`text-sm w-full py-3 px-4 border rounded-lg focus:outline-none focus:ring-2 bg-background text-foreground focus:ring-primary/50 transition-all ${
                  emailError ? "border-destructive" : "border-border/50"
                }`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={!!emailError}
                aria-describedby="email-error"
                disabled={isSubmitting}
              />
              {emailError && (
                <p id="email-error" className="text-xs text-destructive">
                  {emailError}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                {isLogin ? "Senha" : "Criar senha"}
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                className={`text-sm w-full py-3 px-4 border rounded-lg focus:outline-none focus:ring-2 bg-background text-foreground focus:ring-primary/50 transition-all ${
                  passwordError ? "border-destructive" : "border-border/50"
                }`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={!!passwordError}
                aria-describedby="password-error"
                disabled={isSubmitting}
              />
              {passwordError && (
                <p id="password-error" className="text-xs text-destructive">
                  {passwordError}
                </p>
              )}
              {isLogin && (
                <button
                  type="button"
                  onClick={async () => {
                    if (!validateEmail(email)) {
                      toast.error("Email inválido", "Digite seu email para recuperar a senha.");
                      return;
                    }
                    const { error } = await supabase.auth.resetPasswordForEmail(email, {
                      redirectTo: `${window.location.origin}/login`,
                    });
                    if (error) {
                      toast.error("Erro", error.message);
                    } else {
                      toast.success("Email enviado!", "Verifique sua caixa de entrada.");
                    }
                  }}
                  className="text-xs text-primary hover:underline"
                >
                  Esqueceu sua senha?
                </button>
              )}
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <label htmlFor="whatsapp" className="text-sm font-medium text-foreground">
                  WhatsApp
                </label>
                <input
                  id="whatsapp"
                  type="tel"
                  placeholder="+55 11 99999-9999"
                  className={`text-sm w-full py-3 px-4 border rounded-lg focus:outline-none focus:ring-2 bg-background text-foreground focus:ring-primary/50 transition-all ${
                    whatsappError ? "border-destructive" : "border-border/50"
                  }`}
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  aria-invalid={!!whatsappError}
                  aria-describedby="whatsapp-error"
                  disabled={isSubmitting}
                />
                {whatsappError && (
                  <p id="whatsapp-error" className="text-xs text-destructive">
                    {whatsappError}
                  </p>
                )}
              </div>
            )}

            {/* Honeypot field - hidden from users, bots will fill it */}
            <div className="absolute -left-[9999px] opacity-0 h-0 overflow-hidden" aria-hidden="true">
              <label htmlFor="website">Website</label>
              <input
                type="text"
                id="website"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
              />
            </div>

            {rateLimitError && (
              <p className="text-sm text-destructive text-center">{rateLimitError}</p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Aguarde..." : isLogin ? "Entrar" : "Criar conta"}
            </button>

            {isLogin ? (
              systemSettings.allowRegistration ? (
                <p className="text-center text-sm text-muted-foreground">
                  Não tem uma conta?{" "}
                  <button
                    type="button"
                    onClick={handleToggleMode}
                    disabled={isSubmitting}
                    className="text-primary hover:underline font-medium disabled:opacity-50"
                  >
                    Criar conta
                  </button>
                </p>
              ) : null
            ) : (
              <p className="text-center text-sm text-muted-foreground">
                Já tem uma conta?{" "}
                <button
                  type="button"
                  onClick={handleToggleMode}
                  disabled={isSubmitting}
                  className="text-primary hover:underline font-medium disabled:opacity-50"
                >
                  Entrar
                </button>
              </p>
            )}
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Voltar para a página inicial
            </Link>
          </div>
        </div>
      </div>

      {/* Banned User Modal */}
      <AnimatePresence>
        {showBannedModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card border border-border rounded-2xl p-6 max-w-md w-full shadow-2xl"
            >
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/20 flex items-center justify-center">
                  <Ban className="w-8 h-8 text-destructive" />
                </div>
                <h2 className="text-xl font-bold text-foreground mb-2">
                  Conta Suspensa
                </h2>
                <p className="text-muted-foreground mb-6">
                  Sua conta foi suspensa. Se você acredita que isso foi um erro, entre em contato com o suporte.
                </p>
                <div className="flex flex-col gap-3">
                  <a
                    href="https://wa.me/5565996498222?text=Olá! Minha conta foi suspensa e gostaria de entender o motivo."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 py-3 px-4 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-all"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Contatar Suporte
                  </a>
                  <button
                    onClick={() => setShowBannedModal(false)}
                    className="py-2 px-4 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Maintenance Mode Modal */}
      <AnimatePresence>
        {showMaintenanceModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card border border-border rounded-2xl p-6 max-w-md w-full shadow-2xl"
            >
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-500/20 flex items-center justify-center">
                  <Wrench className="w-8 h-8 text-yellow-500" />
                </div>
                <h2 className="text-xl font-bold text-foreground mb-2">
                  Sistema em Manutenção
                </h2>
                <p className="text-muted-foreground mb-6">
                  O sistema está temporariamente em manutenção. Por favor, tente novamente mais tarde.
                </p>
                <div className="flex flex-col gap-3">
                  <a
                    href="https://wa.me/5565996498222?text=Olá! O sistema está em manutenção. Gostaria de saber quando estará disponível."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 py-3 px-4 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-all"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Contatar Suporte
                  </a>
                  <button
                    onClick={() => setShowMaintenanceModal(false)}
                    className="py-2 px-4 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Login;
