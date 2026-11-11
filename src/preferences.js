// What the user cares about in a product, and whether a product fits it.
// Choices are remembered in this browser so they're there next visit.
import { dyeWarning, isAnimalIngredient } from "./ingredient-flags.js";

const PREFERENCES_STORAGE = "shadeFinder.preferences";

export const noPreferences = { crueltyFree: false, noDyes: false, vegan: false, maxPrice: null };

export function hasPreferences(preferences) {
  return preferences.crueltyFree || preferences.noDyes || preferences.vegan || preferences.maxPrice !== null;
}

// One true/false per checked preference: does the product meet it?
function checkedPreferenceResults(product, preferences) {
  const results = [];
  if (preferences.crueltyFree) {
    results.push(product.animalTesting === "cruelty-free");
  }
  if (preferences.noDyes) {
    results.push(!product.ingredients.some((ingredient) => dyeWarning(ingredient)));
  }
  if (preferences.vegan) {
    results.push(!product.ingredients.some(isAnimalIngredient));
  }
  if (preferences.maxPrice !== null) {
    results.push(product.price <= preferences.maxPrice);
  }
  return results;
}

export function fitsPreferences(product, preferences) {
  return checkedPreferenceResults(product, preferences).every((met) => met);
}

// The share of checked preferences the product meets, 0–100, or null when
// nothing is checked. Kept separate from the color match percent.
export function preferenceFitPercent(product, preferences) {
  const results = checkedPreferenceResults(product, preferences);
  if (results.length === 0) {
    return null;
  }
  const metCount = results.filter((met) => met).length;
  return Math.round((metCount / results.length) * 100);
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
