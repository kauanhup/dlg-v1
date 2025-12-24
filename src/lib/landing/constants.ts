import { Settings, Users, Zap } from "lucide-react";
import appContasImg from "@/assets/app-contas.jpg";
import appConfigImg from "@/assets/app-config.jpg";
import appAcoesImg from "@/assets/app-acoes.jpg";

export const YOUTUBE_TUTORIAL_URL = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";

export interface StepType {
  step: string;
  title: string;
  description: string;
  icon: typeof Users;
  image: string;
}

export const TUTORIAL_STEPS: StepType[] = [
  {
    step: "01",
    title: "Configure o Bot",
    description: "Ajuste delays, ative modo anti-ban, configure proxies e personalize cada detalhe para máxima eficiência.",
    icon: Settings,
    image: appConfigImg,
  },
  {
    step: "02",
    title: "Gerencie suas Contas",
    description: "Conecte suas contas Telegram e monitore o status de cada uma em tempo real. Veja quais estão ativas, em float ou banidas.",
    icon: Users,
    image: appContasImg,
  },
  {
    step: "03",
    title: "Execute Ações",
    description: "Extraia membros, adicione em grupos, envie mensagens em massa. Todas as automações em um só lugar.",
    icon: Zap,
    image: appAcoesImg,
  },
];

export const FAQ_ITEMS = [
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
