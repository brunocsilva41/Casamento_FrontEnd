import {
    AdminApiResponse,
    BulkOperation,
    CreateGiftRequest,
    CreateUserRequest,
    DashboardStats,
    Gift,
    GiftFilters,
    PaginatedResponse,
    PaginationParams,
    Payment,
    PaymentFilters,
    ReportData,
    ReportParams,
    SystemConfig,
    UpdateGiftRequest,
    UpdatePaymentRequest,
    UpdateSystemConfigRequest,
    UpdateUserRequest,
    User,
    UserFilters
} from '@/lib/types/admin';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

// Helper function for authenticated requests
async function adminApiRequest<T>(
  endpoint: string, 
  options?: RequestInit
): Promise<AdminApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = localStorage.getItem('auth_token');
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options?.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP ${response.status}: ${data.error || 'Erro desconhecido'}`);
    }

    return data;
  } catch (error) {
    console.error('Admin API Error:', error);
    throw error;
  }
}

export const adminUserService = {
  // Listar usuários com filtros e paginação
  async getUsers(
    filters: UserFilters = {}, 
    pagination: PaginationParams = { page: 1, limit: 10 }
  ): Promise<PaginatedResponse<User>> {
    const params = new URLSearchParams();
    
    // Adicionar filtros
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, value.toString());
      }
    });
    
    // Adicionar paginação
    Object.entries(pagination).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });

    const response = await adminApiRequest<PaginatedResponse<User>>(
      `/admin/users?${params.toString()}`
    );
    
    return response.data!;
  },

  // Buscar usuário por ID
  async getUserById(id: string): Promise<User> {
    const response = await adminApiRequest<User>(`/admin/users/${id}`);
    return response.data!;
  },

  // Criar usuário
  async createUser(userData: CreateUserRequest): Promise<User> {
    const response = await adminApiRequest<User>('/admin/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    return response.data!;
  },

  // Atualizar usuário
  async updateUser(id: string, userData: UpdateUserRequest): Promise<User> {
    const response = await adminApiRequest<User>(`/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
    return response.data!;
  },

  // Deletar usuário
  async deleteUser(id: string): Promise<void> {
    await adminApiRequest(`/admin/users/${id}`, {
      method: 'DELETE',
    });
  },

  // Operações em lote
  async bulkOperation(operation: BulkOperation): Promise<void> {
    await adminApiRequest('/admin/users/bulk', {
      method: 'POST',
      body: JSON.stringify(operation),
    });
  },
};

export const adminGiftService = {
  // Listar presentes
  async getGifts(
    filters: GiftFilters = {}, 
    pagination: PaginationParams = { page: 1, limit: 10 }
  ): Promise<PaginatedResponse<Gift>> {
    const params = new URLSearchParams();
    
    Object.entries({ ...filters, ...pagination }).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await adminApiRequest<PaginatedResponse<Gift>>(
      `/admin/gifts?${params.toString()}`
    );
    return response.data!;
  },

  // Buscar presente por ID
  async getGiftById(id: string): Promise<Gift> {
    const response = await adminApiRequest<Gift>(`/admin/gifts/${id}`);
    return response.data!;
  },

  // Criar presente
  async createGift(giftData: CreateGiftRequest): Promise<Gift> {
    const response = await adminApiRequest<Gift>('/admin/gifts', {
      method: 'POST',
      body: JSON.stringify(giftData),
    });
    return response.data!;
  },

  // Atualizar presente
  async updateGift(id: string, giftData: UpdateGiftRequest): Promise<Gift> {
    const response = await adminApiRequest<Gift>(`/admin/gifts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(giftData),
    });
    return response.data!;
  },

  // Deletar presente
  async deleteGift(id: string): Promise<void> {
    await adminApiRequest(`/admin/gifts/${id}`, {
      method: 'DELETE',
    });
  },

  // Operações em lote
  async bulkOperation(operation: BulkOperation): Promise<void> {
    await adminApiRequest('/admin/gifts/bulk', {
      method: 'POST',
      body: JSON.stringify(operation),
    });
  },

  // Categorias disponíveis
  async getCategories(): Promise<string[]> {
    const response = await adminApiRequest<string[]>('/admin/gifts/categories');
    return response.data!;
  },
};

export const adminPaymentService = {
  // Listar pagamentos
  async getPayments(
    filters: PaymentFilters = {}, 
    pagination: PaginationParams = { page: 1, limit: 10 }
  ): Promise<PaginatedResponse<Payment>> {
    const params = new URLSearchParams();
    
    Object.entries({ ...filters, ...pagination }).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await adminApiRequest<PaginatedResponse<Payment>>(
      `/admin/payments?${params.toString()}`
    );
    return response.data!;
  },

  // Buscar pagamento por ID
  async getPaymentById(id: string): Promise<Payment> {
    const response = await adminApiRequest<Payment>(`/admin/payments/${id}`);
    return response.data!;
  },

  // Atualizar status do pagamento
  async updatePayment(id: string, paymentData: UpdatePaymentRequest): Promise<Payment> {
    const response = await adminApiRequest<Payment>(`/admin/payments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(paymentData),
    });
    return response.data!;
  },

  // Cancelar pagamento
  async cancelPayment(id: string, reason: string): Promise<void> {
    await adminApiRequest(`/admin/payments/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },

  // Processar reembolso
  async refundPayment(id: string, amount?: number, reason?: string): Promise<void> {
    await adminApiRequest(`/admin/payments/${id}/refund`, {
      method: 'POST',
      body: JSON.stringify({ amount, reason }),
    });
  },
};

export const adminDashboardService = {
  // Estatísticas do dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await adminApiRequest<DashboardStats>('/admin/dashboard/stats');
    return response.data!;
  },

  // Dados para gráficos
  async getChartData(type: string, period: string = '30d'): Promise<any> {
    const response = await adminApiRequest(`/admin/dashboard/charts/${type}?period=${period}`);
    return response.data!;
  },

  // Atividade recente
  async getRecentActivity(limit: number = 10): Promise<any[]> {
    const response = await adminApiRequest(`/admin/dashboard/activity?limit=${limit}`);
    return Array.isArray(response.data) ? response.data : [];
  },
};

export const adminSystemService = {
  // Configurações do sistema
  async getSystemConfigs(): Promise<SystemConfig[]> {
    const response = await adminApiRequest<SystemConfig[]>('/admin/system/config');
    return response.data!;
  },

  // Atualizar configuração
  async updateConfig(key: string, configData: UpdateSystemConfigRequest): Promise<SystemConfig> {
    const response = await adminApiRequest<SystemConfig>(`/admin/system/config/${key}`, {
      method: 'PUT',
      body: JSON.stringify(configData),
    });
    return response.data!;
  },

  // Backup do sistema
  async createBackup(): Promise<{ url: string; filename: string }> {
    const response = await adminApiRequest<{ url: string; filename: string }>('/admin/system/backup', {
      method: 'POST',
    });
    return response.data!;
  },

  // Logs do sistema
  async getSystemLogs(level?: string, limit: number = 100): Promise<any[]> {
    const params = new URLSearchParams();
    if (level) params.append('level', level);
    params.append('limit', limit.toString());

    const response = await adminApiRequest(`/admin/system/logs?${params.toString()}`);
    return Array.isArray(response.data) ? response.data : [];
  },
};

export const adminReportService = {
  // Gerar relatório
  async generateReport(params: ReportParams): Promise<ReportData> {
    const response = await adminApiRequest<ReportData>('/admin/reports/generate', {
      method: 'POST',
      body: JSON.stringify(params),
    });
    return response.data!;
  },

  // Download de relatório
  async downloadReport(reportId: string, format: 'csv' | 'pdf'): Promise<Blob> {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${API_BASE_URL}/admin/reports/${reportId}/download?format=${format}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Erro ao baixar relatório');
    }

    return response.blob();
  },

  // Histórico de relatórios
  async getReportHistory(): Promise<any[]> {
    const response = await adminApiRequest('/admin/reports/history');
    return Array.isArray(response.data) ? response.data : [];
  },
};
