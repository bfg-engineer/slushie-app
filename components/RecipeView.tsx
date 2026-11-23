import type { Recipe } from "@/lib/db";
import { qty } from "@/lib/format";
import { Cup } from "./Cup";
import { CopyIngredients } from "./CopyIngredients";

export function RecipeView({ r, photoUrl, children }: { r: Recipe; photoUrl: string | null; children?: React.ReactNode }) {
  return (
    <>
      <section className="recipe-head">
        <Cup color={r.color} size={130} label={`${r.name} slushie`} />
        <div>
          {r.servings && <span className="sticker">Makes {r.servings}</span>}
          <h1 style={{ marginTop: 12 }}>{r.name}</h1>
          {r.tagline && <p className="tagline">{r.tagline}</p>}
          {r.tags.length > 0 && (
            <div className="tags">{r.tags.map((t) => <span key={t} className="tag">#{t}</span>)}</div>
          )}
        </div>
      </section>

      <div className="recipe-body">
        <div>
          {photoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="photo-big" src={photoUrl} alt={r.name} />
          )}
          <div className="ticket">
            <h2>What goes in</h2>
            {r.ingredients.length === 0 ? (
              <p>No ingredients listed yet.</p>
            ) : (
              <ul>
                {r.ingredients.map((i, n) => (
                  <li key={n}>
                    <input type="checkbox" className="check" aria-label={`Got ${i.name}`} />
                    <label>
                      {qty(i) && <span className="qty">{qty(i)} </span>}
                      {i.name}
                      {i.note && <span className="ing-note">{i.note}</span>}
                    </label>
                  </li>
                ))}
              </ul>
            )}
            {r.ingredients.length > 0 && <CopyIngredients name={r.name} ingredients={r.ingredients} />}
          </div>
        </div>

        <div>
          <div className="panel">
            <h2>How to slush it</h2>
            {r.steps.length === 0 ? <p>No steps yet.</p> : (
              <ol className="steps">{r.steps.map((s, n) => <li key={n}><span>{s}</span></li>)}</ol>
            )}
            {r.notes && (
              <>
                <h3 style={{ marginTop: 20 }}>Notes</h3>
                <p style={{ whiteSpace: "pre-wrap", margin: 0 }}>{r.notes}</p>
              </>
            )}
          </div>
          {children}
        </div>
      </div>
    </>
  );
}
