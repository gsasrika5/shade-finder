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

export function ingredientList(ingredients) {
  const list = document.createElement("ul");
  list.className = "ingredient-list";
  let flaggedCount = 0;
  for (const ingredient of ingredients) {
    const item = document.createElement("li");
    const warning = dyeWarning(ingredient);
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
    flaggedCount === 0 ? "No dyes to watch." : `${flaggedCount} ${flaggedCount === 1 ? "dye" : "dyes"} to watch.`;

  const fragment = document.createDocumentFragment();
  fragment.append(summary, list);
  return fragment;
}
