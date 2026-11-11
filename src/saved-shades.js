// The shades the user saved, kept as product ids in this browser so the list
// is still there next visit.

const SAVED_SHADES_STORAGE = "shadeFinder.savedShades";

// Adds the id if it isn't saved yet, or removes it if it is. Returns a new
// list so the caller decides when to store it.
export function toggleSavedShade(savedIds, productId) {
  return savedIds.includes(productId)
    ? savedIds.filter((id) => id !== productId)
    : [...savedIds, productId];
}

// Browser storage can be blocked (for example in private windows); the app
// then still works, it just won't remember saved shades.
export function loadSavedShades() {
  try {
    const saved = JSON.parse(localStorage.getItem(SAVED_SHADES_STORAGE) ?? "[]");
    return Array.isArray(saved) ? saved.filter((id) => typeof id === "string") : [];
  } catch {
    return [];
  }
}

export function storeSavedShades(savedIds) {
  try {
    localStorage.setItem(SAVED_SHADES_STORAGE, JSON.stringify(savedIds));
  } catch {
    // Not remembered, but the list still works for this visit.
  }
}
