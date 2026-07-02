"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useCart } from "@/lib/cart/context";

interface Variant { id: string; name: string; stock: number; price: number; }
interface Product {
  id: string; name: string; sku?: string;
  price: number; stock: number;
  description?: string; images?: string[];
  categoryId?: string; categoryName?: string;
  variants?: Variant[];
}

export default function ProductPage() {
  const { id }   = useParams<{ id: string }>();
  const router   = useRouter();
  const { addItem } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [imgIdx,  setImgIdx]  = useState(0);
  const [imgDir,  setImgDir]  = useState<1|-1>(1);
  const [imgErrs, setImgErrs] = useState<Record<number, boolean>>({});
  const [added,        setAdded]        = useState(false);
  const [qty,          setQty]          = useState(1);
  const [selectedVar,  setSelectedVar]  = useState<Variant | null>(null);
  const [lightbox, setLightbox] = useState(false);
  const [touchX,   setTouchX]   = useState<number | null>(null);

  function goTo(newIdx: number, dir: 1 | -1) { setImgDir(dir); setImgIdx(newIdx); }

  useEffect(() => {
    fetch(`/api/products/${id}`)
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
    fetch("/api/products")
      .then(r => r.json())
      .then(d => {
        const all: Product[] = d.products ?? [];
        const rel = all.filter(p => p.categoryId === product.categoryId && p.id !== id && p.stock > 0);
        setRelated(rel.slice(0, 4));
      });
  }, [product?.categoryId, id]);

  const hasVariants = (product?.variants?.length ?? 0) > 0;
  const effectiveVariant = hasVariants ? selectedVar : null;
  const effectiveStock   = effectiveVariant ? effectiveVariant.stock : (product?.stock ?? 0);
  const effectivePrice   = effectiveVariant ? effectiveVariant.price : (product?.price ?? 0);
  const canAdd = !hasVariants || selectedVar !== null;

  function handleAdd() {
    if (!product || !canAdd) return;
    const itemName = effectiveVariant ? `${product.name} — ${effectiveVariant.name}` : product.name;
    for (let i = 0; i < qty; i++) addItem({
      id: product.id,
      name: itemName,
      sku: product.sku ?? "",
      price: effectivePrice,
      image: product.images?.[0],
      ...(effectiveVariant ? { variantId: effectiveVariant.id } : {}),
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  }

  /* loading */
  if (loading) return (
    <div style={{ paddingTop:"120px", maxWidth:"1280px", margin:"0 auto", padding:"0 60px 80px" }}>
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
    <div style={{ paddingTop:"108px", maxWidth:"1280px", margin:"0 auto", padding:"160px 60px", textAlign:"center" }}>
      <p style={{
        fontFamily:"var(--font-cormorant)", fontSize:"28px",
        fontStyle:"italic", color:"rgba(154,107,32,.4)", marginBottom:"32px",
      }}>Produkt nie istnieje.</p>
      <button onClick={() => router.back()} className="btn-outline">← Wróć do katalogu</button>
    </div>
  );

  const validImgs = (product.images ?? []).filter((_, i) => !imgErrs[i]);
  const catShort  = product.categoryName?.split("/").pop()?.trim();

  return (
    <div style={{ paddingTop:"108px", minHeight:"100vh", background:"var(--obsidian)" }}>
      <div className="mob-pad mob-pad-y" style={{ maxWidth:"1280px", margin:"0 auto", padding:"60px 60px 100px" }}>

        {/* BREADCRUMB */}
        <nav className="mob-hide" style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"48px" }}>
          <button onClick={() => router.push("/catalog")}
            style={{
              fontFamily:"var(--font-jost)", fontSize:"13px",
              letterSpacing:".18em", textTransform:"uppercase",
              color:"var(--text-muted)", background:"none", border:"none",
              cursor:"pointer", transition:"color .25s",
            }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--gold)")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}>
            Katalog
          </button>
          <span style={{ color:"rgba(154,107,32,.3)", fontSize:"14px" }}>›</span>
          {catShort && (
            <>
              <span style={{ fontFamily:"var(--font-jost)", fontSize:"13px", letterSpacing:".15em", color:"var(--text-muted)" }}>
                {catShort}
              </span>
              <span style={{ color:"rgba(154,107,32,.3)", fontSize:"14px" }}>›</span>
            </>
          )}
          <span style={{
            fontFamily:"var(--font-jost)", fontSize:"13px",
            letterSpacing:".1em", color:"var(--pearl)",
            overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:"300px",
          }}>{product.name}</span>
        </nav>

        <div className="mob-grid-1" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"80px" }}>

          {/* GALLERY */}
          <div>
            {/* MAIN IMAGE */}
            <div
              style={{
                aspectRatio:"1/1", overflow:"hidden",
                background:"linear-gradient(to bottom, #F5F1EC, #FFFFFF)",
                border:"1px solid rgba(154,107,32,.14)",
                position:"relative",
                cursor: validImgs.length > 0 ? "zoom-in" : "default",
                userSelect:"none",
              }}
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
                <img
                  key={imgIdx}
                  src={validImgs[imgIdx] ?? validImgs[0]} alt={product.name}
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

              {/* ARROWS */}
              {validImgs.length > 1 && (
                <>
                  <button
                    onClick={e => { e.stopPropagation(); goTo((imgIdx - 1 + validImgs.length) % validImgs.length, -1); }}
                    style={{
                      position:"absolute", left:"12px", top:"50%", transform:"translateY(-50%)",
                      width:"40px", height:"40px",
                      display:"flex", alignItems:"center", justifyContent:"center",
                      background:"rgba(255,255,255,.85)", backdropFilter:"blur(4px)",
                      border:"1px solid rgba(154,107,32,.2)",
                      cursor:"pointer", transition:"background .2s, border-color .2s",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background="rgba(255,255,255,.97)"; e.currentTarget.style.borderColor="rgba(154,107,32,.5)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background="rgba(255,255,255,.85)"; e.currentTarget.style.borderColor="rgba(154,107,32,.2)"; }}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M10 3L5 8l5 5" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); goTo((imgIdx + 1) % validImgs.length, 1); }}
                    style={{
                      position:"absolute", right:"12px", top:"50%", transform:"translateY(-50%)",
                      width:"40px", height:"40px",
                      display:"flex", alignItems:"center", justifyContent:"center",
                      background:"rgba(255,255,255,.85)", backdropFilter:"blur(4px)",
                      border:"1px solid rgba(154,107,32,.2)",
                      cursor:"pointer", transition:"background .2s, border-color .2s",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background="rgba(255,255,255,.97)"; e.currentTarget.style.borderColor="rgba(154,107,32,.5)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background="rgba(255,255,255,.85)"; e.currentTarget.style.borderColor="rgba(154,107,32,.2)"; }}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M6 3l5 5-5 5" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>

                  {/* DOT INDICATOR */}
                  <div style={{
                    position:"absolute", bottom:"12px", left:"50%", transform:"translateX(-50%)",
                    display:"flex", gap:"6px",
                  }}>
                    {validImgs.map((_, i) => (
                      <button
                        key={i} onClick={e => { e.stopPropagation(); goTo(i, i > imgIdx ? 1 : -1); }}
                        style={{
                          width: imgIdx === i ? "20px" : "6px",
                          height:"6px",
                          background: imgIdx === i ? "var(--gold)" : "rgba(154,107,32,.3)",
                          border:"none", cursor:"pointer", padding:0,
                          transition:"width .25s, background .25s",
                        }}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* THUMBNAILS — 4 per row */}
            {validImgs.length > 1 && (
              <div style={{
                display:"grid",
                gridTemplateColumns:"repeat(4, 1fr)",
                gap:"4px", marginTop:"4px",
              }}>
                {validImgs.map((src, i) => (
                  <button key={i} onClick={() => goTo(i, i > imgIdx ? 1 : -1)}
                    style={{
                      aspectRatio:"1/1", overflow:"hidden",
                      background:"linear-gradient(to bottom, #F5F1EC, #FFFFFF)",
                      border: imgIdx === i ? "2px solid var(--gold)" : "1px solid rgba(154,107,32,.12)",
                      cursor:"pointer", transition:"border-color .2s",
                      padding:0,
                    }}
                    onMouseEnter={e => { if (imgIdx !== i) e.currentTarget.style.borderColor = "rgba(154,107,32,.4)"; }}
                    onMouseLeave={e => { if (imgIdx !== i) e.currentTarget.style.borderColor = "rgba(154,107,32,.12)"; }}>
                    <img src={src} alt="" onError={() => setImgErrs(p => ({ ...p, [i]: true }))}
                      style={{ width:"100%", height:"100%", objectFit:"contain" }}/>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* DETAILS */}
          <div style={{ display:"flex", flexDirection:"column" }}>

            {catShort && (
              <p style={{
                fontFamily:"var(--font-cinzel)", fontSize:"13px",
                letterSpacing:".4em", textTransform:"uppercase",
                color:"var(--gold)", marginBottom:"20px",
              }}>{catShort}</p>
            )}

            <h1 style={{
              fontFamily:"var(--font-cormorant)",
              fontSize:"clamp(28px, 3vw, 40px)",
              fontWeight:400, lineHeight:1.1,
              color:"var(--pearl)", marginBottom:"12px",
            }}>{product.name}</h1>

            {product.sku && (
              <p style={{
                fontFamily:"var(--font-jost)", fontSize:"13px",
                fontWeight:400, letterSpacing:".08em",
                color:"var(--text-muted)", marginBottom:"32px",
              }}>SKU: {product.sku}</p>
            )}

            {/* PRICE */}
            <div style={{
              padding:"28px 0", margin:"8px 0 28px",
              borderTop:"1px solid rgba(154,107,32,.12)",
              borderBottom:"1px solid rgba(154,107,32,.12)",
            }}>
              <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between" }}>
                <div style={{ display:"flex", alignItems:"baseline", gap:"8px" }}>
                  <span style={{
                    fontFamily:"var(--font-cormorant)",
                    fontSize:"56px", fontWeight:400, lineHeight:1,
                    color:"var(--gold)", letterSpacing:"-.02em",
                  }}>{effectivePrice.toFixed(2)}</span>
                  <span style={{
                    fontFamily:"var(--font-cormorant)",
                    fontSize:"20px", color:"var(--text-muted)",
                  }}>zł</span>
                </div>
                <div style={{ textAlign:"right" }}>
                  {effectiveStock <= 0 ? (
                    <p style={{ fontFamily:"var(--font-jost)", fontSize:"13px", letterSpacing:".06em", color:"var(--text-muted)" }}>
                      Niedostępny
                    </p>
                  ) : effectiveStock <= 5 ? (
                    <p style={{ fontFamily:"var(--font-jost)", fontSize:"13px", letterSpacing:".06em", color:"var(--gold)" }}>
                      Ostatnie {effectiveStock} szt.
                    </p>
                  ) : (
                    <p style={{ fontFamily:"var(--font-jost)", fontSize:"13px", letterSpacing:".06em", color:"var(--text-muted)" }}>
                      W magazynie ({effectiveStock} szt.)
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* VARIANTS */}
            {hasVariants && (
              <div style={{ marginBottom:"24px" }}>
                <p style={{ fontFamily:"var(--font-cinzel)", fontSize:"11px", letterSpacing:".3em", textTransform:"uppercase", color:"var(--gold)", marginBottom:"12px" }}>
                  Wariant {!selectedVar && <span style={{ color:"rgba(201,149,106,.5)" }}>— wybierz</span>}
                </p>
                <div style={{ display:"flex", flexWrap:"wrap", gap:"8px" }}>
                  {product.variants!.map(v => {
                    const isSelected = selectedVar?.id === v.id;
                    const outOfStock = v.stock <= 0;
                    return (
                      <button key={v.id}
                        onClick={() => !outOfStock && setSelectedVar(isSelected ? null : v)}
                        disabled={outOfStock}
                        style={{
                          padding:"8px 18px",
                          fontFamily:"var(--font-jost)", fontSize:"13px", letterSpacing:".06em",
                          background: isSelected ? "var(--gold)" : "transparent",
                          color: isSelected ? "#fff" : outOfStock ? "rgba(154,107,32,.25)" : "var(--pearl)",
                          border: isSelected ? "1px solid var(--gold)" : "1px solid rgba(154,107,32,.25)",
                          cursor: outOfStock ? "not-allowed" : "pointer",
                          transition:"all .2s",
                          textDecoration: outOfStock ? "line-through" : "none",
                        }}
                        onMouseEnter={e => { if (!isSelected && !outOfStock) { e.currentTarget.style.borderColor = "var(--gold)"; e.currentTarget.style.color = "var(--gold)"; }}}
                        onMouseLeave={e => { if (!isSelected && !outOfStock) { e.currentTarget.style.borderColor = "rgba(154,107,32,.25)"; e.currentTarget.style.color = "var(--pearl)"; }}}>
                        {v.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* QTY + ADD */}
            <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
              <div style={{ display:"flex", border:"1px solid rgba(154,107,32,.2)" }}>
                <button onClick={() => setQty(q => Math.max(1, q - 1))}
                  style={{
                    width:"48px", height:"48px", display:"flex", alignItems:"center", justifyContent:"center",
                    fontFamily:"var(--font-jost)", fontSize:"18px", fontWeight:400,
                    color:"var(--text-muted)", background:"none", border:"none", cursor:"pointer",
                    transition:"color .2s",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = "var(--pearl)")}
                  onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}>−</button>
                <span style={{
                  width:"52px", height:"48px", display:"flex", alignItems:"center", justifyContent:"center",
                  fontFamily:"var(--font-cormorant)", fontSize:"20px", fontWeight:400,
                  color:"var(--pearl)",
                  borderLeft:"1px solid rgba(154,107,32,.15)", borderRight:"1px solid rgba(154,107,32,.15)",
                }}>{qty}</span>
                <button onClick={() => setQty(q => Math.min(q + 1, effectiveStock))}
                  style={{
                    width:"48px", height:"48px", display:"flex", alignItems:"center", justifyContent:"center",
                    fontFamily:"var(--font-jost)", fontSize:"18px", fontWeight:400,
                    color:"var(--text-muted)", background:"none", border:"none", cursor:"pointer",
                    transition:"color .2s",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = "var(--pearl)")}
                  onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}>+</button>
              </div>

              <button
                onClick={handleAdd}
                disabled={effectiveStock <= 0 || !canAdd}
                style={{
                  flex:1, height:"48px",
                  fontFamily:"var(--font-jost)", fontSize:"13px",
                  fontWeight:500, letterSpacing:".25em", textTransform:"uppercase",
                  color: (effectiveStock <= 0 || !canAdd) ? "var(--text-muted)" : "#F8F4EE",
                  background: added ? "#4ade80" : (effectiveStock <= 0 || !canAdd) ? "rgba(0,0,0,.07)" : "var(--gold)",
                  border:"none", cursor: (effectiveStock <= 0 || !canAdd) ? "not-allowed" : "pointer",
                  transition:"background .3s",
                }}
                onMouseEnter={e => { if (!added && effectiveStock > 0 && canAdd) (e.currentTarget.style.background = "var(--gold-light)"); }}
                onMouseLeave={e => { if (!added && effectiveStock > 0 && canAdd) (e.currentTarget.style.background = "var(--gold)"); }}>
                {added ? "✓ Dodano do koszyka" : effectiveStock <= 0 ? "Brak w magazynie" : !canAdd ? "Wybierz wariant" : "Dodaj do koszyka"}
              </button>
            </div>
          </div>
        </div>

        {/* DESCRIPTION */}
        {product.description && (
          <div style={{
            marginTop:"80px", paddingTop:"60px",
            borderTop:"1px solid rgba(154,107,32,.1)",
          }}>
            <p style={{
              fontFamily:"var(--font-cinzel)", fontSize:"13px",
              letterSpacing:".45em", textTransform:"uppercase",
              color:"var(--gold)", marginBottom:"32px",
            }}>Opis produktu</p>
            <div
              style={{
                maxWidth:"680px",
                fontFamily:"var(--font-jost)", fontSize:"16px",
                fontWeight:400, lineHeight:1.9,
                color:"var(--pearl)",
              }}
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          </div>
        )}

        {/* RELATED PRODUCTS */}
        {related.length > 0 && (
          <div style={{
            marginTop:"80px", paddingTop:"60px",
            borderTop:"1px solid rgba(154,107,32,.1)",
          }}>
            <div style={{ display:"flex", alignItems:"baseline", gap:"20px", marginBottom:"40px" }}>
              <p style={{
                fontFamily:"var(--font-cinzel)", fontSize:"13px",
                letterSpacing:".45em", textTransform:"uppercase",
                color:"var(--gold)",
              }}>Inni oglądali również</p>
              {catShort && (
                <span style={{
                  fontFamily:"var(--font-jost)", fontSize:"13px", fontWeight:400,
                  color:"var(--text-muted)", letterSpacing:".05em",
                }}>z kategorii {catShort}</span>
              )}
            </div>

            <div className="mob-grid-2" style={{
              display:"grid",
              gridTemplateColumns:"repeat(4, 1fr)",
              gap:"2px",
            }}>
              {related.map(p => (
                <RelatedCard key={p.id} product={p} onNavigate={() => router.push(`/catalog/${p.id}`)} />
              ))}
            </div>
          </div>
        )}

      </div>

      {/* LIGHTBOX */}
      {lightbox && validImgs.length > 0 && (
        <div
          onClick={() => setLightbox(false)}
          style={{
            position:"fixed", inset:0, zIndex:200,
            background:"rgba(245,241,236,.98)",
            display:"flex", alignItems:"center", justifyContent:"center",
          }}
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
          <img
            key={imgIdx}
            src={validImgs[imgIdx]}
            alt={product.name}
            onClick={e => e.stopPropagation()}
            style={{ maxWidth:"90vw", maxHeight:"90vh", objectFit:"contain", animation:`${imgDir === 1 ? "imgSlideRight" : "imgSlideLeft"} .26s ease` }}
          />

          {validImgs.length > 1 && (
            <>
              <button
                onClick={e => { e.stopPropagation(); goTo((imgIdx - 1 + validImgs.length) % validImgs.length, -1); }}
                style={{
                  position:"absolute", left:"16px", top:"50%", transform:"translateY(-50%)",
                  width:"48px", height:"48px", display:"flex", alignItems:"center", justifyContent:"center",
                  background:"rgba(154,107,32,.08)", border:"1px solid rgba(154,107,32,.2)",
                  cursor:"pointer", transition:"background .2s, border-color .2s",
                }}
                onMouseEnter={e => { e.currentTarget.style.background="rgba(154,107,32,.15)"; e.currentTarget.style.borderColor="rgba(154,107,32,.4)"; }}
                onMouseLeave={e => { e.currentTarget.style.background="rgba(154,107,32,.08)"; e.currentTarget.style.borderColor="rgba(154,107,32,.2)"; }}>
                <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
                  <path d="M10 3L5 8l5 5" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button
                onClick={e => { e.stopPropagation(); goTo((imgIdx + 1) % validImgs.length, 1); }}
                style={{
                  position:"absolute", right:"16px", top:"50%", transform:"translateY(-50%)",
                  width:"48px", height:"48px", display:"flex", alignItems:"center", justifyContent:"center",
                  background:"rgba(154,107,32,.08)", border:"1px solid rgba(154,107,32,.2)",
                  cursor:"pointer", transition:"background .2s, border-color .2s",
                }}
                onMouseEnter={e => { e.currentTarget.style.background="rgba(154,107,32,.15)"; e.currentTarget.style.borderColor="rgba(154,107,32,.4)"; }}
                onMouseLeave={e => { e.currentTarget.style.background="rgba(154,107,32,.08)"; e.currentTarget.style.borderColor="rgba(154,107,32,.2)"; }}>
                <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
                  <path d="M6 3l5 5-5 5" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </>
          )}

          <button
            onClick={() => setLightbox(false)}
            style={{
              position:"absolute", top:"16px", right:"16px",
              width:"44px", height:"44px", display:"flex", alignItems:"center", justifyContent:"center",
              background:"rgba(154,107,32,.08)", border:"1px solid rgba(154,107,32,.2)",
              cursor:"pointer", fontSize:"22px", color:"var(--gold)",
              transition:"background .2s, border-color .2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background="rgba(154,107,32,.15)"; e.currentTarget.style.borderColor="rgba(154,107,32,.4)"; }}
            onMouseLeave={e => { e.currentTarget.style.background="rgba(154,107,32,.08)"; e.currentTarget.style.borderColor="rgba(154,107,32,.2)"; }}>
            ×
          </button>

          {validImgs.length > 1 && (
            <div style={{ position:"absolute", bottom:"20px", left:"50%", transform:"translateX(-50%)", display:"flex", gap:"6px" }}>
              {validImgs.map((_, i) => (
                <button key={i} onClick={e => { e.stopPropagation(); goTo(i, i > imgIdx ? 1 : -1); }}
                  style={{
                    width: imgIdx === i ? "20px" : "6px", height:"6px",
                    background: imgIdx === i ? "var(--gold)" : "rgba(154,107,32,.3)",
                    border:"none", cursor:"pointer", padding:0, transition:"width .25s, background .25s",
                  }}/>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}

/* ─── RELATED CARD ─── */
function RelatedCard({ product: p, onNavigate }: { product: Product; onNavigate: () => void }) {
  const { addItem } = useCart();
  const [imgErr, setImgErr] = useState(false);
  const [added,  setAdded]  = useState(false);
  const img = !imgErr ? p.images?.[0] : null;
  const catShort = p.categoryName?.split("/").pop()?.trim();

  function handleAdd(e: React.MouseEvent) {
    e.stopPropagation();
    addItem({ id: p.id, name: p.name, sku: p.sku ?? "", price: p.price, image: p.images?.[0] });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <article
      onClick={onNavigate}
      style={{
        background:"#FFFFFF",
        border:"1px solid rgba(154,107,32,.1)",
        overflow:"hidden", cursor:"pointer",
        display:"flex", flexDirection:"column",
        transition:"border-color .3s, transform .3s, box-shadow .3s",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.borderColor = "rgba(154,107,32,.28)";
        (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)";
        (e.currentTarget as HTMLElement).style.boxShadow = "0 10px 32px rgba(0,0,0,.1)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.borderColor = "rgba(154,107,32,.1)";
        (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
        (e.currentTarget as HTMLElement).style.boxShadow = "none";
      }}
    >
      {/* IMAGE */}
      <div style={{ aspectRatio:"1/1", background:"var(--onyx)", overflow:"hidden" }}>
        {img ? (
          <img
            src={img} alt={p.name}
            onError={() => setImgErr(true)}
            style={{
              width:"100%", height:"100%", objectFit:"cover",
              transition:"transform .5s cubic-bezier(.16,1,.3,1)",
            }}
          />
        ) : (
          <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <svg width="36" height="36" viewBox="0 0 40 40" fill="none" style={{ opacity:.1 }}>
              <rect x="4" y="4" width="32" height="32" stroke="var(--gold)" strokeWidth="1"/>
              <path d="M4 27l9-9 7 7 5-5 11 11" stroke="var(--gold)" strokeWidth="1" strokeLinejoin="round"/>
            </svg>
          </div>
        )}
      </div>

      {/* INFO */}
      <div style={{
        padding:"16px 16px 14px",
        borderTop:"1px solid rgba(154,107,32,.07)",
        display:"flex", flexDirection:"column", flex:1,
      }}>
        {catShort && (
          <p style={{
            fontFamily:"var(--font-cinzel)", fontSize:"7.5px",
            letterSpacing:".3em", textTransform:"uppercase",
            color:"var(--gold)", marginBottom:"8px",
          }}>{catShort}</p>
        )}

        <h3 style={{
          fontFamily:"var(--font-cormorant)",
          fontSize:"16px", fontWeight:400, lineHeight:1.25,
          color:"var(--pearl)", flex:1, marginBottom:"12px",
          display:"-webkit-box",
          WebkitLineClamp:2, WebkitBoxOrient:"vertical",
          overflow:"hidden",
        }}>{p.name}</h3>

        <div style={{
          display:"flex", alignItems:"center", justifyContent:"space-between",
          borderTop:"1px solid rgba(154,107,32,.08)", paddingTop:"12px",
        }}>
          <span style={{
            fontFamily:"var(--font-cormorant)",
            fontSize:"20px", fontWeight:400, color:"var(--gold)",
          }}>
            {p.price.toFixed(2)}{" "}
            <span style={{ fontSize:"14px", color:"var(--text-muted)", fontWeight:400 }}>zł</span>
          </span>

          <button
            onClick={handleAdd}
            disabled={p.stock <= 0}
            style={{
              fontFamily:"var(--font-jost)", fontSize:"11px",
              fontWeight:500, letterSpacing:".2em", textTransform:"uppercase",
              color: p.stock <= 0 ? "var(--text-muted)" : "#F8F4EE",
              background: added ? "#4ade80" : p.stock <= 0 ? "rgba(0,0,0,.07)" : "var(--gold)",
              border:"none", padding:"7px 14px",
              cursor: p.stock <= 0 ? "not-allowed" : "pointer",
              transition:"background .25s",
            }}
            onMouseEnter={e => { if (!added && p.stock > 0) (e.currentTarget.style.background = "var(--gold-light)"); }}
            onMouseLeave={e => { if (!added && p.stock > 0) (e.currentTarget.style.background = "var(--gold)"); }}>
            {added ? "✓" : p.stock <= 0 ? "Brak" : "Dodaj"}
          </button>
        </div>
      </div>
    </article>
  );
}
