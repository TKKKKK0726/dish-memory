import { Restaurant } from "./types";

const STORAGE_KEY = "taste-vault-restaurants";

export function getRestaurants(): Restaurant[] {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveRestaurants(restaurants: Restaurant[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(restaurants));
}

export function getRestaurant(id: string): Restaurant | undefined {
  return getRestaurants().find((r) => r.id === id);
}

export function saveRestaurant(restaurant: Restaurant) {
  const restaurants = getRestaurants();
  const index = restaurants.findIndex((r) => r.id === restaurant.id);
  if (index >= 0) {
    restaurants[index] = { ...restaurant, updatedAt: new Date().toISOString() };
  } else {
    restaurants.push(restaurant);
  }
  saveRestaurants(restaurants);
}

export function deleteRestaurant(id: string) {
  saveRestaurants(getRestaurants().filter((r) => r.id !== id));
}
