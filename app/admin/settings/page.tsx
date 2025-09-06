'use client'

import { AdminLayout } from '@/components/admin/admin-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useAdminSystem } from '@/hooks/use-admin';
import { useNotification } from '@/hooks/use-notification';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertTriangle, Database, Key, Mail, Save, Settings, Shield, Upload } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const systemConfigSchema = z.object({
  siteName: z.string().min(1, 'Nome do site é obrigatório'),
  siteDescription: z.string().min(1, 'Descrição é obrigatória'),
  coupleNames: z.string().min(1, 'Nomes do casal são obrigatórios'),
  weddingDate: z.string().min(1, 'Data do casamento é obrigatória'),
  weddingLocation: z.string().min(1, 'Local do casamento é obrigatório'),
  contactEmail: z.string().email('Email inválido'),
  contactPhone: z.string().min(1, 'Telefone é obrigatório'),
  allowGuestRegistration: z.boolean(),
  requireEmailVerification: z.boolean(),
  enableGiftCustomMessage: z.boolean(),
  maxGiftsPerUser: z.number().min(0, 'Deve ser um número positivo'),
  autoApproveGifts: z.boolean(),
  enableNotifications: z.boolean(),
  maintenanceMode: z.boolean(),
  maintenanceMessage: z.string().optional(),
});

const emailConfigSchema = z.object({
  smtpHost: z.string().min(1, 'Host SMTP é obrigatório'),
  smtpPort: z.number().min(1, 'Porta SMTP é obrigatória'),
  smtpUser: z.string().min(1, 'Usuário SMTP é obrigatório'),
  smtpPassword: z.string().min(1, 'Senha SMTP é obrigatória'),
  fromEmail: z.string().email('Email inválido'),
  fromName: z.string().min(1, 'Nome do remetente é obrigatório'),
  enableSsl: z.boolean(),
});

const paymentConfigSchema = z.object({
  pagBankToken: z.string().min(1, 'Token PagBank é obrigatório'),
  pagBankSandbox: z.boolean(),
  pixKey: z.string().min(1, 'Chave PIX é obrigatória'),
  pixKeyType: z.enum(['cpf', 'cnpj', 'email', 'phone', 'random']),
  enableCreditCard: z.boolean(),
  enableDebitCard: z.boolean(),
  enablePix: z.boolean(),
  enableBoleto: z.boolean(),
  minPaymentAmount: z.number().min(0.01, 'Valor mínimo deve ser maior que zero'),
  maxPaymentAmount: z.number().min(1, 'Valor máximo deve ser maior que zero'),
});

const securityConfigSchema = z.object({
  jwtSecret: z.string().min(32, 'JWT Secret deve ter pelo menos 32 caracteres'),
  jwtExpiresIn: z.string().min(1, 'Tempo de expiração é obrigatório'),
  passwordMinLength: z.number().min(6, 'Mínimo de 6 caracteres'),
  enableTwoFactor: z.boolean(),
  maxLoginAttempts: z.number().min(1, 'Deve ser pelo menos 1'),
  lockoutDuration: z.number().min(1, 'Deve ser pelo menos 1 minuto'),
  enableAuditLog: z.boolean(),
  sessionTimeout: z.number().min(1, 'Deve ser pelo menos 1 minuto'),
});

type SystemConfigData = z.infer<typeof systemConfigSchema>;
type EmailConfigData = z.infer<typeof emailConfigSchema>;
type PaymentConfigData = z.infer<typeof paymentConfigSchema>;
type SecurityConfigData = z.infer<typeof securityConfigSchema>;

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState('general');
  const { systemConfig, loading, error, updateSystemConfig, testEmailConfig, backupDatabase, restoreDatabase } = useAdminSystem();
  const { notifySuccess, notifyError } = useNotification();

  const systemForm = useForm<SystemConfigData>({
    resolver: zodResolver(systemConfigSchema),
    defaultValues: systemConfig?.general || {},
  });

  const emailForm = useForm<EmailConfigData>({
    resolver: zodResolver(emailConfigSchema),
    defaultValues: systemConfig?.email || {},
  });

  const paymentForm = useForm<PaymentConfigData>({
    resolver: zodResolver(paymentConfigSchema),
    defaultValues: systemConfig?.payment || {},
  });

  const securityForm = useForm<SecurityConfigData>({
    resolver: zodResolver(securityConfigSchema),
    defaultValues: systemConfig?.security || {},
  });

  const handleSystemConfigSave = async (data: SystemConfigData) => {
    try {
      await updateSystemConfig({ general: data });
      notifySuccess('Configurações gerais salvas com sucesso!');
    } catch (error) {
      notifyError('Erro ao salvar configurações gerais');
    }
  };

  const handleEmailConfigSave = async (data: EmailConfigData) => {
    try {
      await updateSystemConfig({ email: data });
      notifySuccess('Configurações de email salvas com sucesso!');
    } catch (error) {
      notifyError('Erro ao salvar configurações de email');
    }
  };

  const handlePaymentConfigSave = async (data: PaymentConfigData) => {
    try {
      await updateSystemConfig({ payment: data });
      notifySuccess('Configurações de pagamento salvas com sucesso!');
    } catch (error) {
      notifyError('Erro ao salvar configurações de pagamento');
    }
  };

  const handleSecurityConfigSave = async (data: SecurityConfigData) => {
    try {
      await updateSystemConfig({ security: data });
      notifySuccess('Configurações de segurança salvas com sucesso!');
    } catch (error) {
      notifyError('Erro ao salvar configurações de segurança');
    }
  };

  const handleTestEmail = async () => {
    try {
      await testEmailConfig();
      notifySuccess('Email de teste enviado com sucesso!');
    } catch (error) {
      notifyError('Erro ao enviar email de teste');
    }
  };

  const handleBackup = async () => {
    try {
      await backupDatabase();
      notifySuccess('Backup realizado com sucesso!');
    } catch (error) {
      notifyError('Erro ao realizar backup');
    }
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
        <div>
          <h1 className="text-3xl font-bold">Configurações do Sistema</h1>
          <p className="text-muted-foreground">
            Gerencie todas as configurações da plataforma
          </p>
        </div>

        {/* Settings Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Geral
            </TabsTrigger>
            <TabsTrigger value="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email
            </TabsTrigger>
            <TabsTrigger value="payment" className="flex items-center gap-2">
              <Key className="w-4 h-4" />
              Pagamento
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Segurança
            </TabsTrigger>
            <TabsTrigger value="maintenance" className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              Manutenção
            </TabsTrigger>
          </TabsList>
          
          {/* General Settings */}
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>Configurações Gerais</CardTitle>
                <CardDescription>
                  Configure as informações básicas do site e do casamento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...systemForm}>
                  <form onSubmit={systemForm.handleSubmit(handleSystemConfigSave)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={systemForm.control}
                        name="siteName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome do Site</FormLabel>
                            <FormControl>
                              <Input placeholder="Lista de Casamento" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={systemForm.control}
                        name="coupleNames"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nomes do Casal</FormLabel>
                            <FormControl>
                              <Input placeholder="João & Maria" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={systemForm.control}
                      name="siteDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descrição do Site</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Bem-vindos à nossa lista de casamento..."
                              rows={3}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={systemForm.control}
                        name="weddingDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Data do Casamento</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={systemForm.control}
                        name="weddingLocation"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Local do Casamento</FormLabel>
                            <FormControl>
                              <Input placeholder="Igreja/Buffet, Cidade" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={systemForm.control}
                        name="contactEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email de Contato</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="contato@casamento.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={systemForm.control}
                        name="contactPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Telefone de Contato</FormLabel>
                            <FormControl>
                              <Input placeholder="(11) 99999-9999" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Configurações de Funcionalidade</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={systemForm.control}
                          name="allowGuestRegistration"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel>Permitir Registro de Convidados</FormLabel>
                                <FormDescription>
                                  Convidados podem se registrar automaticamente
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={systemForm.control}
                          name="requireEmailVerification"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel>Verificação de Email Obrigatória</FormLabel>
                                <FormDescription>
                                  Usuários devem verificar email para ativar conta
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={systemForm.control}
                          name="enableGiftCustomMessage"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel>Mensagens Personalizadas</FormLabel>
                                <FormDescription>
                                  Permitir mensagens personalizadas nos presentes
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={systemForm.control}
                          name="autoApproveGifts"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel>Aprovação Automática de Presentes</FormLabel>
                                <FormDescription>
                                  Presentes são aprovados automaticamente
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={systemForm.control}
                        name="maxGiftsPerUser"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Máximo de Presentes por Usuário</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                placeholder="0 = ilimitado"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormDescription>
                              0 = ilimitado. Deixe em 0 para permitir múltiplos presentes por usuário.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <Button type="submit" disabled={loading}>
                      <Save className="w-4 h-4 mr-2" />
                      Salvar Configurações Gerais
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Email Settings */}
          <TabsContent value="email">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Email</CardTitle>
                <CardDescription>
                  Configure o servidor SMTP para envio de emails
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...emailForm}>
                  <form onSubmit={emailForm.handleSubmit(handleEmailConfigSave)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={emailForm.control}
                        name="smtpHost"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Host SMTP</FormLabel>
                            <FormControl>
                              <Input placeholder="smtp.gmail.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={emailForm.control}
                        name="smtpPort"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Porta SMTP</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="587"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 587)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={emailForm.control}
                        name="smtpUser"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Usuário SMTP</FormLabel>
                            <FormControl>
                              <Input placeholder="usuario@gmail.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={emailForm.control}
                        name="smtpPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Senha SMTP</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="********" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={emailForm.control}
                        name="fromEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Remetente</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="noreply@casamento.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={emailForm.control}
                        name="fromName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome do Remetente</FormLabel>
                            <FormControl>
                              <Input placeholder="Lista de Casamento" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={emailForm.control}
                      name="enableSsl"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel>Habilitar SSL/TLS</FormLabel>
                            <FormDescription>
                              Usar conexão segura com o servidor SMTP
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex gap-4">
                      <Button type="submit" disabled={loading}>
                        <Save className="w-4 h-4 mr-2" />
                        Salvar Configurações de Email
                      </Button>
                      
                      <Button type="button" variant="outline" onClick={handleTestEmail}>
                        <Mail className="w-4 h-4 mr-2" />
                        Enviar Email de Teste
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Payment Settings */}
          <TabsContent value="payment">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Pagamento</CardTitle>
                <CardDescription>
                  Configure as opções de pagamento via PagBank
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...paymentForm}>
                  <form onSubmit={paymentForm.handleSubmit(handlePaymentConfigSave)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={paymentForm.control}
                        name="pagBankToken"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Token PagBank</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Token da API PagBank" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={paymentForm.control}
                        name="pagBankSandbox"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel>Modo Sandbox</FormLabel>
                              <FormDescription>
                                Usar ambiente de testes do PagBank
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={paymentForm.control}
                        name="pixKey"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Chave PIX</FormLabel>
                            <FormControl>
                              <Input placeholder="sua@chave.pix" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={paymentForm.control}
                        name="pixKeyType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tipo da Chave PIX</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o tipo" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="cpf">CPF</SelectItem>
                                <SelectItem value="cnpj">CNPJ</SelectItem>
                                <SelectItem value="email">Email</SelectItem>
                                <SelectItem value="phone">Telefone</SelectItem>
                                <SelectItem value="random">Chave Aleatória</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Métodos de Pagamento Habilitados</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={paymentForm.control}
                          name="enableCreditCard"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel>Cartão de Crédito</FormLabel>
                                <FormDescription>
                                  Aceitar pagamentos com cartão de crédito
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={paymentForm.control}
                          name="enableDebitCard"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel>Cartão de Débito</FormLabel>
                                <FormDescription>
                                  Aceitar pagamentos com cartão de débito
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={paymentForm.control}
                          name="enablePix"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel>PIX</FormLabel>
                                <FormDescription>
                                  Aceitar pagamentos via PIX
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={paymentForm.control}
                          name="enableBoleto"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel>Boleto Bancário</FormLabel>
                                <FormDescription>
                                  Aceitar pagamentos via boleto
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={paymentForm.control}
                        name="minPaymentAmount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Valor Mínimo (R$)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                min="0.01"
                                placeholder="1.00"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0.01)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={paymentForm.control}
                        name="maxPaymentAmount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Valor Máximo (R$)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                min="1"
                                placeholder="10000.00"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 10000)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <Button type="submit" disabled={loading}>
                      <Save className="w-4 h-4 mr-2" />
                      Salvar Configurações de Pagamento
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Security Settings */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Segurança</CardTitle>
                <CardDescription>
                  Configure as opções de segurança e autenticação
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...securityForm}>
                  <form onSubmit={securityForm.handleSubmit(handleSecurityConfigSave)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={securityForm.control}
                        name="jwtSecret"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>JWT Secret</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="Chave secreta para JWT (mín. 32 caracteres)"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={securityForm.control}
                        name="jwtExpiresIn"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Expiração JWT</FormLabel>
                            <FormControl>
                              <Input placeholder="24h" {...field} />
                            </FormControl>
                            <FormDescription>
                              Ex: 24h, 7d, 30d
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <FormField
                        control={securityForm.control}
                        name="passwordMinLength"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tamanho Mínimo da Senha</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="6"
                                max="50"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 8)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={securityForm.control}
                        name="maxLoginAttempts"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Máx. Tentativas de Login</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                max="10"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 5)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={securityForm.control}
                        name="lockoutDuration"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Duração do Bloqueio (min)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                max="1440"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 15)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={securityForm.control}
                      name="sessionTimeout"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Timeout da Sessão (minutos)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              max="10080"
                              placeholder="1440"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 1440)}
                            />
                          </FormControl>
                          <FormDescription>
                            Tempo em minutos para expirar sessões inativas
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Recursos de Segurança</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={securityForm.control}
                          name="enableTwoFactor"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel>Autenticação em Duas Etapas</FormLabel>
                                <FormDescription>
                                  Habilitar 2FA para administradores
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={securityForm.control}
                          name="enableAuditLog"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel>Log de Auditoria</FormLabel>
                                <FormDescription>
                                  Registrar todas as ações administrativas
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    
                    <Button type="submit" disabled={loading}>
                      <Save className="w-4 h-4 mr-2" />
                      Salvar Configurações de Segurança
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Maintenance */}
          <TabsContent value="maintenance">
            <div className="space-y-6">
              {/* Maintenance Mode */}
              <Card>
                <CardHeader>
                  <CardTitle>Modo de Manutenção</CardTitle>
                  <CardDescription>
                    Ative o modo de manutenção para fazer atualizações no sistema
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Form {...systemForm}>
                    <FormField
                      control={systemForm.control}
                      name="maintenanceMode"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel>Modo de Manutenção</FormLabel>
                            <FormDescription>
                              Apenas administradores podem acessar o sistema
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    {systemForm.watch('maintenanceMode') && (
                      <FormField
                        control={systemForm.control}
                        name="maintenanceMessage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mensagem de Manutenção</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="O sistema está em manutenção. Tente novamente em alguns minutos."
                                rows={3}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </Form>
                </CardContent>
              </Card>
              
              {/* Database Backup */}
              <Card>
                <CardHeader>
                  <CardTitle>Backup do Banco de Dados</CardTitle>
                  <CardDescription>
                    Faça backup e restaure o banco de dados
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Button onClick={handleBackup} disabled={loading}>
                      <Database className="w-4 h-4 mr-2" />
                      Fazer Backup
                    </Button>
                    
                    <Button variant="outline" disabled={loading}>
                      <Upload className="w-4 h-4 mr-2" />
                      Restaurar Backup
                    </Button>
                  </div>
                  
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800">
                          Atenção
                        </h3>
                        <div className="mt-2 text-sm text-yellow-700">
                          <p>
                            Sempre faça backup antes de realizar atualizações importantes.
                            A restauração substituirá todos os dados atuais.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* System Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Informações do Sistema</CardTitle>
                  <CardDescription>
                    Detalhes sobre o sistema e versões
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Versão:</span>
                        <span>v1.0.0</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Ambiente:</span>
                        <span>Produção</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Banco de Dados:</span>
                        <span>PostgreSQL 15.0</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Node.js:</span>
                        <span>v18.17.0</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Último Backup:</span>
                        <span>Nunca</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Uptime:</span>
                        <span>2d 14h 32m</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
