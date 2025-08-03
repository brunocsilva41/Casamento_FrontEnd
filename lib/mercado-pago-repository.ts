import {
    CreditCardForm,
    InstallmentOption,
    MercadoPagoConfig,
    PaymentRequest,
    PaymentResponse,
    PaymentToken
} from '@/lib/types';

export class MercadoPagoRepository {
  private config: MercadoPagoConfig;

  constructor(config: MercadoPagoConfig) {
    this.config = config;
  }

  private async makeRequest<T>(
    url: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.config.publicKey}`,
    };

    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    return response.json();
  }

  /**
   * Create a PIX payment
   */
  async createPixPayment(amount: number, description: string): Promise<PaymentResponse> {
    const paymentRequest = {
      transaction_amount: amount,
      description,
      payment_method_id: 'pix',
    };

    const data = await this.makeRequest<any>(this.config.pixApiUrl, {
      method: 'POST',
      body: JSON.stringify(paymentRequest),
    });

    return {
      id: data.id,
      status: data.status,
      statusDetail: data.status_detail,
      transactionAmount: data.transaction_amount,
      dateCreated: data.date_created,
      dateApproved: data.date_approved,
      paymentMethodId: data.payment_method_id,
      qrCode: data.point_of_interaction?.transaction_data?.qr_code_base64,
      pixCode: data.point_of_interaction?.transaction_data?.qr_code,
    };
  }

  /**
   * Create a payment token for credit card
   */
  async createPaymentToken(cardForm: CreditCardForm): Promise<PaymentToken> {
    const tokenRequest = {
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
    };

    // This would typically use the MercadoPago.js SDK for secure tokenization
    // For now, we'll use a placeholder endpoint
    const data = await this.makeRequest<any>('/api/mercadopago/create-token', {
      method: 'POST',
      body: JSON.stringify(tokenRequest),
    });

    return {
      id: data.id,
      cardId: data.card_id,
    };
  }

  /**
   * Process credit card payment
   */
  async processCreditCardPayment(
    amount: number,
    description: string,
    token: string,
    installments: number,
    customerEmail: string,
    identification: { type: string; number: string }
  ): Promise<PaymentResponse> {
    const paymentRequest: PaymentRequest = {
      amount,
      description,
      paymentMethodId: 'visa', // This should be detected from the card
      token,
      installments,
      payer: {
        email: customerEmail,
        identification,
      },
    };

    const data = await this.makeRequest<any>(this.config.creditCardApiUrl, {
      method: 'POST',
      body: JSON.stringify(paymentRequest),
    });

    return {
      id: data.id,
      status: data.status,
      statusDetail: data.status_detail,
      transactionAmount: data.transaction_amount,
      dateCreated: data.date_created,
      dateApproved: data.date_approved,
      paymentMethodId: data.payment_method_id,
    };
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(paymentId: string): Promise<PaymentResponse> {
    const data = await this.makeRequest<any>(
      `${this.config.paymentStatusApiUrl}/${paymentId}`
    );

    return {
      id: data.id,
      status: data.status,
      statusDetail: data.status_detail,
      transactionAmount: data.transaction_amount,
      dateCreated: data.date_created,
      dateApproved: data.date_approved,
      paymentMethodId: data.payment_method_id,
    };
  }

  /**
   * Get installment options for credit card
   */
  async getInstallmentOptions(amount: number, cardBin?: string): Promise<InstallmentOption[]> {
    try {
      // This would typically call the MP API to get real installment options
      // For now, we'll simulate the calculation
      const options: InstallmentOption[] = [];
      
      for (let i = 1; i <= 12; i++) {
        // Simulate interest rates (this would come from MP API)
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
      console.error('Error getting installment options:', error);
      throw new Error('Erro ao obter opções de parcelamento');
    }
  }

  /**
   * Validate card number and get card info
   */
  async getCardInfo(cardNumber: string): Promise<{
    paymentMethodId: string;
    cardBin: string;
    issuer: string;
  }> {
    try {
      // This would call MP API to validate and get card info
      // For now, we'll simulate based on card number patterns
      const cleanNumber = cardNumber.replace(/\s/g, '');
      const bin = cleanNumber.substring(0, 6);
      
      let paymentMethodId = 'visa';
      let issuer = 'unknown';
      
      if (/^4/.test(cleanNumber)) {
        paymentMethodId = 'visa';
        issuer = 'visa';
      } else if (/^5[1-5]/.test(cleanNumber)) {
        paymentMethodId = 'master';
        issuer = 'mastercard';
      } else if (/^3[47]/.test(cleanNumber)) {
        paymentMethodId = 'amex';
        issuer = 'american_express';
      } else if (/^6/.test(cleanNumber)) {
        paymentMethodId = 'discover';
        issuer = 'discover';
      }
      
      return {
        paymentMethodId,
        cardBin: bin,
        issuer,
      };
    } catch (error) {
      console.error('Error getting card info:', error);
      throw new Error('Erro ao validar cartão');
    }
  }
}

/**
 * Factory function to create a repository instance
 */
export const createMercadoPagoRepository = (config: MercadoPagoConfig): MercadoPagoRepository => {
  return new MercadoPagoRepository(config);
};
