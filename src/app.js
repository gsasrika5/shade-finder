import { brandCheckLinks } from "./brand-links.js";
import { forgetSearch, recallSearch, rememberSearch } from "./current-search.js";
import { averageColor, colorName, findClosestProducts, looksLikePackaging, rgbToHex } from "./color.js";
import { renderIdentification } from "./identification-view.js";
import { identifyProduct, IdentifyError } from "./identify.js";
import { photoProblem } from "./photo-quality.js";
import { hasPreferences, loadPreferences, preferenceFitPercent, savePreferences } from "./preferences.js";
import { animalTestingBadge, ingredientList } from "./product-details.js";
import { products } from "./products.js";
import { isSaved, loadSavedShades, storeSavedShades, toggleSavedShade } from "./saved-shades.js";
import { parsePaidPrice, savingsLabel } from "./savings.js";
import { splitSwatch } from "./swatch.js";

const MAX_PHOTO_WIDTH = 800;
const SAMPLE_RADIUS = 6;
// How much the close-up of the tapped spot is magnified.
const CLOSE_UP_ZOOM = 3;
const API_KEY_STORAGE = "shadeFinder.apiKey";
const MAX_MATCHES = 6;

const photoInput = document.getElementById("photo-input");
const uploadError = document.getElementById("upload-error");
const photoArea = document.getElementById("photo-area");
const photoWarning = document.getElementById("photo-warning");
const canvas = document.getElementById("photo-canvas");
const sampleMarker = document.getElementById("sample-marker");
const pickedSwatch = document.getElementById("picked-swatch");
const pickedName = document.getElementById("picked-name");
const pickedZoom = document.getElementById("picked-zoom");
const packagingTip = document.getElementById("packaging-tip");
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
const paidPriceInput = document.getElementById("paid-price-input");
const crueltyFreeCheckbox = document.getElementById("pref-cruelty-free");
const noDyesCheckbox = document.getElementById("pref-no-dyes");
const veganCheckbox = document.getElementById("pref-vegan");
const maxPriceInput = document.getElementById("pref-max-price");
const undertoneSelect = document.getElementById("pref-undertone");
const preferencesSummary = document.getElementById("preferences-summary");
const colorGuess = document.getElementById("color-guess");
const colorGuessNote = document.getElementById("color-guess-note");
const brandCheck = document.getElementById("brand-check");
const brandCheckHeading = document.getElementById("brand-check-heading");
const brandCheckLinkList = document.getElementById("brand-check-links");
const savedLink = document.getElementById("saved-link");
const savedCount = document.getElementById("saved-count");

const context = canvas.getContext("2d", { willReadFrequently: true });
let pickedColor = null;
let latestIdentification = 0;
let originalPhotoSize = null;
let pickedSpot = null;
let savedShades = loadSavedShades();

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

function loadImage(source) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("unreadable image"));
    image.src = source;
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

  const photoUrl = URL.createObjectURL(file);
  let image;
  try {
    image = await loadImage(photoUrl);
  } catch {
    showError("We couldn't open that photo. Try a different one, or take a new picture.");
    return;
  } finally {
    URL.revokeObjectURL(photoUrl);
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

// Draws a magnified view around the tapped spot, with a ring showing the
// area the color was averaged from, so a tap on the packaging is easy to spot.
function showCloseUp(x, y) {
  const zoomContext = pickedZoom.getContext("2d");
  const sourceSize = pickedZoom.width / CLOSE_UP_ZOOM;
  zoomContext.imageSmoothingEnabled = false;
  zoomContext.clearRect(0, 0, pickedZoom.width, pickedZoom.height);
  zoomContext.drawImage(
    canvas,
    x - sourceSize / 2,
    y - sourceSize / 2,
    sourceSize,
    sourceSize,
    0,
    0,
    pickedZoom.width,
    pickedZoom.height,
  );
  zoomContext.strokeStyle = "white";
  zoomContext.lineWidth = 2;
  zoomContext.beginPath();
  zoomContext.arc(pickedZoom.width / 2, pickedZoom.height / 2, SAMPLE_RADIUS * CLOSE_UP_ZOOM, 0, Math.PI * 2);
  zoomContext.stroke();
}

function pickShade(x, y) {
  pickedSpot = { x, y };
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  pickedColor = averageColor(imageData, x, y, SAMPLE_RADIUS);
  showPhotoWarning(imageData, { x, y });

  pickedSwatch.style.background = rgbToHex(pickedColor);
  const name = colorName(pickedColor);
  pickedName.textContent = name;
  showCloseUp(x, y);
  packagingTip.hidden = !looksLikePackaging(pickedColor);
  packagingTip.textContent = `That reads as ${name}, which is often the case, cap, or background. If you didn't tap the makeup, tap the product itself.`;

  sampleMarker.style.left = `${(x / canvas.width) * 100}%`;
  sampleMarker.style.top = `${(y / canvas.height) * 100}%`;
  sampleMarker.hidden = false;

  renderResults();
}

// Without an AI key, guess what the product is from the picked color and the
// closest match, and say plainly that it's only a guess.
function currentPreferences() {
  const maxPrice = Number(maxPriceInput.value);
  return {
    crueltyFree: crueltyFreeCheckbox.checked,
    noDyes: noDyesCheckbox.checked,
    vegan: veganCheckbox.checked,
    // An empty, zero, or negative price means "any price".
    maxPrice: maxPriceInput.value !== "" && maxPrice > 0 ? maxPrice : null,
    undertone: undertoneSelect.value || null,
  };
}

function showPreferences(preferences) {
  crueltyFreeCheckbox.checked = preferences.crueltyFree;
  noDyesCheckbox.checked = preferences.noDyes;
  veganCheckbox.checked = preferences.vegan;
  maxPriceInput.value = preferences.maxPrice ?? "";
  undertoneSelect.value = preferences.undertone ?? "";
}

// Orders matches by how many checked preferences they meet, keeping
// closest-first order among equal fits, so fitting products aren't cut off
// by the limit.
function orderByPreferences(closeMatches, preferences) {
  if (!hasPreferences(preferences)) {
    preferencesSummary.hidden = true;
    return closeMatches.slice(0, MAX_MATCHES).map((product) => ({ ...product, fitPercent: null, fits: false }));
  }
  const shown = closeMatches
    .map((product) => {
      const fitPercent = preferenceFitPercent(product, preferences);
      return { ...product, fitPercent, fits: fitPercent === 100 };
    })
    .sort((a, b) => b.fitPercent - a.fitPercent)
    .slice(0, MAX_MATCHES);

  const fittingShown = shown.filter((product) => product.fits).length;
  preferencesSummary.hidden = shown.every((product) => product.fitPercent === null);
  preferencesSummary.textContent =
    fittingShown === 0
      ? "None of the close matches fit everything you checked, so here are the closest ones."
      : `${fittingShown} of ${shown.length} matches fit what matters to you.`;
  return shown;
}

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

  const closeMatches = findClosestProducts(pickedColor, products, {
    category: categorySelect.value,
    excludeBrand: brandInput.value,
    limit: Infinity,
  });
  renderColorGuess(closeMatches);
  const matches = orderByPreferences(closeMatches, currentPreferences());
  resultsEmpty.hidden = matches.length > 0;
  resultsEmpty.textContent =
    "No close matches for this shade yet. Try tapping a different spot, or pick another product type.";

  const paidPrice = parsePaidPrice(paidPriceInput.value);
  for (const product of matches) {
    const item = document.createElement("li");
    item.className = "product-card";
    item.innerHTML = `
      <div class="product-info">
        <p class="product-brand"></p>
        <p class="product-name"></p>
        <p class="product-meta"><span class="product-price"></span> · <span class="product-match"></span></p>
        <details class="product-ingredients">
          <summary>Ingredients</summary>
          <p class="ingredients-note">Sample data until real products are added.</p>
        </details>
      </div>`;
    item.prepend(
      splitSwatch(rgbToHex(pickedColor), product.shadeHex, `Your color next to ${product.name}`, {
        className: "product-image",
        withLabels: true,
      }),
    );
    item.querySelector(".product-info").append(saveButton(product));
    item.querySelector(".product-brand").textContent = product.brand;
    item.querySelector(".product-name").textContent = product.name;
    item.querySelector(".product-price").textContent = `$${product.price}`;
    item.querySelector(".product-match").textContent = `${product.match}% match`;
    const savings = savingsLabel(product.price, paidPrice);
    if (savings) {
      const savingsText = document.createElement("span");
      savingsText.className = savings.saves ? "product-savings saves" : "product-savings";
      savingsText.textContent = savings.text;
      item.querySelector(".product-price").after(" (", savingsText, ")");
    }
    if (product.fitPercent !== null) {
      const fitPercent = document.createElement("span");
      fitPercent.className = "product-fit-percent";
      fitPercent.textContent = `${product.fitPercent}% preferences matched`;
      item.querySelector(".product-meta").append(" · ", fitPercent);
    }
    item.querySelector(".product-meta").after(animalTestingBadge(product.animalTesting));
    if (product.undertone) {
      item.querySelector(".product-meta").after(undertoneLabel(product.undertone, currentPreferences().undertone));
    }
    if (product.fits) {
      item.classList.add("product-fits");
      const fitsLabel = document.createElement("p");
      fitsLabel.className = "fits-label";
      fitsLabel.textContent = "✓ Fits what matters to you";
      item.querySelector(".product-brand").before(fitsLabel);
    }
    item.querySelector(".product-ingredients summary").after(ingredientList(product.ingredients));
    resultsList.append(item);
  }
}

// A ♡ button that saves the product to "My saved shades", or removes it once
// it's saved.
function saveButton(product) {
  const saved = isSaved(savedShades, product.id);
  const button = document.createElement("button");
  button.type = "button";
  button.className = saved ? "save-button saved" : "save-button";
  button.textContent = saved ? "♥ Saved" : "♡ Save";
  button.dataset.productId = product.id;
  button.setAttribute("aria-pressed", String(saved));
  button.setAttribute("aria-label", `${saved ? "Remove" : "Save"} ${product.name} by ${product.brand}`);
  button.addEventListener("click", () =>
    toggleSaved(product.id, { yourColor: rgbToHex(pickedColor), match: product.match }),
  );
  return button;
}

function toggleSaved(productId, details) {
  const savePressed = document.activeElement?.classList.contains("save-button");
  savedShades = toggleSavedShade(savedShades, productId, details);
  storeSavedShades(savedShades);
  renderSavedLink();
  renderResults();
  // The matches are redrawn, so keep focus on the button that was pressed.
  if (savePressed) {
    resultsList.querySelector(`[data-product-id="${productId}"]`)?.focus();
  }
}

// The saved shades live on their own page; this shows how many there are and
// links there once at least one is saved.
function renderSavedLink() {
  savedLink.hidden = savedShades.length === 0;
  savedCount.textContent = savedShades.length;
}

// Names a foundation's undertone and, once the user has picked theirs, says
// whether the two match.
function undertoneLabel(productUndertone, userUndertone) {
  const label = document.createElement("p");
  label.className = "undertone-label";
  label.textContent = `${capitalize(productUndertone)} undertone`;
  if (userUndertone !== null) {
    const matches = productUndertone === userUndertone;
    label.classList.add(matches ? "undertone-match" : "undertone-mismatch");
    label.textContent += matches ? " · ✓ matches yours" : ` · yours is ${userUndertone}`;
  }
  return label;
}

function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

photoInput.addEventListener("change", () => handlePhoto(photoInput.files[0]));

canvas.addEventListener("click", (event) => {
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor(((event.clientX - rect.left) / rect.width) * canvas.width);
  const y = Math.floor(((event.clientY - rect.top) / rect.height) * canvas.height);
  pickShade(x, y);
});

categorySelect.addEventListener("change", renderResults);
paidPriceInput.addEventListener("input", renderResults);
for (const preferenceInput of [crueltyFreeCheckbox, noDyesCheckbox, veganCheckbox, maxPriceInput, undertoneSelect]) {
  preferenceInput.addEventListener("input", () => {
    savePreferences(currentPreferences());
    renderResults();
  });
}

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

// Keeps the current photo and choices for this tab when leaving the page, such
// as to open My saved shades, so they're back on return. A PNG keeps colors
// exact; if it's too big to store, a JPEG is tried instead.
function rememberCurrentSearch() {
  if (pickedSpot === null) {
    return;
  }
  const search = {
    originalWidth: originalPhotoSize.width,
    originalHeight: originalPhotoSize.height,
    tapX: pickedSpot.x,
    tapY: pickedSpot.y,
    brand: brandInput.value,
    paidPrice: paidPriceInput.value,
    category: categorySelect.value,
  };
  if (!rememberSearch({ ...search, photo: canvas.toDataURL("image/png") })) {
    if (!rememberSearch({ ...search, photo: canvas.toDataURL("image/jpeg", 0.92) })) {
      forgetSearch();
    }
  }
}

// Puts back a photo and choices remembered earlier in this tab. The AI isn't
// asked again, since each identification costs money.
async function restoreSearch() {
  const search = recallSearch();
  if (!search) {
    return;
  }
  let image;
  try {
    image = await loadImage(search.photo);
  } catch {
    forgetSearch();
    return;
  }
  canvas.width = image.width;
  canvas.height = image.height;
  context.drawImage(image, 0, 0);
  photoArea.hidden = false;
  originalPhotoSize = { width: search.originalWidth, height: search.originalHeight };
  brandInput.value = search.brand;
  paidPriceInput.value = search.paidPrice;
  if ([...categorySelect.options].some((option) => option.value === search.category)) {
    categorySelect.value = search.category;
  }
  renderBrandCheck();
  pickShade(Math.min(search.tapX, canvas.width - 1), Math.min(search.tapY, canvas.height - 1));
  if (currentApiKey()) {
    identificationStatus.hidden = false;
    identificationStatus.textContent = "Your photo is back. To identify it with AI again, choose the photo again.";
  } else {
    identificationStatus.hidden = true;
  }
}

window.addEventListener("pagehide", rememberCurrentSearch);

showPreferences(loadPreferences());
renderSavedLink();
showKeyStatus();
restoreSearch();
