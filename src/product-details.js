// Shared pieces of a product's details: its animal testing status and its
// ingredient list with dyes to watch called out.
import { dyeFlag, flagLevels } from "./ingredient-flags.js";

const LEVEL_ORDER = ["restricted", "irritant", "debated"];

// A link to where a flag's reason comes from, opening in a new tab so the
// app keeps its place.
function sourceLink(source) {
  const link = document.createElement("a");
  link.className = "flag-source";
  link.href = source.url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = "Source";
  link.title = source.name;
  link.setAttribute("aria-label", `Source: ${source.name} (opens in a new tab)`);
  return link;
}

// Fills an element with "🚫 Mercury: reason Source", for a flag with a level,
// reason, and source.
function writeFlag(element, names, flag) {
  const level = flagLevels[flag.level] ?? flagLevels.irritant;
  element.dataset.level = flag.level;
  element.title = level.label;
  element.append(`${level.icon} ${names}: ${flag.reason} `);
  if (flag.source) {
    element.append(sourceLink(flag.source));
  }
}

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
// returns a flag ({ level, reason, source }), or { avoided: true, reason } for
// an ingredient on the user's own avoid list, which gets ⛔ and isn't counted
// as one to watch.
export function ingredientList(ingredients, { warningFor = dyeFlag, watchedName = "dye" } = {}) {
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
      writeFlag(item, ingredient, warning);
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
    const mostSerious = LEVEL_ORDER.find((level) => watched.some((flag) => flag.level === level)) ?? "irritant";
    heading.textContent = `${flagLevels[mostSerious].icon} ${watched.length} ${watched.length === 1 ? "ingredient" : "ingredients"} to watch:`;
  } else {
    heading.textContent = avoided.length > 0 ? "No other ingredients to watch" : "✓ No ingredients to watch";
  }
  check.append(heading);
  if (watched.length > 0) {
    const list = document.createElement("ul");
    // Most serious first, ingredients sharing a reason on one line.
    const byReason = new Map();
    for (const flag of watched) {
      const line = byReason.get(flag.reason) ?? { flag, ingredients: [] };
      line.ingredients.push(flag.ingredient);
      byReason.set(flag.reason, line);
    }
    const lines = [...byReason.values()].sort(
      (a, b) => LEVEL_ORDER.indexOf(a.flag.level) - LEVEL_ORDER.indexOf(b.flag.level),
    );
    for (const { flag, ingredients } of lines) {
      const item = document.createElement("li");
      writeFlag(item, ingredients.join(", "), flag);
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
