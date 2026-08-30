import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Play, Pause, Plus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { productService } from "@/services/productService";
import { resolveImageUrl } from "@/lib/api";
import type { Product, ProductStatus } from "@/types/product";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from "@/components/ui/alert-dialog";

const statusMeta: Record<ProductStatus, { label: string; className: string }> = {
  active: { label: "Ativo", className: "bg-primary" },
  paused: { label: "Pausado", className: "bg-muted-foreground" },
  sold: { label: "Vendido", className: "bg-gamer-red" },
};

const MyListings = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  const refresh = useCallback(async () => {
    if (!user) return;
    const list = await productService.getMine();
    setProducts(list);
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  const toggleStatus = async (p: Product) => {
    const next: ProductStatus = p.status === "active" ? "paused" : "active";
    await productService.setStatus(p.id, next);
    toast({ title: next === "active" ? "Anúncio reativado" : "Anúncio pausado" });
    refresh();
  };

  const remove = async (p: Product) => {
    await productService.remove(p.id);
    toast({ title: "Anúncio excluído" });
    refresh();
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
          <h1 className="text-4xl font-bold">Meus <span className="text-primary">Anúncios</span></h1>
          <Link to="/sell">
            <Button className="bg-gradient-gamer hover:opacity-90 shadow-glow-primary">
              <Plus className="mr-2 h-4 w-4" /> Novo anúncio
            </Button>
          </Link>
        </div>

        {products.length === 0 ? (
          <Card className="bg-gradient-card border-border">
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground mb-4">Você ainda não tem anúncios.</p>
              <Link to="/sell"><Button className="bg-gradient-gamer">Criar primeiro anúncio</Button></Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {products.map((p) => (
              <Card key={p.id} className="bg-gradient-card border-border">
                <CardContent className="p-4 flex flex-col sm:flex-row gap-4">
                  <img src={resolveImageUrl(p.images[0])} alt={p.title} className="w-full sm:w-32 h-32 object-cover rounded-lg" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <Badge className={statusMeta[p.status].className}>{statusMeta[p.status].label}</Badge>
                      <Badge variant="outline">{p.category}</Badge>
                    </div>
                    <h3 className="font-bold text-lg mb-1 truncate">{p.title}</h3>
                    <p className="text-2xl font-bold bg-gradient-gamer bg-clip-text text-transparent">
                      R$ {p.price.toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">{p.stock} em estoque</p>
                  </div>
                  <div className="flex sm:flex-col gap-2">
                    <Button variant="outline" size="sm" onClick={() => navigate(`/sell/${p.id}`)}>
                      <Edit className="h-4 w-4 sm:mr-2" /><span className="hidden sm:inline">Editar</span>
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => toggleStatus(p)} disabled={p.status === "sold"}>
                      {p.status === "active" ? <Pause className="h-4 w-4 sm:mr-2" /> : <Play className="h-4 w-4 sm:mr-2" />}
                      <span className="hidden sm:inline">{p.status === "active" ? "Pausar" : "Ativar"}</span>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10">
                          <Trash2 className="h-4 w-4 sm:mr-2" /><span className="hidden sm:inline">Excluir</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir anúncio?</AlertDialogTitle>
                          <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => remove(p)}>Excluir</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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

export default MyListings;
