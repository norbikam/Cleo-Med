"use client";

import Link from "next/link";

export default function KatalogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <header style={{
        position:"fixed", top:0, left:0, right:0, zIndex:40,
        height:"56px", background:"rgba(245,241,236,.98)",
        backdropFilter:"blur(14px)",
        borderBottom:"1px solid rgba(154,107,32,.1)",
        display:"flex", alignItems:"center", padding:"0 40px",
        justifyContent:"space-between",
      }}>
        <Link href="/landing" style={{ textDecoration:"none" }}>
          <span style={{ fontFamily:"var(--font-cinzel)", fontSize:"16px", fontWeight:500, letterSpacing:".2em", color:"var(--gold)" }}>
            CLEO<span style={{ color:"var(--pearl)", fontWeight:400 }}>MED</span>
          </span>
        </Link>
        <Link href="/login" style={{
          fontFamily:"var(--font-jost)", fontSize:"10px",
          letterSpacing:".2em", textTransform:"uppercase",
          color:"var(--text-muted)", textDecoration:"none",
          transition:"color .2s",
          padding:"8px 20px", border:"1px solid rgba(154,107,32,.2)",
        }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "var(--gold)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(154,107,32,.5)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "var(--text-muted)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(154,107,32,.2)"; }}>
          Zaloguj do sklepu →
        </Link>
      </header>
      <main style={{ paddingTop:"56px" }}>{children}</main>
    </div>
  );
}
