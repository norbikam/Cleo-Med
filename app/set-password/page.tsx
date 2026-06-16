"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function SetPasswordForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const phone        = searchParams.get("phone") ?? "";

  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirm) { setError("Hasła nie są identyczne."); return; }
    if (password.length < 8)  { setError("Hasło musi mieć co najmniej 8 znaków."); return; }
    setLoading(true);
    try {
      const res  = await fetch("/api/auth/set-password", {
        method:"POST", headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ phone, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Wystąpił błąd."); return; }
      router.push("/catalog");
    } catch { setError("Błąd połączenia. Spróbuj ponownie."); }
    finally   { setLoading(false); }
  }

  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"var(--obsidian)", padding:"40px 24px" }}>
      <div className="animate-scaleIn" style={{ width:"100%", maxWidth:"400px" }}>

        <div style={{ textAlign:"center", marginBottom:"40px" }}>
          <p style={{ fontFamily:"var(--font-cinzel)", fontSize:"18px", fontWeight:500, letterSpacing:".2em", color:"var(--gold)", marginBottom:"6px" }}>CLEOMED</p>
          <p style={{ fontFamily:"var(--font-jost)", fontSize:"11px", letterSpacing:".2em", textTransform:"uppercase", color:"var(--text-muted)" }}>Platforma B2B</p>
        </div>

        <h2 style={{ fontFamily:"var(--font-cormorant)", fontSize:"36px", fontWeight:400, color:"var(--pearl)", marginBottom:"8px" }}>
          Ustaw hasło
        </h2>
        {phone && (
          <p style={{ fontFamily:"var(--font-jost)", fontSize:"13px", fontWeight:400, color:"var(--text-muted)", marginBottom:"32px" }}>
            Numer: <strong style={{ color:"var(--pearl)" }}>{phone}</strong>
          </p>
        )}

        <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:"18px" }}>
          <div>
            <label style={{ display:"block", marginBottom:"8px", fontFamily:"var(--font-cinzel)", fontSize:"9px", letterSpacing:".3em", textTransform:"uppercase", color:"var(--text-muted)" }}>
              Nowe hasło
            </label>
            <input
              type="password" required minLength={8}
              value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Minimum 8 znaków"
              className="input" style={{ height:"52px" }}
            />
          </div>
          <div>
            <label style={{ display:"block", marginBottom:"8px", fontFamily:"var(--font-cinzel)", fontSize:"9px", letterSpacing:".3em", textTransform:"uppercase", color:"var(--text-muted)" }}>
              Powtórz hasło
            </label>
            <input
              type="password" required
              value={confirm} onChange={e => setConfirm(e.target.value)}
              placeholder="Powtórz hasło"
              className="input" style={{ height:"52px" }}
            />
          </div>

          {error && (
            <div style={{
              padding:"12px 16px",
              fontFamily:"var(--font-jost)", fontSize:"13px", fontWeight:400,
              borderLeft:"2px solid rgba(201,149,106,.6)",
              background:"rgba(201,149,106,.06)", color:"var(--gold-light)",
            }}>{error}</div>
          )}

          <button type="submit" disabled={loading} className="btn-gold" style={{ height:"52px", marginTop:"4px" }}>
            {loading ? "Zapisywanie..." : "Ustaw hasło i wejdź do sklepu →"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function SetPasswordPage() {
  return (
    <Suspense>
      <SetPasswordForm />
    </Suspense>
  );
}
