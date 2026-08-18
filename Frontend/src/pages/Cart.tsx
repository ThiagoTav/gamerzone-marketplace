import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { productService } from "@/services/productService";
import { resolveImageUrl } from "@/lib/api";
import type { Product } from "@/types/product";

const Cart = () => {
  const { items, removeItem, updateQuantity } = useCart();
  const [products, setProducts] = useState<Record<string, Product>>({});

  useEffect(() => {
    Promise.all(items.map((i) => productService.getById(i.productId))).then((list) => {
      const map: Record<string, Product> = {};
      list.forEach((p) => { if (p) map[p.id] = p; });
      setProducts(map);
    });
  }, [items]);

  const subtotal = items.reduce((acc, item) => {
    const p = products[item.productId];
    return acc + (p ? p.price * item.quantity : 0);
  }, 0);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">
          Carrinho de <span className="text-primary">Compras</span>
        </h1>

        {items.length === 0 ? (
          <Card className="bg-gradient-card border-border">
            <CardContent className="p-12 text-center">
              <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-2xl font-bold mb-2">Seu carrinho está vazio</h3>
              <Link to="/"><Button className="bg-gradient-gamer">Ver Produtos</Button></Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => {
                const p = products[item.productId];
                if (!p) return null;
                return (
                  <Card key={item.productId} className="bg-gradient-card border-border animate-fade-in">
                    <CardContent className="p-6 flex gap-4">
                      <img src={resolveImageUrl(p.images[0])} alt={p.title} className="w-24 h-24 object-cover rounded-lg" />
                      <div className="flex-1">
                        <h3 className="font-bold mb-1">{p.title}</h3>
                        <p className="text-2xl font-bold text-primary mb-3">R$ {p.price.toFixed(2)}</p>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center border border-border rounded-lg overflow-hidden">
                            <Button variant="ghost" size="sm" className="rounded-none h-8 w-8"
                              onClick={() => updateQuantity(p.id, item.quantity - 1)}>
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="px-4 font-semibold">{item.quantity}</span>
                            <Button variant="ghost" size="sm" className="rounded-none h-8 w-8"
                              onClick={() => updateQuantity(p.id, item.quantity + 1)}>
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => removeItem(p.id)}
                            className="text-destructive hover:bg-destructive/10">
                            <Trash2 className="h-4 w-4 mr-2" /> Remover
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div>
              <Card className="bg-gradient-card border-border sticky top-24 shadow-glow-primary">
                <CardContent className="p-6 space-y-4">
                  <h3 className="text-2xl font-bold">Resumo</h3>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-semibold">R$ {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Frete</span>
                    <span className="font-semibold text-primary">Grátis</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-xl">
                    <span className="font-bold">Total</span>
                    <span className="font-bold bg-gradient-gamer bg-clip-text text-transparent">
                      R$ {subtotal.toFixed(2)}
                    </span>
                  </div>
                  <Link to="/checkout">
                    <Button className="w-full bg-gradient-gamer hover:opacity-90 h-12 shadow-glow-primary">
                      Finalizar Compra
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
