import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { saveRestaurant } from "@/lib/storage";
import { RestaurantForm } from "@/components/RestaurantForm";
import { Restaurant } from "@/lib/types";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function AddRestaurant() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleSave = async (restaurant: Restaurant) => {
    try {
      await saveRestaurant(restaurant);
      queryClient.invalidateQueries({ queryKey: ["restaurants"] });
      toast.success("Restaurant created!");
      navigate(`/restaurant/${restaurant.id}`);
    } catch {
      toast.error("Failed to save restaurant. Please try again.");
    }
  };

  return (
    <div className="min-h-screen">
      <header className="border-b bg-card">
        <div className="container max-w-3xl py-6">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="mb-3 -ml-2 gap-1 text-muted-foreground">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Add Restaurant</h1>
          <p className="text-sm text-muted-foreground mt-1">Create a restaurant record, then log visits with dish ratings.</p>
        </div>
      </header>
      <main className="container max-w-3xl py-6">
        <RestaurantForm onSave={handleSave} onCancel={() => navigate("/")} />
      </main>
    </div>
  );
}
