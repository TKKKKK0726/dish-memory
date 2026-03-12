import { Restaurant } from "./types";
import { getRestaurants, saveRestaurants } from "./storage";

const SEED_KEY = "dishlog-seeded";

export function seedIfEmpty() {
  if (localStorage.getItem(SEED_KEY)) return;
  if (getRestaurants().length > 0) return;

  const now = new Date().toISOString();
  const daysAgo = (n: number) => new Date(Date.now() - n * 86400000).toISOString();

  const seedData: Restaurant[] = [
    {
      id: "seed-1",
      name: "Sushi Nakazawa",
      cuisine: "Japanese",
      location: "West Village, NYC",
      priceRange: "$$$$",
      notes: "Omakase-style counter seating. Intimate and refined.",
      createdAt: daysAgo(60),
      updatedAt: daysAgo(5),
      visits: [
        {
          id: "v1-1",
          restaurantId: "seed-1",
          date: daysAgo(5),
          overallRating: 5,
          ambianceRating: 5,
          serviceRating: 5,
          wouldReturn: true,
          notes: "Incredible omakase experience. Every piece was perfect.",
          createdAt: daysAgo(5),
          dishes: [
            { id: "vd1-1", dishId: "d1", dishName: "Otoro Nigiri", rating: 5, wouldReorder: true, notes: "Melt-in-your-mouth. Best toro I've had." },
            { id: "vd1-2", dishId: "d2", dishName: "Uni Gunkan", rating: 5, wouldReorder: true, notes: "Sweet, creamy, ocean-fresh." },
            { id: "vd1-3", dishId: "d3", dishName: "Tamago", rating: 4, wouldReorder: true, notes: "Delicate and sweet. Nice palette cleanser." },
          ],
        },
        {
          id: "v1-2",
          restaurantId: "seed-1",
          date: daysAgo(45),
          overallRating: 4,
          ambianceRating: 5,
          serviceRating: 4,
          wouldReturn: true,
          notes: "First visit. Blown away by quality.",
          createdAt: daysAgo(45),
          dishes: [
            { id: "vd1-4", dishId: "d1", dishName: "Otoro Nigiri", rating: 5, wouldReorder: true, notes: "Outstanding." },
            { id: "vd1-5", dishId: "d4", dishName: "Salmon Sashimi", rating: 3, wouldReorder: false, notes: "Good but not special compared to other pieces." },
          ],
        },
      ],
    },
    {
      id: "seed-2",
      name: "Joe's Pizza",
      cuisine: "Italian",
      location: "Greenwich Village, NYC",
      priceRange: "$",
      notes: "Classic NYC slice joint. No-frills, just great pizza.",
      createdAt: daysAgo(90),
      updatedAt: daysAgo(10),
      visits: [
        {
          id: "v2-1",
          restaurantId: "seed-2",
          date: daysAgo(10),
          overallRating: 4,
          ambianceRating: 2,
          serviceRating: 3,
          wouldReturn: true,
          notes: "Quick late-night stop. Still the best slice in the city.",
          createdAt: daysAgo(10),
          dishes: [
            { id: "vd2-1", dishId: "d5", dishName: "Cheese Slice", rating: 5, wouldReorder: true, notes: "Perfect char, foldable, tangy sauce." },
            { id: "vd2-2", dishId: "d6", dishName: "Pepperoni Slice", rating: 4, wouldReorder: true, notes: "Crispy pepperoni cups. Classic." },
            { id: "vd2-3", dishId: "d7", dishName: "Sicilian Slice", rating: 2, wouldReorder: false, notes: "Too doughy and bland. Stick to regular slices." },
          ],
        },
      ],
    },
    {
      id: "seed-3",
      name: "Café Mogador",
      cuisine: "Moroccan / Mediterranean",
      location: "East Village, NYC",
      priceRange: "$$",
      notes: "Great for brunch. Charming outdoor seating area.",
      createdAt: daysAgo(30),
      updatedAt: daysAgo(3),
      visits: [
        {
          id: "v3-1",
          restaurantId: "seed-3",
          date: daysAgo(3),
          overallRating: 4,
          ambianceRating: 5,
          serviceRating: 3,
          wouldReturn: true,
          notes: "Brunch was lovely but slow service. Worth the wait for the food.",
          createdAt: daysAgo(3),
          dishes: [
            { id: "vd3-1", dishId: "d8", dishName: "Shakshuka", rating: 5, wouldReorder: true, notes: "Rich tomato, perfectly runny eggs. Get extra bread." },
            { id: "vd3-2", dishId: "d9", dishName: "Hummus Plate", rating: 4, wouldReorder: true, notes: "Creamy and generous portion." },
            { id: "vd3-3", dishId: "d10", dishName: "Moroccan Chicken Tagine", rating: 4, wouldReorder: true, notes: "Fragrant and tender. Good portion size." },
            { id: "vd3-4", dishId: "d11", dishName: "Baklava", rating: 2, wouldReorder: false, notes: "Too sweet and soggy. Skip dessert here." },
          ],
        },
      ],
    },
    {
      id: "seed-4",
      name: "The Halal Guys",
      cuisine: "Middle Eastern",
      location: "Midtown, NYC",
      priceRange: "$",
      notes: "Famous street cart turned restaurant.",
      createdAt: daysAgo(20),
      updatedAt: daysAgo(15),
      visits: [
        {
          id: "v4-1",
          restaurantId: "seed-4",
          date: daysAgo(15),
          overallRating: 3,
          ambianceRating: 1,
          serviceRating: 2,
          wouldReturn: false,
          notes: "Overhyped. Long line, mediocre food. White sauce is the only saving grace.",
          createdAt: daysAgo(15),
          dishes: [
            { id: "vd4-1", dishId: "d12", dishName: "Chicken over Rice", rating: 3, wouldReorder: false, notes: "Dry chicken, bland rice. White sauce does all the heavy lifting." },
            { id: "vd4-2", dishId: "d13", dishName: "Combo Platter", rating: 2, wouldReorder: false, notes: "Gyro meat was rubbery. Not worth the wait." },
          ],
        },
      ],
    },
    {
      id: "seed-5",
      name: "Tatiana",
      cuisine: "Caribbean-American",
      location: "Lincoln Center, NYC",
      priceRange: "$$$",
      notes: "Chef Kwame Onwuachi's restaurant. Stunning space in Lincoln Center.",
      createdAt: daysAgo(14),
      updatedAt: daysAgo(7),
      visits: [
        {
          id: "v5-1",
          restaurantId: "seed-5",
          date: daysAgo(7),
          overallRating: 5,
          ambianceRating: 5,
          serviceRating: 5,
          wouldReturn: true,
          notes: "One of the best meals I've had this year. Every course was thoughtful and delicious.",
          createdAt: daysAgo(7),
          dishes: [
            { id: "vd5-1", dishId: "d14", dishName: "Jerk Short Rib", rating: 5, wouldReorder: true, notes: "Incredible. Fall-off-the-bone tender with perfect heat." },
            { id: "vd5-2", dishId: "d15", dishName: "Egusi Soup", rating: 5, wouldReorder: true, notes: "Rich, complex. A standout dish." },
            { id: "vd5-3", dishId: "d16", dishName: "Cornbread", rating: 4, wouldReorder: true, notes: "Sweet and moist. Great starter." },
            { id: "vd5-4", dishId: "d17", dishName: "Plantain Dessert", rating: 3, wouldReorder: false, notes: "Good but not memorable compared to the mains." },
          ],
        },
      ],
    },
  ];

  saveRestaurants(seedData);
  localStorage.setItem(SEED_KEY, "true");
}
