'use client'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Wifi, WifiOff, X } from 'lucide-react';
import React from 'react';

interface ErrorAlertProps {
  error?: {
    title: string;
    message: string;
    icon: string;
    type: string;
    canRetry?: boolean;
  } | null;
  message?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({
  error,
  message,
  onRetry,
  onDismiss,
  className = ''
}) => {
  // Handle both error object and simple message string
  const errorData = error || (message ? {
    title: 'Erro',
    message,
    icon: 'alert',
    type: 'error',
    canRetry: true
  } : null);

  if (!errorData) return null;

  const getIcon = () => {
    switch (errorData.type) {
      case 'network':
        return <WifiOff className="h-5 w-5" />;
      case 'connection':
        return <Wifi className="h-5 w-5" />;
      default:
        return <AlertTriangle className="h-5 w-5" />;
    }
  };

  const getVariant = () => {
    switch (errorData.type) {
      case 'warning':
        return 'default';
      case 'network':
      case 'connection':
        return 'destructive';
      default:
        return 'destructive';
    }
  };

  return (
    <Alert variant={getVariant() as any} className={`${className} border-l-4 shadow-md`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <div className="flex-shrink-0 mt-0.5">
            {getIcon()}
          </div>
          <div className="flex-1">
            <AlertTitle className="text-sm font-semibold mb-1 flex items-center gap-2">
              <span className="text-lg">{errorData.icon}</span>
              {errorData.title}
            </AlertTitle>
            <AlertDescription className="text-sm leading-relaxed">
              {errorData.message}
            </AlertDescription>
            
            {/* Botões de ação */}
            <div className="flex items-center gap-2 mt-3">
              {errorData.canRetry && onRetry && (
                <Button
                  onClick={onRetry}
                  size="sm"
                  variant="outline"
                  className="h-8 px-3 text-xs"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Tentar Novamente
                </Button>
              )}
              
              {onDismiss && (
                <Button
                  onClick={onDismiss}
                  size="sm"
                  variant="ghost"
                  className="h-8 px-2 text-xs"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Alert>
  );
};

// Componente de erro inline mais simples
export const ErrorMessage: React.FC<{
  error: string | null;
  icon?: string;
  className?: string;
}> = ({ error, icon = '⚠️', className = '' }) => {
  if (!error) return null;

  return (
    <div className={`flex items-center gap-2 text-sm text-red-600 dark:text-red-400 ${className}`}>
      <span className="text-base">{icon}</span>
      <span>{error}</span>
    </div>
  );
};
