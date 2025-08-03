'use client'

import { CreditCardCheckout } from '@/components/credit-card-checkout';
import { ErrorAlert } from '@/components/error-alert';
import { PixCheckout } from '@/components/pix-checkout';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMercadoPago } from '@/hooks/use-mercado-pago';
import {
    CheckoutCallbacks,
    CreditCardForm,
    MercadoPagoConfig,
    PaymentMethod
} from '@/lib/types';
import { AlertCircle, CheckCircle, CreditCard, Loader2, QrCode } from 'lucide-react';
import React, { useCallback, useState } from 'react';

interface MercadoPagoCheckoutProps {
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
  className?: string;
}

export const MercadoPagoCheckout: React.FC<MercadoPagoCheckoutProps> = ({
  config,
  amount,
  description,
  customer,
  giftId,
  callbacks,
  className = ''
}) => {
  const [selectedTab, setSelectedTab] = useState<'PIX' | 'CREDIT_CARD'>('PIX');

  const mercadoPago = useMercadoPago({
    config,
    amount,
    description,
    customer,
    giftId,
    callbacks
  });

  const {
    isLoading,
    error,
    friendlyError,
    paymentMethods,
    selectedMethod,
    pixPayment,
    installmentOptions,
    paymentStatus,
    actions
  } = mercadoPago;

  const handleMethodSelect = useCallback((method: PaymentMethod) => {
    actions.setSelectedMethod(method);
    if (method.id === 'PIX') {
      setSelectedTab('PIX');
    } else {
      setSelectedTab('CREDIT_CARD');
    }
  }, [actions]);

  const handlePixGeneration = useCallback(() => {
    actions.generatePixPayment();
  }, [actions]);

  const handleCreditCardSubmit = useCallback((
    cardForm: CreditCardForm, 
    installments: number
  ) => {
    actions.processCreditCardPayment(cardForm, installments);
  }, [actions]);

  const handlePixCodeCopy = useCallback(() => {
    // This can be used for analytics or other tracking
    console.log('PIX code copied');
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getPaymentStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'pending':
        return <Loader2 className="w-5 h-5 text-yellow-600 animate-spin" />;
      case 'rejected':
      case 'cancelled':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />;
    }
  };

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'Pagamento aprovado!';
      case 'PENDING':
        return 'Aguardando pagamento...';
      case 'REJECTED':
        return 'Pagamento rejeitado';
      case 'CANCELLED':
        return 'Pagamento cancelado';
      default:
        return 'Processando...';
    }
  };

  const getPaymentStatusVariant = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'default';
      case 'PENDING':
        return 'secondary';
      case 'REJECTED':
      case 'CANCELLED':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  // If payment is completed, show status
  if (paymentStatus && ['APPROVED', 'REJECTED', 'CANCELLED'].includes(paymentStatus.status)) {
    return (
      <Card className={`w-full max-w-md mx-auto ${className}`}>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            {getPaymentStatusIcon(paymentStatus.status)}
            Status do Pagamento
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <Badge 
            variant={getPaymentStatusVariant(paymentStatus.status) as any}
            className="text-sm px-3 py-1"
          >
            {getPaymentStatusText(paymentStatus.status)}
          </Badge>
          
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Valor:</p>
            <p className="text-xl font-bold">{formatCurrency(paymentStatus.amount)}</p>
          </div>

          {paymentStatus.status === 'APPROVED' && paymentStatus.approvedAt && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Aprovado em:</p>
              <p className="text-sm">
                {new Date(paymentStatus.approvedAt).toLocaleString('pt-BR')}
              </p>
            </div>
          )}

          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              ID: {paymentStatus.id}
            </p>
          </div>

          <Button
            onClick={() => actions.resetState()}
            variant="outline"
            className="w-full"
          >
            Novo Pagamento
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`w-full max-w-md mx-auto space-y-4 ${className}`}>
      {/* Header with amount */}
      <Card>
        <CardHeader className="text-center pb-4">
          <CardTitle>Checkout Mercado Pago</CardTitle>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Valor a pagar</p>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(amount)}
            </p>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </CardHeader>
      </Card>

      {/* Error Alert */}
      {friendlyError && (
        <ErrorAlert
          error={friendlyError}
          onRetry={friendlyError.canRetry ? () => {
            actions.clearError();
            // Dependendo do contexto, poderia tentar novamente automaticamente
          } : undefined}
          onDismiss={actions.clearError}
        />
      )}

      {/* Fallback para erros simples (compatibilidade) */}
      {error && !friendlyError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={actions.clearError}
              aria-label="Fechar erro"
            >
              ×
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Payment Methods */}
      <Tabs value={selectedTab} onValueChange={(value) => setSelectedTab(value as 'PIX' | 'CREDIT_CARD')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger 
            value="PIX" 
            className="flex items-center gap-2"
            onClick={() => handleMethodSelect(paymentMethods[0])}
            disabled={isLoading}
          >
            <QrCode className="w-4 h-4" />
            PIX
          </TabsTrigger>
          <TabsTrigger 
            value="CREDIT_CARD" 
            className="flex items-center gap-2"
            onClick={() => handleMethodSelect(paymentMethods[1])}
            disabled={isLoading}
          >
            <CreditCard className="w-4 h-4" />
            Cartão
          </TabsTrigger>
        </TabsList>

        {/* PIX Payment */}
        <TabsContent value="PIX" className="mt-4">
          {!pixPayment ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <QrCode className="w-12 h-12 mx-auto text-muted-foreground" />
                  <div>
                    <h3 className="font-medium mb-2">Pagamento PIX</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Gere o código PIX para efetuar o pagamento
                    </p>
                    <Button
                      onClick={handlePixGeneration}
                      disabled={isLoading}
                      className="w-full"
                      aria-label="Gerar código PIX"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Gerando...
                        </>
                      ) : (
                        <>
                          <QrCode className="w-4 h-4 mr-2" />
                          Gerar PIX
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <PixCheckout
              pixPayment={pixPayment}
              isLoading={isLoading && (paymentStatus?.status === 'PENDING' || !paymentStatus)}
              onCopyCode={handlePixCodeCopy}
            />
          )}
        </TabsContent>

        {/* Credit Card Payment */}
        <TabsContent value="CREDIT_CARD" className="mt-4">
          <CreditCardCheckout
            installmentOptions={installmentOptions}
            isLoading={isLoading}
            onSubmit={handleCreditCardSubmit}
          />
        </TabsContent>
      </Tabs>

      {/* Loading indicator for pending payments */}
      {paymentStatus?.status === 'PENDING' && (
        <Alert>
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertDescription>
            {paymentStatus.method === 'PIX' 
              ? 'Aguardando confirmação do PIX...' 
              : 'Processando pagamento com cartão...'}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
