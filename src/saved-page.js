// The "My saved shades" page: every shade the user saved on the main page,
// with the same details as a match, and a way to remove each one.
import { colorName, hexToRgb } from "./color.js";
import { animalTestingBadge, ingredientList } from "./product-details.js";
import { products } from "./products.js";
import { loadSavedShades, storeSavedShades, toggleSavedShade } from "./saved-shades.js";
import { splitSwatch } from "./swatch.js";

const savedList = document.getElementById("saved-list");
const savedEmpty = document.getElementById("saved-empty");

let savedShades = loadSavedShades();

function removeShade(productId) {
  savedShades = toggleSavedShade(savedShades, productId);
  storeSavedShades(savedShades);
  renderSavedShades();
}

// Shades saved before tapped colors were remembered show just their own color.
function shadeSwatch(shade, product) {
  if (shade.yourColor) {
    return splitSwatch(shade.yourColor, product.shadeHex, `Your color next to ${product.name}`, {
      className: "product-image",
      withLabels: true,
    });
  }
  const swatch = document.createElement("div");
  swatch.className = "product-image";
  swatch.style.background = product.shadeHex;
  swatch.setAttribute("role", "img");
  swatch.setAttribute("aria-label", `${product.name} shade`);
  return swatch;
}

function savedCard(shade, product) {
  const item = document.createElement("li");
  item.className = "product-card";
  item.innerHTML = `
    <div class="product-info">
      <p class="product-brand"></p>
      <p class="product-name"></p>
      <p class="product-meta"><span class="product-price"></span></p>
      <p class="saved-note"></p>
      <details class="product-ingredients">
        <summary>Ingredients</summary>
        <p class="ingredients-note">Sample data until real products are added.</p>
      </details>
      <button type="button" class="secondary saved-remove">Remove</button>
    </div>`;
  item.prepend(shadeSwatch(shade, product));
  item.querySelector(".product-brand").textContent = product.brand;
  item.querySelector(".product-name").textContent = product.name;
  item.querySelector(".product-price").textContent = `$${product.price}`;
  if (shade.yourColor && shade.match !== undefined) {
    item.querySelector(".saved-note").textContent =
      `${shade.match}% match to your ${colorName(hexToRgb(shade.yourColor))}`;
  }
  item.querySelector(".product-meta").after(animalTestingBadge(product.animalTesting));
  item.querySelector(".product-ingredients summary").after(ingredientList(product.ingredients));
  const removeButton = item.querySelector(".saved-remove");
  removeButton.setAttribute("aria-label", `Remove ${product.name} from saved shades`);
  removeButton.addEventListener("click", () => removeShade(product.id));
  return item;
}

function renderSavedShades() {
  // Skips shades that no longer match a product, such as after the sample data changes.
  const savedEntries = savedShades
    .map((shade) => ({ shade, product: products.find((product) => product.id === shade.id) }))
    .filter(({ product }) => product);
  savedEmpty.hidden = savedEntries.length > 0;
  savedList.replaceChildren(...savedEntries.map(({ shade, product }) => savedCard(shade, product)));
}

renderSavedShades();
