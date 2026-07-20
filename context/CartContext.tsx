import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";

import type { Product } from "@/types/database";

export interface CartLine {
  product: Product;
  quantity: number;
  specialRequest: string;
}

interface CartContextValue {
  lines: CartLine[];
  totalCount: number;
  totalPrice: number;
  getQuantity: (productId: string) => number;
  increment: (product: Product) => void;
  decrement: (productId: string) => void;
  setSpecialRequest: (productId: string, text: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);

  const getQuantity = useCallback(
    (productId: string) => lines.find((l) => l.product.id === productId)?.quantity ?? 0,
    [lines]
  );

  const increment = useCallback((product: Product) => {
    setLines((prev) => {
      const existing = prev.find((l) => l.product.id === product.id);
      if (existing) {
        return prev.map((l) =>
          l.product.id === product.id ? { ...l, quantity: l.quantity + 1 } : l
        );
      }
      return [...prev, { product, quantity: 1, specialRequest: "" }];
    });
  }, []);

  const decrement = useCallback((productId: string) => {
    setLines((prev) =>
      prev
        .map((l) => (l.product.id === productId ? { ...l, quantity: l.quantity - 1 } : l))
        .filter((l) => l.quantity > 0)
    );
  }, []);

  const setSpecialRequest = useCallback((productId: string, text: string) => {
    setLines((prev) =>
      prev.map((l) => (l.product.id === productId ? { ...l, specialRequest: text } : l))
    );
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const totalCount = useMemo(() => lines.reduce((sum, l) => sum + l.quantity, 0), [lines]);
  const totalPrice = useMemo(
    () => lines.reduce((sum, l) => sum + (l.product.price ?? 0) * l.quantity, 0),
    [lines]
  );

  const value = useMemo(
    () => ({ lines, totalCount, totalPrice, getQuantity, increment, decrement, setSpecialRequest, clear }),
    [lines, totalCount, totalPrice, getQuantity, increment, decrement, setSpecialRequest, clear]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart, CartProvider içinde kullanılmalıdır.");
  return ctx;
}
