import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { productService, ProductFilters } from "@/services/productService";
import { CATEGORIES, Product } from "@/mocks/products";
import { Skeleton } from "@/components/ui/skeleton";

const Index = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<string>("");
  const [condition, setCondition] = useState<"" | "new" | "used">("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const search = searchParams.get("search") || "";

  useEffect(() => {
    const filters: ProductFilters = { search };
    if (category) filters.category = category;
    if (condition) filters.condition = condition;
    if (minPrice) filters.minPrice = Number(minPrice);
    if (maxPrice) filters.maxPrice = Number(maxPrice);

    setLoading(true);
    productService.getAll(filters).then((data) => {
      setProducts(data);
      setLoading(false);
    });
  }, [search, category, condition, minPrice, maxPrice]);

  const clearFilters = () => {
    setCategory("");
    setCondition("");
    setMinPrice("");
    setMaxPrice("");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="relative overflow-hidden bg-gradient-gamer">
        <div className="container mx-auto px-4 py-16 relative">
          <div className="max-w-3xl animate-slide-up">
            <h1 className="text-4xl md:text-6xl font-black mb-4 text-white leading-tight">
              Marketplace Gamer
              <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-white to-accent">
                Compre e Venda Setups
              </span>
            </h1>
            <p className="text-lg text-white/90">
              Milhares de equipamentos gamer de vendedores verificados
            </p>
          </div>
        </div>
      </section>

      <section className="py-8 container mx-auto px-4">
        <div className="grid lg:grid-cols-[280px_1fr] gap-6">
          <aside className="space-y-4">
            <Card className="bg-gradient-card border-border">
              <CardContent className="p-4 space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold">Filtros</h3>
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="h-7 text-xs">
                      Limpar
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="mb-2 block">Categoria</Label>
                  <div className="space-y-1">
                    <Button
                      variant={category === "" ? "default" : "ghost"}
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => setCategory("")}
                    >
                      Todas
                    </Button>
                    {CATEGORIES.map((c) => (
                      <Button
                        key={c}
                        variant={category === c ? "default" : "ghost"}
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => setCategory(c)}
                      >
                        {c}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="mb-2 block">Condição</Label>
                  <RadioGroup value={condition} onValueChange={(v) => setCondition(v as any)}>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="" id="all" />
                      <Label htmlFor="all" className="cursor-pointer">Todos</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="new" id="new" />
                      <Label htmlFor="new" className="cursor-pointer">Novo</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="used" id="used" />
                      <Label htmlFor="used" className="cursor-pointer">Usado</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label className="mb-2 block">Faixa de Preço</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </aside>

          <div>
            <div className="mb-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold">
                {search ? `Resultados para "${search}"` : "Produtos em Destaque"}
              </h2>
              <span className="text-sm text-muted-foreground">{products.length} produto(s)</span>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-96" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <Card className="p-12 text-center bg-gradient-card">
                <p className="text-muted-foreground">Nenhum produto encontrado.</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
