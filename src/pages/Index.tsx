import { useEffect } from "react";
import { Header, Hero, BotShowcase, Features, HowItWorks, Pricing, FAQ, CTA, Footer } from "@/components/landing";
import { SectionDivider } from "@/components/landing/SectionDivider";
import RotatingDivider from "@/components/landing/RotatingDivider";
import FloatingParticles from "@/components/landing/FloatingParticles";
import GridBackground from "@/components/landing/GridBackground";
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
      <div className="min-h-screen bg-background relative">
        {/* Professional background effects */}
        <GridBackground />
        <FloatingParticles />
        
        <Header />
        <main className="relative z-10">
          <Hero />
          <BotShowcase />
          <SectionDivider />
          <Features />
          <HowItWorks />
          <RotatingDivider />
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