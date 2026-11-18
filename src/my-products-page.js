// The "My products" section of the Skincare tab: the products the user saved,
// each with a Remove button that takes out just that one. A removal can be
// undone, in case it was tapped by mistake.
import { loadAvoidList, onAvoidListChange } from "./avoid-list.js";
import { loadMyProducts, onMyProductsChange, removeFromMyProducts, saveMyProducts } from "./my-products.js";
import { realProductCard } from "./real-product-card.js";

const section = document.getElementById("my-products-section");
const countText = document.getElementById("my-products-count");
const statusText = document.getElementById("my-products-status");
const list = document.getElementById("my-products-list");

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

// Shown once something is saved, and kept while an Undo is on offer even if
// the last product was removed.
function render() {
  countText.textContent = String(myProducts.length);
  list.replaceChildren(...myProducts.map((product) => realProductCard(product, avoidList, removeButton(product))));
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
