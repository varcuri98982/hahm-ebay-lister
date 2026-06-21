"use client";

import { FormEvent, ReactNode, useEffect, useState } from "react";

type AccessState = "checking" | "open" | "locked";

export function AccessGate({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AccessState>("checking");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/access", { cache: "no-store" })
      .then((r) => r.json())
      .then((data: { configured?: boolean; verified?: boolean }) => {
        if (cancelled) return;
        setState(!data.configured || data.verified ? "open" : "locked");
      })
      .catch(() => {
        if (!cancelled) setState("locked");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error || "That access code was not accepted.");
      }
      setCode("");
      setState("open");
      window.dispatchEvent(new Event("access-granted"));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  if (state === "checking") {
    return (
      <main className="wrap">
        <section className="panel access-panel">
          <span className="spinner" aria-hidden="true" />
          <span>Checking access...</span>
        </section>
      </main>
    );
  }

  if (state === "open") return <>{children}</>;

  return (
    <main className="wrap">
      <section className="panel access-panel" aria-labelledby="access-heading">
        <h1 id="access-heading">Access code</h1>
        <form onSubmit={submit} className="access-form">
          <label htmlFor="access-code">Enter the app access code</label>
          <input
            id="access-code"
            type="password"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            autoComplete="current-password"
            autoFocus
          />
          <button type="submit" className="btn btn-primary" disabled={busy || !code.trim()}>
            {busy ? "Checking..." : "Unlock app"}
          </button>
        </form>
        {error && (
          <p className="note note-error" role="alert">
            {error}
          </p>
        )}
      </section>
    </main>
  );
}
