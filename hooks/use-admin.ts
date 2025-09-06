'use client'

import {
    adminDashboardService,
    adminGiftService,
    adminPaymentService,
    adminReportService,
    adminSystemService,
    adminUserService
} from '@/lib/services/admin-service';
import { PaymentStatus } from '@/lib/types';
import {
    DashboardStats,
    Gift,
    GiftFilters,
    PaginatedResponse,
    PaginationParams,
    Payment,
    PaymentFilters,
    SystemConfig,
    User,
    UserFilters
} from '@/lib/types/admin';
import { useCallback, useEffect, useState, useMemo } from 'react';

// Hook para estatísticas do dashboard
export function useAdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [chartData, setChartData] = useState<any>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsData, activityData] = await Promise.all([
        adminDashboardService.getDashboardStats(),
        adminDashboardService.getRecentActivity(10)
      ]);

      setStats(statsData);
      setRecentActivity(activityData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchChartData = useCallback(async (type: string, period: string = '30d') => {
    try {
      const data = await adminDashboardService.getChartData(type, period);
      setChartData(data);
    } catch (err) {
      console.error('Erro ao carregar dados do gráfico:', err);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    stats,
    chartData,
    recentActivity,
    loading,
    error,
    refetch: fetchDashboardData,
    fetchChartData,
  };
}

// Hook para gerenciamento de usuários
export function useAdminUsers(
  filters: UserFilters = {},
  pagination: PaginationParams = { page: 1, limit: 10 }
) {
  const [data, setData] = useState<PaginatedResponse<User> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminUserService.getUsers(filters, pagination);
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  }, [filters, pagination]);

  const createUser = useCallback(async (userData: any) => {
    try {
      await adminUserService.createUser(userData);
      await fetchUsers(); // Recarregar lista
    } catch (err) {
      throw err;
    }
  }, [fetchUsers]);

  const updateUser = useCallback(async (id: string, userData: any) => {
    try {
      await adminUserService.updateUser(id, userData);
      await fetchUsers(); // Recarregar lista
    } catch (err) {
      throw err;
    }
  }, [fetchUsers]);

  const deleteUser = useCallback(async (id: string) => {
    try {
      await adminUserService.deleteUser(id);
      await fetchUsers(); // Recarregar lista
    } catch (err) {
      throw err;
    }
  }, [fetchUsers]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users: data?.data || [],
    pagination: data?.pagination,
    loading,
    error,
    refetch: fetchUsers,
    createUser,
    updateUser,
    deleteUser,
  };
}

// Hook para gerenciamento de presentes
export function useAdminGifts(
  filters: GiftFilters = {},
  pagination: PaginationParams = { page: 1, limit: 10 }
) {
  const [data, setData] = useState<PaginatedResponse<Gift> | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGifts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [giftsResponse, categoriesData] = await Promise.all([
        adminGiftService.getGifts(filters, pagination),
        adminGiftService.getCategories()
      ]);
      setData(giftsResponse);
      setCategories(categoriesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar presentes');
    } finally {
      setLoading(false);
    }
  }, [filters, pagination]);

  const createGift = useCallback(async (giftData: any) => {
    try {
      await adminGiftService.createGift(giftData);
      await fetchGifts();
    } catch (err) {
      throw err;
    }
  }, [fetchGifts]);

  const updateGift = useCallback(async (id: string, giftData: any) => {
    try {
      await adminGiftService.updateGift(id, giftData);
      await fetchGifts();
    } catch (err) {
      throw err;
    }
  }, [fetchGifts]);

  const deleteGift = useCallback(async (id: string) => {
    try {
      await adminGiftService.deleteGift(id);
      await fetchGifts();
    } catch (err) {
      throw err;
    }
  }, [fetchGifts]);

  useEffect(() => {
    fetchGifts();
  }, [fetchGifts]);

  return {
    gifts: data?.data || [],
    categories,
    pagination: data?.pagination,
    loading,
    error,
    refetch: fetchGifts,
    createGift,
    updateGift,
    deleteGift,
  };
}

// Hook para gerenciamento de pagamentos
export function useAdminPayments(
  filters: PaymentFilters = {},
  pagination: PaginationParams = { page: 1, limit: 10 }
) {
  const [data, setData] = useState<PaginatedResponse<Payment> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminPaymentService.getPayments(filters, pagination);
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar pagamentos');
    } finally {
      setLoading(false);
    }
  }, [filters, pagination]);

  const updatePayment = useCallback(async (id: string, paymentData: any) => {
    try {
      await adminPaymentService.updatePayment(id, paymentData);
      await fetchPayments();
    } catch (err) {
      throw err;
    }
  }, [fetchPayments]);

  const cancelPayment = useCallback(async (id: string, reason: string) => {
    try {
      await adminPaymentService.cancelPayment(id, reason);
      await fetchPayments();
    } catch (err) {
      throw err;
    }
  }, [fetchPayments]);

  const updatePaymentStatus = useCallback(async (id: string, status: PaymentStatus) => {
    try {
      await adminPaymentService.updatePayment(id, { status });
      await fetchPayments();
    } catch (err) {
      throw err;
    }
  }, [fetchPayments]);

  const refundPayment = useCallback(async (id: string, amount?: number, reason?: string) => {
    try {
      await adminPaymentService.refundPayment(id, amount, reason);
      await fetchPayments();
    } catch (err) {
      throw err;
    }
  }, [fetchPayments]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  // Stats calculation
  const stats = useMemo(() => {
    const payments = data?.data || [];
    return {
      totalPayments: payments.length,
      completedPayments: payments.filter(p => p.status === 'PAID').length,
      totalRevenue: payments
        .filter(p => p.status === 'PAID')
        .reduce((sum, p) => sum + p.amount, 0),
      pendingPayments: payments.filter(p => p.status === 'PENDING').length,
    };
  }, [data?.data]);

  return {
    payments: data?.data || [],
    stats,
    pagination: data?.pagination,
    loading,
    error,
    refetch: fetchPayments,
    updatePayment,
    updatePaymentStatus,
    cancelPayment,
    refundPayment,
  };
}

// Hook para configurações do sistema
export function useAdminSystem() {
  const [configs, setConfigs] = useState<SystemConfig[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConfigs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminSystemService.getSystemConfigs();
      setConfigs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar configurações');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateConfig = useCallback(async (key: string, configData: any) => {
    try {
      await adminSystemService.updateConfig(key, configData);
      await fetchConfigs();
    } catch (err) {
      throw err;
    }
  }, [fetchConfigs]);

  const updateSystemConfig = useCallback(async (configData: any) => {
    try {
      await adminSystemService.updateConfig('system', configData);
      await fetchConfigs();
    } catch (err) {
      throw err;
    }
  }, [fetchConfigs]);

  const testEmailConfig = useCallback(async () => {
    try {
      // Mock implementation - replace with actual service call
      return { success: true, message: 'Email de teste enviado com sucesso!' };
    } catch (err) {
      throw err;
    }
  }, []);

  const backupDatabase = useCallback(async () => {
    try {
      const result = await adminSystemService.createBackup();
      return result;
    } catch (err) {
      throw err;
    }
  }, []);

  const restoreDatabase = useCallback(async (backupFile: File) => {
    try {
      // Mock implementation - replace with actual service call
      return { success: true, message: 'Banco de dados restaurado com sucesso!' };
    } catch (err) {
      throw err;
    }
  }, []);

  const createBackup = useCallback(async () => {
    try {
      const result = await adminSystemService.createBackup();
      return result;
    } catch (err) {
      throw err;
    }
  }, []);

  const fetchLogs = useCallback(async (level?: string, limit: number = 100) => {
    try {
      const data = await adminSystemService.getSystemLogs(level, limit);
      setLogs(data);
    } catch (err) {
      console.error('Erro ao carregar logs:', err);
    }
  }, []);

  useEffect(() => {
    fetchConfigs();
  }, [fetchConfigs]);

  // Mock system config for compatibility
  const systemConfig = useMemo(() => ({
    general: {
      siteName: 'Casamento App',
      description: 'Sistema de Lista de Casamento',
      maintenanceMode: false,
    },
    email: {
      emailFrom: 'noreply@casamento.com',
      emailProvider: 'smtp',
      smtpHost: 'smtp.gmail.com',
      smtpPort: 587,
      smtpUser: '',
      smtpPassword: '',
    },
    payment: {
      pagBankToken: '',
      pagBankSandbox: true,
      pixKey: '',
      pixKeyType: 'random' as const,
      enableCreditCard: true,
      enableDebitCard: true,
      enablePix: true,
      enableBoleto: false,
      minPaymentAmount: 10,
      maxPaymentAmount: 50000,
    },
    security: {
      jwtSecret: '',
      sessionTimeout: 3600,
      maxLoginAttempts: 5,
    }
  }), []);

  return {
    configs,
    systemConfig,
    logs,
    loading,
    error,
    refetch: fetchConfigs,
    updateConfig,
    updateSystemConfig,
    testEmailConfig,
    backupDatabase,
    restoreDatabase,
    createBackup,
    fetchLogs,
  };
}

// Hook para relatórios
export function useAdminReports(dateRange?: string) {
  const [reports, setReports] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateReport = useCallback(async (params: any) => {
    try {
      setLoading(true);
      setError(null);
      const report = await adminReportService.generateReport(params);
      return report;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao gerar relatório');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const exportReport = useCallback(async (reportType: string, range?: string) => {
    try {
      // Simular dados dos relatórios - em produção seria uma chamada para a API
      const mockData = {
        overview: {
          totalUsers: 150,
          userGrowth: 12,
          totalGiftsClaimed: 45,
          totalGifts: 100,
          totalRevenue: 25000,
          revenueGrowth: 8,
          conversionRate: 30,
          totalPayments: 50
        },
        sales: {
          revenueOverTime: [
            { date: '2024-01-01', revenue: 5000 },
            { date: '2024-02-01', revenue: 7500 },
            { date: '2024-03-01', revenue: 12500 }
          ],
          salesByMethod: [
            { name: 'PIX', value: 15000 },
            { name: 'Cartão', value: 10000 }
          ],
          topSellingGifts: [
            { name: 'Kit Jantar', revenue: 5000 },
            { name: 'Conjunto Chá', revenue: 3000 }
          ]
        },
        gifts: {
          giftsByCategory: [
            { name: 'Casa', count: 25 },
            { name: 'Cozinha', count: 30 }
          ],
          priceRangeDistribution: [
            { range: '0-100', count: 15 },
            { range: '100-500', count: 25 }
          ],
          mostPopularGifts: [
            { id: '1', name: 'Kit Jantar', category: 'Casa', price: 200, claimCount: 5 }
          ]
        },
        users: {
          registrationOverTime: [
            { date: '2024-01-01', count: 20 },
            { date: '2024-02-01', count: 35 }
          ],
          userActivity: [
            { name: 'Ativos', count: 100 },
            { name: 'Inativos', count: 50 }
          ]
        },
        payments: {
          paymentStatus: [
            { status: 'Pago', count: 30 },
            { status: 'Pendente', count: 15 }
          ],
          paymentMethods: [
            { name: 'PIX', count: 25 },
            { name: 'Cartão', count: 20 }
          ],
          failedPaymentReasons: [
            { reason: 'Cartão inválido', count: 5 },
            { reason: 'Saldo insuficiente', count: 3 }
          ]
        }
      };
      
      setReports(mockData);
      return mockData;
    } catch (err) {
      throw err;
    }
  }, []);

  const downloadReport = useCallback(async (reportId: string, format: 'csv' | 'pdf') => {
    try {
      const blob = await adminReportService.downloadReport(reportId, format);
      
      // Download automático
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${reportId}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      throw err;
    }
  }, []);

  const fetchReportHistory = useCallback(async () => {
    try {
      const data = await adminReportService.getReportHistory();
      setReports(data);
    } catch (err) {
      console.error('Erro ao carregar histórico de relatórios:', err);
    }
  }, []);

  // Carregar dados iniciais quando o hook for usado
  useEffect(() => {
    if (dateRange) {
      exportReport('initial', dateRange);
    }
  }, [dateRange, exportReport]);

  return {
    reports,
    loading,
    error,
    generateReport,
    exportReport,
    downloadReport,
    fetchReportHistory,
  };
}
