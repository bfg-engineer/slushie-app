"use client";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import type { Ingredient, RecipeInput } from "@/lib/db";
import { shrinkImage } from "@/lib/image";
import { Cup } from "./Cup";

const COLORS = ["#ff3b6b", "#2f6bff", "#b6f03c", "#ffb020", "#8b5cf6", "#ff7a1a", "#19c2a0", "#ff5fd2", "#7b3f00", "#e8e8e8"];
const MACHINE_LINES = ["Crushing the ice…", "Reading the labels…", "Measuring the syrup…", "Spinning the slush…", "Checking the brain-freeze factor…"];

const blankIng = (): Ingredient => ({ name: "", amount: "", unit: "", note: "" });

type Props = {
  mode: "new" | "edit";
  id?: number;
  initial?: RecipeInput;
  existingPhotoUrl?: string | null;
};

export function RecipeForm({ mode, id, initial, existingPhotoUrl }: Props) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [photos, setPhotos] = useState<string[]>([]);
  const [keepExisting, setKeepExisting] = useState(!!existingPhotoUrl);
  const [hint, setHint] = useState("");
  const [over, setOver] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [machineLine, setMachineLine] = useState(0);
  const [scanMsg, setScanMsg] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState(initial?.name ?? "");
  const [tagline, setTagline] = useState(initial?.tagline ?? "");
  const [color, setColor] = useState(initial?.color ?? "#ff3b6b");
  const [servings, setServings] = useState(initial?.servings ?? "");
  const [ings, setIngs] = useState<Ingredient[]>(initial?.ingredients?.length ? initial.ingredients : [blankIng()]);
  const [steps, setSteps] = useState<string[]>(initial?.steps?.length ? initial.steps : [""]);
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [tags, setTags] = useState((initial?.tags ?? []).join(", "));

  async function addFiles(files: FileList | File[]) {
    setError("");
    const list = Array.from(files).filter((f) => f.type.startsWith("image/") || /\.(heic|heif)$/i.test(f.name));
    if (!list.length) return setError("Those don't look like photos.");
    try {
      const shrunk = await Promise.all(list.map((f) => shrinkImage(f)));
      setPhotos((p) => [...p, ...shrunk].slice(0, 4));
    } catch {
      setError("Couldn't open that photo. Try a JPG or PNG (iPhone: share it as 'Most Compatible').");
    }
  }

  async function scan() {
    if (!photos.length) return;
    setScanning(true);
    setScanMsg("");
    setError("");
    setMachineLine(0);
    const timer = setInterval(() => setMachineLine((n) => (n + 1) % MACHINE_LINES.length), 1800);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images: photos, hint }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Scan failed");
      if (!data.found_recipe) {
        setScanMsg("Claude couldn't spot a slushie in there. Try another photo or add a note.");
        return;
      }
      setName(data.name || name);
      setTagline(data.tagline || tagline);
      if (/^#[0-9a-fA-F]{6}$/.test(data.color)) setColor(data.color);
      setServings(data.servings || servings);
      if (data.ingredients?.length) setIngs(data.ingredients);
      if (data.steps?.length) setSteps(data.steps);
      setNotes(data.notes || notes);
      if (data.tags?.length) setTags(data.tags.join(", "));
      setScanMsg("Done! Check everything below and fix anything Claude got wrong, then freeze it.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Scan failed");
    } finally {
      clearInterval(timer);
      setScanning(false);
    }
  }

  async function save() {
    setSaving(true);
    setError("");
    const recipe: RecipeInput = {
      name,
      tagline,
      color,
      servings,
      ingredients: ings.filter((i) => i.name.trim()),
      steps: steps.filter((s) => s.trim()),
      notes,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
    };
    // photo: new first photo replaces, null removes, undefined keeps what's there
    const photo = photos[0] ?? (mode === "edit" && !keepExisting ? null : undefined);
    try {
      const res = await fetch(mode === "new" ? "/api/recipes" : `/api/recipes/${id}`, {
        method: mode === "new" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipe, photo }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed");
      router.push(`/r/${data.id}`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
      setSaving(false);
    }
  }

  const setIng = (i: number, patch: Partial<Ingredient>) => setIngs((all) => all.map((x, j) => (j === i ? { ...x, ...patch } : x)));

  return (
    <div className="form-grid">
      {/* ---- left: photos + scanner ---- */}
      <section className="panel">
        <h2>1. Snap it</h2>
        <div
          className={`dropzone ${over ? "over" : ""}`}
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setOver(true); }}
          onDragLeave={() => setOver(false)}
          onDrop={(e) => { e.preventDefault(); setOver(false); addFiles(e.dataTransfer.files); }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && fileRef.current?.click()}
        >
          <Cup color={color} size={54} label="" />
          <strong>Drop photos here</strong>
          <small>or tap to take / pick up to 4. Recipe cards, bottle labels, a finished cup, a screenshot…</small>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(e) => { if (e.target.files) addFiles(e.target.files); e.target.value = ""; }}
          />
        </div>

        {(photos.length > 0 || (keepExisting && existingPhotoUrl)) && (
          <div className="thumbs">
            {keepExisting && existingPhotoUrl && photos.length === 0 && (
              <figure className="cover">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={existingPhotoUrl} alt="Current photo" />
                <button className="x" aria-label="Remove photo" onClick={() => setKeepExisting(false)}>×</button>
                <figcaption>current cover</figcaption>
              </figure>
            )}
            {photos.map((p, i) => (
              <figure key={i} className={i === 0 ? "cover" : ""}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p} alt={`Photo ${i + 1}`} />
                <button className="x" aria-label="Remove photo" onClick={() => setPhotos((all) => all.filter((_, j) => j !== i))}>×</button>
                {i === 0 && <figcaption>cover photo</figcaption>}
              </figure>
            ))}
          </div>
        )}

        <label className="field" style={{ marginTop: 16 }}>
          <span>Note for Claude (optional)</span>
          <input type="text" placeholder="e.g. make it for the Ninja Slushi, half sugar" value={hint} onChange={(e) => setHint(e.target.value)} />
        </label>

        <button className="btn raz big" style={{ width: "100%" }} onClick={scan} disabled={!photos.length || scanning}>
          {scanning ? "Slushing…" : "Fill it in from the photos"}
        </button>

        {scanning && (
          <div className="machine" aria-live="polite">
            <div className="tank"><div className="slush" /></div>
            <div>
              <strong>{MACHINE_LINES[machineLine]}</strong>
              <small>Claude is reading your photos. Usually 10 to 30 seconds.</small>
            </div>
          </div>
        )}
        {scanMsg && <div className="okay">{scanMsg}</div>}
        <p style={{ fontSize: "0.9rem", color: "var(--ink-soft)", marginBottom: 0 }}>
          No photo? Skip this and type the recipe on the right.
        </p>
      </section>

      {/* ---- right: the recipe ---- */}
      <section className="panel">
        <h2>2. Tweak it</h2>
        <label className="field"><span>Name</span>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Blue Lightning" />
        </label>
        <label className="field"><span>Tagline</span>
          <input type="text" value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="Tastes like a school holiday" />
        </label>

        <div className="field">
          <span style={{ display: "block", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6, color: "var(--ink-soft)", fontWeight: 600 }}>Slush colour</span>
          <div className="swatches">
            {COLORS.map((c) => (
              <button key={c} type="button" className={`swatch ${c === color ? "on" : ""}`} style={{ background: c }} aria-label={c} onClick={() => setColor(c)} />
            ))}
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)} aria-label="Custom colour" />
          </div>
        </div>

        <label className="field"><span>Makes</span>
          <input type="text" value={servings} onChange={(e) => setServings(e.target.value)} placeholder="4 cups" />
        </label>

        <h3 style={{ marginTop: 22 }}>Ingredients</h3>
        <div className="ing-row" style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ink-soft)", marginBottom: 4 }}>
          <span>Amount</span><span>Unit</span><span>Ingredient</span><span />
        </div>
        {ings.map((ing, i) => (
          <div className="ing-row" key={i}>
            <input type="text" value={ing.amount} onChange={(e) => setIng(i, { amount: e.target.value })} placeholder="250" aria-label="Amount" />
            <input type="text" value={ing.unit} onChange={(e) => setIng(i, { unit: e.target.value })} placeholder="ml" aria-label="Unit" />
            <input type="text" value={ing.name} onChange={(e) => setIng(i, { name: e.target.value })} placeholder="Blue raspberry syrup" aria-label="Ingredient" />
            <button type="button" className="iconbtn" aria-label="Remove ingredient" onClick={() => setIngs((all) => (all.length > 1 ? all.filter((_, j) => j !== i) : [blankIng()]))}>✕</button>
            <input className="note" type="text" value={ing.note} onChange={(e) => setIng(i, { note: e.target.value })} placeholder="note (brand, chilled, optional…)" aria-label="Note" />
          </div>
        ))}
        <button type="button" className="btn plain small" onClick={() => setIngs((all) => [...all, blankIng()])}>+ Ingredient</button>

        <h3 style={{ marginTop: 22 }}>Steps</h3>
        {steps.map((s, i) => (
          <div className="step-row" key={i}>
            <div className="step-num">{i + 1}</div>
            <textarea style={{ minHeight: 52 }} value={s} onChange={(e) => setSteps((all) => all.map((x, j) => (j === i ? e.target.value : x)))} placeholder="Pour everything into the machine…" aria-label={`Step ${i + 1}`} />
            <button type="button" className="iconbtn" aria-label="Remove step" onClick={() => setSteps((all) => (all.length > 1 ? all.filter((_, j) => j !== i) : [""]))}>✕</button>
          </div>
        ))}
        <button type="button" className="btn plain small" onClick={() => setSteps((all) => [...all, ""])}>+ Step</button>

        <label className="field" style={{ marginTop: 22 }}><span>Notes</span>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Tips, swaps, which machine setting…" />
        </label>
        <label className="field"><span>Tags (comma separated)</span>
          <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="fruity, kids, cocktail" />
        </label>

        {error && <div className="error">{error}</div>}
        <div className="actions" style={{ marginTop: 10 }}>
          <button className="btn cherry big" onClick={save} disabled={saving || !name.trim()}>
            {saving ? "Freezing…" : mode === "new" ? "Freeze it! (save)" : "Save changes"}
          </button>
          <button className="btn plain" onClick={() => router.back()} disabled={saving}>Cancel</button>
        </div>
      </section>
    </div>
  );
}
