// Spots common photo problems so the app can say how to retake the photo,
// instead of quietly giving poor matches.

const MIN_PHOTO_SIDE = 300;
const DARK_BRIGHTNESS = 55;
const BRIGHT_BRIGHTNESS = 225;
const GLARE_PIXEL_SHARE = 0.3;
const GLARE_LEVEL = 245;
const BLURRY_SHARPNESS = 10;
// How far around the picked spot to judge brightness, as a share of the photo's shorter side.
const FOCUS_AREA_SHARE = 0.08;

// Each message says what the app noticed, then what to try.
const photoProblems = {
  small:
    "This photo is quite small, so some detail may be lost. If the matches seem off, try the original photo instead of a screenshot, or take one closer to the product.",
  dark: "This photo looks quite dark, which can make colors hard to read. If the matches seem off, try again near a window or with a light on.",
  bright:
    "Parts of this photo look very bright, which can wash out the color. If the matches seem off, try a spot without shine or softer light.",
  blurry:
    "This photo looks a little blurry. If the matches seem off, hold your phone still and tap the product on your screen to focus before taking the picture.",
};

function grayscale(data, pixelIndex) {
  return 0.299 * data[pixelIndex] + 0.587 * data[pixelIndex + 1] + 0.114 * data[pixelIndex + 2];
}

// Sharp photos have strong changes between neighboring pixels; blurry ones
// don't. This measures how much each pixel differs from its four neighbors.
function sharpness({ width, height, data }) {
  let sum = 0;
  let sumOfSquares = 0;
  let count = 0;
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = (y * width + x) * 4;
      const neighbors =
        grayscale(data, i - 4) + grayscale(data, i + 4) + grayscale(data, i - width * 4) + grayscale(data, i + width * 4);
      const edge = neighbors - 4 * grayscale(data, i);
      sum += edge;
      sumOfSquares += edge * edge;
      count++;
    }
  }
  if (count === 0) {
    return 0;
  }
  const mean = sum / count;
  return sumOfSquares / count - mean * mean;
}

// Average brightness and share of near-white pixels inside a rectangle.
function brightnessStats({ width, data }, left, top, right, bottom) {
  let totalBrightness = 0;
  let glarePixels = 0;
  let pixelCount = 0;
  for (let y = top; y < bottom; y++) {
    for (let x = left; x < right; x++) {
      const i = (y * width + x) * 4;
      totalBrightness += grayscale(data, i);
      if (data[i] > GLARE_LEVEL && data[i + 1] > GLARE_LEVEL && data[i + 2] > GLARE_LEVEL) {
        glarePixels++;
      }
      pixelCount++;
    }
  }
  return { averageBrightness: totalBrightness / pixelCount, glareShare: glarePixels / pixelCount };
}

// Returns a message describing the photo's biggest problem, or null if it looks fine.
// originalWidth and originalHeight are the photo's size before the app shrank it.
// focus is the spot the user picked; brightness is judged around it, so a white
// table or wall behind the product doesn't count as glare.
export function photoProblem(imageData, originalWidth, originalHeight, focus) {
  if (Math.min(originalWidth, originalHeight) < MIN_PHOTO_SIDE) {
    return photoProblems.small;
  }

  const { width, height } = imageData;
  const wholePhoto = brightnessStats(imageData, 0, 0, width, height);
  if (wholePhoto.averageBrightness < DARK_BRIGHTNESS) {
    return photoProblems.dark;
  }

  const radius = Math.max(4, Math.round(Math.min(width, height) * FOCUS_AREA_SHARE));
  const aroundFocus = brightnessStats(
    imageData,
    Math.max(0, focus.x - radius),
    Math.max(0, focus.y - radius),
    Math.min(width, focus.x + radius + 1),
    Math.min(height, focus.y + radius + 1),
  );
  if (aroundFocus.averageBrightness > BRIGHT_BRIGHTNESS || aroundFocus.glareShare > GLARE_PIXEL_SHARE) {
    return photoProblems.bright;
  }
  if (sharpness(imageData) < BLURRY_SHARPNESS) {
    return photoProblems.blurry;
  }
  return null;
}
