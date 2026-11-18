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
// skincare passes its own rule and calls them "ingredients" instead.
export function ingredientList(ingredients, { warningFor = dyeWarning, watchedName = "dye" } = {}) {
  const list = document.createElement("ul");
  list.className = "ingredient-list";
  let flaggedCount = 0;
  for (const ingredient of ingredients) {
    const item = document.createElement("li");
    const warning = warningFor(ingredient);
    if (warning) {
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

// "✓ No ingredients to watch", or the ones to watch with their reasons. Takes
// the watched ingredients as { ingredient, reason } pairs. Ingredients with
// the same reason share one line ("Limonene, Linalool: A fragrance allergen…")
// so a label with many fragrance allergens doesn't repeat itself.
export function ingredientCheck(watched) {
  const check = document.createElement("div");
  check.className = watched.length === 0 ? "ingredient-check gentle" : "ingredient-check watch";
  const heading = document.createElement("p");
  heading.textContent =
    watched.length === 0
      ? "✓ No ingredients to watch"
      : `⚠️ ${watched.length} ${watched.length === 1 ? "ingredient" : "ingredients"} to watch:`;
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
  return check;
}
