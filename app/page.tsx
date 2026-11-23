import Link from "next/link";
import { redirect } from "next/navigation";
import { isOwner } from "@/lib/auth";
import { listRecipes } from "@/lib/db";
import { TopBar } from "@/components/TopBar";
import { Cup } from "@/components/Cup";
import { RecipeGrid } from "@/components/RecipeGrid";

export const dynamic = "force-dynamic";

export default async function Home() {
  if (!(await isOwner())) redirect("/login");
  const recipes = await listRecipes();

  return (
    <>
      <TopBar owner />
      <main className="wrap">
        <section className="hero">
          <div>
            <span className="sticker">{recipes.length} {recipes.length === 1 ? "recipe" : "recipes"} in the freezer</span>
            <h1 style={{ marginTop: 14 }}>Brain freeze,<br />on purpose.</h1>
            <p>Snap a recipe card, a row of bottles or a finished cup. Claude reads it and writes the recipe for you.</p>
            <Link href="/new" className="btn cherry big">Scan a photo</Link>
          </div>
          <div className="cups" aria-hidden="true">
            <Cup color="#2f6bff" size={88} label="" />
            <Cup color="#ff3b6b" size={110} label="" />
            <Cup color="#b6f03c" size={88} label="" />
          </div>
        </section>

        {recipes.length === 0 ? (
          <div className="empty panel" style={{ marginBottom: 60 }}>
            <h2>The freezer is empty</h2>
            <p>Your first slushie is one photo away.</p>
            <Link href="/new" className="btn mango">Pour the first one</Link>
          </div>
        ) : (
          <RecipeGrid
            recipes={recipes.map((r) => ({
              id: r.id,
              name: r.name,
              tagline: r.tagline,
              color: r.color,
              tags: r.tags,
              is_shared: r.is_shared,
              ingredients: r.ingredients.map((i) => i.name),
            }))}
          />
        )}
      </main>
    </>
  );
}
