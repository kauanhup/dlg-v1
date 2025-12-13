import { Home, Layers, CreditCard, HelpCircle, LogIn, ShoppingCart } from "lucide-react";
import { AnimeNavBar } from "./ui/anime-navbar";

const navItems = [
  { name: "Início", url: "/", icon: Home },
  { name: "Recursos", url: "#features", icon: Layers },
  { name: "Preços", url: "#pricing", icon: CreditCard },
  { name: "FAQ", url: "#faq", icon: HelpCircle },
  { name: "Entrar", url: "/login", icon: LogIn, isPage: true },
  { name: "Comprar", url: "/comprar", icon: ShoppingCart, isPage: true },
];

const Header = () => {
  return <AnimeNavBar items={navItems} defaultActive="Início" />;
};

export default Header;
