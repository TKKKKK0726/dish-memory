export type PriceRange = "$" | "$$" | "$$$" | "$$$$";

export interface Dish {
  id: string;
  name: string;
  category?: string; // appetizer, main, dessert, drink, etc.
}

export interface VisitDish {
  id: string;
  dishId: string;
  dishName: string;
  rating: number; // 1-5
  wouldReorder: boolean; // true = reorder, false = avoid
  notes: string;
}

export interface Visit {
  id: string;
  restaurantId: string;
  date: string; // ISO date
  overallRating: number; // 1-5
  ambianceRating: number; // 1-5
  serviceRating: number; // 1-5
  wouldReturn: boolean;
  notes: string;
  dishes: VisitDish[];
  createdAt: string;
}

export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  location: string;
  priceRange: PriceRange;
  notes: string;
  visits: Visit[];
  createdAt: string;
  updatedAt: string;
  isWishlist?: boolean;
}

// Computed helpers
export function getReorderDishes(restaurant: Restaurant): { name: string; avgRating: number; count: number }[] {
  const dishMap = new Map<string, { totalRating: number; count: number }>();
  for (const visit of restaurant.visits) {
    for (const d of visit.dishes) {
      if (d.wouldReorder) {
        const existing = dishMap.get(d.dishName) || { totalRating: 0, count: 0 };
        existing.totalRating += d.rating;
        existing.count += 1;
        dishMap.set(d.dishName, existing);
      }
    }
  }
  return Array.from(dishMap.entries())
    .map(([name, { totalRating, count }]) => ({ name, avgRating: totalRating / count, count }))
    .sort((a, b) => b.avgRating - a.avgRating);
}

export function getAvoidDishes(restaurant: Restaurant): { name: string; avgRating: number; count: number }[] {
  const dishMap = new Map<string, { totalRating: number; count: number }>();
  for (const visit of restaurant.visits) {
    for (const d of visit.dishes) {
      if (!d.wouldReorder) {
        const existing = dishMap.get(d.dishName) || { totalRating: 0, count: 0 };
        existing.totalRating += d.rating;
        existing.count += 1;
        dishMap.set(d.dishName, existing);
      }
    }
  }
  return Array.from(dishMap.entries())
    .map(([name, { totalRating, count }]) => ({ name, avgRating: totalRating / count, count }))
    .sort((a, b) => a.avgRating - b.avgRating);
}

export function getAverageRating(restaurant: Restaurant): number {
  if (restaurant.visits.length === 0) return 0;
  return restaurant.visits.reduce((sum, v) => sum + v.overallRating, 0) / restaurant.visits.length;
}

export function getLatestVisit(restaurant: Restaurant): Visit | undefined {
  if (restaurant.visits.length === 0) return undefined;
  return [...restaurant.visits].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
}

export function getOverallVerdict(restaurant: Restaurant): "return" | "mixed" | "avoid" | "none" {
  if (restaurant.visits.length === 0) return "none";
  const returnCount = restaurant.visits.filter(v => v.wouldReturn).length;
  const ratio = returnCount / restaurant.visits.length;
  if (ratio >= 0.7) return "return";
  if (ratio <= 0.3) return "avoid";
  return "mixed";
}
