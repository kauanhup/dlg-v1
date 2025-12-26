import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { FAQ_ITEMS } from "@/lib/landing/constants";
import { gpuEase, bounceEase } from "@/hooks/useScrollAnimation";

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
        staggerChildren: 0.08,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -40, rotateY: -15 },
    visible: { 
      opacity: 1, 
      x: 0,
      rotateY: 0,
      transition: { duration: 0.5, ease: gpuEase }
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
            initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
            animate={isInView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
            transition={{ duration: 0.6, ease: gpuEase }}
          >
            <motion.p 
              className="text-primary text-xs sm:text-sm font-medium mb-2 sm:mb-3"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.4, delay: 0.1, ease: bounceEase }}
            >
              FAQ
            </motion.p>
            <motion.h2 
              className="text-2xl xs:text-3xl sm:text-4xl font-display font-bold"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.15, ease: gpuEase }}
            >
              Perguntas frequentes
            </motion.h2>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            style={{ perspective: 1000 }}
          >
            <Accordion type="single" collapsible className="space-y-2">
              {FAQ_ITEMS.map((faq, index) => (
                <motion.div 
                  key={index}
                  variants={itemVariants}
                  whileHover={{ scale: 1.02, x: 5, transition: { duration: 0.2 } }}
                >
                  <AccordionItem 
                    value={`item-${index}`}
                    className="border border-border rounded-lg px-3 sm:px-4 bg-background data-[state=open]:border-primary/30 transition-all duration-300 hover:border-border/80 hover:shadow-lg hover:shadow-primary/5"
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
