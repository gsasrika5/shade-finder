import { brandCheckLinks } from "./brand-links.js";
import { averageColor, colorName, findClosestProducts, rgbToHex } from "./color.js";
import { renderIdentification } from "./identification-view.js";
import { identifyProduct, IdentifyError } from "./identify.js";
import { photoProblem } from "./photo-quality.js";
import { animalTestingBadge, ingredientList } from "./product-details.js";
import { products } from "./products.js";

const MAX_PHOTO_WIDTH = 800;
const SAMPLE_RADIUS = 6;
const API_KEY_STORAGE = "shadeFinder.apiKey";

const photoInput = document.getElementById("photo-input");
const uploadError = document.getElementById("upload-error");
const photoArea = document.getElementById("photo-area");
const photoWarning = document.getElementById("photo-warning");
const canvas = document.getElementById("photo-canvas");
const sampleMarker = document.getElementById("sample-marker");
const pickedSwatch = document.getElementById("picked-swatch");
const pickedHex = document.getElementById("picked-hex");
const categorySelect = document.getElementById("category-select");
const resultsEmpty = document.getElementById("results-empty");
const resultsList = document.getElementById("results-list");
const keyForm = document.getElementById("ai-key-form");
const keyInput = document.getElementById("ai-key-input");
const keyRemoveButton = document.getElementById("ai-key-remove");
const keyStatus = document.getElementById("ai-key-status");
const identificationStatus = document.getElementById("identification-status");
const identificationResult = document.getElementById("identification-result");
const brandInput = document.getElementById("brand-input");
const colorGuess = document.getElementById("color-guess");
const colorGuessNote = document.getElementById("color-guess-note");
const brandCheck = document.getElementById("brand-check");
const brandCheckHeading = document.getElementById("brand-check-heading");
const brandCheckLinkList = document.getElementById("brand-check-links");

const context = canvas.getContext("2d", { willReadFrequently: true });
let pickedColor = null;
let latestIdentification = 0;
let originalPhotoSize = null;

// Browser storage can be blocked (for example in private windows), so the app
// still works without it; the key just won't be remembered.
function loadApiKey() {
  try {
    return localStorage.getItem(API_KEY_STORAGE) ?? "";
  } catch {
    return "";
  }
}

function saveApiKey(apiKey) {
  try {
    if (apiKey) {
      localStorage.setItem(API_KEY_STORAGE, apiKey);
    } else {
      localStorage.removeItem(API_KEY_STORAGE);
    }
  } catch {
    // Not remembered, but the key in the box still works for this visit.
  }
}

function currentApiKey() {
  return keyInput.value.trim() || loadApiKey();
}

function showKeyStatus() {
  const hasKey = currentApiKey() !== "";
  keyRemoveButton.hidden = !hasKey;
  keyStatus.textContent = hasKey
    ? "Key saved. New photos will be identified by AI."
    : "No key yet. Without one, you can still match by color.";
}

function showError(message) {
  uploadError.textContent = message;
  uploadError.hidden = false;
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("unreadable image"));
    };
    image.src = url;
  });
}

async function handlePhoto(file) {
  uploadError.hidden = true;
  if (!file) {
    return;
  }
  if (!file.type.startsWith("image/")) {
    showError("That file isn't a photo. Please choose a JPG, PNG, or HEIC image.");
    return;
  }

  let image;
  try {
    image = await loadImage(file);
  } catch {
    showError("We couldn't open that photo. Try a different one, or take a new picture.");
    return;
  }

  const scale = Math.min(1, MAX_PHOTO_WIDTH / image.width);
  canvas.width = Math.round(image.width * scale);
  canvas.height = Math.round(image.height * scale);
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  photoArea.hidden = false;
  originalPhotoSize = { width: image.width, height: image.height };

  // Start from the middle of the photo, where the product usually is.
  pickShade(Math.floor(canvas.width / 2), Math.floor(canvas.height / 2));
  identifyPhoto();
}

async function identifyPhoto() {
  identificationResult.replaceChildren();
  identificationStatus.hidden = false;
  identificationStatus.classList.remove("error");

  const apiKey = currentApiKey();
  if (!apiKey) {
    // Without a key, the color-based guess from renderResults stands in.
    identificationStatus.hidden = true;
    return;
  }

  // If a newer photo is added while this one is being identified, drop the older answer.
  const identificationId = ++latestIdentification;
  identificationStatus.textContent = "Identifying your product… this can take up to a minute.";
  const photoJpegBase64 = canvas.toDataURL("image/jpeg", 0.85).split(",")[1];
  try {
    const result = await identifyProduct(apiKey, photoJpegBase64);
    if (identificationId !== latestIdentification) {
      return;
    }
    identificationStatus.hidden = true;
    renderIdentification(identificationResult, result);
  } catch (error) {
    if (identificationId !== latestIdentification) {
      return;
    }
    identificationStatus.classList.add("error");
    identificationStatus.textContent =
      error instanceof IdentifyError ? error.message : "Something went wrong. Please try again.";
  }
}

function showPhotoWarning(imageData, focus) {
  const problem = photoProblem(imageData, originalPhotoSize.width, originalPhotoSize.height, focus);
  photoWarning.hidden = problem === null;
  photoWarning.textContent = problem ?? "";
}

function pickShade(x, y) {
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  pickedColor = averageColor(imageData, x, y, SAMPLE_RADIUS);
  showPhotoWarning(imageData, { x, y });

  const hex = rgbToHex(pickedColor);
  pickedSwatch.style.background = hex;
  pickedHex.textContent = hex;

  sampleMarker.style.left = `${(x / canvas.width) * 100}%`;
  sampleMarker.style.top = `${(y / canvas.height) * 100}%`;
  sampleMarker.hidden = false;

  renderResults();
}

// Without an AI key, guess what the product is from the picked color and the
// closest match, and say plainly that it's only a guess.
function renderColorGuess(matches) {
  const showGuess = pickedColor !== null && currentApiKey() === "";
  colorGuess.hidden = !showGuess;
  colorGuessNote.hidden = !showGuess;
  if (!showGuess) {
    return;
  }
  if (matches.length === 0) {
    colorGuess.textContent = "I'm not sure what this is. Try tapping right on the product's color.";
    return;
  }
  const closest = matches[0];
  const productType = categorySelect.value === "all" ? closest.category : categorySelect.value;
  const brand = brandInput.value.trim();
  const fromBrand = brand ? ` from ${brand}` : "";
  colorGuess.textContent = `I think this might be a ${colorName(pickedColor)} ${productType}${fromBrand}, close to ${closest.name} by ${closest.brand}.`;
}

function renderBrandCheck() {
  const brand = brandInput.value.trim();
  brandCheck.hidden = brand === "";
  brandCheckLinkList.replaceChildren();
  if (brand === "") {
    return;
  }
  brandCheckHeading.textContent = `Check ${brand}`;
  for (const link of brandCheckLinks(brand)) {
    const item = document.createElement("li");
    const anchor = document.createElement("a");
    anchor.href = link.url;
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    anchor.textContent = link.label;
    item.append(anchor, ` on ${link.source}`);
    brandCheckLinkList.append(item);
  }
}

function renderResults() {
  resultsList.replaceChildren();
  if (!pickedColor) {
    resultsEmpty.hidden = false;
    return;
  }

  const matches = findClosestProducts(pickedColor, products, {
    category: categorySelect.value,
    excludeBrand: brandInput.value,
  });
  renderColorGuess(matches);
  resultsEmpty.hidden = matches.length > 0;
  resultsEmpty.textContent =
    "No close matches for this shade yet. Try tapping a different spot, or pick another product type.";

  for (const product of matches) {
    const item = document.createElement("li");
    item.className = "product-card";
    item.innerHTML = `
      <div class="product-image" style="background:${product.shadeHex}" role="img"
           aria-label="${product.name} shade"></div>
      <div class="product-info">
        <p class="product-brand"></p>
        <p class="product-name"></p>
        <p class="product-meta"><span class="product-price"></span> · <span class="product-match"></span></p>
        <details class="product-ingredients">
          <summary>Ingredients</summary>
          <p class="ingredients-note">Sample data until real products are added.</p>
        </details>
      </div>`;
    item.querySelector(".product-brand").textContent = product.brand;
    item.querySelector(".product-name").textContent = product.name;
    item.querySelector(".product-price").textContent = `$${product.price}`;
    item.querySelector(".product-match").textContent = `${product.match}% match`;
    item.querySelector(".product-meta").after(animalTestingBadge(product.animalTesting));
    item.querySelector(".product-ingredients summary").after(ingredientList(product.ingredients));
    resultsList.append(item);
  }
}

photoInput.addEventListener("change", () => handlePhoto(photoInput.files[0]));

canvas.addEventListener("click", (event) => {
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor(((event.clientX - rect.left) / rect.width) * canvas.width);
  const y = Math.floor(((event.clientY - rect.top) / rect.height) * canvas.height);
  pickShade(x, y);
});

categorySelect.addEventListener("change", renderResults);
brandInput.addEventListener("input", () => {
  renderBrandCheck();
  renderResults();
});

keyForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const apiKey = keyInput.value.trim();
  if (!apiKey) {
    keyStatus.textContent = "Paste your key into the box first.";
    return;
  }
  saveApiKey(apiKey);
  keyInput.value = "";
  showKeyStatus();
  renderResults();
});

keyRemoveButton.addEventListener("click", () => {
  saveApiKey("");
  keyInput.value = "";
  showKeyStatus();
  renderResults();
});

showKeyStatus();
