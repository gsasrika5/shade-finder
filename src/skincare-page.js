// The Skincare tab: search for a product you own, then see cheaper products of
// the same type that share its key ingredients.
import { skincareWarning } from "./ingredient-flags.js";
import { animalTestingBadge, ingredientList } from "./product-details.js";
import { savingsLabel } from "./savings.js";
import { findSkincareDupes, ingredientsToWatch, searchSkincare } from "./skincare-match.js";
import { skincareProducts } from "./skincare-products.js";

// The picked product is remembered for this tab, so switching to Makeup and
// back keeps it.
const SELECTED_STORAGE = "shadeFinder.skincareProduct";
const GENTLE_ONLY_STORAGE = "shadeFinder.skincareGentleOnly";

const searchInput = document.getElementById("skincare-search");
const searchHint = document.getElementById("skincare-search-hint");
const searchResults = document.getElementById("skincare-search-results");
const selectedArea = document.getElementById("skincare-selected");
const dupesEmpty = document.getElementById("skincare-dupes-empty");
const dupesList = document.getElementById("skincare-dupes");
const gentleOnlyCheckbox = document.getElementById("skincare-gentle-only");

let selectedProduct = null;

function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function renderSearchResults() {
  const query = searchInput.value.trim();
  const found = searchSkincare(query, skincareProducts);
  searchResults.replaceChildren(
    ...found.map((product) => {
      const item = document.createElement("li");
      const button = document.createElement("button");
      button.type = "button";
      button.className = "skincare-result";
      button.textContent = `${product.name} · ${product.brand} · ${capitalize(product.type)} · $${product.price}`;
      button.addEventListener("click", () => selectProduct(product));
      item.append(button);
      return item;
    }),
  );
  if (query === "") {
    searchHint.textContent = "Start typing, then tap your product in the list.";
  } else if (found.length === 0) {
    searchHint.textContent = `No products match "${query}". Try a brand, or a type like serum or sunscreen.`;
  } else {
    searchHint.textContent = "Tap your product:";
  }
}

// "✓ No ingredients to watch", or each one to watch with its reason.
function ingredientCheck(product) {
  const watched = ingredientsToWatch(product);
  const check = document.createElement("div");
  check.className = watched.length === 0 ? "ingredient-check gentle" : "ingredient-check watch";
  const heading = document.createElement("p");
  heading.textContent =
    watched.length === 0
      ? "✓ No ingredients to watch"
      : `⚠️ ${watched.length} ${watched.length === 1 ? "ingredient" : "ingredients"} to watch:`;
  check.append(heading);
  if (watched.length > 0) {
    const list = document.createElement("ul");
    for (const { ingredient, reason } of watched) {
      const item = document.createElement("li");
      item.textContent = `${ingredient}: ${reason}`;
      list.append(item);
    }
    check.append(list);
  }
  return check;
}

// One product card: brand, name, type, price, and details. Dupes also say
// which key ingredients they share and how much they save.
function skincareCard(product, { label, shared, savings }) {
  const item = document.createElement("li");
  item.className = "product-card skincare-card";
  item.innerHTML = `
    <div class="product-info">
      <p class="skincare-label"></p>
      <p class="product-brand"></p>
      <p class="product-name"></p>
      <p class="product-meta"><span class="product-type"></span> · <span class="product-price"></span></p>
      <p class="skincare-key"></p>
      <details class="product-ingredients">
        <summary>Ingredients</summary>
        <p class="ingredients-note">Sample data until real products are added.</p>
      </details>
    </div>`;
  item.querySelector(".skincare-label").textContent = label;
  item.querySelector(".product-brand").textContent = product.brand;
  item.querySelector(".product-name").textContent = product.name;
  item.querySelector(".product-type").textContent = capitalize(product.type);
  item.querySelector(".product-price").textContent = `$${product.price}`;
  if (savings) {
    const savingsText = document.createElement("span");
    savingsText.className = "product-savings saves";
    savingsText.textContent = savings.text;
    item.querySelector(".product-price").after(" (", savingsText, ")");
  }
  item.querySelector(".skincare-key").textContent = shared
    ? `Shares ${shared.length} of ${product.matchedAgainst} key ingredients: ${shared.join(", ")}`
    : `Key ingredients: ${product.keyIngredients.join(", ")}`;
  item.querySelector(".product-meta").after(animalTestingBadge(product.animalTesting));
  item.querySelector(".skincare-key").after(ingredientCheck(product));
  item
    .querySelector(".product-ingredients summary")
    .after(ingredientList(product.ingredients, { warningFor: skincareWarning, watchedName: "ingredient" }));
  return item;
}

function selectProduct(product) {
  try {
    sessionStorage.setItem(SELECTED_STORAGE, product.id);
  } catch {
    // Not remembered, but the dupes still show for this visit.
  }
  searchInput.value = product.name;
  searchResults.replaceChildren();
  searchHint.textContent = "Search again to pick a different product.";

  const yours = document.createElement("ul");
  yours.className = "results-list";
  yours.append(skincareCard(product, { label: "Your product" }));
  selectedArea.replaceChildren(yours);
  selectedArea.hidden = false;
  selectedProduct = product;
  renderDupes();
}

function renderDupes() {
  if (selectedProduct === null) {
    return;
  }
  const gentleOnly = gentleOnlyCheckbox.checked;
  const dupes = findSkincareDupes(selectedProduct, skincareProducts, { gentleOnly });
  dupesEmpty.hidden = dupes.length > 0;
  dupesEmpty.textContent = gentleOnly
    ? "No cheaper dupes without ingredients to watch. Uncheck the box above to see all dupes."
    : "Nothing cheaper of this type shares its key ingredients, so it may already be a good deal.";
  dupesList.replaceChildren(
    ...dupes.map((dupe) =>
      skincareCard(
        { ...dupe, matchedAgainst: selectedProduct.keyIngredients.length },
        { label: "Cheaper dupe", shared: dupe.sharedIngredients, savings: savingsLabel(dupe.price, selectedProduct.price) },
      ),
    ),
  );
}

// Browser storage can be blocked (for example in private windows); the box
// then starts unchecked and just isn't remembered.
function loadGentleOnly() {
  try {
    return localStorage.getItem(GENTLE_ONLY_STORAGE) === "true";
  } catch {
    return false;
  }
}

function saveGentleOnly(gentleOnly) {
  try {
    localStorage.setItem(GENTLE_ONLY_STORAGE, String(gentleOnly));
  } catch {
    // Not remembered, but the choice still applies for this visit.
  }
}

function restoreSelectedProduct() {
  let selectedId = null;
  try {
    selectedId = sessionStorage.getItem(SELECTED_STORAGE);
  } catch {
    return;
  }
  const product = skincareProducts.find((candidate) => candidate.id === selectedId);
  if (product) {
    selectProduct(product);
  }
}

searchInput.addEventListener("input", renderSearchResults);
gentleOnlyCheckbox.addEventListener("change", () => {
  saveGentleOnly(gentleOnlyCheckbox.checked);
  renderDupes();
});
gentleOnlyCheckbox.checked = loadGentleOnly();
restoreSelectedProduct();
