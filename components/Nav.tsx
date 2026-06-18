"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useCart } from "@/lib/cart/context";

const BASE_LINKS = [
  { href: "/catalog", label: "Katalog" },
  { href: "/orders",  label: "Zamówienia" },
  { href: "/account", label: "Konto" },
];

export default function Nav({ isAdmin }: { isAdmin?: boolean }) {
  const links = isAdmin
    ? [...BASE_LINKS, { href: "/admin", label: "Panel Admina" }]
    : BASE_LINKS;
  const pathname = usePathname();
  const router   = useRouter();
  const [menuOpen,     setMenuOpen]     = useState(false);
  const [searchOpen,   setSearchOpen]   = useState(false);
  const [searchClosing, setSearchClosing] = useState(false);
  const [menuClosing,   setMenuClosing]   = useState(false);
  const [query,        setQuery]        = useState("");
  const [scrolled,     setScrolled]     = useState(false);
  const [barH,         setBarH]         = useState(36);
  const [allProds,     setAllProds]     = useState<{id:string; name:string; images?:string[]; price:number}[]>([]);
  const searchTimer = useRef<ReturnType<typeof setTimeout>>();
  const menuTimer   = useRef<ReturnType<typeof setTimeout>>();
  const { items } = useCart();
  const count = items.reduce((s, i) => s + i.qty, 0);

  useEffect(() => {
    const bar = document.getElementById("ann-bar");
    if (!bar) return;
    const measure = () => {
      const h = bar.offsetHeight;
      setBarH(h);
      document.documentElement.style.setProperty("--nav-bottom", `${h + 72}px`);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(bar);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape") { closeSearch(); closeMenu(); }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);

  useEffect(() => {
    clearTimeout(searchTimer.current);
    clearTimeout(menuTimer.current);
    setSearchOpen(false); setSearchClosing(false); setQuery("");
    setMenuOpen(false);   setMenuClosing(false);
  }, [pathname]);

  useEffect(() => {
    if (!searchOpen || allProds.length > 0) return;
    fetch("/api/products").then(r => r.json()).then(d => setAllProds(d.products ?? []));
  }, [searchOpen]);

  function closeSearch() {
    if (!searchOpen && !searchClosing) return;
    clearTimeout(searchTimer.current);
    setSearchClosing(true);
    searchTimer.current = setTimeout(() => {
      setSearchOpen(false); setSearchClosing(false); setQuery("");
    }, 220);
  }

  function closeMenu() {
    if (!menuOpen && !menuClosing) return;
    clearTimeout(menuTimer.current);
    setMenuClosing(true);
    menuTimer.current = setTimeout(() => {
      setMenuOpen(false); setMenuClosing(false);
    }, 220);
  }

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    closeSearch();
    router.push("/catalog");
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  const overlay: React.CSSProperties = {
    position:"fixed", inset:0, zIndex:50,
    background:"rgba(20,15,10,.88)",
    backdropFilter:"blur(20px)",
    WebkitBackdropFilter:"blur(20px)",
  };

  const results = query.length >= 1
    ? allProds.filter(p => p.name.toLowerCase().includes(query.toLowerCase())).slice(0, 8)
    : [];

  return (
    <>
      {/* ── WYSZUKIWANIE ── */}
      {(searchOpen || searchClosing) && (
        <div
          style={{ ...overlay, paddingTop:"18vh" }}
          className={`flex items-start justify-center ${searchClosing ? "animate-fadeOut" : "animate-fadeIn"}`}
          onClick={closeSearch}
        >
          <div
            className={`w-full ${searchClosing ? "animate-scaleOut" : "animate-scaleIn"}`}
            style={{ maxWidth:"520px", padding:"0 24px" }}
            onClick={e => e.stopPropagation()}
          >
            <form onSubmit={submitSearch} style={{ position:"relative" }}>
              <input
                autoFocus
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Szukaj produktu..."
                style={{
                  display:"block", width:"100%", height:"52px",
                  padding:"0 44px 0 0",
                  fontFamily:"var(--font-jost)", fontSize:"18px", fontWeight:400,
                  letterSpacing:".04em",
                  background:"transparent", border:"none",
                  borderBottom:"1px solid rgba(248,244,238,.25)",
                  color:"#F8F4EE", outline:"none",
                }}
                onFocus={e => (e.currentTarget.style.borderBottomColor = "rgba(201,149,106,.8)")}
                onBlur={e  => (e.currentTarget.style.borderBottomColor = "rgba(248,244,238,.25)")}
              />
              <button type="submit" style={{
                position:"absolute", right:"0", top:"50%", transform:"translateY(-50%)",
                background:"none", border:"none", cursor:"pointer", padding:"4px",
                display:"flex", alignItems:"center", justifyContent:"center",
                color:"rgba(248,244,238,.5)",
              }}>
                <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                  <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.4"/>
                  <path d="M10.5 10.5l3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                </svg>
              </button>
            </form>

            {results.length > 0 && (
              <div style={{ marginTop:"28px" }}>
                <div style={{ height:"1px", background:"rgba(248,244,238,.08)", marginBottom:"20px" }}/>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"4px" }}>
                  {results.map(p => (
                    <button key={p.id}
                      onClick={() => { closeSearch(); router.push(`/catalog/${p.id}`); }}
                      style={{
                        display:"flex", alignItems:"center", gap:"12px",
                        padding:"10px 8px", background:"none", border:"none",
                        cursor:"pointer", textAlign:"left",
                        transition:"background .15s",
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = "rgba(248,244,238,.05)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "none")}>
                      {p.images?.[0] ? (
                        <img src={p.images[0]} alt=""
                          style={{ width:"52px", height:"52px", objectFit:"contain", flexShrink:0, opacity:.9 }}/>
                      ) : (
                        <div style={{ width:"52px", height:"52px", flexShrink:0, background:"rgba(248,244,238,.05)" }}/>
                      )}
                      <span style={{
                        fontFamily:"var(--font-jost)", fontSize:"14px", fontWeight:400,
                        color:"rgba(248,244,238,.8)", lineHeight:1.4,
                      }}>{p.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── MOBILE MENU ── */}
      {(menuOpen || menuClosing) && (
        <div
          style={{ ...overlay, zIndex:50 }}
          className={`sm:hidden flex flex-col items-center justify-center ${menuClosing ? "animate-fadeOut" : "animate-fadeIn"}`}
          onClick={closeMenu}
        >
          <div
            className={menuClosing ? "animate-scaleOut" : "animate-scaleIn"}
            onClick={e => e.stopPropagation()}
            style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"4px", width:"100%" }}
          >
            {links.map(l => (
              <Link key={l.href} href={l.href} onClick={closeMenu}
                style={{
                  display:"block", padding:"20px 40px", width:"100%", textAlign:"center",
                  fontFamily:"var(--font-jost)", fontSize:"18px",
                  fontWeight: pathname.startsWith(l.href) ? 700 : 500,
                  letterSpacing:".2em", textTransform:"uppercase",
                  color: pathname.startsWith(l.href) ? "var(--gold)" : "rgba(248,244,238,.75)",
                  textDecoration:"none",
                }}>
                {l.label}
              </Link>
            ))}
            <div style={{ width:"32px", height:"1px", background:"rgba(201,149,106,.25)", margin:"12px 0 8px" }}/>
            <button onClick={() => { closeMenu(); logout(); }}
              style={{
                padding:"12px 40px",
                fontFamily:"var(--font-jost)", fontSize:"14px", letterSpacing:".2em",
                textTransform:"uppercase", color:"rgba(248,244,238,.35)",
                background:"none", border:"none", cursor:"pointer",
              }}>
              Wyloguj
            </button>
          </div>
        </div>
      )}

      {/* ── NAV ── */}
      <header
        className="fixed left-0 right-0 z-40 mob-pad-nav"
        style={{
          top: barH,
          padding:"0 60px", height:"72px",
          display:"flex", alignItems:"center", justifyContent:"space-between",
          background: scrolled ? "rgba(245,241,236,.97)" : "linear-gradient(to bottom, rgba(245,241,236,.92), transparent)",
          backdropFilter: scrolled ? "blur(14px)" : "none",
          borderBottom: scrolled ? "1px solid rgba(154,107,32,.12)" : "none",
          transition:"background .4s, border-color .4s, backdrop-filter .4s, top .15s",
        }}
      >
        <Link href="/catalog" style={{ textDecoration:"none" }}>
          <span style={{ fontFamily:"var(--font-cinzel)", fontSize:"18px", fontWeight:500, letterSpacing:".2em", color:"var(--gold)" }}>
            CLEO<span style={{ color:"var(--pearl)", fontWeight:400 }}>MED</span>
          </span>
        </Link>

        {/* DESKTOP */}
        <nav className="hidden sm:flex" style={{ alignItems:"center", gap:"8px" }}>
          {links.map(l => {
            const isActive = pathname.startsWith(l.href);
            return (
              <Link key={l.href} href={l.href}
                style={{ padding:"8px 16px", fontFamily:"var(--font-jost)", fontSize:"13px", fontWeight:600, letterSpacing:".15em", textTransform:"uppercase", color: isActive ? "var(--gold)" : "var(--pearl)", textDecoration:"none", transition:"color .3s" }}
                onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.color = "var(--gold)"; }}
                onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.color = "var(--pearl)"; }}
              >{l.label}</Link>
            );
          })}
          <button onClick={() => setSearchOpen(true)}
            style={{ marginLeft:"8px", padding:"8px", background:"none", border:"none", cursor:"pointer", color:"var(--text-muted)", transition:"color .3s", display:"flex", alignItems:"center" }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--gold-light)")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}>
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
              <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.4"/>
              <path d="M10.5 10.5l3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
          </button>
          <div style={{ width:"1px", height:"14px", background:"rgba(201,149,106,.15)", margin:"0 8px" }} />
          <Link href="/cart"
            style={{ display:"flex", alignItems:"center", gap:"8px", padding:"9px 24px", fontFamily:"var(--font-jost)", fontSize:"13px", fontWeight:500, letterSpacing:".22em", textTransform:"uppercase", color:"var(--obsidian)", background:"var(--gold)", textDecoration:"none", transition:"background .3s" }}
            onMouseEnter={e => (e.currentTarget.style.background = "var(--gold-light)")}
            onMouseLeave={e => (e.currentTarget.style.background = "var(--gold)")}>
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
              <path d="M1 1h2.5l1.8 8h7l1.5-5H4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="7" cy="13" r="1" fill="currentColor"/>
              <circle cx="12" cy="13" r="1" fill="currentColor"/>
            </svg>
            Koszyk
            {count > 0 && (
              <span style={{ fontFamily:"var(--font-jost)", fontSize:"13px", fontWeight:600, background:"var(--pearl)", color:"var(--gold)", height:"16px", minWidth:"16px", padding:"0 3px", display:"flex", alignItems:"center", justifyContent:"center" }}>{count}</span>
            )}
          </Link>
          <button onClick={logout}
            style={{ marginLeft:"4px", padding:"4px 8px", fontFamily:"var(--font-jost)", fontSize:"13px", letterSpacing:".1em", color:"var(--text-muted)", background:"none", border:"none", cursor:"pointer", transition:"color .3s" }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--pearl)")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}>
            Wyloguj
          </button>
        </nav>

        {/* MOBILE */}
        <div className="flex sm:hidden" style={{ alignItems:"center", gap:"4px" }}>
          <button onClick={() => { setSearchOpen(true); closeMenu(); }}
            style={{ padding:"8px", background:"none", border:"none", cursor:"pointer", color:"var(--text-muted)" }}>
            <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
              <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.4"/>
              <path d="M10.5 10.5l3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
          </button>
          <Link href="/cart" style={{ padding:"8px", color:"var(--gold)", textDecoration:"none", position:"relative" }}>
            <svg width="22" height="22" viewBox="0 0 16 16" fill="none">
              <path d="M1 1h2.5l1.8 8h7l1.5-5H4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="7" cy="13" r="1" fill="currentColor"/>
              <circle cx="12" cy="13" r="1" fill="currentColor"/>
            </svg>
            {count > 0 && (
              <span style={{ position:"absolute", top:"4px", right:"4px", fontSize:"11px", fontWeight:700, background:"var(--gold)", color:"var(--obsidian)", width:"13px", height:"13px", display:"flex", alignItems:"center", justifyContent:"center" }}>{count}</span>
            )}
          </Link>
          <button onClick={() => { if (menuOpen || menuClosing) closeMenu(); else { setMenuOpen(true); closeSearch(); } }}
            style={{ padding:"8px", background:"none", border:"none", cursor:"pointer", color:"var(--text-muted)" }}>
            <svg width="22" height="22" viewBox="0 0 20 20" fill="currentColor">
              {(menuOpen && !menuClosing)
                ? <path fillRule="evenodd" clipRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/>
                : <path fillRule="evenodd" clipRule="evenodd" d="M3 5h14a1 1 0 010 2H3a1 1 0 010-2zm0 4h14a1 1 0 010 2H3a1 1 0 010-2zm0 4h14a1 1 0 010 2H3a1 1 0 010-2z"/>
              }
            </svg>
          </button>
        </div>
      </header>
    </>
  );
}
