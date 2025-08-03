import {
    CheckoutCallbacks,
    CreditCardForm,
    InstallmentOption,
    MercadoPagoConfig,
    PaymentMethod,
    CreatePaymentRequest,
    PaymentResponse,
    PaymentToken,
    PixPayment
} from '@/lib/types';
import { useCallback, useEffect, useState } from 'react';

interface UseMercadoPagoProps {
  config: MercadoPagoConfig;
  amount: number;
  description: string;
  callbacks: CheckoutCallbacks;
}

interface MercadoPagoState {
  isLoading: boolean;
  error: string | null;
  paymentMethods: PaymentMethod[];
  selectedMethod: PaymentMethod | null;
  pixPayment: PixPayment | null;
  installmentOptions: InstallmentOption[];
  paymentToken: PaymentToken | null;
  paymentStatus: PaymentResponse | null;
}

export const useMercadoPago = ({ config, amount, description, callbacks }: UseMercadoPagoProps) => {
  const [state, setState] = useState<MercadoPagoState>({
    isLoading: false,
    error: null,
    paymentMethods: [
      { id: 'pix', name: 'PIX', icon: '💳', enabled: true },
      { id: 'credit_card', name: 'Cartão de Crédito', icon: '💳', enabled: true }
    ],
    selectedMethod: null,
    pixPayment: null,
    installmentOptions: [],
    paymentToken: null,
    paymentStatus: null
  });

  const updateState = useCallback((updates: Partial<MercadoPagoState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const setError = useCallback((error: string | null) => {
    updateState({ error, isLoading: false });
  }, [updateState]);

  const setLoading = useCallback((isLoading: boolean) => {
    updateState({ isLoading, error: null });
  }, [updateState]);

  // Poll payment status for PIX
  const startPaymentStatusPolling = useCallback((paymentId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`${config.paymentStatusApiUrl}/${paymentId}`, {
          headers: {
            'Authorization': `Bearer ${config.publicKey}`,
          },
        });

        if (response.ok) {
          const paymentData = await response.json();
          const paymentResponse: PaymentResponse = {
            id: paymentData.id,
            status: paymentData.status,
            statusDetail: paymentData.status_detail,
            transactionAmount: paymentData.transaction_amount,
            dateCreated: paymentData.date_created,
            dateApproved: paymentData.date_approved,
            paymentMethodId: paymentData.payment_method_id,
          };

          updateState({ paymentStatus: paymentResponse });

          if (paymentResponse.status === 'approved') {
            clearInterval(pollInterval);
            callbacks.onSuccess(paymentResponse);
          } else if (paymentResponse.status === 'rejected' || paymentResponse.status === 'cancelled') {
            clearInterval(pollInterval);
            callbacks.onError(new Error(`Pagamento ${paymentResponse.status}: ${paymentResponse.statusDetail}`));
          }
        }
      } catch (error) {
        console.error('Erro ao verificar status do pagamento:', error);
      }
    }, 5000); // Poll every 5 seconds

    // Clear interval after 10 minutes
    setTimeout(() => clearInterval(pollInterval), 10 * 60 * 1000);
  }, [config.paymentStatusApiUrl, config.publicKey, callbacks, updateState]);

  // Generate PIX Payment
  const generatePixPayment = useCallback(async () => {
    if (!config.pixApiUrl) {
      setError('URL da API PIX não configurada');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(config.pixApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.publicKey}`,
        },
        body: JSON.stringify({
          transaction_amount: amount,
          description,
          payment_method_id: 'pix',
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const data = await response.json();
      
      const pixPayment: PixPayment = {
        transactionId: data.id,
        qrCodeBase64: data.point_of_interaction?.transaction_data?.qr_code_base64 || '',
        pixCode: data.point_of_interaction?.transaction_data?.qr_code || '',
        amount,
        expiresAt: data.date_of_expiration || new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      };

      updateState({ pixPayment, isLoading: false });
      
      // Start polling for payment status
      startPaymentStatusPolling(data.id);
      
    } catch (error) {
      console.error('Erro ao gerar pagamento PIX:', error);
      setError(error instanceof Error ? error.message : 'Erro ao gerar pagamento PIX');
    }
  }, [config, amount, description, setLoading, setError, updateState, startPaymentStatusPolling]);

  // Get installment options
  const getInstallmentOptions = useCallback(async (): Promise<InstallmentOption[]> => {
    try {
      // Simulated installment calculation - replace with actual MP API call
      const options: InstallmentOption[] = [];
      
      for (let i = 1; i <= 12; i++) {
        const interestRate = i === 1 ? 0 : (i - 1) * 0.025; // 2.5% per installment after first
        const totalInterest = amount * interestRate;
        const totalAmount = amount + totalInterest;
        const installmentAmount = totalAmount / i;
        
        options.push({
          installments: i,
          totalAmount,
          installmentAmount,
          totalInterest,
          interestRate: interestRate * 100,
        });
      }
      
      return options;
    } catch (error) {
      console.error('Erro ao obter opções de parcelamento:', error);
      return [];
    }
  }, [amount]);

  // Create payment token for credit card
  const createPaymentToken = useCallback(async (cardForm: CreditCardForm): Promise<PaymentToken | null> => {
    setLoading(true);
    try {
      // This would typically use MercadoPago.js SDK for tokenization
      // For now, we'll simulate the token creation
      const tokenResponse = await fetch('/api/mercadopago/create-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.publicKey}`,
        },
        body: JSON.stringify({
          card_number: cardForm.cardNumber,
          security_code: cardForm.cvv,
          expiration_month: cardForm.expirationMonth,
          expiration_year: cardForm.expirationYear,
          cardholder: {
            name: cardForm.holderName,
            identification: {
              type: cardForm.documentType,
              number: cardForm.documentNumber,
            },
          },
        }),
      });

      if (!tokenResponse.ok) {
        throw new Error(`Erro ao criar token: ${tokenResponse.status}`);
      }

      const tokenData = await tokenResponse.json();
      const token: PaymentToken = {
        id: tokenData.id,
        cardId: tokenData.card_id,
      };

      updateState({ paymentToken: token, isLoading: false });
      return token;
      
    } catch (error) {
      console.error('Erro ao criar token de pagamento:', error);
      setError(error instanceof Error ? error.message : 'Erro ao processar cartão');
      return null;
    }
  }, [config.publicKey, setLoading, setError, updateState]);

  // Process credit card payment
  const processCreditCardPayment = useCallback(async (
    cardForm: CreditCardForm, 
    installments: number
  ) => {
    const token = await createPaymentToken(cardForm);
    if (!token) return;

    setLoading(true);
    try {
      const paymentRequest: CreatePaymentRequest = {
        method: 'CREDIT_CARD',
        amount,
        description,
        customer: {
          name: cardForm.cardholderName,
          email: 'customer@email.com', // This should come from props
          document: cardForm.documentNumber,
        },
        cardToken: token.id,
        installments,
      };

      const response = await fetch(config.creditCardApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.publicKey}`,
        },
        body: JSON.stringify(paymentRequest),
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const paymentData = await response.json();
      const paymentResponse: PaymentResponse = {
        id: paymentData.id,
        status: paymentData.status,
        statusDetail: paymentData.status_detail,
        transactionAmount: paymentData.transaction_amount,
        dateCreated: paymentData.date_created,
        dateApproved: paymentData.date_approved,
        paymentMethodId: paymentData.payment_method_id,
      };

      updateState({ paymentStatus: paymentResponse, isLoading: false });
      
      // Handle payment result
      if (paymentResponse.status === 'approved') {
        callbacks.onSuccess(paymentResponse);
      } else if (paymentResponse.status === 'pending') {
        callbacks.onPending(paymentResponse);
      } else {
        callbacks.onError(new Error(`Pagamento ${paymentResponse.status}: ${paymentResponse.statusDetail}`));
      }
      
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao processar pagamento';
      setError(errorMessage);
      callbacks.onError(new Error(errorMessage));
    }
  }, [config, amount, description, callbacks, createPaymentToken, setLoading, setError, updateState]);

  // Load installment options when amount changes
  useEffect(() => {
    if (amount > 0) {
      getInstallmentOptions().then(options => {
        updateState({ installmentOptions: options });
      });
    }
  }, [amount, updateState]);

  return {
    ...state,
    actions: {
      setSelectedMethod: (method: PaymentMethod | null) => updateState({ selectedMethod: method }),
      generatePixPayment,
      processCreditCardPayment,
      clearError: () => setError(null),
      resetState: () => setState({
        isLoading: false,
        error: null,
        paymentMethods: state.paymentMethods,
        selectedMethod: null,
        pixPayment: null,
        installmentOptions: state.installmentOptions,
        paymentToken: null,
        paymentStatus: null
      }),
    },
  };
};
