"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function GatePage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res  = await fetch("/api/auth/gate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, remember }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Nieprawidłowe hasło."); return; }
      router.push("/landing");
    } catch {
      setError("Błąd połączenia.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center",
      background:"var(--obsidian)", padding:"24px",
    }}>
      <div style={{
        width:"100%", maxWidth:"400px",
        background:"#fff", border:"1px solid rgba(154,107,32,.12)",
        padding:"48px 40px",
      }}>
        {/* Logo */}
        <div style={{ textAlign:"center", marginBottom:"36px" }}>
          <p style={{ fontFamily:"var(--font-cinzel)", fontSize:"20px", fontWeight:500, letterSpacing:".2em", color:"var(--gold)" }}>CLEOMED</p>
          <p style={{ fontFamily:"var(--font-jost)", fontSize:"11px", letterSpacing:".4em", textTransform:"uppercase", color:"var(--text-muted)", marginTop:"5px" }}>Panel Produktów</p>
        </div>

        <p style={{ fontFamily:"var(--font-jost)", fontSize:"13px", fontWeight:400, color:"var(--text-muted)", textAlign:"center", marginBottom:"32px", lineHeight:1.6 }}>
          Wprowadź hasło aby uzyskać dostęp
        </p>

        <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
          <div>
            <label style={{
              display:"block", marginBottom:"8px",
              fontFamily:"var(--font-cinzel)", fontSize:"11px",
              letterSpacing:".3em", textTransform:"uppercase", color:"var(--text-muted)",
            }}>Hasło dostępu</label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="input"
              style={{ height:"52px" }}
              autoFocus
            />
          </div>

          <label style={{ display:"flex", alignItems:"center", gap:"10px", cursor:"pointer" }}>
            <input
              type="checkbox"
              checked={remember}
              onChange={e => setRemember(e.target.checked)}
              style={{ accentColor:"var(--gold)", width:"16px", height:"16px", flexShrink:0 }}
            />
            <span style={{ fontFamily:"var(--font-jost)", fontSize:"14px", color:"var(--text-muted)" }}>
              Zapamiętaj logowanie (24h)
            </span>
          </label>

          {error && (
            <div style={{
              padding:"10px 14px", borderLeft:"2px solid rgba(201,149,106,.6)",
              background:"rgba(201,149,106,.06)",
              fontFamily:"var(--font-jost)", fontSize:"14px", color:"var(--gold-light)",
            }}>{error}</div>
          )}

          <button type="submit" disabled={loading} className="btn-gold" style={{ height:"52px", marginTop:"4px" }}>
            {loading ? "Sprawdzam..." : "Zaloguj się"}
          </button>
        </form>

        <p style={{
          marginTop:"24px", textAlign:"center",
          fontFamily:"var(--font-jost)", fontSize:"13px", color:"rgba(92,68,32,.4)",
        }}>
          🔒 Twoje dane są bezpieczne i przechowywane lokalnie
        </p>
      </div>
    </div>
  );
}
