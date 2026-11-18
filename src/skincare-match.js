// Finding skincare dupes: same type, cheaper, and sharing key ingredients.
import { checkIngredients, emptyAvoidList } from "./avoid-list.js";
import { skincareWarning } from "./ingredient-flags.js";

const MAX_DUPES = 5;
const MAX_SEARCH_RESULTS = 8;

// The product's ingredients worth watching, each with why.
export function ingredientsToWatch(product) {
  return product.ingredients
    .map((ingredient) => ({ ingredient, reason: skincareWarning(ingredient) }))
    .filter(({ reason }) => reason !== null);
}

// Nothing the user avoids and no flags they care about.
function isGentle(product, avoidList) {
  const { avoided, watched } = checkIngredients(product.ingredients, avoidList);
  return avoided.length === 0 && watched.length === 0;
}

// Cheaper products of the same type that share at least one key ingredient,
// most shared ingredients first, then cheapest. Each dupe lists what it shares.
// With gentleOnly, dupes with any ingredient to watch or on the user's avoid
// list are left out.
export function findSkincareDupes(product, allProducts, { gentleOnly = false, avoidList = emptyAvoidList } = {}) {
  return allProducts
    .filter((other) => other.id !== product.id && other.type === product.type && other.price < product.price)
    .filter((other) => !gentleOnly || isGentle(other, avoidList))
    .map((other) => ({
      ...other,
      sharedIngredients: product.keyIngredients.filter((ingredient) => other.keyIngredients.includes(ingredient)),
    }))
    .filter((other) => other.sharedIngredients.length > 0)
    .sort((a, b) => b.sharedIngredients.length - a.sharedIngredients.length || a.price - b.price)
    .slice(0, MAX_DUPES);
}

// Products whose name, brand, or type contains every word typed, ignoring
// capital letters, so "glow serum" finds "Glow Serum" by Luxe Atelier.
export function searchSkincare(query, allProducts) {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    return [];
  }
  return allProducts
    .filter((product) => {
      const text = `${product.name} ${product.brand} ${product.type}`.toLowerCase();
      return words.every((word) => text.includes(word));
    })
    .slice(0, MAX_SEARCH_RESULTS);
}
