// "What's irritating my skin?": looks for ingredients that the user's
// irritating products have in common and their products that worked don't.
// It finds a pattern, not a cause, so the page says a patch test can confirm.
import { ingredientWords } from "./avoid-list.js";

export const MIN_IRRITATED = 2;
const MAX_SUSPECTS = 8;

// One name per ingredient, however the label writes it: "Parfum (Fragrance)",
// "PARFUM", and "Fragrance" are all "parfum"; "Cocos Nucifera (Coconut) Oil" is
// "cocos nucifera oil". Water is left out (null), since it isn't a suspect.
export function ingredientKey(ingredient) {
  const words = ingredientWords(ingredient.replace(/\([^)]*\)|\[[^\]]*\]/g, " "));
  const key = [...new Set(words)].join(" ");
  if (key === "" || key.split(" ").every((word) => word === "aqua")) {
    return null;
  }
  return key;
}

// The ingredients of each product, by key, with the label's name for each.
function keysOf(product) {
  const names = new Map();
  for (const ingredient of product.ingredients) {
    const key = ingredientKey(ingredient);
    if (key && !names.has(key)) {
      names.set(key, ingredient.replace(/\s+/g, " ").trim());
    }
  }
  return names;
}

// Returns { irritatedCount, goodCount, suspects }, where each suspect is
// { name, inIrritated, inGood: 0 }: an ingredient in at least two irritating
// products and in none that worked, most shared first.
export function findSuspects(myProducts) {
  const irritated = myProducts.filter((product) => product.reaction === "irritated").map(keysOf);
  const good = myProducts.filter((product) => product.reaction === "good").map(keysOf);
  const result = { irritatedCount: irritated.length, goodCount: good.length, suspects: [] };
  if (irritated.length < MIN_IRRITATED) {
    return result;
  }

  const counts = new Map();
  for (const names of irritated) {
    for (const [key, name] of names) {
      const seen = counts.get(key) ?? { name, inIrritated: 0 };
      seen.inIrritated += 1;
      counts.set(key, seen);
    }
  }
  result.suspects = [...counts]
    .filter(([key, { inIrritated }]) => inIrritated >= MIN_IRRITATED && good.every((names) => !names.has(key)))
    .map(([, { name, inIrritated }]) => ({ name, inIrritated, inGood: 0 }))
    .sort((a, b) => b.inIrritated - a.inIrritated || a.name.localeCompare(b.name))
    .slice(0, MAX_SUSPECTS);
  return result;
}
