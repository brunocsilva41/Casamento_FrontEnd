// Types para o sistema administrativo

export interface User {
  id: string;
  name: string;
  email: string;
  role: number; // 1 = user, 2 = admin
  document?: string;
  phone?: string;
  createdAt: string;
  lastLogin?: string;
  isActive: boolean;
}

export interface Gift {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  isActive: boolean;
  claimedBy?: string;
  claimedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  giftId: string;
  giftName: string;
  amount: number;
  method: 'PIX' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'BOLETO';
  status: 'PENDING' | 'PAID' | 'CANCELLED' | 'REFUNDED' | 'EXPIRED';
  paymentId?: string; // ID do PagBank
  checkoutId?: string;
  referenceId?: string;
  createdAt: string;
  paidAt?: string;
  cancelledAt?: string;
}

export interface SystemConfig {
  id: string;
  key: string;
  value: string;
  description: string;
  type: 'string' | 'number' | 'boolean' | 'json';
  category: 'payment' | 'email' | 'general' | 'security';
  updatedAt: string;
  updatedBy: string;
}

// Dashboard Statistics
export interface DashboardStats {
  totalUsers: number;
  totalGifts: number;
  totalPayments: number;
  totalRevenue: number;
  pendingPayments: number;
  activeUsers: number;
  claimedGifts: number;
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  type: 'user_registered' | 'gift_claimed' | 'payment_completed' | 'payment_cancelled';
  description: string;
  userId?: string;
  userName?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

// Charts Data
export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string;
  borderWidth?: number;
}

// Filters and Pagination
export interface UserFilters {
  search?: string;
  role?: number;
  isActive?: boolean;
  dateFrom?: string;
  dateTo?: string;
}

export interface GiftFilters {
  search?: string;
  category?: string;
  isActive?: boolean;
  isClaimed?: boolean;
  priceMin?: number;
  priceMax?: number;
}

export interface PaymentFilters {
  search?: string;
  method?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  amountMin?: number;
  amountMax?: number;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Form Types
export interface CreateUserRequest {
  name: string;
  email: string;
  role: number;
  document?: string;
  phone?: string;
  password: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  role?: number;
  document?: string;
  phone?: string;
  isActive?: boolean;
}

export interface CreateGiftRequest {
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  isActive?: boolean;
}

export interface UpdateGiftRequest {
  name?: string;
  description?: string;
  price?: number;
  imageUrl?: string;
  category?: string;
  isActive?: boolean;
}

export interface UpdatePaymentRequest {
  status?: string;
  notes?: string;
}

export interface UpdateSystemConfigRequest {
  value: string;
  description?: string;
}

// Reports
export interface ReportParams {
  type: 'users' | 'gifts' | 'payments' | 'revenue';
  dateFrom: string;
  dateTo: string;
  format: 'json' | 'csv' | 'pdf';
  filters?: Record<string, any>;
}

export interface ReportData {
  title: string;
  description: string;
  generatedAt: string;
  params: ReportParams;
  data: any[];
  summary?: Record<string, any>;
}

// Error Handling
export interface AdminError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

// API Response Types
export interface AdminApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: AdminError;
  pagination?: PaginatedResponse<any>['pagination'];
}

// Table Column Definitions
export interface TableColumn<T = any> {
  key: keyof T;
  title: string;
  sortable?: boolean;
  width?: string;
  render?: (value: any, item: T) => React.ReactNode;
}

// Bulk Operations
export interface BulkOperation {
  action: 'delete' | 'activate' | 'deactivate' | 'export';
  itemIds: string[];
  params?: Record<string, any>;
}
