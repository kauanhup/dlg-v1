import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { motion } from "framer-motion";

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
  return (
    <section id="faq" className="py-24 sm:py-32 lg:py-40 bg-card/30">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.6, ease: gpuEase }}
          >
            <motion.span 
              className="inline-block text-primary text-sm font-semibold tracking-wider uppercase mb-4"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: false }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              FAQ
            </motion.span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold">
              Perguntas <span className="text-primary">frequentes</span>
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.5, ease: gpuEase }}
          >
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.3 }}
                  transition={{ 
                    duration: 0.4, 
                    delay: index * 0.03, 
                    ease: gpuEase 
                  }}
                >
                  <AccordionItem 
                    value={`item-${index}`}
                    className="border border-border/50 rounded-xl px-6 bg-card/50 backdrop-blur-sm data-[state=open]:border-primary/30 data-[state=open]:bg-card transition-all duration-300"
                  >
                    <AccordionTrigger className="text-left hover:no-underline py-5 text-base font-medium text-foreground">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground text-base pb-5 leading-relaxed">
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
