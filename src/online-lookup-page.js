// The "Check any product's ingredients" section of the Skincare tab: search
// Open Beauty Facts and show each product's ingredients with the ones to watch
// flagged.
import { skincareWarning } from "./ingredient-flags.js";
import { searchWithFallback } from "./online-lookup.js";
import { ingredientCheck, ingredientList } from "./product-details.js";
import { ingredientsToWatch } from "./skincare-match.js";

const form = document.getElementById("online-lookup-form");
const input = document.getElementById("online-lookup-input");
const button = document.getElementById("online-lookup-button");
const statusText = document.getElementById("online-lookup-status");
const resultsList = document.getElementById("online-lookup-results");

function onlineProductCard(product) {
  const item = document.createElement("li");
  item.className = "product-card skincare-card";
  if (product.imageUrl) {
    const image = document.createElement("img");
    image.className = "product-image";
    image.src = product.imageUrl;
    image.alt = "";
    image.loading = "lazy";
    item.append(image);
  }
  const info = document.createElement("div");
  info.className = "product-info";
  const brand = document.createElement("p");
  brand.className = "product-brand";
  brand.textContent = product.brand;
  const name = document.createElement("p");
  name.className = "product-name";
  name.textContent = product.name;
  const fullList = document.createElement("details");
  fullList.className = "product-ingredients";
  const summary = document.createElement("summary");
  summary.textContent = `All ${product.ingredients.length} ingredients`;
  fullList.append(summary, ingredientList(product.ingredients, { warningFor: skincareWarning, watchedName: "ingredient" }));
  info.append(brand, name, ingredientCheck(ingredientsToWatch(product)), fullList);
  item.append(info);
  return item;
}

// What the search found, saying so when it had to drop words to find anything.
function lookupStatus(query, count, searchedFor) {
  if (count === 0) {
    return `No products with an ingredient list found for "${query}". Try just the brand name, or check the spelling.`;
  }
  const found = `${count} ${count === 1 ? "product" : "products"} with ingredient lists`;
  if (searchedFor !== query) {
    return `"${query}" isn't in the database yet, so here are ${found} for "${searchedFor}". Ingredients to watch are marked ⚠️.`;
  }
  return `Found ${found}. Ingredients to watch are marked ⚠️.`;
}

async function lookUp(event) {
  event.preventDefault();
  const query = input.value.trim().replace(/\s+/g, " ");
  if (query === "") {
    statusText.textContent = "Type a product name first.";
    return;
  }
  button.disabled = true;
  statusText.textContent = `Searching the internet for "${query}"…`;
  resultsList.replaceChildren();
  try {
    const { products, searchedFor } = await searchWithFallback(query);
    statusText.textContent = lookupStatus(query, products.length, searchedFor);
    resultsList.replaceChildren(...products.map(onlineProductCard));
  } catch {
    statusText.textContent = "Couldn't reach the ingredient database. Check your internet connection and try again.";
  } finally {
    button.disabled = false;
  }
}

form.addEventListener("submit", lookUp);
