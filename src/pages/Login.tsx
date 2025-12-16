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

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [whatsappError, setWhatsappError] = useState("");
  const [nameError, setNameError] = useState("");
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
          
          // Log successful login
          await logLoginAttempt(data.user.id, 'success');
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
                    Cadastre-se
                  </button>
                </p>
              ) : (
                <p className="text-center text-sm text-muted-foreground">
                  <span className="text-warning">Cadastros temporariamente desabilitados</span>
                </p>
              )
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
        </div>

        {/* Back to home */}
        <div className="text-center mt-6">
          <Link 
            to="/" 
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Voltar ao início
          </Link>
        </div>
      </div>

      {/* Banned User Modal */}
      <AnimatePresence>
        {showBannedModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background z-50"
            />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="fixed inset-0 z-50 flex items-center justify-center p-6"
            >
              <div className="w-full max-w-md text-center">
                {/* Decorative elements */}
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-destructive/5 rounded-full blur-3xl -z-10" />
                <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-primary/5 rounded-full blur-3xl -z-10" />
                
                {/* Icon */}
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                  className="mb-8"
                >
                  <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-destructive/20 to-destructive/5 border border-destructive/20 flex items-center justify-center">
                    <Ban className="w-10 h-10 text-destructive" />
                  </div>
                </motion.div>
                
                {/* Content */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                >
                  <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
                    Conta Suspensa
                  </h1>
                  <p className="text-muted-foreground text-lg max-w-sm mx-auto mb-8 leading-relaxed">
                    Sua conta foi suspensa. Se acredita que isso é um erro, entre em contato com o suporte.
                  </p>
                </motion.div>
                
                {/* Actions */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.4 }}
                  className="flex flex-col sm:flex-row gap-3 justify-center"
                >
                  <a
                    href="https://wa.me/5565996498222?text=Olá! Minha conta foi suspensa e gostaria de entender o motivo."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 transition-all glow-sm"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Falar com Suporte
                  </a>
                  <button
                    onClick={() => setShowBannedModal(false)}
                    className="inline-flex items-center justify-center px-6 py-3 bg-secondary text-secondary-foreground font-medium rounded-xl hover:bg-secondary/80 transition-all"
                  >
                    Voltar
                  </button>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Maintenance Mode Modal */}
      <AnimatePresence>
        {showMaintenanceModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background z-50"
            />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="fixed inset-0 z-50 flex items-center justify-center p-6"
            >
              <div className="w-full max-w-md text-center">
                {/* Decorative elements */}
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10" />
                <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-warning/5 rounded-full blur-3xl -z-10" />
                
                {/* Icon */}
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                  className="mb-8"
                >
                  <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-warning/20 to-warning/5 border border-warning/20 flex items-center justify-center">
                    <Wrench className="w-10 h-10 text-warning" />
                  </div>
                </motion.div>
                
                {/* Content */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                >
                  <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
                    Em Manutenção
                  </h1>
                  <p className="text-muted-foreground text-lg max-w-sm mx-auto mb-8 leading-relaxed">
                    Estamos realizando melhorias no sistema. Voltamos em breve!
                  </p>
                </motion.div>
                
                {/* Actions */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.4 }}
                  className="flex flex-col sm:flex-row gap-3 justify-center"
                >
                  <a
                    href="https://wa.me/5565996498222?text=Olá! O sistema está em manutenção, quando volta?"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 transition-all glow-sm"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Falar com Suporte
                  </a>
                  <button
                    onClick={() => setShowMaintenanceModal(false)}
                    className="inline-flex items-center justify-center px-6 py-3 bg-secondary text-secondary-foreground font-medium rounded-xl hover:bg-secondary/80 transition-all"
                  >
                    Tentar Novamente
                  </button>
                </motion.div>
                
                {/* Footer */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.4 }}
                  className="text-sm text-muted-foreground mt-12"
                >
                  Agradecemos a compreensão
                </motion.p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Login;