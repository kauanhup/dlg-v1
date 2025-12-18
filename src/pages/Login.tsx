import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import AnimatedShaderBackground from "@/components/ui/animated-shader-background";
import { useAlertToast } from "@/hooks/use-alert-toast";
import { MorphingSquare } from "@/components/ui/morphing-square";
import { supabase } from "@/integrations/supabase/client";
import { Ban, MessageCircle, Wrench, Mail } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SystemSettings {
  maintenanceMode: boolean;
  allowRegistration: boolean;
}

interface RecaptchaSettings {
  enabled: boolean;
  siteKey: string;
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
  const [showEmailVerificationModal, setShowEmailVerificationModal] = useState(false);
  const [isResendingCode, setIsResendingCode] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendCount, setResendCount] = useState(0);
  const [resendRecaptchaToken, setResendRecaptchaToken] = useState<string | null>(null);
  const resendRecaptchaRef = useRef<ReCAPTCHA>(null);
  const [pendingEmail, setPendingEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [pendingPassword, setPendingPassword] = useState("");
  const [pendingName, setPendingName] = useState("");
  const [pendingWhatsapp, setPendingWhatsapp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    maintenanceMode: false,
    allowRegistration: true,
  });
  const [recaptchaSettings, setRecaptchaSettings] = useState<RecaptchaSettings>({
    enabled: false,
    siteKey: '',
  });
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);
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

    // Fetch reCAPTCHA settings
    const fetchRecaptchaSettings = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('pixup', {
          body: { action: 'get_public_settings' }
        });
        
        if (!error && data?.success && data?.data) {
          if (data.data.recaptcha_enabled && data.data.recaptcha_site_key) {
            setRecaptchaSettings({
              enabled: true,
              siteKey: data.data.recaptcha_site_key,
            });
          }
        }
      } catch (err) {
        console.error('Error fetching reCAPTCHA settings:', err);
      }
    };

    fetchRecaptchaSettings();

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

    // Listen for auth changes (minimal - no duplicate ban checks)
    // Note: All validation happens in edge function BEFORE auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // Only handle sign out events
        if (event === 'SIGNED_OUT') {
          setIsLoading(false);
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

  // Check if profile exists (email confirmed)
  const checkProfileExists = async (userId: string): Promise<boolean> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) {
      console.error('Error checking profile:', error);
      return false;
    }
    
    return data !== null;
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
    // Remove all non-digits for validation
    const digitsOnly = value.replace(/\D/g, '');
    return digitsOnly.length >= 10 && digitsOnly.length <= 15;
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

    // Rate limiting check (for both login AND signup)
    const allowed = checkRateLimit(email);
    if (!allowed) {
      setRateLimitError(`Muitas tentativas. Aguarde ${LOCKOUT_MINUTES} minutos.`);
      toast.error("Muitas tentativas", `Por segurança, aguarde ${LOCKOUT_MINUTES} minutos antes de tentar novamente.`);
      return;
    }

    if (!valid) {
      toast.error("Erro de validação", "Verifique os campos e tente novamente.");
      return;
    }

    // reCAPTCHA validation
    if (recaptchaSettings.enabled && !recaptchaToken) {
      toast.error("Verificação necessária", "Complete a verificação reCAPTCHA.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (isLogin) {
        // STEP 1: Validate login via edge function (NOT authentication)
        // Edge function only validates: maintenance, banned, profile exists
        const { data: validationData, error: validationError } = await supabase.functions.invoke('login', {
          body: {
            email: email.trim().toLowerCase(),
            honeypot,
            recaptchaToken: recaptchaToken || undefined,
          },
        });

        if (validationError) {
          recordFailedAttempt(email);
          toast.error("Erro no login", "Ocorreu um erro inesperado. Tente novamente.");
          setIsSubmitting(false);
          return;
        }

        if (!validationData?.success) {
          recordFailedAttempt(email);
          
          // Handle specific error codes from validation
          if (validationData?.code === 'MAINTENANCE') {
            setShowMaintenanceModal(true);
          } else if (validationData?.code === 'BANNED') {
            setShowBannedModal(true);
          } else {
            // Generic error - could be profile not found (not activated) or invalid email
            // Check if it's a "not activated" scenario
            if (validationData?.error === "Credenciais inválidas") {
              // Could be profile doesn't exist - show generic error
              toast.error("Erro no login", "Credenciais inválidas");
            } else {
              toast.error("Erro no login", validationData?.error || "Credenciais inválidas");
            }
          }
          setIsSubmitting(false);
          return;
        }

        // STEP 2: Now authenticate in frontend (session created here, NOT in edge function)
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });

        if (authError || !authData.session) {
          recordFailedAttempt(email);
          toast.error("Erro no login", "Credenciais inválidas");
          setIsSubmitting(false);
          return;
        }

        // Log successful login attempt
        if (validationData.userId) {
          await logLoginAttempt(validationData.userId, 'success');
        }

        // Clear rate limit on success
        clearRateLimit(email);

        toast.success("Login realizado!", "Bem-vindo de volta.");
        setIsSubmitting(false);

        // Redirect based on role (from validation response)
        if (validationData.role === 'admin') {
          navigate("/admin");
        } else {
          navigate(redirectUrl);
        }
      } else {
        // Signup via secure edge function with honeypot
        const { data, error } = await supabase.functions.invoke('register', {
          body: {
            email: email.trim().toLowerCase(),
            password,
            name: name.trim(),
            whatsapp: whatsapp.replace(/\D/g, ''), // Remove all non-digits
            honeypot, // Send honeypot for bot detection
            recaptchaToken: recaptchaToken || undefined,
          },
        });

        // Edge function now always returns 200, so data contains the response
        if (error) {
          recordFailedAttempt(email);
          toast.error("Erro no cadastro", "Ocorreu um erro ao criar sua conta. Tente novamente.");
          setIsSubmitting(false);
          return;
        }

        if (!data?.success) {
          recordFailedAttempt(email);
          
          const errorCode = data?.code || '';
          const errorMessage = data?.error || '';
          
          // Handle specific error codes with appropriate messages
          if (errorCode === "EMAIL_EXISTS") {
            toast.error("Email já cadastrado", errorMessage || "Este email já possui uma conta. Faça login.");
            // Auto-switch to login and keep email
            setTimeout(() => {
              setIsLogin(true);
              setEmail(email.trim().toLowerCase());
              setPassword("");
              setName("");
              setWhatsapp("");
              setHoneypot("");
              recaptchaRef.current?.reset();
              setRecaptchaToken(null);
            }, 1500);
          } else if (errorCode === "RATE_LIMITED" || errorCode === "RATE_LIMIT_IP") {
            toast.error("Muitas tentativas", errorMessage || "Aguarde alguns minutos.");
          } else if (errorCode === "RECAPTCHA_FAILED" || errorCode === "RECAPTCHA_REQUIRED") {
            toast.error("Verificação de segurança", errorMessage || "Complete o reCAPTCHA.");
            recaptchaRef.current?.reset();
            setRecaptchaToken(null);
          } else if (errorCode === "MAINTENANCE") {
            toast.error("Sistema em manutenção", errorMessage || "Tente novamente mais tarde.");
          } else if (errorCode === "DISABLED") {
            toast.error("Cadastro desativado", errorMessage || "Não é possível criar conta no momento.");
          } else {
            // Show the backend error message if available
            toast.error("Erro no cadastro", errorMessage || "Não foi possível criar a conta.");
          }
          
          setIsSubmitting(false);
          return;
        }

        // Clear rate limit on success
        clearRateLimit(email);

        // Check if email confirmation is required (code verification)
        if (data.requiresEmailConfirmation) {
          // Store pending data for verification step
          setPendingEmail(email.trim().toLowerCase());
          setPendingPassword(password);
          setPendingName(name.trim());
          setPendingWhatsapp(whatsapp.replace(/\D/g, ''));
          setShowEmailVerificationModal(true);
          setResendCooldown(60); // Start cooldown for first code
          toast.success("Código enviado!", "Verifique seu email e insira o código.");
          // Reset only visible form fields
          setEmail("");
          setPassword("");
          setName("");
          setWhatsapp("");
          setHoneypot("");
          // Reset reCAPTCHA
          recaptchaRef.current?.reset();
          setRecaptchaToken(null);
        } else {
          toast.success("Conta criada!", "Faça login para continuar.");
          // Switch to login mode
          setIsLogin(true);
          setEmail("");
          setPassword("");
          setName("");
          setWhatsapp("");
          setHoneypot("");
          // Reset reCAPTCHA
          recaptchaRef.current?.reset();
          setRecaptchaToken(null);
        }
        
        setIsSubmitting(false);
      }
    } catch (error: any) {
      recordFailedAttempt(email);
      toast.error("Erro", error.message || "Ocorreu um erro inesperado.");
      setIsSubmitting(false);
      // Reset reCAPTCHA on error
      recaptchaRef.current?.reset();
      setRecaptchaToken(null);
    }
  };

  // Handle email verification code submission
  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast.error("Código inválido", "Digite o código de 6 dígitos.");
      return;
    }

    setIsVerifying(true);
    try {
      const { data, error } = await supabase.functions.invoke('register', {
        body: {
          action: 'verify_code',
          email: pendingEmail,
          password: pendingPassword,
          name: pendingName,
          whatsapp: pendingWhatsapp,
          verificationCode,
        },
      });

      if (error) {
        toast.error("Erro", "Ocorreu um erro ao verificar o código.");
        setIsVerifying(false);
        return;
      }

      if (!data?.success) {
        const errorCode = data?.code || '';
        const errorMessage = data?.error || '';
        
        // Handle code invalidation (too many wrong attempts)
        if (errorCode === 'CODE_INVALIDATED') {
          toast.error("Código invalidado", errorMessage || "Muitas tentativas incorretas. Solicite um novo código.");
          setVerificationCode("");
          setIsVerifying(false);
          return;
        }
        toast.error("Código inválido", errorMessage || "O código está incorreto ou expirado.");
        setIsVerifying(false);
        return;
      }

      // Success - close modal and switch to login
      toast.success("Conta criada!", "Faça login para continuar.");
      setShowEmailVerificationModal(false);
      setVerificationCode("");
      setPendingEmail("");
      setPendingPassword("");
      setPendingName("");
      setPendingWhatsapp("");
      setResendCount(0);
      setResendCooldown(0);
      setResendRecaptchaToken(null);
      setIsLogin(true);
    } catch (err: any) {
      toast.error("Erro", "Erro ao verificar código.");
    } finally {
      setIsVerifying(false);
    }
  };

  // Handle resend verification code
  const handleResendCode = async () => {
    if (resendCooldown > 0) return;
    
    if (!pendingEmail || !pendingName || !pendingWhatsapp) {
      toast.error("Erro", "Dados incompletos para reenvio.");
      return;
    }

    // Always require reCAPTCHA on resends (prevents refresh bypass)
    if (recaptchaSettings.enabled && !resendRecaptchaToken) {
      toast.error("Verificação necessária", "Complete o reCAPTCHA para reenviar.");
      return;
    }

    setIsResendingCode(true);
    try {
      const { data, error } = await supabase.functions.invoke('register', {
        body: {
          action: 'register',
          email: pendingEmail,
          password: pendingPassword,
          name: pendingName,
          whatsapp: pendingWhatsapp,
          recaptchaToken: recaptchaSettings.enabled ? resendRecaptchaToken : undefined,
        },
      });

      if (error) {
        toast.error("Erro", "Não foi possível reenviar o código.");
        return;
      }

      if (data?.code === 'RATE_LIMITED') {
        toast.error("Limite atingido", data?.error || "Muitos códigos enviados. Aguarde 30 minutos.");
        return;
      }

      if (data?.code === 'EMAIL_EXISTS') {
        toast.error("Email já cadastrado", data?.error || "Este email já possui uma conta.");
        return;
      }

      if (data?.success && data?.requiresEmailConfirmation) {
        toast.success("Código reenviado!", "Verifique seu email.");
        setVerificationCode("");
        setResendCount(prev => prev + 1);
        setResendCooldown(60);
        // Reset resend reCAPTCHA
        resendRecaptchaRef.current?.reset();
        setResendRecaptchaToken(null);
      } else {
        toast.error("Erro", data?.error || "Não foi possível reenviar o código.");
      }
    } catch (err) {
      toast.error("Erro", "Erro ao reenviar código.");
    } finally {
      setIsResendingCode(false);
    }
  };

  // Cooldown timer effect
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

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
    
    // Reset ALL fields and errors when switching modes
    setEmail("");
    setPassword("");
    setName("");
    setWhatsapp("");
    setEmailError("");
    setPasswordError("");
    setWhatsappError("");
    setNameError("");
    setRateLimitError("");
    setHoneypot("");
    
    // Reset reCAPTCHA when switching modes
    recaptchaRef.current?.reset();
    setRecaptchaToken(null);
    
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
                <a
                  href="/recuperar-senha"
                  className="text-xs text-primary hover:underline"
                >
                  Esqueceu sua senha?
                </a>
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

            {/* reCAPTCHA Widget */}
            {recaptchaSettings.enabled && recaptchaSettings.siteKey && (
              <div className="flex justify-center">
                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey={recaptchaSettings.siteKey}
                  onChange={(token) => setRecaptchaToken(token)}
                  onExpired={() => setRecaptchaToken(null)}
                  theme="dark"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || (recaptchaSettings.enabled && !recaptchaToken)}
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

      {/* Email Verification Code Modal */}
      <AnimatePresence>
        {showEmailVerificationModal && (
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
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
                  <Mail className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-foreground mb-2">
                  Verificar Email
                </h2>
                <p className="text-muted-foreground mb-2">
                  Enviamos um código de verificação para:
                </p>
                <p className="text-primary font-medium mb-4">
                  {pendingEmail}
                </p>
                <p className="text-sm text-muted-foreground mb-2">
                  Digite o código de 6 dígitos:
                </p>
                <p className="text-xs text-muted-foreground/70 mb-4">
                  O código expira em 15 minutos
                </p>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground text-center text-2xl tracking-widest placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 mb-4"
                  disabled={isVerifying || isResendingCode}
                />
                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleVerifyCode}
                    disabled={isVerifying || isResendingCode || verificationCode.length !== 6}
                    className="py-3 px-4 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50"
                  >
                    {isVerifying ? "Verificando..." : "Verificar Código"}
                  </button>
                  
                  {/* Always show reCAPTCHA for resend (prevents refresh bypass) */}
                  {recaptchaSettings.enabled && recaptchaSettings.siteKey && resendCooldown === 0 && (
                    <div className="flex justify-center py-2">
                      <ReCAPTCHA
                        ref={resendRecaptchaRef}
                        sitekey={recaptchaSettings.siteKey}
                        onChange={(token) => setResendRecaptchaToken(token)}
                        onExpired={() => setResendRecaptchaToken(null)}
                        theme="dark"
                        size="compact"
                      />
                    </div>
                  )}
                  
                  <button
                    onClick={handleResendCode}
                    disabled={
                      isVerifying || 
                      isResendingCode || 
                      resendCooldown > 0 || 
                      (recaptchaSettings.enabled && !resendRecaptchaToken)
                    }
                    className="py-2 px-4 text-primary hover:text-primary/80 transition-colors text-sm disabled:opacity-50"
                  >
                    {isResendingCode 
                      ? "Reenviando..." 
                      : resendCooldown > 0 
                        ? `Reenviar código (${resendCooldown}s)` 
                        : recaptchaSettings.enabled && !resendRecaptchaToken
                          ? "Complete o captcha"
                          : "Reenviar código"}
                  </button>
                  <button
                    onClick={() => {
                      setShowEmailVerificationModal(false);
                      setVerificationCode("");
                      setPendingEmail("");
                      setPendingPassword("");
                      setPendingName("");
                      setPendingWhatsapp("");
                      setResendCooldown(0);
                      setResendCount(0);
                      setResendRecaptchaToken(null);
                      resendRecaptchaRef.current?.reset();
                    }}
                    className="py-2 px-4 text-muted-foreground hover:text-foreground transition-colors"
                    disabled={isVerifying || isResendingCode}
                  >
                    Cancelar
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
