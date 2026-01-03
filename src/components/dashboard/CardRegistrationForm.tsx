import { useState } from "react";
import { CreditCard, Loader2, CheckCircle, X, MapPin, User, Phone, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface CardRegistrationFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  subscriptionId?: string;
  planName?: string;
  periodDays?: number;
  currentPrice?: number;
}

export function CardRegistrationForm({ 
  onSuccess, 
  onCancel,
  subscriptionId,
  planName = "Plano",
  periodDays = 30,
  currentPrice = 0
}: CardRegistrationFormProps) {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'form' | 'success'>('form');
  
  // Card data
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  
  // Holder info
  const [cpf, setCpf] = useState("");
  const [phone, setPhone] = useState("");
  const [cep, setCep] = useState("");
  const [addressNumber, setAddressNumber] = useState("");

  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 16);
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(' ') : cleaned;
  };

  // Format expiry date
  const formatExpiry = (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 4);
    if (cleaned.length >= 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
    }
    return cleaned;
  };

  // Format CPF
  const formatCpf = (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 11);
    return cleaned
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  };

  // Format phone
  const formatPhone = (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 11);
    return cleaned
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2');
  };

  // Format CEP
  const formatCep = (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 8);
    return cleaned.replace(/(\d{5})(\d)/, '$1-$2');
  };

  const isValid = () => {
    const cardClean = cardNumber.replace(/\s/g, '');
    const expiryClean = cardExpiry.replace('/', '');
    const cpfClean = cpf.replace(/\D/g, '');
    const cepClean = cep.replace(/\D/g, '');
    
    return (
      cardClean.length === 16 &&
      cardName.trim().length >= 3 &&
      expiryClean.length === 4 &&
      cardCvv.length >= 3 &&
      cpfClean.length === 11 &&
      cepClean.length === 8 &&
      addressNumber.length > 0
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isValid()) {
      toast.error("Preencha todos os campos corretamente");
      return;
    }

    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Sessão expirada. Faça login novamente.");
        return;
      }

      // Get profile for email
      const { data: profile } = await supabase
        .from('profiles')
        .select('email, name, whatsapp')
        .eq('user_id', session.user.id)
        .single();

      const expiryParts = cardExpiry.split('/');
      const expiryMonth = expiryParts[0];
      const expiryYear = expiryParts[1]?.length === 2 ? `20${expiryParts[1]}` : expiryParts[1];

      // Call the tokenize_card action
      const response = await supabase.functions.invoke('asaas', {
        body: {
          action: 'tokenize_card',
          card_data: {
            holderName: cardName,
            number: cardNumber.replace(/\s/g, ''),
            expiryMonth,
            expiryYear,
            ccv: cardCvv,
          },
          holder_info: {
            name: cardName,
            email: profile?.email || session.user.email,
            cpfCnpj: cpf.replace(/\D/g, ''),
            phone: phone.replace(/\D/g, '') || profile?.whatsapp?.replace(/\D/g, ''),
            postalCode: cep.replace(/\D/g, ''),
            addressNumber,
          },
          plan_name: planName,
          period_days: periodDays,
          current_price: currentPrice,
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      if (!response.data?.success) {
        throw new Error(response.data?.error || 'Erro ao cadastrar cartão');
      }

      setStep('success');
      toast.success("Cartão cadastrado com sucesso!");
      
      // Wait a moment and then call onSuccess
      setTimeout(() => {
        onSuccess();
      }, 2000);

    } catch (error: any) {
      console.error('Card registration error:', error);
      toast.error(error.message || "Erro ao cadastrar cartão");
    } finally {
      setLoading(false);
    }
  };

  if (step === 'success') {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex flex-col items-center justify-center py-8 space-y-4"
      >
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center"
        >
          <CheckCircle className="w-8 h-8 text-success" />
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center"
        >
          <h3 className="font-semibold text-foreground">Cartão Cadastrado!</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Sua renovação automática está ativa
          </p>
        </motion.div>
      </motion.div>
    );
  }

  const inputVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.05, duration: 0.3 }
    })
  };

  return (
    <motion.form 
      onSubmit={handleSubmit} 
      className="space-y-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-4"
      >
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-primary" />
          Cadastrar Cartão
        </h3>
        <button
          type="button"
          onClick={onCancel}
          className="text-muted-foreground hover:text-foreground transition-colors hover:rotate-90 duration-200"
        >
          <X className="w-4 h-4" />
        </button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-md flex items-start gap-2"
      >
        <Shield className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
        <span>
          Cadastre seu cartão para ativar a renovação automática. 
          Você será cobrado apenas na data de renovação do seu plano.
        </span>
      </motion.div>

      {/* Card Number */}
      <motion.div 
        custom={0}
        variants={inputVariants}
        initial="hidden"
        animate="visible"
        className="space-y-1.5"
      >
        <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
          <CreditCard className="w-3 h-3" />
          Número do Cartão
        </label>
        <input
          type="text"
          value={cardNumber}
          onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
          placeholder="0000 0000 0000 0000"
          className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200 focus:border-primary"
          disabled={loading}
        />
      </motion.div>

      {/* Card Name */}
      <motion.div 
        custom={1}
        variants={inputVariants}
        initial="hidden"
        animate="visible"
        className="space-y-1.5"
      >
        <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
          <User className="w-3 h-3" />
          Nome no Cartão
        </label>
        <input
          type="text"
          value={cardName}
          onChange={(e) => setCardName(e.target.value.toUpperCase())}
          placeholder="NOME COMO ESTÁ NO CARTÃO"
          className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 uppercase transition-all duration-200 focus:border-primary"
          disabled={loading}
        />
      </motion.div>

      {/* Expiry and CVV */}
      <motion.div 
        custom={2}
        variants={inputVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 gap-3"
      >
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Validade</label>
          <input
            type="text"
            value={cardExpiry}
            onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
            placeholder="MM/AA"
            className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200 focus:border-primary"
            disabled={loading}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">CVV</label>
          <input
            type="text"
            value={cardCvv}
            onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
            placeholder="123"
            className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200 focus:border-primary"
            disabled={loading}
          />
        </div>
      </motion.div>

      {/* CPF */}
      <motion.div 
        custom={3}
        variants={inputVariants}
        initial="hidden"
        animate="visible"
        className="space-y-1.5"
      >
        <label className="text-xs font-medium text-muted-foreground">CPF do Titular</label>
        <input
          type="text"
          value={cpf}
          onChange={(e) => setCpf(formatCpf(e.target.value))}
          placeholder="000.000.000-00"
          className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200 focus:border-primary"
          disabled={loading}
        />
      </motion.div>

      {/* Phone */}
      <motion.div 
        custom={4}
        variants={inputVariants}
        initial="hidden"
        animate="visible"
        className="space-y-1.5"
      >
        <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
          <Phone className="w-3 h-3" />
          Telefone (opcional)
        </label>
        <input
          type="text"
          value={phone}
          onChange={(e) => setPhone(formatPhone(e.target.value))}
          placeholder="(00) 00000-0000"
          className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200 focus:border-primary"
          disabled={loading}
        />
      </motion.div>

      {/* CEP and Address Number */}
      <motion.div 
        custom={5}
        variants={inputVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 gap-3"
      >
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <MapPin className="w-3 h-3" />
            CEP
          </label>
          <input
            type="text"
            value={cep}
            onChange={(e) => setCep(formatCep(e.target.value))}
            placeholder="00000-000"
            className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200 focus:border-primary"
            disabled={loading}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Número</label>
          <input
            type="text"
            value={addressNumber}
            onChange={(e) => setAddressNumber(e.target.value.replace(/\D/g, ''))}
            placeholder="123"
            className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200 focus:border-primary"
            disabled={loading}
          />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <Button
          type="submit"
          className="w-full transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          disabled={loading || !isValid()}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Cadastrando...
            </>
          ) : (
            <>
              <CreditCard className="w-4 h-4 mr-2" />
              Cadastrar Cartão
            </>
          )}
        </Button>
      </motion.div>
    </motion.form>
  );
}
