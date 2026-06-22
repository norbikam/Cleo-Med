"use client";

import { useEffect, useState } from "react";

interface Admin {
  id: string; phone: string; name: string | null; email: string | null;
  active: boolean; createdAt: string | null;
}

const card: React.CSSProperties = { background:"#fff", border:"1px solid rgba(154,107,32,.1)", padding:"24px 28px", marginBottom:"2px" };
const inp:  React.CSSProperties = { height:"40px", padding:"0 14px", fontFamily:"var(--font-jost)", fontSize:"13px", border:"1px solid rgba(154,107,32,.2)", outline:"none", color:"var(--pearl)", background:"var(--obsidian)", width:"100%" };
const gbtn: React.CSSProperties = { padding:"9px 20px", fontFamily:"var(--font-jost)", fontSize:"13px", fontWeight:500, letterSpacing:".18em", textTransform:"uppercase", border:"none", cursor:"pointer", color:"var(--obsidian)", background:"var(--gold)" };
const Lbl = ({ s }: { s: string }) => (
  <p style={{ fontFamily:"var(--font-cinzel)", fontSize:"11px", letterSpacing:".3em", textTransform:"uppercase", color:"var(--gold)", marginBottom:"6px" }}>{s}</p>
);

export default function AdminAdminsPage() {
  const [admins,  setAdmins]  = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg,     setMsg]     = useState("");

  // new admin form
  const [phone,   setPhone]   = useState("");
  const [name,    setName]    = useState("");
  const [email,   setEmail]   = useState("");
  const [saving,  setSaving]  = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/admins");
    const d   = await res.json();
    setAdmins(d.admins ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setMsg("");
    const res  = await fetch("/api/admin/admins", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ phone, name, email }) });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setMsg(data.error ?? "Błąd."); return; }
    setMsg(data.promoted ? "Istniejący klient został promowany na admina." : "Nowy administrator dodany.");
    setPhone(""); setName(""); setEmail("");
    load();
  }

  async function handleResetPassword(id: string) {
    if (!confirm("Resetować hasło tego administratora?")) return;
    const res = await fetch(`/api/admin/clients/${id}/reset-password`, { method:"POST" });
    setMsg(res.ok ? "Hasło zresetowane." : "Błąd resetu hasła.");
  }

  async function handleToggle(admin: Admin) {
    const res = await fetch(`/api/admin/clients/${admin.id}`, { method:"PATCH", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ active: !admin.active }) });
    if (res.ok) { setMsg(admin.active ? "Konto dezaktywowane." : "Konto aktywowane."); load(); }
  }

  return (
    <div style={{ paddingTop:"56px", minHeight:"100vh", background:"var(--obsidian)" }}>
      <div style={{ maxWidth:"860px", margin:"0 auto", padding:"40px 24px 80px" }}>

        <h1 style={{ fontFamily:"var(--font-cormorant)", fontSize:"36px", fontWeight:400, color:"var(--pearl)", marginBottom:"8px" }}>Administratorzy</h1>
        <p style={{ fontFamily:"var(--font-jost)", fontSize:"14px", color:"var(--text-muted)", marginBottom:"32px" }}>
          Zarządzaj kontami administracyjnymi.
        </p>

        {/* ADD ADMIN */}
        <div style={card}>
          <Lbl s="Dodaj administratora" />
          <p style={{ fontFamily:"var(--font-jost)", fontSize:"13px", color:"var(--text-muted)", marginBottom:"20px", lineHeight:1.6 }}>
            Podaj numer telefonu. Jeśli klient z tym numerem już istnieje, zostanie promowany na admina. Jeśli nie — zostanie utworzone nowe konto.
          </p>
          <form onSubmit={handleAdd} style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"12px" }}>
              <div>
                <Lbl s="Telefon *" />
                <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="500 000 000" required style={inp}/>
              </div>
              <div>
                <Lbl s="Imię i nazwisko" />
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Jan Kowalski" style={inp}/>
              </div>
              <div>
                <Lbl s="Email" />
                <input value={email} onChange={e => setEmail(e.target.value)} placeholder="jan@cleomed.pl" type="email" style={inp}/>
              </div>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:"16px" }}>
              <button type="submit" disabled={saving} style={gbtn}>{saving ? "Dodawanie..." : "Dodaj administratora"}</button>
              {msg && <p style={{ fontFamily:"var(--font-jost)", fontSize:"13px", color:"var(--gold)" }}>{msg}</p>}
            </div>
          </form>
        </div>

        {/* LIST */}
        <div style={{ ...card, marginTop:"2px" }}>
          <Lbl s={`Aktywni administratorzy (${admins.length})`} />
          {loading ? (
            <p style={{ fontFamily:"var(--font-jost)", fontSize:"13px", color:"var(--text-muted)", marginTop:"12px" }}>Ładowanie...</p>
          ) : admins.length === 0 ? (
            <p style={{ fontFamily:"var(--font-jost)", fontSize:"13px", color:"var(--text-muted)", marginTop:"12px" }}>Brak administratorów.</p>
          ) : (
            <div style={{ marginTop:"16px", display:"flex", flexDirection:"column", gap:"2px" }}>
              {admins.map(a => (
                <div key={a.id} style={{ display:"flex", alignItems:"center", gap:"16px", padding:"16px", background:"var(--obsidian)", flexWrap:"wrap" }}>
                  <div style={{ flex:1, minWidth:"160px" }}>
                    <p style={{ fontFamily:"var(--font-jost)", fontSize:"14px", fontWeight:500, color: a.active ? "var(--pearl)" : "var(--text-muted)" }}>
                      {a.name ?? "—"}
                    </p>
                    <p style={{ fontFamily:"var(--font-jost)", fontSize:"13px", color:"var(--text-muted)", marginTop:"2px" }}>{a.phone}</p>
                    {a.email && <p style={{ fontFamily:"var(--font-jost)", fontSize:"12px", color:"var(--text-muted)", marginTop:"1px" }}>{a.email}</p>}
                  </div>
                  <span style={{ fontFamily:"var(--font-cinzel)", fontSize:"10px", letterSpacing:".2em", textTransform:"uppercase", padding:"4px 10px", border:"1px solid", color: a.active ? "var(--gold)" : "var(--text-muted)", borderColor: a.active ? "rgba(154,107,32,.3)" : "rgba(154,107,32,.1)" }}>
                    {a.active ? "Aktywny" : "Nieaktywny"}
                  </span>
                  <div style={{ display:"flex", gap:"8px" }}>
                    <button onClick={() => handleResetPassword(a.id)} style={{ ...gbtn, background:"rgba(154,107,32,.08)", color:"var(--pearl)", border:"1px solid rgba(154,107,32,.2)", padding:"7px 14px" }}>
                      Resetuj hasło
                    </button>
                    <button onClick={() => handleToggle(a)} style={{ ...gbtn, background: a.active ? "rgba(180,50,50,.1)" : "rgba(154,107,32,.08)", color: a.active ? "rgb(160,40,40)" : "var(--pearl)", border:`1px solid ${a.active ? "rgba(180,50,50,.2)" : "rgba(154,107,32,.2)"}`, padding:"7px 14px" }}>
                      {a.active ? "Dezaktywuj" : "Aktywuj"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
