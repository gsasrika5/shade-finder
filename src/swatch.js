// Your tapped color on the left and the match's color on the right, so you can
// see how close they look. Colors are set as style properties, never as HTML.
export function splitSwatch(yourColor, matchColor, label, { className, withLabels }) {
  const swatch = document.createElement("div");
  swatch.className = `${className} split-swatch`;
  swatch.setAttribute("role", "img");
  swatch.setAttribute("aria-label", label);
  for (const [color, halfLabel] of [
    [yourColor, "Yours"],
    [matchColor, "Match"],
  ]) {
    const half = document.createElement("span");
    half.className = "swatch-half";
    half.style.background = color;
    if (withLabels) {
      const tag = document.createElement("span");
      tag.className = "swatch-label";
      tag.textContent = halfLabel;
      half.append(tag);
    }
    swatch.append(half);
  }
  return swatch;
}
