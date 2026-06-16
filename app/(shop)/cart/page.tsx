"use client";

import { useState, useEffect, useRef } from "react";
import { useCart } from "@/lib/cart/context";
import { useRouter } from "next/navigation";
import { usePageTexts, pt } from "@/lib/hooks/use-page-texts";

interface Address {
  id: string; label: string; fullname: string;
  street: string; city: string; postcode: string;
  phone: string | null; isDefault: boolean;
  courierType: string | null; lockerCode: string | null;
}

interface LockerPoint {
  code: string; label: string;
  street: string; postcode: string; city: string;
}

interface SuccessData {
  orderId: string;
  address: Address;
  paymentMethod: "cod" | "transfer" | "blik";
  orderTotal: number;
  deliveryPrice: number;
  items: { name: string; qty: number; price: number }[];
  shippingToday: boolean;
}

function isShippingToday(): boolean {
  const now = new Date();
  const day = now.getDay();
  return day >= 1 && day <= 5 && now.getHours() < 14;
}

export default function CartPage() {
  const { items, removeItem, updateQty, clearCart, total } = useCart();
  const router = useRouter();
  const texts  = usePageTexts();

  const [addresses,       setAddresses]       = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [paymentMethod,   setPaymentMethod]   = useState<"cod"|"transfer"|"blik">("cod");
  const [userComments,     setUserComments]    = useState("");
  const [weekendDelivery,  setWeekendDelivery] = useState(false);
  const [weekendLocker,    setWeekendLocker]   = useState<LockerPoint | null>(null);
  const [lockerQuery,      setLockerQuery]     = useState("");
  const [lockerResults,    setLockerResults]   = useState<LockerPoint[]>([]);
  const [lockerLoading,    setLockerLoading]   = useState(false);
  const [lockerOpen,       setLockerOpen]      = useState(false);
  const [loading,          setLoading]         = useState(false);
  const [success,          setSuccess]         = useState<SuccessData | null>(null);
  const [error,            setError]           = useState<string | null>(null);
  const [shippingNow,      setShippingNow]     = useState(isShippingToday);
  const searchTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dropdownRef  = useRef<HTMLDivElement>(null);

  const isFriday      = new Date().getDay() === 5;
  const selectedAddr  = addresses.find(a => a.id === selectedAddress) ?? null;
  const showWeekend   = isFriday && !!selectedAddr;
  const showLocker    = weekendDelivery && showWeekend;
  const weekendReady  = !weekendDelivery || !showWeekend || weekendLocker !== null;
  const deliveryPrice = weekendDelivery && showWeekend ? 25 : 20;

  useEffect(() => {
    if (!weekendDelivery) { setWeekendLocker(null); setLockerQuery(""); setLockerResults([]); }
  }, [weekendDelivery]);

  useEffect(() => {
    setWeekendDelivery(false);
  }, [selectedAddress]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setLockerOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function onLockerSearch(q: string) {
    setLockerQuery(q);
    setWeekendLocker(null);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (q.length < 2) { setLockerResults([]); setLockerOpen(false); return; }
    searchTimer.current = setTimeout(async () => {
      setLockerLoading(true);
      try {
        const res  = await fetch(`/api/inpost-points?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        setLockerResults(data.points ?? []);
        setLockerOpen(true);
      } finally { setLockerLoading(false); }
    }, 350);
  }

  function selectLocker(p: LockerPoint) {
    setWeekendLocker(p);
    setLockerQuery(p.label || p.code);
    setLockerOpen(false);
    setLockerResults([]);
  }

  useEffect(() => {
    const id = setInterval(() => setShippingNow(isShippingToday()), 30_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    fetch("/api/addresses")
      .then(r => r.json())
      .then(d => {
        const addrs: Address[] = d.addresses ?? [];
        setAddresses(addrs);
        const def = addrs.find(a => a.isDefault);
        if (def) setSelectedAddress(def.id);
        else if (addrs.length > 0) setSelectedAddress(addrs[0].id);
      });
  }, []);

  async function handleOrder() {
    if (items.length === 0) return;
    if (!selectedAddress) { setError("Wybierz adres dostawy."); return; }
    if (showLocker && !weekendLocker) { setError("Wybierz paczkomat dla dostawy InPost Weekend."); return; }
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          addressId: selectedAddress,
          items: items.map(i => ({ id: i.id, name: i.name, sku: i.sku, price: i.price, qty: i.qty })),
          paymentMethod,
          userComments: userComments.trim() || undefined,
          weekendDelivery: weekendDelivery && showWeekend,
          weekendLocker: (weekendDelivery && showWeekend && weekendLocker) ? weekendLocker : undefined,
        }),
      });
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};
      if (!res.ok) { setError(data.error ?? `Błąd serwera (${res.status})`); return; }
      const addr = addresses.find(a => a.id === selectedAddress)!;
      const snapshot = items.map(i => ({ name: i.name, qty: i.qty, price: i.price }));
      const snap_total = total;
      const shippingTodaySnap = isShippingToday();
      clearCart();
      setSuccess({ orderId: String(data.orderId), address: addr, paymentMethod, orderTotal: snap_total, deliveryPrice, items: snapshot, shippingToday: shippingTodaySnap });
    } catch (err) { setError("Błąd połączenia: " + String(err)); }
    finally   { setLoading(false); }
  }

  const S = (x: React.CSSProperties): React.CSSProperties => x;

  if (success) {
    const paymentInfo: Record<string, { title: string; content: React.ReactNode }> = {
      cod: {
        title: "Za pobraniem",
        content: <span>Płatność gotówką lub kartą przy odbiorze przesyłki.</span>,
      },
      transfer: {
        title: "Przelew bankowy",
        content: (
          <>
            Odbiorca: <strong style={{ color:"var(--pearl)" }}>{pt(texts, "company_name", "Cleo Med Sp. z o.o.")}</strong><br/>
            Numer konta: <strong style={{ color:"var(--pearl)" }}>{pt(texts, "bank_account_number", "XX XXXX XXXX XXXX XXXX XXXX XXXX")}</strong><br/>
            Tytuł przelewu: <strong style={{ color:"var(--pearl)" }}>#{success.orderId}</strong>
            <br/><br/>
            <span style={{ color:"var(--gold)", fontWeight:500 }}>⚠ Zamówienie zostanie zrealizowane po zaksięgowaniu wpłaty.</span>
          </>
        ),
      },
      blik: {
        title: "BLIK na telefon",
        content: (
          <>
            Wyślij przelew BLIK na numer:<br/>
            <span style={{ fontFamily:"var(--font-cormorant)", fontSize:"22px", fontWeight:400, color:"var(--pearl)" }}>{pt(texts, "blik_phone", "+48 XXX XXX XXX")}</span><br/>
            Odbiorca: <strong style={{ color:"var(--pearl)" }}>{pt(texts, "blik_recipient", "Cleo Med")}</strong><br/>
            Tytuł: <strong style={{ color:"var(--pearl)" }}>#{success.orderId}</strong>
            <br/><br/>
            <span style={{ color:"var(--gold)", fontWeight:500 }}>⚠ Zamówienie zostanie zrealizowane po zaksięgowaniu wpłaty.</span>
          </>
        ),
      },
    };
    const pm = paymentInfo[success.paymentMethod];

    return (
      <div style={{ paddingTop:"108px", minHeight:"100vh", background:"var(--obsidian)" }}>
        <div style={{ maxWidth:"640px", margin:"0 auto", padding:"60px 24px 100px" }}>

          {/* CHECK + HEADER */}
          <div style={{ textAlign:"center", marginBottom:"56px" }}>
            <div style={{
              width:"72px", height:"72px", borderRadius:"50%",
              border:"1px solid rgba(154,107,32,.35)",
              display:"flex", alignItems:"center", justifyContent:"center",
              margin:"0 auto 28px",
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M5 13l4 4L19 7" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p style={{
              fontFamily:"var(--font-cinzel)", fontSize:"10px",
              letterSpacing:".5em", textTransform:"uppercase",
              color:"var(--gold)", marginBottom:"16px",
            }}>Potwierdzenie</p>
            <h1 style={{
              fontFamily:"var(--font-cormorant)", fontSize:"48px", fontWeight:400, lineHeight:.95,
              color:"var(--pearl)", marginBottom:"14px",
            }}>Zamówienie<br/><em style={{ fontStyle:"italic", color:"var(--gold)" }}>złożone</em></h1>
            <p style={{
              fontFamily:"var(--font-jost)", fontSize:"12px", fontWeight:400,
              color:"var(--text-muted)", letterSpacing:".05em",
            }}>
              Numer zamówienia:{" "}
              <span style={{ fontFamily:"var(--font-cormorant)", fontSize:"18px", color:"var(--pearl)" }}>
                #{success.orderId}
              </span>
            </p>
            <p style={{
              marginTop:"18px",
              fontFamily:"var(--font-jost)", fontSize:"12px", fontWeight:500,
              color: success.shippingToday ? "var(--gold)" : "var(--text-muted)",
              letterSpacing:".04em",
            }}>
              {success.shippingToday
                ? "✓ Zamówienie zostanie wysłane dzisiaj"
                : "Zamówienie zostanie wysłane w następny dzień roboczy"}
            </p>
          </div>

          <div style={{ height:"1px", background:"rgba(154,107,32,.12)", marginBottom:"32px" }}/>

          {/* PRODUCTS */}
          <div style={{ marginBottom:"28px" }}>
            <p style={{
              fontFamily:"var(--font-cinzel)", fontSize:"9px",
              letterSpacing:".35em", textTransform:"uppercase",
              color:"var(--gold)", marginBottom:"16px",
            }}>Zamówione produkty</p>
            <div style={{ display:"flex", flexDirection:"column", gap:"0" }}>
              {success.items.map((item, i) => (
                <div key={i} style={{
                  display:"flex", justifyContent:"space-between", alignItems:"baseline",
                  padding:"11px 0",
                  borderBottom:"1px solid rgba(154,107,32,.07)",
                }}>
                  <div style={{ display:"flex", alignItems:"baseline", gap:"10px" }}>
                    <span style={{
                      fontFamily:"var(--font-jost)", fontSize:"13px", fontWeight:400,
                      color:"var(--pearl)",
                    }}>{item.name}</span>
                    <span style={{
                      fontFamily:"var(--font-jost)", fontSize:"10px",
                      color:"rgba(100,75,50,.45)", letterSpacing:".05em",
                    }}>× {item.qty}</span>
                  </div>
                  <span style={{
                    fontFamily:"var(--font-cormorant)", fontSize:"16px",
                    color:"var(--gold)",
                  }}>{(item.price * item.qty).toFixed(2)} zł</span>
                </div>
              ))}
              <div style={{
                display:"flex", justifyContent:"space-between", alignItems:"baseline",
                padding:"11px 0",
                borderBottom:"1px solid rgba(154,107,32,.07)",
              }}>
                <span style={{
                  fontFamily:"var(--font-jost)", fontSize:"12px", fontWeight:400,
                  color:"var(--text-muted)",
                }}>Koszt dostawy</span>
                <span style={{
                  fontFamily:"var(--font-cormorant)", fontSize:"16px",
                  color:"var(--gold)",
                }}>{success.deliveryPrice.toFixed(2)} zł</span>
              </div>
              <div style={{
                display:"flex", justifyContent:"space-between", alignItems:"baseline",
                padding:"14px 0 0",
              }}>
                <span style={{
                  fontFamily:"var(--font-cinzel)", fontSize:"8px",
                  letterSpacing:".3em", textTransform:"uppercase",
                  color:"var(--text-muted)",
                }}>Łącznie z dostawą</span>
                <span style={{
                  fontFamily:"var(--font-cormorant)", fontSize:"28px", fontWeight:400,
                  color:"var(--gold)",
                }}>{(success.orderTotal + success.deliveryPrice).toFixed(2)} zł</span>
              </div>
            </div>
          </div>

          {/* ADDRESS + PAYMENT */}
          <div className="mob-grid-1" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"2px", marginBottom:"36px" }}>
            <div style={{ padding:"20px", background:"var(--charcoal)", border:"1px solid rgba(154,107,32,.08)" }}>
              <p style={{
                fontFamily:"var(--font-cinzel)", fontSize:"8px",
                letterSpacing:".3em", textTransform:"uppercase",
                color:"var(--gold)", marginBottom:"12px",
              }}>Adres dostawy</p>
              <p style={{
                fontFamily:"var(--font-jost)", fontSize:"12px", fontWeight:400,
                color:"var(--text-muted)", lineHeight:1.75,
              }}>
                <strong style={{ color:"var(--pearl)", fontWeight:500 }}>{success.address.fullname}</strong><br/>
                {success.address.street}<br/>
                {success.address.postcode} {success.address.city}
              </p>
            </div>
            <div style={{ padding:"20px", background:"var(--charcoal)", border:"1px solid rgba(154,107,32,.08)" }}>
              <p style={{
                fontFamily:"var(--font-cinzel)", fontSize:"8px",
                letterSpacing:".3em", textTransform:"uppercase",
                color:"var(--gold)", marginBottom:"12px",
              }}>Płatność</p>
              <p style={{
                fontFamily:"var(--font-cinzel)", fontSize:"9px",
                letterSpacing:".2em", textTransform:"uppercase",
                color:"var(--pearl)", marginBottom:"10px",
              }}>{pm.title}</p>
              <p style={{
                fontFamily:"var(--font-jost)", fontSize:"12px", fontWeight:400,
                color:"var(--text-muted)", lineHeight:1.75,
              }}>{pm.content}</p>
            </div>
          </div>

          {/* ACTIONS */}
          <div style={{ display:"flex", gap:"12px", justifyContent:"center" }}>
            <button onClick={() => router.push("/orders")} className="btn-gold">
              Historia zamówień
            </button>
            <button onClick={() => router.push("/catalog")} className="btn-outline">
              Kontynuuj zakupy
            </button>
          </div>

        </div>
      </div>
    );
  }

  if (items.length === 0) return (
    <div style={{ paddingTop:"108px", minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"var(--obsidian)" }}>
      <div style={{ textAlign:"center", maxWidth:"360px", padding:"0 24px" }}>
        <p style={{
          fontFamily:"var(--font-cormorant)", fontSize:"32px", fontWeight:400,
          fontStyle:"italic", color:"rgba(201,149,106,.35)", marginBottom:"28px",
        }}>Koszyk jest pusty</p>
        <button onClick={() => router.push("/catalog")} className="btn-gold">
          Przejdź do katalogu
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ paddingTop:"108px", minHeight:"100vh", background:"var(--obsidian)" }}>
      <div style={{ maxWidth:"800px", margin:"0 auto", padding:"60px 24px 100px" }}>

        <p style={{
          fontFamily:"var(--font-cinzel)", fontSize:"10px",
          letterSpacing:".5em", textTransform:"uppercase",
          color:"var(--gold)", marginBottom:"20px",
        }}>Twój koszyk</p>

        <h1 style={{
          fontFamily:"var(--font-cormorant)",
          fontSize:"42px", fontWeight:400,
          color:"var(--pearl)", marginBottom:"48px",
        }}>
          Zamówienie
        </h1>

        {/* ITEMS */}
        <div style={{ borderTop:"1px solid rgba(201,149,106,.1)", marginBottom:"32px" }}>
          {items.map(item => (
            <div key={item.id} style={{
              display:"flex", alignItems:"center", gap:"12px",
              padding:"20px 0",
              borderBottom:"1px solid rgba(201,149,106,.08)",
              flexWrap:"wrap",
            }}>
              <div style={{ flex:1 }}>
                <p style={{ fontFamily:"var(--font-cormorant)", fontSize:"18px", fontWeight:400, color:"var(--pearl)", marginBottom:"2px" }}>
                  {item.name}
                </p>
                {item.sku && (
                  <p style={{ fontFamily:"var(--font-jost)", fontSize:"10px", letterSpacing:".1em", color:"rgba(100,75,50,.45)" }}>
                    SKU: {item.sku}
                  </p>
                )}
              </div>

              <div style={{ display:"flex", alignItems:"center", gap:"0", border:"1px solid rgba(201,149,106,.15)" }}>
                <button onClick={() => updateQty(item.id, item.qty - 1)}
                  style={{
                    width:"32px", height:"32px", display:"flex", alignItems:"center", justifyContent:"center",
                    fontFamily:"var(--font-jost)", fontSize:"15px", color:"var(--text-muted)",
                    background:"none", border:"none", cursor:"pointer", transition:"color .2s",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = "var(--pearl)")}
                  onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}>−</button>
                <span style={{
                  width:"36px", height:"32px", display:"flex", alignItems:"center", justifyContent:"center",
                  fontFamily:"var(--font-jost)", fontSize:"12px", color:"var(--pearl)",
                  borderLeft:"1px solid rgba(201,149,106,.15)", borderRight:"1px solid rgba(201,149,106,.15)",
                }}>{item.qty}</span>
                <button onClick={() => updateQty(item.id, item.qty + 1)}
                  style={{
                    width:"32px", height:"32px", display:"flex", alignItems:"center", justifyContent:"center",
                    fontFamily:"var(--font-jost)", fontSize:"15px", color:"var(--text-muted)",
                    background:"none", border:"none", cursor:"pointer", transition:"color .2s",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = "var(--pearl)")}
                  onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}>+</button>
              </div>

              <div style={{ minWidth:"80px", textAlign:"right", marginLeft:"auto" }}>
                <p style={{ fontFamily:"var(--font-cormorant)", fontSize:"18px", color:"var(--gold-light)" }}>
                  {(item.price * item.qty).toFixed(2)} zł
                </p>
              </div>

              <button onClick={() => removeItem(item.id)}
                style={{
                  fontFamily:"var(--font-jost)", fontSize:"10px", letterSpacing:".1em",
                  color:"var(--text-muted)", background:"none", border:"none",
                  cursor:"pointer", transition:"color .2s",
                }}
                onMouseEnter={e => (e.currentTarget.style.color = "rgba(201,149,106,.7)")}
                onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}>
                Usuń
              </button>
            </div>
          ))}
        </div>

        {/* ADDRESS */}
        <div style={{
          padding:"24px 28px",
          border:"1px solid rgba(201,149,106,.1)",
          marginBottom:"20px",
        }}>
          <p style={{
            fontFamily:"var(--font-cinzel)", fontSize:"9px",
            letterSpacing:".3em", textTransform:"uppercase",
            color:"var(--gold)", marginBottom:"16px",
          }}>Adres dostawy</p>

          {addresses.length === 0 ? (
            <p style={{ fontFamily:"var(--font-jost)", fontSize:"13px", fontWeight:400, color:"var(--text-muted)" }}>
              Brak zapisanych adresów.{" "}
              <a href="/account/addresses"
                style={{ color:"var(--gold)", borderBottom:"1px solid rgba(201,149,106,.3)" }}>
                Dodaj adres
              </a>
            </p>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
              {addresses.map(addr => (
                <label key={addr.id} style={{ display:"flex", alignItems:"flex-start", gap:"12px", cursor:"pointer" }}>
                  <input
                    type="radio" name="address" value={addr.id}
                    checked={selectedAddress === addr.id}
                    onChange={() => setSelectedAddress(addr.id)}
                    style={{ marginTop:"2px", accentColor:"var(--gold)" }}
                  />
                  <span style={{ fontFamily:"var(--font-jost)", fontSize:"13px", fontWeight:400, color:"var(--text-muted)", lineHeight:1.5 }}>
                    <strong style={{ color:"var(--pearl)", fontWeight:500 }}>{addr.label}</strong>
                    {" — "}{addr.fullname}, {addr.street}, {addr.postcode} {addr.city}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* INPOST WEEKEND OPTION */}
        {showWeekend && (
          <div style={{
            padding:"18px 28px", marginBottom:"16px",
            border:"1px solid rgba(201,149,106,.2)",
            background:"rgba(154,107,32,.03)",
          }}>
            <label style={{ display:"flex", alignItems:"center", gap:"12px", cursor:"pointer" }}>
              <input
                type="checkbox"
                checked={weekendDelivery}
                onChange={e => setWeekendDelivery(e.target.checked)}
                style={{ width:"16px", height:"16px", accentColor:"var(--gold)", cursor:"pointer" }}
              />
              <div>
                <span style={{
                  fontFamily:"var(--font-jost)", fontSize:"13px", fontWeight:500,
                  color:"var(--pearl)",
                }}>Dostawa w sobotę — InPost Weekend</span>
                <span style={{
                  display:"block",
                  fontFamily:"var(--font-jost)", fontSize:"11px", fontWeight:400,
                  color:"var(--text-muted)", marginTop:"2px",
                }}>Zamów dziś, odbierz jutro w paczkomacie. Koszt dostawy: <strong style={{ color:"var(--gold)" }}>25 zł</strong></span>
              </div>
            </label>
          </div>
        )}

        {/* PACZKOMAT PICKER for InPost Weekend */}
        {showLocker && (
          <div style={{
            padding:"20px 28px",
            border:"1px solid rgba(201,149,106,.2)",
            borderTop:"none", marginBottom:"16px",
            background:"rgba(154,107,32,.02)",
          }}>
            <p style={{
              fontFamily:"var(--font-cinzel)", fontSize:"8px",
              letterSpacing:".3em", textTransform:"uppercase",
              color:"var(--text-muted)", marginBottom:"12px",
            }}>Wybierz paczkomat InPost Weekend</p>

            {weekendLocker ? (
              <div style={{
                display:"flex", alignItems:"center", justifyContent:"space-between",
                padding:"12px 16px",
                border:"1px solid rgba(154,107,32,.3)",
                background:"rgba(154,107,32,.05)",
              }}>
                <div>
                  <p style={{
                    fontFamily:"var(--font-cinzel)", fontSize:"9px",
                    letterSpacing:".2em", textTransform:"uppercase",
                    color:"var(--gold)", marginBottom:"3px",
                  }}>{weekendLocker.code}</p>
                  <p style={{ fontFamily:"var(--font-jost)", fontSize:"12px", fontWeight:400, color:"var(--text-muted)" }}>
                    {weekendLocker.street}, {weekendLocker.postcode} {weekendLocker.city}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => { setWeekendLocker(null); setLockerQuery(""); }}
                  style={{
                    fontFamily:"var(--font-jost)", fontSize:"10px", letterSpacing:".1em",
                    color:"var(--text-muted)", background:"none", border:"none",
                    cursor:"pointer", transition:"color .2s",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = "var(--gold)")}
                  onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}>
                  Zmień
                </button>
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>

                {/* MAP BUTTON */}
                <button
                  type="button"
                  onClick={() => window.open("https://inpost.pl/znajdz-paczkomat", "_blank", "width=960,height=720,noopener,noreferrer")}
                  style={{
                    display:"flex", alignItems:"center", justifyContent:"center", gap:"10px",
                    padding:"13px 24px", width:"100%",
                    fontFamily:"var(--font-jost)", fontSize:"11px",
                    fontWeight:500, letterSpacing:".18em", textTransform:"uppercase",
                    color:"var(--pearl)",
                    background:"transparent",
                    border:"1px solid rgba(154,107,32,.25)",
                    cursor:"pointer", transition:"border-color .2s, background .2s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor="rgba(154,107,32,.6)"; e.currentTarget.style.background="rgba(154,107,32,.04)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor="rgba(154,107,32,.25)"; e.currentTarget.style.background="transparent"; }}>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M8 1C5.24 1 3 3.24 3 6c0 3.75 5 9 5 9s5-5.25 5-9c0-2.76-2.24-5-5-5z" stroke="var(--gold)" strokeWidth="1.3"/>
                    <circle cx="8" cy="6" r="1.5" stroke="var(--gold)" strokeWidth="1.3"/>
                  </svg>
                  Otwórz mapę paczkomatów InPost
                </button>

                {/* DIVIDER */}
                <div style={{
                  display:"flex", alignItems:"center", gap:"10px",
                  fontFamily:"var(--font-jost)", fontSize:"10px", letterSpacing:".1em",
                  color:"rgba(100,75,50,.45)",
                }}>
                  <div style={{ flex:1, height:"1px", background:"rgba(154,107,32,.1)" }}/>
                  lub wpisz kod paczkomatu
                  <div style={{ flex:1, height:"1px", background:"rgba(154,107,32,.1)" }}/>
                </div>

                <div ref={dropdownRef} style={{ position:"relative" }}>
                <div style={{ position:"relative" }}>
                  <input
                    value={lockerQuery}
                    onChange={e => onLockerSearch(e.target.value)}
                    onFocus={() => lockerResults.length > 0 && setLockerOpen(true)}
                    placeholder="Wpisz kod lub adres paczkomatu (np. WAW123M)"
                    className="input"
                  />
                  {lockerLoading && (
                    <span style={{
                      position:"absolute", right:"14px", top:"50%", transform:"translateY(-50%)",
                      fontFamily:"var(--font-jost)", fontSize:"10px", color:"var(--text-muted)",
                    }}>…</span>
                  )}
                </div>
                {lockerOpen && lockerResults.length > 0 && (
                  <div style={{
                    position:"absolute", top:"calc(100% + 2px)", left:0, right:0, zIndex:100,
                    background:"var(--charcoal)", border:"1px solid rgba(154,107,32,.2)",
                    boxShadow:"0 8px 24px rgba(0,0,0,.12)",
                    maxHeight:"220px", overflowY:"auto",
                  }}>
                    {lockerResults.map(p => (
                      <button key={p.code} type="button" onClick={() => selectLocker(p)}
                        style={{
                          display:"block", width:"100%", textAlign:"left",
                          padding:"11px 16px",
                          borderBottom:"1px solid rgba(154,107,32,.07)",
                          background:"none", border:"none", cursor:"pointer",
                          transition:"background .15s",
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = "rgba(154,107,32,.05)")}
                        onMouseLeave={e => (e.currentTarget.style.background = "none")}>
                        <span style={{
                          fontFamily:"var(--font-cinzel)", fontSize:"9px",
                          letterSpacing:".2em", textTransform:"uppercase",
                          color:"var(--gold)", display:"block", marginBottom:"2px",
                        }}>{p.code}</span>
                        <span style={{
                          fontFamily:"var(--font-jost)", fontSize:"11px", fontWeight:400,
                          color:"var(--text-muted)",
                        }}>{p.street}, {p.postcode} {p.city}</span>
                      </button>
                    ))}
                  </div>
                )}
                {lockerOpen && !lockerLoading && lockerQuery.length >= 2 && lockerResults.length === 0 && (
                  <div style={{
                    position:"absolute", top:"calc(100% + 2px)", left:0, right:0, zIndex:100,
                    background:"var(--charcoal)", border:"1px solid rgba(154,107,32,.15)",
                    padding:"14px 16px",
                    fontFamily:"var(--font-jost)", fontSize:"12px", fontWeight:400,
                    color:"var(--text-muted)",
                  }}>Brak wyników dla &ldquo;{lockerQuery}&rdquo;</div>
                )}
              </div>
              </div>
            )}
          </div>
        )}

        {/* COMMENTS */}
        <div style={{
          padding:"24px 28px",
          border:"1px solid rgba(201,149,106,.1)",
          marginBottom:"20px",
        }}>
          <p style={{
            fontFamily:"var(--font-cinzel)", fontSize:"9px",
            letterSpacing:".3em", textTransform:"uppercase",
            color:"var(--gold)", marginBottom:"12px",
          }}>Informacje dodatkowe</p>
          <textarea
            value={userComments}
            onChange={e => setUserComments(e.target.value)}
            placeholder="Np. proszę o kontakt telefoniczny przed dostawą, specjalne instrukcje..."
            rows={3}
            style={{
              display:"block", width:"100%", resize:"vertical",
              padding:"12px 16px",
              fontFamily:"var(--font-jost)", fontSize:"13px", fontWeight:400,
              color:"var(--pearl)", background:"var(--charcoal)",
              border:"1px solid rgba(201,149,106,.15)",
              outline:"none", lineHeight:1.6,
              transition:"border-color .2s",
            }}
            onFocus={e => (e.currentTarget.style.borderColor = "rgba(201,149,106,.4)")}
            onBlur={e  => (e.currentTarget.style.borderColor = "rgba(201,149,106,.15)")}
          />
        </div>

        {/* PAYMENT METHOD */}
        <div style={{
          padding:"24px 28px",
          border:"1px solid rgba(201,149,106,.1)",
          marginBottom:"20px",
          display:"flex", flexDirection:"column", gap:"16px",
        }}>
          <p style={{
            fontFamily:"var(--font-cinzel)", fontSize:"9px",
            letterSpacing:".3em", textTransform:"uppercase",
            color:"var(--gold)",
          }}>Metoda płatności</p>

          {/* OPTIONS */}
          <div className="mob-stack mob-gap-sm" style={{ display:"flex", gap:"8px", flexWrap:"wrap" }}>
            {([
              { id:"cod",      label:"Za pobraniem" },
              { id:"transfer", label:"Przelew bankowy" },
              { id:"blik",     label:"BLIK" },
            ] as const).map(opt => {
              const active = paymentMethod === opt.id;
              return (
                <button key={opt.id} type="button"
                  onClick={() => setPaymentMethod(opt.id)}
                  style={{
                    padding:"9px 20px",
                    fontFamily:"var(--font-jost)", fontSize:"10px",
                    fontWeight: active ? 500 : 300,
                    letterSpacing:".18em", textTransform:"uppercase",
                    color:      active ? "#F8F4EE"               : "var(--text-muted)",
                    background: active ? "var(--gold)"           : "transparent",
                    border:     active ? "1px solid var(--gold)" : "1px solid rgba(201,149,106,.2)",
                    cursor:"pointer", transition:"all .2s",
                  }}
                  onMouseEnter={e => { if (!active) { e.currentTarget.style.borderColor="rgba(201,149,106,.5)"; e.currentTarget.style.color="var(--pearl)"; }}}
                  onMouseLeave={e => { if (!active) { e.currentTarget.style.borderColor="rgba(201,149,106,.2)"; e.currentTarget.style.color="var(--text-muted)"; }}}>
                  {opt.label}
                </button>
              );
            })}
          </div>

          {/* COD info */}
          {paymentMethod === "cod" && (
            <p style={{
              fontFamily:"var(--font-jost)", fontSize:"12px", fontWeight:400,
              color:"var(--text-muted)", lineHeight:1.6,
              borderLeft:"2px solid rgba(201,149,106,.25)", paddingLeft:"12px",
            }}>
              Płatność gotówką lub kartą przy odbiorze przesyłki.
            </p>
          )}

          {/* Transfer info */}
          {paymentMethod === "transfer" && (
            <div style={{
              padding:"14px 16px",
              background:"rgba(154,107,32,.04)",
              border:"1px solid rgba(154,107,32,.12)",
              display:"flex", flexDirection:"column", gap:"4px",
            }}>
              <p style={{
                fontFamily:"var(--font-cinzel)", fontSize:"8px",
                letterSpacing:".3em", textTransform:"uppercase",
                color:"var(--gold)", marginBottom:"6px",
              }}>Dane do przelewu</p>
              <p style={{ fontFamily:"var(--font-jost)", fontSize:"12px", fontWeight:400, color:"var(--text-muted)", lineHeight:1.7 }}>
                Odbiorca: <strong style={{ color:"var(--pearl)", fontWeight:500 }}>{pt(texts, "company_name", "Cleo Med Sp. z o.o.")}</strong><br/>
                Numer konta: <strong style={{ color:"var(--pearl)", fontWeight:500 }}>{pt(texts, "bank_account_number", "XX XXXX XXXX XXXX XXXX XXXX XXXX")}</strong><br/>
                Bank: <strong style={{ color:"var(--pearl)", fontWeight:500 }}>{pt(texts, "bank_name", "Nazwa banku")}</strong><br/>
                Tytuł: <strong style={{ color:"var(--pearl)", fontWeight:500 }}>numer zamówienia (zostanie podany po złożeniu)</strong>
              </p>
              <p style={{
                marginTop:"12px",
                fontFamily:"var(--font-jost)", fontSize:"11px", fontWeight:500,
                color:"var(--gold)", letterSpacing:".04em",
              }}>⚠ Zamówienie zostanie zrealizowane po zaksięgowaniu wpłaty.</p>
            </div>
          )}

          {/* BLIK */}
          {paymentMethod === "blik" && (
            <div style={{
              padding:"14px 16px",
              background:"rgba(154,107,32,.04)",
              border:"1px solid rgba(154,107,32,.12)",
              display:"flex", flexDirection:"column", gap:"4px",
            }}>
              <p style={{
                fontFamily:"var(--font-cinzel)", fontSize:"8px",
                letterSpacing:".3em", textTransform:"uppercase",
                color:"var(--gold)", marginBottom:"6px",
              }}>BLIK na telefon</p>
              <p style={{ fontFamily:"var(--font-jost)", fontSize:"12px", fontWeight:400, color:"var(--text-muted)", lineHeight:1.7 }}>
                Wyślij przelew BLIK na numer:<br/>
                <strong style={{ fontFamily:"var(--font-cormorant)", fontSize:"22px", fontWeight:400, color:"var(--pearl)", letterSpacing:".05em" }}>
                  {pt(texts, "blik_phone", "+48 XXX XXX XXX")}
                </strong><br/>
                Odbiorca: <strong style={{ color:"var(--pearl)", fontWeight:500 }}>{pt(texts, "blik_recipient", "Cleo Med")}</strong><br/>
                Tytuł: <strong style={{ color:"var(--pearl)", fontWeight:500 }}>numer zamówienia (zostanie podany po złożeniu)</strong>
              </p>
              <p style={{
                marginTop:"12px",
                fontFamily:"var(--font-jost)", fontSize:"11px", fontWeight:500,
                color:"var(--gold)", letterSpacing:".04em",
              }}>⚠ Zamówienie zostanie zrealizowane po zaksięgowaniu wpłaty.</p>
            </div>
          )}
        </div>

        {/* TOTAL + SUBMIT */}
        <div style={{
          display:"flex", alignItems:"center", justifyContent:"space-between",
          padding:"24px 28px",
          border:"1px solid rgba(201,149,106,.1)",
        }}>
          <div>
            <div style={{ display:"flex", flexDirection:"column", gap:"4px", marginBottom:"8px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", gap:"40px" }}>
                <span style={{
                  fontFamily:"var(--font-cinzel)", fontSize:"8px",
                  letterSpacing:".2em", textTransform:"uppercase",
                  color:"var(--text-muted)",
                }}>Produkty</span>
                <span style={{
                  fontFamily:"var(--font-cormorant)", fontSize:"15px",
                  color:"var(--text-muted)",
                }}>{total.toFixed(2)} zł</span>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", gap:"40px" }}>
                <span style={{
                  fontFamily:"var(--font-cinzel)", fontSize:"8px",
                  letterSpacing:".2em", textTransform:"uppercase",
                  color:"var(--text-muted)",
                }}>Dostawa</span>
                <span style={{
                  fontFamily:"var(--font-cormorant)", fontSize:"15px",
                  color:"var(--text-muted)",
                }}>{deliveryPrice.toFixed(2)} zł</span>
              </div>
            </div>
            <p style={{
              fontFamily:"var(--font-cinzel)", fontSize:"9px",
              letterSpacing:".3em", textTransform:"uppercase",
              color:"var(--text-muted)", marginBottom:"4px",
            }}>Łącznie z dostawą</p>
            <p style={{
              fontFamily:"var(--font-cormorant)", fontSize:"36px", fontWeight:400, lineHeight:1,
              color:"var(--gold-light)",
            }}>{(total + deliveryPrice).toFixed(2)} <span style={{ fontSize:"18px", color:"var(--text-muted)" }}>zł</span></p>
          </div>

          <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:"10px" }}>
            {error && (
              <p style={{
                fontFamily:"var(--font-jost)", fontSize:"12px",
                borderLeft:"2px solid rgba(201,149,106,.5)",
                paddingLeft:"10px", color:"var(--gold)",
              }}>{error}</p>
            )}
            <button
              onClick={handleOrder}
              disabled={loading || addresses.length === 0 || !weekendReady}
              className="btn-gold"
              style={{ opacity: (loading || addresses.length === 0 || !weekendReady) ? .5 : 1, cursor: (loading || addresses.length === 0 || !weekendReady) ? "not-allowed" : "pointer" }}>
              {loading ? "Składanie..." : "Złóż zamówienie"}
            </button>
            <p style={{
              fontFamily:"var(--font-jost)", fontSize:"11px", fontWeight:400,
              color: shippingNow ? "var(--gold)" : "rgba(248,244,238,.3)",
              textAlign:"right", lineHeight:1.4,
            }}>
              {shippingNow ? "✓ Wysyłka dzisiaj" : "Wysyłka w następny dzień roboczy"}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
