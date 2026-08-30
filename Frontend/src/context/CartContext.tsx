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

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    const data = await cartService.getCart();
    setItems(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    // espera a checagem de sessão terminar antes de buscar o carrinho —
    // evita buscar o carrinho de convidado e, um instante depois, o do
    // usuário logado (a troca de `user` já dispara um novo refresh sozinha,
    // pegando o carrinho migrado no login/registro).
    if (!authLoading) refresh();
  }, [user, authLoading, refresh]);

  const addItem = async (productId: string, quantity = 1) => {
    const data = await cartService.addItem(productId, quantity);
    setItems(data);
  };
  const removeItem = async (productId: string) => {
    const data = await cartService.removeItem(productId);
    setItems(data);
  };
  const updateQuantity = async (productId: string, quantity: number) => {
    const data = await cartService.updateQuantity(productId, quantity);
    setItems(data);
  };
  const clear = async () => {
    await cartService.clear();
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
