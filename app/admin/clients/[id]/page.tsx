"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface ClientData {
  id: string; phone: string; name: string|null; email: string|null;
  role: string; active: boolean; freeShipping: boolean; priceDiscountPercent: string|null;
}
interface Phone   { id:string; phone:string; label:string|null; isPrimary:boolean; }
interface Order   { id:string; blOrderId:string; statusName:string|null; orderDate:string|null; total:string|null; products:{name:string;qty:number;price:number}[]; }
interface Code    { id:string; code:string; type:string; value:string|null; maxUses:number|null; usedCount:number; active:boolean; expiresAt:string|null; }
interface Pricing { id:string; productId:string; productName:string|null; customPrice:string; }
interface BLProduct { id:string|number; name:string; price:number; }
interface Address { id:string; label:string; fullname:string; street:string; city:string; postcode:string; phone:string|null; email:string|null; courierType:string|null; lockerCode:string|null; lockerName:string|null; isDefault:boolean; }
interface LockerPoint { code:string; label:string; street:string; postcode:string; city:string; }
interface AddrForm { fullname:string; street:string; city:string; postcode:string; phone:string; email:string; courierType:string; lockerCode:string; lockerName:string; isDefault:boolean; }

const COURIERS = [
  { id:"DPD",       label:"DPD Kurier" },
  { id:"InPost",    label:"InPost Kurier" },
  { id:"Paczkomat", label:"Paczkomat InPost" },
  { id:"DPDPunkt",  label:"DPD Punkt" },
] as const;

const EMPTY_ADDR: AddrForm = { fullname:"", street:"", city:"", postcode:"", phone:"", email:"", courierType:"DPD", lockerCode:"", lockerName:"", isDefault:false };

const Lbl = ({ s }: { s: string }) => (
  <p style={{ fontFamily:"var(--font-cinzel)", fontSize:"11px", letterSpacing:".3em", textTransform:"uppercase", color:"var(--gold)", marginBottom:"6px" }}>{s}</p>
);
const card: React.CSSProperties = { background:"#fff", border:"1px solid rgba(154,107,32,.1)", padding:"24px 28px", marginBottom:"2px" };
const inp:  React.CSSProperties = { height:"40px", padding:"0 14px", fontFamily:"var(--font-jost)", fontSize:"13px", border:"1px solid rgba(154,107,32,.2)", outline:"none", color:"var(--pearl)", background:"var(--obsidian)" };
const gbtn: React.CSSProperties = { padding:"9px 20px", fontFamily:"var(--font-jost)", fontSize:"13px", fontWeight:500, letterSpacing:".18em", textTransform:"uppercase", border:"none", cursor:"pointer", color:"var(--obsidian)", background:"var(--gold)" };
const onF = (e: React.FocusEvent<HTMLInputElement|HTMLSelectElement>) => (e.currentTarget.style.borderColor = "rgba(154,107,32,.5)");
const onB = (e: React.FocusEvent<HTMLInputElement|HTMLSelectElement>) => (e.currentTarget.style.borderColor = "rgba(154,107,32,.2)");

export default function AdminClientPage() {
  const { id } = useParams<{ id: string }>();
  const router  = useRouter();

  const [client,    setClient]    = useState<ClientData|null>(null);
  const [phones,    setPhones]    = useState<Phone[]>([]);
  const [orders,    setOrders]    = useState<Order[]>([]);
  const [codes,     setCodes]     = useState<Code[]>([]);
  const [pricing,   setPricing]   = useState<Pricing[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [expanded,  setExpanded]  = useState<string|null>(null);

  // Info
  const [name,    setName]    = useState("");
  const [email,   setEmail]   = useState("");
  const [saving,  setSaving]  = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  // Phones
  const [newPhone, setNewPhone] = useState("");
  const [newLabel, setNewLabel] = useState("");

  // Codes
  const [codeStr,     setCodeStr]     = useState("");
  const [codeType,    setCodeType]    = useState("percent");
  const [codeValue,   setCodeValue]   = useState("");
  const [codeMaxUses, setCodeMaxUses] = useState("");
  const [codeExpiry,  setCodeExpiry]  = useState("");
  const [codeSaving,  setCodeSaving]  = useState(false);

  // Pricing
  const [allProducts,   setAllProducts]   = useState<BLProduct[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [selectedProd,  setSelectedProd]  = useState<BLProduct|null>(null);
  const [customPrice,   setCustomPrice]   = useState("");
  const [priceSaving,   setPriceSaving]   = useState(false);
  const [showDropdown,  setShowDropdown]  = useState(false);

  // Addresses
  const [editingAddr,   setEditingAddr]   = useState<string|null>(null);
  const [addrForm,      setAddrForm]      = useState<AddrForm>({ ...EMPTY_ADDR });
  const [addrSaving,    setAddrSaving]    = useState(false);
  const [lockerQuery,   setLockerQuery]   = useState("");
  const [lockerResults, setLockerResults] = useState<LockerPoint[]>([]);
  const [lockerLoading, setLockerLoading] = useState(false);
  const [lockerOpen,    setLockerOpen]    = useState(false);
  const lockerTimer   = useRef<number>(0);
  const lockerDropRef = useRef<HTMLDivElement>(null);
  const isPoint = addrForm.courierType === "Paczkomat" || addrForm.courierType === "DPDPunkt";

  // Sync
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState("");

  async function load() {
    const [main, pricingRes] = await Promise.all([
      fetch(`/api/admin/clients/${id}`).then(r => r.json()),
      fetch(`/api/admin/clients/${id}/pricing`).then(r => r.json()),
    ]);
    setClient(main.client);
    setPhones(main.phones ?? []);
    setOrders(main.orders ?? []);
    setCodes(main.codes ?? []);
    setAddresses(main.addresses ?? []);
    setPricing(pricingRes.pricing ?? []);
    setName(main.client?.name ?? "");
    setEmail(main.client?.email ?? "");
  }

  useEffect(() => {
    load();
    // Load product list for pricing
    fetch("/api/products").then(r => r.json()).then(d => setAllProducts(d.products ?? []));
  }, [id]);

  async function patch(body: Record<string, unknown>, msg = "Zapisano.") {
    setSaving(true); setSaveMsg("");
    await fetch(`/api/admin/clients/${id}`, { method:"PATCH", headers:{ "Content-Type":"application/json" }, body:JSON.stringify(body) });
    await load();
    setSaving(false); setSaveMsg(msg);
    setTimeout(() => setSaveMsg(""), 2500);
  }

  async function handleToggle()       { await patch({ active: !client!.active }, client!.active ? "Konto dezaktywowane." : "Konto aktywowane."); }
  async function handleFreeShipping() { await patch({ freeShipping: !client!.freeShipping }, "Zmieniono dostawę."); }
  async function handleSaveInfo()     { await patch({ name, email }, "Zapisano dane."); }

  async function handleResetPassword() {
    if (!confirm("Resetować hasło tego klienta? Będzie musiał ustawić nowe hasło.")) return;
    setSaving(true); setSaveMsg("");
    const res = await fetch(`/api/admin/clients/${id}/reset-password`, { method: "POST" });
    setSaving(false);
    setSaveMsg(res.ok ? "Hasło zresetowane — klient musi ustawić nowe." : "Błąd resetu hasła.");
  }

  async function handleAddPhone(e: React.FormEvent) {
    e.preventDefault();
    await fetch(`/api/admin/clients/${id}/phones`, { method:"POST", headers:{ "Content-Type":"application/json" }, body:JSON.stringify({ phone:newPhone, label:newLabel }) });
    setNewPhone(""); setNewLabel(""); await load();
  }
  async function handleDeletePhone(phoneId: string) {
    if (!confirm("Usunąć numer?")) return;
    await fetch(`/api/admin/clients/${id}/phones`, { method:"DELETE", headers:{ "Content-Type":"application/json" }, body:JSON.stringify({ phoneId }) });
    await load();
  }

  async function handleSync() {
    setSyncing(true); setSyncMsg("");
    const res  = await fetch(`/api/admin/clients/${id}/sync`, { method:"POST" });
    const data = await res.json();
    setSyncMsg(`Zsynchronizowano ${data.synced} zamówień.`);
    setSyncing(false); await load();
  }

  useEffect(() => {
    function close(e: MouseEvent) {
      if (lockerDropRef.current && !lockerDropRef.current.contains(e.target as Node))
        setLockerOpen(false);
    }
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  function onLockerSearch(q: string) {
    setLockerQuery(q);
    setAddrForm(f => ({ ...f, lockerCode:"", lockerName:"" }));
    clearTimeout(lockerTimer.current);
    if (q.length < 2) { setLockerResults([]); setLockerOpen(false); return; }
    lockerTimer.current = window.setTimeout(async () => {
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
    setAddrForm(f => ({ ...f, lockerCode:p.code, lockerName:p.label, street:p.street, postcode:p.postcode, city:p.city }));
    setLockerQuery(p.label || p.code);
    setLockerOpen(false);
  }

  function clearLocker() {
    setAddrForm(f => ({ ...f, lockerCode:"", lockerName:"", street:"", postcode:"", city:"" }));
    setLockerQuery("");
  }

  function startEditAddr(a: Address) {
    setAddrForm({
      fullname: a.fullname, street: a.street, city: a.city, postcode: a.postcode,
      phone: a.phone ?? "", email: a.email ?? "",
      courierType: a.courierType ?? "DPD",
      lockerCode:  a.lockerCode  ?? "",
      lockerName:  a.lockerName  ?? "",
      isDefault: a.isDefault,
    });
    setLockerQuery(a.lockerName ?? "");
    setEditingAddr(a.id);
  }
  function startNewAddr() {
    setAddrForm({ ...EMPTY_ADDR, isDefault: addresses.length === 0 });
    setLockerQuery("");
    setEditingAddr("new");
  }

  async function handleSaveAddr(e: React.FormEvent) {
    e.preventDefault();
    setAddrSaving(true);
    if (editingAddr === "new") {
      await fetch(`/api/admin/clients/${id}/addresses`, {
        method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(addrForm),
      });
    } else {
      await fetch(`/api/admin/clients/${id}/addresses/${editingAddr}`, {
        method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify(addrForm),
      });
    }
    setAddrSaving(false); setEditingAddr(null); await load();
  }

  async function handleDeleteAddr(addressId: string) {
    if (!confirm("Usunąć adres?")) return;
    await fetch(`/api/admin/clients/${id}/addresses/${addressId}`, { method:"DELETE" });
    await load();
  }

  async function handleDeleteOrder(orderId: string) {
    if (!confirm("Usunąć to zamówienie z bazy?")) return;
    await fetch(`/api/admin/clients/${id}/orders/${orderId}`, { method:"DELETE" });
    await load();
  }

  async function handleAddCode(e: React.FormEvent) {
    e.preventDefault();
    setCodeSaving(true);
    await fetch("/api/admin/discount-codes", {
      method:"POST", headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ code:codeStr, type:codeType, value:codeValue||null, clientId:id, maxUses:codeMaxUses||null, expiresAt:codeExpiry||null }),
    });
    setCodeStr(""); setCodeValue(""); setCodeMaxUses(""); setCodeExpiry(""); setCodeSaving(false);
    await load();
  }
  async function handleDeleteCode(codeId: string) {
    if (!confirm("Usunąć kod?")) return;
    await fetch(`/api/admin/discount-codes/${codeId}`, { method:"DELETE" });
    await load();
  }
  async function handleToggleCode(codeId: string, active: boolean) {
    await fetch(`/api/admin/discount-codes/${codeId}`, { method:"PATCH", headers:{ "Content-Type":"application/json" }, body:JSON.stringify({ active:!active }) });
    await load();
  }

  async function handleAddPricing(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedProd || !customPrice) return;
    setPriceSaving(true);
    await fetch(`/api/admin/clients/${id}/pricing`, {
      method:"POST", headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ productId: String(selectedProd.id), productName: selectedProd.name, customPrice: parseFloat(customPrice) }),
    });
    setSelectedProd(null); setCustomPrice(""); setProductSearch(""); setPriceSaving(false);
    await load();
  }
  async function handleDeletePricing(pricingId: string) {
    await fetch(`/api/admin/clients/${id}/pricing/${pricingId}`, { method:"DELETE" });
    await load();
  }

  const filteredProds = productSearch.length >= 2
    ? allProducts.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase())).slice(0, 8)
    : [];

  if (!client) return (
    <div style={{ padding:"80px", textAlign:"center", fontFamily:"var(--font-cormorant)", fontSize:"24px", fontStyle:"italic", color:"rgba(154,107,32,.35)" }}>
      Ładowanie...
    </div>
  );

  return (
    <div style={{ maxWidth:"1200px", margin:"0 auto", padding:"40px 24px 80px" }} className="client-wrap">
      <button onClick={() => router.push("/admin")} style={{ fontFamily:"var(--font-jost)", fontSize:"13px", color:"var(--gold)", background:"none", border:"none", cursor:"pointer", marginBottom:"32px" }}>
        ← Powrót
      </button>

      <div style={{ marginBottom:"36px" }}>
        <p style={{ fontFamily:"var(--font-cinzel)", fontSize:"11px", letterSpacing:".35em", textTransform:"uppercase", color:"var(--gold)", marginBottom:"8px" }}>Klient</p>
        <h1 style={{ fontFamily:"var(--font-cormorant)", fontSize:"40px", fontWeight:400, color:"var(--pearl)", lineHeight:1 }}>
          {client.name ?? client.phone}
        </h1>
        {client.name && <p style={{ fontFamily:"monospace", fontSize:"13px", color:"var(--text-muted)", marginTop:"6px" }}>{client.phone}</p>}
      </div>

      <div className="client-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"2px", alignItems:"start" }}>

        {/* LEFT */}
        <div>
          {/* Status */}
          <div style={card}>
            <Lbl s="Status konta" />
            <div style={{ display:"flex", alignItems:"center", gap:"12px", flexWrap:"wrap", marginTop:"8px" }}>
              <span style={{ fontFamily:"var(--font-cinzel)", fontSize:"11px", letterSpacing:".2em", textTransform:"uppercase", padding:"5px 12px", border:"1px solid", color: client.active ? "var(--gold)" : "var(--text-muted)", borderColor: client.active ? "rgba(154,107,32,.3)" : "rgba(154,107,32,.1)" }}>
                {client.active ? "Aktywny" : "Nieaktywny"}
              </span>
              <button style={{ ...gbtn, background: client.active ? "rgba(180,50,50,.1)" : "var(--gold)", color: client.active ? "rgb(160,40,40)" : "var(--obsidian)" }} onClick={handleToggle} disabled={saving}>
                {client.active ? "Dezaktywuj" : "Aktywuj"}
              </button>
              <button onClick={handleSync} disabled={syncing} style={{ ...gbtn, background:"rgba(154,107,32,.08)", color:"var(--pearl)", border:"1px solid rgba(154,107,32,.2)" }}>
                {syncing ? "Sync..." : "Sync BL"}
              </button>
              <button onClick={handleResetPassword} disabled={saving} style={{ ...gbtn, background:"rgba(180,50,50,.1)", color:"rgb(160,40,40)", border:"1px solid rgba(180,50,50,.2)" }}>
                Resetuj hasło
              </button>
            </div>
            {syncMsg && <p style={{ fontFamily:"var(--font-jost)", fontSize:"14px", color:"var(--gold)", marginTop:"10px" }}>{syncMsg}</p>}
            {saveMsg && <p style={{ fontFamily:"var(--font-jost)", fontSize:"14px", color:"var(--gold)", marginTop:"10px" }}>{saveMsg}</p>}
          </div>

          {/* Info */}
          <div style={card}>
            <Lbl s="Dane klienta" />
            <div style={{ display:"flex", flexDirection:"column", gap:"10px", marginTop:"8px" }}>
              <div>
                <p style={{ fontFamily:"var(--font-jost)", fontSize:"13px", color:"var(--text-muted)", marginBottom:"4px" }}>Nazwa / firma</p>
                <input style={{ ...inp, width:"100%" }} value={name} onChange={e => setName(e.target.value)} onFocus={onF} onBlur={onB}/>
              </div>
              <div>
                <p style={{ fontFamily:"var(--font-jost)", fontSize:"13px", color:"var(--text-muted)", marginBottom:"4px" }}>Email</p>
                <input style={{ ...inp, width:"100%" }} value={email} onChange={e => setEmail(e.target.value)} type="email" onFocus={onF} onBlur={onB}/>
              </div>
              <button style={{ ...gbtn, alignSelf:"flex-start" }} onClick={handleSaveInfo} disabled={saving}>Zapisz dane</button>
            </div>
          </div>

          {/* Warunki handlowe */}
          <div style={card}>
            <Lbl s="Warunki handlowe" />

            {/* Free shipping */}
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 16px", background:"rgba(154,107,32,.04)", border:"1px solid rgba(154,107,32,.08)", marginTop:"12px", marginBottom:"16px" }}>
              <div>
                <p style={{ fontFamily:"var(--font-jost)", fontSize:"13px", fontWeight:500, color:"var(--pearl)" }}>Darmowa dostawa</p>
                <p style={{ fontFamily:"var(--font-jost)", fontSize:"13px", color:"var(--text-muted)", marginTop:"2px" }}>
                  {client.freeShipping ? "Aktywna dla tego klienta" : "Klient płaci za dostawę"}
                </p>
              </div>
              <button onClick={handleFreeShipping} disabled={saving} style={{ width:"48px", height:"26px", borderRadius:"13px", border:"none", cursor:"pointer", background: client.freeShipping ? "var(--gold)" : "rgba(154,107,32,.15)", position:"relative", transition:"background .2s" }}>
                <span style={{ position:"absolute", top:"3px", left: client.freeShipping ? "25px" : "3px", width:"20px", height:"20px", borderRadius:"50%", background:"#fff", transition:"left .2s" }}/>
              </button>
            </div>

            {/* Per-product pricing */}
            <p style={{ fontFamily:"var(--font-jost)", fontSize:"13px", fontWeight:500, color:"var(--pearl)", marginBottom:"4px" }}>Indywidualne ceny produktów</p>
            <p style={{ fontFamily:"var(--font-jost)", fontSize:"13px", color:"var(--text-muted)", marginBottom:"12px" }}>Ustaw konkretną cenę dla wybranego produktu — nadpisuje cenę katalogową.</p>

            {/* Existing overrides */}
            {pricing.length > 0 && (
              <div style={{ marginBottom:"12px", border:"1px solid rgba(154,107,32,.08)" }}>
                {pricing.map(p => (
                  <div key={p.id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"8px 12px", borderBottom:"1px solid rgba(154,107,32,.05)" }}>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ fontFamily:"var(--font-jost)", fontSize:"14px", color:"var(--pearl)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.productName ?? p.productId}</p>
                    </div>
                    <span style={{ fontFamily:"var(--font-cormorant)", fontSize:"16px", color:"var(--gold-light)", margin:"0 16px", flexShrink:0 }}>{parseFloat(p.customPrice).toFixed(2)} zł</span>
                    <button onClick={() => handleDeletePricing(p.id)} style={{ fontFamily:"var(--font-jost)", fontSize:"13px", color:"rgba(180,50,50,.6)", background:"none", border:"none", cursor:"pointer", flexShrink:0 }}>Usuń</button>
                  </div>
                ))}
              </div>
            )}

            {/* Add pricing form */}
            <form onSubmit={handleAddPricing} style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
              <div style={{ position:"relative" }}>
                <input
                  style={{ ...inp, width:"100%" }}
                  placeholder="Wpisz nazwę produktu..."
                  value={selectedProd ? selectedProd.name : productSearch}
                  onChange={e => { setProductSearch(e.target.value); setSelectedProd(null); setShowDropdown(true); }}
                  onFocus={e => { onF(e as React.FocusEvent<HTMLInputElement>); setShowDropdown(true); }}
                  onBlur={e => { onB(e as React.FocusEvent<HTMLInputElement>); setTimeout(() => setShowDropdown(false), 200); }}
                />
                {showDropdown && filteredProds.length > 0 && (
                  <div style={{ position:"absolute", top:"100%", left:0, right:0, background:"#fff", border:"1px solid rgba(154,107,32,.2)", zIndex:10, maxHeight:"240px", overflowY:"auto" }}>
                    {filteredProds.map(p => (
                      <button key={p.id} type="button"
                        onMouseDown={() => { setSelectedProd(p); setProductSearch(""); setCustomPrice(String(p.price)); setShowDropdown(false); }}
                        style={{ width:"100%", textAlign:"left", padding:"10px 14px", background:"none", border:"none", borderBottom:"1px solid rgba(154,107,32,.05)", cursor:"pointer", fontFamily:"var(--font-jost)", fontSize:"14px", color:"var(--pearl)" }}
                        onMouseEnter={e => (e.currentTarget.style.background = "rgba(154,107,32,.04)")}
                        onMouseLeave={e => (e.currentTarget.style.background = "none")}>
                        <span>{p.name}</span>
                        <span style={{ color:"var(--text-muted)", marginLeft:"8px" }}>{p.price.toFixed(2)} zł</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {selectedProd && (
                <div style={{ display:"flex", gap:"8px", alignItems:"center" }}>
                  <div style={{ position:"relative", flex:1 }}>
                    <input style={{ ...inp, width:"100%", paddingRight:"32px" }}
                      type="number" min="0" step="0.01" placeholder="Cena (zł)"
                      value={customPrice} onChange={e => setCustomPrice(e.target.value)}
                      onFocus={onF} onBlur={onB} required/>
                    <span style={{ position:"absolute", right:"12px", top:"50%", transform:"translateY(-50%)", fontFamily:"var(--font-jost)", fontSize:"14px", color:"var(--text-muted)", pointerEvents:"none" }}>zł</span>
                  </div>
                  <button type="submit" disabled={priceSaving} style={gbtn}>{priceSaving ? "..." : "Ustaw cenę"}</button>
                  <button type="button" onClick={() => { setSelectedProd(null); setProductSearch(""); setCustomPrice(""); }} style={{ ...gbtn, background:"rgba(154,107,32,.08)", color:"var(--pearl)" }}>✕</button>
                </div>
              )}
            </form>
          </div>

          {/* Phones */}
          <div style={card}>
            <Lbl s="Numery telefonu" />
            <div style={{ marginTop:"8px" }}>
              <div style={{ padding:"10px 0", borderBottom:"1px solid rgba(154,107,32,.06)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span style={{ fontFamily:"monospace", fontSize:"13px" }}>{client.phone}</span>
                <span style={{ fontFamily:"var(--font-cinzel)", fontSize:"11px", letterSpacing:".2em", textTransform:"uppercase", color:"var(--text-muted)", padding:"3px 8px", border:"1px solid rgba(154,107,32,.15)" }}>Główny</span>
              </div>
              {phones.map(p => (
                <div key={p.id} style={{ padding:"10px 0", borderBottom:"1px solid rgba(154,107,32,.06)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <div>
                    <span style={{ fontFamily:"monospace", fontSize:"13px" }}>{p.phone}</span>
                    {p.label && <span style={{ fontFamily:"var(--font-jost)", fontSize:"13px", color:"var(--text-muted)", marginLeft:"10px" }}>{p.label}</span>}
                  </div>
                  <button onClick={() => handleDeletePhone(p.id)} style={{ fontFamily:"var(--font-jost)", fontSize:"13px", color:"rgba(180,50,50,.6)", background:"none", border:"none", cursor:"pointer" }}>Usuń</button>
                </div>
              ))}
              <form onSubmit={handleAddPhone} className="phone-form" style={{ display:"flex", gap:"8px", marginTop:"12px", flexWrap:"wrap" }}>
                <input style={{ ...inp, flex:"2 1 120px" }} placeholder="48XXXXXXXXX" value={newPhone} onChange={e => setNewPhone(e.target.value)} required onFocus={onF} onBlur={onB}/>
                <input style={{ ...inp, flex:"1 1 80px" }} placeholder="Etykieta" value={newLabel} onChange={e => setNewLabel(e.target.value)} onFocus={onF} onBlur={onB}/>
                <button type="submit" style={gbtn}>Dodaj</button>
              </form>
            </div>
          </div>

          {/* Addresses */}
          <div style={card}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"10px" }}>
              <Lbl s={`Adresy dostawy (${addresses.length})`} />
              {editingAddr !== "new" && (
                <button onClick={startNewAddr} style={{ ...gbtn, fontSize:"11px", padding:"6px 14px" }}>+ Dodaj</button>
              )}
            </div>

            {/* Inline new/edit form */}
            {editingAddr && (
              <form onSubmit={handleSaveAddr} style={{ padding:"16px", background:"rgba(154,107,32,.03)", border:"1px solid rgba(154,107,32,.15)", marginBottom:"10px", display:"flex", flexDirection:"column", gap:"10px" }}>
                <p style={{ fontFamily:"var(--font-cinzel)", fontSize:"11px", letterSpacing:".3em", textTransform:"uppercase", color:"var(--gold)", marginBottom:"2px" }}>
                  {editingAddr === "new" ? "Nowy adres" : "Edytuj adres"}
                </p>

                {/* Imię + telefon */}
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px" }}>
                  <input style={{ ...inp, width:"100%" }} placeholder="Imię i nazwisko / firma *" required
                    value={addrForm.fullname} onChange={e => setAddrForm(f=>({...f,fullname:e.target.value}))} onFocus={onF} onBlur={onB}/>
                  <input style={{ ...inp, width:"100%" }} placeholder="Telefon"
                    value={addrForm.phone} onChange={e => setAddrForm(f=>({...f,phone:e.target.value}))} onFocus={onF} onBlur={onB}/>
                </div>
                <input style={{ ...inp, width:"100%" }} placeholder="Email"
                  value={addrForm.email} onChange={e => setAddrForm(f=>({...f,email:e.target.value}))} onFocus={onF} onBlur={onB}/>

                {/* Kurier */}
                <div>
                  <p style={{ fontFamily:"var(--font-jost)", fontSize:"13px", color:"var(--text-muted)", marginBottom:"6px" }}>Kurier</p>
                  <div style={{ display:"flex", gap:"6px", flexWrap:"wrap" }}>
                    {COURIERS.map(c => {
                      const active = addrForm.courierType === c.id;
                      return (
                        <button key={c.id} type="button"
                          onClick={() => { setAddrForm(f=>({...f,courierType:c.id,lockerCode:"",lockerName:"",street:"",postcode:"",city:""})); setLockerQuery(""); }}
                          style={{ padding:"6px 14px", fontFamily:"var(--font-jost)", fontSize:"13px", fontWeight:active?500:300, letterSpacing:".15em", textTransform:"uppercase", cursor:"pointer", transition:"all .2s", color:active?"#F8F4EE":"var(--text-muted)", background:active?"var(--gold)":"transparent", border:active?"1px solid var(--gold)":"1px solid rgba(154,107,32,.2)" }}>
                          {c.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Paczkomat InPost */}
                {addrForm.courierType === "Paczkomat" && (
                  <div>
                    <p style={{ fontFamily:"var(--font-jost)", fontSize:"13px", color:"var(--text-muted)", marginBottom:"6px" }}>Paczkomat *</p>
                    {addrForm.lockerCode ? (
                      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 14px", border:"1px solid rgba(154,107,32,.3)", background:"rgba(154,107,32,.04)" }}>
                        <div>
                          <p style={{ fontFamily:"var(--font-cinzel)", fontSize:"11px", letterSpacing:".2em", textTransform:"uppercase", color:"var(--gold)" }}>{addrForm.lockerCode}</p>
                          <p style={{ fontFamily:"var(--font-jost)", fontSize:"13px", color:"var(--text-muted)" }}>{addrForm.street}, {addrForm.postcode} {addrForm.city}</p>
                        </div>
                        <button type="button" onClick={clearLocker} style={{ fontFamily:"var(--font-jost)", fontSize:"13px", color:"var(--text-muted)", background:"none", border:"none", cursor:"pointer" }}>Zmień</button>
                      </div>
                    ) : (
                      <div ref={lockerDropRef} style={{ position:"relative" }}>
                        <div style={{ position:"relative" }}>
                          <input style={{ ...inp, width:"100%" }}
                            placeholder="Wpisz kod lub adres paczkomatu..."
                            value={lockerQuery}
                            onChange={e => onLockerSearch(e.target.value)}
                            onFocus={() => lockerResults.length > 0 && setLockerOpen(true)}
                            onBlur={onB}
                          />
                          {lockerLoading && <span style={{ position:"absolute", right:"12px", top:"50%", transform:"translateY(-50%)", fontFamily:"var(--font-jost)", fontSize:"13px", color:"var(--text-muted)" }}>…</span>}
                        </div>
                        {lockerOpen && lockerResults.length > 0 && (
                          <div style={{ position:"absolute", top:"calc(100% + 2px)", left:0, right:0, zIndex:200, background:"var(--obsidian)", border:"1px solid rgba(154,107,32,.2)", maxHeight:"200px", overflowY:"auto" }}>
                            {lockerResults.map(p => (
                              <button key={p.code} type="button" onMouseDown={() => selectLocker(p)}
                                style={{ display:"block", width:"100%", textAlign:"left", padding:"10px 14px", background:"none", border:"none", borderBottom:"1px solid rgba(154,107,32,.06)", cursor:"pointer" }}
                                onMouseEnter={e=>(e.currentTarget.style.background="rgba(154,107,32,.05)")}
                                onMouseLeave={e=>(e.currentTarget.style.background="none")}>
                                <span style={{ fontFamily:"var(--font-cinzel)", fontSize:"11px", letterSpacing:".2em", textTransform:"uppercase", color:"var(--gold)", display:"block" }}>{p.code}</span>
                                <span style={{ fontFamily:"var(--font-jost)", fontSize:"13px", color:"var(--text-muted)" }}>{p.street}, {p.postcode} {p.city}</span>
                              </button>
                            ))}
                          </div>
                        )}
                        {lockerOpen && !lockerLoading && lockerQuery.length >= 2 && lockerResults.length === 0 && (
                          <div style={{ position:"absolute", top:"calc(100% + 2px)", left:0, right:0, zIndex:200, background:"var(--obsidian)", border:"1px solid rgba(154,107,32,.15)", padding:"12px 14px", fontFamily:"var(--font-jost)", fontSize:"14px", color:"var(--text-muted)" }}>
                            Brak wyników dla &ldquo;{lockerQuery}&rdquo;
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* DPD Punkt — ręczny kod */}
                {addrForm.courierType === "DPDPunkt" && (
                  <>
                    <input style={{ ...inp, width:"100%" }} placeholder="Kod punktu DPD *" required
                      value={addrForm.lockerCode} onChange={e => setAddrForm(f=>({...f,lockerCode:e.target.value}))} onFocus={onF} onBlur={onB}/>
                    <input style={{ ...inp, width:"100%" }} placeholder="Ulica i numer *" required
                      value={addrForm.street} onChange={e => setAddrForm(f=>({...f,street:e.target.value}))} onFocus={onF} onBlur={onB}/>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 2fr", gap:"8px" }}>
                      <input style={{ ...inp, width:"100%" }} placeholder="Kod pocztowy *" required
                        value={addrForm.postcode} onChange={e => setAddrForm(f=>({...f,postcode:e.target.value}))} onFocus={onF} onBlur={onB}/>
                      <input style={{ ...inp, width:"100%" }} placeholder="Miasto *" required
                        value={addrForm.city} onChange={e => setAddrForm(f=>({...f,city:e.target.value}))} onFocus={onF} onBlur={onB}/>
                    </div>
                  </>
                )}

                {/* Adres standardowy (kurier DPD / InPost) */}
                {!isPoint && (
                  <>
                    <input style={{ ...inp, width:"100%" }} placeholder="Ulica i numer *" required
                      value={addrForm.street} onChange={e => setAddrForm(f=>({...f,street:e.target.value}))} onFocus={onF} onBlur={onB}/>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 2fr", gap:"8px" }}>
                      <input style={{ ...inp, width:"100%" }} placeholder="Kod pocztowy *" required
                        value={addrForm.postcode} onChange={e => setAddrForm(f=>({...f,postcode:e.target.value}))} onFocus={onF} onBlur={onB}/>
                      <input style={{ ...inp, width:"100%" }} placeholder="Miasto *" required
                        value={addrForm.city} onChange={e => setAddrForm(f=>({...f,city:e.target.value}))} onFocus={onF} onBlur={onB}/>
                    </div>
                  </>
                )}

                <label style={{ display:"flex", alignItems:"center", gap:"8px", cursor:"pointer" }}>
                  <input type="checkbox" checked={addrForm.isDefault} onChange={e => setAddrForm(f=>({...f,isDefault:e.target.checked}))} style={{ accentColor:"var(--gold)" }}/>
                  <span style={{ fontFamily:"var(--font-jost)", fontSize:"14px", color:"var(--text-muted)" }}>Ustaw jako domyślny</span>
                </label>
                <div style={{ display:"flex", gap:"8px" }}>
                  <button type="submit" disabled={addrSaving} style={gbtn}>{addrSaving ? "Zapisuję..." : "Zapisz"}</button>
                  <button type="button" onClick={() => { setEditingAddr(null); setLockerQuery(""); setAddrForm({...EMPTY_ADDR}); }} style={{ ...gbtn, background:"rgba(154,107,32,.08)", color:"var(--pearl)" }}>Anuluj</button>
                </div>
              </form>
            )}

            {/* Address list */}
            {addresses.length === 0 && !editingAddr ? (
              <p style={{ fontFamily:"var(--font-cormorant)", fontSize:"16px", fontStyle:"italic", color:"rgba(154,107,32,.3)", padding:"12px 0" }}>Brak adresów</p>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:"1px" }}>
                {addresses.map(a => (
                  <div key={a.id} style={{
                    padding:"12px 14px",
                    border:"1px solid rgba(154,107,32,.08)",
                    background: editingAddr===a.id ? "rgba(154,107,32,.04)" : a.isDefault ? "rgba(154,107,32,.02)" : "transparent",
                  }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:"8px" }}>
                      <div style={{ flex:1 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"3px", flexWrap:"wrap" }}>
                          <span style={{ fontFamily:"var(--font-jost)", fontSize:"13px", fontWeight:500, color:"var(--pearl)" }}>{a.fullname}</span>
                          {a.isDefault && <span style={{ fontFamily:"var(--font-cinzel)", fontSize:"7px", letterSpacing:".2em", textTransform:"uppercase", color:"var(--gold)", padding:"2px 6px", border:"1px solid rgba(154,107,32,.3)" }}>domyślny</span>}
                          {a.courierType && <span style={{ fontFamily:"var(--font-cinzel)", fontSize:"7px", letterSpacing:".15em", textTransform:"uppercase", color:"var(--text-muted)", padding:"2px 6px", background:"rgba(154,107,32,.06)" }}>{COURIERS.find(c=>c.id===a.courierType)?.label ?? a.courierType}</span>}
                        </div>
                        <p style={{ fontFamily:"var(--font-jost)", fontSize:"14px", fontWeight:400, color:"var(--text-muted)", lineHeight:1.5 }}>
                          {a.lockerCode && <><span style={{ color:"var(--gold)", fontWeight:500 }}>{a.lockerCode}</span> — </>}
                          {a.street}, {a.postcode} {a.city}
                        </p>
                        {(a.phone || a.email) && (
                          <p style={{ fontFamily:"var(--font-jost)", fontSize:"13px", color:"rgba(100,75,50,.45)", marginTop:"2px" }}>
                            {a.phone}{a.phone && a.email ? " · " : ""}{a.email}
                          </p>
                        )}
                      </div>
                      <div style={{ display:"flex", gap:"8px", flexShrink:0 }}>
                        <button onClick={() => startEditAddr(a)} style={{ fontFamily:"var(--font-jost)", fontSize:"13px", color:"var(--gold)", background:"none", border:"none", cursor:"pointer" }}>Edytuj</button>
                        <button onClick={() => handleDeleteAddr(a.id)} style={{ fontFamily:"var(--font-jost)", fontSize:"13px", color:"rgba(180,50,50,.6)", background:"none", border:"none", cursor:"pointer" }}>Usuń</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT */}
        <div>
          {/* Discount codes */}
          <div style={card}>
            <Lbl s="Kody rabatowe" />
            <form onSubmit={handleAddCode} style={{ marginTop:"12px", display:"flex", flexDirection:"column", gap:"8px" }}>
              <div className="code-form-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px" }}>
                <div>
                  <p style={{ fontFamily:"var(--font-jost)", fontSize:"13px", color:"var(--text-muted)", marginBottom:"4px" }}>Kod</p>
                  <input style={{ ...inp, width:"100%" }} placeholder="KLIENT15" value={codeStr} onChange={e => setCodeStr(e.target.value)} required onFocus={onF} onBlur={onB}/>
                </div>
                <div>
                  <p style={{ fontFamily:"var(--font-jost)", fontSize:"13px", color:"var(--text-muted)", marginBottom:"4px" }}>Typ</p>
                  <select style={{ ...inp, width:"100%", appearance:"none" as "none" }} value={codeType} onChange={e => setCodeType(e.target.value)} onFocus={onF} onBlur={onB}>
                    <option value="percent">Procent (%)</option>
                    <option value="fixed">Kwota stała (zł)</option>
                    <option value="free_shipping">Darmowa dostawa</option>
                  </select>
                </div>
                {codeType !== "free_shipping" && (
                  <div>
                    <p style={{ fontFamily:"var(--font-jost)", fontSize:"13px", color:"var(--text-muted)", marginBottom:"4px" }}>{codeType === "percent" ? "Wartość %" : "Kwota (zł)"}</p>
                    <input style={{ ...inp, width:"100%" }} type="number" min="0" placeholder={codeType==="percent"?"15":"50"} value={codeValue} onChange={e => setCodeValue(e.target.value)} onFocus={onF} onBlur={onB}/>
                  </div>
                )}
                <div>
                  <p style={{ fontFamily:"var(--font-jost)", fontSize:"13px", color:"var(--text-muted)", marginBottom:"4px" }}>Limit użyć</p>
                  <input style={{ ...inp, width:"100%" }} type="number" min="1" placeholder="bez limitu" value={codeMaxUses} onChange={e => setCodeMaxUses(e.target.value)} onFocus={onF} onBlur={onB}/>
                </div>
                <div>
                  <p style={{ fontFamily:"var(--font-jost)", fontSize:"13px", color:"var(--text-muted)", marginBottom:"4px" }}>Wygasa</p>
                  <input style={{ ...inp, width:"100%" }} type="date" value={codeExpiry} onChange={e => setCodeExpiry(e.target.value)} onFocus={onF} onBlur={onB}/>
                </div>
              </div>
              <button type="submit" disabled={codeSaving} style={{ ...gbtn, alignSelf:"flex-start" }}>{codeSaving ? "Tworzę..." : "Utwórz kod"}</button>
            </form>
            {codes.length > 0 && (
              <div style={{ marginTop:"16px", borderTop:"1px solid rgba(154,107,32,.08)", paddingTop:"16px" }}>
                {codes.map(c => (
                  <div key={c.id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid rgba(154,107,32,.05)" }}>
                    <div>
                      <span style={{ fontFamily:"monospace", fontSize:"13px", fontWeight:600, color: c.active ? "var(--pearl)" : "var(--text-muted)", textDecoration: c.active ? "none" : "line-through" }}>{c.code}</span>
                      <span style={{ fontFamily:"var(--font-jost)", fontSize:"13px", color:"var(--text-muted)", marginLeft:"10px" }}>
                        {c.type==="percent" ? `${c.value}%` : c.type==="fixed" ? `${c.value} zł` : "darmowa dostawa"}
                        {c.maxUses != null && ` · ${c.usedCount}/${c.maxUses} użyć`}
                        {c.expiresAt && ` · do ${new Date(c.expiresAt).toLocaleDateString("pl-PL")}`}
                      </span>
                    </div>
                    <div style={{ display:"flex", gap:"8px" }}>
                      <button onClick={() => handleToggleCode(c.id, c.active)} style={{ fontFamily:"var(--font-jost)", fontSize:"13px", color:"var(--gold)", background:"none", border:"none", cursor:"pointer" }}>{c.active ? "Wyłącz" : "Włącz"}</button>
                      <button onClick={() => handleDeleteCode(c.id)} style={{ fontFamily:"var(--font-jost)", fontSize:"13px", color:"rgba(180,50,50,.6)", background:"none", border:"none", cursor:"pointer" }}>Usuń</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Orders */}
          <div style={card}>
            <Lbl s={`Zamówienia (${orders.length})`} />
            <div style={{ marginTop:"8px" }}>
              {orders.length === 0 ? (
                <p style={{ fontFamily:"var(--font-cormorant)", fontSize:"18px", fontStyle:"italic", color:"rgba(154,107,32,.3)", padding:"20px 0" }}>Brak zamówień</p>
              ) : (
                <div style={{ display:"flex", flexDirection:"column", gap:"1px" }}>
                  {orders.map(o => (
                    <div key={o.id} style={{ border:"1px solid rgba(154,107,32,.08)", overflow:"hidden" }}>
                      <div style={{ display:"flex", alignItems:"center", background: expanded===o.id ? "rgba(154,107,32,.04)" : "transparent" }}>
                        <button
                          onClick={() => setExpanded(expanded===o.id ? null : o.id)}
                          style={{ flex:1, display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 16px", background:"transparent", border:"none", cursor:"pointer", textAlign:"left" }}>
                          <div style={{ display:"flex", gap:"10px", alignItems:"center" }}>
                            <span style={{ fontFamily:"var(--font-cormorant)", fontSize:"16px", color:"var(--pearl)" }}>#{o.blOrderId}</span>
                            <span style={{ fontFamily:"var(--font-jost)", fontSize:"13px", color:"var(--text-muted)" }}>
                              {o.orderDate ? new Date(o.orderDate).toLocaleDateString("pl-PL") : "—"}
                            </span>
                            {o.statusName && (
                              <span style={{ fontFamily:"var(--font-cinzel)", fontSize:"11px", letterSpacing:".15em", textTransform:"uppercase", padding:"2px 8px", border:"1px solid rgba(154,107,32,.2)", color:"var(--gold)" }}>{o.statusName}</span>
                            )}
                          </div>
                          <span style={{ fontFamily:"var(--font-cormorant)", fontSize:"16px", color:"var(--gold-light)" }}>
                            {o.total ? `${Number(o.total).toFixed(2)} zł` : "—"}
                          </span>
                        </button>
                        <button
                          onClick={() => handleDeleteOrder(o.id)}
                          title="Usuń zamówienie"
                          style={{ padding:"12px 14px", background:"transparent", border:"none", borderLeft:"1px solid rgba(154,107,32,.08)", cursor:"pointer", color:"rgba(180,50,50,.4)", fontSize:"14px", transition:"color .2s" }}
                          onMouseEnter={e => (e.currentTarget.style.color = "rgba(180,50,50,.8)")}
                          onMouseLeave={e => (e.currentTarget.style.color = "rgba(180,50,50,.4)")}>
                          ✕
                        </button>
                      </div>
                      {expanded===o.id && (
                        <div style={{ padding:"12px 16px", borderTop:"1px solid rgba(154,107,32,.06)", background:"rgba(154,107,32,.02)" }}>
                          {(o.products as {name:string;qty:number;price:number}[]).map((p,i) => (
                            <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"4px 0", fontFamily:"var(--font-jost)", fontSize:"14px" }}>
                              <span style={{ color:"var(--pearl)" }}>{p.name}</span>
                              <span style={{ color:"var(--text-muted)" }}>×{p.qty} · {(p.price*p.qty).toFixed(2)} zł</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 639px) {
          .client-wrap { padding: 20px 12px 60px !important; }
          .client-grid { grid-template-columns: 1fr !important; }
          .code-form-grid { grid-template-columns: 1fr !important; }
          .phone-form { flex-direction: column !important; }
          .phone-form input { flex: 1 1 auto !important; }
        }
      `}</style>
    </div>
  );
}
