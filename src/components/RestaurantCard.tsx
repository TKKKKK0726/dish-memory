import { Restaurant, getAverageRating, getOverallVerdict, getReorderDishes, getLatestVisit } from "@/lib/types";
import { StarRating } from "./StarRating";
import { Badge } from "@/components/ui/badge";
import { MapPin, Utensils, ThumbsUp, ThumbsDown, AlertTriangle, DollarSign, CalendarDays, Bookmark } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

interface RestaurantCardProps {
  restaurant: Restaurant;
  index: number;
}

export function RestaurantCard({ restaurant, index }: RestaurantCardProps) {
  const navigate = useNavigate();
  const avgRating = getAverageRating(restaurant);
  const verdict = getOverallVerdict(restaurant);
  const topDishes = getReorderDishes(restaurant).slice(0, 2);
  const latestVisit = getLatestVisit(restaurant);

  const verdictConfig = {
    return: { label: "Worth Revisiting", icon: ThumbsUp, variant: "default" as const },
    mixed: { label: "Mixed", icon: AlertTriangle, variant: "secondary" as const },
    avoid: { label: "Avoid", icon: ThumbsDown, variant: "destructive" as const },
    none: { label: "No Visits", icon: Utensils, variant: "outline" as const },
  };

  const v = verdictConfig[verdict];

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
          <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            {restaurant.cuisine && (
              <span className="flex items-center gap-1">
                <Utensils className="w-3.5 h-3.5" />
                {restaurant.cuisine}
              </span>
            )}
            {restaurant.location && (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.location)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-primary transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <MapPin className="w-3.5 h-3.5" />
                {restaurant.location}
              </a>
            )}
            <span className="flex items-center gap-0.5">
              <DollarSign className="w-3.5 h-3.5" />
              {restaurant.priceRange}
            </span>
          </div>
        </div>
        {restaurant.isWishlist ? (
          <Badge variant="outline" className="shrink-0 flex items-center gap-1 border-primary/40 text-primary">
            <Bookmark className="w-3 h-3" /> Wishlist
          </Badge>
        ) : (
          <Badge variant={v.variant} className="shrink-0 flex items-center gap-1">
            <v.icon className="w-3 h-3" /> {v.label}
          </Badge>
        )}
      </div>

      {restaurant.isWishlist ? (
        <p className="mt-3 text-xs text-muted-foreground italic">
          {restaurant.notes || "Want to try this place"}
        </p>
      ) : (
        <>
          <div className="mt-3 flex items-center gap-4">
            {avgRating > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground">Avg</span>
                <StarRating rating={Math.round(avgRating)} size="sm" readonly />
              </div>
            )}
            <span className="text-xs text-muted-foreground">
              {restaurant.visits.length} visit{restaurant.visits.length !== 1 ? "s" : ""}
            </span>
            {latestVisit && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <CalendarDays className="w-3 h-3" />
                {new Date(latestVisit.date).toLocaleDateString()}
              </span>
            )}
          </div>

          {topDishes.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {topDishes.map((d) => (
                <span key={d.name} className="inline-flex items-center gap-1 rounded-full bg-accent/15 px-2 py-0.5 text-xs text-accent-foreground">
                  <ThumbsUp className="w-2.5 h-2.5 text-accent" /> {d.name}
                </span>
              ))}
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}
