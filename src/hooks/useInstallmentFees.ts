import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface InstallmentFee {
  id: string;
  installment_number: number;
  fee_percentage: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useInstallmentFees() {
  const [fees, setFees] = useState<InstallmentFee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchFees = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('installment_fees')
        .select('*')
        .order('installment_number', { ascending: true });

      if (error) throw error;
      setFees(data || []);
    } catch (error) {
      console.error('Error fetching installment fees:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFees();
  }, [fetchFees]);

  const updateFee = async (installmentNumber: number, feePercentage: number) => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('installment_fees')
        .update({ fee_percentage: feePercentage })
        .eq('installment_number', installmentNumber);

      if (error) throw error;
      
      setFees(prev => prev.map(f => 
        f.installment_number === installmentNumber 
          ? { ...f, fee_percentage: feePercentage }
          : f
      ));
      toast.success(`Juros de ${installmentNumber}x atualizado`);
    } catch (error) {
      console.error('Error updating fee:', error);
      toast.error('Erro ao atualizar juros');
    } finally {
      setIsSaving(false);
    }
  };

  const saveAllFees = async (updatedFees: { installment_number: number; fee_percentage: number }[]) => {
    setIsSaving(true);
    try {
      for (const fee of updatedFees) {
        const { error } = await supabase
          .from('installment_fees')
          .update({ fee_percentage: fee.fee_percentage })
          .eq('installment_number', fee.installment_number);

        if (error) throw error;
      }
      
      await fetchFees();
      toast.success('Taxas de juros salvas com sucesso');
      return true;
    } catch (error) {
      console.error('Error saving fees:', error);
      toast.error('Erro ao salvar taxas de juros');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const getFeeForInstallment = (installmentNumber: number): number => {
    const fee = fees.find(f => f.installment_number === installmentNumber);
    return fee?.fee_percentage || 0;
  };

  const calculateInstallmentValue = (totalAmount: number, installments: number): { 
    installmentValue: number; 
    totalWithFees: number; 
    feePercentage: number 
  } => {
    if (installments === 1) {
      return { installmentValue: totalAmount, totalWithFees: totalAmount, feePercentage: 0 };
    }
    
    const feePercentage = getFeeForInstallment(installments);
    const totalWithFees = totalAmount * (1 + feePercentage / 100);
    const installmentValue = totalWithFees / installments;
    
    return { installmentValue, totalWithFees, feePercentage };
  };

  return {
    fees,
    isLoading,
    isSaving,
    updateFee,
    saveAllFees,
    getFeeForInstallment,
    calculateInstallmentValue,
    refetch: fetchFees
  };
}
