// How a match's price compares with what the user paid for their product.

// Turns the "What did you pay?" box into a price, or null when it's empty or
// not a positive number, so a typo never shows misleading savings.
export function parsePaidPrice(text) {
  const price = Number(text);
  return text.trim() !== "" && Number.isFinite(price) && price > 0 ? price : null;
}

// Returns { text, saves } for a match, or null when no price was entered.
export function savingsLabel(matchPrice, paidPrice) {
  if (paidPrice === null) {
    return null;
  }
  const difference = Math.round((paidPrice - matchPrice) * 100) / 100;
  if (difference > 0) {
    return { text: `Save ${formatDollars(difference)}`, saves: true };
  }
  if (difference < 0) {
    return { text: `${formatDollars(-difference)} more`, saves: false };
  }
  return { text: "Same price", saves: false };
}

// Whole amounts show as "$22"; others keep their cents, like "$4.50".
function formatDollars(amount) {
  return Number.isInteger(amount) ? `$${amount}` : `$${amount.toFixed(2)}`;
}
