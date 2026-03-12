import { useState } from "react";
import { Restaurant, Dish } from "@/lib/types";
import { StarRating } from "./StarRating";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Save } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface RestaurantFormProps {
  initial?: Restaurant;
  onSave: (restaurant: Restaurant) => void;
  onCancel: () => void;
}

export function RestaurantForm({ initial, onSave, onCancel }: RestaurantFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [cuisine, setCuisine] = useState(initial?.cuisine ?? "");
  const [location, setLocation] = useState(initial?.location ?? "");
  const [overallRating, setOverallRating] = useState(initial?.overallRating ?? 3);
  const [environmentRating, setEnvironmentRating] = useState(initial?.environmentRating ?? 3);
  const [wouldReturn, setWouldReturn] = useState(initial?.wouldReturn ?? true);
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [dishes, setDishes] = useState<Dish[]>(initial?.dishes ?? []);

  const addDish = () => {
    setDishes([...dishes, { id: crypto.randomUUID(), name: "", rating: 3, notes: "" }]);
  };

  const updateDish = (id: string, updates: Partial<Dish>) => {
    setDishes(dishes.map((d) => (d.id === id ? { ...d, ...updates } : d)));
  };

  const removeDish = (id: string) => {
    setDishes(dishes.filter((d) => d.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const now = new Date().toISOString();
    onSave({
      id: initial?.id ?? crypto.randomUUID(),
      name: name.trim(),
      cuisine: cuisine.trim(),
      location: location.trim(),
      overallRating,
      environmentRating,
      wouldReturn,
      notes: notes.trim(),
      dishes: dishes.filter((d) => d.name.trim()),
      createdAt: initial?.createdAt ?? now,
      updatedAt: now,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Restaurant Name *</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Sushi Nakazawa" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cuisine">Cuisine</Label>
          <Input id="cuisine" value={cuisine} onChange={(e) => setCuisine(e.target.value)} placeholder="e.g. Japanese" />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="location">Location</Label>
          <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. West Village, NYC" />
        </div>
      </div>

      <div className="flex flex-wrap gap-6">
        <div className="space-y-2">
          <Label>Overall Rating</Label>
          <StarRating rating={overallRating} onChange={setOverallRating} size="lg" />
        </div>
        <div className="space-y-2">
          <Label>Ambiance / Environment</Label>
          <StarRating rating={environmentRating} onChange={setEnvironmentRating} size="lg" />
        </div>
        <div className="space-y-2">
          <Label>Would Return?</Label>
          <div className="flex items-center gap-2 pt-1">
            <Switch checked={wouldReturn} onCheckedChange={setWouldReturn} />
            <span className="text-sm text-muted-foreground">{wouldReturn ? "Yes" : "No"}</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="General impressions, service quality, price range..." rows={3} />
      </div>

      {/* Dishes */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-base">Dishes</Label>
          <Button type="button" variant="outline" size="sm" onClick={addDish}>
            <Plus className="w-4 h-4 mr-1" /> Add Dish
          </Button>
        </div>
        <AnimatePresence>
          {dishes.map((dish) => (
            <motion.div
              key={dish.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="rounded-lg border bg-secondary/50 p-4 space-y-3"
            >
              <div className="flex items-start gap-3">
                <div className="flex-1 space-y-3">
                  <Input
                    value={dish.name}
                    onChange={(e) => updateDish(dish.id, { name: e.target.value })}
                    placeholder="Dish name"
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Rating:</span>
                    <StarRating rating={dish.rating} onChange={(r) => updateDish(dish.id, { rating: r })} size="sm" />
                  </div>
                  <Input
                    value={dish.notes}
                    onChange={(e) => updateDish(dish.id, { notes: e.target.value })}
                    placeholder="Notes about this dish..."
                  />
                </div>
                <Button type="button" variant="ghost" size="icon" onClick={() => removeDish(dish.id)} className="text-destructive shrink-0">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" className="gap-2">
          <Save className="w-4 h-4" /> {initial ? "Update" : "Save"} Restaurant
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
