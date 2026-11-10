// Shows what the AI found in the photo: the product, its ingredients, and
// similar products from other brands.
import { animalTestingBadge, ingredientList } from "./product-details.js";

const FALLBACK_SWATCH = "#d9cfcc";

// Only accept plain #rrggbb colors from the AI before putting them in a style.
function safeHex(hex) {
  return /^#[0-9a-f]{6}$/i.test(hex) ? hex : FALLBACK_SWATCH;
}

function textElement(tag, className, text) {
  const element = document.createElement(tag);
  element.className = className;
  element.textContent = text;
  return element;
}

function swatchElement(hex, label) {
  const swatch = document.createElement("span");
  swatch.className = "swatch";
  swatch.style.background = safeHex(hex);
  swatch.setAttribute("role", "img");
  swatch.setAttribute("aria-label", label);
  return swatch;
}

function similarProductCard(product) {
  const card = document.createElement("li");
  card.className = "product-card";
  const image = document.createElement("div");
  image.className = "product-image";
  image.style.background = safeHex(product.shadeHex);
  image.setAttribute("role", "img");
  image.setAttribute("aria-label", `${product.shadeName} shade`);

  const info = document.createElement("div");
  info.className = "product-info";
  info.append(
    textElement("p", "product-brand", product.brand),
    textElement("p", "product-name", `${product.productName}, ${product.shadeName}`),
    textElement("p", "product-meta", `About $${Math.round(product.approximatePriceUsd)}`),
    animalTestingBadge(product.animalTesting),
    textElement("p", "product-why", product.whySimilar),
  );
  card.append(image, info);
  return card;
}

export function renderIdentification(container, result) {
  container.replaceChildren();

  const heading = document.createElement("div");
  heading.className = "identified-product";
  const details = document.createElement("div");
  details.append(
    textElement("p", "product-brand", result.brand),
    textElement("p", "identified-name", result.productName),
    textElement("p", "product-meta", `Shade: ${result.shadeName} · ${result.category}`),
    animalTestingBadge(result.animalTesting),
  );
  heading.append(swatchElement(result.shadeHex, `${result.shadeName} shade`), details);
  container.append(heading);

  if (result.confidence !== "high") {
    const tip = result.photoTip || "Try a clearer photo that shows the product's label.";
    container.append(textElement("p", "low-confidence", `This is our best guess. ${tip}`));
  }

  container.append(textElement("h3", "", "Ingredients"));
  if (result.ingredients.length === 0) {
    container.append(textElement("p", "empty", "We couldn't find this product's ingredients."));
  } else {
    container.append(
      ingredientList(result.ingredients),
      textElement("p", "ingredients-note", "Listed by AI. Check the packaging if you have allergies."),
    );
  }

  container.append(textElement("h3", "", "Similar products from other brands"));
  if (result.similarProducts.length === 0) {
    container.append(textElement("p", "empty", "We couldn't find similar products for this one."));
  } else {
    const similarList = document.createElement("ul");
    similarList.className = "results-list";
    for (const product of result.similarProducts) {
      similarList.append(similarProductCard(product));
    }
    container.append(similarList);
  }
}
