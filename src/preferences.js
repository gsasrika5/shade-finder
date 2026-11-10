// What the user cares about in a product, and whether a product fits it.
// Choices are remembered in this browser so they're there next visit.
import { dyeWarning, isAnimalIngredient } from "./ingredient-flags.js";

const PREFERENCES_STORAGE = "shadeFinder.preferences";

export const noPreferences = { crueltyFree: false, noDyes: false, vegan: false, maxPrice: null };

export function hasPreferences(preferences) {
  return preferences.crueltyFree || preferences.noDyes || preferences.vegan || preferences.maxPrice !== null;
}

export function fitsPreferences(product, preferences) {
  if (preferences.crueltyFree && product.animalTesting !== "cruelty-free") {
    return false;
  }
  if (preferences.noDyes && product.ingredients.some((ingredient) => dyeWarning(ingredient))) {
    return false;
  }
  if (preferences.vegan && product.ingredients.some(isAnimalIngredient)) {
    return false;
  }
  if (preferences.maxPrice !== null && product.price > preferences.maxPrice) {
    return false;
  }
  return true;
}

// Browser storage can be blocked (for example in private windows); the app
// then still works, it just won't remember the choices.
export function loadPreferences() {
  try {
    const saved = JSON.parse(localStorage.getItem(PREFERENCES_STORAGE) ?? "null");
    return { ...noPreferences, ...saved };
  } catch {
    return { ...noPreferences };
  }
}

export function savePreferences(preferences) {
  try {
    localStorage.setItem(PREFERENCES_STORAGE, JSON.stringify(preferences));
  } catch {
    // Not remembered, but the choices still apply for this visit.
  }
}
