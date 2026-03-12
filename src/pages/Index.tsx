import { useState, useMemo } from "react";
import { getRestaurants } from "@/lib/storage";
import { RestaurantCard } from "@/components/RestaurantCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, UtensilsCrossed } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Index = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "return" | "avoid">("all");
  const restaurants = getRestaurants();

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
    if (filter === "return") result = result.filter((r) => r.wouldReturn);
    if (filter === "avoid") result = result.filter((r) => !r.wouldReturn);
    return result.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [restaurants, search, filter]);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container max-w-3xl py-8">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <UtensilsCrossed className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">TasteVault</h1>
              <p className="text-sm text-muted-foreground">Your personal restaurant journal</p>
            </div>
          </motion.div>
        </div>
      </header>

      {/* Content */}
      <main className="container max-w-3xl py-6 space-y-5">
        {/* Search & Filter bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search restaurants, cuisines, locations..."
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            {(["all", "return", "avoid"] as const).map((f) => (
              <Button
                key={f}
                variant={filter === f ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(f)}
              >
                {f === "all" ? "All" : f === "return" ? "Would Return" : "Avoid"}
              </Button>
            ))}
          </div>
        </div>

        {/* Add button */}
        <Button onClick={() => navigate("/add")} className="gap-2 w-full sm:w-auto">
          <Plus className="w-4 h-4" /> Add Restaurant
        </Button>

        {/* List */}
        {filtered.length > 0 ? (
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
              {search || filter !== "all" ? "No restaurants found" : "No restaurants yet"}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {search || filter !== "all"
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
