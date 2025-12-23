import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const faqs = [
  {
    question: "O DLG Connect é um bot ou um software?",
    answer: "É um software de automação com interface gráfica, pensado para uso profissional. Você não precisa rodar script no terminal nem mexer em código."
  },
  {
    question: "Preciso ter conhecimento técnico para usar?",
    answer: "Não. O sistema já vem com limites e configurações de segurança pré-definidas para evitar erros comuns. Quem nunca usou automação consegue aprender rápido."
  },
  {
    question: "O uso do sistema pode gerar banimento?",
    answer: "Qualquer automação envolve risco se usada de forma irresponsável. O DLG Connect foi desenvolvido para reduzir ao máximo esse risco, com delays, limites e rotação inteligente — mas o uso consciente é responsabilidade do usuário."
  },
  {
    question: "Como funciona o teste gratuito?",
    answer: "O teste gratuito tem tempo e limites reduzidos, apenas para você conhecer o sistema e o fluxo de funcionamento. Ele não é feito para uso em escala."
  },
  {
    question: "Posso usar várias contas do Telegram?",
    answer: "Sim. Nos planos pagos, é possível conectar múltiplas contas (sessions) e gerenciá-las pelo dashboard, respeitando os limites de segurança do sistema."
  },
  {
    question: "Posso configurar os delays manualmente?",
    answer: "Nos planos pagos, sim. No teste gratuito, os delays são fixos, justamente para evitar uso incorreto."
  },
  {
    question: "O sistema funciona em qual dispositivo?",
    answer: "O software é executado em computador. Você faz login na sua conta e utiliza conforme o plano contratado."
  },
  {
    question: "Vocês fornecem contas ou números do Telegram?",
    answer: "Não. O DLG Connect é uma ferramenta de automação. As contas utilizadas são de responsabilidade do usuário."
  },
  {
    question: "Posso cancelar ou mudar de plano depois?",
    answer: "Sim. Você pode fazer upgrade de plano a qualquer momento, diretamente pela sua conta."
  },
  {
    question: "O pagamento é seguro?",
    answer: "Sim. Os pagamentos são processados via PIX, com liberação rápida do acesso após a confirmação."
  },
  {
    question: "Onde posso tirar dúvidas ou falar com o suporte?",
    answer: "O suporte é feito diretamente pelo WhatsApp, de forma humana e sem robô. Entre em contato: (65) 99649-8222"
  },
];

// GPU-optimized easing
const gpuEase = [0.33, 1, 0.68, 1] as const;

const FAQ = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { 
    once: false, 
    amount: 0.15,
    margin: "-60px 0px -60px 0px"
  });

  return (
    <section id="faq" className="py-20 sm:py-28 bg-card" ref={ref}>
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">
          <motion.div 
            className="text-center mb-12"
            style={{ willChange: "transform, opacity" }}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.28, ease: gpuEase }}
          >
            <p className="text-primary text-sm font-medium mb-3">FAQ</p>
            <h2 className="text-3xl sm:text-4xl font-display font-bold">
              Perguntas frequentes
            </h2>
          </motion.div>

          <motion.div
            style={{ willChange: "opacity" }}
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.25, ease: gpuEase }}
          >
            <Accordion type="single" collapsible className="space-y-2">
              {faqs.map((faq, index) => (
                <motion.div 
                  key={index}
                  style={{ willChange: "transform, opacity" }}
                  initial={{ opacity: 0, y: 12 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
                  transition={{ 
                    duration: 0.25, 
                    delay: index * 0.025, 
                    ease: gpuEase 
                  }}
                >
                  <AccordionItem 
                    value={`item-${index}`}
                    className="border border-border rounded-lg px-4 bg-background data-[state=open]:border-primary/30 transition-colors duration-200"
                  >
                    <AccordionTrigger className="text-left hover:no-underline py-4 text-sm font-medium">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground text-sm pb-4">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
