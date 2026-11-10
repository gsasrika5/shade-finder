// Asks Claude to identify the makeup product in a photo. The API key is the
// user's own, pasted into the app and kept only in their browser.
import Anthropic from "https://cdn.jsdelivr.net/npm/@anthropic-ai/sdk@1.3.0/+esm";

const MODEL = "claude-opus-5-5";

const productCategories = ["lipstick", "foundation", "blush", "concealer", "eyeshadow", "mascara", "other"];

// The shape Claude must answer in, so the app can rely on every field.
const identificationSchema = {
  type: "object",
  properties: {
    brand: { type: "string" },
    productName: { type: "string" },
    shadeName: { type: "string" },
    category: { type: "string", enum: productCategories },
    shadeHex: { type: "string", description: "The product's color as #rrggbb" },
    animalTesting: {
      type: "string",
      enum: ["cruelty-free", "tested", "unknown"],
      description: "The brand's animal testing policy. Use unknown if you aren't sure.",
    },
    confidence: { type: "string", enum: ["high", "medium", "low"] },
    photoTip: {
      type: "string",
      description: "If confidence is not high, one sentence on how to retake the photo. Otherwise empty.",
    },
    ingredients: { type: "array", items: { type: "string" } },
    similarProducts: {
      type: "array",
      items: {
        type: "object",
        properties: {
          brand: { type: "string" },
          productName: { type: "string" },
          shadeName: { type: "string" },
          shadeHex: { type: "string", description: "#rrggbb" },
          approximatePriceUsd: { type: "number" },
          animalTesting: { type: "string", enum: ["cruelty-free", "tested", "unknown"] },
          whySimilar: { type: "string" },
        },
        required: [
          "brand",
          "productName",
          "shadeName",
          "shadeHex",
          "approximatePriceUsd",
          "animalTesting",
          "whySimilar",
        ],
        additionalProperties: false,
      },
    },
  },
  required: [
    "brand",
    "productName",
    "shadeName",
    "category",
    "shadeHex",
    "animalTesting",
    "confidence",
    "photoTip",
    "ingredients",
    "similarProducts",
  ],
  additionalProperties: false,
};

const instructions = `You identify makeup products from photos for a shade-matching app.
Name the exact brand, product, and shade shown. If you can't be sure, still give your
best guess, set confidence to "low" or "medium", and say in photoTip what would make a
better photo (for example, show the label, use more light, or get closer).
List the product's ingredients as printed on its packaging, as best you know them.
Say whether each brand is cruelty-free (for example, Leaping Bunny certified) or tests
on animals, including where required by law; use "unknown" if you aren't sure.
Suggest 3 to 5 real products from other brands with the closest shade, cheapest first
when they match equally well.`;

export class IdentifyError extends Error {}

// photoJpegBase64 is the photo as base64 JPEG data, without the "data:" prefix.
export async function identifyProduct(apiKey, photoJpegBase64) {
  // The key belongs to the person using the app, so calling from the browser is safe here.
  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });

  let response;
  try {
    response = await client.messages.create({
      model: MODEL,
      max_tokens: 16000,
      output_config: { effort: "low", format: { type: "json_schema", schema: identificationSchema } },
      system: instructions,
      messages: [
        {
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: "image/jpeg", data: photoJpegBase64 } },
            { type: "text", text: "What makeup product is this?" },
          ],
        },
      ],
    });
  } catch (error) {
    throw new IdentifyError(explainApiError(error));
  }

  if (response.stop_reason === "refusal") {
    throw new IdentifyError("The AI couldn't look at this photo. Try a different one.");
  }
  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock) {
    throw new IdentifyError("The AI didn't send back an answer. Please try again.");
  }
  return JSON.parse(textBlock.text);
}

function explainApiError(error) {
  if (error instanceof Anthropic.AuthenticationError) {
    return "That AI key didn't work. Check that you copied the whole key.";
  }
  if (error instanceof Anthropic.PermissionDeniedError) {
    return "That AI key isn't allowed to do this. Check your Anthropic account.";
  }
  if (error instanceof Anthropic.RateLimitError) {
    return "Too many photos at once. Wait a minute and try again.";
  }
  if (error instanceof Anthropic.BadRequestError && /credit/i.test(error.message)) {
    return "Your Anthropic account is out of credit. Add some under Billing.";
  }
  if (error instanceof Anthropic.APIConnectionError) {
    return "Couldn't reach the AI. Check your internet connection.";
  }
  return "Something went wrong identifying the product. Please try again.";
}
