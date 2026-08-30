import { Star } from "lucide-react";

interface StarRatingInputProps {
  value: number;
  onChange: (value: number) => void;
}

export function StarRatingInput({ value, onChange }: StarRatingInputProps) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button key={star} type="button" onClick={() => onChange(star)} className="p-0.5">
          <Star className={`h-6 w-6 ${star <= value ? "fill-secondary text-secondary" : "fill-muted text-muted"}`} />
        </button>
      ))}
    </div>
  );
}
