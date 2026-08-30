import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Wallet } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { orderService } from "@/services/orderService";
import { resolveImageUrl } from "@/lib/api";
import type { SaleOrder, OrderItemStatus } from "@/types/order";
import { useToast } from "@/hooks/use-toast";

const statusMeta: Record<OrderItemStatus, { label: string; className: string }> = {
  processing: { label: "Aguardando envio", className: "bg-muted-foreground" },
  shipped: { label: "Enviado", className: "bg-primary" },
  delivered: { label: "Entregue", className: "bg-green-600" },
  cancelled: { label: "Cancelado", className: "bg-gamer-red" },
};

const MySales = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sales, setSales] = useState<SaleOrder[]>([]);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  const refresh = useCallback(async () => {
    if (!user) return;
    const list = await orderService.getSales();
    setSales(list);
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  const markShipped = async (orderId: string, productId: string) => {
    try {
      await orderService.updateItemStatus(orderId, productId, "shipped");
      toast({ title: "Item marcado como enviado!" });
      refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : undefined;
      toast({ title: "Erro ao atualizar envio", description: message, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Minhas <span className="text-primary">Vendas</span></h1>

        {sales.length === 0 ? (
          <Card className="bg-gradient-card border-border">
            <CardContent className="p-12 text-center">
              <Wallet className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Você ainda não vendeu nenhum produto.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {sales.map((sale) => (
              <Card key={sale.id} className="bg-gradient-card border-border">
                <CardContent className="p-6">
                  <div className="flex flex-wrap justify-between gap-2 mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Vendido em {new Date(sale.createdAt).toLocaleDateString("pt-BR")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Comprador: {sale.buyer ? `${sale.buyer.name} (${sale.buyer.email})` : "Conta removida"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Entregar em: {sale.shippingAddress.address}, {sale.shippingAddress.city}/{sale.shippingAddress.state} — {sale.shippingAddress.zip}
                      </p>
                    </div>
                    <p className="font-bold text-lg bg-gradient-gamer bg-clip-text text-transparent">
                      R$ {sale.subtotal.toFixed(2)}
                    </p>
                  </div>
                  <Separator className="mb-4" />
                  <div className="space-y-4">
                    {sale.items.map((item) => (
                      <div key={item.productId} className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                        <img src={item.image ? resolveImageUrl(item.image) : "/placeholder.svg"} alt={item.title}
                          className="w-16 h-16 object-cover rounded-lg" />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate">{item.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.quantity}x R$ {item.price.toFixed(2)}
                          </p>
                        </div>
                        <Badge className={statusMeta[item.status].className}>
                          {statusMeta[item.status].label}
                        </Badge>
                        {item.status === "processing" && (
                          <Button size="sm" className="bg-gradient-gamer hover:opacity-90"
                            onClick={() => markShipped(sale.id, item.productId)}>
                            Marcar como enviado
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MySales;
