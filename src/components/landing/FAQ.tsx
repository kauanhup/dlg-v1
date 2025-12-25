import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { FAQ_ITEMS } from "@/lib/landing/constants";

const FAQ = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { 
    once: true, 
    amount: 0.15,
    margin: "-50px"
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.03,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.2, ease: "easeOut" as const }
    }
  };

  return (
    <section id="faq" className="relative py-12 sm:py-20 lg:py-28 bg-card" ref={ref}>
      {/* Gradient transition from Pricing */}
      <div className="absolute top-0 left-0 right-0 h-24 sm:h-32 bg-gradient-to-b from-background to-transparent pointer-events-none" />
      
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">
          <motion.div 
            className="text-center mb-8 sm:mb-12 px-2"
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.3, ease: [0.33, 1, 0.68, 1] }}
          >
            <motion.p 
              className="text-primary text-xs sm:text-sm font-medium mb-2 sm:mb-3"
              initial={{ opacity: 0, y: 10 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.25, delay: 0.05 }}
            >
              FAQ
            </motion.p>
            <motion.h2 
              className="text-2xl xs:text-3xl sm:text-4xl font-display font-bold"
              initial={{ opacity: 0, y: 10 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.25, delay: 0.08 }}
            >
              Perguntas frequentes
            </motion.h2>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
          >
            <Accordion type="single" collapsible className="space-y-2">
              {FAQ_ITEMS.map((faq, index) => (
                <motion.div 
                  key={index}
                  variants={itemVariants}
                >
                  <AccordionItem 
                    value={`item-${index}`}
                    className="border border-border rounded-lg px-3 sm:px-4 bg-background data-[state=open]:border-primary/30 transition-all duration-300 hover:border-border/80"
                  >
                    <AccordionTrigger className="text-left hover:no-underline py-3 sm:py-4 text-xs sm:text-sm font-medium">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground text-xs sm:text-sm pb-3 sm:pb-4">
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
