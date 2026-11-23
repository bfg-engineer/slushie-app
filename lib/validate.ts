import { z } from "zod";

const str = (max: number) => z.string().trim().max(max).default("");

export const IngredientSchema = z.object({
  name: z.string().trim().min(1).max(200),
  amount: str(50),
  unit: str(50),
  note: str(300),
});

export const RecipeInputSchema = z.object({
  name: z.string().trim().min(1, "Give it a name").max(120),
  tagline: str(200),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#ff3b6b"),
  servings: str(60),
  ingredients: z.array(IngredientSchema).max(60).default([]),
  steps: z.array(z.string().trim().min(1).max(1000)).max(40).default([]),
  notes: str(4000),
  tags: z.array(z.string().trim().min(1).max(40)).max(12).default([]),
});

const MAX_PHOTO_BYTES = 3_000_000;

// Photos arrive as data URLs, already shrunk in the browser.
export function decodePhoto(dataUrl: unknown): { mime: string; data: Buffer } | undefined {
  if (typeof dataUrl !== "string") return undefined;
  const m = /^data:(image\/(?:jpeg|png|webp|gif));base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
  if (!m) throw new Error("That photo format isn't supported");
  const data = Buffer.from(m[2], "base64");
  if (data.length > MAX_PHOTO_BYTES) throw new Error("Photo is too big");
  return { mime: m[1], data };
}
