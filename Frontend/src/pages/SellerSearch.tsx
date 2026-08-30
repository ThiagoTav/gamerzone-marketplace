import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import SellerCard from "@/components/SellerCard";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Search } from "lucide-react";
import { userService } from "@/services/userService";
import { Skeleton } from "@/components/ui/skeleton";
import type { User } from "@/types/user";

const SellerSearch = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [sellers, setSellers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const query = searchParams.get("search") || "";

  useEffect(() => {
    setLoading(true);
    userService.searchSellers(query).then((data) => {
      setSellers(data);
      setLoading(false);
    });
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams(search ? { search } : {});
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="py-8 container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-6">
          Buscar <span className="text-primary">Vendedores</span>
        </h1>

        <form onSubmit={handleSearch} className="max-w-xl mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome..."
              className="pl-10 bg-card border-border focus:border-primary"
            />
          </div>
        </form>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        ) : sellers.length === 0 ? (
          <Card className="p-12 text-center bg-gradient-card">
            <p className="text-muted-foreground">Nenhum vendedor encontrado.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {sellers.map((s) => (
              <SellerCard key={s.id} seller={s} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default SellerSearch;
