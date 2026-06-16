"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { usePageTexts, pt } from "@/lib/hooks/use-page-texts";

type Tab = "login" | "register";

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label style={{
      display:"block", marginBottom:"8px",
      fontFamily:"var(--font-cinzel)", fontSize:"9px",
      letterSpacing:".3em", textTransform:"uppercase",
      color:"var(--text-muted)",
    }}>{children}</label>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const texts  = usePageTexts();
  const [tab,      setTab]      = useState<Tab>("login");
  const [phone,    setPhone]    = useState("");
  const [password, setPassword] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [error,    setError]    = useState("");
  const [info,     setInfo]     = useState("");
  const [loading,  setLoading]  = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setInfo(""); setLoading(true);
    try {
      const res  = await fetch("/api/auth/login", {
        method:"POST", headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ phone, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Wystąpił błąd."); return; }
      if (data.needsPassword) { router.push(`/set-password?phone=${encodeURIComponent(phone)}`); return; }
      router.push(data.role === "admin" ? "/admin" : "/catalog");
    } catch { setError("Błąd połączenia."); }
    finally   { setLoading(false); }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setInfo(""); setLoading(true);
    try {
      const res  = await fetch("/api/auth/check-phone", {
        method:"POST", headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ phone: regPhone }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Wystąpił błąd."); return; }
      if (!data.exists) {
        setError("__not_in_system__");
        return;
      }
      if (data.hasPassword) {
        setInfo("Konto juz istnieje. Zaloguj sie na zakladce Zaloguj sie.");
        return;
      }
      router.push(`/set-password?phone=${encodeURIComponent(regPhone)}`);
    } catch { setError("Błąd połączenia."); }
    finally   { setLoading(false); }
  }

  const tabStyle = (active: boolean) => ({
    flex: 1,
    padding: "14px 0",
    fontFamily: "var(--font-cinzel)",
    fontSize: "9px",
    fontWeight: 500,
    letterSpacing: ".3em",
    textTransform: "uppercase" as const,
    color: active ? "var(--pearl)" : "var(--text-muted)",
    background: "none",
    border: "none",
    borderBottom: active ? "2px solid var(--gold)" : "2px solid transparent",
    cursor: "pointer",
    transition: "color .2s, border-color .2s",
  });

  return (
    <div style={{
      minHeight:"100vh", display:"flex",
      background:"var(--obsidian)", position:"relative", overflow:"hidden",
    }}>
      {/* bg glow */}
      <div style={{
        position:"absolute", inset:0, pointerEvents:"none",
        background:"radial-gradient(ellipse at 30% 60%, rgba(201,149,106,.06) 0%, transparent 50%), radial-gradient(ellipse at 70% 20%, rgba(201,149,106,.04) 0%, transparent 50%)",
      }}/>

      {/* LEFT PANEL — desktop only */}
      <div className="hidden lg:flex" style={{
        width:"520px", flexShrink:0,
        flexDirection:"column", justifyContent:"space-between",
        padding:"60px",
        borderRight:"1px solid rgba(201,149,106,.08)",
      }}>
        <div>
          <p style={{ fontFamily:"var(--font-cinzel)", fontSize:"16px", fontWeight:500, letterSpacing:".2em", color:"var(--gold)", marginBottom:"4px" }}>CLEOMED</p>
          <p style={{ fontFamily:"var(--font-jost)", fontSize:"11px", letterSpacing:".3em", textTransform:"uppercase", color:"var(--text-muted)" }}>{pt(texts, "login_platform_label", "Platforma B2B")}</p>
        </div>

        <div className="animate-fadeUp">
          <p style={{ fontFamily:"var(--font-cinzel)", fontSize:"10px", letterSpacing:".5em", textTransform:"uppercase", color:"var(--gold)", marginBottom:"28px" }}>{pt(texts, "login_eyebrow", "Medycyna estetyczna")}</p>
          <h1 style={{ fontFamily:"var(--font-cormorant)", fontSize:"clamp(42px, 4vw, 56px)", fontWeight:400, lineHeight:1.0, color:"var(--pearl)", marginBottom:"24px" }}>
            {pt(texts, "login_title_1", "Platforma")}<br/>{pt(texts, "login_title_2", "zamówień dla")}<br/>
            <em style={{ fontStyle:"italic", color:"var(--gold)" }}>{pt(texts, "login_title_3", "profesjonalistów")}</em>
          </h1>
          <p style={{ fontFamily:"var(--font-jost)", fontSize:"14px", fontWeight:400, lineHeight:1.8, color:"var(--text-muted)", maxWidth:"320px" }}>
            {pt(texts, "login_desc", "Najniższe ceny na rynku. Dostawa bezpośrednio do gabinetu.")}
          </p>
        </div>

        <div className="animate-fadeUp" style={{ animationDelay:".2s" }}>
          <div style={{ height:"1px", background:"rgba(201,149,106,.1)", marginBottom:"32px" }}/>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"20px" }}>
            {([
              ["feature_1_title","Produkty premium",        "feature_1_sub","Certyfikowane preparaty"],
              ["feature_2_title","Szybka dostawa",          "feature_2_sub","Do gabinetu w 24h"],
              ["feature_3_title","Najniższe ceny na rynku", "feature_3_sub","Indywidualne rabaty"],
              ["feature_4_title","Wsparcie klienta",        "feature_4_sub","Dedykowany opiekun"],
            ] as const).map(([tk, td, sk, sd]) => (
              <div key={tk}>
                <p style={{ fontFamily:"var(--font-jost)", fontSize:"12px", fontWeight:500, color:"var(--pearl)", marginBottom:"3px" }}>{pt(texts, tk, td)}</p>
                <p style={{ fontFamily:"var(--font-jost)", fontSize:"11px", fontWeight:400, color:"var(--text-muted)" }}>{pt(texts, sk, sd)}</p>
              </div>
            ))}
          </div>
          <p style={{ marginTop:"40px", fontFamily:"var(--font-jost)", fontSize:"11px", color:"var(--text-muted)" }}>© 2025 Cleo Med</p>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:"40px 24px" }}>
        <div className="animate-scaleIn" style={{ width:"100%", maxWidth:"400px" }}>

          {/* Mobile logo */}
          <div className="lg:hidden" style={{ marginBottom:"40px", textAlign:"center" }}>
            <p style={{ fontFamily:"var(--font-cinzel)", fontSize:"18px", fontWeight:500, letterSpacing:".2em", color:"var(--gold)" }}>CLEOMED</p>
            <p style={{ fontFamily:"var(--font-jost)", fontSize:"11px", letterSpacing:".2em", textTransform:"uppercase", color:"var(--text-muted)", marginTop:"4px" }}>Platforma B2B</p>
          </div>

          {/* TABS */}
          <div style={{ display:"flex", borderBottom:"1px solid rgba(201,149,106,.12)", marginBottom:"32px" }}>
            <button style={tabStyle(tab === "login")}  onClick={() => { setTab("login");    setError(""); setInfo(""); }}>Zaloguj się</button>
            <button style={tabStyle(tab === "register")} onClick={() => { setTab("register"); setError(""); setInfo(""); }}>Stwórz konto</button>
          </div>

          {/* LOGIN */}
          {tab === "login" && (
            <form onSubmit={handleLogin} style={{ display:"flex", flexDirection:"column", gap:"18px" }}>
              <div>
                <Label>Numer telefonu</Label>
                <input type="tel" required value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="500 000 000"
                  className="input" style={{ height:"52px" }}
                />
              </div>
              <div>
                <Label>Hasło</Label>
                <input type="password" required value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input" style={{ height:"52px" }}
                />
              </div>

              {error && <Msg type="err">{error}</Msg>}

              <button type="submit" disabled={loading} className="btn-gold" style={{ height:"52px", marginTop:"4px" }}>
                {loading ? <Spinner text="Logowanie..." /> : "Zaloguj się →"}
              </button>

              <p style={{ fontFamily:"var(--font-jost)", fontSize:"12px", color:"var(--text-muted)", textAlign:"center" }}>
                Nie masz konta?{" "}
                <button type="button" onClick={() => { setTab("register"); setError(""); }}
                  style={{ color:"var(--gold)", background:"none", border:"none", cursor:"pointer", fontSize:"12px", fontFamily:"var(--font-jost)", textDecoration:"underline" }}>
                  Stwórz konto
                </button>
              </p>
            </form>
          )}

          {/* REGISTER */}
          {tab === "register" && (
            <form onSubmit={handleRegister} style={{ display:"flex", flexDirection:"column", gap:"18px" }}>
              <p style={{ fontFamily:"var(--font-jost)", fontSize:"13px", fontWeight:400, color:"var(--text-muted)", lineHeight:1.7 }}>
                Konta tworzone są na podstawie numeru telefonu zarejestrowanego w systemie. Wpisz swój numer, aby ustawić hasło.
              </p>
              <div>
                <Label>Numer telefonu</Label>
                <input type="tel" required value={regPhone}
                  onChange={e => setRegPhone(e.target.value)}
                  placeholder="500 000 000"
                  className="input" style={{ height:"52px" }}
                />
              </div>

              {error === "__not_in_system__" ? (
                <NotInSystemMsg />
              ) : error ? (
                <Msg type="err">{error}</Msg>
              ) : null}
              {info  && <Msg type="ok">{info}</Msg>}

              <button type="submit" disabled={loading} className="btn-gold" style={{ height:"52px", marginTop:"4px" }}>
                {loading ? <Spinner text="Sprawdzanie..." /> : "Sprawdź i ustaw hasło →"}
              </button>

              <p style={{ fontFamily:"var(--font-jost)", fontSize:"12px", color:"var(--text-muted)", textAlign:"center" }}>
                Masz już konto?{" "}
                <button type="button" onClick={() => { setTab("login"); setError(""); setInfo(""); }}
                  style={{ color:"var(--gold)", background:"none", border:"none", cursor:"pointer", fontSize:"12px", fontFamily:"var(--font-jost)", textDecoration:"underline" }}>
                  Zaloguj się
                </button>
              </p>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}

function NotInSystemMsg() {
  return (
    <div style={{
      padding:"14px 16px",
      fontFamily:"var(--font-jost)", fontSize:"13px", fontWeight:400, lineHeight:1.7,
      borderLeft:"2px solid rgba(201,149,106,.6)",
      background:"rgba(201,149,106,.06)",
      color:"var(--gold-light)",
    }}>
      Ten numer nie jest zarejestrowany w systemie.<br/>
      <a
        href="https://api.whatsapp.com/send?phone=48694242921"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          color:"var(--gold)", fontWeight:500,
          textDecoration:"underline", textUnderlineOffset:"3px",
        }}
      >
        Napisz do nas na WhatsApp →
      </a>
    </div>
  );
}

function Msg({ type, children }: { type:"ok"|"err"; children: React.ReactNode }) {
  return (
    <div style={{
      padding:"12px 16px",
      fontFamily:"var(--font-jost)", fontSize:"13px", fontWeight:400,
      borderLeft:`2px solid ${type==="ok" ? "rgba(74,222,128,.6)" : "rgba(201,149,106,.6)"}`,
      background: type==="ok" ? "rgba(74,222,128,.06)" : "rgba(201,149,106,.06)",
      color: type==="ok" ? "#15803d" : "var(--gold-light)",
    }}>{children}</div>
  );
}

function Spinner({ text }: { text: string }) {
  return (
    <span style={{ display:"flex", alignItems:"center", gap:"10px" }}>
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="animate-spin">
        <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2"
          strokeDasharray="28" strokeDashoffset="8" strokeLinecap="round"/>
      </svg>
      {text}
    </span>
  );
}
