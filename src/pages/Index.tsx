import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getRestaurants } from "@/lib/storage";
import { RestaurantCard } from "@/components/RestaurantCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, UtensilsCrossed, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { getOverallVerdict, PriceRange } from "@/lib/types";
import { useAuth } from "@/lib/AuthContext";

const Index = () => {
  const navigate = useNavigate();
  const { signOut, user } = useAuth();

  const [search, setSearch] = useState("");
  const [verdictFilter, setVerdictFilter] = useState<"all" | "return" | "mixed" | "avoid">("all");
  const [priceFilter, setPriceFilter] = useState<PriceRange | "all">("all");

  const { data: restaurants = [], isLoading } = useQuery({
    queryKey: ["restaurants"],
    queryFn: getRestaurants,
  });

  const filtered = useMemo(() => {
    let result = restaurants;
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
  }, [restaurants, search, verdictFilter, priceFilter]);

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
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search restaurants, cuisines, neighborhoods..."
            className="pl-9"
          />
        </div>

        {/* Filters */}
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

        {/* Add button */}
        <Button onClick={() => navigate("/add")} className="gap-2 w-full sm:w-auto">
          <Plus className="w-4 h-4" /> Add Restaurant
        </Button>

        {/* List */}
        {isLoading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 rounded-lg border bg-card animate-pulse" />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid gap-3">
            {filtered.map((r, i) => (
              <RestaurantCard key={r.id} restaurant={r} index={i} />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <UtensilsCrossed className="w-12 h-12 text-muted-foreground/40 mb-4" />
            <h2 className="text-xl font-display font-semibold text-muted-foreground">
              {search || verdictFilter !== "all" || priceFilter !== "all"
                ? "No restaurants found"
                : "No restaurants yet"}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {search || verdictFilter !== "all" || priceFilter !== "all"
                ? "Try adjusting your search or filters"
                : "Start by adding your first dining experience"}
            </p>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default Index;
