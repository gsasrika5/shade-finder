// Sample skincare products. Like the makeup, the brands and products are made
// up so the app has something to match against; real products will replace
// them later. Skincare dupes are matched by type and key ingredients, not color.
import { sampleAnimalTesting } from "./products.js";

export const skincareTypes = ["serum", "moisturizer", "sunscreen", "cleanser", "toner"];

// Typical base ingredients for each type, listed after a product's key ones.
const baseIngredients = {
  serum: ["Water", "Glycerin", "Propanediol", "Phenoxyethanol"],
  moisturizer: ["Water", "Glycerin", "Caprylic/Capric Triglyceride", "Cetearyl Alcohol", "Phenoxyethanol"],
  sunscreen: ["Water", "Glycerin", "Dimethicone", "Tocopherol (Vitamin E)", "Phenoxyethanol"],
  cleanser: ["Water", "Glycerin", "Cocamidopropyl Betaine", "Sodium Chloride", "Phenoxyethanol"],
  toner: ["Water", "Butylene Glycol", "Sodium Hyaluronate", "Phenoxyethanol"],
};

const productList = [
  // Serums
  { id: "sk-01", type: "serum", brand: "Luxe Atelier", name: "Glow Serum", price: 68, keyIngredients: ["Niacinamide", "Zinc", "Hyaluronic Acid"], extraIngredients: ["Fragrance"] },
  { id: "sk-02", type: "serum", brand: "Petal Lab", name: "Niacinamide 10% + Zinc", price: 7, keyIngredients: ["Niacinamide", "Zinc"] },
  { id: "sk-03", type: "serum", brand: "Daily Glow", name: "Clear Skin Serum", price: 11, keyIngredients: ["Niacinamide", "Zinc", "Hyaluronic Acid"] },
  { id: "sk-04", type: "serum", brand: "Velvet & Co", name: "Bright C Serum", price: 42, keyIngredients: ["Vitamin C", "Vitamin E", "Ferulic Acid"], extraIngredients: ["Alcohol Denat."] },
  { id: "sk-05", type: "serum", brand: "Bloom Beauty", name: "Vitamin C Drops", price: 16, keyIngredients: ["Vitamin C", "Vitamin E", "Ferulic Acid"], extraIngredients: ["Fragrance"] },
  { id: "sk-06", type: "serum", brand: "Petal Lab", name: "Hydra Boost Serum", price: 8, keyIngredients: ["Hyaluronic Acid", "Panthenol"] },
  { id: "sk-07", type: "serum", brand: "Luxe Atelier", name: "Night Renew Retinol", price: 72, keyIngredients: ["Retinol", "Peptides", "Squalane"] },
  { id: "sk-08", type: "serum", brand: "Daily Glow", name: "Retinol Night Serum", price: 12, keyIngredients: ["Retinol", "Squalane"] },

  // Moisturizers
  { id: "sk-09", type: "moisturizer", brand: "Luxe Atelier", name: "Barrier Cream", price: 65, keyIngredients: ["Ceramides", "Hyaluronic Acid", "Niacinamide"], extraIngredients: ["Methylparaben", "Propylparaben"] },
  { id: "sk-10", type: "moisturizer", brand: "Daily Glow", name: "Daily Ceramide Cream", price: 10, keyIngredients: ["Ceramides", "Hyaluronic Acid", "Niacinamide"] },
  { id: "sk-11", type: "moisturizer", brand: "Bloom Beauty", name: "Cloud Gel Moisturizer", price: 15, keyIngredients: ["Hyaluronic Acid", "Squalane"], extraIngredients: ["DMDM Hydantoin"] },
  { id: "sk-12", type: "moisturizer", brand: "Velvet & Co", name: "Peptide Firming Cream", price: 44, keyIngredients: ["Peptides", "Ceramides", "Squalane"], extraIngredients: ["Parfum"] },
  { id: "sk-13", type: "moisturizer", brand: "Petal Lab", name: "Simple Peptide Moisturizer", price: 8, keyIngredients: ["Peptides", "Ceramides"] },
  { id: "sk-14", type: "moisturizer", brand: "Velvet & Co", name: "Squalane Silk Moisturizer", price: 38, keyIngredients: ["Squalane", "Hyaluronic Acid"] },

  // Sunscreens
  { id: "sk-15", type: "sunscreen", brand: "Luxe Atelier", name: "Sheer Shield SPF 50", price: 58, keyIngredients: ["Zinc Oxide", "Niacinamide", "SPF 50"] },
  { id: "sk-16", type: "sunscreen", brand: "Petal Lab", name: "Mineral Sunscreen SPF 50", price: 8, keyIngredients: ["Zinc Oxide", "SPF 50"] },
  { id: "sk-17", type: "sunscreen", brand: "Daily Glow", name: "Everyday Mineral SPF 50", price: 11, keyIngredients: ["Zinc Oxide", "Niacinamide", "SPF 50"] },
  { id: "sk-18", type: "sunscreen", brand: "Velvet & Co", name: "Invisible Glow SPF 30", price: 36, keyIngredients: ["Avobenzone", "Hyaluronic Acid", "SPF 30"], extraIngredients: ["Fragrance"] },
  { id: "sk-19", type: "sunscreen", brand: "Bloom Beauty", name: "Dewy Daily SPF 30", price: 14, keyIngredients: ["Avobenzone", "Hyaluronic Acid", "SPF 30"] },
  { id: "sk-20", type: "sunscreen", brand: "Daily Glow", name: "Light Lotion SPF 30", price: 9, keyIngredients: ["Avobenzone", "SPF 30"], extraIngredients: ["Oxybenzone"] },

  // Cleansers
  { id: "sk-21", type: "cleanser", brand: "Luxe Atelier", name: "Gentle Cream Cleanser", price: 45, keyIngredients: ["Ceramides", "Glycerin"] },
  { id: "sk-22", type: "cleanser", brand: "Petal Lab", name: "Hydrating Cleanser", price: 6, keyIngredients: ["Ceramides", "Glycerin", "Hyaluronic Acid"] },
  { id: "sk-23", type: "cleanser", brand: "Velvet & Co", name: "Clarifying Gel Cleanser", price: 32, keyIngredients: ["Salicylic Acid", "Niacinamide"], extraIngredients: ["Sodium Lauryl Sulfate"] },
  { id: "sk-24", type: "cleanser", brand: "Daily Glow", name: "Acne Wash", price: 9, keyIngredients: ["Salicylic Acid"], extraIngredients: ["Sodium Lauryl Sulfate", "Red 40"] },
  { id: "sk-25", type: "cleanser", brand: "Bloom Beauty", name: "Clear Pore Cleanser", price: 14, keyIngredients: ["Salicylic Acid", "Niacinamide"] },
  { id: "sk-26", type: "cleanser", brand: "Bloom Beauty", name: "Soft Foam Cleanser", price: 13, keyIngredients: ["Glycerin", "Panthenol"] },

  // Toners
  { id: "sk-27", type: "toner", brand: "Luxe Atelier", name: "Resurfacing Toner", price: 62, keyIngredients: ["Glycolic Acid", "Aloe"], extraIngredients: ["Parfum", "Alcohol Denat."] },
  { id: "sk-28", type: "toner", brand: "Petal Lab", name: "Glycolic Acid 7% Toner", price: 8, keyIngredients: ["Glycolic Acid", "Aloe"] },
  { id: "sk-29", type: "toner", brand: "Velvet & Co", name: "Calm Essence Toner", price: 34, keyIngredients: ["Centella", "Hyaluronic Acid", "Panthenol"] },
  { id: "sk-30", type: "toner", brand: "Daily Glow", name: "Soothing Toner", price: 10, keyIngredients: ["Centella", "Panthenol"] },
  { id: "sk-31", type: "toner", brand: "Bloom Beauty", name: "Exfoliating Toner", price: 16, keyIngredients: ["Glycolic Acid", "Salicylic Acid"], extraIngredients: ["Alcohol Denat."] },
];

// The full list puts key ingredients first, then the type's base ones, without
// repeating any (some key ingredients, like Glycerin, are also base ones).
export const skincareProducts = productList.map(({ extraIngredients = [], ...product }) => ({
  ...product,
  ingredients: [...new Set([...product.keyIngredients, ...baseIngredients[product.type], ...extraIngredients])],
  animalTesting: sampleAnimalTesting[product.brand],
}));
