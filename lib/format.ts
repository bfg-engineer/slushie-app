import type { Ingredient } from "./db";

export function qty(i: Ingredient) {
  return [i.amount, i.unit].filter(Boolean).join(" ");
}

export function ingredientsAsText(name: string, ings: Ingredient[]) {
  return [name, ...ings.map((i) => `• ${[qty(i), i.name].filter(Boolean).join(" ")}${i.note ? ` (${i.note})` : ""}`)].join("\n");
}
