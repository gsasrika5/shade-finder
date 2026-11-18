// "My products": real skincare products the user saved from a scan or a name
// search, kept on this device so they can be checked against the avoid list
// any time.
const MY_PRODUCTS_STORAGE = "shadeFinder.myProducts";
const CHANGE_EVENT = "shadeFinder:myProductsChange";
export const MAX_MY_PRODUCTS = 30;

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
// something unexpected; then the list starts empty, skipping broken entries.
export function loadMyProducts() {
  try {
    const saved = JSON.parse(localStorage.getItem(MY_PRODUCTS_STORAGE));
    return Array.isArray(saved) ? saved.filter(isSavedProduct).slice(0, MAX_MY_PRODUCTS) : [];
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
  return [{ barcode, name, brand, imageUrl, ingredients }, ...myProducts];
}

// Removes just this product, keeping the others in order.
export function removeFromMyProducts(myProducts, product) {
  const id = productId(product);
  return myProducts.filter((saved) => productId(saved) !== id);
}
