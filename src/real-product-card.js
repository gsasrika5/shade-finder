// The card for a real product from Open Beauty Facts: photo, brand, name, the
// user's avoid-list summary, and the full ingredient list folded away. Used by
// the lookup results and My products.
import { checkIngredients, personalWarning } from "./avoid-list.js";
import { ingredientCheck, ingredientList } from "./product-details.js";

// action is a button (Save or Remove) shown at the bottom of the card.
export function realProductCard(product, avoidList, action) {
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
  fullList.append(summary, ingredientList(product.ingredients, { warningFor: personalWarning(avoidList), watchedName: "ingredient" }));
  info.append(brand, name, ingredientCheck(checkIngredients(product.ingredients, avoidList)), fullList, action);
  item.append(info);
  return item;
}
