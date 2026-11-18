// The "My products" section of the Skincare tab: the products the user saved,
// each marked as worked or irritated and with a Remove button that takes out
// just that one (with Undo). Above them, "What's irritating my skin?" lists
// ingredients the irritating products share, to add to the avoid list.
import { loadAvoidList, onAvoidListChange, saveAvoidList, validateCustom } from "./avoid-list.js";
import { findSuspects, MIN_IRRITATED } from "./irritation.js";
import { loadMyProducts, onMyProductsChange, removeFromMyProducts, saveMyProducts, setReaction } from "./my-products.js";
import { realProductCard } from "./real-product-card.js";

const section = document.getElementById("my-products-section");
const countText = document.getElementById("my-products-count");
const statusText = document.getElementById("my-products-status");
const list = document.getElementById("my-products-list");
const irritationSummary = document.getElementById("irritation-summary");
const suspectList = document.getElementById("irritation-suspects");

let myProducts = loadMyProducts();
let avoidList = loadAvoidList();

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

function cardActions(product) {
  const actions = document.createElement("div");
  actions.append(reactionButtons(product), removeButton(product));
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
