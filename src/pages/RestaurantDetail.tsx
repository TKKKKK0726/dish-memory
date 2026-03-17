import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getRestaurant, saveRestaurant, deleteRestaurant } from "@/lib/storage";
import { RestaurantForm } from "@/components/RestaurantForm";
import { VisitForm } from "@/components/VisitForm";
import { StarRating } from "@/components/StarRating";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft, Edit, Trash2, MapPin, Utensils, ThumbsUp, ThumbsDown,
  CalendarDays, Plus, DollarSign, AlertTriangle, Star, Bookmark, CheckCircle,
} from "lucide-react";
import { Restaurant, Visit, getAverageRating, getOverallVerdict, getReorderDishes, getAvoidDishes } from "@/lib/types";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function RestaurantDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [editing, setEditing] = useState(false);
  const [addingVisit, setAddingVisit] = useState(false);
  const [editingVisitId, setEditingVisitId] = useState<string | null>(null);

  const { data: restaurant, isLoading } = useQuery({
    queryKey: ["restaurant", id],
    queryFn: () => getRestaurant(id!),
    enabled: !!id,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["restaurant", id] });
    queryClient.invalidateQueries({ queryKey: ["restaurants"] });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground text-sm">Loading...</div>
      </div>
    );
  }

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

  const avgRating = getAverageRating(restaurant);
  const verdict = getOverallVerdict(restaurant);
  const reorderDishes = getReorderDishes(restaurant);
  const avoidDishes = getAvoidDishes(restaurant);
  const sortedVisits = [...restaurant.visits].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const verdictConfig = {
    return: { label: "Worth Revisiting", icon: ThumbsUp, color: "text-accent" },
    mixed: { label: "Mixed – Return for Specific Dishes", icon: AlertTriangle, color: "text-star" },
    avoid: { label: "Avoid", icon: ThumbsDown, color: "text-destructive" },
    none: { label: "No Visits Yet", icon: Star, color: "text-muted-foreground" },
  };
  const vc = verdictConfig[verdict];

  const handleSaveRestaurant = async (updated: Restaurant) => {
    try {
      await saveRestaurant(updated);
      invalidate();
      setEditing(false);
      toast.success("Restaurant updated!");
    } catch {
      toast.error("Failed to update restaurant.");
    }
  };

  const handleMarkAsVisited = async () => {
    try {
      await saveRestaurant({ ...restaurant, isWishlist: false });
      invalidate();
      toast.success("Moved to visited! Log your first visit below.");
      setAddingVisit(true);
    } catch {
      toast.error("Failed to update restaurant.");
    }
  };

  const handleSaveVisit = async (visit: Visit) => {
    try {
      const updatedVisits = editingVisitId
        ? restaurant.visits.map((v) => (v.id === editingVisitId ? visit : v))
        : [...restaurant.visits, visit];
      const updated = { ...restaurant, visits: updatedVisits, updatedAt: new Date().toISOString() };
      await saveRestaurant(updated);
      invalidate();
      setAddingVisit(false);
      setEditingVisitId(null);
      toast.success(editingVisitId ? "Visit updated!" : "Visit logged!");
    } catch {
      toast.error("Failed to save visit.");
    }
  };

  const handleDeleteVisit = async (visitId: string) => {
    try {
      const updated = {
        ...restaurant,
        visits: restaurant.visits.filter((v) => v.id !== visitId),
        updatedAt: new Date().toISOString(),
      };
      await saveRestaurant(updated);
      invalidate();
      toast.success("Visit deleted");
    } catch {
      toast.error("Failed to delete visit.");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteRestaurant(restaurant.id);
      queryClient.invalidateQueries({ queryKey: ["restaurants"] });
      toast.success("Restaurant deleted");
      navigate("/");
    } catch {
      toast.error("Failed to delete restaurant.");
    }
  };

  // Editing restaurant
  if (editing) {
    return (
      <div className="min-h-screen">
        <header className="border-b bg-card">
          <div className="container max-w-3xl py-6">
            <h1 className="text-2xl font-bold tracking-tight">Edit Restaurant</h1>
          </div>
        </header>
        <main className="container max-w-3xl py-6">
          <RestaurantForm initial={restaurant} onSave={handleSaveRestaurant} onCancel={() => setEditing(false)} />
        </main>
      </div>
    );
  }

  // Adding/editing visit
  if (addingVisit || editingVisitId) {
    const editVisit = editingVisitId ? restaurant.visits.find((v) => v.id === editingVisitId) : undefined;
    return (
      <div className="min-h-screen">
        <header className="border-b bg-card">
          <div className="container max-w-3xl py-6">
            <h1 className="text-2xl font-bold tracking-tight">{editingVisitId ? "Edit Visit" : "Log a Visit"}</h1>
            <p className="text-sm text-muted-foreground mt-1">{restaurant.name}</p>
          </div>
        </header>
        <main className="container max-w-3xl py-6">
          <VisitForm
            restaurantId={restaurant.id}
            initial={editVisit}
            onSave={handleSaveVisit}
            onCancel={() => { setAddingVisit(false); setEditingVisitId(null); }}
          />
        </main>
      </div>
    );
  }

  // Detail view
  return (
    <div className="min-h-screen">
      <header className="border-b bg-card">
        <div className="container max-w-3xl py-6">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="mb-3 -ml-2 gap-1 text-muted-foreground">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold tracking-tight">{restaurant.name}</h1>
                {restaurant.isWishlist && (
                  <Badge variant="outline" className="border-primary/40 text-primary flex items-center gap-1">
                    <Bookmark className="w-3 h-3" /> Wishlist
                  </Badge>
                )}
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                {restaurant.cuisine && <span className="flex items-center gap-1"><Utensils className="w-3.5 h-3.5" />{restaurant.cuisine}</span>}
                {restaurant.location && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{restaurant.location}</span>}
                <span className="flex items-center gap-0.5"><DollarSign className="w-3.5 h-3.5" />{restaurant.priceRange}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container max-w-3xl py-6 space-y-6">
        {restaurant.isWishlist ? (
          /* Wishlist Banner */
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-lg border bg-card p-5">
            <div className="flex items-center gap-3 mb-3">
              <Bookmark className="w-6 h-6 text-primary" />
              <h2 className="font-display text-lg font-semibold">On Your Wishlist</h2>
            </div>
            {restaurant.notes && <p className="text-sm text-muted-foreground mb-4">{restaurant.notes}</p>}
            <Button onClick={handleMarkAsVisited} className="gap-2">
              <CheckCircle className="w-4 h-4" /> I've Been Here — Log a Visit
            </Button>
          </motion.div>
        ) : (
          <>
            {/* Verdict Banner */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-lg border bg-card p-5">
              <div className="flex items-center gap-3 mb-3">
                <vc.icon className={`w-6 h-6 ${vc.color}`} />
                <h2 className="font-display text-lg font-semibold">{vc.label}</h2>
              </div>
              {avgRating > 0 && (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm text-muted-foreground">Average Rating</span>
                    <StarRating rating={Math.round(avgRating)} readonly size="md" />
                    <span className="text-sm font-medium">{avgRating.toFixed(1)}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{restaurant.visits.length} visit{restaurant.visits.length !== 1 ? "s" : ""}</span>
                </div>
              )}
              {restaurant.notes && <p className="mt-3 text-sm text-muted-foreground">{restaurant.notes}</p>}
            </motion.div>

            {/* Best Dishes */}
            {reorderDishes.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                <h2 className="font-display text-lg font-semibold mb-3 flex items-center gap-2">
                  <ThumbsUp className="w-5 h-5 text-accent" /> Best Dishes — Reorder
                </h2>
                <div className="grid gap-2">
                  {reorderDishes.map((d) => (
                    <div key={d.name} className="rounded-lg border bg-card p-4 flex items-center justify-between">
                      <div>
                        <span className="font-medium">{d.name}</span>
                        <span className="text-xs text-muted-foreground ml-2">ordered {d.count}×</span>
                      </div>
                      <StarRating rating={Math.round(d.avgRating)} readonly size="sm" />
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Avoid Dishes */}
            {avoidDishes.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <h2 className="font-display text-lg font-semibold mb-3 flex items-center gap-2">
                  <ThumbsDown className="w-5 h-5 text-destructive" /> Skip Next Time
                </h2>
                <div className="grid gap-2">
                  {avoidDishes.map((d) => (
                    <div key={d.name} className="rounded-lg border bg-card p-4 flex items-center justify-between">
                      <div>
                        <span className="font-medium">{d.name}</span>
                        <span className="text-xs text-muted-foreground ml-2">tried {d.count}×</span>
                      </div>
                      <StarRating rating={Math.round(d.avgRating)} readonly size="sm" />
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Visit History */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-display text-lg font-semibold">Visit History</h2>
                <Button size="sm" onClick={() => setAddingVisit(true)} className="gap-1">
                  <Plus className="w-4 h-4" /> Log Visit
                </Button>
              </div>

              {sortedVisits.length > 0 ? (
                <div className="grid gap-3">
                  {sortedVisits.map((visit) => (
                    <div key={visit.id} className="rounded-lg border bg-card p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <CalendarDays className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{new Date(visit.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
                          <Badge variant={visit.wouldReturn ? "default" : "destructive"} className="text-xs">
                            {visit.wouldReturn ? "Would Return" : "Avoid"}
                          </Badge>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => setEditingVisitId(visit.id)} className="h-7 px-2 text-xs">
                            <Edit className="w-3 h-3" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-destructive">
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete this visit?</AlertDialogTitle>
                                <AlertDialogDescription>This will remove the visit and all its dish ratings.</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteVisit(visit.id)}>Delete</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-4">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-muted-foreground">Overall</span>
                          <StarRating rating={visit.overallRating} readonly size="sm" />
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-muted-foreground">Ambiance</span>
                          <StarRating rating={visit.ambianceRating} readonly size="sm" />
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-muted-foreground">Service</span>
                          <StarRating rating={visit.serviceRating} readonly size="sm" />
                        </div>
                      </div>

                      {visit.notes && <p className="text-sm text-muted-foreground">{visit.notes}</p>}

                      {visit.dishes.length > 0 && (
                        <div className="border-t pt-3 space-y-2">
                          {visit.dishes.map((dish) => (
                            <div key={dish.id} className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2">
                                {dish.wouldReorder ? (
                                  <ThumbsUp className="w-3.5 h-3.5 text-accent" />
                                ) : (
                                  <ThumbsDown className="w-3.5 h-3.5 text-destructive" />
                                )}
                                <span className="font-medium">{dish.dishName}</span>
                                {dish.notes && <span className="text-muted-foreground">— {dish.notes}</span>}
                              </div>
                              <StarRating rating={dish.rating} readonly size="sm" />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed bg-card/50 p-8 text-center">
                  <CalendarDays className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No visits logged yet</p>
                  <Button size="sm" variant="outline" className="mt-3 gap-1" onClick={() => setAddingVisit(true)}>
                    <Plus className="w-4 h-4" /> Log Your First Visit
                  </Button>
                </div>
              )}
            </motion.div>
          </>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t">
          <Button onClick={() => setEditing(true)} variant="outline" className="gap-2">
            <Edit className="w-4 h-4" /> Edit Restaurant
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
                <AlertDialogDescription>This will permanently delete the restaurant and all visit data.</AlertDialogDescription>
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
