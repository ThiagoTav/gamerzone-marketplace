import { ShoppingCart, Store } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@/mocks/products";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { authService } from "@/services/authService";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addItem } = useCart();
  const { toast } = useToast();
  const [sellerName, setSellerName] = useState("");

  useEffect(() => {
    authService.getSellerById(product.sellerId).then((s) => s && setSellerName(s.name));
  }, [product.sellerId]);

  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await addItem(product.id);
    toast({ title: "Adicionado ao carrinho!", description: product.title });
  };

  return (
    <Card className="group overflow-hidden border-border bg-gradient-card hover:border-primary/50 transition-all duration-300 hover:shadow-glow-primary animate-fade-in flex flex-col">
      <Link to={`/product/${product.id}`}>
        <div className="relative overflow-hidden aspect-square bg-muted">
          <img
            src={product.images[0]}
            alt={product.title}
            className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
          />
          <Badge className="absolute top-3 right-3 bg-primary/90">{product.category}</Badge>
          {product.condition === "used" && (
            <Badge variant="secondary" className="absolute top-3 left-3 bg-gamer-red text-white">
              Usado
            </Badge>
          )}
        </div>
      </Link>

      <CardContent className="p-4 flex-1">
        <Link to={`/product/${product.id}`}>
          <h3 className="font-bold text-base mb-2 group-hover:text-primary transition-colors line-clamp-2 min-h-[3rem]">
            {product.title}
          </h3>
        </Link>
        <div className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
          <Store className="h-3 w-3" /> {sellerName || "..."}
        </div>
        <div className="text-2xl font-bold bg-gradient-gamer bg-clip-text text-transparent">
          R$ {product.price.toFixed(2)}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 gap-2">
        <Link to={`/product/${product.id}`} className="flex-1">
          <Button variant="outline" size="sm" className="w-full border-primary/30 hover:bg-primary/10">
            Ver Detalhes
          </Button>
        </Link>
        <Button size="icon" onClick={handleAdd} className="bg-gradient-gamer hover:opacity-90 shadow-glow-primary">
          <ShoppingCart className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
