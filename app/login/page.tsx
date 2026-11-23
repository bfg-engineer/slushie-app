"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Cup } from "@/components/Cup";

export default function Login() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [shake, setShake] = useState(0);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
    setBusy(false);
    if (res.ok) {
      router.push("/");
      router.refresh();
    } else {
      setError((await res.json().catch(() => ({}))).error ?? "Login failed");
      setShake((n) => n + 1);
    }
  }

  return (
    <main className="login">
      <form className={`panel ${shake ? "shake" : ""}`} key={shake} onSubmit={submit}>
        <Cup color="#ff3b6b" size={80} label="" />
        <h1>SLUSH CLUB</h1>
        <p style={{ color: "var(--ink-soft)", marginTop: 0 }}>Members only. Say the secret word.</p>
        <label className="field" style={{ textAlign: "left" }}>
          <span>Password</span>
          <input type="password" autoFocus value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        {error && <div className="error">{error}</div>}
        <button className="btn cherry big" style={{ width: "100%" }} disabled={busy || !password}>
          {busy ? "Checking…" : "Let me in"}
        </button>
      </form>
    </main>
  );
}
