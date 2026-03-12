export interface Dish {
  id: string;
  name: string;
  rating: number; // 1-5
  notes: string;
}

export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  location: string;
  environmentRating: number; // 1-5
  overallRating: number; // 1-5
  wouldReturn: boolean;
  notes: string;
  dishes: Dish[];
  createdAt: string;
  updatedAt: string;
}
