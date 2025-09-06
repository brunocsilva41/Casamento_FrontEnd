'use client'

import { AdminLayout } from '@/components/admin/admin-layout';
import { AdminTable } from '@/components/admin/admin-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAdminPayments } from '@/hooks/use-admin';
import { useNotification } from '@/hooks/use-notification';
import { PaymentStatus } from '@/lib/types';
import { TableColumn } from '@/lib/types/admin';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle, CreditCard, FileText, MoreHorizontal, RefreshCw, TrendingUp, X, XCircle } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const paymentActionSchema = z.object({
  status: z.enum(['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded']),
  notes: z.string().optional(),
});

type PaymentActionData = z.infer<typeof paymentActionSchema>;

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-800',
  refunded: 'bg-purple-100 text-purple-800',
  PENDING: 'bg-yellow-100 text-yellow-800',
  PAID: 'bg-green-100 text-green-800',
  FAILED: 'bg-red-100 text-red-800',
  CANCELLED: 'bg-gray-100 text-gray-800',
  REFUNDED: 'bg-purple-100 text-purple-800',
};

const statusLabels = {
  pending: 'Pendente',
  processing: 'Processando',
  completed: 'Concluído',
  failed: 'Falhou',
  cancelled: 'Cancelado',
  refunded: 'Reembolsado',
  PENDING: 'Pendente',
  PAID: 'Pago',
  FAILED: 'Falhou',
  CANCELLED: 'Cancelado',
  REFUNDED: 'Reembolsado',
};

const statusIcons = {
  pending: <CreditCard className="w-4 h-4" />,
  processing: <RefreshCw className="w-4 h-4" />,
  completed: <CheckCircle className="w-4 h-4" />,
  failed: <XCircle className="w-4 h-4" />,
  cancelled: <X className="w-4 h-4" />,
  refunded: <RefreshCw className="w-4 h-4" />,
  PENDING: <CreditCard className="w-4 h-4" />,
  PAID: <CheckCircle className="w-4 h-4" />,
  FAILED: <XCircle className="w-4 h-4" />,
  CANCELLED: <X className="w-4 h-4" />,
  REFUNDED: <RefreshCw className="w-4 h-4" />,
};

export default function AdminPayments() {
  const [filters, setFilters] = useState({});
  const [pagination, setPagination] = useState({ page: 1, limit: 25 });
  const [selectedPayments, setSelectedPayments] = useState<string[]>([]);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  const { payments, stats, pagination: paginationData, loading, error, updatePaymentStatus, refundPayment } = useAdminPayments(filters, pagination);
  const { notifySuccess, notifyError } = useNotification();

  const form = useForm<PaymentActionData>({
    resolver: zodResolver(paymentActionSchema),
    defaultValues: {
      status: 'pending',
      notes: '',
    },
  });

  const columns: TableColumn[] = [
    {
      key: 'orderId',
      title: 'ID do Pedido',
      sortable: true,
      render: (value) => (
        <span className="font-mono text-sm">{value}</span>
      ),
    },
    {
      key: 'user',
      title: 'Cliente',
      render: (_, payment) => (
        <div>
          <div className="font-medium">{payment.user?.name || 'N/A'}</div>
          <div className="text-sm text-muted-foreground">
            {payment.user?.email || 'N/A'}
          </div>
        </div>
      ),
    },
    {
      key: 'gift',
      title: 'Presente',
      render: (_, payment) => (
        <div>
          <div className="font-medium">{payment.gift?.name || 'N/A'}</div>
          <div className="text-sm text-muted-foreground">
            {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            }).format(payment.amount)}
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      title: 'Status',
      render: (value) => (
        <Badge className={statusColors[value as PaymentStatus]}>
          <span className="flex items-center gap-1">
            {statusIcons[value as PaymentStatus]}
            {statusLabels[value as PaymentStatus]}
          </span>
        </Badge>
      ),
    },
    {
      key: 'method',
      title: 'Método',
      render: (value) => (
        <div className="flex items-center gap-2">
          <CreditCard className="w-4 h-4" />
          <span className="capitalize">{value}</span>
        </div>
      ),
    },
    {
      key: 'customMessage',
      title: 'Mensagem',
      render: (value) => value ? (
        <div className="max-w-xs truncate">
          <span className="text-sm">{value}</span>
        </div>
      ) : (
        <span className="text-muted-foreground">-</span>
      ),
    },
    {
      key: 'createdAt',
      title: 'Data',
      sortable: true,
      render: (value) => (
        <div>
          <div className="text-sm">
            {new Date(value).toLocaleDateString('pt-BR')}
          </div>
          <div className="text-xs text-muted-foreground">
            {new Date(value).toLocaleTimeString('pt-BR')}
          </div>
        </div>
      ),
    },
    {
      key: 'actions',
      title: 'Ações',
      render: (_, payment) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleViewDetails(payment)}
          >
            <FileText className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handlePaymentAction(payment)}
            disabled={payment.status === 'completed' || payment.status === 'refunded'}
          >
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  const handlePaymentAction = (payment: any) => {
    setSelectedPayment(payment);
    form.reset({
      status: payment.status,
      notes: '',
    });
    setActionDialogOpen(true);
  };

  const handleViewDetails = (payment: any) => {
    setSelectedPayment(payment);
    setDetailsDialogOpen(true);
  };

  const handleUpdatePayment = async (data: PaymentActionData) => {
    try {
      await updatePaymentStatus(selectedPayment.id, data.status);
      notifySuccess('Status do pagamento atualizado com sucesso!');
      setActionDialogOpen(false);
      setSelectedPayment(null);
    } catch (error) {
      notifyError('Erro ao atualizar status do pagamento');
    }
  };

  const handleRefund = async () => {
    if (confirm('Tem certeza que deseja reembolsar este pagamento?')) {
      try {
        await refundPayment(selectedPayment.id);
        notifySuccess('Reembolso processado com sucesso!');
        setActionDialogOpen(false);
        setSelectedPayment(null);
      } catch (error) {
        notifyError('Erro ao processar reembolso');
      }
    }
  };

  const handlePaginationChange = (page: number, limit: number) => {
    setPagination({ page, limit });
  };

  const handleSearchChange = (search: string) => {
    setFilters({ ...filters, search });
    setPagination({ ...pagination, page: 1 });
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters({ ...filters, [key]: value === 'all' ? undefined : value });
    setPagination({ ...pagination, page: 1 });
  };

  if (error) {
    return (
      <AdminLayout>
        <Card>
          <CardContent className="p-6">
            <p className="text-red-600">Erro: {error}</p>
          </CardContent>
        </Card>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Pagamentos</h1>
            <p className="text-muted-foreground">
              Gerencie todos os pagamentos e transações
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Select onValueChange={(value) => handleFilterChange('status', value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="processing">Processando</SelectItem>
                <SelectItem value="completed">Concluído</SelectItem>
                <SelectItem value="failed">Falhou</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
                <SelectItem value="refunded">Reembolsado</SelectItem>
              </SelectContent>
            </Select>
            
            <Select onValueChange={(value) => handleFilterChange('method', value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por método" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os métodos</SelectItem>
                <SelectItem value="credit_card">Cartão de Crédito</SelectItem>
                <SelectItem value="debit_card">Cartão de Débito</SelectItem>
                <SelectItem value="pix">PIX</SelectItem>
                <SelectItem value="boleto">Boleto</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Action Dialog */}
        <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Gerenciar Pagamento</DialogTitle>
              <DialogDescription>
                Atualize o status do pagamento ou processe ações
              </DialogDescription>
            </DialogHeader>
            
            {selectedPayment && (
              <div className="space-y-4">
                <div className="p-4 border rounded-lg bg-muted/50">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="font-medium">ID:</span>
                    <span className="font-mono">{selectedPayment.orderId}</span>
                    <span className="font-medium">Cliente:</span>
                    <span>{selectedPayment.user?.name}</span>
                    <span className="font-medium">Valor:</span>
                    <span>
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(selectedPayment.amount)}
                    </span>
                    <span className="font-medium">Status Atual:</span>
                    <Badge className={statusColors[selectedPayment.status as PaymentStatus]}>
                      {statusLabels[selectedPayment.status as PaymentStatus]}
                    </Badge>
                  </div>
                </div>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleUpdatePayment)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Novo Status</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="pending">Pendente</SelectItem>
                              <SelectItem value="processing">Processando</SelectItem>
                              <SelectItem value="completed">Concluído</SelectItem>
                              <SelectItem value="failed">Falhou</SelectItem>
                              <SelectItem value="cancelled">Cancelado</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Observações (opcional)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Adicione observações sobre a alteração..."
                              rows={3}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <DialogFooter className="flex justify-between">
                      <div className="flex gap-2">
                        {selectedPayment.status === 'completed' && (
                          <Button
                            type="button"
                            variant="destructive"
                            onClick={handleRefund}
                          >
                            Reembolsar
                          </Button>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button type="button" variant="outline" onClick={() => setActionDialogOpen(false)}>
                          Cancelar
                        </Button>
                        <Button type="submit">
                          Atualizar Status
                        </Button>
                      </div>
                    </DialogFooter>
                  </form>
                </Form>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Details Dialog */}
        <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Detalhes do Pagamento</DialogTitle>
              <DialogDescription>
                Informações completas da transação
              </DialogDescription>
            </DialogHeader>
            
            {selectedPayment && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium mb-2">Informações do Pedido</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">ID:</span>
                          <span className="font-mono">{selectedPayment.orderId}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Valor:</span>
                          <span>
                            {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL'
                            }).format(selectedPayment.amount)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Método:</span>
                          <span className="capitalize">{selectedPayment.method}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Status:</span>
                          <Badge className={statusColors[selectedPayment.status as PaymentStatus]}>
                            {statusLabels[selectedPayment.status as PaymentStatus]}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Cliente</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Nome:</span>
                          <span>{selectedPayment.user?.name || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Email:</span>
                          <span>{selectedPayment.user?.email || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Telefone:</span>
                          <span>{selectedPayment.user?.phone || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium mb-2">Presente</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Nome:</span>
                          <span>{selectedPayment.gift?.name || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Categoria:</span>
                          <span>{selectedPayment.gift?.category || 'N/A'}</span>
                        </div>
                        {selectedPayment.customMessage && (
                          <div>
                            <span className="text-muted-foreground">Mensagem:</span>
                            <p className="mt-1 p-2 bg-muted rounded text-sm">
                              {selectedPayment.customMessage}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Datas</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Criado em:</span>
                          <span>
                            {new Date(selectedPayment.createdAt).toLocaleString('pt-BR')}
                          </span>
                        </div>
                        {selectedPayment.updatedAt !== selectedPayment.createdAt && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Atualizado em:</span>
                            <span>
                              {new Date(selectedPayment.updatedAt).toLocaleString('pt-BR')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                {selectedPayment.pagBankData && (
                  <div>
                    <h4 className="font-medium mb-2">Dados PagBank</h4>
                    <div className="p-3 bg-muted rounded text-sm font-mono">
                      <pre>{JSON.stringify(selectedPayment.pagBankData, null, 2)}</pre>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <DialogFooter>
              <Button onClick={() => setDetailsDialogOpen(false)}>
                Fechar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total de Pagamentos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalPayments || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(stats?.totalRevenue || 0)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Concluídos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {stats?.completedPayments || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {stats?.pendingPayments || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payments Table */}
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Pagamentos</CardTitle>
            <CardDescription>
              Visualize e gerencie todas as transações
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AdminTable
              data={payments}
              columns={columns}
              loading={loading}
              selectable={true}
              selectedItems={selectedPayments}
              onSelectionChange={setSelectedPayments}
              pagination={paginationData}
              onPaginationChange={handlePaginationChange}
              searchable={true}
              onSearchChange={handleSearchChange}
              emptyMessage="Nenhum pagamento encontrado"
              actions={
                selectedPayments.length > 0 && (
                  <Button variant="outline" size="sm">
                    <MoreHorizontal className="w-4 h-4 mr-2" />
                    Ações ({selectedPayments.length})
                  </Button>
                )
              }
            />
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
