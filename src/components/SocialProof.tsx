"use client";

import AutoScroll from "embla-carousel-auto-scroll";
import { Users, Send, Shield, Clock, Zap, Target } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

interface Stat {
  id: string;
  icon: React.ReactNode;
  value: string;
  label: string;
}

const stats: Stat[] = [
  {
    id: "stat-1",
    icon: <Users className="w-5 h-5 text-primary" />,
    value: "2.5M+",
    label: "Membros Transferidos",
  },
  {
    id: "stat-2",
    icon: <Send className="w-5 h-5 text-primary" />,
    value: "50K+",
    label: "Grupos Gerenciados",
  },
  {
    id: "stat-3",
    icon: <Shield className="w-5 h-5 text-primary" />,
    value: "99.9%",
    label: "Uptime do Sistema",
  },
  {
    id: "stat-4",
    icon: <Clock className="w-5 h-5 text-primary" />,
    value: "1000+",
    label: "Horas Economizadas",
  },
  {
    id: "stat-5",
    icon: <Zap className="w-5 h-5 text-primary" />,
    value: "10x",
    label: "Mais Rápido",
  },
  {
    id: "stat-6",
    icon: <Target className="w-5 h-5 text-primary" />,
    value: "500+",
    label: "Clientes Ativos",
  },
];

const SocialProof = () => {
  return (
    <section className="py-12 border-y border-border/50">
      <div className="relative mx-auto flex items-center justify-center">
        <Carousel
          opts={{ loop: true }}
          plugins={[AutoScroll({ playOnInit: true, speed: 0.5 })]}
        >
          <CarouselContent className="ml-0">
            {stats.map((stat) => (
              <CarouselItem
                key={stat.id}
                className="flex basis-1/2 justify-center pl-0 sm:basis-1/3 md:basis-1/4 lg:basis-1/6"
              >
                <div className="mx-6 flex shrink-0 items-center gap-3 px-4 py-2">
                  {stat.icon}
                  <div className="flex flex-col">
                    <span className="text-lg font-bold text-foreground">{stat.value}</span>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{stat.label}</span>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
        <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-background to-transparent pointer-events-none"></div>
        <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-background to-transparent pointer-events-none"></div>
      </div>
    </section>
  );
};

export default SocialProof;
