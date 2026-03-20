import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { getPublicRestaurants } from "@/lib/storage";
import { getAverageRating, getOverallVerdict, getReorderDishes } from "@/lib/types";
import { StarRating } from "@/components/StarRating";
import { Badge } from "@/components/ui/badge";
import { UtensilsCrossed, MapPin, Utensils, ThumbsUp, ThumbsDown, AlertTriangle, DollarSign, CalendarDays } from "lucide-react";
import { motion } from "framer-motion";

export default function Share() {
  const { userId } = useParams<{ userId: string }>();

  const { data: restaurants = [], isLoading, isError } = useQuery({
    queryKey: ["share", userId],
    queryFn: () => getPublicRestaurants(userId!),
    enabled: !!userId,
  });

  const verdictConfig = {
    return: { label: "Worth Revisiting", icon: ThumbsUp, variant: "default" as const },
    mixed: { label: "Mixed", icon: AlertTriangle, variant: "secondary" as const },
    avoid: { label: "Avoid", icon: ThumbsDown, variant: "destructive" as const },
    none: { label: "No Visits", icon: Utensils, variant: "outline" as const },
  };

  return (
    <div className="min-h-screen">
      <header className="border-b bg-card">
        <div className="container max-w-3xl py-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <UtensilsCrossed className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">DishLog</h1>
              <p className="text-sm text-muted-foreground">Shared restaurant list</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container max-w-3xl py-6 space-y-4">
        {isLoading && (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 rounded-lg border bg-card animate-pulse" />
            ))}
          </div>
        )}

        {isError && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <UtensilsCrossed className="w-12 h-12 text-muted-foreground/40 mb-4" />
            <p className="text-muted-foreground">Could not load this shared list.</p>
          </div>
        )}

        {!isLoading && !isError && restaurants.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <UtensilsCrossed className="w-12 h-12 text-muted-foreground/40 mb-4" />
            <p className="text-muted-foreground">No restaurants in this shared list yet.</p>
          </div>
        )}

        {restaurants.map((restaurant, i) => {
          const avgRating = getAverageRating(restaurant);
          const verdict = getOverallVerdict(restaurant);
          const topDishes = getReorderDishes(restaurant).slice(0, 2);
          const latestVisit = restaurant.visits.reduce<string | null>((latest, v) =>
            !latest || v.date > latest ? v.date : latest, null);
          const v = verdictConfig[verdict];

          return (
            <motion.div
              key={restaurant.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              className="rounded-lg border bg-card p-5"
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
                <Badge variant={v.variant} className="shrink-0 flex items-center gap-1">
                  <v.icon className="w-3 h-3" /> {v.label}
                </Badge>
              </div>

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
                    {new Date(latestVisit).toLocaleDateString()}
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

              {restaurant.notes && (
                <p className="mt-2 text-xs text-muted-foreground italic">{restaurant.notes}</p>
              )}
            </motion.div>
          );
        })}
      </main>
    </div>
  );
}
