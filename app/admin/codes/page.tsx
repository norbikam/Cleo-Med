"use client";

import { useEffect, useState } from "react";

interface Code {
  id: string; code: string; type: string; value: string|null;
  maxUses: number|null; usedCount: number; active: boolean;
  expiresAt: string|null; createdAt: string|null;
  clientId: string|null; clientName: string|null; clientPhone: string|null;
}
interface Client { id: string; name: string|null; phone: string; }

const inp: React.CSSProperties = {
  height:"40px", padding:"0 14px",
  fontFamily:"var(--font-jost)", fontSize:"13px",
  border:"1px solid rgba(154,107,32,.2)", outline:"none",
  color:"var(--pearl)", background:"var(--obsidian)",
};
const btn: React.CSSProperties = {
  padding:"9px 20px", fontFamily:"var(--font-jost)", fontSize:"13px",
  fontWeight:500, letterSpacing:".18em", textTransform:"uppercase",
  border:"none", cursor:"pointer",
  color:"var(--obsidian)", background:"var(--gold)",
};

export default function CodesPage() {
  const [codes,   setCodes]   = useState<Code[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  // New code form
  const [code,     setCode]     = useState("");
  const [type,     setType]     = useState("percent");
  const [value,    setValue]    = useState("");
  const [clientId, setClientId] = useState("");
  const [maxUses,  setMaxUses]  = useState("");
  const [expiry,   setExpiry]   = useState("");
  const [saving,   setSaving]   = useState(false);

  async function load() {
    const [c, cl] = await Promise.all([
      fetch("/api/admin/discount-codes").then(r => r.json()),
      fetch("/api/admin/clients").then(r => r.json()),
    ]);
    setCodes(c.codes ?? []);
    setClients((cl.clients ?? []).filter((c: Client & { role?: string }) => c.role !== "admin"));
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/admin/discount-codes", {
      method:"POST", headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ code, type, value:value||null, clientId:clientId||null, maxUses:maxUses||null, expiresAt:expiry||null }),
    });
    setCode(""); setValue(""); setClientId(""); setMaxUses(""); setExpiry(""); setSaving(false);
    await load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Usunąć kod?")) return;
    await fetch(`/api/admin/discount-codes/${id}`, { method:"DELETE" });
    await load();
  }

  async function handleToggle(id: string, active: boolean) {
    await fetch(`/api/admin/discount-codes/${id}`, { method:"PATCH", headers:{ "Content-Type":"application/json" }, body:JSON.stringify({ active:!active }) });
    await load();
  }

  const onFocus = (e: React.FocusEvent<HTMLInputElement|HTMLSelectElement>) => (e.currentTarget.style.borderColor = "rgba(154,107,32,.5)");
  const onBlur  = (e: React.FocusEvent<HTMLInputElement|HTMLSelectElement>) => (e.currentTarget.style.borderColor = "rgba(154,107,32,.2)");

  return (
    <div style={{ maxWidth:"1200px", margin:"0 auto", padding:"40px 24px 80px" }} className="codes-wrap">
      {/* Header */}
      <div style={{ marginBottom:"32px" }}>
        <p style={{ fontFamily:"var(--font-cinzel)", fontSize:"11px", letterSpacing:".35em", textTransform:"uppercase", color:"var(--gold)", marginBottom:"12px" }}>Panel administracyjny</p>
        <h1 style={{ fontFamily:"var(--font-cormorant)", fontSize:"clamp(28px,5vw,40px)", fontWeight:400, color:"var(--pearl)", lineHeight:1 }}>Kody rabatowe</h1>
      </div>

      {/* Create form */}
      <div style={{ background:"#fff", border:"1px solid rgba(154,107,32,.1)", padding:"24px 24px", marginBottom:"2px" }}>
        <p style={{ fontFamily:"var(--font-cinzel)", fontSize:"11px", letterSpacing:".3em", textTransform:"uppercase", color:"var(--gold)", marginBottom:"16px" }}>Nowy kod</p>
        <form onSubmit={handleCreate} className="codes-form" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"12px", alignItems:"end" }}>
          <div>
            <p style={{ fontFamily:"var(--font-jost)", fontSize:"13px", color:"var(--text-muted)", marginBottom:"4px" }}>Kod</p>
            <input {...{ style:{...inp,width:"100%"}, placeholder:"PROMO20", required:true, value:code, onChange:(e:React.ChangeEvent<HTMLInputElement>)=>setCode(e.target.value), onFocus, onBlur }}/>
          </div>
          <div>
            <p style={{ fontFamily:"var(--font-jost)", fontSize:"13px", color:"var(--text-muted)", marginBottom:"4px" }}>Typ</p>
            <select style={{ ...inp, width:"100%", appearance:"none" as "none" }} value={type} onChange={e => setType(e.target.value)} onFocus={onFocus} onBlur={onBlur}>
              <option value="percent">Procent (%)</option>
              <option value="fixed">Kwota stała (zł)</option>
              <option value="free_shipping">Darmowa dostawa</option>
            </select>
          </div>
          {type !== "free_shipping" && (
            <div>
              <p style={{ fontFamily:"var(--font-jost)", fontSize:"13px", color:"var(--text-muted)", marginBottom:"4px" }}>{type === "percent" ? "Wartość %" : "Kwota (zł)"}</p>
              <input style={{ ...inp, width:"100%" }} type="number" min="0" placeholder={type==="percent"?"20":"100"} value={value} onChange={e => setValue(e.target.value)} onFocus={onFocus} onBlur={onBlur}/>
            </div>
          )}
          <div>
            <p style={{ fontFamily:"var(--font-jost)", fontSize:"13px", color:"var(--text-muted)", marginBottom:"4px" }}>Dla klienta (opcjonalnie)</p>
            <select style={{ ...inp, width:"100%", appearance:"none" as "none" }} value={clientId} onChange={e => setClientId(e.target.value)} onFocus={onFocus} onBlur={onBlur}>
              <option value="">Dla wszystkich</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name ?? c.phone}</option>
              ))}
            </select>
          </div>
          <div>
            <p style={{ fontFamily:"var(--font-jost)", fontSize:"13px", color:"var(--text-muted)", marginBottom:"4px" }}>Limit użyć</p>
            <input style={{ ...inp, width:"100%" }} type="number" min="1" placeholder="bez limitu" value={maxUses} onChange={e => setMaxUses(e.target.value)} onFocus={onFocus} onBlur={onBlur}/>
          </div>
          <div>
            <p style={{ fontFamily:"var(--font-jost)", fontSize:"13px", color:"var(--text-muted)", marginBottom:"4px" }}>Wygasa</p>
            <input style={{ ...inp, width:"100%" }} type="date" value={expiry} onChange={e => setExpiry(e.target.value)} onFocus={onFocus} onBlur={onBlur}/>
          </div>
          <div className="codes-form-full">
            <button type="submit" disabled={saving} style={btn}>{saving ? "Tworzę..." : "Utwórz kod rabatowy"}</button>
          </div>
        </form>
      </div>

      {/* Codes list */}
      <div style={{ background:"#fff", border:"1px solid rgba(154,107,32,.1)" }} className="codes-table-wrap">
        <div style={{ padding:"16px 24px", borderBottom:"1px solid rgba(154,107,32,.08)" }}>
          <p style={{ fontFamily:"var(--font-cinzel)", fontSize:"11px", letterSpacing:".3em", textTransform:"uppercase", color:"var(--gold)" }}>
            Wszystkie kody ({codes.length})
          </p>
        </div>
        {loading ? (
          <div style={{ padding:"48px", textAlign:"center", fontFamily:"var(--font-cormorant)", fontSize:"20px", fontStyle:"italic", color:"rgba(154,107,32,.3)" }}>Ładowanie...</div>
        ) : codes.length === 0 ? (
          <div style={{ padding:"48px", textAlign:"center", fontFamily:"var(--font-cormorant)", fontSize:"20px", fontStyle:"italic", color:"rgba(154,107,32,.3)" }}>Brak kodów.</div>
        ) : (
          <div style={{ overflowX:"auto" }}><table style={{ width:"100%", borderCollapse:"collapse", minWidth:"560px" }}>
            <thead>
              <tr style={{ borderBottom:"1px solid rgba(154,107,32,.08)" }}>
                {["Kod","Typ / wartość","Klient","Użycia","Wygasa","Status",""].map(h => (
                  <th key={h} style={{ padding:"10px 20px", textAlign:"left", fontFamily:"var(--font-cinzel)", fontSize:"11px", letterSpacing:".25em", textTransform:"uppercase", color:"var(--text-muted)", fontWeight:400 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {codes.map(c => (
                <tr key={c.id} style={{ borderBottom:"1px solid rgba(154,107,32,.05)" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(154,107,32,.02)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                  <td style={{ padding:"12px 20px" }}>
                    <span style={{ fontFamily:"monospace", fontSize:"14px", fontWeight:600, color: c.active ? "var(--pearl)" : "var(--text-muted)", textDecoration: c.active ? "none" : "line-through" }}>
                      {c.code}
                    </span>
                  </td>
                  <td style={{ padding:"12px 20px", fontFamily:"var(--font-jost)", fontSize:"13px", color:"var(--pearl)" }}>
                    {c.type === "percent" ? `${c.value}% zniżki` : c.type === "fixed" ? `${c.value} zł zniżki` : "Darmowa dostawa"}
                  </td>
                  <td style={{ padding:"12px 20px", fontFamily:"var(--font-jost)", fontSize:"14px", color:"var(--text-muted)" }}>
                    {c.clientName ?? c.clientPhone ?? <span style={{ color:"rgba(154,107,32,.4)" }}>Wszyscy</span>}
                  </td>
                  <td style={{ padding:"12px 20px", fontFamily:"var(--font-jost)", fontSize:"14px", color:"var(--text-muted)" }}>
                    {c.usedCount}{c.maxUses != null ? `/${c.maxUses}` : ""}
                  </td>
                  <td style={{ padding:"12px 20px", fontFamily:"var(--font-jost)", fontSize:"14px", color:"var(--text-muted)" }}>
                    {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString("pl-PL") : "—"}
                  </td>
                  <td style={{ padding:"12px 20px" }}>
                    <span style={{
                      fontFamily:"var(--font-cinzel)", fontSize:"11px", letterSpacing:".2em", textTransform:"uppercase",
                      padding:"3px 8px", border:"1px solid",
                      color: c.active ? "var(--gold)" : "var(--text-muted)",
                      borderColor: c.active ? "rgba(154,107,32,.3)" : "rgba(154,107,32,.1)",
                    }}>{c.active ? "Aktywny" : "Wyłączony"}</span>
                  </td>
                  <td style={{ padding:"12px 20px", textAlign:"right" }}>
                    <div style={{ display:"flex", gap:"12px", justifyContent:"flex-end" }}>
                      <button onClick={() => handleToggle(c.id, c.active)} style={{ fontFamily:"var(--font-jost)", fontSize:"13px", color:"var(--gold)", background:"none", border:"none", cursor:"pointer" }}>
                        {c.active ? "Wyłącz" : "Włącz"}
                      </button>
                      <button onClick={() => handleDelete(c.id)} style={{ fontFamily:"var(--font-jost)", fontSize:"13px", color:"rgba(180,50,50,.6)", background:"none", border:"none", cursor:"pointer" }}>
                        Usuń
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table></div>
        )}
      </div>

      <style>{`
        @media (max-width: 639px) {
          .codes-wrap { padding: 20px 12px 60px !important; }
          .codes-form { grid-template-columns: 1fr !important; }
          .codes-form-full { grid-column: 1 !important; }
        }
      `}</style>
    </div>
  );
}
