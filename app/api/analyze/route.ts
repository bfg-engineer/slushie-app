import { NextResponse } from "next/server";
import { z } from "zod";
import { ownerOnly, fail } from "@/lib/api";
import { extractRecipe, type ImageInput } from "@/lib/ai";

export const maxDuration = 60;

const Body = z.object({ images: z.array(z.string()).min(1).max(4), hint: z.string().max(500).default("") });

export const POST = ownerOnly(async (req: Request) => {
  if (!process.env.ANTHROPIC_API_KEY) return fail("ANTHROPIC_API_KEY isn't set on the server yet.", 500);
  const body = Body.parse(await req.json());
  const images: ImageInput[] = body.images.map((url) => {
    const m = /^data:(image\/(?:jpeg|png|webp|gif));base64,(.+)$/.exec(url);
    if (!m) throw new z.ZodError([{ code: "custom", message: "Unsupported image", path: ["images"], input: "" }]);
    return { mime: m[1] as ImageInput["mime"], base64: m[2] };
  });
  const result = await extractRecipe(images, body.hint);
  return NextResponse.json(result);
});
