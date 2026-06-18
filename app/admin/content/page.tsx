"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/* ─── DB helpers ─────────────────────────────────────────────── */
async function apiGet(): Promise<Record<string, string>> {
  const res  = await fetch("/api/admin/page-texts");
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? `Błąd ${res.status}`);
  }
  const data = await res.json();
  const map: Record<string, string> = {};
  for (const t of (data.texts ?? [])) map[t.key] = t.value;
  return map;
}
async function apiSet(key: string, value: string): Promise<void> {
  const res = await fetch("/api/admin/page-texts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key, value }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? `Błąd ${res.status}`);
  }
}

/* ─── Editable text atom ─────────────────────────────────────── */
function E({
  textKey, texts, onSave, style, block, placeholder,
}: {
  textKey: string;
  texts: Record<string, string>;
  onSave: (key: string, val: string) => void;
  style?: React.CSSProperties;
  block?: boolean;
  placeholder?: string;
}) {
  const [editing,   setEditing]   = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [flashed,   setFlashed]   = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const ref = useRef<HTMLSpanElement>(null);
  const val = texts[textKey] ?? placeholder ?? textKey;

  const commit = useCallback(async () => {
    const next = ref.current?.innerText ?? "";
    if (next === val) { setEditing(false); return; }
    setSaving(true); setSaveError(null);
    try {
      await apiSet(textKey, next);
      onSave(textKey, next);
      setEditing(false); setSaving(false);
      setFlashed(true); setTimeout(() => setFlashed(false), 900);
    } catch (err) {
      setSaving(false);
      setSaveError(err instanceof Error ? err.message : String(err));
      setTimeout(() => setSaveError(null), 4000);
    }
  }, [textKey, val, onSave]);

  function handleKey(e: React.KeyboardEvent) {
    if (!block && e.key === "Enter") { e.preventDefault(); commit(); }
    if (e.key === "Escape") { if (ref.current) ref.current.innerText = val; setEditing(false); }
  }

  const Tag  = block ? "div"  : "span";
  const Wrap = block ? "div"  : "span";

  return (
    <Wrap style={{ position:"relative", display: block ? "block" : "inline" }}>
      <Tag
        ref={ref as React.RefObject<HTMLDivElement>}
        contentEditable={editing}
        suppressContentEditableWarning
        onDoubleClick={() => { setEditing(true); setTimeout(() => ref.current?.focus(), 0); }}
        onBlur={commit}
        onKeyDown={handleKey}
        style={{
          ...style,
          display: block ? "block" : "inline",
          outline: editing ? "2px solid rgba(201,149,106,.7)" : "none",
          outlineOffset: "3px",
          borderRadius: "2px",
          cursor: editing ? "text" : "crosshair",
          opacity: saving ? .6 : 1,
          transition: "background .25s, outline .15s",
          background: flashed
            ? "rgba(74,222,128,.18)"
            : editing
            ? "rgba(201,149,106,.07)"
            : "transparent",
          whiteSpace: block ? "pre-wrap" : undefined,
          minWidth: "4px",
        }}
      >
        {val}
      </Tag>
      {editing && (
        <span style={{ position: "absolute", top: "calc(100% + 5px)", left: 0, zIndex: 300, display: "flex", alignItems: "center", gap: "8px", whiteSpace: "nowrap" }}>
          <button
            onMouseDown={(e) => { e.preventDefault(); commit(); }}
            style={{
              padding: "4px 12px",
              fontFamily: "var(--font-jost, sans-serif)", fontSize: "13px",
              fontWeight: 600, letterSpacing: ".12em",
              background: saving ? "rgba(154,107,32,.7)" : "rgba(74,222,128,.9)",
              color: "#0a0806",
              border: "none", borderRadius: "3px", cursor: saving ? "not-allowed" : "pointer",
              boxShadow: "0 2px 10px rgba(0,0,0,.25)",
            }}
            disabled={saving}
          >
            {saving ? "…" : "✓ Zapisz"}
          </button>
          {saveError && (
            <span style={{
              fontFamily: "var(--font-jost, sans-serif)", fontSize: "13px",
              color: "#ff6b6b", background: "rgba(0,0,0,.8)",
              padding: "3px 8px", borderRadius: "3px",
            }}>
              {saveError}
            </span>
          )}
        </span>
      )}
    </Wrap>
  );
}

/* ─── Hint overlay ───────────────────────────────────────────── */
function Hint() {
  return (
    <p style={{
      fontFamily: "var(--font-jost)", fontSize: "13px", color: "rgba(154,107,32,.5)",
      textAlign: "center", padding: "8px 0", userSelect: "none",
      borderTop: "1px dashed rgba(154,107,32,.1)",
    }}>
      Kliknij dwukrotnie na tekst aby go edytować · Enter lub klik poza = zapis · Esc = anuluj
    </p>
  );
}

/* ─── Section nav sidebar ────────────────────────────────────── */
const SECTIONS = [
  { id: "bar",     label: "Pasek ogłoszeń"      },
  { id: "catalog", label: "Katalog — hero"       },
  { id: "login",   label: "Logowanie — panel"    },
  { id: "payment", label: "Dane płatności"       },
  { id: "marquee", label: "Pasek przewijania"    },
];

/* ═══════════════════════════════════════════════════════════════ */
export default function VisualEditorPage() {
  const [texts,     setTexts]     = useState<Record<string, string>>({});
  const [active,    setActive]    = useState("bar");
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    apiGet().then(setTexts).catch(err => setLoadError(err instanceof Error ? err.message : String(err)));
  }, []);

  const save = useCallback((key: string, val: string) => {
    setTexts(prev => ({ ...prev, [key]: val }));
  }, []);

  const T = (key: string, placeholder: string, style?: React.CSSProperties, block?: boolean) => (
    <E key={key} textKey={key} texts={texts} onSave={save} style={style} placeholder={placeholder} block={block} />
  );

  /* ── Preview sections ──────────────────────────────────────── */
  const previews: Record<string, React.ReactNode> = {

    bar: (
      <div>
        <p style={{ fontFamily:"var(--font-cinzel)", fontSize:"11px", letterSpacing:".35em", textTransform:"uppercase", color:"var(--gold)", marginBottom:"16px" }}>PASEK OGŁOSZEŃ (góra strony)</p>
        <div style={{ background:"#0a0a0a", borderBottom:"1px solid rgba(201,149,106,.08)", padding:"10px 24px", display:"flex", alignItems:"center", justifyContent:"center", borderRadius:"2px" }}>
          <p style={{ fontFamily:"var(--font-jost)", fontSize:"14px", fontWeight:400, letterSpacing:".04em", color:"rgba(248,244,238,.9)", margin:0 }}>
            {T("announcement_before", "Zamów w ciągu", { color:"rgba(248,244,238,.9)" })}
            {" "}<span style={{ color:"#C9956A", fontWeight:600 }}>00 godz. 00 min.</span>{" "}
            {T("announcement_after", "a przesyłkę wyślemy jeszcze dzisiaj!", { color:"rgba(248,244,238,.9)" })}
          </p>
        </div>
        <p style={{ fontFamily:"var(--font-jost)", fontSize:"13px", color:"rgba(154,107,32,.4)", marginTop:"12px" }}>
          Edytuj tekst przed i po liczniku. Licznik działa automatycznie.
        </p>
        <Hint />
      </div>
    ),

    catalog: (
      <div>
        <p style={{ fontFamily:"var(--font-cinzel)", fontSize:"11px", letterSpacing:".35em", textTransform:"uppercase", color:"var(--gold)", marginBottom:"16px" }}>HERO — KATALOG PRODUKTOWY</p>
        <div style={{
          background:"linear-gradient(135deg, rgba(10,8,6,1) 0%, rgba(20,15,10,1) 100%)",
          padding:"48px 52px 56px", position:"relative", overflow:"hidden", borderRadius:"2px",
          "--pearl": "#F8F4EE", "--text-muted": "rgba(248,244,238,.55)", "--gold": "#C9956A",
        } as React.CSSProperties}>
          <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at 50% 100%, rgba(154,107,32,.1) 0%, transparent 60%)", pointerEvents:"none" }}/>
          <p style={{ fontFamily:"var(--font-cinzel)", fontSize:"11px", letterSpacing:".5em", textTransform:"uppercase", marginBottom:"24px", position:"relative" }}>
            {T("catalog_eyebrow", "Dystrybucja B2B · Medycyna Estetyczna", { color:"var(--gold)" })}
          </p>
          <h1 style={{ fontFamily:"var(--font-cormorant)", fontSize:"clamp(44px,7vw,72px)", fontWeight:400, lineHeight:.95, color:"var(--pearl)", marginBottom:"0", position:"relative" }}>
            {T("catalog_title_1", "Katalog", { color:"var(--pearl)" })}
            <br/>
            <em style={{ fontStyle:"italic" }}>
              {T("catalog_title_2", "produktowy", { color:"var(--gold)" })}
            </em>
          </h1>
          <p style={{ fontFamily:"var(--font-jost)", fontSize:"13px", color:"var(--text-muted)", marginTop:"28px", position:"relative" }}>
            {T("catalog_subtitle", "Preparaty i urządzenia najwyższej jakości dla gabinetów medycyny estetycznej.", { color:"var(--text-muted)" }, true)}
          </p>
        </div>
        <Hint />
      </div>
    ),

    login: (
      <div>
        <p style={{ fontFamily:"var(--font-cinzel)", fontSize:"11px", letterSpacing:".35em", textTransform:"uppercase", color:"var(--gold)", marginBottom:"16px" }}>LOGOWANIE — LEWA KOLUMNA</p>
        <div style={{
          background:"linear-gradient(135deg, rgba(10,8,6,1) 0%, rgba(20,15,10,1) 100%)",
          padding:"48px 52px", borderRadius:"2px",
          "--pearl": "#F8F4EE", "--text-muted": "rgba(248,244,238,.55)", "--gold": "#C9956A",
        } as React.CSSProperties}>
          <div style={{ marginBottom:"40px" }}>
            <p style={{ fontFamily:"var(--font-cinzel)", fontSize:"15px", fontWeight:500, letterSpacing:".2em", color:"var(--gold)", marginBottom:"4px" }}>CLEOMED</p>
            <p style={{ fontFamily:"var(--font-jost)", fontSize:"13px", letterSpacing:".3em", textTransform:"uppercase", color:"var(--text-muted)" }}>
              {T("login_platform_label", "Platforma B2B", { color:"var(--text-muted)" })}
            </p>
          </div>
          <p style={{ fontFamily:"var(--font-cinzel)", fontSize:"11px", letterSpacing:".5em", textTransform:"uppercase", color:"var(--gold)", marginBottom:"20px" }}>
            {T("login_eyebrow", "Medycyna estetyczna", { color:"var(--gold)" })}
          </p>
          <h1 style={{ fontFamily:"var(--font-cormorant)", fontSize:"clamp(36px,4vw,52px)", fontWeight:400, lineHeight:1.0, color:"var(--pearl)", marginBottom:"20px" }}>
            {T("login_title_1", "Platforma", { color:"var(--pearl)" })}<br/>
            {T("login_title_2", "zamówień dla", { color:"var(--pearl)" })}<br/>
            <em style={{ fontStyle:"italic" }}>
              {T("login_title_3", "profesjonalistów", { color:"var(--gold)" })}
            </em>
          </h1>
          <p style={{ fontFamily:"var(--font-jost)", fontSize:"13px", fontWeight:400, lineHeight:1.8, color:"var(--text-muted)", maxWidth:"300px" }}>
            {T("login_desc", "Najniższe ceny na rynku. Dostawa bezpośrednio do gabinetu.", { color:"var(--text-muted)" }, true)}
          </p>
          <div style={{ height:"1px", background:"rgba(201,149,106,.1)", margin:"28px 0" }}/>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"16px" }}>
            {[
              ["feature_1_title","Produkty premium"],
              ["feature_1_sub",  "Certyfikowane preparaty"],
              ["feature_2_title","Szybka dostawa"],
              ["feature_2_sub",  "Do gabinetu w 24h"],
              ["feature_3_title","Najniższe ceny na rynku"],
              ["feature_3_sub",  "Indywidualne rabaty"],
              ["feature_4_title","Wsparcie klienta"],
              ["feature_4_sub",  "Dedykowany opiekun"],
            ].map(([k, ph], i) => (
              <div key={k}>
                <p style={{ fontFamily:"var(--font-jost)", fontSize: i%2===0?"12px":"11px", fontWeight: i%2===0?500:400, color: i%2===0?"var(--pearl)":"var(--text-muted)", marginBottom: i%2===0?"2px":0 }}>
                  {T(k, ph)}
                </p>
              </div>
            ))}
          </div>
        </div>
        <Hint />
      </div>
    ),

    payment: (
      <div>
        <p style={{ fontFamily:"var(--font-cinzel)", fontSize:"11px", letterSpacing:".35em", textTransform:"uppercase", color:"var(--gold)", marginBottom:"16px" }}>DANE PŁATNOŚCI (koszyk / potwierdzenie)</p>
        <div style={{ display:"flex", flexDirection:"column", gap:"2px" }}>

          {/* Transfer */}
          <div style={{ background:"rgba(10,8,6,1)", border:"1px solid rgba(154,107,32,.18)", padding:"20px 24px", "--pearl": "#F8F4EE", "--text-muted": "rgba(248,244,238,.55)", "--gold": "#C9956A" } as React.CSSProperties}>
            <p style={{ fontFamily:"var(--font-cinzel)", fontSize:"11px", letterSpacing:".3em", textTransform:"uppercase", color:"var(--gold)", marginBottom:"10px" }}>Przelew bankowy</p>
            <div style={{ fontFamily:"var(--font-jost)", fontSize:"13px", fontWeight:400, color:"var(--text-muted)", lineHeight:1.7 }}>
              Odbiorca: <strong style={{ color:"var(--pearl)", fontWeight:500 }}>
                {T("company_name", "Cleo Med Sp. z o.o.", { color:"var(--pearl)", fontWeight:"500" as unknown as number })}
              </strong><br/>
              Numer konta: <strong style={{ color:"var(--pearl)", fontWeight:500 }}>
                {T("bank_account_number", "XX XXXX XXXX XXXX XXXX XXXX XXXX", { color:"var(--pearl)", fontWeight:"500" as unknown as number, fontFamily:"monospace", letterSpacing:".06em" })}
              </strong><br/>
              Bank: <strong style={{ color:"var(--pearl)", fontWeight:500 }}>
                {T("bank_name", "Nazwa banku", { color:"var(--pearl)", fontWeight:"500" as unknown as number })}
              </strong>
            </div>
          </div>

          {/* BLIK */}
          <div style={{ background:"rgba(10,8,6,1)", border:"1px solid rgba(154,107,32,.18)", padding:"20px 24px", "--pearl": "#F8F4EE", "--text-muted": "rgba(248,244,238,.55)", "--gold": "#C9956A" } as React.CSSProperties}>
            <p style={{ fontFamily:"var(--font-cinzel)", fontSize:"11px", letterSpacing:".3em", textTransform:"uppercase", color:"var(--gold)", marginBottom:"10px" }}>BLIK na telefon</p>
            <div style={{ fontFamily:"var(--font-jost)", fontSize:"13px", fontWeight:400, color:"var(--text-muted)", lineHeight:1.7 }}>
              Numer BLIK:{" "}
              <span style={{ fontFamily:"var(--font-cormorant)", fontSize:"22px", fontWeight:400, color:"var(--pearl)" }}>
                {T("blik_phone", "+48 XXX XXX XXX", { fontFamily:"var(--font-cormorant)", fontSize:"22px", fontWeight:"400" as unknown as number, color:"var(--pearl)" })}
              </span>
              <br/>
              Odbiorca: <strong style={{ color:"var(--pearl)", fontWeight:500 }}>
                {T("blik_recipient", "Cleo Med", { color:"var(--pearl)", fontWeight:"500" as unknown as number })}
              </strong>
            </div>
          </div>

        </div>
        <Hint />
      </div>
    ),

    marquee: (
      <div>
        <p style={{ fontFamily:"var(--font-cinzel)", fontSize:"11px", letterSpacing:".35em", textTransform:"uppercase", color:"var(--gold)", marginBottom:"16px" }}>PASEK PRZEWIJANIA (marquee)</p>
        <div style={{ background:"rgba(154,107,32,.06)", padding:"14px 0", overflow:"hidden", whiteSpace:"nowrap", borderRadius:"2px" }}>
          {[0,1,2].map(i => (
            <span key={i} style={{ fontFamily:"var(--font-cinzel)", fontSize:"13px", letterSpacing:".4em", textTransform:"uppercase", color:"var(--gold)", opacity:.5, marginRight:"40px" }}>
              {T(i === 0 ? "marquee_item_1" : i === 1 ? "marquee_item_2" : "marquee_item_3",
                i === 0 ? "Medycyna Estetyczna" : i === 1 ? "Preparaty Premium" : "Dostawa B2B",
                { opacity:"1" as unknown as number }
              )}
              {" "}·
            </span>
          ))}
        </div>
        <p style={{ fontFamily:"var(--font-jost)", fontSize:"13px", color:"rgba(154,107,32,.4)", marginTop:"12px" }}>
          Edytuj tekst każdego elementu paska przewijającego się pod hero.
        </p>
        <Hint />
      </div>
    ),
  };

  return (
    <div style={{ minHeight:"100vh", background:"var(--obsidian)" }}>
      <div style={{ maxWidth:"1100px", margin:"0 auto", padding:"36px 20px 80px" }}>

        {/* Header */}
        <div style={{ marginBottom:"32px" }}>
          <p style={{ fontFamily:"var(--font-cinzel)", fontSize:"11px", letterSpacing:".35em", textTransform:"uppercase", color:"var(--gold)", marginBottom:"10px" }}>Panel administracyjny</p>
          <h1 style={{ fontFamily:"var(--font-cormorant)", fontSize:"clamp(28px,5vw,40px)", fontWeight:400, color:"var(--pearl)", lineHeight:1 }}>
            Edytor treści
          </h1>
          <p style={{ fontFamily:"var(--font-jost)", fontSize:"14px", color:"var(--text-muted)", marginTop:"8px" }}>
            Kliknij dwukrotnie na dowolny tekst w podglądzie — kliknij Zapisz lub wciśnij Enter.
          </p>
          {loadError && (
            <div style={{
              marginTop:"12px", padding:"10px 16px",
              background:"rgba(255,80,80,.1)", border:"1px solid rgba(255,80,80,.3)",
              fontFamily:"var(--font-jost)", fontSize:"14px", color:"#c0392b",
              borderRadius:"2px",
            }}>
              Błąd ładowania danych: <strong>{loadError}</strong>
              {loadError.includes("dostępu") && " — odśwież stronę i zaloguj się ponownie."}
            </div>
          )}
        </div>

        <div className="editor-grid" style={{ display:"grid", gridTemplateColumns:"200px 1fr", gap:"2px", alignItems:"start" }}>

          {/* Sidebar */}
          <nav className="editor-sidebar" style={{ background:"rgba(154,107,32,.04)", border:"1px solid rgba(154,107,32,.18)", padding:"8px 0", position:"sticky", top:"72px" }}>
            {SECTIONS.map(s => (
              <button key={s.id} onClick={() => setActive(s.id)} className="editor-sidebar-btn" style={{
                display:"block", width:"100%", textAlign:"left",
                padding:"12px 16px",
                fontFamily:"var(--font-jost)", fontSize:"13px",
                letterSpacing:".1em", textTransform:"uppercase",
                color: active===s.id ? "var(--gold)" : "rgba(28,21,16,.45)",
                background: active===s.id ? "rgba(154,107,32,.1)" : "none",
                border:"none", borderLeft: active===s.id ? "2px solid var(--gold)" : "2px solid transparent",
                cursor:"pointer", transition:"all .15s",
              }}>
                {s.label}
              </button>
            ))}
          </nav>

          {/* Preview area */}
          <div className="editor-preview" style={{
            background:"rgba(255,255,255,.015)", border:"1px solid rgba(154,107,32,.1)",
            padding:"32px 36px",
          }}>
            {previews[active]}
          </div>

        </div>

        <style>{`
          @media (max-width: 639px) {
            .editor-grid { grid-template-columns: 1fr !important; }
            .editor-sidebar {
              position: static !important;
              display: flex !important;
              flex-direction: row !important;
              overflow-x: auto !important;
              padding: 4px 0 !important;
              gap: 0;
              scrollbar-width: none;
            }
            .editor-sidebar::-webkit-scrollbar { display: none; }
            .editor-sidebar-btn {
              width: auto !important;
              flex-shrink: 0 !important;
              padding: 10px 16px !important;
              border-left: none !important;
              text-align: center !important;
              white-space: nowrap !important;
            }
            .editor-preview { padding: 20px 16px !important; }
          }
        `}</style>
      </div>
    </div>
  );
}
