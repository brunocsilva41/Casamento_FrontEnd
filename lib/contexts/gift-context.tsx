'use client';

import React, { createContext, useCallback, useContext, useReducer } from 'react';
import { Gift, giftService } from '../services/gift.service';

interface GiftState {
  gifts: Gift[];
  availableGifts: Gift[];
  selectedGift: Gift | null;
  isLoading: boolean;
  error: string | null;
}

type GiftAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_GIFTS'; payload: Gift[] }
  | { type: 'SET_AVAILABLE_GIFTS'; payload: Gift[] }
  | { type: 'SET_SELECTED_GIFT'; payload: Gift | null }
  | { type: 'ADD_GIFT'; payload: Gift }
  | { type: 'UPDATE_GIFT'; payload: Gift }
  | { type: 'REMOVE_GIFT'; payload: string }
  | { type: 'RESET' };

const initialState: GiftState = {
  gifts: [],
  availableGifts: [],
  selectedGift: null,
  isLoading: false,
  error: null
};

function giftReducer(state: GiftState, action: GiftAction): GiftState {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };
    
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false
      };
    
    case 'SET_GIFTS':
      return {
        ...state,
        gifts: action.payload,
        isLoading: false,
        error: null
      };
    
    case 'SET_AVAILABLE_GIFTS':
      return {
        ...state,
        availableGifts: action.payload,
        isLoading: false,
        error: null
      };
    
    case 'SET_SELECTED_GIFT':
      return {
        ...state,
        selectedGift: action.payload
      };
    
    case 'ADD_GIFT':
      return {
        ...state,
        gifts: [...state.gifts, action.payload],
        error: null
      };
    
    case 'UPDATE_GIFT':
      return {
        ...state,
        gifts: state.gifts.map(gift => 
          gift.id === action.payload.id ? action.payload : gift
        ),
        selectedGift: state.selectedGift?.id === action.payload.id 
          ? action.payload 
          : state.selectedGift,
        error: null
      };
    
    case 'REMOVE_GIFT':
      return {
        ...state,
        gifts: state.gifts.filter(gift => gift.id !== action.payload),
        selectedGift: state.selectedGift?.id === action.payload 
          ? null 
          : state.selectedGift,
        error: null
      };
    
    case 'RESET':
      return initialState;
    
    default:
      return state;
  }
}

interface GiftContextValue extends GiftState {
  // Actions
  loadGifts: () => Promise<void>;
  loadAvailableGifts: () => Promise<void>;
  selectGift: (gift: Gift | null) => void;
  createGift: (giftData: { name: string; description: string; price: number; imageUrl: string }) => Promise<Gift>;
  updateGift: (id: string, updateData: Partial<{ name: string; description: string; price: number; imageUrl: string }>) => Promise<Gift>;
  deleteGift: (id: string) => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

const GiftContext = createContext<GiftContextValue | undefined>(undefined);

interface GiftProviderProps {
  children: React.ReactNode;
}

export function GiftProvider({ children }: GiftProviderProps) {
  const [state, dispatch] = useReducer(giftReducer, initialState);

  // Load all gifts
  const loadGifts = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const gifts = await giftService.getAllGifts();
      dispatch({ type: 'SET_GIFTS', payload: gifts });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar presentes';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
    }
  }, []);

  // Load available gifts only
  const loadAvailableGifts = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const gifts = await giftService.getAvailableGifts();
      dispatch({ type: 'SET_AVAILABLE_GIFTS', payload: gifts });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar presentes disponíveis';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
    }
  }, []);

  // Select a gift
  const selectGift = useCallback((gift: Gift | null) => {
    dispatch({ type: 'SET_SELECTED_GIFT', payload: gift });
  }, []);

  // Create gift (admin only)
  const createGift = useCallback(async (giftData: { name: string; description: string; price: number; imageUrl: string }) => {
    try {
      const newGift = await giftService.createGift(giftData);
      dispatch({ type: 'ADD_GIFT', payload: newGift });
      return newGift;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao criar presente';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  }, []);

  // Update gift (admin only)
  const updateGift = useCallback(async (id: string, updateData: Partial<{ name: string; description: string; price: number; imageUrl: string }>) => {
    try {
      const updatedGift = await giftService.updateGift(id, updateData);
      dispatch({ type: 'UPDATE_GIFT', payload: updatedGift });
      return updatedGift;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao atualizar presente';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  }, []);

  // Delete gift (admin only)
  const deleteGift = useCallback(async (id: string) => {
    try {
      await giftService.deleteGift(id);
      dispatch({ type: 'REMOVE_GIFT', payload: id });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao deletar presente';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  // Reset state
  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  const value: GiftContextValue = {
    ...state,
    loadGifts,
    loadAvailableGifts,
    selectGift,
    createGift,
    updateGift,
    deleteGift,
    clearError,
    reset
  };

  return (
    <GiftContext.Provider value={value}>
      {children}
    </GiftContext.Provider>
  );
}

export function useGifts(): GiftContextValue {
  const context = useContext(GiftContext);
  if (context === undefined) {
    throw new Error('useGifts deve ser usado dentro de um GiftProvider');
  }
  return context;
}
