import { redirect } from "next/navigation";
import { isOwner } from "@/lib/auth";
import { TopBar } from "@/components/TopBar";
import { RecipeForm } from "@/components/RecipeForm";

export default async function NewRecipe() {
  if (!(await isOwner())) redirect("/login");
  return (
    <>
      <TopBar owner />
      <main className="wrap">
        <h1 style={{ margin: "26px 0 22px" }}>Pour a new one</h1>
        <RecipeForm mode="new" />
      </main>
    </>
  );
}
