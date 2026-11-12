// How the matches on screen are ordered, and remembering the user's choice.

const SORT_STORAGE = "shadeFinder.sortBy";
export const SORT_CHOICES = ["closest", "price"];

// "closest" keeps the order the matches already have: by what matters to the
// user, then by color. "price" keeps matches that fit what matters to the
// user on top, then puts the cheapest first within each group. Only the
// order changes; the same matches are shown either way.
export function sortMatches(matches, sortBy) {
  if (sortBy !== "price") {
    return matches;
  }
  return [...matches].sort(
    (a, b) => (b.fitPercent ?? 0) - (a.fitPercent ?? 0) || a.price - b.price || a.distance - b.distance,
  );
}

// Browser storage can be blocked (for example in private windows); the app
// then sorts by closest match and just won't remember the choice.
export function loadSortChoice() {
  try {
    const saved = localStorage.getItem(SORT_STORAGE);
    return SORT_CHOICES.includes(saved) ? saved : "closest";
  } catch {
    return "closest";
  }
}

export function saveSortChoice(sortBy) {
  try {
    localStorage.setItem(SORT_STORAGE, sortBy);
  } catch {
    // Not remembered, but the choice still applies for this visit.
  }
}
