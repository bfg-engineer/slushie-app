import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { isOwner } from "@/lib/auth";
import { getRecipe } from "@/lib/db";
import { TopBar } from "@/components/TopBar";
import { RecipeView } from "@/components/RecipeView";
import { OwnerActions } from "@/components/OwnerActions";

export const dynamic = "force-dynamic";

export default async function RecipePage({ params }: { params: Promise<{ id: string }> }) {
  if (!(await isOwner())) redirect("/login");
  const r = await getRecipe(Number((await params).id));
  if (!r) notFound();
  return (
    <>
      <TopBar owner />
      <main className="wrap">
        <p style={{ margin: "20px 0 0" }}><Link href="/">← All recipes</Link></p>
        <RecipeView r={r} photoUrl={r.has_photo ? `/api/photo/${r.id}?v=${Date.now()}` : null}>
          <OwnerActions id={r.id} name={r.name} shared={r.is_shared} token={r.share_token} />
        </RecipeView>
      </main>
    </>
  );
}
