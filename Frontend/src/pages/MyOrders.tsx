import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PackageOpen } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { orderService } from "@/services/orderService";
import { resolveImageUrl } from "@/lib/api";
import type { Order, OrderItemStatus } from "@/types/order";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from "@/components/ui/alert-dialog";

const statusMeta: Record<OrderItemStatus, { label: string; className: string }> = {
  processing: { label: "Aguardando envio", className: "bg-muted-foreground" },
  shipped: { label: "Enviado", className: "bg-primary" },
  delivered: { label: "Entregue", className: "bg-green-600" },
  cancelled: { label: "Cancelado", className: "bg-gamer-red" },
};

const MyOrders = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  const refresh = useCallback(async () => {
    if (!user) return;
    const list = await orderService.getMine();
    setOrders(list);
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  const confirmReceived = async (orderId: string, productId: string) => {
    try {
      await orderService.updateItemStatus(orderId, productId, "delivered");
      toast({ title: "Recebimento confirmado!" });
      refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : undefined;
      toast({ title: "Erro ao confirmar recebimento", description: message, variant: "destructive" });
    }
  };

  const cancelItem = async (orderId: string, productId: string) => {
    try {
      await orderService.updateItemStatus(orderId, productId, "cancelled");
      toast({ title: "Item cancelado" });
      refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : undefined;
      toast({ title: "Erro ao cancelar item", description: message, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Meus <span className="text-primary">Pedidos</span></h1>

        {orders.length === 0 ? (
          <Card className="bg-gradient-card border-border">
            <CardContent className="p-12 text-center">
              <PackageOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">Você ainda não fez nenhum pedido.</p>
              <Link to="/"><Button className="bg-gradient-gamer">Ver Produtos</Button></Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order.id} className="bg-gradient-card border-border">
                <CardContent className="p-6">
                  <div className="flex flex-wrap justify-between gap-2 mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Pedido em {new Date(order.createdAt).toLocaleDateString("pt-BR")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Entrega: {order.shippingAddress.address}, {order.shippingAddress.city}/{order.shippingAddress.state}
                      </p>
                    </div>
                    <p className="font-bold text-lg bg-gradient-gamer bg-clip-text text-transparent">
                      R$ {order.total.toFixed(2)}
                    </p>
                  </div>
                  <Separator className="mb-4" />
                  <div className="space-y-4">
                    {order.items.map((item) => (
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
                        {item.status === "shipped" && (
                          <Button size="sm" variant="outline"
                            onClick={() => confirmReceived(order.id, item.productId)}>
                            Confirmar recebimento
                          </Button>
                        )}
                        {item.status === "processing" && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="outline" className="text-destructive hover:bg-destructive/10">
                                Cancelar
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Cancelar item?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta ação não pode ser desfeita. O item será removido do pedido.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Voltar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => cancelItem(order.id, item.productId)}>
                                  Cancelar item
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
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

export default MyOrders;
