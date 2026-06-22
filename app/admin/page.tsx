"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

interface PeriodStats { orders: number; revenue: string; }
interface Stats {
  totalClients: number; activeClients: number;
  totalOrders: number; revenue: string;
  daily: PeriodStats; weekly: PeriodStats; monthly: PeriodStats;
  recentClients: { id:string; name:string|null; phone:string; email:string|null; active:boolean; createdAt:string|null }[];
}
interface Client {
  id: string; phone: string; name: string|null; email: string|null;
  role: string; active: boolean; createdAt: string|null;
}
interface ImportResult { totalOrders:number; newClients:number; existingClients:number; newOrders:number; newAddresses:number; skipped:number; updatedContacts:number; }

type Period = "daily" | "weekly" | "monthly" | "all";

const S = {
  page:  { maxWidth:"1200px", margin:"0 auto", padding:"40px 20px 80px" },
  card:  { background:"#fff", border:"1px solid rgba(154,107,32,.1)", padding:"24px 28px" } as React.CSSProperties,
  label: { fontFamily:"var(--font-cinzel)", fontSize:"11px", letterSpacing:".35em", textTransform:"uppercase" as const, color:"var(--gold)", marginBottom:"8px" },
  big:   { fontFamily:"var(--font-cormorant)", fontSize:"44px", fontWeight:400, lineHeight:1, color:"var(--pearl)" } as React.CSSProperties,
  sub:   { fontFamily:"var(--font-jost)", fontSize:"13px", color:"var(--text-muted)", marginTop:"4px" },
} as const;

export default function AdminPage() {
  const [stats,        setStats]        = useState<Stats|null>(null);
  const [clients,      setClients]      = useState<Client[]>([]);
  const [search,       setSearch]       = useState("");
  const [loading,      setLoading]      = useState(true);
  const [period,       setPeriod]       = useState<Period>("monthly");
  const [importing,    setImporting]    = useState(false);
  const [importResult, setImportResult] = useState<ImportResult|null>(null);
  const [importLogs,   setImportLogs]   = useState<string[]>([]);
  const [syncing,      setSyncing]      = useState(false);
  const [syncMsg,      setSyncMsg]      = useState("");
  const logsRef = useRef<HTMLDivElement>(null);

  const [createOpen,    setCreateOpen]    = useState(false);
  const [createPhone,   setCreatePhone]   = useState("");
  const [createName,    setCreateName]    = useState("");
  const [createEmail,   setCreateEmail]   = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const [createError,   setCreateError]   = useState("");

  async function loadData() {
    const [s, c] = await Promise.all([
      fetch("/api/admin/stats").then(r => r.json()),
      fetch("/api/admin/clients").then(r => r.json()),
    ]);
    setStats(s); setClients(c.clients ?? []);
    setLoading(false);
  }

  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    if (logsRef.current) logsRef.current.scrollTop = logsRef.current.scrollHeight;
  }, [importLogs]);

  async function handleSyncProducts() {
    setSyncing(true); setSyncMsg("");
    const res  = await fetch("/api/admin/sync-products", { method:"POST" });
    const data = await res.json();
    setSyncing(false);
    setSyncMsg(res.ok ? `Zsynchronizowano ${data.count} produktów.` : (data.error ?? "Błąd synchronizacji."));
  }

  async function handleImport() {
    if (!confirm("Import pobierze WSZYSTKIE zamówienia z BaseLinker i stworzy klientów dla każdego numeru telefonu.\n\nMoże to potrwać kilka minut. Kontynuować?")) return;
    setImporting(true); setImportResult(null); setImportLogs([]);
    try {
      const res = await fetch("/api/admin/import-clients", { method:"POST" });
      if (!res.body) throw new Error("Brak streamu");
      const reader  = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          const msg = line.startsWith("data: ") ? line.slice(6) : null;
          if (!msg) continue;
          if (msg.startsWith("DONE:")) setImportResult(JSON.parse(msg.slice(5)));
          else if (msg.startsWith("ERROR:")) throw new Error(msg.slice(6));
          else setImportLogs(prev => [...prev.slice(-100), msg]);
        }
      }
      await loadData();
    } catch (e) {
      alert("Błąd importu: " + (e instanceof Error ? e.message : String(e)));
    } finally { setImporting(false); }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreateError(""); setCreateLoading(true);
    try {
      const res  = await fetch("/api/admin/clients", {
        method:"POST", headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ phone: createPhone, name: createName, email: createEmail }),
      });
      const data = await res.json();
      if (!res.ok) { setCreateError(data.error ?? "Błąd."); return; }
      setClients(prev => [data.client, ...prev]);
      setCreateOpen(false);
      setCreatePhone(""); setCreateName(""); setCreateEmail("");
    } catch { setCreateError("Błąd połączenia."); }
    finally   { setCreateLoading(false); }
  }

  function openCreate() { setCreateOpen(true); setCreateError(""); setCreatePhone(""); setCreateName(""); setCreateEmail(""); }

  const filtered = clients.filter(c =>
    c.phone.includes(search) ||
    (c.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (c.email ?? "").toLowerCase().includes(search.toLowerCase())
  );

  function periodLabel(p: Period) {
    return { daily:"Dzisiaj", weekly:"Ten tydzień", monthly:"Ten miesiąc", all:"Łącznie" }[p];
  }

  function currentStats(): PeriodStats | null {
    if (!stats) return null;
    if (period === "all") return { orders: stats.totalOrders, revenue: stats.revenue };
    return stats[period];
  }

  const ps = currentStats();

  return (
    <div style={S.page} className="adm-wrap">
      <div style={{ marginBottom:"32px" }}>
        <p style={{ ...S.label, marginBottom:"10px" }}>Panel administracyjny</p>
        <h1 style={{ fontFamily:"var(--font-cormorant)", fontSize:"clamp(28px,5vw,40px)", fontWeight:400, color:"var(--pearl)", lineHeight:1 }}>Pulpit</h1>
      </div>

      {/* Period tabs */}
      <div style={{ display:"flex", gap:"2px", marginBottom:"16px", flexWrap:"wrap" }}>
        {(["daily","weekly","monthly","all"] as Period[]).map(p => (
          <button key={p} onClick={() => setPeriod(p)} className="adm-period-btn" style={{
            padding:"8px 18px", fontFamily:"var(--font-cinzel)", fontSize:"11px",
            letterSpacing:".25em", textTransform:"uppercase", border:"1px solid",
            cursor:"pointer", transition:"all .15s",
            color: period===p ? "var(--obsidian)" : "var(--text-muted)",
            background: period===p ? "var(--gold)" : "transparent",
            borderColor: period===p ? "var(--gold)" : "rgba(154,107,32,.2)",
          }}>{periodLabel(p)}</button>
        ))}
      </div>

      {/* Stats grid */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:"2px", marginBottom:"32px" }}>
        {[
          { label:"Klientów",        value: stats?.totalClients ?? "—",  sub: `${stats?.activeClients ?? 0} aktywnych` },
          { label:"Zamówienia (sklep)", value: ps?.orders ?? "—",        sub: periodLabel(period) },
          { label:"Przychód (sklep)",   value: ps ? `${Number(ps.revenue).toLocaleString("pl-PL",{minimumFractionDigits:2})} zł` : "—", sub: periodLabel(period), isText: true },
          { label:"Aktywni klienci",   value: stats?.activeClients ?? "—", sub: `z ${stats?.totalClients ?? 0} łącznie` },
        ].map(s => (
          <div key={s.label} style={S.card} className="adm-stat-card">
            <p style={S.label}>{s.label}</p>
            <p style={s.isText ? { ...S.big, fontSize:"28px" } : S.big}>{s.value}</p>
            <p style={S.sub}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Sync + Import */}
      <div style={{ marginBottom:"28px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"12px", flexWrap:"wrap", marginBottom:"12px" }}>
          <button onClick={handleSyncProducts} disabled={syncing} style={{
            padding:"10px 24px", fontFamily:"var(--font-jost)", fontSize:"13px", fontWeight:500,
            letterSpacing:".2em", textTransform:"uppercase", border:"1px solid rgba(154,107,32,.3)", cursor: syncing ? "wait" : "pointer",
            color:"var(--pearl)", background: syncing ? "rgba(154,107,32,.08)" : "rgba(154,107,32,.08)",
          }}>
            {syncing ? "Synchronizuję..." : "Aktualizuj stany magazynowe"}
          </button>
          {syncMsg && <p style={{ fontFamily:"var(--font-jost)", fontSize:"13px", color:"var(--gold)" }}>{syncMsg}</p>}
        </div>
        <div className="adm-import-row" style={{ display:"flex", alignItems:"center", gap:"12px", flexWrap:"wrap", marginBottom: (importing || importResult || importLogs.length > 0) ? "10px" : "0" }}>
          <button onClick={handleImport} disabled={importing} style={{
            padding:"10px 24px", fontFamily:"var(--font-jost)", fontSize:"13px", fontWeight:500,
            letterSpacing:".2em", textTransform:"uppercase", border:"none", cursor: importing ? "wait" : "pointer",
            color:"var(--obsidian)", background: importing ? "rgba(154,107,32,.5)" : "var(--gold)",
          }}>
            {importing ? "Importuję..." : "Importuj klientów z BL"}
          </button>
          {importResult && !importing && (
            <div style={{ fontFamily:"var(--font-jost)", fontSize:"14px", color:"var(--pearl)", background:"rgba(154,107,32,.06)", border:"1px solid rgba(154,107,32,.15)", padding:"9px 16px" }}>
              <span style={{ color:"var(--gold)", fontWeight:600 }}>Gotowe. </span>
              {importResult.newClients} nowych klientów · {importResult.newOrders} zamówień · {importResult.newAddresses} adresów · {importResult.updatedContacts ?? 0} zaktualizowanych kontaktów
            </div>
          )}
        </div>
        {(importing || importLogs.length > 0) && (
          <div ref={logsRef} style={{
            background:"rgba(10,8,6,.95)", border:"1px solid rgba(154,107,32,.15)",
            padding:"12px 16px", maxHeight:"160px", overflowY:"auto",
            fontFamily:"monospace", fontSize:"13px", lineHeight:"1.7", color:"rgba(200,190,170,.75)",
          }}>
            {importLogs.map((line, i) => (
              <div key={i} style={{ color: line.includes("Nowy klient") ? "rgba(154,107,32,.9)" : undefined }}>{line}</div>
            ))}
            {importing && <div style={{ color:"rgba(154,107,32,.5)" }}>▌</div>}
          </div>
        )}
      </div>

      {/* Client list */}
      <div style={{ ...S.card, padding:0, overflowX:"auto" }}>
        <div className="adm-list-hdr" style={{ padding:"14px 16px", borderBottom:"1px solid rgba(154,107,32,.08)", display:"flex", alignItems:"center", justifyContent:"space-between", gap:"10px", flexWrap:"wrap" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
            <p style={{ ...S.label, margin:0 }}>Klienci ({filtered.length})</p>
            <button onClick={openCreate} style={{
              padding:"6px 16px", fontFamily:"var(--font-cinzel)", fontSize:"11px",
              letterSpacing:".25em", textTransform:"uppercase",
              color:"var(--obsidian)", background:"var(--gold)",
              border:"none", cursor:"pointer", whiteSpace:"nowrap",
              transition:"background .15s",
            }}
              onMouseEnter={e => (e.currentTarget.style.background = "var(--gold-light)")}
              onMouseLeave={e => (e.currentTarget.style.background = "var(--gold)")}>
              + Dodaj klienta
            </button>
          </div>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Telefon, nazwa lub email..."
            className="adm-search"
            style={{
              width:"clamp(180px,40vw,280px)", height:"36px", padding:"0 12px",
              fontFamily:"var(--font-jost)", fontSize:"13px",
              border:"1px solid rgba(154,107,32,.2)", outline:"none",
              color:"var(--pearl)", background:"var(--obsidian)",
            }}
            onFocus={e => (e.currentTarget.style.borderColor = "rgba(154,107,32,.5)")}
            onBlur={e  => (e.currentTarget.style.borderColor = "rgba(154,107,32,.2)")}
          />
        </div>
        {loading ? (
          <div style={{ padding:"40px", textAlign:"center", fontFamily:"var(--font-cormorant)", fontSize:"20px", fontStyle:"italic", color:"rgba(154,107,32,.3)" }}>Ładowanie...</div>
        ) : (
          <table style={{ width:"100%", borderCollapse:"collapse", minWidth:"520px" }}>
            <thead>
              <tr style={{ borderBottom:"1px solid rgba(154,107,32,.08)" }}>
                {["Telefon","Nazwa","Email","Data","Status",""].map(h => (
                  <th key={h} style={{ padding:"10px 16px", textAlign:"left", fontFamily:"var(--font-cinzel)", fontSize:"7.5px", letterSpacing:".3em", textTransform:"uppercase", color:"var(--text-muted)", fontWeight:400, whiteSpace:"nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} style={{ borderBottom:"1px solid rgba(154,107,32,.05)" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(154,107,32,.02)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                  <td style={{ padding:"12px 16px", fontFamily:"monospace", fontSize:"14px", color:"var(--pearl)", whiteSpace:"nowrap" }}>{c.phone}</td>
                  <td style={{ padding:"12px 16px", fontFamily:"var(--font-jost)", fontSize:"14px", color:"var(--pearl)", maxWidth:"160px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{c.name ?? <span style={{ color:"var(--text-muted)" }}>—</span>}</td>
                  <td style={{ padding:"12px 16px", fontFamily:"var(--font-jost)", fontSize:"13px", color:"var(--text-muted)", maxWidth:"160px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{c.email ?? "—"}</td>
                  <td style={{ padding:"12px 16px", fontFamily:"var(--font-jost)", fontSize:"13px", color:"var(--text-muted)", whiteSpace:"nowrap" }}>
                    {c.createdAt ? new Date(c.createdAt).toLocaleDateString("pl-PL") : "—"}
                  </td>
                  <td style={{ padding:"12px 16px" }}>
                    <span style={{
                      fontFamily:"var(--font-cinzel)", fontSize:"7.5px", letterSpacing:".2em", textTransform:"uppercase",
                      padding:"3px 8px", border:"1px solid", whiteSpace:"nowrap",
                      color: c.active ? "var(--gold)" : "var(--text-muted)",
                      borderColor: c.active ? "rgba(154,107,32,.3)" : "rgba(154,107,32,.1)",
                    }}>{c.active ? "Aktywny" : "Nieaktywny"}</span>
                  </td>
                  <td style={{ padding:"12px 16px", textAlign:"right" }}>
                    <Link href={`/admin/clients/${c.id}`} style={{ fontFamily:"var(--font-jost)", fontSize:"13px", color:"var(--gold)", textDecoration:"none", whiteSpace:"nowrap" }}>Zarządzaj →</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && filtered.length === 0 && (
          <p style={{ padding:"40px", textAlign:"center", fontFamily:"var(--font-cormorant)", fontSize:"20px", fontStyle:"italic", color:"rgba(154,107,32,.3)" }}>Brak klientów.</p>
        )}
      </div>

      {/* CREATE CLIENT MODAL */}
      {createOpen && (
        <div
          onClick={() => setCreateOpen(false)}
          style={{
            position:"fixed", inset:0, zIndex:100,
            background:"rgba(10,8,6,.75)", backdropFilter:"blur(6px)",
            display:"flex", alignItems:"center", justifyContent:"center",
            padding:"24px",
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background:"var(--charcoal)", border:"1px solid rgba(154,107,32,.2)",
              width:"100%", maxWidth:"440px", padding:"32px 28px",
            }}
          >
            <div style={{ display:"flex", alignItems:"baseline", justifyContent:"space-between", marginBottom:"24px" }}>
              <p style={{ fontFamily:"var(--font-cormorant)", fontSize:"24px", fontWeight:400, color:"var(--pearl)" }}>Nowy klient</p>
              <button onClick={() => setCreateOpen(false)} style={{ background:"none", border:"none", cursor:"pointer", color:"var(--text-muted)", fontSize:"20px", lineHeight:1 }}>×</button>
            </div>

            <form onSubmit={handleCreate} style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
              <div>
                <p style={{ ...S.label, marginBottom:"6px" }}>Numer telefonu *</p>
                <input
                  required autoFocus
                  type="tel" value={createPhone}
                  onChange={e => setCreatePhone(e.target.value)}
                  placeholder="500 000 000"
                  style={{
                    width:"100%", height:"44px", padding:"0 12px",
                    fontFamily:"var(--font-jost)", fontSize:"14px",
                    border:"1px solid rgba(154,107,32,.2)", outline:"none",
                    color:"var(--pearl)", background:"var(--obsidian)",
                    boxSizing:"border-box",
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = "rgba(154,107,32,.5)")}
                  onBlur={e  => (e.currentTarget.style.borderColor = "rgba(154,107,32,.2)")}
                />
              </div>
              <div>
                <p style={{ ...S.label, marginBottom:"6px" }}>Nazwa / Imię i nazwisko</p>
                <input
                  type="text" value={createName}
                  onChange={e => setCreateName(e.target.value)}
                  placeholder="Jan Kowalski"
                  style={{
                    width:"100%", height:"44px", padding:"0 12px",
                    fontFamily:"var(--font-jost)", fontSize:"14px",
                    border:"1px solid rgba(154,107,32,.2)", outline:"none",
                    color:"var(--pearl)", background:"var(--obsidian)",
                    boxSizing:"border-box",
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = "rgba(154,107,32,.5)")}
                  onBlur={e  => (e.currentTarget.style.borderColor = "rgba(154,107,32,.2)")}
                />
              </div>
              <div>
                <p style={{ ...S.label, marginBottom:"6px" }}>Email</p>
                <input
                  type="email" value={createEmail}
                  onChange={e => setCreateEmail(e.target.value)}
                  placeholder="jan@przyklad.pl"
                  style={{
                    width:"100%", height:"44px", padding:"0 12px",
                    fontFamily:"var(--font-jost)", fontSize:"14px",
                    border:"1px solid rgba(154,107,32,.2)", outline:"none",
                    color:"var(--pearl)", background:"var(--obsidian)",
                    boxSizing:"border-box",
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = "rgba(154,107,32,.5)")}
                  onBlur={e  => (e.currentTarget.style.borderColor = "rgba(154,107,32,.2)")}
                />
              </div>

              {createError && (
                <div style={{ padding:"10px 14px", borderLeft:"2px solid rgba(201,149,106,.6)", background:"rgba(201,149,106,.06)", fontFamily:"var(--font-jost)", fontSize:"13px", color:"var(--gold-light)" }}>
                  {createError}
                </div>
              )}

              <p style={{ fontFamily:"var(--font-jost)", fontSize:"13px", color:"var(--text-muted)", lineHeight:1.6 }}>
                Klient będzie nieaktywny do momentu ustawienia hasła przez niego na stronie logowania.
              </p>

              <div style={{ display:"flex", gap:"8px", marginTop:"4px" }}>
                <button type="button" onClick={() => setCreateOpen(false)} style={{
                  flex:1, height:"44px",
                  fontFamily:"var(--font-jost)", fontSize:"13px", letterSpacing:".15em", textTransform:"uppercase",
                  color:"var(--text-muted)", background:"none",
                  border:"1px solid rgba(154,107,32,.15)", cursor:"pointer",
                }}>
                  Anuluj
                </button>
                <button type="submit" disabled={createLoading} style={{
                  flex:2, height:"44px",
                  fontFamily:"var(--font-jost)", fontSize:"13px", letterSpacing:".15em", textTransform:"uppercase",
                  color:"var(--obsidian)", background: createLoading ? "rgba(154,107,32,.5)" : "var(--gold)",
                  border:"none", cursor: createLoading ? "wait" : "pointer",
                  transition:"background .15s",
                }}>
                  {createLoading ? "Tworzenie..." : "Utwórz klienta"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 639px) {
          .adm-wrap { padding: 20px 12px 60px !important; }
          .adm-stat-card { padding: 16px 16px !important; }
          .adm-period-btn { flex: 1 1 auto; padding: 8px 10px !important; font-size: 7px !important; }
          .adm-import-row { flex-direction: column !important; align-items: stretch !important; }
          .adm-list-hdr { flex-direction: column !important; align-items: stretch !important; }
          .adm-search { width: 100% !important; }
        }
      `}</style>
    </div>
  );
}
