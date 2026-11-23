import { NextResponse } from "next/server";
import { ownerOnly, fail } from "@/lib/api";
import { deleteRecipe, getRecipe, updateRecipe } from "@/lib/db";
import { decodePhoto, RecipeInputSchema } from "@/lib/validate";

type Ctx = { params: Promise<{ id: string }> };

export const PUT = ownerOnly(async (req: Request, ctx: Ctx) => {
  const id = Number((await ctx.params).id);
  if (!(await getRecipe(id))) return fail("Recipe not found", 404);
  const body = await req.json();
  const input = RecipeInputSchema.parse(body.recipe);
  // photo: undefined = keep, null = remove, string = replace
  const photo = body.photo === null ? null : decodePhoto(body.photo);
  await updateRecipe(id, input, photo);
  return NextResponse.json({ id });
});

export const DELETE = ownerOnly(async (_req: Request, ctx: Ctx) => {
  await deleteRecipe(Number((await ctx.params).id));
  return NextResponse.json({ ok: true });
});
