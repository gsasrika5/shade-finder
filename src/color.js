// Color helpers for comparing makeup shades the way people see them.
// Colors are compared in CIELAB space, where equal distances look roughly
// equally different to the eye (unlike raw RGB).

export function hexToRgb(hex) {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex);
  if (!match) {
    throw new Error(`Not a hex color: ${hex}`);
  }
  const value = parseInt(match[1], 16);
  return { r: (value >> 16) & 255, g: (value >> 8) & 255, b: value & 255 };
}

export function rgbToHex({ r, g, b }) {
  return "#" + [r, g, b].map((c) => Math.round(c).toString(16).padStart(2, "0")).join("");
}

function srgbToLinear(channel) {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

export function rgbToLab({ r, g, b }) {
  const lr = srgbToLinear(r);
  const lg = srgbToLinear(g);
  const lb = srgbToLinear(b);

  // sRGB to XYZ (D65), normalized by the reference white.
  const x = (lr * 0.4124 + lg * 0.3576 + lb * 0.1805) / 0.95047;
  const y = lr * 0.2126 + lg * 0.7152 + lb * 0.0722;
  const z = (lr * 0.0193 + lg * 0.1192 + lb * 0.9505) / 1.08883;

  const f = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  const fx = f(x);
  const fy = f(y);
  const fz = f(z);

  return { l: 116 * fy - 16, a: 500 * (fx - fy), b: 200 * (fy - fz) };
}

// CIE76 color difference: about 2 is barely noticeable, 10+ is clearly different.
export function colorDistance(rgbA, rgbB) {
  const labA = rgbToLab(rgbA);
  const labB = rgbToLab(rgbB);
  return Math.hypot(labA.l - labB.l, labA.a - labB.a, labA.b - labB.b);
}

// Turns a color distance into a friendly 0–100 match score.
export function matchPercent(distance) {
  return Math.max(0, Math.round(100 - distance * 2));
}

// Averages the pixels in a square around (centerX, centerY) so one stray
// pixel (a highlight or speck of dust) doesn't decide the shade.
export function averageColor(imageData, centerX, centerY, radius) {
  const { width, height, data } = imageData;
  let r = 0;
  let g = 0;
  let b = 0;
  let count = 0;
  for (let y = Math.max(0, centerY - radius); y <= Math.min(height - 1, centerY + radius); y++) {
    for (let x = Math.max(0, centerX - radius); x <= Math.min(width - 1, centerX + radius); x++) {
      const i = (y * width + x) * 4;
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
      count++;
    }
  }
  if (count === 0) {
    throw new Error("Sample point is outside the image");
  }
  return { r: r / count, g: g / count, b: b / count };
}

// Matches below this score look clearly different, so they aren't shown.
export const MIN_MATCH_PERCENT = 70;

// excludeBrand leaves out the user's own brand, so matches are alternatives.
export function findClosestProducts(targetRgb, products, { category = "all", excludeBrand = "", limit = 6 } = {}) {
  const excluded = excludeBrand.trim().toLowerCase();
  return products
    .filter((product) => category === "all" || product.category === category)
    .filter((product) => excluded === "" || product.brand.toLowerCase() !== excluded)
    .map((product) => {
      const distance = colorDistance(targetRgb, hexToRgb(product.shadeHex));
      return { ...product, distance, match: matchPercent(distance) };
    })
    .filter((product) => product.match >= MIN_MATCH_PERCENT)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit);
}

// Everyday names for makeup colors, each with a typical shade. A color gets
// the name of whichever typical shade it looks closest to.
const namedShades = [
  { name: "red", hex: "#b0222a" },
  { name: "deep red", hex: "#7e1424" },
  { name: "berry", hex: "#5e1a33" },
  { name: "pink", hex: "#e08a9a" },
  { name: "light pink", hex: "#f4b5c1" },
  { name: "hot pink", hex: "#e0457b" },
  { name: "rose", hex: "#c66078" },
  { name: "mauve", hex: "#9a5e6c" },
  { name: "nude", hex: "#b97a6d" },
  { name: "coral", hex: "#e0614f" },
  { name: "peach", hex: "#f2a58a" },
  { name: "light beige", hex: "#f0d2bd" },
  { name: "beige", hex: "#dbad8a" },
  { name: "caramel", hex: "#b98057" },
  { name: "deep brown", hex: "#5e3a28" },
];

export function colorName(rgb) {
  let closest = namedShades[0];
  let closestDistance = Infinity;
  for (const shade of namedShades) {
    const distance = colorDistance(rgb, hexToRgb(shade.hex));
    if (distance < closestDistance) {
      closest = shade;
      closestDistance = distance;
    }
  }
  return closest.name;
}
