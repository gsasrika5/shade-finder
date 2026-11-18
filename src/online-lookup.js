// Looks up real skincare products and their ingredient lists on Open Beauty
// Facts, a free, open database of cosmetics that anyone can add to.
const SEARCH_URL = "https://world.openbeautyfacts.org/cgi/search.pl";
const PRODUCT_URL = "https://world.openbeautyfacts.org/api/v2/product";
const PRODUCT_FIELDS = "product_name,brands,ingredients_text,image_front_small_url";
const MAX_RESULTS = 5;

// Splits a label's ingredient text into single ingredients. Commas inside
// parentheses, like "Tocopherol (Vitamin E, Antioxidant)", stay together.
// Labels often start with "Ingredients:" and the text people type in often
// runs on past the list ("Parfum. Art. No. 80107 Beiersdorf AG"), so a
// sentence break ends an ingredient, except after "Denat." or an initial
// like the "D." in "S.D. Alcohol".
export function splitIngredients(text) {
  const ingredients = [];
  let current = "";
  let depth = 0;
  for (const character of text.replace(/^\s*ingredients?\s*:\s*/i, "")) {
    if (character === "(" || character === "[") {
      depth += 1;
    } else if ((character === ")" || character === "]") && depth > 0) {
      depth -= 1;
    }
    if ((character === "," || character === ";") && depth === 0) {
      ingredients.push(current);
      current = "";
    } else {
      current += character;
    }
  }
  ingredients.push(current);
  return ingredients
    .map((ingredient) =>
      ingredient
        .replace(/(?<!denat|\b[a-z])\.\s[\s\S]*$/i, "")
        .trim()
        .replace(/\.$/, ""),
    )
    .filter((ingredient) => ingredient !== "");
}

// Lowercase letters and digits only, with accents removed, so "Crème" and
// "creme" read the same.
function simplify(text) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function brandsOf(product) {
  return product.brand.split(",").map(simplify).filter((brand) => brand !== "");
}

// The name without a brand in front: "CeraVe Moisturizing Cream" is
// "moisturizing cream".
function nameWithoutBrand(product) {
  let name = simplify(product.name);
  for (const brand of brandsOf(product)) {
    if (name.startsWith(`${brand} `)) {
      name = name.slice(brand.length + 1);
    }
  }
  return name;
}

function isSameProduct(first, second) {
  const secondBrands = brandsOf(second);
  return (
    nameWithoutBrand(first) === nameWithoutBrand(second) &&
    brandsOf(first).some((brand) => secondBrands.includes(brand))
  );
}

// Anyone can add to Open Beauty Facts, so the same product is often there
// several times ("CeraVe | Moisturizing Cream", "Cerave | CeraVe moisturizing
// cream"). Keeps one of each, the one with the longest ingredient list, since
// that's usually the most complete label, in the order they first appear.
export function uniqueProducts(products) {
  const kept = [];
  for (const product of products) {
    const index = kept.findIndex((other) => isSameProduct(other, product));
    if (index === -1) {
      kept.push(product);
    } else if (product.ingredients.length > kept[index].ingredients.length) {
      kept[index] = product;
    }
  }
  return kept;
}

// Returns up to five different products matching the search that have an
// ingredient list, each as { name, brand, imageUrl, ingredients }. Throws if
// the database can't be reached.
export async function searchProductsOnline(query) {
  const params = new URLSearchParams({
    search_terms: query,
    search_simple: "1",
    json: "1",
    page_size: "50",
    fields: PRODUCT_FIELDS,
  });
  const response = await fetch(`${SEARCH_URL}?${params}`);
  if (!response.ok) {
    throw new Error(`Open Beauty Facts answered ${response.status}`);
  }
  const data = await response.json();
  const products = (data.products ?? []).filter(hasIngredients).map(toProduct);
  return uniqueProducts(products).slice(0, MAX_RESULTS);
}

function hasIngredients(product) {
  return Boolean(product.product_name && product.ingredients_text);
}

// Turns an Open Beauty Facts product into { name, brand, imageUrl, ingredients }.
function toProduct(product) {
  return {
    name: product.product_name,
    brand: product.brands || "Unknown brand",
    imageUrl: product.image_front_small_url ?? null,
    ingredients: splitIngredients(product.ingredients_text),
  };
}

// Product barcodes (UPC and EAN) are 8 to 14 digits. Spaces and dashes people
// type between groups of digits are ignored. Returns the digits, or null if it
// can't be a barcode.
export function cleanBarcode(text) {
  const digits = text.replace(/[\s-]/g, "");
  return /^\d{8,14}$/.test(digits) ? digits : null;
}

// Looks up the one product with this barcode. Returns { status: "found",
// product }, { status: "not-found" } when the database doesn't have it, or
// { status: "no-ingredients", name } when it does but without an ingredient
// list. Throws if the database can't be reached.
export async function lookUpBarcode(barcode) {
  const params = new URLSearchParams({ fields: PRODUCT_FIELDS });
  const response = await fetch(`${PRODUCT_URL}/${encodeURIComponent(barcode)}.json?${params}`);
  if (response.status === 404) {
    return { status: "not-found" };
  }
  if (!response.ok) {
    throw new Error(`Open Beauty Facts answered ${response.status}`);
  }
  const data = await response.json();
  if (data.status !== 1 || !data.product) {
    return { status: "not-found" };
  }
  if (!hasIngredients(data.product)) {
    return { status: "no-ingredients", name: data.product.product_name || "This product" };
  }
  return { status: "found", product: toProduct(data.product) };
}

// Searches for the whole name first. If nothing is found, drops words from
// the end ("The Ordinary Niacinamide" → "The Ordinary") so the user still sees
// what the database has from that brand. Drops at most three words, so a long
// name doesn't send a long string of searches. Returns { products,
// searchedFor }, where searchedFor is the words that found them.
const MAX_WORDS_DROPPED = 3;

export async function searchWithFallback(query, search = searchProductsOnline) {
  const words = query.trim().split(/\s+/);
  const fewestWords = Math.max(1, words.length - MAX_WORDS_DROPPED);
  for (let count = words.length; count >= fewestWords; count -= 1) {
    const searchedFor = words.slice(0, count).join(" ");
    const products = await search(searchedFor);
    if (products.length > 0) {
      return { products, searchedFor };
    }
  }
  return { products: [], searchedFor: query.trim() };
}
