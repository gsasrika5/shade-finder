// Products the user looked at earlier in this tab, newest first, so they can
// add another product and come back to earlier ones. Kept in session storage
// like the current search, and limited so photos don't fill it.
import { isValidSearch } from "./current-search.js";

const RECENT_PRODUCTS_STORAGE = "shadeFinder.recentProducts";
export const MAX_RECENT_PRODUCTS = 5;

export function addRecentProduct(recentProducts, product) {
  return [product, ...recentProducts].slice(0, MAX_RECENT_PRODUCTS);
}

export function loadRecentProducts() {
  try {
    const saved = JSON.parse(sessionStorage.getItem(RECENT_PRODUCTS_STORAGE) ?? "[]");
    return Array.isArray(saved) ? saved.filter((product) => isValidSearch(product) && product.color) : [];
  } catch {
    return [];
  }
}

// Stores the list, dropping the oldest products if the photos don't all fit.
// Returns what was actually stored, so the page shows the same list.
export function storeRecentProducts(recentProducts) {
  for (let kept = recentProducts; ; kept = kept.slice(0, -1)) {
    try {
      sessionStorage.setItem(RECENT_PRODUCTS_STORAGE, JSON.stringify(kept));
      return kept;
    } catch {
      if (kept.length === 0) {
        return [];
      }
    }
  }
}
