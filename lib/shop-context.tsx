import React, { createContext, useContext, useMemo, useState } from 'react';

type CartProduct = {
  id: string;
  name: string;
  price: number;
};

type CartItem = {
  product: CartProduct;
  quantity: number;
  selectedVariant?: string;
};

type ShopCartContextValue = {
  items: CartItem[];
  loading: boolean;
  addToCart: (product: CartProduct, quantity?: number, selectedVariant?: string) => void;
  removeFromCart: (productId: string, selectedVariant?: string) => void;
  updateQuantity: (productId: string, quantity: number, selectedVariant?: string) => void;
  clearCart: () => void;
  getItemCount: () => number;
  getSubtotal: () => number;
};

const ShopCartContext = createContext<ShopCartContextValue | null>(null);

export function ShopCartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const value = useMemo<ShopCartContextValue>(() => ({
    items,
    loading: false,
    addToCart: (product, quantity = 1, selectedVariant) => {
      setItems((current) => {
        const existing = current.find((item) => item.product.id === product.id && item.selectedVariant === selectedVariant);
        if (!existing) return [...current, { product, quantity, selectedVariant }];
        return current.map((item) =>
          item.product.id === product.id && item.selectedVariant === selectedVariant
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      });
    },
    removeFromCart: (productId, selectedVariant) => {
      setItems((current) => current.filter((item) => !(item.product.id === productId && item.selectedVariant === selectedVariant)));
    },
    updateQuantity: (productId, quantity, selectedVariant) => {
      setItems((current) => {
        if (quantity <= 0) return current.filter((item) => !(item.product.id === productId && item.selectedVariant === selectedVariant));
        return current.map((item) =>
          item.product.id === productId && item.selectedVariant === selectedVariant ? { ...item, quantity } : item
        );
      });
    },
    clearCart: () => setItems([]),
    getItemCount: () => items.reduce((sum, item) => sum + item.quantity, 0),
    getSubtotal: () => items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
  }), [items]);

  return <ShopCartContext.Provider value={value}>{children}</ShopCartContext.Provider>;
}

export function useShopCart() {
  const context = useContext(ShopCartContext);
  if (!context) throw new Error('useShopCart must be used within ShopCartProvider');
  return context;
}
