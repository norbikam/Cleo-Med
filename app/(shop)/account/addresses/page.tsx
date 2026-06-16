"use client";

import { useEffect, useRef, useState } from "react";

interface Address {
  id: string; label: string; fullname: string;
  company: string | null; email: string | null; phone: string | null;
  courierType: string | null;
  lockerCode: string | null; lockerName: string | null;
  street: string; city: string; postcode: string;
  isDefault: boolean;
}

interface LockerPoint {
  code: string; label: string;
  street: string; postcode: string; city: string;
}

const BASE_COURIERS = [
  { id: "DPD",       label: "DPD Kurier",                    isPaczkomat: false },
  { id: "InPost",    label: "InPost Kurier",                 isPaczkomat: false },
  { id: "Paczkomat", label: "Paczkomat InPost",              isPaczkomat: true  },
  { id: "DPDPunkt",  label: "DPD Punkt",                     isPaczkomat: false },
];

const emptyForm = {
  label: "", fullname: "", company: "", email: "", phone: "",
  courierType: "DPD",
  lockerCode: "", lockerName: "",
  street: "", postcode: "", city: "",
  isDefault: false,
};

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label style={{
      display:"block", marginBottom:"7px",
      fontFamily:"var(--font-cinzel)", fontSize:"8px",
      letterSpacing:".28em", textTransform:"uppercase",
      color:"var(--text-muted)",
    }}>{children}</label>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function MapButton({ url, label }: { url: string; label: string }) {
  return (
    <button
      type="button"
      onClick={() => window.open(url, "_blank", "width=960,height=720,noopener,noreferrer")}
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
      {label}
    </button>
  );
}

function Divider({ label }: { label: string }) {
  return (
    <div style={{
      display:"flex", alignItems:"center", gap:"10px",
      fontFamily:"var(--font-jost)", fontSize:"10px", letterSpacing:".1em",
      color:"var(--text-muted)",
    }}>
      <div style={{ flex:1, height:"1px", background:"rgba(154,107,32,.1)" }}/>
      {label}
      <div style={{ flex:1, height:"1px", background:"rgba(154,107,32,.1)" }}/>
    </div>
  );
}

function SelectedLocker({ code, address, onClear }: { code: string; address: string; onClear: () => void }) {
  return (
    <div style={{
      display:"flex", alignItems:"center", justifyContent:"space-between",
      padding:"12px 16px",
      border:"1px solid rgba(154,107,32,.3)",
      background:"rgba(154,107,32,.05)",
    }}>
      <div>
        <p style={{
          fontFamily:"var(--font-cinzel)", fontSize:"9px",
          letterSpacing:".25em", textTransform:"uppercase",
          color:"var(--gold)", marginBottom:"3px",
        }}>{code}</p>
        <p style={{ fontFamily:"var(--font-jost)", fontSize:"12px", fontWeight:400, color:"var(--text-muted)" }}>
          {address}
        </p>
      </div>
      <button type="button" onClick={onClear}
        style={{
          fontFamily:"var(--font-jost)", fontSize:"10px", letterSpacing:".12em",
          color:"var(--text-muted)", background:"none", border:"none", cursor:"pointer", transition:"color .2s",
        }}
        onMouseEnter={e => (e.currentTarget.style.color = "var(--gold)")}
        onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}>
        Zmień
      </button>
    </div>
  );
}

function LockerDropdown({ points, onSelect }: { points: LockerPoint[]; onSelect: (p: LockerPoint) => void }) {
  return (
    <div style={{
      position:"absolute", top:"calc(100% + 2px)", left:0, right:0, zIndex:100,
      background:"var(--charcoal)",
      border:"1px solid rgba(154,107,32,.2)",
      boxShadow:"0 8px 24px rgba(0,0,0,.12)",
      maxHeight:"240px", overflowY:"auto",
    }}>
      {points.map(p => (
        <button
          key={p.code} type="button"
          onClick={() => onSelect(p)}
          style={{
            display:"block", width:"100%", textAlign:"left",
            padding:"11px 16px",
            borderBottom:"1px solid rgba(154,107,32,.07)",
            background:"none", border:"none",
            cursor:"pointer", transition:"background .15s",
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
  );
}

export default function AddressesPage() {
  const COURIERS = BASE_COURIERS;

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [form,      setForm]      = useState({ ...emptyForm });
  const [editId,    setEditId]    = useState<string | null>(null);
  const [showForm,  setShowForm]  = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [message,   setMessage]   = useState<{ type:"ok"|"err"; text:string } | null>(null);

  /* paczkomat search */
  const [lockerQuery,   setLockerQuery]   = useState("");
  const [lockerResults, setLockerResults] = useState<LockerPoint[]>([]);
  const [lockerLoading, setLockerLoading] = useState(false);
  const [lockerOpen,    setLockerOpen]    = useState(false);
  const searchRef   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  async function loadAddresses() {
    const res  = await fetch("/api/addresses");
    const data = await res.json();
    setAddresses(data.addresses ?? []);
  }
  useEffect(() => { loadAddresses(); }, []);

  /* close dropdown on outside click */
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setLockerOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  function set(field: string, value: string | boolean) {
    setForm(f => ({ ...f, [field]: value }));
  }

  /* search paczkomat */
  function onLockerSearch(q: string) {
    setLockerQuery(q);
    if (searchRef.current) clearTimeout(searchRef.current);
    if (q.length < 2) { setLockerResults([]); setLockerOpen(false); return; }
    searchRef.current = setTimeout(async () => {
      setLockerLoading(true);
      try {
        const res  = await fetch(`/api/inpost-points?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        setLockerResults(data.points ?? []);
        setLockerOpen(true);
      } finally {
        setLockerLoading(false);
      }
    }, 350);
  }

  function selectLocker(p: LockerPoint) {
    setForm(f => ({ ...f,
      lockerCode: p.code,
      lockerName: p.label,
      street:     p.street,
      postcode:   p.postcode,
      city:       p.city,
    }));
    setLockerQuery(p.label);
    setLockerOpen(false);
  }

  function clearLocker() {
    setForm(f => ({ ...f, lockerCode:"", lockerName:"", street:"", postcode:"", city:"" }));
    setLockerQuery("");
  }

  const isLocker = form.courierType === "Paczkomat" || form.courierType === "DPDPunkt";

  function startEdit(addr: Address) {
    setEditId(addr.id);
    setForm({
      label:       addr.label,
      fullname:    addr.fullname,
      company:     addr.company    ?? "",
      email:       addr.email      ?? "",
      phone:       addr.phone      ?? "",
      courierType: addr.courierType ?? "DPD",
      lockerCode:  addr.lockerCode  ?? "",
      lockerName:  addr.lockerName  ?? "",
      street:      addr.street,
      city:        addr.city,
      postcode:    addr.postcode,
      isDefault:   addr.isDefault,
    });
    setLockerQuery(addr.lockerName ?? "");
    setShowForm(true);
  }

  function startNew() {
    setEditId(null);
    setForm({ ...emptyForm });
    setLockerQuery("");
    setShowForm(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (isLocker && !form.lockerCode) {
      setMessage({ type:"err", text:"Wybierz punkt z listy." });
      return;
    }
    setSaving(true); setMessage(null);
    const url    = editId ? `/api/addresses/${editId}` : "/api/addresses";
    const method = editId ? "PUT" : "POST";
    const res    = await fetch(url, {
      method,
      headers: { "Content-Type":"application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setMessage({ type:"ok", text:"Adres zapisany." });
      setShowForm(false); setEditId(null);
      await loadAddresses();
    } else {
      const data = await res.json();
      setMessage({ type:"err", text: data.error ?? "Błąd zapisu." });
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Usunąć ten adres?")) return;
    await fetch(`/api/addresses/${id}`, { method:"DELETE" });
    await loadAddresses();
  }

  const courierLabel = (ct: string | null) =>
    COURIERS.find(c => c.id === ct)?.label ?? ct ?? "—";

  return (
    <div style={{ paddingTop:"108px", minHeight:"100vh", background:"var(--obsidian)" }}>
      <div style={{ maxWidth:"680px", margin:"0 auto", padding:"60px 24px 100px" }}>

        {/* HEADER */}
        <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", marginBottom:"48px" }}>
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
            }}>Adresy<br/><em style={{ fontStyle:"italic", color:"var(--gold)" }}>dostawy</em></h1>
          </div>
          {!showForm && (
            <button onClick={startNew} className="btn-gold">+ Dodaj adres</button>
          )}
        </div>

        <div style={{ height:"1px", background:"rgba(154,107,32,.12)", marginBottom:"32px" }}/>

        {/* MESSAGE */}
        {message && (
          <div style={{
            marginBottom:"20px", padding:"14px 18px",
            fontFamily:"var(--font-jost)", fontSize:"12px", fontWeight:400,
            borderLeft:`2px solid ${message.type === "ok" ? "rgba(74,222,128,.6)" : "rgba(154,107,32,.6)"}`,
            background: message.type === "ok" ? "rgba(74,222,128,.06)" : "rgba(154,107,32,.06)",
            color: message.type === "ok" ? "#16a34a" : "var(--gold)",
          }}>{message.text}</div>
        )}

        {/* FORM */}
        {showForm && (
          <form onSubmit={handleSave} style={{
            padding:"32px 28px", marginBottom:"28px",
            border:"1px solid rgba(154,107,32,.2)",
            background:"var(--charcoal)",
            display:"flex", flexDirection:"column", gap:"20px",
          }}>
            <p style={{
              fontFamily:"var(--font-cinzel)", fontSize:"10px",
              letterSpacing:".4em", textTransform:"uppercase",
              color:"var(--gold)", marginBottom:"4px",
            }}>{editId ? "Edytuj adres" : "Nowy adres dostawy"}</p>

            {/* ROW: Imię Nazwisko + Firma */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"16px" }}>
              <Field label="Imię i Nazwisko *">
                <input required value={form.fullname}
                  onChange={e => set("fullname", e.target.value)}
                  placeholder="Jan Kowalski" className="input"/>
              </Field>
              <Field label="Firma (opcjonalne)">
                <input value={form.company}
                  onChange={e => set("company", e.target.value)}
                  placeholder="Gabinet Beauty Spa" className="input"/>
              </Field>
            </div>

            {/* ROW: Email + Telefon */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"16px" }}>
              <Field label="Adres e-mail *">
                <input required type="email" value={form.email}
                  onChange={e => set("email", e.target.value)}
                  placeholder="jan@gabinet.pl" className="input"/>
              </Field>
              <Field label="Nr telefonu *">
                <input required value={form.phone}
                  onChange={e => set("phone", e.target.value)}
                  placeholder="+48 500 000 000" className="input"/>
              </Field>
            </div>

            {/* KURIER */}
            <div>
              <Label>Preferowany kurier *</Label>
              <div style={{ display:"flex", gap:"8px", flexWrap:"wrap" }}>
                {COURIERS.map(c => {
                  const active = form.courierType === c.id;
                  return (
                    <button
                      key={c.id} type="button"
                      onClick={() => { set("courierType", c.id); clearLocker(); }}
                      style={{
                        padding:"9px 18px",
                        fontFamily:"var(--font-jost)", fontSize:"10px",
                        fontWeight: active ? 500 : 300,
                        letterSpacing:".18em", textTransform:"uppercase",
                        color:      active ? "#F8F4EE"                   : "var(--text-muted)",
                        background: active ? "var(--gold)"               : "transparent",
                        border:     active ? "1px solid var(--gold)"     : "1px solid rgba(154,107,32,.2)",
                        cursor:"pointer", transition:"all .2s",
                      }}
                      onMouseEnter={e => { if (!active) { (e.currentTarget.style.borderColor = "rgba(154,107,32,.5)"); (e.currentTarget.style.color = "var(--pearl)"); } }}
                      onMouseLeave={e => { if (!active) { (e.currentTarget.style.borderColor = "rgba(154,107,32,.2)"); (e.currentTarget.style.color = "var(--text-muted)"); } }}>
                      {c.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* PACZKOMAT SEARCH */}
            {form.courierType === "Paczkomat" && (
              <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>

                {/* map button */}
                <MapButton
                  url="https://inpost.pl/znajdz-paczkomat"
                  label="Otwórz mapę paczkoматów InPost"
                />

                <Divider label="lub wpisz kod paczkomatu" />

                <div>
                  <Label>Paczkomat *</Label>
                  {form.lockerCode ? (
                    <SelectedLocker
                      code={form.lockerCode}
                      address={`${form.street}, ${form.postcode} ${form.city}`}
                      onClear={clearLocker}
                    />
                  ) : (
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
                        <LockerDropdown points={lockerResults} onSelect={selectLocker} />
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
                  )}
                </div>

              </div>
            )}

            {/* DPD PUNKT */}
            {form.courierType === "DPDPunkt" && (
              <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>

                <MapButton
                  url="https://www.dpd.com/pl/pl/dpd-pickup/znajdz-punkt-dpd-pickup/"
                  label="Otwórz mapę punktów DPD Pickup"
                />

                <Divider label="lub wpisz kod punktu DPD" />

                <div>
                  <Label>Kod punktu DPD *</Label>
                  <input
                    required value={form.lockerCode}
                    onChange={e => set("lockerCode", e.target.value)}
                    placeholder="np. KRA-001"
                    className="input"
                  />
                </div>

                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"16px" }}>
                  <Field label="Ulica i numer *">
                    <input required value={form.street}
                      onChange={e => set("street", e.target.value)}
                      placeholder="ul. Marszałkowska 1" className="input"/>
                  </Field>
                  <Field label="Kod pocztowy *">
                    <input required value={form.postcode}
                      onChange={e => set("postcode", e.target.value)}
                      placeholder="00-001" className="input"/>
                  </Field>
                </div>
                <Field label="Miasto *">
                  <input required value={form.city}
                    onChange={e => set("city", e.target.value)}
                    placeholder="Warszawa" className="input"/>
                </Field>

              </div>
            )}

            {/* STANDARD ADDRESS (DPD / InPost kurier) */}
            {(form.courierType === "DPD" || form.courierType === "InPost") && (
              <div style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
                <Field label="Adres (ulica i numer) *">
                  <input required value={form.street}
                    onChange={e => set("street", e.target.value)}
                    placeholder="ul. Marszałkowska 1" className="input"/>
                </Field>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 2fr", gap:"16px" }}>
                  <Field label="Kod pocztowy *">
                    <input required value={form.postcode}
                      onChange={e => set("postcode", e.target.value)}
                      placeholder="00-001" className="input"/>
                  </Field>
                  <Field label="Miasto *">
                    <input required value={form.city}
                      onChange={e => set("city", e.target.value)}
                      placeholder="Warszawa" className="input"/>
                  </Field>
                </div>
              </div>
            )}

            {/* ETYKIETA (optional) */}
            <Field label="Etykieta (opcjonalne)">
              <input value={form.label}
                onChange={e => set("label", e.target.value)}
                placeholder="np. Gabinet Warszawa" className="input"/>
            </Field>

            {/* DEFAULT */}
            <label style={{ display:"flex", alignItems:"center", gap:"10px", cursor:"pointer" }}>
              <input type="checkbox" checked={form.isDefault}
                onChange={e => set("isDefault", e.target.checked)}
                style={{ accentColor:"var(--gold)", width:"14px", height:"14px" }}/>
              <span style={{
                fontFamily:"var(--font-jost)", fontSize:"12px", fontWeight:400,
                color:"var(--text-muted)",
              }}>Ustaw jako domyślny adres dostawy</span>
            </label>

            <div style={{ display:"flex", gap:"10px", paddingTop:"4px" }}>
              <button type="submit" disabled={saving} className="btn-gold"
                style={{ opacity: saving ? .6 : 1 }}>
                {saving ? "Zapisywanie..." : "Zapisz adres"}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditId(null); }} className="btn-outline">
                Anuluj
              </button>
            </div>
          </form>
        )}

        {/* ADDRESS LIST */}
        {addresses.length === 0 && !showForm ? (
          <p style={{
            fontFamily:"var(--font-cormorant)", fontSize:"24px",
            fontStyle:"italic", color:"rgba(154,107,32,.3)",
            textAlign:"center", padding:"60px 0",
          }}>Brak adresów dostawy</p>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:"2px" }}>
            {addresses.map(addr => (
              <div key={addr.id} style={{
                padding:"20px 24px",
                border:"1px solid rgba(154,107,32,.1)",
                background:"var(--charcoal)",
                display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:"16px",
              }}>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"6px" }}>
                    <span style={{
                      fontFamily:"var(--font-cormorant)", fontSize:"18px", fontWeight:400,
                      color:"var(--pearl)",
                    }}>{addr.label}</span>
                    {addr.isDefault && (
                      <span style={{
                        fontFamily:"var(--font-cinzel)", fontSize:"7px",
                        letterSpacing:".25em", textTransform:"uppercase",
                        padding:"3px 8px",
                        border:"1px solid rgba(154,107,32,.3)",
                        color:"var(--gold)",
                      }}>Domyślny</span>
                    )}
                    {addr.courierType && (
                      <span style={{
                        fontFamily:"var(--font-cinzel)", fontSize:"7px",
                        letterSpacing:".2em", textTransform:"uppercase",
                        padding:"3px 8px",
                        background:"rgba(154,107,32,.06)",
                        color:"var(--text-muted)",
                      }}>{courierLabel(addr.courierType)}</span>
                    )}
                  </div>
                  <p style={{
                    fontFamily:"var(--font-jost)", fontSize:"13px", fontWeight:400,
                    color:"var(--text-muted)", lineHeight:1.65,
                  }}>
                    {addr.fullname}
                    {addr.company && <><br/>{addr.company}</>}
                    {addr.email   && <><br/>{addr.email}</>}
                    {addr.phone   && <><br/>{addr.phone}</>}
                    <br/>
                    {addr.lockerCode
                      ? <><span style={{ color:"var(--gold)", fontWeight:400 }}>{addr.lockerCode}</span> — </>
                      : null}
                    {addr.street}, {addr.postcode} {addr.city}
                  </p>
                </div>

                <div style={{ display:"flex", gap:"12px", flexShrink:0 }}>
                  <button onClick={() => startEdit(addr)}
                    style={{
                      fontFamily:"var(--font-jost)", fontSize:"10px",
                      letterSpacing:".15em", textTransform:"uppercase",
                      color:"var(--gold)", background:"none", border:"none",
                      cursor:"pointer", transition:"color .2s",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = "var(--gold-light)")}
                    onMouseLeave={e => (e.currentTarget.style.color = "var(--gold)")}>
                    Edytuj
                  </button>
                  <button onClick={() => handleDelete(addr.id)}
                    style={{
                      fontFamily:"var(--font-jost)", fontSize:"10px",
                      letterSpacing:".15em", textTransform:"uppercase",
                      color:"rgba(100,75,50,.4)", background:"none", border:"none",
                      cursor:"pointer", transition:"color .2s",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = "rgba(154,107,32,.7)")}
                    onMouseLeave={e => (e.currentTarget.style.color = "rgba(100,75,50,.4)")}>
                    Usuń
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
