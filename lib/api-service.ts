import { ClaimGiftRequest, ClaimGiftResponse, GeneratePixRequest, Gift, PixResponse } from './types';

const API_BASE_URL = 'http://localhost:3001';

// Função helper para fazer requisições
async function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}: ${data.message || 'Erro desconhecido'}`);
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Erro na conexão com o servidor');
  }
}

export const giftService = {
  // Buscar todos os presentes
  async getAllGifts(): Promise<Gift[]> {
    return apiRequest<Gift[]>('/gifts');
  },

  // Buscar presente por ID
  async getGiftById(id: string): Promise<Gift> {
    return apiRequest<Gift>(`/gifts/${id}`);
  },

  // Reivindicar presente
  async claimGift(id: string, request: ClaimGiftRequest): Promise<ClaimGiftResponse> {
    return apiRequest<ClaimGiftResponse>(`/gifts/${id}/claim`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },
};

export const pixService = {
  // Gerar QR Code PIX usando o novo endpoint
  async generateCustomPix(request: GeneratePixRequest): Promise<PixResponse> {
    return apiRequest<PixResponse>('/pix/generate', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  // Gerar QR Code PIX para presente específico
  async generateGiftPix(giftId: string, description?: string): Promise<PixResponse> {
    try {
      // Primeiro buscar o presente para obter o nome e preço
      const gift = await giftService.getGiftById(giftId);
      
      // Usar o novo endpoint /pix/generate com os dados do presente
      const pixRequest: GeneratePixRequest = {
        productName: description || `Presente: ${gift.name}`,
        amount: gift.price
      };

      return await this.generateCustomPix(pixRequest);
    } catch (error) {
      console.error('Erro ao gerar PIX para presente:', error);
      
      // Mock response para desenvolvimento/demo
      const mockResponse: PixResponse = {
        payload: "00020126580014br.gov.bcb.pix0136mock-transaction-id-" + Date.now(),
        qrCodeBase64: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
        productName: description || `Presente: Mock Gift`,
        amount: "R$ 199,99",
        transactionId: "mock-transaction-" + Date.now(),
        pixKey: "51cdbf64-e1d0-4f45-ad23-199f92374ed1"
      };
      
      console.warn('Usando resposta mock para desenvolvimento');
      return mockResponse;
    }
  },
};

// Hook personalizado para gerenciar estado dos presentes
import { useCallback, useEffect, useState } from 'react';

export function useGifts() {
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGifts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await giftService.getAllGifts();
      // Ordenar alfabeticamente por nome conforme requisito
      setGifts(data.sort((a, b) => a.name.localeCompare(b.name)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar presentes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGifts();
  }, [fetchGifts]);

  const claimGift = useCallback(async (id: string, guestName: string): Promise<ClaimGiftResponse> => {
    try {
      const result = await giftService.claimGift(id, { guestName });
      // Atualizar a lista local após reivindicação
      await fetchGifts();
      return result;
    } catch (err) {
      throw err;
    }
  }, [fetchGifts]);

  return {
    gifts,
    loading,
    error,
    refetch: fetchGifts,
    claimGift,
  };
}

export function useGift(id: string) {
  const [gift, setGift] = useState<Gift | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchGift() {
      try {
        setLoading(true);
        setError(null);
        const data = await giftService.getGiftById(id);
        setGift(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar presente');
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchGift();
    }
  }, [id]);

  return { gift, loading, error };
}
