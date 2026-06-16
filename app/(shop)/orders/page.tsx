"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart/context";
import { useRouter } from "next/navigation";

interface Product { name: string; sku: string; qty: number; price: number; }
interface Order {
  id: string; blOrderId: string; statusName: string | null;
  orderDate: string | null; total: string | null;
  deliveryFullname: string | null; deliveryAddress: string | null; deliveryCity: string | null;
  deliveryPrice: string | null; deliveryMethod: string | null; trackingNumber: string | null;
  products: Product[];
}

function trackingUrl(trackingNumber: string, deliveryMethod: string | null): string {
  const m = (deliveryMethod ?? "").toLowerCase();
  if (m.includes("inpost") || m.includes("paczkomat")) {
    return `https://inpost.pl/sledz-przesylki?number=${encodeURIComponent(trackingNumber)}`;
  }
  if (m.includes("dpd")) {
    return `https://tracktrace.dpd.com.pl/parcelDetails?typ=1&p1=${encodeURIComponent(trackingNumber)}`;
  }
  return `https://parcelsapp.com/pl/tracking/${encodeURIComponent(trackingNumber)}`;
}

export default function OrdersPage() {
  const { addItem } = useCart();
  const router      = useRouter();
  const [orders,   setOrders]   = useState<Order[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [syncing,  setSyncing]  = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  async function loadOrders() {
    const res  = await fetch("/api/orders");
    const data = await res.json();
    setOrders(data.orders ?? []);
    setLoading(false);
  }

  useEffect(() => { loadOrders(); }, []);

  async function handleSync() {
    setSyncing(true);
    await fetch("/api/orders/sync", { method: "POST" });
    await loadOrders();
    setSyncing(false);
  }

  if (loading) return (
    <div style={{
      paddingTop:"108px", minHeight:"100vh", background:"var(--obsidian)",
      display:"flex", alignItems:"center", justifyContent:"center",
    }}>
      <p style={{ fontFamily:"var(--font-cormorant)", fontSize:"24px", fontStyle:"italic", color:"rgba(201,149,106,.35)" }}>
        Ładowanie zamówień...
      </p>
    </div>
  );

  return (
    <div style={{ paddingTop:"108px", minHeight:"100vh", background:"var(--obsidian)" }}>
      <div style={{ maxWidth:"900px", margin:"0 auto", padding:"60px 24px 100px" }}>

        {/* HEADER */}
        <div className="mob-stack mob-gap-sm mob-align-start" style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", marginBottom:"48px" }}>
          <div>
            <p style={{
              fontFamily:"var(--font-cinzel)", fontSize:"10px",
              letterSpacing:".5em", textTransform:"uppercase",
              color:"var(--gold)", marginBottom:"16px",
            }}>Moje konto</p>
            <h1 style={{
              fontFamily:"var(--font-cormorant)",
              fontSize:"48px", fontWeight:400, lineHeight:.95,
              color:"var(--pearl)",
            }}>Historia<br/><em style={{ fontStyle:"italic", color:"var(--gold)" }}>zamówień</em></h1>
          </div>
          <button
            onClick={handleSync}
            disabled={syncing}
            style={{
              fontFamily:"var(--font-jost)", fontSize:"10px",
              letterSpacing:".2em", textTransform:"uppercase",
              color: syncing ? "rgba(100,75,50,.35)" : "var(--gold)",
              background:"none", border:"1px solid rgba(201,149,106,.2)",
              padding:"10px 20px", cursor: syncing ? "not-allowed" : "pointer",
              transition:"border-color .3s, color .3s",
            }}
            onMouseEnter={e => { if (!syncing) (e.currentTarget.style.borderColor = "rgba(201,149,106,.5)"); }}
            onMouseLeave={e => { if (!syncing) (e.currentTarget.style.borderColor = "rgba(201,149,106,.2)"); }}>
            {syncing ? "Synchronizacja..." : "Odśwież"}
          </button>
        </div>

        <div style={{ height:"1px", background:"rgba(201,149,106,.1)", marginBottom:"32px" }}/>

        {orders.length === 0 ? (
          <p style={{
            fontFamily:"var(--font-cormorant)", fontSize:"28px",
            fontStyle:"italic", color:"rgba(201,149,106,.3)", textAlign:"center", padding:"80px 0",
          }}>Brak zamówień</p>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:"2px" }}>
            {orders.map(o => (
              <div key={o.id} style={{ border:"1px solid rgba(201,149,106,.08)", overflow:"hidden" }}>

                {/* ROW HEADER */}
                <button
                  onClick={() => setExpanded(expanded === o.id ? null : o.id)}
                  style={{
                    width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between",
                    padding:"16px 20px",
                    background: expanded === o.id ? "rgba(201,149,106,.04)" : "var(--charcoal)",
                    border:"none", cursor:"pointer", textAlign:"left",
                    transition:"background .2s", flexWrap:"wrap", gap:"10px",
                  }}
                  onMouseEnter={e => { if (expanded !== o.id) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,.02)"; }}
                  onMouseLeave={e => { if (expanded !== o.id) (e.currentTarget.style.background = "var(--charcoal)"); }}>

                  <div style={{ display:"flex", alignItems:"center", gap:"8px", flex:1, minWidth:0, flexWrap:"wrap" }}>
                    <span style={{ fontFamily:"var(--font-cormorant)", fontSize:"18px", fontWeight:400, color:"var(--pearl)" }}>
                      #{o.blOrderId}
                    </span>
                    <span style={{ width:"1px", height:"12px", background:"rgba(201,149,106,.15)", flexShrink:0 }}/>
                    <span style={{ fontFamily:"var(--font-jost)", fontSize:"13px", fontWeight:400, color:"var(--text-muted)" }}>
                      {o.orderDate ? new Date(o.orderDate).toLocaleDateString("pl-PL") : "—"}
                    </span>
                    {o.statusName && (
                      <span style={{
                        fontFamily:"var(--font-cinzel)", fontSize:"8px",
                        letterSpacing:".2em", textTransform:"uppercase",
                        padding:"3px 8px",
                        border:"1px solid rgba(201,149,106,.25)",
                        color:"var(--gold)",
                        maxWidth:"120px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
                      }}>{o.statusName}</span>
                    )}
                  </div>

                  <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
                    {o.total && (
                      <span style={{ fontFamily:"var(--font-cormorant)", fontSize:"18px", fontWeight:400, color:"var(--gold-light)" }}>
                        {Number(o.total).toFixed(2)} zł
                      </span>
                    )}
                    <span style={{
                      fontFamily:"var(--font-jost)", fontSize:"12px",
                      color:"var(--gold)",
                      transition:"transform .2s",
                      display:"inline-block",
                      transform: expanded === o.id ? "rotate(180deg)" : "rotate(0deg)",
                    }}>▼</span>
                  </div>
                </button>

                {/* EXPANDED CONTENT */}
                {expanded === o.id && (
                  <div style={{
                    padding:"24px 24px 28px",
                    borderTop:"1px solid rgba(201,149,106,.08)",
                    background:"var(--onyx)",
                  }}>
                    {/* Delivery + tracking row */}
                    <div className="mob-stack" style={{ display:"flex", flexWrap:"wrap", gap:"16px", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"20px" }}>
                      <div>
                        {o.deliveryFullname && (
                          <p style={{
                            fontFamily:"var(--font-jost)", fontSize:"12px", fontWeight:400,
                            color:"var(--text-muted)", letterSpacing:".03em", wordBreak:"break-word",
                          }}>
                            Dostawa: <strong style={{ color:"var(--pearl)", fontWeight:400 }}>{o.deliveryFullname}</strong>
                            {o.deliveryAddress ? `, ${o.deliveryAddress}` : ""}
                            {o.deliveryCity ? `, ${o.deliveryCity}` : ""}
                          </p>
                        )}
                        {o.deliveryPrice && (
                          <p style={{
                            fontFamily:"var(--font-jost)", fontSize:"13px", fontWeight:400,
                            color:"var(--text-muted)", marginTop:"4px", letterSpacing:".03em",
                          }}>
                            Koszt dostawy: <span style={{ color:"var(--gold)" }}>{Number(o.deliveryPrice).toFixed(2)} zł</span>
                          </p>
                        )}
                        {o.trackingNumber && (
                          <p style={{ marginTop:"6px" }}>
                            <a
                              href={trackingUrl(o.trackingNumber, o.deliveryMethod)}
                              target="_blank" rel="noopener noreferrer"
                              style={{
                                fontFamily:"var(--font-jost)", fontSize:"11px", fontWeight:400,
                                color:"var(--gold)", textDecoration:"underline",
                                textDecorationColor:"rgba(201,149,106,.35)",
                                letterSpacing:".03em",
                              }}>
                              Śledź przesyłkę: {o.trackingNumber} →
                            </a>
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          o.products.forEach(p => addItem({ id: p.sku || p.name, name: p.name, sku: p.sku, price: p.price }));
                          router.push("/cart");
                        }}
                        style={{
                          flexShrink:0,
                          padding:"9px 20px",
                          fontFamily:"var(--font-jost)", fontSize:"10px",
                          fontWeight:500, letterSpacing:".18em", textTransform:"uppercase",
                          color:"var(--obsidian)", background:"var(--gold)",
                          border:"1px solid var(--gold)",
                          cursor:"pointer", transition:"background .2s",
                          whiteSpace:"nowrap",
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = "var(--gold-light)")}
                        onMouseLeave={e => (e.currentTarget.style.background = "var(--gold)")}>
                        Zamów ponownie
                      </button>
                    </div>

                    <div style={{ display:"flex", flexDirection:"column", gap:"0" }}>
                      {o.products.map((p, i) => (
                        <div key={i} style={{
                          display:"flex", justifyContent:"space-between", alignItems:"center",
                          padding:"12px 0",
                          borderBottom:"1px solid rgba(201,149,106,.06)",
                          gap:"12px", flexWrap:"wrap",
                        }}>
                          <div style={{ flex:1, minWidth:0 }}>
                            <p style={{
                              fontFamily:"var(--font-jost)", fontSize:"14px", fontWeight:400,
                              color:"var(--pearl)", marginBottom:"2px",
                            }}>{p.name}</p>
                            <p style={{
                              fontFamily:"var(--font-jost)", fontSize:"11px", fontWeight:400,
                              color:"var(--text-muted)",
                            }}>SKU: {p.sku} · szt. {p.qty}</p>
                          </div>
                          <span style={{
                            fontFamily:"var(--font-cormorant)", fontSize:"17px", fontWeight:400,
                            color:"var(--gold-light)", flexShrink:0,
                          }}>{(p.price * p.qty).toFixed(2)} zł</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
