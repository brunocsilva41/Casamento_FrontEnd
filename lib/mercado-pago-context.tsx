'use client'

import { CheckoutCallbacks, MercadoPagoConfig } from '@/lib/types';
import React, { createContext, useCallback, useContext } from 'react';

interface MercadoPagoContextType {
  config: MercadoPagoConfig | null;
  createPaymentCallbacks: (
    onSuccess?: (payment: any) => void,
    onError?: (error: Error) => void,
    onPending?: (payment: any) => void
  ) => CheckoutCallbacks;
}

const MercadoPagoContext = createContext<MercadoPagoContextType | undefined>(undefined);

interface MercadoPagoProviderProps {
  children: React.ReactNode;
  config: MercadoPagoConfig;
}

export const MercadoPagoProvider: React.FC<MercadoPagoProviderProps> = ({
  children,
  config
}) => {
  const createPaymentCallbacks = useCallback((
    onSuccess?: (payment: any) => void,
    onError?: (error: Error) => void,
    onPending?: (payment: any) => void
  ): CheckoutCallbacks => {
    return {
      onSuccess: (payment) => {
        console.log('Payment approved:', payment);
        onSuccess?.(payment);
      },
      onError: (error) => {
        console.error('Payment error:', error);
        onError?.(error);
      },
      onPending: (payment) => {
        console.log('Payment pending:', payment);
        onPending?.(payment);
      },
    };
  }, []);

  const value: MercadoPagoContextType = {
    config,
    createPaymentCallbacks,
  };

  return (
    <MercadoPagoContext.Provider value={value}>
      {children}
    </MercadoPagoContext.Provider>
  );
};

export const useMercadoPagoContext = () => {
  const context = useContext(MercadoPagoContext);
  if (context === undefined) {
    throw new Error('useMercadoPagoContext must be used within a MercadoPagoProvider');
  }
  return context;
};
