"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart/context";
import { usePageTexts, pt } from "@/lib/hooks/use-page-texts";

interface Product {
  id: string; name: string; sku?: string;
  price: number; stock: number; images?: string[];
  categoryId?: string; categoryName?: string;
}

function shortName(s: string) {
  const p = s.split("/");
  return p[p.length - 1].trim();
}

export default function CatalogPage() {
  const texts = usePageTexts();
  const [products,   setProducts]   = useState<Product[]>([]);
  const [categories, setCategories] = useState<Record<string, string>>({});
  const [active,     setActive]     = useState("all");
  const [loading,          setLoading]          = useState(true);
  const [error,            setError]            = useState<string | null>(null);
  const [gridKey,          setGridKey]          = useState(0);
  const [showUnavailable,  setShowUnavailable]  = useState(false);
  const revealRef = useRef<HTMLDivElement>(null);
  const gridRef   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/products")
      .then(r => r.json())
      .then(d => {
        if (d.error) setError(d.error);
        setProducts(d.products ?? []);
        setCategories(d.categories ?? {});
      })
      .catch(e => setError(String(e)))
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

  // category order = order of first appearance in the API response (matches BL ordering)
  const catOrder: Record<string, number> = {};
  products.forEach(p => { if (p.categoryId && !(p.categoryId in catOrder)) catOrder[p.categoryId] = Object.keys(catOrder).length; });

  const filtered = products
    .filter(p => (active === "all" || p.categoryId === active) && (showUnavailable || p.stock > 0))
    .sort((a, b) => {
      if (active !== "all") return 0;
      return (catOrder[a.categoryId ?? ""] ?? 999) - (catOrder[b.categoryId ?? ""] ?? 999);
    });

  return (
    <div ref={revealRef} style={{ minHeight:"100vh", background:"var(--obsidian)" }}>

      {/* ── HERO ── */}
      <section style={{ position:"relative", paddingTop:"108px", overflow:"hidden" }}>
        {/* bg gradient */}
        <div style={{
          position:"absolute", inset:0, pointerEvents:"none",
          background:"radial-gradient(ellipse at 50% 100%, rgba(154,107,32,.1) 0%, transparent 60%), radial-gradient(ellipse at 80% 10%, rgba(154,107,32,.06) 0%, transparent 50%)",
        }}/>
        {/* thin vertical line */}
        <div className="hidden sm:block" style={{
          position:"absolute", top:0, left:"50%", width:"1px", height:"100%",
          background:"linear-gradient(to bottom, transparent, rgba(154,107,32,.18), transparent)",
          pointerEvents:"none",
        }}/>

        <div className="mob-pad mob-pad-y" style={{ maxWidth:"1600px", margin:"0 auto", padding:"80px 60px 100px" }}>
          <p className="animate-fadeUp" style={{
            fontFamily:"var(--font-cinzel)", fontSize:"13px",
            letterSpacing:".5em", textTransform:"uppercase",
            color:"var(--gold)", marginBottom:"32px",
            animationDelay:".2s",
          }}>
            {pt(texts, "catalog_eyebrow", "Dystrybucja B2B · Medycyna Estetyczna")}
          </p>

          <h1 className="animate-fadeUp" style={{
            fontFamily:"var(--font-cormorant)",
            fontSize:"clamp(56px, 8vw, 100px)",
            fontWeight:400, lineHeight:.95,
            color:"var(--pearl)",
            marginBottom:"0",
            animationDelay:".35s",
          }}>
            {pt(texts, "catalog_title_1", "Katalog")}<br/>
            <em style={{ fontStyle:"italic", color:"var(--gold)" }}>{pt(texts, "catalog_title_2", "produktowy")}</em>
          </h1>

          <p className="animate-fadeUp" style={{
            fontFamily:"var(--font-jost)", fontSize:"14px", fontWeight:400,
            color:"var(--text-muted)", lineHeight:1.8,
            maxWidth:"420px", marginTop:"28px",
            animationDelay:".45s",
          }}>
            {pt(texts, "catalog_subtitle", "Preparaty i urządzenia najwyższej jakości dla gabinetów medycyny estetycznej.")}
          </p>

          {!loading && (
            <div className="animate-fadeUp" style={{
              display:"flex", alignItems:"center", gap:"32px", marginTop:"40px",
              animationDelay:".5s",
            }}>
              <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                <div style={{ width:"5px", height:"5px", borderRadius:"50%", background:"var(--gold)" }}/>
                <span style={{
                  fontFamily:"var(--font-jost)", fontSize:"13px",
                  fontWeight:400, letterSpacing:".1em",
                  color:"var(--text-muted)",
                }}>
                  {products.length} produktów
                </span>
              </div>
              <div style={{ width:"1px", height:"12px", background:"rgba(201,149,106,.2)" }}/>
              <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                <div style={{ width:"5px", height:"5px", borderRadius:"50%", background:"rgba(201,149,106,.3)" }}/>
                <span style={{
                  fontFamily:"var(--font-jost)", fontSize:"13px",
                  fontWeight:400, letterSpacing:".1em",
                  color:"var(--text-muted)",
                }}>
                  {usedCats.length} kategorii
                </span>
              </div>
            </div>
          )}
        </div>

        <div style={{ height:"1px", background:"rgba(201,149,106,.08)" }}/>
      </section>

      {/* ── MARQUEE ── */}
      {!loading && (
        <div style={{
          overflow:"hidden", padding:"16px 0",
          borderBottom:"1px solid rgba(201,149,106,.06)",
          background:"rgba(154,107,32,.04)",
        }}>
          <div className="marquee-track">
            {[...usedCats, ...usedCats].map((id, i) => (
              <span key={i} style={{
                fontFamily:"var(--font-cinzel)", fontSize:"13px",
                letterSpacing:".4em", textTransform:"uppercase",
                color:"rgba(154,107,32,.45)", padding:"0 32px",
              }}>
                {shortName(categories[id] ?? id)}
                <span style={{ color:"var(--gold)", marginLeft:"16px" }}>✦</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── FILTER TABS ── */}
      <div style={{
        position:"sticky", top:"var(--nav-bottom, 108px)", zIndex:20,
        background:"rgba(245,241,236,.97)", backdropFilter:"blur(14px)",
        borderBottom:"1px solid rgba(154,107,32,.1)",
      }}>
        <div className="mob-pad" style={{
          maxWidth:"1600px", margin:"0 auto", padding:"0 60px",
          display:"flex", alignItems:"center", justifyContent:"space-between",
          gap:"8px",
        }}>
          <div style={{ position:"relative", flex:1, minWidth:0 }}>
            <div style={{ display:"flex", overflowX:"auto", scrollbarWidth:"none", flex:1, minWidth:0 }}>
            {[
              { id:"all", label:"Wszystkie", count: products.length },
              ...usedCats.map(id => ({ id, label: shortName(categories[id] ?? id), count: products.filter(p => p.categoryId === id).length })),
            ].map(tab => {
              const isActive = active === tab.id;
              return (
                <button key={tab.id}
                  onClick={() => changeCategory(tab.id)}
                  style={{
                    flexShrink:0,
                    padding:"16px 12px",
                    fontFamily:"var(--font-jost)", fontSize:"13px",
                    fontWeight: isActive ? 600 : 400,
                    letterSpacing:".12em", textTransform:"uppercase",
                    color: isActive ? "var(--gold-light)" : "var(--text-muted)",
                    background:"none", border:"none",
                    borderBottom: isActive ? "2px solid var(--gold)" : "2px solid transparent",
                    cursor:"pointer", whiteSpace:"nowrap",
                    transition:"color .3s, border-color .3s",
                  }}
                  onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.color = "var(--pearl)"; }}
                  onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.color = "var(--text-muted)"; }}>
                  {tab.label}
                  {isActive && (
                    <span style={{ marginLeft:"6px", fontSize:"13px", color:"var(--text-muted)", fontWeight:400 }}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
            </div>
            {/* fade indicator — more tabs on the right */}
            <div style={{
              position:"absolute", top:0, right:0, bottom:0, width:"40px",
              background:"linear-gradient(to right, transparent, rgba(245,241,236,.97))",
              pointerEvents:"none",
            }}/>
          </div>

          {/* toggle niedostępne */}
          <label style={{ display:"flex", alignItems:"center", gap:"8px", cursor:"pointer", flexShrink:0, paddingLeft:"12px", borderLeft:"1px solid rgba(154,107,32,.1)" }}>
            <span style={{ fontFamily:"var(--font-jost)", fontSize:"12px", letterSpacing:".1em", textTransform:"uppercase", color:"var(--text-muted)", whiteSpace:"nowrap" }}>
              Niedostępne
            </span>
            <button
              role="switch"
              aria-checked={showUnavailable}
              onClick={() => { setShowUnavailable(v => !v); setGridKey(k => k + 1); }}
              style={{
                width:"36px", height:"20px", borderRadius:"10px", border:"none", cursor:"pointer",
                background: showUnavailable ? "var(--gold)" : "rgba(154,107,32,.18)",
                position:"relative", transition:"background .2s", flexShrink:0,
              }}
            >
              <span style={{
                position:"absolute", top:"3px",
                left: showUnavailable ? "19px" : "3px",
                width:"14px", height:"14px", borderRadius:"50%", background:"#fff",
                transition:"left .2s",
              }}/>
            </button>
          </label>

        </div>
      </div>

      {/* ── GRID ── */}
      <div ref={gridRef} className="mob-pad mob-pad-y" style={{ maxWidth:"1600px", margin:"0 auto", padding:"60px 60px 100px" }}>

        {error && (
          <div style={{
            marginBottom:"32px", padding:"16px 20px",
            fontFamily:"var(--font-jost)", fontSize:"13px",
            borderLeft:"2px solid rgba(201,149,106,.6)",
            background:"rgba(201,149,106,.06)", color:"var(--gold-light)",
          }}>{error}</div>
        )}

        {loading ? (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(240px, 1fr))", gap:"2px" }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} style={{
                background:"var(--charcoal)",
                border:"1px solid rgba(201,149,106,.05)",
                opacity: 1 - i * .08,
              }}>
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
            <p style={{
              fontFamily:"var(--font-cormorant)", fontSize:"32px", fontWeight:400,
              fontStyle:"italic", color:"rgba(201,149,106,.3)",
            }}>
              Brak produktów
            </p>
          </div>
        ) : (
          <div key={gridKey} className="grid-stagger catalog-grid">
            {filtered.map(p => (
              <ProductCard key={p.id} product={p}
                categoryLabel={p.categoryName ? shortName(p.categoryName) : undefined}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── PRODUCT CARD ─── */
function ProductCard({ product: p, categoryLabel }: { product: Product; categoryLabel?: string }) {
  const router      = useRouter();
  const { addItem } = useCart();
  const [qty,    setQty]    = useState(1);
  const [imgErr, setImgErr] = useState(false);
  const [added,  setAdded]  = useState(false);
const img = !imgErr ? p.images?.[0] : null;
  const outOfStock = p.stock <= 0;

  function handleAdd(e: React.MouseEvent) {
    e.stopPropagation();
    if (outOfStock) return;
    for (let i = 0; i < qty; i++) addItem({ id: p.id, name: p.name, sku: p.sku ?? "", price: p.price, image: p.images?.[0] });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  function changeQty(delta: number, e: React.MouseEvent) {
    e.stopPropagation();
    setQty(q => Math.max(1, Math.min(q + delta, Math.max(p.stock, 1))));
  }

  return (
    <article
      className="pcard reveal"
      onClick={() => router.push(`/catalog/${p.id}`)}
      style={{ display:"flex", flexDirection:"column" }}
    >
      {/* IMAGE */}
      <div style={{
        position:"relative", aspectRatio:"1/1",
        background:"var(--onyx)", overflow:"hidden",
      }}>
        {img ? (
          <img
            src={img} alt={p.name}
            onError={() => setImgErr(true)}
            className="card-img"
            style={{
              width:"100%", height:"100%", objectFit:"cover",
              transition:"transform .6s cubic-bezier(.16,1,.3,1)",
              opacity: outOfStock ? .4 : 1,
            }}
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

        {/* gold glow on hover */}
        <div className="card-glow" style={{
          position:"absolute", inset:0, pointerEvents:"none",
          opacity:0, transition:"opacity .6s",
          background:"radial-gradient(ellipse at 50% 100%, rgba(201,149,106,.12), transparent 60%)",
        }}/>

        {/* badges */}
        {outOfStock && (
          <div style={{
            position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center",
            background:"rgba(237,232,223,.82)",
          }}>
            <span style={{
              fontFamily:"var(--font-cinzel)", fontSize:"11px",
              letterSpacing:".35em", textTransform:"uppercase", color:"var(--text-muted)",
            }}>Niedostępny</span>
          </div>
        )}
        {!outOfStock && p.stock <= 5 && (
          <div style={{
            position:"absolute", top:"12px", left:"12px",
            fontFamily:"var(--font-cinzel)", fontSize:"11px",
            letterSpacing:".3em", textTransform:"uppercase",
            padding:"5px 12px",
            background:"var(--gold)", color:"var(--obsidian)",
          }}>
            Ostatnie {p.stock}
          </div>
        )}
      </div>

      {/* INFO */}
      <div style={{
        padding:"20px 20px 20px",
        borderTop:"1px solid rgba(201,149,106,.06)",
        display:"flex", flexDirection:"column", flex:1,
      }}>
        {categoryLabel && (
          <p style={{
            fontFamily:"var(--font-cinzel)", fontSize:"11px",
            letterSpacing:".3em", textTransform:"uppercase",
            color:"var(--gold)", marginBottom:"10px",
          }}>{categoryLabel}</p>
        )}

        <h2 style={{
          fontFamily:"var(--font-cormorant)",
          fontSize:"18px", fontWeight:400, lineHeight:1.25,
          color:"var(--pearl)", marginBottom:"16px", flex:1,
          display:"-webkit-box",
          WebkitLineClamp:2, WebkitBoxOrient:"vertical",
          overflow:"hidden",
        }}>{p.name}</h2>

        {/* PRICE */}
        <div style={{
          display:"flex", alignItems:"baseline", justifyContent:"space-between",
          borderTop:"1px solid rgba(201,149,106,.08)", paddingTop:"14px", marginBottom:"14px",
        }}>
          <span style={{
            fontFamily:"var(--font-cormorant)",
            fontSize:"22px", fontWeight:400, lineHeight:1,
            color:"var(--gold-light)", letterSpacing:"-.01em",
          }}>
            {p.price.toFixed(2)}{" "}
            <span style={{ fontSize:"13px", color:"var(--text-muted)", fontWeight:400 }}>zł</span>
          </span>
        </div>

        {/* STEPPER + ADD */}
        <div onClick={e => e.stopPropagation()} style={{ display:"flex", gap:"6px" }}>
          <div style={{ display:"flex", border:"1px solid rgba(201,149,106,.2)" }}>
            <button
              onClick={e => changeQty(-1, e)}
              style={{
                width:"32px", height:"32px", display:"flex", alignItems:"center", justifyContent:"center",
                fontFamily:"var(--font-jost)", fontSize:"15px", color:"var(--text-muted)",
                background:"none", border:"none", cursor:"pointer", transition:"color .2s",
              }}
              onMouseEnter={e => (e.currentTarget.style.color = "var(--pearl)")}
              onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}>−</button>
            <span style={{
              width:"32px", height:"32px", display:"flex", alignItems:"center", justifyContent:"center",
              fontFamily:"var(--font-jost)", fontSize:"14px", fontWeight:400, color:"var(--pearl)",
              borderLeft:"1px solid rgba(201,149,106,.15)", borderRight:"1px solid rgba(201,149,106,.15)",
            }}>{qty}</span>
            <button
              onClick={e => changeQty(+1, e)}
              style={{
                width:"32px", height:"32px", display:"flex", alignItems:"center", justifyContent:"center",
                fontFamily:"var(--font-jost)", fontSize:"15px", color:"var(--text-muted)",
                background:"none", border:"none", cursor:"pointer", transition:"color .2s",
              }}
              onMouseEnter={e => (e.currentTarget.style.color = "var(--pearl)")}
              onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}>+</button>
          </div>

          <button
            onClick={handleAdd}
            disabled={outOfStock}
            style={{
              flex:1, height:"32px",
              fontFamily:"var(--font-jost)", fontSize:"11px",
              fontWeight:500, letterSpacing:".22em", textTransform:"uppercase",
              color: outOfStock ? "var(--text-muted)" : "#F8F4EE",
              background: added ? "#4ade80" : outOfStock ? "rgba(0,0,0,.08)" : "var(--gold)",
              border:"none", cursor: outOfStock ? "not-allowed" : "pointer",
              transition:"background .3s, color .3s",
            }}
            onMouseEnter={e => { if (!added && !outOfStock) (e.currentTarget.style.background = "var(--gold-light)"); }}
            onMouseLeave={e => { if (!added && !outOfStock) (e.currentTarget.style.background = "var(--gold)"); }}>
            {added ? "✓ Dodano" : outOfStock ? "Brak" : "Dodaj"}
          </button>
        </div>
      </div>
    </article>
  );
}
