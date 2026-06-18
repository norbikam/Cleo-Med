"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Filter = "all" | "confirmed" | "pending";

interface Order {
  id: string;
  blOrderId: string;
  clientId: string;
  clientName: string | null;
  clientPhone: string | null;
  statusId: number | null;
  statusName: string | null;
  orderDate: string | null;
  total: string | null;
  deliveryMethod: string | null;
  userComments: string | null;
  paymentConfirmationUrl: string | null;
  paymentConfirmationAt: string | null;
}

// Prepaid status IDs — orders waiting for payment confirmation
const PREPAID_STATUS_IDS = new Set([140150, 136316, 136317, 140149, 140151]);

const S = {
  label: { fontFamily:"var(--font-cinzel)", fontSize:"11px", letterSpacing:".35em", textTransform:"uppercase" as const, color:"var(--gold)" },
} as const;

export default function AdminOrdersPage() {
  const [orders,    setOrders]    = useState<Order[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [filter,    setFilter]    = useState<Filter>("all");
  const [preview,   setPreview]   = useState<Order | null>(null);
  const [search,    setSearch]    = useState("");
  const [approving, setApproving] = useState<string | null>(null); // blOrderId being approved

  async function load(f: Filter) {
    setLoading(true);
    const res  = await fetch(`/api/admin/orders?filter=${f}`);
    const data = await res.json();
    setOrders(data.orders ?? []);
    setLoading(false);
  }

  useEffect(() => { load(filter); }, [filter]);

  async function handleApprove(o: Order) {
    if (!confirm(`Zatwierdź płatność i przesuń zamówienie #${o.blOrderId} do spakowania?`)) return;
    setApproving(o.blOrderId);
    try {
      const res  = await fetch("/api/admin/orders/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blOrderId: o.blOrderId }),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.error ?? "Błąd."); return; }

      // Update local state — no full reload needed
      setOrders(prev => prev.map(x =>
        x.blOrderId === o.blOrderId
          ? { ...x, statusId: data.statusId, statusName: data.statusName }
          : x
      ));
      if (preview?.blOrderId === o.blOrderId) {
        setPreview(p => p ? { ...p, statusId: data.statusId, statusName: data.statusName } : p);
      }
    } catch { alert("Błąd połączenia."); }
    finally { setApproving(null); }
  }

  const isCod      = (o: Order) => o.statusName?.startsWith("Za pobraniem") ?? false;
  const isApproved = (o: Order) => o.statusId != null && !PREPAID_STATUS_IDS.has(o.statusId) && !isCod(o);
  const needsApproval = (o: Order) =>
    !!o.paymentConfirmationUrl && !isCod(o) && !isApproved(o);

  const filtered = orders.filter(o =>
    !search ||
    (o.blOrderId).includes(search) ||
    (o.clientName ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (o.clientPhone ?? "").includes(search)
  );

  const counts = {
    all:       orders.length,
    confirmed: orders.filter(o => o.paymentConfirmationUrl).length,
    pending:   orders.filter(o => !o.paymentConfirmationUrl && !isCod(o)).length,
  };

  return (
    <div style={{ maxWidth:"1200px", margin:"0 auto", padding:"40px 20px 80px" }}>

      {/* HEADER */}
      <div style={{ marginBottom:"32px" }}>
        <p style={{ ...S.label, marginBottom:"10px" }}>Panel administracyjny</p>
        <h1 style={{ fontFamily:"var(--font-cormorant)", fontSize:"clamp(28px,5vw,40px)", fontWeight:400, color:"var(--pearl)", lineHeight:1 }}>Zamówienia</h1>
      </div>

      {/* FILTER TABS */}
      <div style={{ display:"flex", gap:"2px", marginBottom:"16px", flexWrap:"wrap", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", gap:"2px", flexWrap:"wrap" }}>
          {([
            { key:"all",       label:"Wszystkie",               count: counts.all },
            { key:"confirmed", label:"Potwierdzenie przesłane", count: counts.confirmed },
            { key:"pending",   label:"Bez potwierdzenia",       count: counts.pending },
          ] as { key: Filter; label: string; count: number }[]).map(t => (
            <button key={t.key} onClick={() => setFilter(t.key)} style={{
              padding:"8px 18px",
              fontFamily:"var(--font-cinzel)", fontSize:"10px",
              letterSpacing:".25em", textTransform:"uppercase",
              border:"1px solid",
              cursor:"pointer", transition:"all .15s",
              color: filter===t.key ? "var(--obsidian)" : "var(--text-muted)",
              background: filter===t.key ? "var(--gold)" : "transparent",
              borderColor: filter===t.key ? "var(--gold)" : "rgba(154,107,32,.2)",
            }}>
              {t.label} <span style={{ opacity:.7 }}>({t.count})</span>
            </button>
          ))}
        </div>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Nr zamówienia, klient, telefon..."
          style={{
            height:"36px", padding:"0 12px",
            width:"clamp(160px,35vw,260px)",
            fontFamily:"var(--font-jost)", fontSize:"13px",
            border:"1px solid rgba(154,107,32,.2)", outline:"none",
            color:"var(--pearl)", background:"var(--obsidian)",
          }}
          onFocus={e => (e.currentTarget.style.borderColor = "rgba(154,107,32,.5)")}
          onBlur={e  => (e.currentTarget.style.borderColor = "rgba(154,107,32,.2)")}
        />
      </div>

      {/* TABLE */}
      <div style={{ background:"#fff", border:"1px solid rgba(154,107,32,.1)", overflowX:"auto" }}>
        {loading ? (
          <div style={{ padding:"48px", textAlign:"center", fontFamily:"var(--font-cormorant)", fontSize:"22px", fontStyle:"italic", color:"rgba(154,107,32,.3)" }}>Ładowanie...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding:"48px", textAlign:"center", fontFamily:"var(--font-cormorant)", fontSize:"22px", fontStyle:"italic", color:"rgba(154,107,32,.3)" }}>Brak zamówień</div>
        ) : (
          <table style={{ width:"100%", borderCollapse:"collapse", minWidth:"800px" }}>
            <thead>
              <tr style={{ borderBottom:"1px solid rgba(154,107,32,.08)" }}>
                {["Nr zamówienia","Klient","Data","Wartość","Status","Potwierdzenie",""].map(h => (
                  <th key={h} style={{ padding:"10px 16px", textAlign:"left", fontFamily:"var(--font-cinzel)", fontSize:"7.5px", letterSpacing:".3em", textTransform:"uppercase", color:"var(--text-muted)", fontWeight:400, whiteSpace:"nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(o => (
                <tr key={o.id} style={{ borderBottom:"1px solid rgba(154,107,32,.05)" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(154,107,32,.02)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>

                  <td style={{ padding:"12px 16px", whiteSpace:"nowrap" }}>
                    <span style={{ fontFamily:"var(--font-cormorant)", fontSize:"17px", color:"var(--pearl)" }}>#{o.blOrderId}</span>
                  </td>

                  <td style={{ padding:"12px 16px" }}>
                    <Link href={`/admin/clients/${o.clientId}`} style={{ textDecoration:"none" }}>
                      <p style={{ fontFamily:"var(--font-jost)", fontSize:"14px", color:"var(--gold)", whiteSpace:"nowrap" }}>{o.clientName ?? "—"}</p>
                      <p style={{ fontFamily:"monospace", fontSize:"12px", color:"var(--text-muted)" }}>{o.clientPhone ?? ""}</p>
                    </Link>
                  </td>

                  <td style={{ padding:"12px 16px", whiteSpace:"nowrap", fontFamily:"var(--font-jost)", fontSize:"13px", color:"var(--text-muted)" }}>
                    {o.orderDate ? new Date(o.orderDate).toLocaleDateString("pl-PL") : "—"}
                  </td>

                  <td style={{ padding:"12px 16px", whiteSpace:"nowrap" }}>
                    <span style={{ fontFamily:"var(--font-cormorant)", fontSize:"17px", color:"var(--gold-light)" }}>
                      {o.total ? `${Number(o.total).toFixed(2)} zł` : "—"}
                    </span>
                  </td>

                  <td style={{ padding:"12px 16px" }}>
                    {o.statusName && (
                      <span style={{
                        fontFamily:"var(--font-cinzel)", fontSize:"7.5px",
                        letterSpacing:".2em", textTransform:"uppercase",
                        padding:"3px 8px", border:"1px solid",
                        whiteSpace:"nowrap",
                        color: isApproved(o) ? "rgba(60,140,60,.9)" : "var(--gold)",
                        borderColor: isApproved(o) ? "rgba(60,140,60,.3)" : "rgba(154,107,32,.25)",
                      }}>{o.statusName}</span>
                    )}
                  </td>

                  {/* POTWIERDZENIE + ZATWIERDŹ */}
                  <td style={{ padding:"12px 16px" }}>
                    {o.paymentConfirmationUrl ? (
                      <button
                        onClick={() => setPreview(o)}
                        style={{
                          display:"flex", alignItems:"center", gap:"8px",
                          background:"rgba(154,107,32,.06)", border:"1px solid rgba(154,107,32,.2)",
                          padding:"6px 12px", cursor:"pointer",
                          fontFamily:"var(--font-jost)", fontSize:"12px", color:"var(--gold)",
                          letterSpacing:".05em", whiteSpace:"nowrap",
                        }}>
                        <img src={o.paymentConfirmationUrl} alt="" style={{ width:"28px", height:"28px", objectFit:"cover", border:"1px solid rgba(154,107,32,.15)" }}/>
                        {isApproved(o) ? "Zatwierdzone ✓" : "Sprawdź →"}
                      </button>
                    ) : (
                      <span style={{ fontFamily:"var(--font-jost)", fontSize:"12px", color:"rgba(154,107,32,.35)" }}>Brak</span>
                    )}
                  </td>

                  <td style={{ padding:"12px 16px", textAlign:"right", whiteSpace:"nowrap" }}>
                    {needsApproval(o) && (
                      <button
                        onClick={() => handleApprove(o)}
                        disabled={approving === o.blOrderId}
                        style={{
                          fontFamily:"var(--font-jost)", fontSize:"11px",
                          letterSpacing:".15em", textTransform:"uppercase",
                          color:"var(--obsidian)", background: approving === o.blOrderId ? "rgba(154,107,32,.5)" : "var(--gold)",
                          border:"none", padding:"7px 16px",
                          cursor: approving === o.blOrderId ? "wait" : "pointer",
                          transition:"background .2s", marginRight:"8px",
                        }}>
                        {approving === o.blOrderId ? "..." : "Zatwierdź"}
                      </button>
                    )}
                    <Link href={`/admin/clients/${o.clientId}`} style={{ fontFamily:"var(--font-jost)", fontSize:"13px", color:"var(--gold)", textDecoration:"none" }}>
                      Klient →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL — podgląd potwierdzenia */}
      {preview && (
        <div
          onClick={() => setPreview(null)}
          style={{
            position:"fixed", inset:0, zIndex:200,
            background:"rgba(10,8,6,.82)", backdropFilter:"blur(8px)",
            display:"flex", flexDirection:"column",
            alignItems:"center", justifyContent:"center",
            padding:"24px",
          }}
        >
          <div onClick={e => e.stopPropagation()} style={{ position:"relative", maxWidth:"820px", width:"100%" }}>
            <div style={{ background:"rgba(245,241,236,.98)", border:"1px solid rgba(154,107,32,.2)", padding:"20px" }}>

              {/* Modal header */}
              <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:"16px", gap:"16px" }}>
                <div>
                  <p style={{ ...S.label, marginBottom:"4px" }}>Potwierdzenie płatności</p>
                  <p style={{ fontFamily:"var(--font-cormorant)", fontSize:"22px", fontWeight:400, color:"var(--pearl)" }}>
                    Zamówienie #{preview.blOrderId}
                  </p>
                  {preview.clientName && (
                    <p style={{ fontFamily:"var(--font-jost)", fontSize:"13px", color:"var(--text-muted)", marginTop:"2px" }}>
                      {preview.clientName} · {preview.clientPhone}
                    </p>
                  )}
                  {preview.paymentConfirmationAt && (
                    <p style={{ fontFamily:"var(--font-jost)", fontSize:"12px", color:"rgba(100,75,50,.5)", marginTop:"2px" }}>
                      Przesłano: {new Date(preview.paymentConfirmationAt).toLocaleString("pl-PL")}
                    </p>
                  )}

                  {/* Status badge w modalu */}
                  {preview.statusName && (
                    <span style={{
                      display:"inline-block", marginTop:"8px",
                      fontFamily:"var(--font-cinzel)", fontSize:"8px",
                      letterSpacing:".2em", textTransform:"uppercase",
                      padding:"3px 10px", border:"1px solid",
                      color: isApproved(preview) ? "rgba(60,140,60,.9)" : "var(--gold)",
                      borderColor: isApproved(preview) ? "rgba(60,140,60,.3)" : "rgba(154,107,32,.25)",
                    }}>{preview.statusName}</span>
                  )}
                </div>
                <button
                  onClick={() => setPreview(null)}
                  style={{
                    width:"36px", height:"36px", background:"rgba(154,107,32,.08)",
                    border:"1px solid rgba(154,107,32,.2)", cursor:"pointer",
                    fontSize:"18px", color:"var(--gold)",
                    display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
                  }}>×</button>
              </div>

              {/* Image */}
              <img
                src={preview.paymentConfirmationUrl!}
                alt="Potwierdzenie płatności"
                style={{ width:"100%", maxHeight:"60vh", objectFit:"contain", display:"block", border:"1px solid rgba(154,107,32,.1)" }}
              />

              {/* Actions */}
              <div style={{ marginTop:"14px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:"12px", flexWrap:"wrap" }}>
                <a
                  href={preview.paymentConfirmationUrl!}
                  download={`potwierdzenie-${preview.blOrderId}.jpg`}
                  style={{
                    fontFamily:"var(--font-jost)", fontSize:"12px",
                    letterSpacing:".12em", textTransform:"uppercase",
                    color:"var(--gold)", textDecoration:"none",
                    border:"1px solid rgba(154,107,32,.3)",
                    padding:"7px 16px", display:"inline-block",
                  }}>
                  Pobierz ↓
                </a>

                {needsApproval(preview) ? (
                  <button
                    onClick={() => handleApprove(preview)}
                    disabled={approving === preview.blOrderId}
                    style={{
                      fontFamily:"var(--font-jost)", fontSize:"13px",
                      letterSpacing:".18em", textTransform:"uppercase",
                      color:"var(--obsidian)",
                      background: approving === preview.blOrderId ? "rgba(154,107,32,.5)" : "var(--gold)",
                      border:"none", padding:"10px 28px",
                      cursor: approving === preview.blOrderId ? "wait" : "pointer",
                      fontWeight:500,
                    }}>
                    {approving === preview.blOrderId ? "Zatwierdzanie..." : "✓ Zatwierdź płatność"}
                  </button>
                ) : isApproved(preview) ? (
                  <span style={{
                    fontFamily:"var(--font-jost)", fontSize:"13px", fontWeight:500,
                    color:"rgba(60,140,60,.9)", padding:"10px 0",
                  }}>✓ Płatność zatwierdzona</span>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
