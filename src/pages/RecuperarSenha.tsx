import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AnimatedShaderBackground from "@/components/ui/animated-shader-background";
import { useAlertToast } from "@/hooks/use-alert-toast";
import { MorphingSquare } from "@/components/ui/morphing-square";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Mail, Key, Lock, CheckCircle } from "lucide-react";
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
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingSettings, setIsCheckingSettings] = useState(true);
  const [isEnabled, setIsEnabled] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const toast = useAlertToast();

  useEffect(() => {
    document.documentElement.classList.add('dark');
    
    // Check if password recovery is enabled
    const checkSettings = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('pixup', {
          body: { action: 'get_public_settings' }
        });
        
        if (data?.success && data?.data?.password_recovery_enabled) {
          setIsEnabled(true);
        }
      } catch (err) {
        console.error('Error checking settings:', err);
      } finally {
        setIsCheckingSettings(false);
      }
    };

    checkSettings();

    // Check if coming from email link with token
    const token = searchParams.get('token');
    const emailParam = searchParams.get('email');
    if (token && emailParam) {
      setEmail(emailParam);
      setCode(token);
      setStep('code');
    }
  }, [searchParams]);

  const handleRequestCode = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Email inválido", "Digite um email válido.");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: { 
          action: 'send_code',
          type: 'password_reset',
          to: email 
        }
      });

      if (error) throw error;

      if (data?.success) {
        toast.success("Código enviado!", "Verifique sua caixa de entrada.");
        setStep('code');
      } else {
        toast.error("Erro", data?.error || "Não foi possível enviar o código.");
      }
    } catch (err: any) {
      console.error('Error sending code:', err);
      toast.error("Erro", err.message || "Erro ao enviar código.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!code || code.length !== 6) {
      toast.error("Código inválido", "Digite o código de 6 dígitos.");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: { 
          action: 'verify_code',
          type: 'password_reset',
          email,
          code 
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
      toast.error("Erro", err.message || "Erro ao verificar código.");
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

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: { 
          action: 'reset_password',
          email,
          code,
          newPassword: password 
        }
      });

      if (error) throw error;

      if (data?.success) {
        toast.success("Senha alterada!", "Faça login com sua nova senha.");
        setStep('success');
      } else {
        toast.error("Erro", data?.error || "Não foi possível alterar a senha.");
      }
    } catch (err: any) {
      console.error('Error resetting password:', err);
      toast.error("Erro", err.message || "Erro ao alterar senha.");
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
    <div className="min-h-screen w-full relative flex items-center justify-center overflow-hidden p-4">
      {/* Aurora Shader Background */}
      <div className="absolute inset-0 z-0">
        <AnimatedShaderBackground className="w-full h-full" />
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 bg-card/80 backdrop-blur-xl border border-border/50 rounded-xl p-8 max-w-md w-full shadow-2xl"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            {step === 'email' && <Mail className="w-8 h-8 text-primary" />}
            {step === 'code' && <Key className="w-8 h-8 text-primary" />}
            {step === 'password' && <Lock className="w-8 h-8 text-primary" />}
            {step === 'success' && <CheckCircle className="w-8 h-8 text-green-500" />}
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            {step === 'email' && "Recuperar Senha"}
            {step === 'code' && "Verificar Código"}
            {step === 'password' && "Nova Senha"}
            {step === 'success' && "Senha Alterada!"}
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            {step === 'email' && "Digite seu email para receber um código de verificação."}
            {step === 'code' && "Digite o código de 6 dígitos enviado para seu email."}
            {step === 'password' && "Defina sua nova senha."}
            {step === 'success' && "Sua senha foi alterada com sucesso."}
          </p>
        </div>

        {/* Steps Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {['email', 'code', 'password', 'success'].map((s, i) => (
            <div 
              key={s}
              className={`w-3 h-3 rounded-full transition-colors ${
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
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  disabled={isLoading}
                />
              </div>
              <Button 
                onClick={handleRequestCode} 
                disabled={isLoading} 
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
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Código de Verificação</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground text-center text-2xl tracking-widest placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground mt-2 text-center">
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
                onClick={() => setStep('email')}
                className="w-full text-sm text-muted-foreground hover:text-foreground"
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
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Nova Senha</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Confirmar Senha</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  disabled={isLoading}
                />
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
          <div className="mt-6 text-center">
            <button 
              onClick={() => navigate('/login')}
              className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar ao Login
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default RecuperarSenha;
