import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

// What Claude sends back after looking at the photos.
const ExtractSchema = z.object({
  found_recipe: z.boolean(),
  name: z.string(),
  tagline: z.string(),
  color: z.string(),
  servings: z.string(),
  ingredients: z.array(z.object({ name: z.string(), amount: z.string(), unit: z.string(), note: z.string() })),
  steps: z.array(z.string()),
  notes: z.string(),
  tags: z.array(z.string()),
});
export type Extracted = z.infer<typeof ExtractSchema>;

const jsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["found_recipe", "name", "tagline", "color", "servings", "ingredients", "steps", "notes", "tags"],
  properties: {
    found_recipe: { type: "boolean", description: "false if the photos show nothing that can become a slushie recipe" },
    name: { type: "string", description: "A short, fun name for the slushie" },
    tagline: { type: "string", description: "One playful line describing it" },
    color: { type: "string", description: "Hex colour like #ff3b6b matching the drink's likely colour" },
    servings: { type: "string", description: "e.g. '4 cups' or '1 machine batch (3 L)'; empty if unknown" },
    ingredients: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["name", "amount", "unit", "note"],
        properties: {
          name: { type: "string" },
          amount: { type: "string", description: "Number or fraction as text, empty if unknown" },
          unit: { type: "string", description: "ml, L, cups, tbsp, g, etc. Empty if none" },
          note: { type: "string", description: "Brand, flavour, or prep detail seen in the photo; empty if none" },
        },
      },
    },
    steps: { type: "array", items: { type: "string" } },
    notes: { type: "string", description: "Anything else useful: sugar/Brix tips, machine settings, what was guessed" },
    tags: { type: "array", items: { type: "string" } },
  },
} as const;

const SYSTEM = `You help people save slushie recipes. You'll get one or more photos: a handwritten or printed recipe card,
bottles/cans/syrup labels, a screenshot, or a photo of a finished slushie.
Extract every ingredient you can read, with amounts and units exactly as shown. If a photo only shows bottles or a
finished drink, list the visible ingredients and suggest sensible amounts for a home slushie, and say in "notes"
which amounts were guessed. Steps should be short and practical (blending or slushie machine). If the person added a
note, follow it. Keep the name fun. Use Australian/British spelling and metric units unless the photo says otherwise.`;

export type ImageInput = { mime: "image/jpeg" | "image/png" | "image/webp" | "image/gif"; base64: string };

export async function extractRecipe(images: ImageInput[], hint: string): Promise<Extracted> {
  const client = new Anthropic();
  const response = await client.beta.messages.create({
    model: "claude-opus-5-5",
    max_tokens: 8000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    output_config: { effort: "medium", format: { type: "json_schema", schema: jsonSchema } },
    system: SYSTEM,
    messages: [
      {
        role: "user",
        content: [
          ...images.map((img) => ({
            type: "image" as const,
            source: { type: "base64" as const, media_type: img.mime, data: img.base64 },
          })),
          { type: "text" as const, text: hint ? `Note from me: ${hint}` : "Turn this into a slushie recipe." },
        ],
      },
    ],
  });

  if (response.stop_reason === "refusal") throw new Error("Claude couldn't help with that photo.");
  const text = response.content.flatMap((b) => (b.type === "text" ? [b.text] : [])).join("");
  return ExtractSchema.parse(JSON.parse(text));
}
