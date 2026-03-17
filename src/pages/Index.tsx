import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getRestaurants } from "@/lib/storage";
import { RestaurantCard } from "@/components/RestaurantCard";
import { StarRating } from "@/components/StarRating";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, UtensilsCrossed, LogOut, Bookmark, ThumbsUp, ThumbsDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { getOverallVerdict, PriceRange } from "@/lib/types";
import { useAuth } from "@/lib/AuthContext";


type Tab = "visited" | "wishlist" | "dishes";

interface DishResult {
  dishName: string;
  restaurantId: string;
  restaurantName: string;
  avgRating: number;
  wouldReorder: boolean;
  count: number;
}

const Index = () => {
  const navigate = useNavigate();
  const { signOut, user } = useAuth();

  const [tab, setTab] = useState<Tab>("visited");
  const [search, setSearch] = useState("");
  const [dishSearch, setDishSearch] = useState("");
  const [verdictFilter, setVerdictFilter] = useState<"all" | "return" | "mixed" | "avoid">("all");
  const [priceFilter, setPriceFilter] = useState<PriceRange | "all">("all");

  const { data: restaurants = [], isLoading } = useQuery({
    queryKey: ["restaurants"],
    queryFn: getRestaurants,
  });

  const visitedRestaurants = useMemo(
    () => restaurants.filter((r) => !r.isWishlist),
    [restaurants]
  );

  const wishlistRestaurants = useMemo(
    () => restaurants.filter((r) => r.isWishlist),
    [restaurants]
  );

  const filteredVisited = useMemo(() => {
    let result = visitedRestaurants;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.cuisine.toLowerCase().includes(q) ||
          r.location.toLowerCase().includes(q)
      );
    }
    if (verdictFilter !== "all") {
      result = result.filter((r) => getOverallVerdict(r) === verdictFilter);
    }
    if (priceFilter !== "all") {
      result = result.filter((r) => r.priceRange === priceFilter);
    }
    return result;
  }, [visitedRestaurants, search, verdictFilter, priceFilter]);

  const filteredWishlist = useMemo(() => {
    if (!search) return wishlistRestaurants;
    const q = search.toLowerCase();
    return wishlistRestaurants.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.cuisine.toLowerCase().includes(q) ||
        r.location.toLowerCase().includes(q)
    );
  }, [wishlistRestaurants, search]);

  // Aggregate dishes across all visited restaurants
  const dishResults = useMemo<DishResult[]>(() => {
    const map = new Map<string, DishResult>();
    for (const r of visitedRestaurants) {
      for (const v of r.visits) {
        for (const d of v.dishes) {
          const key = `${d.dishName}::${r.id}`;
          const existing = map.get(key);
          if (existing) {
            existing.avgRating = (existing.avgRating * existing.count + d.rating) / (existing.count + 1);
            existing.count += 1;
            // If any entry says reorder, mark as reorder
            existing.wouldReorder = existing.wouldReorder || d.wouldReorder;
          } else {
            map.set(key, {
              dishName: d.dishName,
              restaurantId: r.id,
              restaurantName: r.name,
              avgRating: d.rating,
              wouldReorder: d.wouldReorder,
              count: 1,
            });
          }
        }
      }
    }
    return Array.from(map.values()).sort((a, b) => b.avgRating - a.avgRating);
  }, [visitedRestaurants]);

  const filteredDishes = useMemo(() => {
    if (!dishSearch.trim()) return dishResults;
    const q = dishSearch.toLowerCase();
    return dishResults.filter(
      (d) =>
        d.dishName.toLowerCase().includes(q) ||
        d.restaurantName.toLowerCase().includes(q)
    );
  }, [dishResults, dishSearch]);

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: "visited", label: "Visited", count: visitedRestaurants.length },
    { id: "wishlist", label: "Wishlist", count: wishlistRestaurants.length },
    { id: "dishes", label: "Dishes", count: dishResults.length },
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container max-w-3xl py-8">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <UtensilsCrossed className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">DishLog</h1>
                <p className="text-sm text-muted-foreground">Your personal restaurant memory</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground hidden sm:block">{user?.email}</span>
              <Button variant="ghost" size="sm" onClick={signOut} className="gap-1.5 text-muted-foreground">
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign out</span>
              </Button>
            </div>
          </motion.div>
        </div>
      </header>

      {/* Content */}
      <main className="container max-w-3xl py-6 space-y-5">
        {/* Tabs */}
        <div className="flex rounded-md border p-1 gap-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`flex-1 rounded py-2 text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${
                tab === t.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setTab(t.id)}
            >
              {t.id === "wishlist" && <Bookmark className="w-3.5 h-3.5" />}
              {t.label}
              <span className={`text-xs rounded-full px-1.5 py-0.5 ${tab === t.id ? "bg-primary-foreground/20" : "bg-muted"}`}>
                {t.count}
              </span>
            </button>
          ))}
        </div>

        {/* Dish Search Tab */}
        {tab === "dishes" && (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={dishSearch}
                onChange={(e) => setDishSearch(e.target.value)}
                placeholder="Search dishes or restaurants..."
                className="pl-9"
                autoFocus
              />
            </div>

            {filteredDishes.length > 0 ? (
              <div className="grid gap-2">
                {filteredDishes.map((d, i) => (
                  <motion.div
                    key={`${d.dishName}::${d.restaurantId}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => navigate(`/restaurant/${d.restaurantId}`)}
                    className="cursor-pointer rounded-lg border bg-card p-4 flex items-center justify-between hover:shadow-md hover:border-primary/30 transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {d.wouldReorder ? (
                        <ThumbsUp className="w-4 h-4 text-accent shrink-0" />
                      ) : (
                        <ThumbsDown className="w-4 h-4 text-destructive shrink-0" />
                      )}
                      <div className="min-w-0">
                        <p className="font-medium truncate">{d.dishName}</p>
                        <p className="text-xs text-muted-foreground truncate">{d.restaurantName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-3">
                      {d.count > 1 && (
                        <span className="text-xs text-muted-foreground">×{d.count}</span>
                      )}
                      <StarRating rating={Math.round(d.avgRating)} readonly size="sm" />
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <UtensilsCrossed className="w-10 h-10 text-muted-foreground/40 mb-3" />
                <p className="text-sm text-muted-foreground">
                  {dishSearch ? "No dishes found" : "No dish data yet — log visits with dishes to see them here"}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Visited / Wishlist Tabs */}
        {tab !== "dishes" && (
          <>
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={tab === "visited" ? "Search restaurants, cuisines, neighborhoods..." : "Search wishlist..."}
                className="pl-9"
              />
            </div>

            {/* Filters (visited only) */}
            {tab === "visited" && (
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex gap-2 flex-wrap">
                  {(["all", "return", "mixed", "avoid"] as const).map((f) => (
                    <Button
                      key={f}
                      variant={verdictFilter === f ? "default" : "outline"}
                      size="sm"
                      onClick={() => setVerdictFilter(f)}
                    >
                      {f === "all" ? "All" : f === "return" ? "Would Return" : f === "mixed" ? "Mixed" : "Avoid"}
                    </Button>
                  ))}
                </div>
                <div className="flex gap-2">
                  {(["all", "$", "$$", "$$$", "$$$$"] as const).map((p) => (
                    <Button
                      key={p}
                      variant={priceFilter === p ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPriceFilter(p)}
                    >
                      {p === "all" ? "Any Price" : p}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Add button */}
            <Button onClick={() => navigate("/add")} className="gap-2 w-full sm:w-auto">
              <Plus className="w-4 h-4" />
              {tab === "wishlist" ? "Add to Wishlist" : "Add Restaurant"}
            </Button>

            {/* List */}
            {isLoading ? (
              <div className="flex flex-col gap-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-28 rounded-lg border bg-card animate-pulse" />
                ))}
              </div>
            ) : (tab === "visited" ? filteredVisited : filteredWishlist).length > 0 ? (
              <div className="grid gap-3">
                {(tab === "visited" ? filteredVisited : filteredWishlist).map((r, i) => (
                  <RestaurantCard key={r.id} restaurant={r} index={i} />
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-20 text-center"
              >
                {tab === "wishlist" ? (
                  <Bookmark className="w-12 h-12 text-muted-foreground/40 mb-4" />
                ) : (
                  <UtensilsCrossed className="w-12 h-12 text-muted-foreground/40 mb-4" />
                )}
                <h2 className="text-xl font-display font-semibold text-muted-foreground">
                  {search || verdictFilter !== "all" || priceFilter !== "all"
                    ? "No restaurants found"
                    : tab === "wishlist"
                    ? "Your wishlist is empty"
                    : "No restaurants yet"}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {search || verdictFilter !== "all" || priceFilter !== "all"
                    ? "Try adjusting your search or filters"
                    : tab === "wishlist"
                    ? "Add restaurants you want to try"
                    : "Start by adding your first dining experience"}
                </p>
              </motion.div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Index;
