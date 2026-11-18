// The "My products" section of the Skincare tab: the products the user saved,
// each with a note of their own, marked as worked or irritated, and with a
// Remove button that takes out just that one (with Undo). Above them, "What's irritating my skin?" lists
// ingredients the irritating products share, to add to the avoid list.
import { loadAvoidList, onAvoidListChange, saveAvoidList, validateCustom } from "./avoid-list.js";
import {
  DEFAULT_SHELF_LIFE,
  expiryStatus,
  expirySummary,
  formatDate,
  openedDateProblem,
  SHELF_LIFE_CHOICES,
  todayText,
} from "./expiry.js";
import { findSuspects, MIN_IRRITATED } from "./irritation.js";
import {
  loadMyProducts,
  MAX_NOTE_LENGTH,
  onMyProductsChange,
  productId,
  removeFromMyProducts,
  saveMyProducts,
  setNote,
  setOpened,
  setReaction,
} from "./my-products.js";
import { realProductCard } from "./real-product-card.js";

const section = document.getElementById("my-products-section");
const countText = document.getElementById("my-products-count");
const statusText = document.getElementById("my-products-status");
const list = document.getElementById("my-products-list");
const irritationSummary = document.getElementById("irritation-summary");
const suspectList = document.getElementById("irritation-suspects");
const expirySummaryText = document.getElementById("expiry-summary");

let myProducts = loadMyProducts();
let avoidList = loadAvoidList();
// The product whose note is being written, and the text so far, so the
// editor survives the page redrawing (say, when the avoid list changes).
let editingId = null;
let noteDraft = "";
// The product whose opened date is being picked.
let editingOpenedId = null;

function showRemoved(product, index) {
  const undo = document.createElement("button");
  undo.type = "button";
  undo.className = "secondary undo-button";
  undo.textContent = "Undo";
  undo.addEventListener("click", () => {
    const restored = [...myProducts];
    restored.splice(Math.min(index, restored.length), 0, product);
    statusText.replaceChildren(`Put back ${product.name}.`);
    saveMyProducts(restored);
  });
  statusText.replaceChildren(`Removed ${product.name}. `, undo);
}

function removeButton(product) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "secondary remove-product";
  button.textContent = "Remove";
  button.setAttribute("aria-label", `Remove ${product.name} from My products`);
  button.addEventListener("click", () => {
    // The Undo shows first, so removing the last product doesn't hide the
    // section before it appears.
    showRemoved(product, myProducts.indexOf(product));
    saveMyProducts(removeFromMyProducts(myProducts, product));
  });
  return button;
}

// 😊 Worked for me / 😣 Irritated my skin. Tapping the chosen one again
// clears it.
function reactionButtons(product) {
  const choices = [
    { reaction: "good", label: "😊 Worked for me" },
    { reaction: "irritated", label: "😣 Irritated my skin" },
  ];
  const group = document.createElement("div");
  group.className = "reaction-buttons";
  group.setAttribute("role", "group");
  group.setAttribute("aria-label", `How ${product.name} worked for you`);
  for (const { reaction, label } of choices) {
    const button = document.createElement("button");
    button.type = "button";
    const chosen = product.reaction === reaction;
    button.className = chosen ? `reaction-button chosen ${reaction}` : "reaction-button";
    button.dataset.reaction = reaction;
    button.textContent = label;
    button.setAttribute("aria-pressed", String(chosen));
    button.addEventListener("click", () => saveMyProducts(setReaction(myProducts, product, reaction)));
    group.append(button);
  }
  return group;
}

function noteEditor(product) {
  const form = document.createElement("form");
  form.className = "note-editor";
  const box = document.createElement("textarea");
  box.className = "note-input";
  box.setAttribute("aria-label", `Your note on ${product.name}`);
  box.maxLength = MAX_NOTE_LENGTH;
  box.rows = 3;
  box.placeholder = "e.g. Too greasy for daytime. $12 at Target.";
  box.value = noteDraft;
  const count = document.createElement("span");
  count.className = "note-count";
  const showCount = () => {
    count.textContent = `${box.value.length}/${MAX_NOTE_LENGTH}`;
  };
  showCount();
  box.addEventListener("input", () => {
    noteDraft = box.value;
    showCount();
  });
  const save = document.createElement("button");
  save.type = "submit";
  save.className = "note-save";
  save.textContent = "Save note";
  const cancel = document.createElement("button");
  cancel.type = "button";
  cancel.className = "secondary note-cancel";
  cancel.textContent = "Cancel";
  cancel.addEventListener("click", () => {
    editingId = null;
    render();
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    editingId = null;
    saveMyProducts(setNote(myProducts, product, box.value));
  });
  const buttons = document.createElement("div");
  buttons.className = "note-buttons";
  buttons.append(save, cancel, count);
  form.append(box, buttons);
  return form;
}

// The note as written, with Edit, or a button to add one.
function noteArea(product) {
  if (productId(product) === editingId) {
    return noteEditor(product);
  }
  const area = document.createElement("div");
  area.className = "note-area";
  const button = document.createElement("button");
  button.type = "button";
  button.className = "secondary note-button";
  if (product.note) {
    const note = document.createElement("p");
    note.className = "product-note";
    note.textContent = `📝 ${product.note}`;
    area.append(note);
    button.textContent = "Edit note";
  } else {
    button.textContent = "📝 Add a note";
  }
  button.setAttribute("aria-label", `${product.note ? "Edit" : "Add"} a note on ${product.name}`);
  button.addEventListener("click", () => {
    editingId = productId(product);
    noteDraft = product.note ?? "";
    render();
    list.querySelector(".note-input")?.focus();
  });
  area.append(button);
  return area;
}

function openedEditor(product) {
  const today = todayText();
  const form = document.createElement("form");
  form.className = "opened-editor";
  // The app checks the date itself, so every browser shows the same message
  // (some phones don't show the browser's own one).
  form.noValidate = true;
  const dateLabel = document.createElement("label");
  dateLabel.textContent = "Opened on ";
  const dateInput = document.createElement("input");
  dateInput.type = "date";
  dateInput.className = "opened-date";
  dateInput.max = today;
  dateInput.value = product.openedOn ?? today;
  dateLabel.append(dateInput);

  const monthsLabel = document.createElement("label");
  monthsLabel.textContent = "Lasts after opening ";
  const monthsSelect = document.createElement("select");
  monthsSelect.className = "shelf-life";
  for (const months of SHELF_LIFE_CHOICES) {
    const option = document.createElement("option");
    option.value = String(months);
    option.textContent = `${months} months (${months}M)`;
    monthsSelect.append(option);
  }
  monthsSelect.value = String(product.shelfLifeMonths ?? DEFAULT_SHELF_LIFE);
  monthsLabel.append(monthsSelect);

  const tip = document.createElement("p");
  tip.className = "hint";
  tip.textContent = "Look for the open-jar symbol on the package, like 12M.";
  const problem = document.createElement("p");
  problem.className = "opened-problem";
  problem.setAttribute("role", "status");

  const save = document.createElement("button");
  save.type = "submit";
  save.className = "opened-save";
  save.textContent = "Save date";
  const cancel = document.createElement("button");
  cancel.type = "button";
  cancel.className = "secondary opened-cancel";
  cancel.textContent = "Cancel";
  cancel.addEventListener("click", () => {
    editingOpenedId = null;
    render();
  });
  const buttons = document.createElement("div");
  buttons.className = "note-buttons";
  buttons.append(save, cancel);
  if (product.openedOn) {
    const clear = document.createElement("button");
    clear.type = "button";
    clear.className = "secondary opened-clear";
    clear.textContent = "Clear date";
    clear.addEventListener("click", () => {
      editingOpenedId = null;
      saveMyProducts(setOpened(myProducts, product, null, null));
    });
    buttons.append(clear);
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const dateProblem = openedDateProblem(dateInput.value, today);
    if (dateProblem) {
      problem.textContent = dateProblem;
      return;
    }
    editingOpenedId = null;
    saveMyProducts(setOpened(myProducts, product, dateInput.value, Number(monthsSelect.value)));
  });
  form.append(dateLabel, monthsLabel, tip, problem, buttons);
  return form;
}

// "Opened Nov 18, 2026 · good until Nov 18, 2027" with how long is left, or a
// button to add the date.
function openedArea(product) {
  if (productId(product) === editingOpenedId) {
    return openedEditor(product);
  }
  const area = document.createElement("div");
  area.className = "opened-area";
  const button = document.createElement("button");
  button.type = "button";
  button.className = "secondary opened-button";
  if (product.openedOn) {
    const status = expiryStatus(product.openedOn, product.shelfLifeMonths, todayText());
    const line = document.createElement("p");
    line.className = `expiry expiry-${status.state}`;
    const icons = { good: "🟢", soon: "🟠", expired: "🔴" };
    line.textContent = `${icons[status.state]} ${status.text}`;
    const dates = document.createElement("p");
    dates.className = "expiry-dates";
    dates.textContent = `Opened ${formatDate(product.openedOn)} · good until ${formatDate(status.expiresOn)}`;
    area.append(line, dates);
    button.textContent = "Change date";
  } else {
    button.textContent = "📅 Add opened date";
  }
  button.setAttribute("aria-label", `${product.openedOn ? "Change" : "Add"} the date you opened ${product.name}`);
  button.addEventListener("click", () => {
    editingOpenedId = productId(product);
    render();
    list.querySelector(".opened-date")?.focus();
  });
  area.append(button);
  return area;
}

function cardActions(product) {
  const actions = document.createElement("div");
  actions.append(openedArea(product), noteArea(product), reactionButtons(product), removeButton(product));
  return actions;
}

// The suspect's name without the part in parentheses, so "Parfum (Fragrance)"
// is added as "Parfum" and catches labels that only say "Parfum".
function avoidEntryFor(name) {
  return name.replace(/\([^)]*\)|\[[^\]]*\]/g, " ").replace(/\s+/g, " ").trim();
}

function addSuspectButton(name) {
  const entryName = avoidEntryFor(name);
  const onList = avoidList.custom.some((entry) => entry.toLowerCase() === entryName.toLowerCase());
  if (onList) {
    const added = document.createElement("span");
    added.className = "suspect-added";
    added.textContent = "✓ On your avoid list";
    return added;
  }
  const button = document.createElement("button");
  button.type = "button";
  button.className = "secondary add-suspect";
  button.textContent = "Add to my avoid list";
  button.setAttribute("aria-label", `Add ${entryName} to my avoid list`);
  button.addEventListener("click", () => {
    const { entry, problem } = validateCustom(entryName, avoidList);
    if (problem) {
      irritationSummary.textContent = problem;
      return;
    }
    saveAvoidList({ ...avoidList, custom: [...avoidList.custom, entry] });
  });
  return button;
}

function renderIrritation() {
  const { irritatedCount, goodCount, suspects } = findSuspects(myProducts);
  suspectList.replaceChildren(
    ...suspects.map(({ name, inIrritated }) => {
      const item = document.createElement("li");
      const text = document.createElement("span");
      text.textContent = `${name}: in ${inIrritated} of ${irritatedCount} that irritated you, 0 of ${goodCount} that worked`;
      item.append(text, addSuspectButton(name));
      return item;
    }),
  );
  if (irritatedCount < MIN_IRRITATED) {
    irritationSummary.textContent =
      irritatedCount === 0
        ? `Mark products below with 😣 Irritated my skin or 😊 Worked for me. Once ${MIN_IRRITATED} or more irritated you, this looks for ingredients they share.`
        : `1 product marked as irritating. Mark at least one more to look for a pattern.`;
  } else if (suspects.length === 0) {
    irritationSummary.textContent =
      "No ingredient is in two or more of your irritating products and none that worked. Mark more products to sharpen the pattern.";
  } else {
    irritationSummary.textContent =
      goodCount === 0
        ? "Shared by your irritating products. Mark products that worked for you too, so ingredients they also have get ruled out."
        : "Shared by your irritating products, and not in any that worked for you:";
  }
}

// Shown once something is saved, and kept while an Undo is on offer even if
// the last product was removed.
function render() {
  countText.textContent = String(myProducts.length);
  expirySummaryText.textContent = expirySummary(myProducts, todayText());
  expirySummaryText.hidden = expirySummaryText.textContent === "";
  list.replaceChildren(...myProducts.map((product) => realProductCard(product, avoidList, cardActions(product))));
  renderIrritation();
  section.hidden = myProducts.length === 0 && statusText.childElementCount === 0;
}

onMyProductsChange((changedProducts) => {
  myProducts = changedProducts;
  render();
});
onAvoidListChange((changedList) => {
  avoidList = changedList;
  render();
});
render();
