// The "Check any product's ingredients" section of the Skincare tab: scan a
// barcode or search Open Beauty Facts by name, and show each product's
// ingredients with the ones to watch flagged.
import { cameraProblem, startScanning } from "./barcode-scanner.js";
import { skincareWarning } from "./ingredient-flags.js";
import { cleanBarcode, lookUpBarcode, searchWithFallback } from "./online-lookup.js";
import { ingredientCheck, ingredientList } from "./product-details.js";
import { ingredientsToWatch } from "./skincare-match.js";

const form = document.getElementById("online-lookup-form");
const input = document.getElementById("online-lookup-input");
const button = document.getElementById("online-lookup-button");
const statusText = document.getElementById("online-lookup-status");
const resultsList = document.getElementById("online-lookup-results");
const scanButton = document.getElementById("barcode-scan-button");
const camera = document.getElementById("barcode-camera");
const video = document.getElementById("barcode-video");
const cancelButton = document.getElementById("barcode-cancel");
const typedBarcode = document.getElementById("barcode-typed");
const barcodeForm = document.getElementById("barcode-form");
const barcodeInput = document.getElementById("barcode-input");
const barcodeButton = document.getElementById("barcode-button");
const unreachable = "Couldn't reach the ingredient database. Check your internet connection and try again.";
let stopCamera = null;

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
    statusText.textContent = unreachable;
  } finally {
    button.disabled = false;
  }
}

// What a barcode lookup found, pointing to the name search when it found
// nothing useful.
function barcodeStatus(barcode, result) {
  if (result.status === "found") {
    return `Found barcode ${barcode}. Ingredients to watch are marked ⚠️.`;
  }
  if (result.status === "no-ingredients") {
    return `${result.name} (barcode ${barcode}) is in the database, but without an ingredient list yet. Try searching by name below.`;
  }
  return `Barcode ${barcode} isn't in the database yet. Try searching by the product's name below.`;
}

async function showBarcode(barcode) {
  barcodeButton.disabled = true;
  statusText.textContent = `Looking up barcode ${barcode}…`;
  resultsList.replaceChildren();
  try {
    const result = await lookUpBarcode(barcode);
    statusText.textContent = barcodeStatus(barcode, result);
    if (result.status === "found") {
      resultsList.replaceChildren(onlineProductCard(result.product));
    }
  } catch {
    statusText.textContent = unreachable;
  } finally {
    barcodeButton.disabled = false;
  }
}

function closeCamera() {
  stopCamera?.();
  stopCamera = null;
  camera.hidden = true;
  scanButton.hidden = false;
}

async function openCamera() {
  scanButton.hidden = true;
  camera.hidden = false;
  statusText.textContent = "Starting the camera…";
  resultsList.replaceChildren();
  try {
    stopCamera = await startScanning(video, (barcode) => {
      closeCamera();
      showBarcode(barcode);
    });
    statusText.textContent = "";
  } catch (error) {
    closeCamera();
    statusText.textContent = cameraProblem(error);
    typedBarcode.open = true;
  }
}

function lookUpTypedBarcode(event) {
  event.preventDefault();
  const barcode = cleanBarcode(barcodeInput.value);
  if (!barcode) {
    resultsList.replaceChildren();
    statusText.textContent = "A barcode number is 8 to 14 digits. Check the digits under the lines and try again.";
    return;
  }
  showBarcode(barcode);
}

form.addEventListener("submit", (event) => {
  closeCamera();
  lookUp(event);
});
scanButton.addEventListener("click", openCamera);
cancelButton.addEventListener("click", () => {
  closeCamera();
  statusText.textContent = "";
});
barcodeForm.addEventListener("submit", lookUpTypedBarcode);
