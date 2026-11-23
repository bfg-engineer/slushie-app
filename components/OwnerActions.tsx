"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function OwnerActions({ id, name, shared: initialShared, token: initialToken }: { id: number; name: string; shared: boolean; token: string }) {
  const router = useRouter();
  const [shared, setShared] = useState(initialShared);
  const [token, setToken] = useState(initialToken);
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState("");

  const link = typeof window !== "undefined" ? `${window.location.origin}/s/${token}` : `/s/${token}`;

  async function update(next: boolean, newLink = false) {
    setBusy(true);
    setError("");
    const res = await fetch(`/api/recipes/${id}/share`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shared: next, newLink }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) return setError(data.error ?? "Couldn't update sharing");
    setShared(data.is_shared);
    setToken(data.share_token);
    router.refresh();
  }

  async function share() {
    const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> };
    if (nav.share) {
      try { await nav.share({ title: name, text: `Try my ${name} slushie!`, url: link }); return; } catch { /* fall through to copy */ }
    }
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  async function remove() {
    setBusy(true);
    const res = await fetch(`/api/recipes/${id}`, { method: "DELETE" });
    if (res.ok) { router.push("/"); router.refresh(); }
    else { setBusy(false); setError("Couldn't delete it"); }
  }

  return (
    <>
      <div className="panel" style={{ marginTop: 26, background: shared ? "#eaffc4" : undefined }}>
        <h2>Pass the cup</h2>
        <label className="switch">
          <input type="checkbox" checked={shared} disabled={busy} onChange={(e) => update(e.target.checked)} />
          <span className="track" />
          {shared ? "Friends with the link can see this" : "Only you can see this"}
        </label>
        {shared && (
          <>
            <div className="share-link">
              <input type="text" readOnly value={link} onFocus={(e) => e.target.select()} aria-label="Share link" />
              <button className="btn raz small" onClick={share}>{copied ? "Copied!" : "Share"}</button>
            </div>
            <button className="btn plain small" style={{ marginTop: 10 }} disabled={busy} onClick={() => update(true, true)}>
              Make a new link (old one stops working)
            </button>
          </>
        )}
        {error && <div className="error">{error}</div>}
      </div>

      <div className="actions" style={{ marginTop: 22 }}>
        <Link href={`/r/${id}/edit`} className="btn mango">Remix (edit)</Link>
        {confirmDelete ? (
          <>
            <button className="btn cherry" onClick={remove} disabled={busy}>Yes, melt it forever</button>
            <button className="btn plain" onClick={() => setConfirmDelete(false)}>Keep it</button>
          </>
        ) : (
          <button className="btn plain" onClick={() => setConfirmDelete(true)}>Melt (delete)</button>
        )}
      </div>
    </>
  );
}
