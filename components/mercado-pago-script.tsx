'use client'

import { useEffect } from 'react';

interface MercadoPagoScriptProps {
  publicKey: string;
}

export const MercadoPagoScript: React.FC<MercadoPagoScriptProps> = ({ publicKey }) => {
  useEffect(() => {
    // Check if script is already loaded
    if (document.getElementById('mercadopago-js')) {
      return;
    }

    const script = document.createElement('script');
    script.id = 'mercadopago-js';
    script.src = 'https://sdk.mercadopago.com/js/v2';
    script.async = true;
    
    script.onload = () => {
      console.log('MercadoPago SDK loaded successfully');
    };
    
    script.onerror = () => {
      console.error('Failed to load MercadoPago SDK');
    };

    document.head.appendChild(script);

    return () => {
      const existingScript = document.getElementById('mercadopago-js');
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, [publicKey]);

  return null;
};
