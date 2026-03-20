import { useState } from "react";
import { Visit, VisitDish } from "@/lib/types";
import { uploadDishImage } from "@/lib/storage";
import { StarRating } from "./StarRating";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Save, ThumbsUp, ThumbsDown, Camera } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface VisitFormProps {
  restaurantId: string;
  initial?: Visit;
  onSave: (visit: Visit) => void;
  onCancel: () => void;
}

export function VisitForm({ restaurantId, initial, onSave, onCancel }: VisitFormProps) {
  const [date, setDate] = useState(initial?.date ? initial.date.slice(0, 10) : new Date().toISOString().slice(0, 10));
  const [overallRating, setOverallRating] = useState(initial?.overallRating ?? 3);
  const [ambianceRating, setAmbianceRating] = useState(initial?.ambianceRating ?? 3);
  const [serviceRating, setServiceRating] = useState(initial?.serviceRating ?? 3);
  const [wouldReturn, setWouldReturn] = useState(initial?.wouldReturn ?? true);
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [dishes, setDishes] = useState<VisitDish[]>(initial?.dishes ?? []);
  const [pendingImages, setPendingImages] = useState<Record<string, File>>({});
  const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({});

  const addDish = () => {
    setDishes([
      ...dishes,
      { id: crypto.randomUUID(), dishId: crypto.randomUUID(), dishName: "", rating: 3, wouldReorder: true, notes: "" },
    ]);
  };

  const updateDish = (id: string, updates: Partial<VisitDish>) => {
    setDishes(dishes.map((d) => (d.id === id ? { ...d, ...updates } : d)));
  };

  const removeDish = (id: string) => {
    setDishes(dishes.filter((d) => d.id !== id));
  };

  const handleImageSelect = (dishId: string, file: File) => {
    setPendingImages((prev) => ({ ...prev, [dishId]: file }));
    const url = URL.createObjectURL(file);
    setPreviewUrls((prev) => ({ ...prev, [dishId]: url }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date().toISOString();
    const filtered = dishes.filter((d) => d.dishName.trim());
    const uploadedDishes = await Promise.all(
      filtered.map(async (d) => {
        if (pendingImages[d.id]) {
          const url = await uploadDishImage(d.id, pendingImages[d.id]);
          return { ...d, imageUrl: url };
        }
        return d;
      })
    );
    onSave({
      id: initial?.id ?? crypto.randomUUID(),
      restaurantId,
      date: new Date(date).toISOString(),
      overallRating,
      ambianceRating,
      serviceRating,
      wouldReturn,
      notes: notes.trim(),
      dishes: uploadedDishes,
      createdAt: initial?.createdAt ?? now,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="visit-date">Visit Date</Label>
        <Input id="visit-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>

      <div className="flex flex-wrap gap-6">
        <div className="space-y-2">
          <Label>Overall</Label>
          <StarRating rating={overallRating} onChange={setOverallRating} size="lg" />
        </div>
        <div className="space-y-2">
          <Label>Ambiance</Label>
          <StarRating rating={ambianceRating} onChange={setAmbianceRating} size="lg" />
        </div>
        <div className="space-y-2">
          <Label>Service</Label>
          <StarRating rating={serviceRating} onChange={setServiceRating} size="lg" />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Would Return?</Label>
        <div className="flex items-center gap-2 pt-1">
          <Switch checked={wouldReturn} onCheckedChange={setWouldReturn} />
          <span className="text-sm text-muted-foreground">{wouldReturn ? "Yes, would go back" : "No, would not return"}</span>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="visit-notes">Notes</Label>
        <Textarea
          id="visit-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="What future me should remember about this visit..."
          rows={3}
        />
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
                    value={dish.dishName}
                    onChange={(e) => updateDish(dish.id, { dishName: e.target.value })}
                    placeholder="Dish name"
                  />
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Rating:</span>
                      <StarRating rating={dish.rating} onChange={(r) => updateDish(dish.id, { rating: r })} size="sm" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant={dish.wouldReorder ? "default" : "outline"}
                        onClick={() => updateDish(dish.id, { wouldReorder: true })}
                        className="gap-1 h-7 text-xs"
                      >
                        <ThumbsUp className="w-3 h-3" /> Reorder
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant={!dish.wouldReorder ? "destructive" : "outline"}
                        onClick={() => updateDish(dish.id, { wouldReorder: false })}
                        className="gap-1 h-7 text-xs"
                      >
                        <ThumbsDown className="w-3 h-3" /> Avoid
                      </Button>
                    </div>
                  </div>
                  <Input
                    value={dish.notes}
                    onChange={(e) => updateDish(dish.id, { notes: e.target.value })}
                    placeholder="Notes about this dish..."
                  />
                  <div className="flex items-center gap-3">
                    {(previewUrls[dish.id] || dish.imageUrl) && (
                      <img
                        src={previewUrls[dish.id] || dish.imageUrl}
                        alt="dish preview"
                        className="w-16 h-16 rounded object-cover border"
                      />
                    )}
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageSelect(dish.id, file);
                        }}
                      />
                      <span className="inline-flex items-center gap-1.5 rounded border px-2 py-1 text-xs text-muted-foreground hover:bg-secondary transition-colors">
                        <Camera className="w-3.5 h-3.5" />
                        {previewUrls[dish.id] || dish.imageUrl ? "Change photo" : "Add photo"}
                      </span>
                    </label>
                  </div>
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
          <Save className="w-4 h-4" /> {initial ? "Update" : "Save"} Visit
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
