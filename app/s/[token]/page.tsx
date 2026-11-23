import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSharedRecipe } from "@/lib/db";
import { TopBar } from "@/components/TopBar";
import { RecipeView } from "@/components/RecipeView";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ token: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const r = await getSharedRecipe((await params).token);
  return r ? { title: `${r.name} · Slush Club`, description: r.tagline || "A slushie recipe from Slush Club" } : { title: "Slush Club" };
}

// Public page: anyone with the link can see the recipe while sharing is switched on.
export default async function SharedRecipe({ params }: Props) {
  const { token } = await params;
  const r = await getSharedRecipe(token);
  if (!r) notFound();
  return (
    <>
      <TopBar owner={false} />
      <div className="friend-banner">A friend passed you this slushie. Enjoy the brain freeze!</div>
      <main className="wrap">
        <RecipeView r={r} photoUrl={r.has_photo ? `/api/photo/${r.id}?t=${encodeURIComponent(r.share_token)}` : null} />
      </main>
      <footer className="footer">Made with Slush Club</footer>
    </>
  );
}
