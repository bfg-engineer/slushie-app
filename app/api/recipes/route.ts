import { NextResponse } from "next/server";
import { ownerOnly } from "@/lib/api";
import { createRecipe } from "@/lib/db";
import { decodePhoto, RecipeInputSchema } from "@/lib/validate";

export const POST = ownerOnly(async (req: Request) => {
  const body = await req.json();
  const input = RecipeInputSchema.parse(body.recipe);
  const id = await createRecipe(input, decodePhoto(body.photo));
  return NextResponse.json({ id });
});
