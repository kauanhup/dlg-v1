import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import AnimatedShaderBackground from "@/components/ui/animated-shader-background";
import { useAlertToast } from "@/hooks/use-alert-toast";
import { MorphingSquare } from "@/components/ui/morphing-square";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Mail, Key, Lock, CheckCircle, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

type Step = 'email' | 'code' | 'password' | 'success';

const RecuperarSenha = () => {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [honeypot, setHoneypot] = useState(""); // Honeypot for bot detection
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingSettings, setIsCheckingSettings] = useState(true);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [recaptchaEnabled, setRecaptchaEnabled] = useState(false);
  const [recaptchaSiteKey, setRecaptchaSiteKey] = useState("");
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const navigate = useNavigate();
  const toast = useAlertToast();

  useEffect(() => {
    document.documentElement.classList.add('dark');
    
    // Check system settings and if password recovery is enabled
    const checkSettings = async () => {
      try {
        // Check maintenance mode
        const { data: settingsData } = await supabase
          .from('system_settings')
          .select('key, value')
          .in('key', ['maintenance_mode']);

        settingsData?.forEach((setting) => {
          if (setting.key === 'maintenance_mode' && setting.value === 'true') {
            setIsMaintenanceMode(true);
          }
        });

        // Check if password recovery is enabled via pixup function (also gets reCAPTCHA settings)
        const { data: publicSettings } = await supabase.functions.invoke('pixup', {
          body: { action: 'get_public_settings' }
        });
        
        if (publicSettings?.success && publicSettings?.data) {
          if (publicSettings.data.password_recovery_enabled) {
            setIsEnabled(true);
          }
          if (publicSettings.data.recaptcha_enabled && publicSettings.data.recaptcha_site_key) {
            setRecaptchaEnabled(true);
            setRecaptchaSiteKey(publicSettings.data.recaptcha_site_key);
          }
        }
      } catch (err) {
        console.error('Error checking settings:', err);
      } finally {
        setIsCheckingSettings(false);
      }
    };

    checkSettings();
  }, []);

  const handleRequestCode = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Email inválido", "Digite um email válido.");
      return;
    }

    // Honeypot check - if filled, silently reject (bot detected)
    if (honeypot) {
      toast.success("Solicitação enviada!", "Se o email existir, você receberá um código.");
      setStep('code');
      return;
    }

    // reCAPTCHA validation
    if (recaptchaEnabled && !recaptchaToken) {
      toast.error("Verificação necessária", "Complete a verificação reCAPTCHA.");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('forgot-password', {
        body: { 
          action: 'request_code',
          email: email.trim().toLowerCase(),
          honeypot,
          recaptchaToken: recaptchaToken || undefined
        }
      });

      if (error) throw error;

      // Handle specific error codes
      if (!data?.success) {
        if (data?.code === 'MAINTENANCE') {
          setIsMaintenanceMode(true);
          toast.error("Sistema em manutenção", "Tente novamente mais tarde.");
        } else if (data?.code === 'DISABLED') {
          setIsEnabled(false);
          toast.error("Recurso desabilitado", "Recuperação de senha não está disponível.");
        } else {
          toast.error("Erro", data?.error || "Não foi possível processar a solicitação.");
        }
        return;
      }

      // Always show success message (generic - never reveal if email exists)
      toast.success("Solicitação enviada!", data?.message || "Se o email existir, você receberá um código.");
      setStep('code');
      // Reset reCAPTCHA
      recaptchaRef.current?.reset();
      setRecaptchaToken(null);
    } catch (err: any) {
      console.error('Error requesting code:', err);
      toast.error("Erro", "Erro ao processar solicitação.");
      recaptchaRef.current?.reset();
      setRecaptchaToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!code || code.length !== 6) {
      toast.error("Código inválido", "Digite o código de 6 dígitos.");
      return;
    }

    // Honeypot check for code verification
    if (honeypot) {
      toast.error("Código inválido", "O código está incorreto ou expirado.");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('forgot-password', {
        body: { 
          action: 'verify_code',
          email: email.trim().toLowerCase(),
          code,
          honeypot
        }
      });

      if (error) throw error;

      if (data?.success) {
        toast.success("Código verificado!", "Agora defina sua nova senha.");
        setStep('password');
      } else {
        toast.error("Código inválido", data?.error || "O código está incorreto ou expirado.");
      }
    } catch (err: any) {
      console.error('Error verifying code:', err);
      toast.error("Erro", "Erro ao verificar código.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (password.length < 8) {
      toast.error("Senha fraca", "A senha deve ter pelo menos 8 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Senhas diferentes", "As senhas não coincidem.");
      return;
    }

    // Honeypot check
    if (honeypot) {
      toast.error("Erro", "Não foi possível alterar a senha.");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('forgot-password', {
        body: { 
          action: 'reset_password',
          email: email.trim().toLowerCase(),
          code,
          newPassword: password,
          honeypot
        }
      });

      if (error) throw error;

      if (data?.success) {
        toast.success("Senha alterada!", data?.message || "Faça login com sua nova senha.");
        setStep('success');
        // Clear form data
        setEmail("");
        setCode("");
        setPassword("");
        setConfirmPassword("");
      } else {
        toast.error("Erro", data?.error || "Não foi possível alterar a senha.");
      }
    } catch (err: any) {
      console.error('Error resetting password:', err);
      toast.error("Erro", "Erro ao alterar senha.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingSettings) {
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

  if (isMaintenanceMode) {
    return (
      <div className="min-h-screen w-full relative flex items-center justify-center overflow-hidden p-4">
        <div className="absolute inset-0 z-0">
          <AnimatedShaderBackground className="w-full h-full" />
        </div>
        <div className="relative z-10 bg-card/80 backdrop-blur-xl border border-border/50 rounded-xl p-8 max-w-md w-full text-center shadow-2xl">
          <Mail className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-foreground mb-2">Sistema em Manutenção</h1>
          <p className="text-muted-foreground mb-6">
            O sistema está temporariamente indisponível. Tente novamente mais tarde.
          </p>
          <Button onClick={() => navigate('/login')} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Login
          </Button>
        </div>
      </div>
    );
  }

  if (!isEnabled) {
    return (
      <div className="min-h-screen w-full relative flex items-center justify-center overflow-hidden p-4">
        <div className="absolute inset-0 z-0">
          <AnimatedShaderBackground className="w-full h-full" />
        </div>
        <div className="relative z-10 bg-card/80 backdrop-blur-xl border border-border/50 rounded-xl p-8 max-w-md w-full text-center shadow-2xl">
          <Mail className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-xl font-bold text-foreground mb-2">Recurso Desabilitado</h1>
          <p className="text-muted-foreground mb-6">
            A recuperação de senha por email não está habilitada no momento.
          </p>
          <Button onClick={() => navigate('/login')} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen min-h-[100dvh] w-full flex flex-col lg:flex-row overflow-hidden">
      {/* Left Side - Branding & Visual (hidden on mobile/tablet) */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-1/2 relative bg-gradient-to-br from-primary/10 via-background to-background overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-[20%] left-[20%] w-48 xl:w-72 h-48 xl:h-72 bg-primary/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-[30%] right-[10%] w-64 xl:w-96 h-64 xl:h-96 bg-primary/10 rounded-full blur-3xl animate-pulse delay-1000" />
          </div>
          {/* Grid Pattern */}
          <div className="absolute inset-0 opacity-[0.03]" 
            style={{
              backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
              backgroundSize: '50px 50px'
            }}
          />
        </div>
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-8 lg:px-10 xl:px-16 2xl:px-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Title */}
            <h1 className="text-3xl lg:text-4xl xl:text-5xl font-display font-bold text-foreground mb-3 lg:mb-4 leading-tight">
              Recuperar<br />sua senha
            </h1>
            
            <p className="text-base lg:text-lg text-muted-foreground max-w-sm lg:max-w-md mb-6 lg:mb-8">
              Não se preocupe, vamos ajudá-lo a recuperar o acesso à sua conta de forma segura.
            </p>

            {/* Features */}
            <div className="space-y-3 lg:space-y-4">
              {[
                { icon: "1", text: "Digite seu email cadastrado" },
                { icon: "2", text: "Receba o código de verificação" },
                { icon: "3", text: "Crie uma nova senha segura" },
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 + i * 0.1 }}
                  className="flex items-center gap-2 lg:gap-3"
                >
                  <span className="w-5 lg:w-6 h-5 lg:h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs lg:text-sm font-medium shrink-0">
                    {feature.icon}
                  </span>
                  <span className="text-sm lg:text-base text-muted-foreground">{feature.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 lg:w-[55%] xl:w-1/2 flex items-center justify-center p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12 bg-background relative min-h-screen lg:min-h-0">
        {/* Mobile/Tablet Background */}
        <div className="absolute inset-0 lg:hidden">
          <AnimatedShaderBackground className="w-full h-full opacity-20" />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-[400px] sm:max-w-[420px] relative z-10"
        >
          {/* Form Card */}
          <div className="bg-card/95 backdrop-blur-xl border border-border/50 rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 shadow-xl">
            {/* Header */}
            <div className="text-center mb-5 sm:mb-6">
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                {step === 'email' && <Mail className="w-7 h-7 text-primary" />}
                {step === 'code' && <Key className="w-7 h-7 text-primary" />}
                {step === 'password' && <Lock className="w-7 h-7 text-primary" />}
                {step === 'success' && <CheckCircle className="w-7 h-7 text-green-500" />}
              </div>
              <h2 className="text-xl sm:text-2xl font-display font-bold text-foreground">
                {step === 'email' && "Recuperar Senha"}
                {step === 'code' && "Verificar Código"}
                {step === 'password' && "Nova Senha"}
                {step === 'success' && "Senha Alterada!"}
              </h2>
              <p className="text-muted-foreground text-xs sm:text-sm mt-1.5 sm:mt-2">
                {step === 'email' && "Digite seu email para receber um código."}
                {step === 'code' && "Digite o código de 6 dígitos enviado."}
                {step === 'password' && "Defina sua nova senha segura."}
                {step === 'success' && "Sua senha foi alterada com sucesso."}
              </p>
            </div>

            {/* Steps Progress */}
            <div className="flex items-center justify-center gap-2 mb-6">
              {['email', 'code', 'password', 'success'].map((s, i) => (
                <div 
                  key={s}
                  className={`w-2.5 h-2.5 rounded-full transition-colors ${
                    ['email', 'code', 'password', 'success'].indexOf(step) >= i 
                      ? 'bg-primary' 
                      : 'bg-muted'
                  }`}
                />
              ))}
            </div>

            <AnimatePresence mode="wait">
              {/* Step 1: Email */}
              {step === 'email' && (
                <motion.div
                  key="email"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="space-y-1 sm:space-y-1.5">
                    <label className="text-xs sm:text-sm font-medium text-foreground">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      className="text-sm w-full py-2 sm:py-2.5 px-3 sm:px-4 border rounded-lg focus:outline-none focus:ring-2 bg-background text-foreground border-border focus:ring-primary/50 transition-all"
                      disabled={isLoading}
                    />
                  </div>
                  {/* Honeypot field */}
                  <div className="absolute -left-[9999px] opacity-0 h-0 overflow-hidden" aria-hidden="true">
                    <label htmlFor="website-recovery">Website</label>
                    <input
                      type="text"
                      id="website-recovery"
                      name="website"
                      tabIndex={-1}
                      autoComplete="off"
                      value={honeypot}
                      onChange={(e) => setHoneypot(e.target.value)}
                    />
                  </div>
                  {/* reCAPTCHA Widget */}
                  {recaptchaEnabled && recaptchaSiteKey && (
                    <div className="flex justify-center">
                      <ReCAPTCHA
                        ref={recaptchaRef}
                        sitekey={recaptchaSiteKey}
                        onChange={(token) => setRecaptchaToken(token)}
                        onExpired={() => setRecaptchaToken(null)}
                        theme="dark"
                      />
                    </div>
                  )}
                  <Button 
                    onClick={handleRequestCode} 
                    disabled={isLoading || (recaptchaEnabled && !recaptchaToken)} 
                    className="w-full"
                  >
                    {isLoading ? <Spinner size="sm" className="mr-2" /> : null}
                    {isLoading ? "Enviando..." : "Enviar Código"}
                  </Button>
                </motion.div>
              )}

              {/* Step 2: Code */}
              {step === 'code' && (
                <motion.div
                  key="code"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="space-y-1 sm:space-y-1.5">
                    <label className="text-xs sm:text-sm font-medium text-foreground">Código de Verificação</label>
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="000000"
                      maxLength={6}
                      className="text-sm w-full py-2 sm:py-2.5 px-3 sm:px-4 border rounded-lg focus:outline-none focus:ring-2 bg-background text-foreground border-border focus:ring-primary/50 transition-all text-center text-xl tracking-widest"
                      disabled={isLoading}
                    />
                    <p className="text-xs text-muted-foreground text-center">
                      Enviado para {email}
                    </p>
                  </div>
                  <Button 
                    onClick={handleVerifyCode} 
                    disabled={isLoading || code.length !== 6} 
                    className="w-full"
                  >
                    {isLoading ? <Spinner size="sm" className="mr-2" /> : null}
                    {isLoading ? "Verificando..." : "Verificar Código"}
                  </Button>
                  <button 
                    onClick={() => {
                      setStep('email');
                      setCode("");
                    }}
                    className="w-full text-xs text-muted-foreground hover:text-foreground"
                    disabled={isLoading}
                  >
                    Usar outro email
                  </button>
                </motion.div>
              )}

              {/* Step 3: New Password */}
              {step === 'password' && (
                <motion.div
                  key="password"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="space-y-1 sm:space-y-1.5">
                    <label className="text-xs sm:text-sm font-medium text-foreground">Nova Senha</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="text-sm w-full py-2 sm:py-2.5 px-3 sm:px-4 pr-10 border rounded-lg focus:outline-none focus:ring-2 bg-background text-foreground border-border focus:ring-primary/50 transition-all"
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1 sm:space-y-1.5">
                    <label className="text-xs sm:text-sm font-medium text-foreground">Confirmar Senha</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="text-sm w-full py-2 sm:py-2.5 px-3 sm:px-4 pr-10 border rounded-lg focus:outline-none focus:ring-2 bg-background text-foreground border-border focus:ring-primary/50 transition-all"
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        tabIndex={-1}
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <Button 
                    onClick={handleResetPassword} 
                    disabled={isLoading} 
                    className="w-full"
                  >
                    {isLoading ? <Spinner size="sm" className="mr-2" /> : null}
                    {isLoading ? "Alterando..." : "Alterar Senha"}
                  </Button>
                </motion.div>
              )}

              {/* Step 4: Success */}
              {step === 'success' && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center"
                >
                  <Button 
                    onClick={() => navigate('/login')} 
                    className="w-full"
                  >
                    Ir para Login
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Back to login */}
            {step !== 'success' && (
              <div className="mt-5 text-center">
                <button 
                  onClick={() => navigate('/login')}
                  className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-2"
                  disabled={isLoading}
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Voltar ao Login
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RecuperarSenha;
