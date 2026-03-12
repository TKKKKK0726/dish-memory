import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getRestaurant, saveRestaurant, deleteRestaurant } from "@/lib/storage";
import { RestaurantForm } from "@/components/RestaurantForm";
import { StarRating } from "@/components/StarRating";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, Edit, Trash2, MapPin, Utensils, ThumbsUp, ThumbsDown, CalendarDays } from "lucide-react";
import { Restaurant } from "@/lib/types";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function RestaurantDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [restaurant, setRestaurant] = useState(() => getRestaurant(id!));

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-display font-semibold">Restaurant not found</h2>
          <Button variant="outline" className="mt-4" onClick={() => navigate("/")}>Go Home</Button>
        </div>
      </div>
    );
  }

  const handleSave = (updated: Restaurant) => {
    saveRestaurant(updated);
    setRestaurant(updated);
    setEditing(false);
    toast.success("Restaurant updated!");
  };

  const handleDelete = () => {
    deleteRestaurant(restaurant.id);
    toast.success("Restaurant deleted");
    navigate("/");
  };

  if (editing) {
    return (
      <div className="min-h-screen">
        <header className="border-b bg-card">
          <div className="container max-w-3xl py-6">
            <h1 className="text-2xl font-bold tracking-tight">Edit Restaurant</h1>
          </div>
        </header>
        <main className="container max-w-3xl py-6">
          <RestaurantForm initial={restaurant} onSave={handleSave} onCancel={() => setEditing(false)} />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="border-b bg-card">
        <div className="container max-w-3xl py-6">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="mb-3 -ml-2 gap-1 text-muted-foreground">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{restaurant.name}</h1>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                {restaurant.cuisine && (
                  <span className="flex items-center gap-1"><Utensils className="w-3.5 h-3.5" />{restaurant.cuisine}</span>
                )}
                {restaurant.location && (
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{restaurant.location}</span>
                )}
                <span className="flex items-center gap-1">
                  <CalendarDays className="w-3.5 h-3.5" />
                  {new Date(restaurant.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            <Badge variant={restaurant.wouldReturn ? "default" : "destructive"} className="shrink-0 flex items-center gap-1">
              {restaurant.wouldReturn ? <><ThumbsUp className="w-3 h-3" /> Would Return</> : <><ThumbsDown className="w-3 h-3" /> Avoid</>}
            </Badge>
          </div>
        </div>
      </header>

      <main className="container max-w-3xl py-6 space-y-6">
        {/* Ratings */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 gap-4">
          <div className="rounded-lg border bg-card p-4">
            <p className="text-sm text-muted-foreground mb-1">Overall Rating</p>
            <StarRating rating={restaurant.overallRating} readonly size="md" />
          </div>
          <div className="rounded-lg border bg-card p-4">
            <p className="text-sm text-muted-foreground mb-1">Ambiance</p>
            <StarRating rating={restaurant.environmentRating} readonly size="md" />
          </div>
        </motion.div>

        {/* Notes */}
        {restaurant.notes && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="rounded-lg border bg-card p-4">
            <p className="text-sm font-medium mb-1">Notes</p>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{restaurant.notes}</p>
          </motion.div>
        )}

        {/* Dishes */}
        {restaurant.dishes.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <h2 className="text-lg font-display font-semibold mb-3">Dishes</h2>
            <div className="grid gap-3">
              {restaurant.dishes.map((dish) => (
                <div key={dish.id} className="rounded-lg border bg-card p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{dish.name}</h3>
                    <StarRating rating={dish.rating} readonly size="sm" />
                  </div>
                  {dish.notes && <p className="mt-1 text-sm text-muted-foreground">{dish.notes}</p>}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t">
          <Button onClick={() => setEditing(true)} variant="outline" className="gap-2">
            <Edit className="w-4 h-4" /> Edit
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="gap-2 text-destructive border-destructive/30 hover:bg-destructive/10">
                <Trash2 className="w-4 h-4" /> Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this restaurant?</AlertDialogTitle>
                <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </main>
    </div>
  );
}
