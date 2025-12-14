import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import AnimatedShaderBackground from "@/components/ui/animated-shader-background";
import { useAlertToast } from "@/hooks/use-alert-toast";
import { MorphingSquare } from "@/components/ui/morphing-square";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [whatsappError, setWhatsappError] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const toast = useAlertToast();
  
  const redirectUrl = searchParams.get("redirect") || "/dashboard";

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const validateEmail = (value: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  const validatePassword = (value: string) => {
    return value.length >= 8;
  };

  const validateWhatsapp = (value: string) => {
    return /^\+?[0-9]{10,15}$/.test(value.replace(/\s/g, ''));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let valid = true;

    if (!validateEmail(email)) {
      setEmailError("Por favor, insira um email válido.");
      valid = false;
    } else {
      setEmailError("");
    }

    if (!validatePassword(password)) {
      setPasswordError("A senha deve ter pelo menos 8 caracteres.");
      valid = false;
    } else {
      setPasswordError("");
    }

    if (!isLogin && !validateWhatsapp(whatsapp)) {
      setWhatsappError("Por favor, insira um número válido.");
      valid = false;
    } else {
      setWhatsappError("");
    }

    if (!valid) {
      toast.error("Erro de validação", "Verifique os campos e tente novamente.");
      return;
    }

    // Simular login (depois substituir por auth real)
    localStorage.setItem("isLoggedIn", "true");
    
    // Check if admin credentials
    const isAdmin = email.toLowerCase() === "admin@swextractor.com" && password === "admin123";
    
    if (isLogin) {
      toast.success("Login realizado!", isAdmin ? "Bem-vindo, Administrador." : "Bem-vindo de volta.");
    } else {
      toast.success("Conta criada!", "Sua conta foi criada com sucesso.");
    }

    // Navigate to admin or user dashboard
    setTimeout(() => {
      if (isAdmin) {
        navigate("/admin");
      } else {
        navigate(redirectUrl);
      }
    }, 1000);
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
    setIsTransitioning(true);
    setEmailError("");
    setPasswordError("");
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
                  className="text-sm w-full py-3 px-4 border rounded-lg focus:outline-none focus:ring-2 bg-background text-foreground focus:ring-primary/50 border-border/50 transition-all"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
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
              className="w-full py-3 px-4 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:shadow-primary/30"
            >
              {isLogin ? "Entrar" : "Criar conta"}
            </button>

            <p className="text-center text-sm text-muted-foreground">
              {isLogin ? "Não tem uma conta?" : "Já tem uma conta?"}{" "}
              <button
                type="button"
                onClick={handleToggleMode}
                className="text-primary hover:underline font-medium"
              >
                {isLogin ? "Cadastre-se" : "Entrar"}
              </button>
            </p>
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
    </div>
  );
};

export default Login;
