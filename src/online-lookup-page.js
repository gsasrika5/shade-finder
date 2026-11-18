// The "Check any product's ingredients" section of the Skincare tab: scan a
// barcode or search Open Beauty Facts by name, and show each product's
// ingredients with the ones to watch flagged.
import { loadAvoidList, onAvoidListChange } from "./avoid-list.js";
import { cameraProblem, startScanning } from "./barcode-scanner.js";
import {
  addToMyProducts,
  isInMyProducts,
  loadMyProducts,
  MAX_MY_PRODUCTS,
  onMyProductsChange,
  removeFromMyProducts,
  saveMyProducts,
} from "./my-products.js";
import { cleanBarcode, lookUpBarcode, searchWithFallback } from "./online-lookup.js";
import { realProductCard } from "./real-product-card.js";

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
let avoidList = loadAvoidList();
let shownProducts = [];
let myProducts = loadMyProducts();

// The card's ♡ Save button, or ♥ Saved once it's in My products (tap again
// to remove it).
function saveButton(product) {
  const saved = isInMyProducts(myProducts, product);
  const button = document.createElement("button");
  button.type = "button";
  button.className = saved ? "save-button saved" : "save-button";
  button.textContent = saved ? "♥ Saved to My products" : "♡ Save to My products";
  button.setAttribute("aria-pressed", String(saved));
  button.addEventListener("click", () => {
    if (isInMyProducts(myProducts, product)) {
      saveMyProducts(removeFromMyProducts(myProducts, product));
      return;
    }
    const added = addToMyProducts(myProducts, product);
    if (added === null) {
      statusText.textContent = `My products is full (${MAX_MY_PRODUCTS}). Remove one at the top of the page to save another.`;
      return;
    }
    saveMyProducts(added);
  });
  return button;
}

function onlineProductCard(product) {
  return realProductCard(product, avoidList, saveButton(product));
}

// Shows these products' cards, remembering them so they can be redrawn when
// the avoid list changes.
function showProducts(products) {
  shownProducts = products;
  resultsList.replaceChildren(...products.map(onlineProductCard));
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
  showProducts([]);
  try {
    const { products, searchedFor } = await searchWithFallback(query);
    statusText.textContent = lookupStatus(query, products.length, searchedFor);
    showProducts(products);
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
  showProducts([]);
  try {
    const result = await lookUpBarcode(barcode);
    statusText.textContent = barcodeStatus(barcode, result);
    if (result.status === "found") {
      showProducts([result.product]);
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
  showProducts([]);
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
    showProducts([]);
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
onAvoidListChange((changedList) => {
  avoidList = changedList;
  showProducts(shownProducts);
});
onMyProductsChange((changedProducts) => {
  myProducts = changedProducts;
  showProducts(shownProducts);
});
