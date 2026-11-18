// "My products": real skincare products the user saved from a scan or a name
// search, kept on this device so they can be checked against the avoid list
// any time.
const MY_PRODUCTS_STORAGE = "shadeFinder.myProducts";
const CHANGE_EVENT = "shadeFinder:myProductsChange";
export const MAX_MY_PRODUCTS = 30;
// How a saved product worked for the user: "good", "irritated", or null for
// not marked yet.
export const REACTIONS = ["good", "irritated"];
// A short note of the user's own, like "too greasy" or "$12 at Target".
export const MAX_NOTE_LENGTH = 200;

function cleanNote(text) {
  return typeof text === "string" ? text.trim().slice(0, MAX_NOTE_LENGTH) : "";
}

// The same product found by barcode or by name gets the same id when the
// database has its barcode; otherwise brand and name stand in.
export function productId(product) {
  return product.barcode ? `barcode:${product.barcode}` : `name:${product.brand}|${product.name}`.toLowerCase();
}

function isSavedProduct(value) {
  return (
    typeof value?.name === "string" &&
    typeof value.brand === "string" &&
    Array.isArray(value.ingredients) &&
    value.ingredients.every((ingredient) => typeof ingredient === "string")
  );
}

// Browser storage can be blocked (for example in private windows), or hold
// something unexpected; then the list starts empty, skipping broken entries,
// an unknown reaction counts as not marked, and a broken note as no note.
export function loadMyProducts() {
  try {
    const saved = JSON.parse(localStorage.getItem(MY_PRODUCTS_STORAGE));
    return Array.isArray(saved)
      ? saved
          .filter(isSavedProduct)
          .slice(0, MAX_MY_PRODUCTS)
          .map((product) => ({
            ...product,
            reaction: REACTIONS.includes(product.reaction) ? product.reaction : null,
            note: cleanNote(product.note),
          }))
      : [];
  } catch {
    return [];
  }
}

// Saves the list and tells every part of the page showing products to update.
export function saveMyProducts(myProducts) {
  try {
    localStorage.setItem(MY_PRODUCTS_STORAGE, JSON.stringify(myProducts));
  } catch {
    // Not remembered, but it still applies for this visit.
  }
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: myProducts }));
}

export function onMyProductsChange(callback) {
  window.addEventListener(CHANGE_EVENT, (event) => callback(event.detail));
}

export function isInMyProducts(myProducts, product) {
  const id = productId(product);
  return myProducts.some((saved) => productId(saved) === id);
}

// Adds a product to the top of the list. Returns the new list, or null when
// the list is already full.
export function addToMyProducts(myProducts, product) {
  if (isInMyProducts(myProducts, product)) {
    return myProducts;
  }
  if (myProducts.length >= MAX_MY_PRODUCTS) {
    return null;
  }
  const { barcode = null, name, brand, imageUrl = null, ingredients } = product;
  return [{ barcode, name, brand, imageUrl, ingredients, reaction: null, note: "" }, ...myProducts];
}

// Saves the user's note on a product, trimmed and cut to MAX_NOTE_LENGTH. An
// empty note removes it.
export function setNote(myProducts, product, text) {
  const id = productId(product);
  return myProducts.map((saved) => (productId(saved) === id ? { ...saved, note: cleanNote(text) } : saved));
}

// Marks how a saved product worked for the user. Choosing the same reaction
// again clears it.
export function setReaction(myProducts, product, reaction) {
  const id = productId(product);
  return myProducts.map((saved) =>
    productId(saved) === id ? { ...saved, reaction: saved.reaction === reaction ? null : reaction } : saved,
  );
}

// Removes just this product, keeping the others in order.
export function removeFromMyProducts(myProducts, product) {
  const id = productId(product);
  return myProducts.filter((saved) => productId(saved) !== id);
}
