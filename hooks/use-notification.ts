'use client';

import { getFriendlyErrorMessage } from '@/lib/error-handler';
import { toast } from 'sonner';

export function useNotification() {
  const showError = (error: any, fallbackMessage?: string) => {
    const friendlyError = getFriendlyErrorMessage(error);
    
    toast.error(friendlyError.title, {
      description: friendlyError.message,
      duration: 5000,
    });
  };

  const showSuccess = (title: string, message?: string) => {
    toast.success(title, {
      description: message,
      duration: 4000,
    });
  };

  const showWarning = (title: string, message?: string) => {
    toast.warning(title, {
      description: message,
      duration: 4000,
    });
  };

  const showInfo = (title: string, message?: string) => {
    toast.info(title, {
      description: message,
      duration: 4000,
    });
  };

  return {
    showError,
    showSuccess,
    showWarning,
    showInfo,
  };
}