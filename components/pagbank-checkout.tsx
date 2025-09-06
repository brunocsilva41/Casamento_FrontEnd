'use client'

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNotification } from '@/hooks/use-notification';
import { usePagBank } from '@/hooks/use-pagbank';
import { useAuth } from '@/lib/contexts/auth-context';
import { CreditCard, Loader2, ShieldCheck } from 'lucide-react';
import { useState } from 'react';

interface PagBankCheckoutProps {
  amount: number;
  description: string;
  giftId?: string;
  onPaymentCreated?: (paymentUrl: string) => void;
  onError?: (error: string) => void;
}

export function PagBankCheckout({ 
  amount, 
  description, 
  giftId, 
  onPaymentCreated, 
  onError 
}: PagBankCheckoutProps) {
  const { user } = useAuth();
  const { notifyError, notifySuccess, notifyInfo } = useNotification();
  
  const [customerInfo, setCustomerInfo] = useState({
    name: user?.name || '',
    email: user?.email || '',
    document: (user as any)?.document || ''
  });

  const pagBank = usePagBank({
    config: {
      environment: 'sandbox', // mudar para 'production' em produção
      apiBaseUrl: 'http://localhost:3001',
      token: process.env.NEXT_PUBLIC_PAGBANK_TOKEN || 'mock-token'
    },
    amount,
    description,
    customer: customerInfo,
    giftId,
    callbacks: {
      onSuccess: (payment) => {
        notifySuccess('Pagamento realizado com sucesso!');
        console.log('✅ Pagamento aprovado:', payment);
      },
      onPending: (payment) => {
        notifyInfo('Pagamento pendente de aprovação.');
        console.log('⏳ Pagamento pendente:', payment);
      },
      onError: (error) => {
        const errorMessage = typeof error === 'string' ? error : (error.message || 'Erro desconhecido');
        notifyError(`Erro no pagamento: ${errorMessage}`);
        if (onError) onError(errorMessage);
      }
    }
  });

  const handleInputChange = (field: string, value: string) => {
    setCustomerInfo(prev => ({ ...prev, [field]: value }));
  };

  const formatDocument = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    
    if (numbers.length <= 11) {
      // CPF: 000.000.000-00
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else {
      // CNPJ: 00.000.000/0000-00
      return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
  };

  const handleDocumentChange = (value: string) => {
    const formatted = formatDocument(value);
    handleInputChange('document', formatted);
  };

  const isFormValid = () => {
    return (
      customerInfo.name.trim().length >= 2 &&
      customerInfo.email.includes('@') &&
      customerInfo.document.replace(/\D/g, '').length >= 11
    );
  };

  const handleCreatePayment = async () => {
    if (!isFormValid()) {
      notifyError('Por favor, preencha todos os campos corretamente.');
      return;
    }

    try {
      const checkout = await pagBank.createCheckout();
      
      if (checkout && pagBank.paymentUrl) {
        notifyInfo('Redirecionando para o PagBank...');
        
        if (onPaymentCreated) {
          onPaymentCreated(pagBank.paymentUrl);
        }
        
        // Redirecionar após um pequeno delay para mostrar a notificação
        setTimeout(() => {
          window.location.href = pagBank.paymentUrl!;
        }, 1000);
      }
    } catch (error) {
      console.error('❌ Erro ao criar pagamento:', error);
    }
  };

  if (pagBank.friendlyError) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-red-600">Erro no Pagamento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            {pagBank.friendlyError.message}
          </p>
          
          {pagBank.friendlyError.canRetry && (
            <Button 
              onClick={pagBank.clearError} 
              variant="outline" 
              className="w-full"
            >
              Tentar Novamente
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Pagamento PagBank
        </CardTitle>
        <CardDescription>
          {description} - R$ {amount.toFixed(2).replace('.', ',')}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Informações do cliente */}
        <div className="space-y-3">
          <div>
            <Label htmlFor="name">Nome Completo *</Label>
            <Input
              id="name"
              type="text"
              value={customerInfo.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Seu nome completo"
              disabled={pagBank.isLoading}
            />
          </div>

          <div>
            <Label htmlFor="email">E-mail *</Label>
            <Input
              id="email"
              type="email"
              value={customerInfo.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="seu@email.com"
              disabled={pagBank.isLoading}
            />
          </div>

          <div>
            <Label htmlFor="document">CPF/CNPJ *</Label>
            <Input
              id="document"
              type="text"
              value={customerInfo.document}
              onChange={(e) => handleDocumentChange(e.target.value)}
              placeholder="000.000.000-00"
              maxLength={18}
              disabled={pagBank.isLoading}
            />
          </div>
        </div>

        {/* Informações de segurança */}
        <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
          <ShieldCheck className="h-4 w-4 text-green-600" />
          <span className="text-xs text-green-700">
            Pagamento seguro via PagBank
          </span>
        </div>

        {/* Botão de pagamento */}
        <Button 
          onClick={handleCreatePayment}
          disabled={!isFormValid() || pagBank.isLoading}
          className="w-full"
          size="lg"
        >
          {pagBank.isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processando...
            </>
          ) : (
            `Pagar R$ ${amount.toFixed(2).replace('.', ',')}`
          )}
        </Button>

        <p className="text-xs text-gray-500 text-center">
          Você será redirecionado para o ambiente seguro do PagBank para concluir o pagamento.
        </p>
      </CardContent>
    </Card>
  );
}
