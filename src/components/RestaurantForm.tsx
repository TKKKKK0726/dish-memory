import { useState } from "react";
import { Restaurant, PriceRange } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Save } from "lucide-react";

interface RestaurantFormProps {
  initial?: Restaurant;
  onSave: (restaurant: Restaurant) => void;
  onCancel: () => void;
}

export function RestaurantForm({ initial, onSave, onCancel }: RestaurantFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [cuisine, setCuisine] = useState(initial?.cuisine ?? "");
  const [location, setLocation] = useState(initial?.location ?? "");
  const [priceRange, setPriceRange] = useState<PriceRange>(initial?.priceRange ?? "$$");
  const [notes, setNotes] = useState(initial?.notes ?? "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const now = new Date().toISOString();
    onSave({
      id: initial?.id ?? crypto.randomUUID(),
      name: name.trim(),
      cuisine: cuisine.trim(),
      location: location.trim(),
      priceRange,
      notes: notes.trim(),
      visits: initial?.visits ?? [],
      createdAt: initial?.createdAt ?? now,
      updatedAt: now,
    });
  };

  const priceOptions: PriceRange[] = ["$", "$$", "$$$", "$$$$"];

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
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. West Village, NYC" />
        </div>
        <div className="space-y-2">
          <Label>Price Range</Label>
          <div className="flex gap-2">
            {priceOptions.map((p) => (
              <Button
                key={p}
                type="button"
                variant={priceRange === p ? "default" : "outline"}
                size="sm"
                onClick={() => setPriceRange(p)}
                className="flex-1"
              >
                {p}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="General impressions, location details, reservation tips..." rows={3} />
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" className="gap-2">
          <Save className="w-4 h-4" /> {initial ? "Update" : "Create"} Restaurant
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
