// How long a product lasts after opening. Packages show this as an open jar
// with a number of months ("12M"). Dates are "YYYY-MM-DD" strings, worked out
// in UTC so time zones and daylight saving can't shift them by a day.
export const SHELF_LIFE_CHOICES = [3, 6, 9, 12, 18, 24];
export const DEFAULT_SHELF_LIFE = 12;
export const SOON_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;
const EARLIEST_OPENED = "2000-01-01";

function toUtc(dateText) {
  const [year, month, day] = dateText.split("-").map(Number);
  return Date.UTC(year, month - 1, day);
}

function toText(time) {
  return new Date(time).toISOString().slice(0, 10);
}

// Today in the user's own calendar, as "YYYY-MM-DD".
export function todayText(now = new Date()) {
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

// True for a real "YYYY-MM-DD" date (not "2026-02-30").
export function isDateText(text) {
  return typeof text === "string" && /^\d{4}-\d{2}-\d{2}$/.test(text) && toText(toUtc(text)) === text;
}

// The same day `months` later. When that month is shorter, it's the last day
// of the month: opened Aug 31 with 6 months lasts until Feb 28 (or 29).
export function addMonths(dateText, months) {
  const [year, month, day] = dateText.split("-").map(Number);
  const target = new Date(Date.UTC(year, month - 1 + months, 1));
  const lastDay = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
  target.setUTCDate(Math.min(day, lastDay));
  return toText(target.getTime());
}

// Checks an opened date someone picked. Returns null if it's fine, or what's
// wrong with it.
export function openedDateProblem(dateText, today) {
  if (!isDateText(dateText)) {
    return "Pick the date you opened it.";
  }
  if (dateText > today) {
    return "That date is in the future. Pick the day you opened it.";
  }
  if (dateText < EARLIEST_OPENED) {
    return "That date is too long ago. Check the year.";
  }
  return null;
}

// "Nov 18, 2026"
export function formatDate(dateText) {
  return new Date(toUtc(dateText)).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

function timeLeft(days) {
  if (days === 1) {
    return "1 day";
  }
  if (days < 14) {
    return `${days} days`;
  }
  if (days < 60) {
    return `${Math.floor(days / 7)} weeks`;
  }
  return `${Math.floor(days / 30)} months`;
}

// Where a product stands: { expiresOn, daysLeft, state, text }, with state
// "good", "soon" (the last SOON_DAYS days), or "expired" (after expiresOn).
export function expiryStatus(openedOn, shelfLifeMonths, today) {
  const expiresOn = addMonths(openedOn, shelfLifeMonths);
  const daysLeft = Math.round((toUtc(expiresOn) - toUtc(today)) / DAY_MS);
  if (daysLeft < 0) {
    return { expiresOn, daysLeft, state: "expired", text: `Past its ${shelfLifeMonths} months, consider replacing` };
  }
  if (daysLeft === 0) {
    return { expiresOn, daysLeft, state: "soon", text: "Expires today" };
  }
  return {
    expiresOn,
    daysLeft,
    state: daysLeft <= SOON_DAYS ? "soon" : "good",
    text: `Expires in ${timeLeft(daysLeft)}`,
  };
}

// "⏰ 1 expired · 2 expire within a month" for the products that have an
// opened date, or "" when none need attention.
export function expirySummary(products, today) {
  const states = products
    .filter((product) => product.openedOn)
    .map((product) => expiryStatus(product.openedOn, product.shelfLifeMonths, today).state);
  const expired = states.filter((state) => state === "expired").length;
  const soon = states.filter((state) => state === "soon").length;
  const parts = [];
  if (expired > 0) {
    parts.push(`${expired} expired`);
  }
  if (soon > 0) {
    parts.push(`${soon} ${soon === 1 ? "expires" : "expire"} within a month`);
  }
  return parts.length > 0 ? `⏰ ${parts.join(" · ")}` : "";
}
