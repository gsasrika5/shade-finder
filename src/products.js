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
  { id: "lip-19", category: "lipstick", brand: "Bloom Beauty", name: "Mulberry Silk", shadeHex: "#6a1f3a", price: 9 },
  { id: "lip-20", category: "lipstick", brand: "Luxe Atelier", name: "Black Cherry", shadeHex: "#561830", price: 42 },
  { id: "lip-21", category: "lipstick", brand: "Petal Lab", name: "Wine Velvet", shadeHex: "#66213a", price: 5 },
  { id: "lip-22", category: "lipstick", brand: "Daily Glow", name: "Papaya Pop", shadeHex: "#e66a55", price: 7 },
  { id: "lip-23", category: "lipstick", brand: "Luxe Atelier", name: "Coral Reef", shadeHex: "#d95a49", price: 42 },
  { id: "lip-24", category: "lipstick", brand: "Petal Lab", name: "Peach Coral", shadeHex: "#e46e5a", price: 5 },
  { id: "lip-25", category: "lipstick", brand: "Velvet & Co", name: "Rosewood", shadeHex: "#a0646f", price: 30 },
  { id: "lip-26", category: "lipstick", brand: "Daily Glow", name: "Mauve Mood", shadeHex: "#955a69", price: 7 },
  { id: "lip-27", category: "lipstick", brand: "Bloom Beauty", name: "Dusk Rose", shadeHex: "#a2687a", price: 9 },
  { id: "lip-28", category: "lipstick", brand: "Velvet & Co", name: "Scarlet Night", shadeHex: "#a91f2e", price: 30 },
  { id: "lip-29", category: "lipstick", brand: "Bloom Beauty", name: "Ruby Kiss", shadeHex: "#b2252f", price: 9 },
  { id: "lip-30", category: "lipstick", brand: "Daily Glow", name: "Brick Red", shadeHex: "#9e1d28", price: 7 },
  { id: "lip-31", category: "lipstick", brand: "Bloom Beauty", name: "Magenta Muse", shadeHex: "#d94077", price: 9 },
  { id: "lip-32", category: "lipstick", brand: "Petal Lab", name: "Tea Rose", shadeHex: "#c25e74", price: 5 },

  // Foundation (undertones are made up too, so the undertone choice has
  // something to rank)
  { id: "fdn-01", category: "foundation", brand: "Luxe Atelier", name: "Skin Silk 1N Porcelain", shadeHex: "#f1d3bf", price: 55, undertone: "neutral" },
  { id: "fdn-02", category: "foundation", brand: "Daily Glow", name: "True Match Ivory", shadeHex: "#efd1bb", price: 11, undertone: "neutral" },
  { id: "fdn-03", category: "foundation", brand: "Velvet & Co", name: "Soft Matte 3W Sand", shadeHex: "#ddb08c", price: 38, undertone: "warm" },
  { id: "fdn-04", category: "foundation", brand: "Petal Lab", name: "Everyday Sand", shadeHex: "#dbad8a", price: 8, undertone: "warm" },
  { id: "fdn-05", category: "foundation", brand: "Luxe Atelier", name: "Skin Silk 5W Caramel", shadeHex: "#b98057", price: 55, undertone: "warm" },
  { id: "fdn-06", category: "foundation", brand: "Bloom Beauty", name: "Caramel Glow", shadeHex: "#b67e56", price: 12, undertone: "warm" },
  { id: "fdn-07", category: "foundation", brand: "Velvet & Co", name: "Soft Matte 7N Espresso", shadeHex: "#6e4430", price: 38, undertone: "neutral" },
  { id: "fdn-08", category: "foundation", brand: "Daily Glow", name: "True Match Mocha", shadeHex: "#71462f", price: 11, undertone: "warm" },
  { id: "fdn-09", category: "foundation", brand: "Bloom Beauty", name: "Honey Beige", shadeHex: "#cf9f78", price: 12, undertone: "warm" },
  { id: "fdn-10", category: "foundation", brand: "Petal Lab", name: "Deep Cocoa", shadeHex: "#5a3826", price: 8, undertone: "neutral" },
  { id: "fdn-11", category: "foundation", brand: "Daily Glow", name: "True Match Rose Ivory", shadeHex: "#eecbc0", price: 11, undertone: "cool" },
  { id: "fdn-12", category: "foundation", brand: "Velvet & Co", name: "Soft Matte 3C Rose Beige", shadeHex: "#d6a796", price: 38, undertone: "cool" },
  { id: "fdn-13", category: "foundation", brand: "Petal Lab", name: "Everyday Cool Tan", shadeHex: "#b07c68", price: 8, undertone: "cool" },
  { id: "fdn-14", category: "foundation", brand: "Luxe Atelier", name: "Skin Silk 8C Ebony", shadeHex: "#674036", price: 55, undertone: "cool" },
  { id: "fdn-15", category: "foundation", brand: "Petal Lab", name: "Everyday Ivory Silk", shadeHex: "#f2d5c2", price: 8, undertone: "neutral" },
  { id: "fdn-16", category: "foundation", brand: "Bloom Beauty", name: "Warm Porcelain", shadeHex: "#edcdb4", price: 12, undertone: "warm" },
  { id: "fdn-17", category: "foundation", brand: "Velvet & Co", name: "Soft Matte 8W Mahogany", shadeHex: "#643e2c", price: 38, undertone: "warm" },
  { id: "fdn-18", category: "foundation", brand: "Bloom Beauty", name: "Deep Espresso", shadeHex: "#5f3b2a", price: 12, undertone: "neutral" },

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
  { id: "blu-11", category: "blush", brand: "Daily Glow", name: "Pink Flame", shadeHex: "#e04f86", price: 6 },
  { id: "blu-12", category: "blush", brand: "Petal Lab", name: "Raspberry Glow", shadeHex: "#b95870", price: 4 },
  { id: "blu-13", category: "blush", brand: "Bloom Beauty", name: "Petal Pink", shadeHex: "#e3909f", price: 10 },
  { id: "blu-14", category: "blush", brand: "Petal Lab", name: "Blush Ballet", shadeHex: "#f2b0bd", price: 4 },
];

export const products = productList.map((product) => ({
  ...product,
  ingredients: sampleIngredients[product.category],
  animalTesting: sampleAnimalTesting[product.brand],
}));

export const categories = ["lipstick", "foundation", "blush"];
