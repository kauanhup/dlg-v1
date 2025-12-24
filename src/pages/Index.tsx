import { useEffect } from "react";
import { Header, Hero, BotShowcase, Features, Pricing, FAQ, CTA, Footer } from "@/components/landing";
import { SectionDivider } from "@/components/landing/SectionDivider";
import SEO from "@/components/SEO";
import PageTransition from "@/components/PageTransition";

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
    <PageTransition>
      <SEO 
        title="Automação Profissional para Telegram"
        description="Sistema de automação avançado para crescimento de grupos Telegram. Extração e transferência de membros com segurança. Gerencie múltiplas contas."
        canonical="/"
      />
      <div className="min-h-screen bg-background">
        <Header />
        <main>
          <Hero />
          <BotShowcase />
          <SectionDivider />
          <Features />
          {/* Simple divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />
          <Pricing />
          <FAQ />
          <CTA />
        </main>
        <Footer />
      </div>
    </PageTransition>
  );
};

export default Index;