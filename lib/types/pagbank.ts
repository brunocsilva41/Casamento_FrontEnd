// PagBank types and interfaces based on official documentation

export interface PagBankConfig {
  token: string;
  environment: 'sandbox' | 'production';
  apiBaseUrl: string;
}

export interface PagBankCustomer {
  name: string;
  email: string;
  tax_id: string; // CPF/CNPJ
  phone?: {
    country: string;
    area: string;
    number: string;
  };
}

export interface PagBankItem {
  reference_id?: string;
  name: string;
  quantity: number;
  unit_amount: number; // Valor em centavos
  description?: string;
}

export interface PagBankShipping {
  type?: 'FIXED' | 'FREE' | 'CALCULATED';
  service_type?: string;
  amount?: number; // Em centavos
  address?: {
    country: string;
    region_code: string;
    city: string;
    postal_code: string;
    street: string;
    number: string;
    locality?: string;
    complement?: string;
  };
  address_modifiable?: boolean;
  estimated_delivery_time_in_days?: number;
}

export interface PagBankPaymentMethod {
  type: 'CREDIT_CARD' | 'DEBIT_CARD' | 'PIX' | 'BOLETO' | 'PAGBANK_ACCOUNT';
  brands?: string[]; // Bandeiras aceitas
}

export interface PagBankPaymentMethodConfig {
  type: 'CREDIT_CARD' | 'DEBIT_CARD';
  config_options?: Array<{
    option: 'INSTALLMENTS_LIMIT' | 'INTEREST_FREE_INSTALLMENTS';
    value: string;
  }>;
}

export interface CreatePagBankCheckoutRequest {
  reference_id: string;
  customer_modifiable?: boolean;
  customer?: PagBankCustomer;
  items: PagBankItem[];
  additional_amount?: number; // Em centavos
  discount_amount?: number; // Em centavos
  shipping?: PagBankShipping;
  payment_methods?: PagBankPaymentMethod[];
  payment_methods_configs?: PagBankPaymentMethodConfig[];
  soft_descriptor?: string;
  redirect_url?: string;
  notification_urls?: string[];
  payment_notification_urls?: string[];
  expiration_date?: string; // ISO-8601
}

export interface PagBankCheckoutResponse {
  id: string;
  reference_id: string;
  created_at: string;
  customer: PagBankCustomer;
  items: PagBankItem[];
  shipping?: PagBankShipping;
  payment_methods: PagBankPaymentMethod[];
  soft_descriptor?: string;
  redirect_url?: string;
  return_url?: string;
  notification_urls?: string[];
  payment_notification_urls?: string[];
  expiration_date?: string;
  links: Array<{
    rel: string;
    href: string;
    method: string;
  }>;
  qr_codes?: Array<{
    id: string;
    text: string;
    links: Array<{
      rel: string;
      href: string;
      method: string;
    }>;
  }>;
}

export interface PagBankPaymentStatus {
  id: string;
  reference_id: string;
  status: 'PAID' | 'WAITING' | 'DECLINED' | 'CANCELED' | 'EXPIRED';
  created_at: string;
  amount: {
    value: number; // Em centavos
    currency: string;
  };
  payment_method: {
    type: string;
    installments?: number;
  };
}

export interface PagBankError {
  type: string;
  code: string;
  detail: string;
  message?: string;
  parameter_name?: string;
}

export interface PagBankErrorResponse {
  error_messages: PagBankError[];
}

// Callbacks para o frontend
export interface PagBankCallbacks {
  onSuccess?: (payment: PagBankPaymentStatus) => void;
  onPending?: (payment: PagBankPaymentStatus) => void;
  onError?: (error: PagBankError | string) => void;
  onCancel?: () => void;
}

// Configuração para o hook
export interface UsePagBankProps {
  config: PagBankConfig;
  amount: number;
  description: string;
  customer: {
    name: string;
    email: string;
    document: string;
  };
  giftId?: string;
  callbacks: PagBankCallbacks;
}

// Estado do hook
export interface PagBankState {
  isLoading: boolean;
  error: string | null;
  friendlyError: any;
  checkoutData: PagBankCheckoutResponse | null;
  paymentUrl: string | null;
  paymentStatus: PagBankPaymentStatus | null;
}
