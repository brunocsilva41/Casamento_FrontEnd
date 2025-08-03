import { getFriendlyErrorMessage } from '@/lib/error-handler';
import {
    CheckoutCallbacks,
    CreatePaymentRequest,
    CreditCardForm,
    InstallmentOption,
    MercadoPagoConfig,
    PaymentMethod,
    PaymentResponse,
    PaymentToken,
    PixPayment
} from '@/lib/types';
import { useCallback, useEffect, useState } from 'react';

interface UseMercadoPagoProps {
  config: MercadoPagoConfig;
  amount: number;
  description: string;
  customer: {
    name: string;
    email: string;
    document: string;
  };
  giftId?: string;
  callbacks: CheckoutCallbacks;
}

interface MercadoPagoState {
  isLoading: boolean;
  error: string | null;
  friendlyError: any; // Erro formatado para o usuário
  paymentMethods: PaymentMethod[];
  selectedMethod: PaymentMethod | null;
  pixPayment: PixPayment | null;
  installmentOptions: InstallmentOption[];
  paymentToken: PaymentToken | null;
  paymentStatus: PaymentResponse | null;
}

export const useMercadoPago = ({ config, amount, description, customer, giftId, callbacks }: UseMercadoPagoProps) => {
  const [state, setState] = useState<MercadoPagoState>({
    isLoading: false,
    error: null,
    friendlyError: null,
    paymentMethods: [
      { id: 'PIX', name: 'PIX', icon: '💳', enabled: true },
      { id: 'CREDIT_CARD', name: 'Cartão de Crédito', icon: '💳', enabled: true }
    ],
    selectedMethod: null,
    pixPayment: null,
    installmentOptions: [],
    paymentToken: null,
    paymentStatus: null
  });

  // Test API connectivity
  const testApiConnection = useCallback(async () => {
    const testUrls = [
      config.apiBaseUrl,
      'http://localhost:3001',
      'http://localhost:3000',
      'http://localhost:8000'
    ];

    for (const url of testUrls) {
      try {
        console.log(`🔍 Testando conectividade: ${url}`);
        const response = await fetch(`${url}/api/payments`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (response.ok || response.status === 404) { // 404 é ok, significa que a rota existe
          console.log(`✅ Backend encontrado: ${url}`);
          return url;
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido';
        console.log(`❌ Falha: ${url} - ${errorMsg}`);
      }
    }
    
    throw new Error('❌ Servidor backend não encontrado. Verifique se está rodando.');
  }, [config.apiBaseUrl]);

  const updateState = useCallback((updates: Partial<MercadoPagoState>) => {
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

  const setLoading = useCallback((isLoading: boolean) => {
    updateState({ isLoading, error: null, friendlyError: null });
  }, [updateState]);

  // Poll payment status for PIX
  const startPaymentStatusPolling = useCallback((paymentId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`${config.apiBaseUrl}/api/payments/${paymentId}`, {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const responseData = await response.json();
          
          // Verificar se a resposta tem o formato { success: true, data: {...} }
          const paymentData = responseData.success ? responseData.data : responseData;
          
          const paymentResponse: PaymentResponse = {
            id: paymentData.id,
            status: paymentData.status,
            method: paymentData.method || 'PIX',
            amount: paymentData.amount,
            description: paymentData.description || description,
            customer: paymentData.customer || customer,
            qrCodeBase64: paymentData.pixQrCodeBase64,
            pixCode: paymentData.pixQrCode,
            expiresAt: paymentData.expiresAt,
            createdAt: paymentData.createdAt || new Date().toISOString(),
            updatedAt: paymentData.updatedAt || new Date().toISOString(),
            approvedAt: paymentData.approvedAt
          };
          
          updateState({ paymentStatus: paymentResponse });

          if (paymentData.status === 'APPROVED') {
            clearInterval(pollInterval);
            callbacks.onSuccess(paymentResponse);
          } else if (paymentData.status === 'REJECTED' || paymentData.status === 'CANCELLED') {
            clearInterval(pollInterval);
            callbacks.onError(new Error(`Pagamento ${paymentData.status}`));
          }
        }
      } catch (error) {
        console.error('Erro ao verificar status do pagamento:', error);
      }
    }, 5000); // Poll every 5 seconds

    // Clear interval after 10 minutes
    setTimeout(() => clearInterval(pollInterval), 10 * 60 * 1000);
  }, [config.apiBaseUrl, callbacks, updateState, description, customer]);

  // Generate PIX Payment
  const generatePixPayment = useCallback(async () => {
    setLoading(true);
    updateState({ error: null }); // Limpar erro anterior
    
    try {
      // Test API connectivity first
      const apiUrl = await testApiConnection();
      
      // Validar dados obrigatórios
      if (!customer.name || !customer.name.trim()) {
        throw new Error('Nome do cliente é obrigatório');
      }
      
      if (!amount || amount <= 0) {
        throw new Error('Valor deve ser maior que zero');
      }

      const paymentRequest: CreatePaymentRequest = {
        method: 'PIX',
        amount,
        description,
        customer: {
          name: customer.name.trim(),
          email: customer.email || `${customer.name.toLowerCase().replace(/\s+/g, '')}@guest.com`,
          document: customer.document || '00000000000'
        },
        giftId,
      };

      console.log('🔄 Enviando requisição PIX:', {
        url: `${apiUrl}/api/payments`,
        payload: paymentRequest
      });

      const response = await fetch(`${apiUrl}/api/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentRequest),
      });

      console.log('📡 Resposta do servidor:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erro detalhado do servidor:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        
        let errorMessage = `Erro HTTP: ${response.status}`;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          // Se não conseguir fazer parse do JSON, usar o texto como está
          errorMessage = errorText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      const responseData = await response.json();
      console.log('✅ Dados recebidos do backend:', responseData);

      // O backend retorna { success: true, data: {...} }
      if (!responseData.success || !responseData.data) {
        throw new Error('Formato de resposta inválido do servidor');
      }

      const paymentData = responseData.data;
      
      const pixPayment: PixPayment = {
        id: paymentData.id,
        qrCodeBase64: paymentData.pixQrCodeBase64 || '',
        pixCode: paymentData.pixQrCode || '',
        amount,
        expiresAt: paymentData.expiresAt || new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        status: paymentData.status,
      };

      // Criar um PaymentResponse compatível
      const paymentResponse: PaymentResponse = {
        id: paymentData.id,
        status: paymentData.status,
        method: 'PIX',
        amount,
        description,
        customer,
        qrCodeBase64: paymentData.pixQrCodeBase64,
        pixCode: paymentData.pixQrCode,
        expiresAt: paymentData.expiresAt,
        createdAt: paymentData.createdAt || new Date().toISOString(),
        updatedAt: paymentData.updatedAt || new Date().toISOString()
      };

      updateState({ pixPayment, paymentStatus: paymentResponse, isLoading: false });
      
      // Start polling for payment status
      startPaymentStatusPolling(paymentData.id);
      
    } catch (error) {
      console.error('❌ Erro ao gerar pagamento PIX:', error);
      
      // Usar sistema de tratamento de erros amigável
      const errorMessage = error instanceof Error ? error.message : 'Erro ao gerar pagamento PIX';
      setError(errorMessage, error);
    }
  }, [amount, description, customer, giftId, setLoading, setError, updateState, startPaymentStatusPolling, testApiConnection]);

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

  // Create payment token for credit card using MercadoPago.js SDK
  const createPaymentToken = useCallback(async (cardForm: CreditCardForm): Promise<PaymentToken | null> => {
    setLoading(true);
    try {
      // Check if MercadoPago SDK is loaded
      if (typeof window === 'undefined' || !(window as any).MercadoPago) {
        throw new Error('SDK do Mercado Pago não foi carregado. Adicione o script do MP na página.');
      }

      const mp = new (window as any).MercadoPago(config.publicKey);

      // Create token using MercadoPago SDK
      const tokenData = await mp.createCardToken({
        cardNumber: cardForm.cardNumber.replace(/\s/g, ''),
        securityCode: cardForm.cvv,
        expirationMonth: cardForm.expirationMonth,
        expirationYear: cardForm.expirationYear,
        cardholder: {
          name: cardForm.holderName,
          identification: {
            type: cardForm.documentType,
            number: cardForm.documentNumber.replace(/\D/g, ''),
          },
        },
      });

      if (tokenData.error) {
        throw new Error(tokenData.error.message || 'Erro ao processar cartão');
      }

      const token: PaymentToken = {
        id: tokenData.id,
        cardId: tokenData.card_id,
      };

      updateState({ paymentToken: token, isLoading: false });
      return token;
      
    } catch (error) {
      console.error('❌ Erro ao criar token de pagamento:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao processar cartão';
      setError(errorMessage, error);
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
        customer,
        cardToken: token.id,
        installments,
        giftId,
      };

      const response = await fetch(`${config.apiBaseUrl}/api/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentRequest),
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
      
      // O backend retorna { success: true, data: {...} }
      if (!responseData.success || !responseData.data) {
        throw new Error('Formato de resposta inválido do servidor');
      }

      const paymentData = responseData.data;
      
      const paymentResponse: PaymentResponse = {
        id: paymentData.id,
        status: paymentData.status,
        method: 'CREDIT_CARD',
        amount,
        description,
        customer,
        installments: paymentData.installments,
        createdAt: paymentData.createdAt || new Date().toISOString(),
        updatedAt: paymentData.updatedAt || new Date().toISOString(),
        approvedAt: paymentData.approvedAt
      };
      
      updateState({ paymentStatus: paymentResponse, isLoading: false });
      
      // Handle payment result
      if (paymentResponse.status === 'APPROVED') {
        callbacks.onSuccess(paymentResponse);
      } else if (paymentResponse.status === 'PENDING') {
        callbacks.onPending(paymentResponse);
      } else {
        callbacks.onError(new Error(`Pagamento ${paymentResponse.status}`));
      }
      
    } catch (error) {
      console.error('❌ Erro ao processar pagamento com cartão:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao processar pagamento';
      setError(errorMessage, error);
      callbacks.onError(new Error(errorMessage));
    }
  }, [config.apiBaseUrl, amount, description, customer, giftId, callbacks, createPaymentToken, setLoading, setError, updateState]);

  // Load installment options when amount changes
  useEffect(() => {
    if (amount > 0) {
      (async () => {
        try {
          const options: InstallmentOption[] = [];
          
          for (let i = 1; i <= 12; i++) {
            const interestRate = i === 1 ? 0 : (i - 1) * 0.025; 
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
          
          updateState({ installmentOptions: options });
        } catch (error) {
          console.error('Erro ao obter opções de parcelamento:', error);
        }
      })();
    }
  }, [amount, updateState]);

  return {
    ...state,
    actions: {
      setSelectedMethod: (method: PaymentMethod | null) => updateState({ selectedMethod: method }),
      generatePixPayment,
      processCreditCardPayment,
      clearError: () => updateState({ error: null, friendlyError: null }),
      resetState: () => setState({
        isLoading: false,
        error: null,
        friendlyError: null,
        paymentMethods: state.paymentMethods,
        selectedMethod: null,
        pixPayment: null,
        installmentOptions: state.installmentOptions,
        paymentToken: null,
        paymentStatus: null
      }),
      // Função de teste exposta
      testConnection: testApiConnection,
    },
  };
};
