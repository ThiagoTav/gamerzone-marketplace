import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { CreditCard, Lock, CheckCircle2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { productService } from "@/services/productService";
import type { Product } from "@/types/product";
import { useToast } from "@/hooks/use-toast";

const Checkout = () => {
  const { items, clear } = useCart();
  const [products, setProducts] = useState<Record<string, Product>>({});
  const [success, setSuccess] = useState(false);
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all(items.map((i) => productService.getById(i.productId))).then((list) => {
      const map: Record<string, Product> = {};
      list.forEach((p) => { if (p) map[p.id] = p; });
      setProducts(map);
    });
  }, [items]);

  const subtotal = items.reduce((acc, i) => acc + (products[i.productId]?.price ?? 0) * i.quantity, 0);

  const handleFinish = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    await new Promise((r) => setTimeout(r, 1000));
    await clear();
    setSuccess(true);
    setProcessing(false);
    toast({ title: "Pedido realizado!", description: "Obrigado pela compra 🎮" });
    setTimeout(() => navigate("/"), 2500);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-24 text-center">
          <CheckCircle2 className="h-24 w-24 mx-auto text-primary mb-6 animate-glow-pulse" />
          <h1 className="text-4xl font-bold mb-4">Pedido Confirmado!</h1>
          <p className="text-muted-foreground">Redirecionando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Finalizar <span className="text-primary">Compra</span></h1>

        <form onSubmit={handleFinish} className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-gradient-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" /> Pagamento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div><Label>Nome no Cartão</Label><Input required placeholder="Nome completo" /></div>
                <div><Label>Número do Cartão</Label><Input required placeholder="0000 0000 0000 0000" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Validade</Label><Input required placeholder="MM/AA" /></div>
                  <div><Label>CVV</Label><Input required placeholder="123" /></div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border-border">
              <CardHeader><CardTitle>Endereço</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div><Label>Endereço</Label><Input required placeholder="Rua, número" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Cidade</Label><Input required /></div>
                  <div><Label>Estado</Label><Input required /></div>
                </div>
                <div><Label>CEP</Label><Input required placeholder="00000-000" /></div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-gradient-card border-border h-fit sticky top-24 shadow-glow-primary">
            <CardHeader><CardTitle>Resumo</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {items.map((i) => {
                const p = products[i.productId];
                if (!p) return null;
                return (
                  <div key={i.productId} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{i.quantity}x {p.title}</span>
                    <span className="font-semibold">R$ {(p.price * i.quantity).toFixed(2)}</span>
                  </div>
                );
              })}
              <Separator />
              <div className="flex justify-between text-xl">
                <span className="font-bold">Total</span>
                <span className="font-bold bg-gradient-gamer bg-clip-text text-transparent">
                  R$ {subtotal.toFixed(2)}
                </span>
              </div>
              <Button type="submit" disabled={processing || items.length === 0}
                className="w-full bg-gradient-gamer hover:opacity-90 h-12 shadow-glow-primary">
                <Lock className="mr-2 h-5 w-5" />
                {processing ? "Processando..." : "Confirmar Pedido"}
              </Button>
              <Link to="/cart"><Button type="button" variant="outline" className="w-full">Voltar ao carrinho</Button></Link>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
