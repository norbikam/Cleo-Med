"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface Product {
  id: string; name: string; sku?: string;
  price: number; stock: number; images?: string[];
  categoryId?: string; categoryName?: string;
}

const EXCLUDED = ["znieczul", "toksyn"];

function shortName(s: string) {
  const p = s.split("/");
  return p[p.length - 1].trim();
}

export default function InstagramPage() {
  const router = useRouter();
  const [products,   setProducts]   = useState<Product[]>([]);
  const [categories, setCategories] = useState<Record<string, string>>({});
  const [active,     setActive]     = useState("all");
  const [loading,    setLoading]    = useState(true);
  const [gridKey,    setGridKey]    = useState(0);
  const revealRef = useRef<HTMLDivElement>(null);
  const gridRef   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/products/public")
      .then(r => r.json())
      .then(d => {
        const all: Product[] = d.products ?? [];
        const visible = all.filter(p => {
          const cat = (p.categoryName ?? "").toLowerCase();
          return !EXCLUDED.some(ex => cat.includes(ex));
        });
        setProducts(visible);
        setCategories(d.categories ?? {});
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!revealRef.current) return;
    const io = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("visible"); io.unobserve(e.target); } }),
      { threshold: .08 }
    );
    revealRef.current.querySelectorAll(".reveal").forEach(el => io.observe(el));
    return () => io.disconnect();
  }, [products]);

  function changeCategory(id: string) {
    setActive(id);
    setGridKey(k => k + 1);
    setTimeout(() => {
      if (!gridRef.current) return;
      const offset = window.innerWidth < 640 ? 100 : 160;
      const top = gridRef.current.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    }, 50);
  }

  const usedCats = Array.from(new Set(products.map(p => p.categoryId).filter(Boolean))) as string[];

  const catOrder: Record<string, number> = {};
  products.forEach(p => { if (p.categoryId && !(p.categoryId in catOrder)) catOrder[p.categoryId] = Object.keys(catOrder).length; });

  const filtered = products
    .filter(p => active === "all" || p.categoryId === active)
    .sort((a, b) => {
      if (active !== "all") return 0;
      return (catOrder[a.categoryId ?? ""] ?? 999) - (catOrder[b.categoryId ?? ""] ?? 999);
    });

  return (
    <div ref={revealRef} style={{ minHeight:"100vh", background:"var(--obsidian)" }}>

      {/* ── HERO ── */}
      <section style={{ position:"relative", overflow:"hidden" }}>
        <div style={{
          position:"absolute", inset:0, pointerEvents:"none",
          background:"radial-gradient(ellipse at 50% 100%, rgba(154,107,32,.1) 0%, transparent 60%), radial-gradient(ellipse at 80% 10%, rgba(154,107,32,.06) 0%, transparent 50%)",
        }}/>
        <div className="hidden sm:block" style={{
          position:"absolute", top:0, left:"50%", width:"1px", height:"100%",
          background:"linear-gradient(to bottom, transparent, rgba(154,107,32,.18), transparent)",
          pointerEvents:"none",
        }}/>

        <div className="mob-pad mob-pad-y" style={{ maxWidth:"1600px", margin:"0 auto", padding:"80px 60px 100px" }}>
          <p style={{ fontFamily:"var(--font-cinzel)", fontSize:"13px", letterSpacing:".5em", textTransform:"uppercase", color:"var(--gold)", marginBottom:"32px" }}>
            Cleo Med · Medycyna Estetyczna
          </p>
          <h1 style={{ fontFamily:"var(--font-cormorant)", fontSize:"clamp(56px, 8vw, 100px)", fontWeight:400, lineHeight:.95, color:"var(--pearl)", marginBottom:0 }}>
            Katalog<br/>
            <em style={{ fontStyle:"italic", color:"var(--gold)" }}>produktowy</em>
          </h1>
          {!loading && (
            <div style={{ display:"flex", alignItems:"center", gap:"32px", marginTop:"40px" }}>
              <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                <div style={{ width:"5px", height:"5px", borderRadius:"50%", background:"var(--gold)" }}/>
                <span style={{ fontFamily:"var(--font-jost)", fontSize:"13px", fontWeight:400, letterSpacing:".1em", color:"var(--text-muted)" }}>{products.length} produktów</span>
              </div>
              <div style={{ width:"1px", height:"12px", background:"rgba(201,149,106,.2)" }}/>
              <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                <div style={{ width:"5px", height:"5px", borderRadius:"50%", background:"rgba(201,149,106,.3)" }}/>
                <span style={{ fontFamily:"var(--font-jost)", fontSize:"13px", fontWeight:400, letterSpacing:".1em", color:"var(--text-muted)" }}>{usedCats.length} kategorii</span>
              </div>
            </div>
          )}
        </div>
        <div style={{ height:"1px", background:"rgba(201,149,106,.08)" }}/>
      </section>

      {/* ── MARQUEE ── */}
      {!loading && (
        <div style={{ overflow:"hidden", padding:"16px 0", borderBottom:"1px solid rgba(201,149,106,.06)", background:"rgba(154,107,32,.04)" }}>
          <div className="marquee-track">
            {[...usedCats, ...usedCats].map((id, i) => (
              <span key={i} style={{ fontFamily:"var(--font-cinzel)", fontSize:"13px", letterSpacing:".4em", textTransform:"uppercase", color:"rgba(154,107,32,.45)", padding:"0 32px" }}>
                {shortName(categories[id] ?? id)}
                <span style={{ color:"var(--gold)", marginLeft:"16px" }}>✦</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── FILTER TABS ── */}
      <div style={{ position:"sticky", top:0, zIndex:20, background:"rgba(245,241,236,.97)", backdropFilter:"blur(14px)", borderBottom:"1px solid rgba(154,107,32,.1)" }}>
        <div className="mob-pad" style={{ maxWidth:"1600px", margin:"0 auto", padding:"0 60px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:"8px" }}>
          <div style={{ position:"relative", flex:1, minWidth:0 }}>
            <div style={{ display:"flex", overflowX:"auto", scrollbarWidth:"none" }}>
              {[
                { id:"all", label:"Wszystkie", count: products.length },
                ...usedCats.map(id => ({ id, label: shortName(categories[id] ?? id), count: products.filter(p => p.categoryId === id).length })),
              ].map(tab => {
                const isActive = active === tab.id;
                return (
                  <button key={tab.id} onClick={() => changeCategory(tab.id)} style={{
                    flexShrink:0, padding:"16px 12px",
                    fontFamily:"var(--font-jost)", fontSize:"13px",
                    fontWeight: isActive ? 600 : 400, letterSpacing:".12em", textTransform:"uppercase",
                    color: isActive ? "var(--gold-light)" : "var(--text-muted)",
                    background:"none", border:"none",
                    borderBottom: isActive ? "2px solid var(--gold)" : "2px solid transparent",
                    cursor:"pointer", whiteSpace:"nowrap", transition:"color .3s, border-color .3s",
                  }}
                    onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.color = "var(--pearl)"; }}
                    onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.color = "var(--text-muted)"; }}>
                    {tab.label}
                    {isActive && <span style={{ marginLeft:"6px", fontSize:"13px", color:"var(--text-muted)", fontWeight:400 }}>{tab.count}</span>}
                  </button>
                );
              })}
            </div>
            <div style={{ position:"absolute", top:0, right:0, bottom:0, width:"40px", background:"linear-gradient(to right, transparent, rgba(245,241,236,.97))", pointerEvents:"none" }}/>
          </div>
        </div>
      </div>

      {/* ── GRID ── */}
      <div ref={gridRef} className="mob-pad mob-pad-y" style={{ maxWidth:"1600px", margin:"0 auto", padding:"60px 60px 100px" }}>
        {loading ? (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(240px, 1fr))", gap:"2px" }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} style={{ background:"var(--charcoal)", border:"1px solid rgba(201,149,106,.05)", opacity: 1 - i * .08 }}>
                <div style={{ aspectRatio:"1/1", background:"var(--onyx)" }}/>
                <div style={{ padding:"20px" }}>
                  <div style={{ height:"8px", width:"30%", background:"rgba(201,149,106,.08)", marginBottom:"12px" }}/>
                  <div style={{ height:"16px", width:"80%", background:"rgba(201,149,106,.06)", marginBottom:"8px" }}/>
                  <div style={{ height:"12px", width:"55%", background:"rgba(201,149,106,.05)" }}/>
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding:"120px 0", textAlign:"center" }}>
            <p style={{ fontFamily:"var(--font-cormorant)", fontSize:"32px", fontWeight:400, fontStyle:"italic", color:"rgba(201,149,106,.3)" }}>Brak produktów</p>
          </div>
        ) : (
          <div key={gridKey} className="grid-stagger catalog-grid">
            {filtered.map(p => (
              <InstagramCard key={p.id} product={p}
                categoryLabel={p.categoryName ? shortName(p.categoryName) : undefined}
                onOpen={() => router.push(`/instagram/${p.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function InstagramCard({ product: p, categoryLabel, onOpen }: { product: Product; categoryLabel?: string; onOpen: () => void }) {
  const [imgErr, setImgErr] = useState(false);
  const img = !imgErr ? p.images?.[0] : null;
  const outOfStock = p.stock <= 0;

  return (
    <article className="pcard reveal" onClick={onOpen} style={{ display:"flex", flexDirection:"column" }}>
      {/* IMAGE */}
      <div style={{ position:"relative", aspectRatio:"1/1", background:"var(--onyx)", overflow:"hidden" }}>
        {img ? (
          <img
            src={img} alt={p.name}
            onError={() => setImgErr(true)}
            className="card-img"
            style={{ width:"100%", height:"100%", objectFit:"cover", transition:"transform .6s cubic-bezier(.16,1,.3,1)", opacity: outOfStock ? .4 : 1 }}
          />
        ) : (
          <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <svg width="48" height="48" viewBox="0 0 40 40" fill="none" style={{ opacity:.12 }}>
              <rect x="4" y="4" width="32" height="32" stroke="var(--gold)" strokeWidth="1"/>
              <path d="M4 27l9-9 7 7 5-5 11 11" stroke="var(--gold)" strokeWidth="1" strokeLinejoin="round"/>
              <circle cx="13" cy="15" r="2.5" stroke="var(--gold)" strokeWidth="1"/>
            </svg>
          </div>
        )}
        <div className="card-glow" style={{ position:"absolute", inset:0, pointerEvents:"none", opacity:0, transition:"opacity .6s", background:"radial-gradient(ellipse at 50% 100%, rgba(201,149,106,.12), transparent 60%)" }}/>
        {outOfStock && (
          <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(237,232,223,.82)" }}>
            <span style={{ fontFamily:"var(--font-cinzel)", fontSize:"11px", letterSpacing:".35em", textTransform:"uppercase", color:"var(--text-muted)" }}>Niedostępny</span>
          </div>
        )}
        {!outOfStock && p.stock <= 5 && (
          <div style={{ position:"absolute", top:"12px", left:"12px", fontFamily:"var(--font-cinzel)", fontSize:"11px", letterSpacing:".3em", textTransform:"uppercase", padding:"5px 12px", background:"var(--gold)", color:"var(--obsidian)" }}>
            Ostatnie {p.stock}
          </div>
        )}
      </div>

      {/* INFO */}
      <div style={{ padding:"20px", borderTop:"1px solid rgba(201,149,106,.06)", display:"flex", flexDirection:"column", flex:1 }}>
        {categoryLabel && (
          <p style={{ fontFamily:"var(--font-cinzel)", fontSize:"11px", letterSpacing:".3em", textTransform:"uppercase", color:"var(--gold)", marginBottom:"10px" }}>{categoryLabel}</p>
        )}
        <h2 style={{ fontFamily:"var(--font-cormorant)", fontSize:"18px", fontWeight:400, lineHeight:1.25, color:"var(--pearl)", marginBottom:"16px", flex:1, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{p.name}</h2>
        <div style={{ display:"flex", alignItems:"baseline", borderTop:"1px solid rgba(201,149,106,.08)", paddingTop:"14px" }}>
          <span style={{ fontFamily:"var(--font-cormorant)", fontSize:"22px", fontWeight:400, lineHeight:1, color:"var(--gold-light)", letterSpacing:"-.01em" }}>
            {p.price.toFixed(2)}{" "}
            <span style={{ fontSize:"13px", color:"var(--text-muted)", fontWeight:400 }}>zł</span>
          </span>
        </div>
      </div>
    </article>
  );
}
