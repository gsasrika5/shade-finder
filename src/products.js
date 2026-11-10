// Sample product database. The brands and products are made up so the app
// has something to match against; real products will replace them later.

// Typical ingredients for each product type, shown until real products bring
// their own ingredient lists.
const sampleIngredients = {
  lipstick: ["Ricinus Communis (Castor) Seed Oil", "Beeswax", "Candelilla Wax", "Shea Butter", "Tocopherol (Vitamin E)", "Iron Oxides", "Red 7 Lake"],
  foundation: ["Water", "Cyclopentasiloxane", "Glycerin", "Dimethicone", "Titanium Dioxide", "Iron Oxides", "Phenoxyethanol"],
  blush: ["Talc", "Mica", "Magnesium Stearate", "Dimethicone", "Caprylyl Glycol", "Iron Oxides", "Red 40 Lake"],
};

// Made-up animal testing status for each sample brand, so the app can show it
// until real products bring real brand policies.
const sampleAnimalTesting = {
  "Luxe Atelier": "tested",
  "Daily Glow": "cruelty-free",
  "Petal Lab": "cruelty-free",
  "Bloom Beauty": "unknown",
  "Velvet & Co": "tested",
};

const productList = [
  // Lipstick
  { id: "lip-01", category: "lipstick", brand: "Luxe Atelier", name: "Velvet Rouge 02", shadeHex: "#a3182b", price: 42 },
  { id: "lip-02", category: "lipstick", brand: "Daily Glow", name: "Cherry Pop", shadeHex: "#a81d30", price: 7 },
  { id: "lip-03", category: "lipstick", brand: "Petal Lab", name: "Classic Red", shadeHex: "#b0222a", price: 5 },
  { id: "lip-04", category: "lipstick", brand: "Luxe Atelier", name: "Nude Silk 11", shadeHex: "#b97a6d", price: 42 },
  { id: "lip-05", category: "lipstick", brand: "Bloom Beauty", name: "Bare Rose", shadeHex: "#b67769", price: 9 },
  { id: "lip-06", category: "lipstick", brand: "Petal Lab", name: "Honey Nude", shadeHex: "#c08470", price: 5 },
  { id: "lip-07", category: "lipstick", brand: "Velvet & Co", name: "Berry Noir", shadeHex: "#5e1a33", price: 30 },
  { id: "lip-08", category: "lipstick", brand: "Daily Glow", name: "Plum Crush", shadeHex: "#621d36", price: 7 },
  { id: "lip-09", category: "lipstick", brand: "Velvet & Co", name: "Coral Muse", shadeHex: "#e0614f", price: 30 },
  { id: "lip-10", category: "lipstick", brand: "Bloom Beauty", name: "Sunset Coral", shadeHex: "#dc5e4c", price: 9 },
  { id: "lip-11", category: "lipstick", brand: "Luxe Atelier", name: "Mauve Whisper", shadeHex: "#9c6070", price: 42 },
  { id: "lip-12", category: "lipstick", brand: "Petal Lab", name: "Dusty Mauve", shadeHex: "#9a5e6c", price: 5 },
  { id: "lip-13", category: "lipstick", brand: "Luxe Atelier", name: "Ballet Slipper", shadeHex: "#e8a3b0", price: 42 },
  { id: "lip-14", category: "lipstick", brand: "Daily Glow", name: "Pink Tutu", shadeHex: "#e6a0ae", price: 7 },
  { id: "lip-15", category: "lipstick", brand: "Velvet & Co", name: "Hot Pink Pop", shadeHex: "#e0457b", price: 30 },
  { id: "lip-16", category: "lipstick", brand: "Petal Lab", name: "Fuchsia Fever", shadeHex: "#dc437a", price: 5 },
  { id: "lip-17", category: "lipstick", brand: "Bloom Beauty", name: "Rosebud", shadeHex: "#c9637a", price: 9 },
  { id: "lip-18", category: "lipstick", brand: "Luxe Atelier", name: "Rose Garden", shadeHex: "#c66078", price: 42 },

  // Foundation
  { id: "fdn-01", category: "foundation", brand: "Luxe Atelier", name: "Skin Silk 1N Porcelain", shadeHex: "#f1d3bf", price: 55 },
  { id: "fdn-02", category: "foundation", brand: "Daily Glow", name: "True Match Ivory", shadeHex: "#efd1bb", price: 11 },
  { id: "fdn-03", category: "foundation", brand: "Velvet & Co", name: "Soft Matte 3W Sand", shadeHex: "#ddb08c", price: 38 },
  { id: "fdn-04", category: "foundation", brand: "Petal Lab", name: "Everyday Sand", shadeHex: "#dbad8a", price: 8 },
  { id: "fdn-05", category: "foundation", brand: "Luxe Atelier", name: "Skin Silk 5W Caramel", shadeHex: "#b98057", price: 55 },
  { id: "fdn-06", category: "foundation", brand: "Bloom Beauty", name: "Caramel Glow", shadeHex: "#b67e56", price: 12 },
  { id: "fdn-07", category: "foundation", brand: "Velvet & Co", name: "Soft Matte 7N Espresso", shadeHex: "#6e4430", price: 38 },
  { id: "fdn-08", category: "foundation", brand: "Daily Glow", name: "True Match Mocha", shadeHex: "#71462f", price: 11 },
  { id: "fdn-09", category: "foundation", brand: "Bloom Beauty", name: "Honey Beige", shadeHex: "#cf9f78", price: 12 },
  { id: "fdn-10", category: "foundation", brand: "Petal Lab", name: "Deep Cocoa", shadeHex: "#5a3826", price: 8 },

  // Blush
  { id: "blu-01", category: "blush", brand: "Luxe Atelier", name: "Flush Peach", shadeHex: "#f2a58a", price: 40 },
  { id: "blu-02", category: "blush", brand: "Petal Lab", name: "Peach Fizz", shadeHex: "#f0a389", price: 4 },
  { id: "blu-03", category: "blush", brand: "Velvet & Co", name: "Rose Petal", shadeHex: "#e08a9a", price: 28 },
  { id: "blu-04", category: "blush", brand: "Daily Glow", name: "Pink Cheeks", shadeHex: "#e18c9b", price: 6 },
  { id: "blu-05", category: "blush", brand: "Bloom Beauty", name: "Berry Flush", shadeHex: "#b8546b", price: 10 },
  { id: "blu-06", category: "blush", brand: "Luxe Atelier", name: "Wine Stain", shadeHex: "#b5526a", price: 40 },
  { id: "blu-07", category: "blush", brand: "Velvet & Co", name: "Baby Pink", shadeHex: "#f6b8c4", price: 28 },
  { id: "blu-08", category: "blush", brand: "Daily Glow", name: "Cotton Candy", shadeHex: "#f4b5c1", price: 6 },
  { id: "blu-09", category: "blush", brand: "Bloom Beauty", name: "Fuchsia Flush", shadeHex: "#e2588a", price: 10 },
  { id: "blu-10", category: "blush", brand: "Luxe Atelier", name: "Pink Punch", shadeHex: "#de5587", price: 40 },
];

export const products = productList.map((product) => ({
  ...product,
  ingredients: sampleIngredients[product.category],
  animalTesting: sampleAnimalTesting[product.brand],
}));

export const categories = ["lipstick", "foundation", "blush"];
