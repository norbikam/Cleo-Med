"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Client { id: string; phone: string; name: string | null; email: string | null; role: string; }

export default function AccountPage() {
  const [client, setClient] = useState<Client | null>(null);

  useEffect(() => {
    fetch("/api/account")
      .then(r => r.json())
      .then(d => { setClient(d.client); });
  }, []);

  if (!client) return (
    <div style={{
      paddingTop:"108px", minHeight:"100vh", background:"var(--obsidian)",
      display:"flex", alignItems:"center", justifyContent:"center",
    }}>
      <p style={{ fontFamily:"var(--font-cormorant)", fontSize:"24px", fontStyle:"italic", color:"rgba(201,149,106,.35)" }}>
        Ładowanie...
      </p>
    </div>
  );

  return (
    <div style={{ paddingTop:"108px", minHeight:"100vh", background:"var(--obsidian)" }}>
      <div style={{ maxWidth:"560px", margin:"0 auto", padding:"60px 24px 100px" }}>

        {/* HEADER */}
        <p style={{
          fontFamily:"var(--font-cinzel)", fontSize:"10px",
          letterSpacing:".5em", textTransform:"uppercase",
          color:"var(--gold)", marginBottom:"16px",
        }}>Panel klienta</p>
        <h1 style={{
          fontFamily:"var(--font-cormorant)",
          fontSize:"48px", fontWeight:400, lineHeight:.95,
          color:"var(--pearl)", marginBottom:"48px",
        }}>Moje<br/><em style={{ fontStyle:"italic", color:"var(--gold)" }}>konto</em></h1>

        <div style={{ height:"1px", background:"rgba(201,149,106,.1)", marginBottom:"32px" }}/>

        {/* PHONE (read-only) */}
        <div style={{
          padding:"20px 24px", marginBottom:"16px",
          border:"1px solid rgba(201,149,106,.1)",
        }}>
          <p style={{
            fontFamily:"var(--font-cinzel)", fontSize:"8px",
            letterSpacing:".3em", textTransform:"uppercase",
            color:"rgba(100,75,50,.45)", marginBottom:"8px",
          }}>Numer telefonu</p>
          <p style={{
            fontFamily:"var(--font-cormorant)", fontSize:"22px", fontWeight:400,
            color:"var(--pearl)",
          }}>{client.phone}</p>
        </div>

        {/* ADDRESSES LINK */}
        <Link href="/account/addresses"
          style={{
            display:"flex", alignItems:"center", justifyContent:"space-between",
            padding:"20px 24px",
            border:"1px solid rgba(201,149,106,.1)",
            fontFamily:"var(--font-jost)", fontSize:"13px", fontWeight:400,
            color:"var(--text-muted)",
            textDecoration:"none",
            transition:"border-color .3s, color .3s",
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(201,149,106,.3)"; (e.currentTarget as HTMLElement).style.color = "var(--pearl)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(201,149,106,.1)"; (e.currentTarget as HTMLElement).style.color = "var(--text-muted)"; }}>
          <span>Zarządzaj adresami dostawy</span>
          <span style={{ color:"var(--gold)", fontSize:"16px" }}>→</span>
        </Link>

      </div>
    </div>
  );
}
