'use client'

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { PixPayment } from '@/lib/types';
import { CheckCircle, Clock, Copy, Loader2, QrCode } from 'lucide-react';
import Image from 'next/image';
import React, { useCallback, useState } from 'react';

interface PixCheckoutProps {
  pixPayment: PixPayment;
  isLoading: boolean;
  onCopyCode: () => void;
  className?: string;
}

export const PixCheckout: React.FC<PixCheckoutProps> = ({
  pixPayment,
  isLoading,
  onCopyCode,
  className = ''
}) => {
  const { toast } = useToast();
  const [isCodeCopied, setIsCodeCopied] = useState(false);

  const handleCopyPixCode = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(pixPayment.pixCode);
      setIsCodeCopied(true);
      onCopyCode();
      
      toast({
        title: "Código PIX copiado!",
        description: "O código foi copiado para sua área de transferência.",
      });

      setTimeout(() => setIsCodeCopied(false), 3000);
    } catch (error) {
      console.error('Erro ao copiar código PIX:', error);
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o código PIX.",
        variant: "destructive",
      });
    }
  }, [pixPayment.pixCode, onCopyCode, toast]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatExpirationTime = (expiresAt: string) => {
    const expirationDate = new Date(expiresAt);
    const now = new Date();
    const diffInMinutes = Math.floor((expirationDate.getTime() - now.getTime()) / (1000 * 60));
    
    if (diffInMinutes <= 0) {
      return 'Expirado';
    }
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minuto${diffInMinutes !== 1 ? 's' : ''}`;
    }
    
    const hours = Math.floor(diffInMinutes / 60);
    const minutes = diffInMinutes % 60;
    return `${hours}h ${minutes}min`;
  };

  return (
    <Card className={`w-full max-w-md mx-auto ${className}`}>
      <CardHeader className="text-center pb-4">
        <CardTitle className="flex items-center justify-center gap-2 text-xl">
          <QrCode className="w-6 h-6" aria-hidden="true" />
          Pagamento PIX
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Payment Amount */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-1">Valor a pagar</p>
          <p className="text-2xl font-bold text-green-600" aria-label={`Valor: ${formatCurrency(pixPayment.amount)}`}>
            {formatCurrency(pixPayment.amount)}
          </p>
        </div>

        {/* QR Code */}
        <div className="flex justify-center">
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            {pixPayment.qrCodeBase64 ? (
              <Image
                src={`data:image/png;base64,${pixPayment.qrCodeBase64}`}
                alt="QR Code PIX para pagamento"
                width={192}
                height={192}
                className="object-contain"
                priority
              />
            ) : (
              <div 
                className="w-48 h-48 flex items-center justify-center bg-gray-100 text-gray-400"
                role="img"
                aria-label="QR Code não disponível"
              >
                <QrCode className="w-16 h-16" />
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Escaneie o QR Code com o aplicativo do seu banco ou
          </p>
          <Button
            onClick={handleCopyPixCode}
            variant="outline"
            size="sm"
            className="w-full"
            disabled={isLoading}
            aria-label={isCodeCopied ? "Código PIX copiado" : "Copiar código PIX"}
          >
            {isCodeCopied ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2 text-green-600" aria-hidden="true" />
                Código copiado!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" aria-hidden="true" />
                Copiar código PIX
              </>
            )}
          </Button>
        </div>

        {/* Expiration Time */}
        <Alert>
          <Clock className="h-4 w-4" />
          <AlertDescription className="flex items-center gap-2">
            <span>Expira em: </span>
            <span className="font-medium text-orange-600">
              {formatExpirationTime(pixPayment.expiresAt)}
            </span>
          </AlertDescription>
        </Alert>

        {/* Payment Status */}
        {isLoading && (
          <Alert>
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertDescription>
              Aguardando confirmação do pagamento...
            </AlertDescription>
          </Alert>
        )}

        {/* Transaction ID */}
        <div className="text-center pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            ID da transação: {pixPayment.id}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
