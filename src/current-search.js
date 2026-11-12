// Remembers the photo and choices on the main page for this browser tab, so
// going to the saved shades page and coming back doesn't lose them. Session
// storage is cleared when the tab closes, so photos don't pile up.

const CURRENT_SEARCH_STORAGE = "shadeFinder.currentSearch";

// Returns false when the search couldn't be stored, for example when the
// photo is too big for session storage or storage is blocked.
export function rememberSearch(search) {
  try {
    sessionStorage.setItem(CURRENT_SEARCH_STORAGE, JSON.stringify(search));
    return true;
  } catch {
    return false;
  }
}

export function forgetSearch() {
  try {
    sessionStorage.removeItem(CURRENT_SEARCH_STORAGE);
  } catch {
    // Nothing was stored.
  }
}

// Checks that a stored search looks right before it's used. The photo must be
// an image data URL, since it becomes an image source, and a saved color must
// be a plain #rrggbb, since it goes into a style.
export function isValidSearch(search) {
  const numbers = [search?.originalWidth, search?.originalHeight, search?.tapX, search?.tapY];
  const texts = [search?.brand, search?.paidPrice, search?.category];
  return (
    typeof search?.photo === "string" &&
    /^data:image\/(png|jpeg);base64,/.test(search.photo) &&
    numbers.every((number) => Number.isFinite(number) && number >= 0) &&
    texts.every((text) => typeof text === "string") &&
    (search.color === undefined || (typeof search.color === "string" && /^#[0-9a-f]{6}$/i.test(search.color)))
  );
}

// Returns the remembered search, or null when there is none or it doesn't
// look right.
export function recallSearch() {
  try {
    const search = JSON.parse(sessionStorage.getItem(CURRENT_SEARCH_STORAGE) ?? "null");
    return isValidSearch(search) ? search : null;
  } catch {
    return null;
  }
}
