"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface Product {
  id: string; name: string; sku?: string;
  price: number; stock: number;
  description?: string; images?: string[];
  categoryId?: string; categoryName?: string;
}

const EXCLUDED = ["znieczul", "toksyn"];

export default function InstagramProductPage() {
  const { id }  = useParams<{ id: string }>();
  const router  = useRouter();

  const [product,  setProduct]  = useState<Product | null>(null);
  const [related,  setRelated]  = useState<Product[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [imgIdx,   setImgIdx]   = useState(0);
  const [imgDir,   setImgDir]   = useState<1|-1>(1);
  const [imgErrs,  setImgErrs]  = useState<Record<number, boolean>>({});
  const [lightbox, setLightbox] = useState(false);
  const [touchX,   setTouchX]   = useState<number | null>(null);

  function goTo(newIdx: number, dir: 1 | -1) { setImgDir(dir); setImgIdx(newIdx); }

  useEffect(() => {
    fetch(`/api/products/public/${id}`)
      .then(r => r.json())
      .then(d => setProduct(d.product ?? null))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") setLightbox(false); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);

  useEffect(() => {
    if (!product?.categoryId) return;
    fetch("/api/products/public")
      .then(r => r.json())
      .then(d => {
        const all: Product[] = d.products ?? [];
        const rel = all.filter(p => {
          const cat = (p.categoryName ?? "").toLowerCase();
          return p.categoryId === product.categoryId && p.id !== id && !EXCLUDED.some(ex => cat.includes(ex));
        });
        setRelated(rel.slice(0, 4));
      });
  }, [product?.categoryId, id]);

  if (loading) return (
    <div style={{ maxWidth:"1280px", margin:"0 auto", padding:"80px 60px" }}>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"80px" }}>
        <div style={{ aspectRatio:"1/1", background:"var(--onyx)" }}/>
        <div style={{ paddingTop:"16px" }}>
          <div style={{ height:"10px", width:"25%", background:"rgba(154,107,32,.08)", marginBottom:"20px" }}/>
          <div style={{ height:"40px", width:"75%", background:"rgba(154,107,32,.06)", marginBottom:"12px" }}/>
          <div style={{ height:"18px", width:"40%", background:"rgba(154,107,32,.05)", marginBottom:"40px" }}/>
          <div style={{ height:"32px", width:"50%", background:"rgba(154,107,32,.07)" }}/>
        </div>
      </div>
    </div>
  );

  if (!product) return (
    <div style={{ maxWidth:"1280px", margin:"0 auto", padding:"160px 60px", textAlign:"center" }}>
      <p style={{ fontFamily:"var(--font-cormorant)", fontSize:"28px", fontStyle:"italic", color:"rgba(154,107,32,.4)", marginBottom:"32px" }}>Produkt nie istnieje.</p>
      <button onClick={() => router.push("/instagram")} className="btn-outline">← Wróć do katalogu</button>
    </div>
  );

  const validImgs = (product.images ?? []).filter((_, i) => !imgErrs[i]);
  const catShort  = product.categoryName?.split("/").pop()?.trim();

  return (
    <div style={{ minHeight:"100vh", background:"var(--obsidian)" }}>
      <div className="mob-pad mob-pad-y" style={{ maxWidth:"1280px", margin:"0 auto", padding:"60px 60px 100px" }}>

        {/* BREADCRUMB */}
        <nav className="mob-hide" style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"48px" }}>
          <button onClick={() => router.push("/instagram")}
            style={{ fontFamily:"var(--font-jost)", fontSize:"13px", letterSpacing:".18em", textTransform:"uppercase", color:"var(--text-muted)", background:"none", border:"none", cursor:"pointer", transition:"color .25s" }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--gold)")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}>
            Katalog
          </button>
          <span style={{ color:"rgba(154,107,32,.3)", fontSize:"14px" }}>›</span>
          {catShort && (
            <>
              <span style={{ fontFamily:"var(--font-jost)", fontSize:"13px", letterSpacing:".15em", color:"var(--text-muted)" }}>{catShort}</span>
              <span style={{ color:"rgba(154,107,32,.3)", fontSize:"14px" }}>›</span>
            </>
          )}
          <span style={{ fontFamily:"var(--font-jost)", fontSize:"13px", letterSpacing:".1em", color:"var(--pearl)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:"300px" }}>{product.name}</span>
        </nav>

        <div className="mob-grid-1" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"80px" }}>

          {/* GALLERY */}
          <div>
            <div
              style={{ aspectRatio:"1/1", overflow:"hidden", background:"linear-gradient(to bottom, #F5F1EC, #FFFFFF)", border:"1px solid rgba(154,107,32,.14)", position:"relative", cursor: validImgs.length > 0 ? "zoom-in" : "default", userSelect:"none" }}
              onClick={() => validImgs.length > 0 && setLightbox(true)}
              onTouchStart={e => setTouchX(e.touches[0].clientX)}
              onTouchEnd={e => {
                if (touchX === null || validImgs.length <= 1) return;
                const diff = touchX - e.changedTouches[0].clientX;
                if (Math.abs(diff) > 40) {
                  if (diff > 0) goTo((imgIdx + 1) % validImgs.length, 1);
                  else          goTo((imgIdx - 1 + validImgs.length) % validImgs.length, -1);
                }
                setTouchX(null);
              }}
            >
              {validImgs.length > 0 ? (
                <img key={imgIdx} src={validImgs[imgIdx] ?? validImgs[0]} alt={product.name}
                  onError={() => setImgErrs(p => ({ ...p, [imgIdx]: true }))}
                  style={{ width:"100%", height:"100%", objectFit:"contain", animation:`${imgDir === 1 ? "imgSlideRight" : "imgSlideLeft"} .26s ease` }}
                />
              ) : (
                <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <svg width="56" height="56" viewBox="0 0 40 40" fill="none" style={{ opacity:.12 }}>
                    <rect x="4" y="4" width="32" height="32" stroke="var(--gold)" strokeWidth="1"/>
                    <path d="M4 27l9-9 7 7 5-5 11 11" stroke="var(--gold)" strokeWidth="1" strokeLinejoin="round"/>
                    <circle cx="13" cy="15" r="2.5" stroke="var(--gold)" strokeWidth="1"/>
                  </svg>
                </div>
              )}

              {validImgs.length > 1 && (
                <>
                  <button onClick={e => { e.stopPropagation(); goTo((imgIdx - 1 + validImgs.length) % validImgs.length, -1); }}
                    style={{ position:"absolute", left:"12px", top:"50%", transform:"translateY(-50%)", width:"40px", height:"40px", display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(255,255,255,.85)", backdropFilter:"blur(4px)", border:"1px solid rgba(154,107,32,.2)", cursor:"pointer", transition:"background .2s, border-color .2s" }}
                    onMouseEnter={e => { e.currentTarget.style.background="rgba(255,255,255,.97)"; e.currentTarget.style.borderColor="rgba(154,107,32,.5)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background="rgba(255,255,255,.85)"; e.currentTarget.style.borderColor="rgba(154,107,32,.2)"; }}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                  <button onClick={e => { e.stopPropagation(); goTo((imgIdx + 1) % validImgs.length, 1); }}
                    style={{ position:"absolute", right:"12px", top:"50%", transform:"translateY(-50%)", width:"40px", height:"40px", display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(255,255,255,.85)", backdropFilter:"blur(4px)", border:"1px solid rgba(154,107,32,.2)", cursor:"pointer", transition:"background .2s, border-color .2s" }}
                    onMouseEnter={e => { e.currentTarget.style.background="rgba(255,255,255,.97)"; e.currentTarget.style.borderColor="rgba(154,107,32,.5)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background="rgba(255,255,255,.85)"; e.currentTarget.style.borderColor="rgba(154,107,32,.2)"; }}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 3l5 5-5 5" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                  <div style={{ position:"absolute", bottom:"12px", left:"50%", transform:"translateX(-50%)", display:"flex", gap:"6px" }}>
                    {validImgs.map((_, i) => (
                      <button key={i} onClick={e => { e.stopPropagation(); goTo(i, i > imgIdx ? 1 : -1); }}
                        style={{ width: imgIdx === i ? "20px" : "6px", height:"6px", background: imgIdx === i ? "var(--gold)" : "rgba(154,107,32,.3)", border:"none", cursor:"pointer", padding:0, transition:"width .25s, background .25s" }}/>
                    ))}
                  </div>
                </>
              )}
            </div>

            {validImgs.length > 1 && (
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:"4px", marginTop:"4px" }}>
                {validImgs.map((src, i) => (
                  <button key={i} onClick={() => goTo(i, i > imgIdx ? 1 : -1)}
                    style={{ aspectRatio:"1/1", overflow:"hidden", background:"linear-gradient(to bottom, #F5F1EC, #FFFFFF)", border: imgIdx === i ? "2px solid var(--gold)" : "1px solid rgba(154,107,32,.12)", cursor:"pointer", transition:"border-color .2s", padding:0 }}
                    onMouseEnter={e => { if (imgIdx !== i) e.currentTarget.style.borderColor = "rgba(154,107,32,.4)"; }}
                    onMouseLeave={e => { if (imgIdx !== i) e.currentTarget.style.borderColor = "rgba(154,107,32,.12)"; }}>
                    <img src={src} alt="" onError={() => setImgErrs(p => ({ ...p, [i]: true }))} style={{ width:"100%", height:"100%", objectFit:"contain" }}/>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* DETAILS */}
          <div style={{ display:"flex", flexDirection:"column" }}>
            {catShort && (
              <p style={{ fontFamily:"var(--font-cinzel)", fontSize:"13px", letterSpacing:".4em", textTransform:"uppercase", color:"var(--gold)", marginBottom:"20px" }}>{catShort}</p>
            )}
            <h1 style={{ fontFamily:"var(--font-cormorant)", fontSize:"clamp(28px, 3vw, 40px)", fontWeight:400, lineHeight:1.1, color:"var(--pearl)", marginBottom:"12px" }}>{product.name}</h1>
            {product.sku && (
              <p style={{ fontFamily:"var(--font-jost)", fontSize:"13px", fontWeight:400, letterSpacing:".08em", color:"var(--text-muted)", marginBottom:"32px" }}>SKU: {product.sku}</p>
            )}

            {/* PRICE */}
            <div style={{ padding:"28px 0", margin:"8px 0 28px", borderTop:"1px solid rgba(154,107,32,.12)", borderBottom:"1px solid rgba(154,107,32,.12)" }}>
              <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between" }}>
                <div style={{ display:"flex", alignItems:"baseline", gap:"8px" }}>
                  <span style={{ fontFamily:"var(--font-cormorant)", fontSize:"56px", fontWeight:400, lineHeight:1, color:"var(--gold)", letterSpacing:"-.02em" }}>{product.price.toFixed(2)}</span>
                  <span style={{ fontFamily:"var(--font-cormorant)", fontSize:"20px", color:"var(--text-muted)" }}>zł</span>
                </div>
                <div style={{ textAlign:"right" }}>
                  {product.stock <= 0 ? (
                    <p style={{ fontFamily:"var(--font-jost)", fontSize:"13px", letterSpacing:".06em", color:"var(--text-muted)" }}>Niedostępny</p>
                  ) : product.stock <= 5 ? (
                    <p style={{ fontFamily:"var(--font-jost)", fontSize:"13px", letterSpacing:".06em", color:"var(--gold)" }}>Ostatnie {product.stock} szt.</p>
                  ) : (
                    <p style={{ fontFamily:"var(--font-jost)", fontSize:"13px", letterSpacing:".06em", color:"var(--text-muted)" }}>Dostępny</p>
                  )}
                </div>
              </div>
            </div>

            {/* DESCRIPTION */}
            {product.description && (
              <div style={{ marginBottom:"32px" }}>
                <p style={{ fontFamily:"var(--font-cinzel)", fontSize:"11px", letterSpacing:".35em", textTransform:"uppercase", color:"var(--gold)", marginBottom:"16px" }}>Opis</p>
                <div style={{ fontFamily:"var(--font-jost)", fontSize:"14px", fontWeight:400, lineHeight:1.8, color:"var(--text-muted)" }}
                  dangerouslySetInnerHTML={{ __html: product.description }}/>
              </div>
            )}

            <button onClick={() => router.push("/instagram")} className="btn-outline" style={{ alignSelf:"flex-start", marginTop:"auto" }}>
              ← Wróć do katalogu
            </button>
          </div>
        </div>

        {/* RELATED */}
        {related.length > 0 && (
          <div style={{ marginTop:"80px", paddingTop:"60px", borderTop:"1px solid rgba(154,107,32,.08)" }}>
            <p style={{ fontFamily:"var(--font-cinzel)", fontSize:"13px", letterSpacing:".4em", textTransform:"uppercase", color:"var(--gold)", marginBottom:"32px" }}>
              Z tej samej kategorii
            </p>
            <div className="catalog-grid">
              {related.map(p => (
                <article key={p.id} className="pcard" onClick={() => { router.push(`/instagram/${p.id}`); setImgIdx(0); setImgErrs({}); }} style={{ cursor:"pointer" }}>
                  <div style={{ aspectRatio:"1/1", background:"var(--onyx)", overflow:"hidden" }}>
                    {p.images?.[0] && <img src={p.images[0]} alt={p.name} className="card-img" style={{ width:"100%", height:"100%", objectFit:"cover", transition:"transform .6s cubic-bezier(.16,1,.3,1)" }}/>}
                  </div>
                  <div style={{ padding:"16px 20px 20px" }}>
                    <h3 style={{ fontFamily:"var(--font-cormorant)", fontSize:"16px", fontWeight:400, color:"var(--pearl)", marginBottom:"8px", lineHeight:1.3 }}>{p.name}</h3>
                    <span style={{ fontFamily:"var(--font-cormorant)", fontSize:"18px", color:"var(--gold-light)" }}>{p.price.toFixed(2)} <span style={{ fontSize:"12px", color:"var(--text-muted)" }}>zł</span></span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* LIGHTBOX */}
      {lightbox && validImgs.length > 0 && (
        <div onClick={() => setLightbox(false)} style={{ position:"fixed", inset:0, zIndex:1000, background:"rgba(0,0,0,.92)", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <img src={validImgs[imgIdx]} alt={product.name} style={{ maxWidth:"90vw", maxHeight:"90vh", objectFit:"contain" }} onClick={e => e.stopPropagation()}/>
          <button onClick={() => setLightbox(false)} style={{ position:"absolute", top:"24px", right:"24px", background:"none", border:"none", color:"#fff", fontSize:"28px", cursor:"pointer", lineHeight:1 }}>×</button>
        </div>
      )}
    </div>
  );
}
