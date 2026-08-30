import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { ArrowLeft, ShoppingCart, Star, Store } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { StarRatingInput } from "@/components/StarRatingInput";
import { productService } from "@/services/productService";
import { reviewService } from "@/services/reviewService";
import { authService } from "@/services/authService";
import { ApiError, resolveImageUrl } from "@/lib/api";
import type { Product } from "@/types/product";
import type { Review } from "@/types/review";
import type { User } from "@/types/user";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [seller, setSeller] = useState<User | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const { user } = useAuth();
  const { addItem } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    productService.getById(id).then(async (p) => {
      setProduct(p);
      if (p) {
        const [r, s] = await Promise.all([
          reviewService.getByProductId(p.id),
          authService.getSellerById(p.sellerId),
        ]);
        setReviews(r);
        setSeller(s);
      }
      setLoading(false);
    });
  }, [id]);

  const avgRating = reviews.length
    ? reviews.reduce((a, r) => a + r.rating, 0) / reviews.length
    : 0;

  const handleAdd = async () => {
    if (!product) return;
    try {
      await addItem(product.id, quantity);
      toast({ title: "Adicionado ao carrinho!", description: `${quantity}x ${product.title}` });
    } catch (err) {
      const message = err instanceof Error ? err.message : undefined;
      toast({ title: "Erro ao adicionar ao carrinho", description: message, variant: "destructive" });
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    if (reviewRating === 0) {
      toast({ title: "Selecione uma nota", variant: "destructive" });
      return;
    }
    const comment = reviewComment.trim();
    if (!comment) {
      toast({ title: "Escreva um comentário", variant: "destructive" });
      return;
    }
    setSubmittingReview(true);
    try {
      const newReview = await reviewService.create(product.id, { rating: reviewRating, comment });
      setReviews((prev) => [newReview, ...prev]);
      setReviewRating(0);
      setReviewComment("");
      toast({ title: "Avaliação enviada!" });
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        toast({ title: "Você já avaliou este produto", variant: "destructive" });
      } else {
        const message = err instanceof Error ? err.message : undefined;
        toast({ title: "Erro ao enviar avaliação", description: message, variant: "destructive" });
      }
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8 grid lg:grid-cols-2 gap-12">
          <Skeleton className="aspect-square" />
          <div className="space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-32" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <p className="text-muted-foreground">Produto não encontrado.</p>
          <Link to="/"><Button className="mt-4">Voltar</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <Link to="/">
          <Button variant="ghost" className="mb-6 hover:bg-primary/10">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Button>
        </Link>

        <div className="grid lg:grid-cols-2 gap-12">
          <div className="animate-fade-in">
            <Carousel className="w-full">
              <CarouselContent>
                {product.images.map((img, i) => (
                  <CarouselItem key={i}>
                    <div className="aspect-square rounded-lg overflow-hidden bg-card border border-border">
                      <img src={resolveImageUrl(img)} alt={`${product.title} ${i + 1}`} className="w-full h-full object-cover" />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              {product.images.length > 1 && (
                <>
                  <CarouselPrevious className="left-4" />
                  <CarouselNext className="right-4" />
                </>
              )}
            </Carousel>
          </div>

          <div className="space-y-6 animate-slide-up">
            <div>
              <div className="flex gap-2 mb-2">
                <Badge className="bg-primary/90">{product.category}</Badge>
                <Badge variant={product.condition === "new" ? "default" : "secondary"}>
                  {product.condition === "new" ? "Novo" : "Usado"}
                </Badge>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">{product.title}</h1>

              {reviews.length > 0 && (
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-5 w-5 ${i < Math.floor(avgRating) ? "fill-secondary text-secondary" : "fill-muted text-muted"}`} />
                    ))}
                  </div>
                  <span className="text-muted-foreground">
                    {avgRating.toFixed(1)} ({reviews.length} avaliações)
                  </span>
                </div>
              )}

              <div className="text-5xl font-bold bg-gradient-gamer bg-clip-text text-transparent mb-2">
                R$ {product.price.toFixed(2)}
              </div>
              <p className={`text-sm ${product.stock === 0 ? "text-destructive" : "text-muted-foreground"} mb-4`}>
                {product.stock === 0 ? "Esgotado" : `${product.stock} em estoque`}
              </p>
            </div>

            {seller && (
              <Card className="bg-gradient-card border-border">
                <CardContent className="p-4 flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={resolveImageUrl(seller.avatar ?? "")} />
                    <AvatarFallback>{seller.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="text-xs text-muted-foreground">Vendido por</div>
                    <div className="font-semibold flex items-center gap-2">
                      <Store className="h-4 w-4" />{seller.name}
                    </div>
                  </div>
                  <Link to={`/seller/${seller.id}`}>
                    <Button variant="outline" size="sm">Ver anúncios</Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            <Card className="bg-gradient-card border-border">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-3">Descrição</h3>
                <p className="text-muted-foreground leading-relaxed">{product.description}</p>
              </CardContent>
            </Card>

            {product.stock > 0 ? (
              <div className="flex gap-4">
                <div className="flex items-center border border-border rounded-lg overflow-hidden">
                  <Button variant="ghost" size="sm" onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="rounded-none">-</Button>
                  <span className="px-6 font-semibold">{quantity}</span>
                  <Button variant="ghost" size="sm" onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))} className="rounded-none">+</Button>
                </div>
                <Button onClick={handleAdd} className="flex-1 bg-gradient-gamer hover:opacity-90 text-lg h-12 shadow-glow-primary">
                  <ShoppingCart className="mr-2 h-5 w-5" /> Adicionar ao Carrinho
                </Button>
              </div>
            ) : (
              <Button disabled className="w-full text-lg h-12">
                Esgotado
              </Button>
            )}
          </div>
        </div>

        <Card className="bg-gradient-card border-border mt-12">
          <CardContent className="p-6">
            <h3 className="text-2xl font-bold mb-6">Características Técnicas</h3>
            <dl className="grid sm:grid-cols-2 gap-4">
              {Object.entries(product.specs).map(([k, v]) => (
                <div key={k} className="flex justify-between border-b border-border pb-2">
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="font-semibold">{v}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>

        <div className="mt-12">
          <h3 className="text-3xl font-bold mb-6">
            Avaliações dos <span className="text-primary">Clientes</span>
          </h3>

          {user && user.id !== product.sellerId && (
            <Card className="bg-gradient-card border-border mb-6">
              <CardContent className="p-6">
                <h4 className="font-semibold mb-3">Deixe sua avaliação</h4>
                <form onSubmit={handleReviewSubmit} className="space-y-3">
                  <StarRatingInput value={reviewRating} onChange={setReviewRating} />
                  <Textarea
                    placeholder="Conte como foi sua experiência com o produto..."
                    rows={3}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                  />
                  <Button type="submit" disabled={submittingReview} className="bg-gradient-gamer hover:opacity-90">
                    {submittingReview ? "Enviando..." : "Enviar avaliação"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {!user && (
            <Card className="bg-gradient-card border-border mb-6 p-6 text-center">
              <p className="text-muted-foreground">
                <Link to="/auth" className="text-primary hover:underline">Faça login</Link> para avaliar este produto.
              </p>
            </Card>
          )}

          {reviews.length === 0 ? (
            <Card className="bg-gradient-card border-border p-8 text-center">
              <p className="text-muted-foreground">Nenhuma avaliação ainda.</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {reviews.map((r) => (
                <Card key={r.id} className="bg-gradient-card border-border">
                  <CardContent className="p-6 flex gap-4">
                    <Avatar className="border-2 border-primary">
                      <AvatarImage src={resolveImageUrl(r.authorAvatar ?? "")} />
                      <AvatarFallback className="bg-primary/20 text-primary">
                        {r.authorName.split(" ").map((n) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex justify-between mb-2">
                        <h4 className="font-semibold">{r.authorName}</h4>
                        <span className="text-sm text-muted-foreground">
                          {new Date(r.createdAt).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                      <div className="flex mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`h-4 w-4 ${i < r.rating ? "fill-secondary text-secondary" : "fill-muted text-muted"}`} />
                        ))}
                      </div>
                      <p className="text-muted-foreground">{r.comment}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
