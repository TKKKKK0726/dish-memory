import { supabase } from "./supabase";
import { Restaurant, Visit, VisitDish, PriceRange } from "./types";

// Map Supabase snake_case rows → TypeScript camelCase types

function mapVisitDish(vd: Record<string, unknown>): VisitDish {
  return {
    id: vd.id as string,
    dishId: vd.id as string,
    dishName: vd.dish_name as string,
    rating: vd.rating as number,
    wouldReorder: vd.would_reorder as boolean,
    notes: (vd.notes as string) || "",
  };
}

function mapVisit(v: Record<string, unknown>): Visit {
  return {
    id: v.id as string,
    restaurantId: v.restaurant_id as string,
    date: v.date as string,
    overallRating: v.overall_rating as number,
    ambianceRating: v.ambiance_rating as number,
    serviceRating: v.service_rating as number,
    wouldReturn: v.would_return as boolean,
    notes: (v.notes as string) || "",
    dishes: ((v.visit_dishes as Record<string, unknown>[]) || []).map(mapVisitDish),
    createdAt: v.created_at as string,
  };
}

function mapRestaurant(r: Record<string, unknown>): Restaurant {
  return {
    id: r.id as string,
    name: r.name as string,
    cuisine: (r.cuisine as string) || "",
    location: (r.location as string) || "",
    priceRange: (r.price_range as PriceRange) || "$$",
    notes: (r.notes as string) || "",
    visits: ((r.visits as Record<string, unknown>[]) || []).map(mapVisit),
    createdAt: r.created_at as string,
    updatedAt: r.updated_at as string,
    isWishlist: (r.is_wishlist as boolean) ?? false,
  };
}

export async function getRestaurants(): Promise<Restaurant[]> {
  const { data, error } = await supabase
    .from("restaurants")
    .select("*, visits(*, visit_dishes(*))")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data || []).map(mapRestaurant);
}

export async function getRestaurant(id: string): Promise<Restaurant | undefined> {
  const { data, error } = await supabase
    .from("restaurants")
    .select("*, visits(*, visit_dishes(*))")
    .eq("id", id)
    .single();
  if (error) return undefined;
  return mapRestaurant(data);
}

export async function saveRestaurant(restaurant: Restaurant): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Upsert restaurant record
  const { error: restError } = await supabase.from("restaurants").upsert({
    id: restaurant.id,
    user_id: user.id,
    name: restaurant.name,
    cuisine: restaurant.cuisine,
    location: restaurant.location,
    price_range: restaurant.priceRange,
    notes: restaurant.notes,
    is_wishlist: restaurant.isWishlist ?? false,
    created_at: restaurant.createdAt,
    updated_at: new Date().toISOString(),
  });
  if (restError) throw restError;

  // Delete all existing visits (CASCADE removes their visit_dishes)
  const { error: delError } = await supabase
    .from("visits")
    .delete()
    .eq("restaurant_id", restaurant.id);
  if (delError) throw delError;

  // Re-insert all visits and their dishes
  for (const visit of restaurant.visits) {
    const { error: visitError } = await supabase.from("visits").insert({
      id: visit.id,
      restaurant_id: restaurant.id,
      date: visit.date,
      overall_rating: visit.overallRating,
      ambiance_rating: visit.ambianceRating,
      service_rating: visit.serviceRating,
      would_return: visit.wouldReturn,
      notes: visit.notes,
      created_at: visit.createdAt,
    });
    if (visitError) throw visitError;

    if (visit.dishes.length > 0) {
      const { error: dishError } = await supabase.from("visit_dishes").insert(
        visit.dishes.map((d) => ({
          id: d.id,
          visit_id: visit.id,
          dish_name: d.dishName,
          rating: d.rating,
          would_reorder: d.wouldReorder,
          notes: d.notes,
        }))
      );
      if (dishError) throw dishError;
    }
  }
}

export async function getPublicRestaurants(userId: string): Promise<Restaurant[]> {
  const { data, error } = await supabase
    .from("restaurants")
    .select("*, visits(*, visit_dishes(*))")
    .eq("user_id", userId)
    .eq("is_wishlist", false)
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data || []).map(mapRestaurant);
}

export async function deleteRestaurant(id: string): Promise<void> {
  const { error } = await supabase.from("restaurants").delete().eq("id", id);
  if (error) throw error;
}
