"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface Product {
  id: string; name: string; sku?: string;
  price: number; stock: number;
  description?: string; images?: string[];
  categoryId?: string; categoryName?: string;
}

export default function KatalogProductPage() {
  const { id }  = useParams<{ id: string }>();
  const router  = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [imgIdx,  setImgIdx]  = useState(0);
  const [imgErrs, setImgErrs] = useState<Record<number, boolean>>({});

  useEffect(() => {
    fetch("/api/products/public")
      .then(r => r.json())
      .then(d => {
        const all: Product[] = d.products ?? [];
        const found = all.find(p => p.id === id) ?? null;
        setProduct(found);
        if (found?.categoryId) {
          setRelated(all.filter(p => p.categoryId === found.categoryId && p.id !== id).slice(0, 4));
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div style={{ paddingTop:"120px", maxWidth:"1280px", margin:"0 auto", padding:"80px 60px" }}>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"80px" }}>
        <div style={{ aspectRatio:"1/1", background:"rgba(201,149,106,.06)" }}/>
        <div style={{ paddingTop:"16px" }}>
          <div style={{ height:"10px", width:"25%", background:"rgba(201,149,106,.08)", marginBottom:"20px" }}/>
          <div style={{ height:"40px", width:"75%", background:"rgba(201,149,106,.06)", marginBottom:"12px" }}/>
          <div style={{ height:"18px", width:"40%", background:"rgba(201,149,106,.05)", marginBottom:"40px" }}/>
          <div style={{ height:"32px", width:"50%", background:"rgba(201,149,106,.07)" }}/>
        </div>
      </div>
    </div>
  );

  if (!product) return (
    <div style={{ paddingTop:"108px", maxWidth:"1280px", margin:"0 auto", padding:"160px 60px", textAlign:"center" }}>
      <p style={{ fontFamily:"var(--font-cormorant)", fontSize:"28px", fontStyle:"italic", color:"rgba(154,107,32,.4)", marginBottom:"32px" }}>
        Produkt nie istnieje.
      </p>
      <button onClick={() => router.push("/katalog")} style={{
        fontFamily:"var(--font-jost)", fontSize:"10px", letterSpacing:".2em", textTransform:"uppercase",
        color:"var(--gold)", background:"none", border:"1px solid rgba(154,107,32,.3)",
        padding:"12px 28px", cursor:"pointer",
      }}>← Wróć do katalogu</button>
    </div>
  );

  const validImgs = (product.images ?? []).filter((_, i) => !imgErrs[i]);
  const catShort  = product.categoryName?.split("/").pop()?.trim();

  return (
    <div style={{ paddingTop:"56px", minHeight:"100vh", background:"var(--obsidian)" }}>
      <div className="mob-pad mob-pad-y" style={{ maxWidth:"1280px", margin:"0 auto", padding:"48px 60px 100px" }}>

        {/* BREADCRUMB */}
        <nav style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"48px" }}>
          <button onClick={() => router.push("/katalog")} style={{
            fontFamily:"var(--font-jost)", fontSize:"11px", letterSpacing:".18em", textTransform:"uppercase",
            color:"var(--text-muted)", background:"none", border:"none", cursor:"pointer", transition:"color .25s",
          }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--gold)")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}>
            ← Katalog
          </button>
          {catShort && (
            <>
              <span style={{ color:"rgba(154,107,32,.3)", fontSize:"12px" }}>›</span>
              <span style={{ fontFamily:"var(--font-jost)", fontSize:"11px", letterSpacing:".12em", color:"var(--text-muted)" }}>{catShort}</span>
            </>
          )}
        </nav>

        <div className="mob-grid-1" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"80px" }}>

          {/* GALLERY */}
          <div>
            <div style={{
              aspectRatio:"1/1", overflow:"hidden",
              background:"linear-gradient(to bottom, #F5F1EC, #FFFFFF)",
              border:"1px solid rgba(154,107,32,.14)",
              position:"relative",
            }}>
              {validImgs.length > 0 ? (
                <img
                  key={imgIdx}
                  src={validImgs[imgIdx] ?? validImgs[0]} alt={product.name}
                  onError={() => setImgErrs(p => ({ ...p, [imgIdx]: true }))}
                  style={{ width:"100%", height:"100%", objectFit:"contain", transition:"opacity .25s" }}
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
                  <button
                    onClick={() => setImgIdx(i => (i - 1 + validImgs.length) % validImgs.length)}
                    style={{
                      position:"absolute", left:"12px", top:"50%", transform:"translateY(-50%)",
                      width:"40px", height:"40px", display:"flex", alignItems:"center", justifyContent:"center",
                      background:"rgba(255,255,255,.85)", backdropFilter:"blur(4px)",
                      border:"1px solid rgba(154,107,32,.2)", cursor:"pointer", transition:"background .2s",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background="rgba(255,255,255,.97)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background="rgba(255,255,255,.85)"; }}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M10 3L5 8l5 5" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  <button
                    onClick={() => setImgIdx(i => (i + 1) % validImgs.length)}
                    style={{
                      position:"absolute", right:"12px", top:"50%", transform:"translateY(-50%)",
                      width:"40px", height:"40px", display:"flex", alignItems:"center", justifyContent:"center",
                      background:"rgba(255,255,255,.85)", backdropFilter:"blur(4px)",
                      border:"1px solid rgba(154,107,32,.2)", cursor:"pointer", transition:"background .2s",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background="rgba(255,255,255,.97)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background="rgba(255,255,255,.85)"; }}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M6 3l5 5-5 5" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>

                  <div style={{
                    position:"absolute", bottom:"12px", left:"50%", transform:"translateX(-50%)",
                    display:"flex", gap:"6px",
                  }}>
                    {validImgs.map((_, i) => (
                      <button key={i} onClick={() => setImgIdx(i)} style={{
                        width: imgIdx === i ? "20px" : "6px", height:"6px",
                        background: imgIdx === i ? "var(--gold)" : "rgba(154,107,32,.3)",
                        border:"none", cursor:"pointer", padding:0,
                        transition:"width .25s, background .25s",
                      }}/>
                    ))}
                  </div>
                </>
              )}
            </div>

            {validImgs.length > 1 && (
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:"4px", marginTop:"4px" }}>
                {validImgs.map((src, i) => (
                  <button key={i} onClick={() => setImgIdx(i)} style={{
                    aspectRatio:"1/1", overflow:"hidden",
                    background:"linear-gradient(to bottom, #F5F1EC, #FFFFFF)",
                    border: imgIdx === i ? "2px solid var(--gold)" : "1px solid rgba(154,107,32,.12)",
                    cursor:"pointer", transition:"border-color .2s", padding:0,
                  }}>
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
                fontFamily:"var(--font-cinzel)", fontSize:"10px", letterSpacing:".4em", textTransform:"uppercase",
                color:"var(--gold)", marginBottom:"20px",
              }}>{catShort}</p>
            )}

            <h1 style={{
              fontFamily:"var(--font-cormorant)", fontSize:"clamp(28px, 3vw, 40px)",
              fontWeight:400, lineHeight:1.1, color:"var(--pearl)", marginBottom:"12px",
            }}>{product.name}</h1>

            {product.sku && (
              <p style={{
                fontFamily:"var(--font-jost)", fontSize:"13px", letterSpacing:".08em",
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
                    fontFamily:"var(--font-cormorant)", fontSize:"56px", fontWeight:400, lineHeight:1,
                    color:"var(--gold)", letterSpacing:"-.02em",
                  }}>{product.price.toFixed(2)}</span>
                  <span style={{ fontFamily:"var(--font-cormorant)", fontSize:"20px", color:"var(--text-muted)" }}>zł</span>
                </div>
                <div style={{ textAlign:"right" }}>
                  {product.stock <= 0 ? (
                    <p style={{ fontFamily:"var(--font-jost)", fontSize:"13px", letterSpacing:".06em", color:"var(--text-muted)" }}>Niedostępny</p>
                  ) : product.stock <= 5 ? (
                    <p style={{ fontFamily:"var(--font-jost)", fontSize:"13px", letterSpacing:".06em", color:"var(--gold)" }}>Ostatnie {product.stock} szt.</p>
                  ) : (
                    <p style={{ fontFamily:"var(--font-jost)", fontSize:"13px", letterSpacing:".06em", color:"var(--text-muted)" }}>W magazynie</p>
                  )}
                </div>
              </div>
            </div>

            {/* ORDER BUTTON */}
            <a href="/login" style={{
              display:"block", textAlign:"center",
              fontFamily:"var(--font-jost)", fontSize:"10px",
              fontWeight:500, letterSpacing:".25em", textTransform:"uppercase",
              color:"#F8F4EE", background: product.stock <= 0 ? "rgba(154,107,32,.3)" : "var(--gold)",
              border:"none", padding:"16px 0", textDecoration:"none",
              transition:"background .25s",
              pointerEvents: product.stock <= 0 ? "none" : "auto",
            }}
              onMouseEnter={e => { if (product.stock > 0) (e.currentTarget as HTMLElement).style.background = "var(--gold-light)"; }}
              onMouseLeave={e => { if (product.stock > 0) (e.currentTarget as HTMLElement).style.background = "var(--gold)"; }}>
              {product.stock <= 0 ? "Brak w magazynie" : "Zaloguj się aby zamówić →"}
            </a>

            <p style={{
              fontFamily:"var(--font-jost)", fontSize:"11px", letterSpacing:".04em",
              color:"var(--text-muted)", textAlign:"center", marginTop:"14px",
            }}>
              Aby złożyć zamówienie, zaloguj się do sklepu
            </p>
          </div>
        </div>

        {/* DESCRIPTION */}
        {product.description && (
          <div style={{ marginTop:"80px", paddingTop:"60px", borderTop:"1px solid rgba(154,107,32,.1)" }}>
            <p style={{
              fontFamily:"var(--font-cinzel)", fontSize:"10px", letterSpacing:".45em", textTransform:"uppercase",
              color:"var(--gold)", marginBottom:"32px",
            }}>Opis produktu</p>
            <div
              style={{
                maxWidth:"680px",
                fontFamily:"var(--font-jost)", fontSize:"16px", fontWeight:400, lineHeight:1.9,
                color:"var(--pearl)",
              }}
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          </div>
        )}

        {/* RELATED */}
        {related.length > 0 && (
          <div style={{ marginTop:"80px", paddingTop:"60px", borderTop:"1px solid rgba(154,107,32,.1)" }}>
            <p style={{
              fontFamily:"var(--font-cinzel)", fontSize:"10px", letterSpacing:".45em", textTransform:"uppercase",
              color:"var(--gold)", marginBottom:"40px",
            }}>Podobne produkty</p>
            <div className="mob-grid-2" style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:"2px" }}>
              {related.map(p => (
                <RelatedCard key={p.id} product={p} onNavigate={() => router.push(`/katalog/${p.id}`)} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

function RelatedCard({ product: p, onNavigate }: { product: Product; onNavigate: () => void }) {
  const [imgErr, setImgErr] = useState(false);
  const img = !imgErr ? p.images?.[0] : null;
  const catShort = p.categoryName?.split("/").pop()?.trim();

  return (
    <article onClick={onNavigate} style={{
      background:"#FFFFFF", border:"1px solid rgba(154,107,32,.1)", overflow:"hidden",
      cursor:"pointer", display:"flex", flexDirection:"column",
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
      }}>
      <div style={{ aspectRatio:"1/1", overflow:"hidden", background:"var(--onyx)" }}>
        {img ? (
          <img src={img} alt={p.name} onError={() => setImgErr(true)}
            style={{ width:"100%", height:"100%", objectFit:"cover", transition:"transform .5s cubic-bezier(.16,1,.3,1)" }}/>
        ) : (
          <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <svg width="36" height="36" viewBox="0 0 40 40" fill="none" style={{ opacity:.1 }}>
              <rect x="4" y="4" width="32" height="32" stroke="var(--gold)" strokeWidth="1"/>
              <path d="M4 27l9-9 7 7 5-5 11 11" stroke="var(--gold)" strokeWidth="1" strokeLinejoin="round"/>
            </svg>
          </div>
        )}
      </div>
      <div style={{ padding:"16px", borderTop:"1px solid rgba(154,107,32,.07)", display:"flex", flexDirection:"column", flex:1 }}>
        {catShort && (
          <p style={{ fontFamily:"var(--font-cinzel)", fontSize:"7.5px", letterSpacing:".3em", textTransform:"uppercase", color:"var(--gold)", marginBottom:"8px" }}>{catShort}</p>
        )}
        <h3 style={{
          fontFamily:"var(--font-cormorant)", fontSize:"16px", fontWeight:400, lineHeight:1.25,
          color:"var(--pearl)", flex:1, marginBottom:"12px",
          display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden",
        }}>{p.name}</h3>
        <div style={{ borderTop:"1px solid rgba(154,107,32,.08)", paddingTop:"12px" }}>
          <span style={{ fontFamily:"var(--font-cormorant)", fontSize:"20px", fontWeight:400, color:"var(--gold)" }}>
            {p.price.toFixed(2)}{" "}
            <span style={{ fontSize:"12px", color:"var(--text-muted)", fontWeight:400 }}>zł</span>
          </span>
        </div>
      </div>
    </article>
  );
}
