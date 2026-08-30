import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Star } from "lucide-react";
import { authService } from "@/services/authService";
import { productService } from "@/services/productService";
import { resolveImageUrl } from "@/lib/api";
import type { User } from "@/types/user";
import type { Product } from "@/types/product";

const SellerProfile = () => {
  const { id } = useParams<{ id: string }>();
  const [seller, setSeller] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (!id) return;
    authService.getSellerById(id).then(setSeller);
    productService.getBySellerId(id).then(setProducts);
  }, [id]);

  if (!seller) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <Link to="/">
          <Button variant="ghost" className="mb-6"><ArrowLeft className="mr-2 h-4 w-4" /> Voltar</Button>
        </Link>

        <Card className="bg-gradient-card border-border mb-8">
          <CardContent className="p-6 flex items-center gap-6 flex-wrap">
            <Avatar className="h-24 w-24 border-4 border-primary shadow-glow-primary">
              <AvatarImage src={resolveImageUrl(seller.avatar ?? "")} />
              <AvatarFallback className="text-2xl">{seller.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{seller.name}</h1>
              <div className="flex items-center gap-2 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`h-5 w-5 ${i < Math.floor(seller.rating) ? "fill-secondary text-secondary" : "fill-muted text-muted"}`} />
                ))}
                <span className="text-muted-foreground">{seller.rating.toFixed(1)}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Vendedor desde {new Date(seller.createdAt).toLocaleDateString("pt-BR")}
              </p>
            </div>
          </CardContent>
        </Card>

        <h2 className="text-2xl font-bold mb-4">Anúncios ativos ({products.length})</h2>
        {products.length === 0 ? (
          <Card className="bg-gradient-card border-border p-8 text-center">
            <p className="text-muted-foreground">Este vendedor não tem anúncios ativos no momento.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerProfile;
