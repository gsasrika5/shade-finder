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
