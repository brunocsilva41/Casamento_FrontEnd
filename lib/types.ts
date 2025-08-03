export interface Gift {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  claimedBy: string | null;
  claimedAt: string | null;
  transactionId: string | null;
  createdAt: string;
}

export interface ClaimGiftRequest {
  guestName: string;
}

export interface ClaimGiftResponse {
  qrCode: string;
  gift: Gift;
}

export interface GeneratePixRequest {
  productName: string;
  amount: number;
}

export interface PixResponse {
  payload: string;
  qrCodeBase64: string;
  productName: string;
  amount: string;
  transactionId: string;
  pixKey: string;
}

export interface ApiError {
  error: string;
}

// Mercado Pago Types
export interface MercadoPagoConfig {
  publicKey: string;
  apiBaseUrl: string; // URL base da sua API backend
}

export interface PaymentMethod {
  id: 'PIX' | 'CREDIT_CARD';
  name: string;
  icon: string;
  enabled: boolean;
}

export interface PixPayment {
  id: string;
  qrCodeBase64: string;
  pixCode: string;
  amount: number;
  expiresAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'IN_PROCESS';
}

export interface CreditCardForm {
  holderName: string;
  cardNumber: string;
  expirationMonth: string;
  expirationYear: string;
  cvv: string;
  documentType: 'CPF' | 'CNPJ';
  documentNumber: string;
  installments: number;
}

export interface InstallmentOption {
  installments: number;
  totalAmount: number;
  installmentAmount: number;
  totalInterest: number;
  interestRate: number;
}

export interface PaymentToken {
  id: string;
  cardId?: string;
}

// Estrutura para criar pagamento conforme sua API
export interface CreatePaymentRequest {
  method: 'PIX' | 'CREDIT_CARD';
  amount: number;
  description: string;
  customer: {
    name: string;
    email: string;
    document: string;
  };
  cardToken?: string;
  installments?: number;
  giftId?: string;
}

// Resposta da sua API
export interface PaymentResponse {
  id: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'IN_PROCESS';
  method: 'PIX' | 'CREDIT_CARD';
  amount: number;
  description: string;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  qrCode?: string;
  qrCodeBase64?: string;
  pixCode?: string;
  expiresAt?: string;
  installments?: number;
  customer: {
    name: string;
    email: string;
    document: string;
  };
  gift?: {
    id: string;
    name: string;
  };
}

export interface CheckoutCallbacks {
  onSuccess: (payment: PaymentResponse) => void;
  onError: (error: Error) => void;
  onPending: (payment: PaymentResponse) => void;
}
