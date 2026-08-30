import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import { resolveImageUrl } from "@/lib/api";
import type { User } from "@/types/user";

interface SellerCardProps {
  seller: User;
}

const SellerCard = ({ seller }: SellerCardProps) => {
  return (
    <Link to={`/seller/${seller.id}`}>
      <Card className="group overflow-hidden border-border bg-gradient-card hover:border-primary/50 transition-all duration-300 hover:shadow-glow-primary animate-fade-in">
        <CardContent className="p-6 flex flex-col items-center text-center gap-3">
          <Avatar className="h-20 w-20 border-2 border-primary">
            <AvatarImage src={resolveImageUrl(seller.avatar ?? "")} />
            <AvatarFallback className="text-2xl">{seller.name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-bold group-hover:text-primary transition-colors">{seller.name}</h3>
            <div className="flex items-center justify-center gap-1 mt-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${i < Math.floor(seller.rating) ? "fill-secondary text-secondary" : "fill-muted text-muted"}`}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">{seller.rating.toFixed(1)}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default SellerCard;
