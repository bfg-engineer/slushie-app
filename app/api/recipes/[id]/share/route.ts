import { NextResponse } from "next/server";
import { ownerOnly, fail } from "@/lib/api";
import { setShared } from "@/lib/db";

type Ctx = { params: Promise<{ id: string }> };

export const POST = ownerOnly(async (req: Request, ctx: Ctx) => {
  const id = Number((await ctx.params).id);
  const { shared, newLink } = await req.json();
  const row = await setShared(id, !!shared, !!newLink);
  if (!row) return fail("Recipe not found", 404);
  return NextResponse.json(row);
});
