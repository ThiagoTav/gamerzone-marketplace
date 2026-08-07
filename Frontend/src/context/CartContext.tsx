import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { cartService, CartItem } from "@/services/cartService";
import { useAuth } from "./AuthContext";

interface CartContextType {
  items: CartItem[];
  count: number;
  loading: boolean;
  addItem: (productId: string, quantity?: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clear: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);
const GUEST_ID = "guest";

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  const userId = user?.id ?? GUEST_ID;

  const refresh = useCallback(async () => {
    setLoading(true);
    const data = await cartService.getCart(userId);
    setItems(data);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addItem = async (productId: string, quantity = 1) => {
    const data = await cartService.addItem(userId, productId, quantity);
    setItems(data);
  };
  const removeItem = async (productId: string) => {
    const data = await cartService.removeItem(userId, productId);
    setItems(data);
  };
  const updateQuantity = async (productId: string, quantity: number) => {
    const data = await cartService.updateQuantity(userId, productId, quantity);
    setItems(data);
  };
  const clear = async () => {
    await cartService.clear(userId);
    setItems([]);
  };

  const count = items.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, count, loading, addItem, removeItem, updateQuantity, clear }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart deve ser usado dentro de CartProvider");
  return ctx;
};
