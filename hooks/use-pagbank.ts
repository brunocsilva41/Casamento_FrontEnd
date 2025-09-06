'use client'

import { getFriendlyErrorMessage } from '@/lib/error-handler';
import {
    CreatePagBankCheckoutRequest,
    PagBankCheckoutResponse,
    PagBankState,
    UsePagBankProps
} from '@/lib/types/pagbank';
import { useCallback, useState } from 'react';

export const usePagBank = ({ config, amount, description, customer, giftId, callbacks }: UsePagBankProps) => {
  const [state, setState] = useState<PagBankState>({
    isLoading: false,
    error: null,
    friendlyError: null,
    checkoutData: null,
    paymentUrl: null,
    paymentStatus: null
  });

  const updateState = useCallback((updates: Partial<PagBankState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const setError = useCallback((error: string | null, originalError?: any) => {
    const friendlyError = originalError ? getFriendlyErrorMessage(originalError) : null;
    updateState({ 
      error, 
      friendlyError: {
        ...friendlyError,
        canRetry: true
      },
      isLoading: false 
    });
  }, [updateState]);

  const setLoading = useCallback((loading: boolean) => {
    updateState({ isLoading: loading });
  }, [updateState]);

  const clearError = useCallback(() => {
    updateState({ error: null, friendlyError: null });
  }, [updateState]);

  // Criar checkout no PagBank
  const createCheckout = useCallback(async () => {
    setLoading(true);
    clearError();

    try {
      // Preparar dados do checkout
      const checkoutRequest: CreatePagBankCheckoutRequest = {
        reference_id: giftId || `gift-${Date.now()}`,
        customer_modifiable: false,
        customer: {
          name: customer.name,
          email: customer.email,
          tax_id: customer.document.replace(/\D/g, '') // Remove formatação
        },
        items: [
          {
            reference_id: giftId,
            name: description,
            quantity: 1,
            unit_amount: Math.round(amount * 100) // Converter para centavos
          }
        ],
        payment_methods: [
          { type: 'CREDIT_CARD' },
          { type: 'DEBIT_CARD' },
          { type: 'PIX' },
          { type: 'BOLETO' },
          { type: 'PAGBANK_ACCOUNT' }
        ],
        payment_methods_configs: [
          {
            type: 'CREDIT_CARD',
            config_options: [
              { option: 'INSTALLMENTS_LIMIT', value: '12' },
              { option: 'INTEREST_FREE_INSTALLMENTS', value: '1' }
            ]
          }
        ],
        soft_descriptor: 'Casamento Bruno Laura',
        redirect_url: `${window.location.origin}/confirmacao`,
        notification_urls: [`${config.apiBaseUrl}/api/webhooks/pagbank`],
        payment_notification_urls: [`${config.apiBaseUrl}/api/webhooks/pagbank/payment`],
        expiration_date: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() // 2 horas
      };

      console.log('🏦 Criando checkout PagBank:', checkoutRequest);

      // Fazer chamada para o backend
      const response = await fetch(`${config.apiBaseUrl}/api/pagbank/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(checkoutRequest)
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `Erro HTTP: ${response.status}`;
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      const responseData = await response.json();
      
      if (!responseData.success || !responseData.data) {
        throw new Error('Formato de resposta inválido do servidor');
      }

      const checkoutData: PagBankCheckoutResponse = responseData.data;
      
      // Encontrar o link de pagamento
      const paymentLink = checkoutData.links.find(link => link.rel === 'PAY');
      if (!paymentLink) {
        throw new Error('Link de pagamento não encontrado na resposta');
      }

      console.log('✅ Checkout criado com sucesso:', checkoutData);

      updateState({
        checkoutData,
        paymentUrl: paymentLink.href,
        isLoading: false
      });

      return checkoutData;

    } catch (error) {
      console.error('❌ Erro ao criar checkout PagBank:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao processar pagamento';
      setError(errorMessage, error);
      
      if (callbacks.onError) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        callbacks.onError(errorMessage);
      }
      
      return null;
    }
  }, [config, amount, description, customer, giftId, callbacks, setLoading, clearError, updateState, setError]);

  // Redirecionar para o checkout
  const redirectToCheckout = useCallback(async () => {
    try {
      // Se já temos o URL, redirecionar
      if (state.paymentUrl) {
        window.location.href = state.paymentUrl;
        return;
      }

      // Senão, criar o checkout primeiro
      const checkout = await createCheckout();
      if (checkout) {
        const paymentLink = checkout.links.find(link => link.rel === 'PAY');
        if (paymentLink) {
          window.location.href = paymentLink.href;
        }
      }
    } catch (error) {
      console.error('❌ Erro ao redirecionar para checkout:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao redirecionar para pagamento';
      setError(errorMessage, error);
    }
  }, [state.paymentUrl, createCheckout, setError]);

  // Consultar status do pagamento
  const checkPaymentStatus = useCallback(async (checkoutId: string) => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/api/pagbank/checkout/${checkoutId}/status`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (!response.ok) {
        throw new Error(`Erro ao consultar status: ${response.status}`);
      }

      const responseData = await response.json();
      
      if (responseData.success && responseData.data) {
        updateState({ paymentStatus: responseData.data });
        
        // Executar callbacks baseado no status
        const status = responseData.data.status;
        switch (status) {
          case 'PAID':
            if (callbacks.onSuccess) {
              callbacks.onSuccess(responseData.data);
            }
            break;
          case 'WAITING':
            if (callbacks.onPending) {
              callbacks.onPending(responseData.data);
            }
            break;
          case 'DECLINED':
          case 'CANCELED':
          case 'EXPIRED':
            if (callbacks.onError) {
              callbacks.onError(`Pagamento ${status.toLowerCase()}`);
            }
            break;
        }
      }

    } catch (error) {
      console.error('❌ Erro ao consultar status do pagamento:', error);
      setError('Erro ao consultar status do pagamento', error);
    }
  }, [config.apiBaseUrl, updateState, callbacks, setError]);

  // Reset do estado
  const resetState = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      friendlyError: null,
      checkoutData: null,
      paymentUrl: null,
      paymentStatus: null
    });
  }, []);

  return {
    // Estado
    ...state,
    
    // Ações
    createCheckout,
    redirectToCheckout,
    checkPaymentStatus,
    clearError,
    resetState
  };
};
