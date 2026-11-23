import { isOwner } from "@/lib/auth";
import { getPhoto } from "@/lib/db";

// Photos are visible to the owner, or to anyone holding the recipe's share link.
export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const id = Number((await ctx.params).id);
  if (!Number.isInteger(id)) return new Response("Not found", { status: 404 });
  const photo = await getPhoto(id);
  if (!photo) return new Response("Not found", { status: 404 });
  const token = new URL(req.url).searchParams.get("t");
  const allowed = (await isOwner()) || (photo.is_shared && token === photo.share_token);
  if (!allowed) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(photo.data), {
    headers: { "Content-Type": photo.mime, "Cache-Control": "private, no-cache" },
  });
}
