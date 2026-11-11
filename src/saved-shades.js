// The shades the user saved, kept in this browser so the list is still there
// next visit. Each one is { id, yourColor, match }: the product, plus the
// color the user tapped and how close the match was, so the list can show
// the two side by side.

const SAVED_SHADES_STORAGE = "shadeFinder.savedShades";

export function isSaved(savedShades, productId) {
  return savedShades.some((shade) => shade.id === productId);
}

// Adds the shade if it isn't saved yet, or removes it if it is. Returns a new
// list so the caller decides when to store it.
export function toggleSavedShade(savedShades, productId, { yourColor, match } = {}) {
  return isSaved(savedShades, productId)
    ? savedShades.filter((shade) => shade.id !== productId)
    : [...savedShades, cleanSavedShade({ id: productId, yourColor, match })];
}

// Keeps only values that are safe to show: the color goes into a style, so it
// must be a plain #rrggbb. Lists saved before colors were remembered held
// bare ids; those load as { id } and show a single swatch.
function cleanSavedShade(saved) {
  const shade = { id: saved.id };
  if (typeof saved.yourColor === "string" && /^#[0-9a-f]{6}$/i.test(saved.yourColor)) {
    shade.yourColor = saved.yourColor;
  }
  if (Number.isFinite(saved.match) && saved.match >= 0 && saved.match <= 100) {
    shade.match = Math.round(saved.match);
  }
  return shade;
}

// Browser storage can be blocked (for example in private windows); the app
// then still works, it just won't remember saved shades.
export function loadSavedShades() {
  try {
    const saved = JSON.parse(localStorage.getItem(SAVED_SHADES_STORAGE) ?? "[]");
    if (!Array.isArray(saved)) {
      return [];
    }
    return saved
      .map((entry) => (typeof entry === "string" ? { id: entry } : entry))
      .filter((entry) => typeof entry?.id === "string")
      .map(cleanSavedShade);
  } catch {
    return [];
  }
}

export function storeSavedShades(savedShades) {
  try {
    localStorage.setItem(SAVED_SHADES_STORAGE, JSON.stringify(savedShades));
  } catch {
    // Not remembered, but the list still works for this visit.
  }
}
