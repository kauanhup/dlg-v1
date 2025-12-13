import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Como funciona o sistema?",
    answer: "O sistema conecta suas contas Telegram e automatiza a extração de membros de grupos fonte, transferindo-os para seus grupos destino com delays inteligentes."
  },
  {
    question: "É seguro usar?",
    answer: "Sim. Implementamos limites de adições por dia, delays customizáveis, rotação automática e verificação de privacidade para minimizar riscos."
  },
  {
    question: "Como conecto minhas contas?",
    answer: "Você pode conectar via upload do arquivo de session ou inserindo o código de verificação. O processo leva menos de 2 minutos."
  },
  {
    question: "E se uma conta for banida?",
    answer: "Nosso dashboard mostra o status em tempo real. Se uma conta entrar em cooldown, o sistema redistribui as tarefas automaticamente."
  },
  {
    question: "Qual a diferença entre os planos?",
    answer: "Os planos variam em quantidade de contas e limite de adições diárias. O plano Vitalício oferece acesso ilimitado para sempre."
  },
];

const FAQ = () => {
  return (
    <section id="faq" className="py-20 sm:py-28 bg-card">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-primary text-sm font-medium mb-3">FAQ</p>
            <h2 className="text-3xl sm:text-4xl font-display font-bold">
              Perguntas frequentes
            </h2>
          </div>

          <Accordion type="single" collapsible className="space-y-2">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="border border-border rounded-lg px-4 bg-background data-[state=open]:border-primary/30"
              >
                <AccordionTrigger className="text-left hover:no-underline py-4 text-sm font-medium">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQ;