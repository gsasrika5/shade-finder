// "My ingredients to avoid": which kinds of flags the user cares about, plus
// ingredients they add themselves (like one they're allergic to). Saved on
// this device, like the other preferences.
import { skincareFlag, skincareFlagGroups } from "./ingredient-flags.js";

const AVOID_LIST_STORAGE = "shadeFinder.avoidList";
const CHANGE_EVENT = "shadeFinder:avoidListChange";
export const MAX_CUSTOM_LENGTH = 40;

// Everything flagged, nothing added: how the app worked before the list.
// Groups the user unchecks are stored (rather than the checked ones), so a
// kind of flag added to the app later starts out checked.
export const emptyAvoidList = Object.freeze({ okGroups: [], custom: [] });

// Words labels use for the same thing, mapped to one, so "Parfum" on a list
// catches "Fragrance" on a label and the other way around.
const SAME_INGREDIENT = { fragrance: "parfum", eau: "aqua", water: "aqua" };

// An ingredient's words in a form that compares well: lowercase, no accents
// or punctuation, and one name for words that mean the same thing.
export function ingredientWords(text) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((word) => word !== "")
    .map((word) => SAME_INGREDIENT[word] ?? word);
}

// True if every word the user typed appears in the ingredient, so "coconut
// oil" catches "Cocos Nucifera (Coconut) Oil" and "shea" catches "Shea Butter".
export function matchesCustom(ingredient, entry) {
  const words = ingredientWords(ingredient);
  const entryWords = ingredientWords(entry);
  return entryWords.length > 0 && entryWords.every((word) => words.includes(word));
}

// Sorts a product's ingredients into the ones on the user's own list
// (avoided), flags they care about (watched, with a reason), and flags they
// said they're OK with (okWith, by group name).
export function checkIngredients(ingredients, avoidList = emptyAvoidList) {
  const avoided = [];
  const watched = [];
  const okWith = new Set();
  for (const ingredient of ingredients) {
    if (avoidList.custom.some((entry) => matchesCustom(ingredient, entry))) {
      avoided.push(ingredient);
      continue;
    }
    const flag = skincareFlag(ingredient);
    if (!flag) {
      continue;
    }
    if (avoidList.okGroups.includes(flag.group)) {
      okWith.add(skincareFlagGroups.find((group) => group.id === flag.group).label);
    } else {
      watched.push({ ingredient, reason: flag.reason });
    }
  }
  return { avoided, watched, okWith: [...okWith] };
}

// The rule for flagging ingredients in a product's full list (see
// ingredientList), following the user's choices: their own ingredients are
// marked as avoided, and flags they're OK with aren't shown.
export function personalWarning(avoidList = emptyAvoidList) {
  return (ingredient) => {
    if (avoidList.custom.some((entry) => matchesCustom(ingredient, entry))) {
      return { avoided: true, reason: "On your list of ingredients to avoid." };
    }
    const flag = skincareFlag(ingredient);
    return flag && !avoidList.okGroups.includes(flag.group) ? flag.reason : null;
  };
}

// Checks something typed into "Add an ingredient". Returns { entry } with the
// cleaned-up text, or { problem } saying what to fix.
export function validateCustom(text, avoidList) {
  const entry = text.trim().replace(/\s+/g, " ");
  if (ingredientWords(entry).length === 0) {
    return { problem: "Type an ingredient name first, like coconut oil." };
  }
  if (entry.length > MAX_CUSTOM_LENGTH) {
    return { problem: `Keep it under ${MAX_CUSTOM_LENGTH} characters, just the ingredient's name.` };
  }
  if (avoidList.custom.some((existing) => existing.toLowerCase() === entry.toLowerCase())) {
    return { problem: `"${entry}" is already on your list.` };
  }
  return { entry };
}

// Browser storage can be blocked (for example in private windows), or hold
// something unexpected; then the list starts empty.
export function loadAvoidList() {
  try {
    const saved = JSON.parse(localStorage.getItem(AVOID_LIST_STORAGE));
    const knownGroups = skincareFlagGroups.map((group) => group.id);
    return {
      okGroups: (saved?.okGroups ?? []).filter((group) => knownGroups.includes(group)),
      custom: (saved?.custom ?? []).filter((entry) => typeof entry === "string" && entry.trim() !== ""),
    };
  } catch {
    return { okGroups: [], custom: [] };
  }
}

// Saves the list and tells every part of the page showing products to update.
export function saveAvoidList(avoidList) {
  try {
    localStorage.setItem(AVOID_LIST_STORAGE, JSON.stringify(avoidList));
  } catch {
    // Not remembered, but it still applies for this visit.
  }
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: avoidList }));
}

export function onAvoidListChange(callback) {
  window.addEventListener(CHANGE_EVENT, (event) => callback(event.detail));
}
