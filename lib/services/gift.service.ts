import { authService } from './auth.service';
import { API_BASE_URL, API_ENDPOINTS } from './config';

export interface Gift {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  claimedBy: string | null;
  claimedAt: string | null;
  transactionId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGiftData {
  name: string;
  description: string;
  price: number;
  imageUrl: string;
}

export interface UpdateGiftData extends Partial<CreateGiftData> {}

export interface GiftResponse {
  success: boolean;
  data: Gift | Gift[];
  message?: string;
}

export class GiftService {
  private static instance: GiftService;

  private constructor() {}

  public static getInstance(): GiftService {
    if (!GiftService.instance) {
      GiftService.instance = new GiftService();
    }
    return GiftService.instance;
  }

  /**
   * Get all gifts (public)
   */
  public async getAllGifts(): Promise<Gift[]> {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.GIFTS.LIST}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar presentes');
      }

      const result = await response.json();
      return result.data || result;
    } catch (error) {
      console.error('Erro ao carregar presentes:', error);
      throw error;
    }
  }

  /**
   * Get available gifts only (public)
   */
  public async getAvailableGifts(): Promise<Gift[]> {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.GIFTS.AVAILABLE}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar presentes disponíveis');
      }

      const result = await response.json();
      return result.data || result;
    } catch (error) {
      console.error('Erro ao carregar presentes disponíveis:', error);
      throw error;
    }
  }

  /**
   * Get single gift by ID
   */
  public async getGiftById(id: string): Promise<Gift> {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.GIFTS.LIST}/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Presente não encontrado');
        }
        throw new Error('Erro ao carregar presente');
      }

      const result = await response.json();
      return result.data || result;
    } catch (error) {
      console.error('Erro ao carregar presente:', error);
      throw error;
    }
  }

  /**
   * Create new gift (admin only)
   */
  public async createGift(giftData: CreateGiftData): Promise<Gift> {
    if (!authService.isAuthenticated()) {
      throw new Error('Autenticação necessária');
    }

    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.GIFTS.CREATE}`, {
        method: 'POST',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(giftData)
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Não autorizado. Faça login novamente.');
        }
        if (response.status === 403) {
          throw new Error('Acesso negado. Apenas administradores podem criar presentes.');
        }
        
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao criar presente');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Erro ao criar presente:', error);
      throw error;
    }
  }

  /**
   * Update gift (admin only)
   */
  public async updateGift(id: string, updateData: UpdateGiftData): Promise<Gift> {
    if (!authService.isAuthenticated()) {
      throw new Error('Autenticação necessária');
    }

    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.GIFTS.UPDATE(id)}`, {
        method: 'PUT',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Não autorizado. Faça login novamente.');
        }
        if (response.status === 403) {
          throw new Error('Acesso negado. Apenas administradores podem editar presentes.');
        }
        if (response.status === 404) {
          throw new Error('Presente não encontrado');
        }
        
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao atualizar presente');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Erro ao atualizar presente:', error);
      throw error;
    }
  }

  /**
   * Delete gift (admin only)
   */
  public async deleteGift(id: string): Promise<void> {
    if (!authService.isAuthenticated()) {
      throw new Error('Autenticação necessária');
    }

    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.GIFTS.DELETE(id)}`, {
        method: 'DELETE',
        headers: authService.getAuthHeaders()
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Não autorizado. Faça login novamente.');
        }
        if (response.status === 403) {
          throw new Error('Acesso negado. Apenas administradores podem deletar presentes.');
        }
        if (response.status === 404) {
          throw new Error('Presente não encontrado');
        }
        
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao deletar presente');
      }
    } catch (error) {
      console.error('Erro ao deletar presente:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const giftService = GiftService.getInstance();
