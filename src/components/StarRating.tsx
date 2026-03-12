import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  onChange?: (rating: number) => void;
  size?: "sm" | "md" | "lg";
  readonly?: boolean;
}

const sizes = { sm: "w-4 h-4", md: "w-5 h-5", lg: "w-6 h-6" };

export function StarRating({ rating, onChange, size = "md", readonly = false }: StarRatingProps) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          className={cn(
            "transition-colors",
            readonly ? "cursor-default" : "cursor-pointer hover:scale-110"
          )}
        >
          <Star
            className={cn(
              sizes[size],
              star <= rating
                ? "fill-star text-star"
                : "fill-transparent text-star-empty"
            )}
          />
        </button>
      ))}
    </div>
  );
}
