// Shared pieces of a product's details: its animal testing status and its
// ingredient list with dyes to watch called out.
import { dyeWarning } from "./ingredient-flags.js";

const animalTestingLabels = {
  "cruelty-free": "🐰 Cruelty-free",
  tested: "Tested on animals",
  unknown: "Animal testing: unknown",
};

export function animalTestingBadge(status) {
  const badge = document.createElement("p");
  const knownStatus = status in animalTestingLabels ? status : "unknown";
  badge.className = `animal-testing animal-testing-${knownStatus}`;
  badge.textContent = animalTestingLabels[knownStatus];
  return badge;
}

// Lists the ingredients, flagging the ones worth watching. Makeup flags dyes;
// skincare passes its own rule and calls them "ingredients" instead. The rule
// returns a reason, or { avoided: true, reason } for an ingredient on the
// user's own avoid list, which gets ⛔ and isn't counted as one to watch.
export function ingredientList(ingredients, { warningFor = dyeWarning, watchedName = "dye" } = {}) {
  const list = document.createElement("ul");
  list.className = "ingredient-list";
  let flaggedCount = 0;
  for (const ingredient of ingredients) {
    const item = document.createElement("li");
    const warning = warningFor(ingredient);
    if (warning?.avoided) {
      item.className = "ingredient-flagged ingredient-avoided";
      item.textContent = `⛔ ${ingredient}: ${warning.reason}`;
    } else if (warning) {
      flaggedCount += 1;
      item.className = "ingredient-flagged";
      item.textContent = `⚠️ ${ingredient}: ${warning}`;
    } else {
      item.textContent = ingredient;
    }
    list.append(item);
  }

  const summary = document.createElement("p");
  summary.className = "dye-summary";
  summary.textContent =
    flaggedCount === 0
      ? `No ${watchedName}s to watch.`
      : `${flaggedCount} ${flaggedCount === 1 ? watchedName : `${watchedName}s`} to watch.`;

  const fragment = document.createDocumentFragment();
  fragment.append(summary, list);
  return fragment;
}

// The summary at the top of a skincare card, following the user's own list:
// "⛔ Contains 1 ingredient you avoid: Coconut Oil", then the ingredients to
// watch with their reasons (or "✓ No ingredients to watch"), then a quiet note
// naming flags left out because the user is OK with them. Takes the result of
// checkIngredients. Ingredients with the same reason share one line
// ("Limonene, Linalool: A fragrance allergen…") so a label with many fragrance
// allergens doesn't repeat itself.
export function ingredientCheck({ avoided, watched, okWith = [] }) {
  const check = document.createElement("div");
  const level = avoided.length > 0 ? "avoid" : watched.length > 0 ? "watch" : "gentle";
  check.className = `ingredient-check ${level}`;
  if (avoided.length > 0) {
    const banner = document.createElement("p");
    banner.className = "avoided-banner";
    banner.textContent = `⛔ Contains ${avoided.length} ${avoided.length === 1 ? "ingredient" : "ingredients"} you avoid: ${avoided.join(", ")}`;
    check.append(banner);
  }

  const heading = document.createElement("p");
  if (watched.length > 0) {
    heading.textContent = `⚠️ ${watched.length} ${watched.length === 1 ? "ingredient" : "ingredients"} to watch:`;
  } else {
    heading.textContent = avoided.length > 0 ? "No other ingredients to watch" : "✓ No ingredients to watch";
  }
  check.append(heading);
  if (watched.length > 0) {
    const list = document.createElement("ul");
    const ingredientsByReason = new Map();
    for (const { ingredient, reason } of watched) {
      ingredientsByReason.set(reason, [...(ingredientsByReason.get(reason) ?? []), ingredient]);
    }
    for (const [reason, ingredients] of ingredientsByReason) {
      const item = document.createElement("li");
      item.textContent = `${ingredients.join(", ")}: ${reason}`;
      list.append(item);
    }
    check.append(list);
  }

  if (okWith.length > 0) {
    const note = document.createElement("p");
    note.className = "ok-with";
    note.textContent = `Not flagged because you're OK with: ${okWith.join(", ")}`;
    check.append(note);
  }
  return check;
}
