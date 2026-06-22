"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const tabs = [
  { href: "/admin",          label: "Pulpit",          exact: true },
  { href: "/admin/orders",   label: "Zamówienia",      exact: false },
  { href: "/admin/codes",    label: "Kody rabatowe",   exact: false },
  { href: "/admin/content",  label: "Treści",          exact: false },
  { href: "/admin/admins",   label: "Administratorzy", exact: false },
];

export default function AdminNav() {
  const pathname = usePathname();
  const router   = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <>
      <header style={{
        position:"fixed", top:0, left:0, right:0, zIndex:100,
        height:"56px", background:"rgba(28,21,16,.98)",
        backdropFilter:"blur(12px)",
        borderBottom:"1px solid rgba(201,149,106,.12)",
        display:"flex", alignItems:"center", padding:"0 16px",
        gap:"16px",
      }}>
        {/* Logo */}
        <Link href="/admin" style={{ textDecoration:"none", flexShrink:0 }}>
          <span style={{ fontFamily:"var(--font-cinzel)", fontSize:"14px", fontWeight:500, letterSpacing:".2em", color:"var(--gold)" }}>
            CLEO<span style={{ color:"rgba(248,244,238,.6)", fontWeight:400 }}>MED</span>
          </span>
          <span style={{ fontFamily:"var(--font-jost)", fontSize:"8px", letterSpacing:".35em", textTransform:"uppercase", color:"rgba(201,149,106,.5)", marginLeft:"8px" }}>
            ADMIN
          </span>
        </Link>

        {/* Desktop nav tabs */}
        <nav style={{ display:"flex", alignItems:"center", gap:"2px", flex:1 }} className="admin-nav-desktop">
          {tabs.map(t => {
            const active = t.exact ? pathname === t.href : pathname.startsWith(t.href);
            return (
              <Link key={t.href} href={t.href} style={{
                padding:"6px 12px",
                fontFamily:"var(--font-jost)", fontSize:"10px",
                letterSpacing:".18em", textTransform:"uppercase",
                color: active ? "#F8F4EE" : "rgba(248,244,238,.4)",
                textDecoration:"none",
                borderBottom: active ? "1px solid var(--gold)" : "1px solid transparent",
                transition:"color .2s, border-color .2s",
                whiteSpace:"nowrap",
              }}>{t.label}</Link>
            );
          })}
        </nav>

        <div style={{ flex:1 }} className="admin-nav-mobile-spacer"/>

        {/* Desktop right */}
        <div style={{ display:"flex", alignItems:"center", gap:"12px", flexShrink:0 }} className="admin-nav-desktop">
          <Link href="/catalog" style={{ fontFamily:"var(--font-jost)", fontSize:"10px", letterSpacing:".15em", textTransform:"uppercase", color:"rgba(248,244,238,.3)", textDecoration:"none", transition:"color .2s" }}
            onMouseEnter={e => (e.currentTarget.style.color = "rgba(248,244,238,.7)")}
            onMouseLeave={e => (e.currentTarget.style.color = "rgba(248,244,238,.3)")}>
            Sklep →
          </Link>
          <button onClick={logout} style={{ fontFamily:"var(--font-jost)", fontSize:"10px", letterSpacing:".15em", textTransform:"uppercase", color:"rgba(248,244,238,.25)", background:"none", border:"none", cursor:"pointer", transition:"color .2s" }}
            onMouseEnter={e => (e.currentTarget.style.color = "rgba(248,244,238,.6)")}
            onMouseLeave={e => (e.currentTarget.style.color = "rgba(248,244,238,.25)")}>
            Wyloguj
          </button>
        </div>

        {/* Mobile hamburger */}
        <button onClick={() => setMenuOpen(v => !v)} className="admin-nav-mobile-btn" style={{
          background:"none", border:"none", cursor:"pointer", padding:"8px",
          color:"rgba(248,244,238,.6)", fontSize:"20px", lineHeight:1, flexShrink:0,
        }}>
          {menuOpen ? "✕" : "☰"}
        </button>
      </header>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="admin-nav-mobile-menu" style={{
          position:"fixed", top:"56px", left:0, right:0, zIndex:99,
          background:"rgba(20,15,10,.98)", borderBottom:"1px solid rgba(201,149,106,.12)",
          padding:"8px 0",
        }}>
          {tabs.map(t => {
            const active = t.exact ? pathname === t.href : pathname.startsWith(t.href);
            return (
              <Link key={t.href} href={t.href} onClick={() => setMenuOpen(false)} style={{
                display:"block", padding:"14px 20px",
                fontFamily:"var(--font-jost)", fontSize:"12px",
                letterSpacing:".18em", textTransform:"uppercase",
                color: active ? "var(--gold)" : "rgba(248,244,238,.5)",
                textDecoration:"none", borderBottom:"1px solid rgba(201,149,106,.06)",
              }}>{t.label}</Link>
            );
          })}
          <Link href="/catalog" onClick={() => setMenuOpen(false)} style={{ display:"block", padding:"14px 20px", fontFamily:"var(--font-jost)", fontSize:"12px", letterSpacing:".18em", textTransform:"uppercase", color:"rgba(248,244,238,.3)", textDecoration:"none", borderBottom:"1px solid rgba(201,149,106,.06)" }}>
            Sklep →
          </Link>
          <button onClick={logout} style={{ display:"block", width:"100%", textAlign:"left", padding:"14px 20px", fontFamily:"var(--font-jost)", fontSize:"12px", letterSpacing:".18em", textTransform:"uppercase", color:"rgba(248,244,238,.25)", background:"none", border:"none", cursor:"pointer" }}>
            Wyloguj
          </button>
        </div>
      )}

      <style>{`
        .admin-nav-desktop { display: flex !important; }
        .admin-nav-mobile-btn { display: none !important; }
        .admin-nav-mobile-spacer { display: none !important; }
        .admin-nav-mobile-menu { display: block; }
        @media (max-width: 680px) {
          .admin-nav-desktop { display: none !important; }
          .admin-nav-mobile-btn { display: block !important; }
          .admin-nav-mobile-spacer { display: block !important; }
        }
      `}</style>
    </>
  );
}
