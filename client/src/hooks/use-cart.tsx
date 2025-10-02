import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '@shared/schema';
import { convertMZNToUSD } from '@/lib/currency';

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  sessionId: string;
  
  // Actions
  addItem: (product: Product, quantity: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  
  // Computed values
  getTotalItems: () => number;
  getTotalMZN: () => number;
  getTotalUSD: () => number;
  getItemCount: (productId: string) => number;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      sessionId: generateSessionId(),
      
      addItem: (product, quantity) => {
        set((state) => {
          const existingItem = state.items.find(item => item.product.id === product.id);
          
          if (existingItem) {
            return {
              items: state.items.map(item =>
                item.product.id === product.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              )
            };
          } else {
            return {
              items: [
                ...state.items,
                {
                  id: crypto.randomUUID(),
                  product,
                  quantity
                }
              ]
            };
          }
        });
      },
      
      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter(item => item.product.id !== productId)
        }));
      },
      
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        
        set((state) => ({
          items: state.items.map(item =>
            item.product.id === productId
              ? { ...item, quantity }
              : item
          )
        }));
      },
      
      clearCart: () => {
        set({ items: [] });
      },
      
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
      
      getTotalMZN: () => {
        return get().items.reduce((total, item) => total + (item.product.price_mzn * item.quantity), 0);
      },
      
      getTotalUSD: () => {
        const totalMZN = get().getTotalMZN();
        return convertMZNToUSD(totalMZN);
      },
      
      getItemCount: (productId) => {
        const item = get().items.find(item => item.product.id === productId);
        return item ? item.quantity : 0;
      },
    }),
    {
      name: 'maputo-import-cart',
      partialize: (state) => ({ items: state.items, sessionId: state.sessionId }),
    }
  )
);

function generateSessionId(): string {
  return crypto.randomUUID();
}
