'use client'

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreditCardForm, InstallmentOption } from '@/lib/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreditCard, Loader2, Shield } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const creditCardSchema = z.object({
  holderName: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(50, 'Nome muito longo')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras'),
  cardNumber: z.string()
    .min(13, 'Número do cartão inválido')
    .max(19, 'Número do cartão inválido')
    .regex(/^\d+$/, 'Número do cartão deve conter apenas dígitos'),
  expirationMonth: z.string()
    .min(1, 'Mês é obrigatório')
    .max(2, 'Mês inválido'),
  expirationYear: z.string()
    .min(4, 'Ano é obrigatório')
    .max(4, 'Ano inválido'),
  cvv: z.string()
    .min(3, 'CVV deve ter 3 dígitos')
    .max(4, 'CVV deve ter no máximo 4 dígitos')
    .regex(/^\d+$/, 'CVV deve conter apenas dígitos'),
  documentType: z.enum(['CPF', 'CNPJ']),
  documentNumber: z.string()
    .min(11, 'Documento inválido')
    .max(18, 'Documento inválido')
    .regex(/^\d+$/, 'Documento deve conter apenas dígitos'),
  installments: z.number().min(1).max(12),
});

type CreditCardFormType = z.infer<typeof creditCardSchema>;

interface CreditCardCheckoutProps {
  installmentOptions: InstallmentOption[];
  isLoading: boolean;
  onSubmit: (formData: CreditCardForm, installments: number) => void;
  className?: string;
}

export const CreditCardCheckout: React.FC<CreditCardCheckoutProps> = ({
  installmentOptions,
  isLoading,
  onSubmit,
  className = ''
}) => {
  const [selectedInstallments, setSelectedInstallments] = useState<number>(1);

  const form = useForm<CreditCardFormType>({
    resolver: zodResolver(creditCardSchema),
    defaultValues: {
      holderName: '',
      cardNumber: '',
      expirationMonth: '',
      expirationYear: '',
      cvv: '',
      documentType: 'CPF',
      documentNumber: '',
      installments: 1,
    },
  });

  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  // Format document number (CPF/CNPJ)
  const formatDocument = (value: string, type: 'CPF' | 'CNPJ') => {
    const cleanValue = value.replace(/\D/g, '');
    if (type === 'CPF') {
      return cleanValue.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else {
      return cleanValue.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
  };

  // Validate expiration date
  const validateExpirationDate = (month: string, year: string) => {
    if (!month || !year) return false;
    
    const currentDate = new Date();
    const expirationDate = new Date(parseInt(year), parseInt(month) - 1);
    
    return expirationDate > currentDate;
  };

  // Get card brand from number
  const getCardBrand = (cardNumber: string) => {
    const cleanNumber = cardNumber.replace(/\s/g, '');
    
    if (/^4/.test(cleanNumber)) return 'Visa';
    if (/^5[1-5]/.test(cleanNumber)) return 'Mastercard';
    if (/^3[47]/.test(cleanNumber)) return 'American Express';
    if (/^6/.test(cleanNumber)) return 'Discover';
    
    return 'Cartão';
  };

  const handleSubmit = (data: CreditCardFormType) => {
    const formData: CreditCardForm = {
      holderName: data.holderName,
      cardNumber: data.cardNumber.replace(/\s/g, ''),
      expirationMonth: data.expirationMonth,
      expirationYear: data.expirationYear,
      cvv: data.cvv,
      documentType: data.documentType,
      documentNumber: data.documentNumber.replace(/\D/g, ''),
      installments: selectedInstallments,
    };
    
    onSubmit(formData, selectedInstallments);
  };

  const watchCardNumber = form.watch('cardNumber');
  const watchDocumentType = form.watch('documentType');

  useEffect(() => {
    if (installmentOptions.length > 0) {
      setSelectedInstallments(1);
      form.setValue('installments', 1);
    }
  }, [installmentOptions, form]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <Card className={`w-full max-w-md mx-auto ${className}`}>
      <CardHeader className="text-center pb-4">
        <CardTitle className="flex items-center justify-center gap-2 text-xl">
          <CreditCard className="w-6 h-6" aria-hidden="true" />
          Cartão de Crédito
        </CardTitle>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Cardholder Name */}
            <FormField
              control={form.control}
              name="holderName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="holderName">Nome do Titular</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      id="holderName"
                      placeholder="Nome como está no cartão"
                      autoComplete="cc-name"
                      aria-describedby="holderName-error"
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage id="holderName-error" />
                </FormItem>
              )}
            />

            {/* Card Number */}
            <FormField
              control={form.control}
              name="cardNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="cardNumber">
                    Número do Cartão
                    {watchCardNumber && (
                      <span className="ml-2 text-sm text-muted-foreground">
                        ({getCardBrand(watchCardNumber)})
                      </span>
                    )}
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      id="cardNumber"
                      placeholder="0000 0000 0000 0000"
                      maxLength={19}
                      autoComplete="cc-number"
                      aria-describedby="cardNumber-error"
                      disabled={isLoading}
                      onChange={(e) => {
                        const formatted = formatCardNumber(e.target.value);
                        field.onChange(formatted);
                      }}
                    />
                  </FormControl>
                  <FormMessage id="cardNumber-error" />
                </FormItem>
              )}
            />

            {/* Expiration and CVV */}
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="expirationMonth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="expirationMonth">Mês</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                      <FormControl>
                        <SelectTrigger id="expirationMonth" aria-describedby="expirationMonth-error">
                          <SelectValue placeholder="MM" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => {
                          const month = (i + 1).toString().padStart(2, '0');
                          return (
                            <SelectItem key={month} value={month}>
                              {month}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    <FormMessage id="expirationMonth-error" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expirationYear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="expirationYear">Ano</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                      <FormControl>
                        <SelectTrigger id="expirationYear" aria-describedby="expirationYear-error">
                          <SelectValue placeholder="AAAA" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Array.from({ length: 10 }, (_, i) => {
                          const year = (new Date().getFullYear() + i).toString();
                          return (
                            <SelectItem key={year} value={year}>
                              {year}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    <FormMessage id="expirationYear-error" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cvv"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="cvv">CVV</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        id="cvv"
                        type="password"
                        placeholder="123"
                        maxLength={4}
                        autoComplete="cc-csc"
                        aria-describedby="cvv-error"
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage id="cvv-error" />
                  </FormItem>
                )}
              />
            </div>

            {/* Document Type */}
            <FormField
              control={form.control}
              name="documentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="documentType">Tipo de Documento</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                    <FormControl>
                      <SelectTrigger id="documentType" aria-describedby="documentType-error">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="CPF">CPF</SelectItem>
                      <SelectItem value="CNPJ">CNPJ</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage id="documentType-error" />
                </FormItem>
              )}
            />

            {/* Document Number */}
            <FormField
              control={form.control}
              name="documentNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="documentNumber">
                    {watchDocumentType === 'CPF' ? 'CPF' : 'CNPJ'}
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      id="documentNumber"
                      placeholder={watchDocumentType === 'CPF' ? '000.000.000-00' : '00.000.000/0000-00'}
                      maxLength={watchDocumentType === 'CPF' ? 14 : 18}
                      aria-describedby="documentNumber-error"
                      disabled={isLoading}
                      onChange={(e) => {
                        const cleanValue = e.target.value.replace(/\D/g, '');
                        const formatted = formatDocument(cleanValue, watchDocumentType);
                        field.onChange(formatted);
                      }}
                    />
                  </FormControl>
                  <FormMessage id="documentNumber-error" />
                </FormItem>
              )}
            />

            {/* Installments */}
            {installmentOptions.length > 0 && (
              <div>
                <Label htmlFor="installments" className="text-sm font-medium">
                  Parcelas
                </Label>
                <Select 
                  value={selectedInstallments.toString()} 
                  onValueChange={(value) => setSelectedInstallments(parseInt(value))}
                  disabled={isLoading}
                >
                  <SelectTrigger id="installments" className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {installmentOptions.map((option) => (
                      <SelectItem key={option.installments} value={option.installments.toString()}>
                        {option.installments}x de {formatCurrency(option.installmentAmount)}
                        {option.installments === 1 ? ' (à vista)' : ` (total: ${formatCurrency(option.totalAmount)})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Security Notice */}
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Seus dados são protegidos com criptografia de ponta a ponta.
              </AlertDescription>
            </Alert>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !form.formState.isValid}
              aria-label="Finalizar pagamento com cartão de crédito"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
                  Processando...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4 mr-2" aria-hidden="true" />
                  Finalizar Pagamento
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
