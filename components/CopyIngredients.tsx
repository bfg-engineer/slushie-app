"use client";
import { useState } from "react";
import type { Ingredient } from "@/lib/db";
import { ingredientsAsText } from "@/lib/format";

export function CopyIngredients({ name, ingredients }: { name: string; ingredients: Ingredient[] }) {
  const [done, setDone] = useState(false);
  return (
    <button
      className="btn plain small"
      style={{ marginTop: 14 }}
      onClick={async () => {
        await navigator.clipboard.writeText(ingredientsAsText(name, ingredients));
        setDone(true);
        setTimeout(() => setDone(false), 1800);
      }}
    >
      {done ? "Copied!" : "Copy shopping list"}
    </button>
  );
}
