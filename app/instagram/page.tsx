"use client";

import { useEffect, useRef, useState } from "react";

interface Product {
  id: string; name: string;
  price: number; stock: number; images?: string[];
  categoryId?: string; categoryName?: string;
}

const EXCLUDED = ["znieczul", "toksyn"];

function shortName(s: string) {
  const p = s.split("/");
  return p[p.length - 1].trim();
}

export default function InstagramPage() {
  const [products,   setProducts]   = useState<Product[]>([]);
  const [categories, setCategories] = useState<Record<string, string>>({});
  const [active,     setActive]     = useState("all");
  const [loading,    setLoading]    = useState(true);
  const [gridKey,    setGridKey]    = useState(0);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/products/public")
      .then(r => r.json())
      .then(d => {
        const all: Product[] = d.products ?? [];
        const filtered = all.filter(p => {
          const cat = (p.categoryName ?? "").toLowerCase();
          return !EXCLUDED.some(ex => cat.includes(ex));
        });
        setProducts(filtered);
        setCategories(d.categories ?? {});
      })
      .finally(() => setLoading(false));
  }, []);

  const usedCats = Array.from(new Set(products.map(p => p.categoryId).filter(Boolean))) as string[];

  const catOrder: Record<string, number> = {};
  products.forEach(p => { if (p.categoryId && !(p.categoryId in catOrder)) catOrder[p.categoryId] = Object.keys(catOrder).length; });

  const filtered = products
    .filter(p => active === "all" || p.categoryId === active)
    .sort((a, b) => {
      if (active !== "all") return 0;
      return (catOrder[a.categoryId ?? ""] ?? 999) - (catOrder[b.categoryId ?? ""] ?? 999);
    });

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

  return (
    <div style={{ minHeight: "100vh", background: "var(--obsidian)" }}>

      {/* Header */}
      <div style={{ background: "#0a0a0a", borderBottom: "1px solid rgba(201,149,106,.08)", padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ fontFamily: "var(--font-cinzel)", fontSize: "15px", fontWeight: 500, letterSpacing: ".25em", color: "var(--gold)", margin: 0 }}>CLEOMED</p>
      </div>

      {/* Hero */}
      <section style={{ borderBottom: "1px solid rgba(201,149,106,.08)" }}>
        <div className="mob-pad" style={{ maxWidth: "1600px", margin: "0 auto", padding: "48px 60px 36px" }}>
          <p style={{ fontFamily: "var(--font-cinzel)", fontSize: "13px", letterSpacing: ".5em", textTransform: "uppercase", color: "var(--gold)", marginBottom: "16px" }}>
            Katalog produktów
          </p>
          <h1 style={{ fontFamily: "var(--font-cormorant)", fontSize: "clamp(42px,5vw,72px)", fontWeight: 400, lineHeight: .95, color: "var(--pearl)" }}>
            Nasze<br /><em style={{ fontStyle: "italic", color: "var(--gold)" }}>produkty</em>
          </h1>
          {!loading && (
            <p style={{ fontFamily: "var(--font-jost)", fontSize: "13px", color: "var(--text-muted)", marginTop: "16px" }}>
              {products.length} produktów · {usedCats.length} kategorii
            </p>
          )}
        </div>
      </section>

      {/* Filter tabs */}
      <div style={{ position: "sticky", top: 0, zIndex: 20, background: "rgba(245,241,236,.97)", backdropFilter: "blur(14px)", borderBottom: "1px solid rgba(154,107,32,.1)" }}>
        <div className="mob-pad" style={{ maxWidth: "1600px", margin: "0 auto", padding: "0 60px", display: "flex", overflowX: "auto", scrollbarWidth: "none" }}>
          {[
            { id: "all", label: "Wszystkie", count: products.length },
            ...usedCats.map(id => ({ id, label: shortName(categories[id] ?? id), count: products.filter(p => p.categoryId === id).length })),
          ].map(tab => {
            const isActive = active === tab.id;
            return (
              <button key={tab.id} onClick={() => changeCategory(tab.id)} style={{
                flexShrink: 0, padding: "14px 12px",
                fontFamily: "var(--font-jost)", fontSize: "13px",
                fontWeight: isActive ? 600 : 400, letterSpacing: ".12em", textTransform: "uppercase",
                color: isActive ? "var(--pearl)" : "var(--text-muted)",
                background: "none", border: "none", cursor: "pointer",
                borderBottom: isActive ? "2px solid var(--gold)" : "2px solid transparent",
                transition: "color .2s, border-color .2s", whiteSpace: "nowrap",
              }}>
                {tab.label}
                <span style={{ marginLeft: "6px", fontSize: "11px", color: isActive ? "var(--gold)" : "var(--text-muted)" }}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid */}
      <div className="mob-pad" style={{ maxWidth: "1600px", margin: "0 auto", padding: "32px 60px 80px" }}>
        {loading ? (
          <p style={{ fontFamily: "var(--font-jost)", fontSize: "14px", color: "var(--text-muted)", textAlign: "center", paddingTop: "60px" }}>
            Ładowanie produktów...
          </p>
        ) : (
          <div key={gridKey} ref={gridRef} className="grid-stagger catalog-grid">
            {filtered.map(p => (
              <div key={p.id} className="pcard">
                {/* Image */}
                <div style={{ position: "relative", paddingTop: "100%", overflow: "hidden", background: "#f8f8f8" }}>
                  {p.images?.[0] ? (
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      className="card-img"
                      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", padding: "12px", transition: "transform .6s cubic-bezier(.16,1,.3,1)" }}
                    />
                  ) : (
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontFamily: "var(--font-cinzel)", fontSize: "11px", letterSpacing: ".2em", color: "rgba(154,107,32,.3)" }}>CLEOMED</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div style={{ padding: "14px 16px 18px" }}>
                  <p style={{ fontFamily: "var(--font-jost)", fontSize: "13px", fontWeight: 500, color: "var(--pearl)", lineHeight: 1.4, marginBottom: "6px" }}>
                    {p.name}
                  </p>
                  {p.categoryName && (
                    <p style={{ fontFamily: "var(--font-jost)", fontSize: "11px", color: "var(--text-muted)", letterSpacing: ".06em" }}>
                      {shortName(p.categoryName)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ borderTop: "1px solid rgba(154,107,32,.08)", padding: "24px", textAlign: "center" }}>
        <p style={{ fontFamily: "var(--font-jost)", fontSize: "12px", color: "var(--text-muted)", letterSpacing: ".06em" }}>
          © 2025 Cleo Med · Dystrybucja B2B
        </p>
      </div>
    </div>
  );
}
