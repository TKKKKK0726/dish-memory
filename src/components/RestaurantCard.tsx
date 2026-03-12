import { Restaurant } from "@/lib/types";
import { StarRating } from "./StarRating";
import { Badge } from "@/components/ui/badge";
import { MapPin, Utensils, ThumbsUp, ThumbsDown } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

interface RestaurantCardProps {
  restaurant: Restaurant;
  index: number;
}

export function RestaurantCard({ restaurant, index }: RestaurantCardProps) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      onClick={() => navigate(`/restaurant/${restaurant.id}`)}
      className="group cursor-pointer rounded-lg border bg-card p-5 transition-all hover:shadow-lg hover:border-primary/30"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-lg font-semibold truncate text-card-foreground">
            {restaurant.name}
          </h3>
          <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Utensils className="w-3.5 h-3.5" />
              {restaurant.cuisine}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {restaurant.location}
            </span>
          </div>
        </div>
        <Badge
          variant={restaurant.wouldReturn ? "default" : "destructive"}
          className="shrink-0 flex items-center gap-1"
        >
          {restaurant.wouldReturn ? (
            <><ThumbsUp className="w-3 h-3" /> Return</>
          ) : (
            <><ThumbsDown className="w-3 h-3" /> Avoid</>
          )}
        </Badge>
      </div>

      <div className="mt-3 flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground">Overall</span>
          <StarRating rating={restaurant.overallRating} size="sm" readonly />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground">Ambiance</span>
          <StarRating rating={restaurant.environmentRating} size="sm" readonly />
        </div>
      </div>

      {restaurant.dishes.length > 0 && (
        <p className="mt-2 text-xs text-muted-foreground">
          {restaurant.dishes.length} dish{restaurant.dishes.length !== 1 ? "es" : ""} rated
        </p>
      )}
    </motion.div>
  );
}
