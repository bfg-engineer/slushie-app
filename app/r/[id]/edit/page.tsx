import { notFound, redirect } from "next/navigation";
import { isOwner } from "@/lib/auth";
import { getRecipe } from "@/lib/db";
import { TopBar } from "@/components/TopBar";
import { RecipeForm } from "@/components/RecipeForm";

export default async function EditRecipe({ params }: { params: Promise<{ id: string }> }) {
  if (!(await isOwner())) redirect("/login");
  const r = await getRecipe(Number((await params).id));
  if (!r) notFound();
  return (
    <>
      <TopBar owner />
      <main className="wrap">
        <h1 style={{ margin: "26px 0 22px" }}>Remix it</h1>
        <RecipeForm
          mode="edit"
          id={r.id}
          initial={{ name: r.name, tagline: r.tagline, color: r.color, servings: r.servings, ingredients: r.ingredients, steps: r.steps, notes: r.notes, tags: r.tags }}
          existingPhotoUrl={r.has_photo ? `/api/photo/${r.id}` : null}
        />
      </main>
    </>
  );
}
