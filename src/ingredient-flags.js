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
    group: "fragrance",
    pattern: /\bfragrance\b|\bparfum\b/i,
    reason: "A common cause of irritation and allergies for sensitive skin.",
  },
  {
    group: "parabens",
    pattern: /paraben\b/i,
    reason: "A preservative some people avoid; it can irritate sensitive skin.",
  },
  {
    group: "formaldehyde",
    pattern: /\bdmdm hydantoin\b|\b(imidazolidinyl|diazolidinyl) urea\b|\bquaternium-15\b|\bbronopol\b/i,
    reason: "A preservative that slowly releases small amounts of formaldehyde, which can irritate skin.",
  },
  {
    group: "drying-alcohol",
    pattern: /\balcohol denat\.?|\bsd alcohol\b/i,
    reason: "Can dry out and irritate skin, especially high on the list.",
  },
  {
    group: "oxybenzone",
    pattern: /\boxybenzone\b|\bbenzophenone-3\b/i,
    reason: "A sunscreen filter some people avoid for skin allergies and its effect on coral reefs.",
  },
  {
    group: "sulfates",
    pattern: /\bsodium laur(yl|eth) sulfate\b/i,
    reason: "A strong cleanser that can strip and dry out skin.",
  },
  {
    group: "formaldehyde",
    pattern: /\bformaldehyde\b|\bformalin\b|\bmethylene glycol\b/i,
    reason: "Formaldehyde itself: a strong irritant and allergen that is also linked to cancer at high exposure.",
  },
  {
    group: "isothiazolinones",
    pattern: /\bmethyl(chloro)?isothiazolinone\b/i,
    reason: "A preservative that is one of the most common causes of skin allergies.",
  },
  {
    group: "triclosan",
    pattern: /\btriclosan\b|\btriclocarban\b/i,
    reason: "An antibacterial the FDA removed from soaps in 2016 over safety questions.",
  },
  {
    group: "hydroquinone",
    pattern: /\bhydroquinone\b/i,
    reason: "A skin lightener that is prescription-only in the US; it can irritate and, with long use, darken skin.",
  },
  {
    group: "mercury",
    pattern: /\bmercur(y|ic|ous)\b|\bthimerosal\b|\bcalomel\b/i,
    reason: "Mercury can be poisonous; it's banned in US skincare but turns up in some imported skin lighteners.",
  },
  {
    group: "phthalates",
    pattern: /phthalate\b/i,
    reason: "A group of chemicals some people avoid over concerns about hormone effects.",
  },
  // Only the full name: in skincare "BHA" usually means salicylic acid.
  {
    group: "bha",
    pattern: /\bbutylated hydroxyanisole\b/i,
    reason: "A preservative listed as a possible cause of cancer; some people avoid it.",
  },
  {
    group: "fragrance-allergens",
    pattern: /\b(limonene|linalool|citral|geraniol|eugenol|isoeugenol|coumarin|citronellol|cinnamal|hydroxycitronellal)\b/i,
    reason: "A fragrance allergen that EU labels must name; it can irritate sensitive skin.",
  },
];

// The kinds of skincare flags, by group, with the name people see when they
// choose which ones they care about.
export const skincareFlagGroups = [
  { id: "fragrance", label: "Fragrance" },
  { id: "fragrance-allergens", label: "Fragrance allergens (limonene, linalool, and others)" },
  { id: "parabens", label: "Parabens" },
  { id: "formaldehyde", label: "Formaldehyde and preservatives that release it" },
  { id: "isothiazolinones", label: "MI and MCI preservatives" },
  { id: "drying-alcohol", label: "Drying alcohol" },
  { id: "sulfates", label: "Sulfates" },
  { id: "oxybenzone", label: "Oxybenzone" },
  { id: "phthalates", label: "Phthalates" },
  { id: "bha", label: "BHA (the preservative)" },
  { id: "triclosan", label: "Triclosan" },
  { id: "hydroquinone", label: "Hydroquinone" },
  { id: "mercury", label: "Mercury" },
  { id: "dyes", label: "Dyes" },
];

// Returns { group, reason } for a skincare ingredient worth watching
// (including dyes), or null if it isn't on the list.
export function skincareFlag(ingredient) {
  const match = skincareIngredientsToWatch.find((watched) => watched.pattern.test(ingredient));
  if (match) {
    return { group: match.group, reason: match.reason };
  }
  const dyeReason = dyeWarning(ingredient);
  return dyeReason ? { group: "dyes", reason: dyeReason } : null;
}

// Returns why a skincare ingredient is worth watching (including dyes), or
// null if it isn't on the list.
export function skincareWarning(ingredient) {
  return skincareFlag(ingredient)?.reason ?? null;
}

// Ingredients that come from animals, so a product with any of them isn't vegan.
const animalIngredients =
  /\bbeeswax\b|\bcera alba\b|\bcarmine\b|\bci ?75470\b|\bcochineal\b|\blanolin\b|\bshellac\b|\bguanine\b|\bhoney\b|\btallow\b|\bcollagen\b|\bkeratin\b|\bsilk\b/i;

export function isAnimalIngredient(ingredient) {
  return animalIngredients.test(ingredient);
}
