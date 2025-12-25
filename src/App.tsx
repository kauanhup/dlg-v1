import { lazy, Suspense } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AlertToastProvider } from "@/hooks/use-alert-toast";
import { AnimatePresence } from "framer-motion";
import CookieConsent from "@/components/CookieConsent";
import PendingPaymentBanner from "@/components/PendingPaymentBanner";
import { Spinner } from "@/components/ui/spinner";

// Lazy load pages for better performance
const Index = lazy(() => import("./pages/Index"));
const Buy = lazy(() => import("./pages/Buy"));
const Checkout = lazy(() => import("./pages/Checkout"));
const Login = lazy(() => import("./pages/Login"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Admin = lazy(() => import("./pages/Admin"));
const Pagamentos = lazy(() => import("./pages/Pagamentos"));
const RecuperarSenha = lazy(() => import("./pages/RecuperarSenha"));
const PoliticaPrivacidade = lazy(() => import("./pages/PoliticaPrivacidade"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <Spinner size="lg" />
  </div>
);

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <Suspense fallback={<PageLoader />}>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Index />} />
          <Route path="/comprar" element={<Buy />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/login" element={<Login />} />
          <Route path="/recuperar-senha" element={<RecuperarSenha />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/pagamentos" element={<Pagamentos />} />
          <Route path="/politica-privacidade" element={<PoliticaPrivacidade />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>
    </Suspense>
  );
};

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AlertToastProvider>
          <BrowserRouter>
            <AnimatedRoutes />
            <PendingPaymentBanner />
            <CookieConsent />
          </BrowserRouter>
        </AlertToastProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
