// Ingredients worth watching, each with a level, a short reason, and the
// source the reason comes from. Reasons were checked against these sources on
// 2026-11-18; each is worded neutrally, since most flagged ingredients are
// legal and fine for many people.

// How serious a flag is. "restricted": banned or not allowed over the counter
// somewhere major. "irritant": a common cause of skin irritation or allergy.
// "debated": allowed by regulators, but some people avoid it.
export const flagLevels = {
  restricted: { icon: "🚫", label: "Restricted" },
  irritant: { icon: "⚠️", label: "Irritant or allergen" },
  debated: { icon: "ⓘ", label: "Debated" },
};

const sources = {
  fdaColorSummary: {
    name: "FDA: color additives allowed in the US",
    url: "https://www.fda.gov/industry/color-additives/summary-color-additives-use-united-states-foods-drugs-cosmetics-and-medical-devices",
  },
  fdaRed3: { name: "FDA: FD&C Red No. 3", url: "https://www.fda.gov/industry/color-additives/fdc-red-no-3" },
  fdaColorSafety: {
    name: "FDA: how safe are color additives?",
    url: "https://www.fda.gov/consumers/consumer-updates/how-safe-are-color-additives",
  },
  fdaCarmine: {
    name: "FDA: color additives Q&A",
    url: "https://www.fda.gov/food/color-additives-information-consumers/color-additives-questions-and-answers-consumers",
  },
  fdaAllergens: { name: "FDA: allergens in cosmetics", url: "https://www.fda.gov/cosmetics/cosmetic-ingredients/allergens-cosmetics" },
  euFragranceAllergens: {
    name: "EU Regulation 2023/1545 (fragrance allergen labels)",
    url: "https://eur-lex.europa.eu/eli/reg/2023/1545/oj",
  },
  fdaParabens: { name: "FDA: parabens in cosmetics", url: "https://www.fda.gov/cosmetics/cosmetic-ingredients/parabens-cosmetics" },
  euFormaldehydeReleasers: {
    name: "EU Regulation 2022/1181 (formaldehyde releasers)",
    url: "https://eur-lex.europa.eu/eli/reg/2022/1181/oj",
  },
  euFormaldehydeBan: {
    name: "EU Regulation 2019/831 (formaldehyde ban)",
    url: "https://legislation.gov.uk/eur/2019/831/contents",
  },
  euMethylisothiazolinone: {
    name: "EU Regulation 2016/1198 (MI in leave-on products)",
    url: "https://eur-lex.europa.eu/eli/reg/2016/1198/oj",
  },
  aadMoisturizer: {
    name: "American Academy of Dermatology: picking a moisturizer",
    url: "https://www.aad.org/public/everyday-care/skin-care-basics/dry/pick-moisturizer",
  },
  slsStudy: { name: "Study: SLS and the skin barrier (PubMed)", url: "https://pubmed.ncbi.nlm.nih.gov/19467032/" },
  fdaSunscreen: {
    name: "FDA: sunscreen Q&A",
    url: "https://www.fda.gov/drugs/understanding-over-counter-medicines/questions-and-answers-fdas-regulatory-actions-over-counter-sunscreen",
  },
  fdaPhthalates: { name: "FDA: phthalates in cosmetics", url: "https://www.fda.gov/cosmetics/cosmetic-ingredients/phthalates-cosmetics" },
  iarcBha: {
    name: "IARC monograph: butylated hydroxyanisole",
    url: "https://inchem.org/documents/iarc/vol40/butylatedhydroxyanisole.html",
  },
  fdaTriclosan: {
    name: "FDA: skip antibacterial soap",
    url: "https://www.fda.gov/consumers/consumer-updates/skip-antibacterial-soap-use-plain-soap-and-water",
  },
  fdaHydroquinone: {
    name: "FDA: OTC skin lightening products",
    url: "https://www.fda.gov/drugs/drug-safety-communications/fda-works-protect-consumers-potentially-harmful-otc-skin-lightening-products",
  },
  fdaMercury: {
    name: "FDA: skin products containing mercury",
    url: "https://www.fda.gov/consumers/health-fraud-scams/skin-products-containing-mercury",
  },
};

// Dyes people commonly avoid in makeup. Ingredient labels name dyes several
// ways ("Red 40", "FD&C Red No. 40", "CI 16035", "Allura Red"), so each pattern
// covers the common spellings.
const dyesToWatch = [
  {
    pattern: /\bred (no\.? ?)?40\b|\bci ?16035\b|\ballura red\b/i,
    level: "debated",
    reason: "An FDA-approved synthetic dye; some people prefer to avoid synthetic dyes.",
    source: sources.fdaColorSummary,
  },
  {
    pattern: /\bred (no\.? ?)?3\b|\bci ?45430\b|\berythrosine\b/i,
    level: "restricted",
    reason: "Not allowed in US cosmetics since 1990, after it caused cancer in animal studies.",
    source: sources.fdaRed3,
  },
  {
    pattern: /\byellow (no\.? ?)?5\b|\bci ?19140\b|\btartrazine\b/i,
    level: "irritant",
    reason: "Can cause itching and hives in some people, the FDA says, though this is rare.",
    source: sources.fdaColorSafety,
  },
  {
    pattern: /\byellow (no\.? ?)?6\b|\bci ?15985\b|\bsunset yellow\b/i,
    level: "debated",
    reason: "An FDA-approved synthetic dye; some people prefer to avoid synthetic dyes.",
    source: sources.fdaColorSummary,
  },
  {
    pattern: /\bred (no\.? ?)?(6|7|27|28)\b|\bci ?(15850|45410)\b/i,
    level: "debated",
    reason: "An FDA-certified synthetic dye made from petroleum; allowed, but some people avoid these.",
    source: sources.fdaColorSummary,
  },
  {
    pattern: /\bblue (no\.? ?)?1\b|\bci ?42090\b|\bbrilliant blue\b/i,
    level: "debated",
    reason: "An FDA-certified synthetic dye made from petroleum; allowed, but some people avoid these.",
    source: sources.fdaColorSummary,
  },
  {
    pattern: /\bcarmine\b|\bci ?75470\b|\bcochineal\b/i,
    level: "irritant",
    reason: "Made from insects, so not vegan; the FDA requires it on labels because it can cause severe allergic reactions.",
    source: sources.fdaCarmine,
  },
];

// Skincare ingredients people with sensitive skin commonly avoid. Fatty
// alcohols like cetearyl alcohol aren't drying, so only "alcohol denat." and
// "SD alcohol" count as drying alcohol.
const skincareIngredientsToWatch = [
  {
    group: "fragrance",
    pattern: /\bfragrance\b|\bparfum\b/i,
    level: "irritant",
    reason: "One of the most common causes of skin allergies from cosmetics, says the FDA.",
    source: sources.fdaAllergens,
  },
  {
    group: "parabens",
    pattern: /paraben\b/i,
    level: "debated",
    reason: "A common preservative. The FDA says it hasn't been shown to be harmful as used in cosmetics; some people avoid it over hormone concerns.",
    source: sources.fdaParabens,
  },
  {
    group: "formaldehyde",
    pattern: /\bdmdm hydantoin\b|\b(imidazolidinyl|diazolidinyl) urea\b|\bquaternium-15\b|\bbronopol\b/i,
    level: "irritant",
    reason: "A preservative that slowly releases formaldehyde, a common skin allergen; the EU requires a \"releases formaldehyde\" warning.",
    source: sources.euFormaldehydeReleasers,
  },
  {
    group: "drying-alcohol",
    pattern: /\balcohol denat\.?|\bsd alcohol\b/i,
    level: "irritant",
    reason: "Can dry out and irritate skin; dermatologists suggest avoiding it if your skin is dry or sensitive.",
    source: sources.aadMoisturizer,
  },
  {
    group: "oxybenzone",
    pattern: /\boxybenzone\b|\bbenzophenone-3\b/i,
    level: "debated",
    reason: "A sunscreen filter the FDA says needs more safety data, because the body absorbs it.",
    source: sources.fdaSunscreen,
  },
  {
    group: "sulfates",
    pattern: /\bsodium laur(yl|eth) sulfate\b/i,
    level: "irritant",
    reason: "A strong cleanser that can damage the skin's barrier and dry it out.",
    source: sources.slsStudy,
  },
  {
    group: "formaldehyde",
    pattern: /\bformaldehyde\b|\bformalin\b|\bmethylene glycol\b/i,
    level: "restricted",
    reason: "Banned in EU cosmetics since 2019 because it can cause cancer; also a strong skin allergen.",
    source: sources.euFormaldehydeBan,
  },
  {
    group: "isothiazolinones",
    pattern: /\bmethyl(chloro)?isothiazolinone\b/i,
    level: "irritant",
    reason: "A preservative that is a leading cause of skin allergies; the EU banned MI in leave-on products in 2017.",
    source: sources.euMethylisothiazolinone,
  },
  {
    group: "triclosan",
    pattern: /\btriclosan\b|\btriclocarban\b/i,
    level: "restricted",
    reason: "The FDA removed it from consumer antibacterial soaps in 2016, since makers hadn't shown it was safe for daily use.",
    source: sources.fdaTriclosan,
  },
  {
    group: "hydroquinone",
    pattern: /\bhydroquinone\b/i,
    level: "restricted",
    reason: "A skin lightener that can't be sold over the counter in the US since 2020; it can cause rashes and darkened skin.",
    source: sources.fdaHydroquinone,
  },
  {
    group: "mercury",
    pattern: /\bmercur(y|ic|ous)\b|\bthimerosal\b|\bcalomel\b/i,
    level: "restricted",
    reason: "Not allowed in US cosmetics beyond trace amounts; the FDA warns it can cause serious health problems and turns up in some imported skin lighteners.",
    source: sources.fdaMercury,
  },
  {
    group: "phthalates",
    pattern: /phthalate\b/i,
    level: "debated",
    reason: "The FDA says it has no evidence they're unsafe as used in cosmetics; some people avoid them over hormone concerns.",
    source: sources.fdaPhthalates,
  },
  // Only the full name: in skincare "BHA" usually means salicylic acid.
  {
    group: "bha",
    pattern: /\bbutylated hydroxyanisole\b/i,
    level: "debated",
    reason: "A preservative the WHO's cancer agency lists as possibly causing cancer, based on animal studies.",
    source: sources.iarcBha,
  },
  {
    group: "fragrance-allergens",
    pattern: /\b(limonene|linalool|citral|geraniol|eugenol|isoeugenol|coumarin|citronellol|cinnamal|hydroxycitronellal)\b/i,
    level: "irritant",
    reason: "A known fragrance allergen that EU labels must name, even in small amounts.",
    source: sources.euFragranceAllergens,
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

function flagFrom({ level, reason, source }) {
  return { level, reason, source };
}

// Returns { level, reason, source } for a dye worth watching, or null.
export function dyeFlag(ingredient) {
  const match = dyesToWatch.find((dye) => dye.pattern.test(ingredient));
  return match ? flagFrom(match) : null;
}

// Returns why an ingredient is worth watching (as a dye), or null.
export function dyeWarning(ingredient) {
  return dyeFlag(ingredient)?.reason ?? null;
}

// Returns { group, level, reason, source } for a skincare ingredient worth
// watching (including dyes), or null if it isn't on the list.
export function skincareFlag(ingredient) {
  const match = skincareIngredientsToWatch.find((watched) => watched.pattern.test(ingredient));
  if (match) {
    return { group: match.group, ...flagFrom(match) };
  }
  const dye = dyeFlag(ingredient);
  return dye ? { group: "dyes", ...dye } : null;
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
