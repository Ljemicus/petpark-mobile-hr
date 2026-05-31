import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './auth-context';
import type { CartItem, Product } from './shop';
import { loadCartFromSupabase, syncCartToSupabase } from './shop';

interface ShopCartContextValue {
  items: CartItem[];
  loading: boolean;
  addToCart: (product: Product, quantity?: number, selectedVariant?: string) => void;
  removeFromCart: (productId: string, selectedVariant?: string) => void;
  updateQuantity: (productId: string, quantity: number, selectedVariant?: string) => void;
  clearCart: () => void;
  getItemCount: () => number;
  getSubtotal: () => number;
}

const ShopCartContext = createContext<ShopCartContextValue | null>(null);

export function ShopCartProvider({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function bootstrap() {
      if (!session?.user?.id) {
        setLoading(false);
        return;
      }
      const remoteItems = await loadCartFromSupabase(session.user.id);
      if (!cancelled && remoteItems.length) setItems(remoteItems);
      if (!cancelled) setLoading(false);
    }
    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, [session?.user?.id]);

  useEffect(() => {
    if (!session?.user?.id || loading) return;
    void syncCartToSupabase(session.user.id, items);
  }, [items, loading, session?.user?.id]);

  const addToCart = useCallback((product: Product, quantity = 1, selectedVariant?: string) => {
    setItems((current) => {
      const existing = current.find((item) => item.product.id === product.id && item.selectedVariant === selectedVariant);
      if (!existing) return [...current, { product, quantity, selectedVariant }];
      return current.map((item) =>
        item.product.id === product.id && item.selectedVariant === selectedVariant
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
    });
  }, []);

  const removeFromCart = useCallback((productId: string, selectedVariant?: string) => {
    setItems((current) => current.filter((item) => !(item.product.id === productId && item.selectedVariant === selectedVariant)));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number, selectedVariant?: string) => {
    if (quantity <= 0) {
      setItems((current) => current.filter((item) => !(item.product.id === productId && item.selectedVariant === selectedVariant)));
      return;
    }
    setItems((current) => current.map((item) =>
      item.product.id === productId && item.selectedVariant === selectedVariant
        ? { ...item, quantity }
        : item
    ));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const value = useMemo<ShopCartContextValue>(() => ({
    items,
    loading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getItemCount: () => items.reduce((sum, item) => sum + item.quantity, 0),
    getSubtotal: () => items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
  }), [addToCart, clearCart, items, loading, removeFromCart, updateQuantity]);

  return <ShopCartContext.Provider value={value}>{children}</ShopCartContext.Provider>;
}

export function useShopCart() {
  const context = useContext(ShopCartContext);
  if (!context) throw new Error('useShopCart must be used within ShopCartProvider');
  return context;
}
