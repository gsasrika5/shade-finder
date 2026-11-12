// Dyes that people commonly avoid in makeup, with a short reason for each.
// Ingredient labels name dyes several ways ("Red 40", "FD&C Red No. 40",
// "CI 16035", "Allura Red"), so each pattern covers the common spellings.
const dyesToWatch = [
  {
    pattern: /\bred (no\.? ?)?40\b|\bci ?16035\b|\ballura red\b/i,
    reason: "Synthetic dye that can irritate sensitive skin.",
  },
  {
    pattern: /\bred (no\.? ?)?3\b|\bci ?45430\b|\berythrosine\b/i,
    reason: "Banned in US cosmetics since 1990 after cancer findings in animal studies.",
  },
  {
    pattern: /\byellow (no\.? ?)?5\b|\bci ?19140\b|\btartrazine\b/i,
    reason: "A known cause of allergic reactions.",
  },
  {
    pattern: /\byellow (no\.? ?)?6\b|\bci ?15985\b|\bsunset yellow\b/i,
    reason: "Synthetic dye linked to allergic reactions in some people.",
  },
  {
    pattern: /\bred (no\.? ?)?(6|7|27|28)\b|\bci ?(15850|45410)\b/i,
    reason: "Coal-tar dye; some people avoid these.",
  },
  {
    pattern: /\bblue (no\.? ?)?1\b|\bci ?42090\b|\bbrilliant blue\b/i,
    reason: "Coal-tar dye; some people avoid these.",
  },
  {
    pattern: /\bcarmine\b|\bci ?75470\b|\bcochineal\b/i,
    reason: "Made from insects, so not vegan, and can cause allergic reactions.",
  },
];

// Returns why an ingredient is worth watching, or null if it isn't on the list.
export function dyeWarning(ingredient) {
  const match = dyesToWatch.find((dye) => dye.pattern.test(ingredient));
  return match ? match.reason : null;
}

// Skincare ingredients that people with sensitive skin commonly avoid. They're
// legal and fine for many people, so each has a short, neutral reason rather
// than being called unsafe. Fatty alcohols like cetearyl alcohol aren't drying,
// so only "alcohol denat." and "SD alcohol" count as drying alcohol.
const skincareIngredientsToWatch = [
  {
    pattern: /\bfragrance\b|\bparfum\b/i,
    reason: "A common cause of irritation and allergies for sensitive skin.",
  },
  {
    pattern: /paraben\b/i,
    reason: "A preservative some people avoid; it can irritate sensitive skin.",
  },
  {
    pattern: /\bdmdm hydantoin\b|\b(imidazolidinyl|diazolidinyl) urea\b|\bquaternium-15\b|\bbronopol\b/i,
    reason: "A preservative that slowly releases small amounts of formaldehyde, which can irritate skin.",
  },
  {
    pattern: /\balcohol denat\.?|\bsd alcohol\b/i,
    reason: "Can dry out and irritate skin, especially high on the list.",
  },
  {
    pattern: /\boxybenzone\b|\bbenzophenone-3\b/i,
    reason: "A sunscreen filter some people avoid for skin allergies and its effect on coral reefs.",
  },
  {
    pattern: /\bsodium laur(yl|eth) sulfate\b/i,
    reason: "A strong cleanser that can strip and dry out skin.",
  },
];

// Returns why a skincare ingredient is worth watching (including dyes), or
// null if it isn't on the list.
export function skincareWarning(ingredient) {
  const match = skincareIngredientsToWatch.find((watched) => watched.pattern.test(ingredient));
  return match ? match.reason : dyeWarning(ingredient);
}

// Ingredients that come from animals, so a product with any of them isn't vegan.
const animalIngredients =
  /\bbeeswax\b|\bcera alba\b|\bcarmine\b|\bci ?75470\b|\bcochineal\b|\blanolin\b|\bshellac\b|\bguanine\b|\bhoney\b|\btallow\b|\bcollagen\b|\bkeratin\b|\bsilk\b/i;

export function isAnimalIngredient(ingredient) {
  return animalIngredients.test(ingredient);
}
