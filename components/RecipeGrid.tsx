"use client";
import Link from "next/link";
import { useState } from "react";
import { Cup } from "./Cup";

export type CardData = { id: number; name: string; tagline: string; color: string; tags: string[]; is_shared: boolean; ingredients: string[] };

export function RecipeGrid({ recipes }: { recipes: CardData[] }) {
  const [q, setQ] = useState("");
  const term = q.trim().toLowerCase();
  const shown = term
    ? recipes.filter((r) => [r.name, r.tagline, ...r.tags, ...r.ingredients].join(" ").toLowerCase().includes(term))
    : recipes;

  return (
    <>
      <div className="toolbar">
        <input
          className="search"
          type="search"
          placeholder="Search flavours, ingredients, tags…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <Link href="/new" className="btn cherry">+ Pour a new one</Link>
      </div>
      {shown.length === 0 ? (
        <div className="empty panel">
          <h2>Nothing slushing here</h2>
          <p>No recipes match “{q}”.</p>
        </div>
      ) : (
        <div className="grid">
          {shown.map((r) => (
            <Link key={r.id} href={`/r/${r.id}`} className="card">
              {r.is_shared && <span className="sticker shared">Shared</span>}
              <Cup color={r.color} size={92} label="" />
              <h3>{r.name}</h3>
              {r.tagline && <p>{r.tagline}</p>}
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
