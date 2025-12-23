import { useEffect } from "react";
import { Header, Hero, BotShowcase, Features, Pricing, FAQ, CTA, Footer } from "@/components/landing";
import SEO from "@/components/SEO";
import { PixelCursorTrail } from "@/components/ui/pixel-trail";

const Index = () => {
  // Força tema escuro na página inicial
  useEffect(() => {
    document.documentElement.classList.add("dark");
    
    return () => {
      // Restaura preferência do usuário ao sair
      const savedTheme = localStorage.getItem("theme");
      if (savedTheme === "light") {
        document.documentElement.classList.remove("dark");
      }
    };
  }, []);

  return (
    <>
      <SEO 
        title="Automação Profissional para Telegram"
        description="Sistema de automação avançado para crescimento de grupos Telegram. Extração e transferência de membros com segurança. Gerencie múltiplas contas."
        canonical="/"
      />
      <div className="min-h-screen bg-background relative">
        {/* Pixel Trail Effect - Full Page */}
        <PixelCursorTrail />
        
        <Header />
        <main>
          <Hero />
          <BotShowcase />
          <Features />
          <Pricing />
          <FAQ />
          <CTA />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Index;