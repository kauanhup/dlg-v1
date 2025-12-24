import { Home, Layers, Download, CreditCard, HelpCircle, LogIn, ShoppingCart } from "lucide-react";
import { AnimeNavBar } from "@/components/ui/anime-navbar";

const Header = () => {
  const navItems = [
    { name: "Início", url: "/", icon: Home },
    { name: "Recursos", url: "#features", icon: Layers },
    { name: "Download", url: "#download", icon: Download },
    { name: "Planos", url: "#pricing", icon: CreditCard },
    { name: "FAQ", url: "#faq", icon: HelpCircle },
    { name: "Entrar", url: "/login", icon: LogIn, isPage: true },
    { name: "Comprar", url: "/comprar", icon: ShoppingCart, isPage: true },
  ];

  return <AnimeNavBar items={navItems} defaultActive="Início" />;
};

export default Header;
