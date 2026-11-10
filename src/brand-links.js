// Links for checking a brand on trusted sites. The app doesn't state these
// facts itself, because they're about real companies and change over time.
// Most of these sites have no search link of their own, so each link is a
// Google search limited to that site.

function googleSearch(query) {
  return `https://www.google.com/search?${new URLSearchParams({ q: query })}`;
}

export function brandCheckLinks(brand) {
  const quotedBrand = `"${brand.trim()}"`;
  return [
    {
      label: "Animal testing",
      source: "Leaping Bunny",
      url: googleSearch(`site:leapingbunny.org ${quotedBrand}`),
    },
    {
      label: "Eco-friendly and ethics",
      source: "Good On You",
      url: googleSearch(`site:goodonyou.eco ${quotedBrand}`),
    },
    {
      label: "Controversies in the news",
      source: "Google News",
      url: `https://news.google.com/search?${new URLSearchParams({
        q: `${quotedBrand} controversy OR lawsuit OR recall`,
      })}`,
    },
    {
      label: "Product recalls",
      source: "FDA",
      url: googleSearch(`site:fda.gov ${quotedBrand} recall`),
    },
  ];
}
