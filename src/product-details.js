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
