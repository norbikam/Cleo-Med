"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Client { id: string; phone: string; name: string | null; email: string | null; role: string; }

export default function AccountPage() {
  const [client, setClient] = useState<Client | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/account").then(r => r.json()).then(d => setClient(d.client));
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  if (!client) return (
    <div style={{ paddingTop:"108px", minHeight:"100vh", background:"var(--obsidian)", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <p style={{ fontFamily:"var(--font-cormorant)", fontSize:"24px", fontStyle:"italic", color:"rgba(201,149,106,.35)" }}>Ładowanie...</p>
    </div>
  );

  const displayName = client.name ?? client.phone;
  const initials = client.name
    ? client.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)
    : client.phone.slice(-2);

  return (
    <div style={{ paddingTop:"108px", minHeight:"100vh", background:"var(--obsidian)" }}>
      <div style={{ maxWidth:"760px", margin:"0 auto", padding:"60px 24px 120px" }}>

        {/* HEADER */}
        <p style={{ fontFamily:"var(--font-cinzel)", fontSize:"11px", letterSpacing:".5em", textTransform:"uppercase", color:"var(--gold)", marginBottom:"20px" }}>
          Panel klienta
        </p>

        <div style={{ marginBottom:"48px" }}>
          <h1 style={{ fontFamily:"var(--font-cormorant)", fontSize:"clamp(48px,6vw,72px)", fontWeight:400, lineHeight:.92, color:"var(--pearl)" }}>
            {client.name ? <>Witaj,<br/><em style={{ fontStyle:"italic", color:"var(--gold)" }}>{client.name.split(" ")[0]}</em></> : <>Moje<br/><em style={{ fontStyle:"italic", color:"var(--gold)" }}>konto</em></>}
          </h1>
        </div>

        <div style={{ height:"1px", background:"rgba(201,149,106,.12)", marginBottom:"40px" }}/>

        {/* INFO CARD */}
        <div style={{ border:"1px solid rgba(201,149,106,.12)", marginBottom:"24px" }}>
          <div style={{ padding:"16px 24px", borderBottom:"1px solid rgba(201,149,106,.07)", background:"rgba(201,149,106,.03)" }}>
            <p style={{ fontFamily:"var(--font-cinzel)", fontSize:"11px", letterSpacing:".35em", textTransform:"uppercase", color:"var(--gold)" }}>Dane konta</p>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(200px, 1fr))" }}>
            <div style={{ padding:"24px", borderRight:"1px solid rgba(201,149,106,.07)" }}>
              <p style={{ fontFamily:"var(--font-cinzel)", fontSize:"11px", letterSpacing:".3em", textTransform:"uppercase", color:"rgba(100,75,50,.5)", marginBottom:"10px" }}>Telefon</p>
              <p style={{ fontFamily:"var(--font-jost)", fontSize:"18px", fontWeight:500, color:"var(--pearl)", letterSpacing:".03em" }}>{client.phone}</p>
            </div>
            {client.name && (
              <div style={{ padding:"24px", borderRight:"1px solid rgba(201,149,106,.07)" }}>
                <p style={{ fontFamily:"var(--font-cinzel)", fontSize:"11px", letterSpacing:".3em", textTransform:"uppercase", color:"rgba(100,75,50,.5)", marginBottom:"10px" }}>Imię i nazwisko</p>
                <p style={{ fontFamily:"var(--font-jost)", fontSize:"18px", fontWeight:500, color:"var(--pearl)" }}>{client.name}</p>
              </div>
            )}
            {client.email && (
              <div style={{ padding:"24px" }}>
                <p style={{ fontFamily:"var(--font-cinzel)", fontSize:"11px", letterSpacing:".3em", textTransform:"uppercase", color:"rgba(100,75,50,.5)", marginBottom:"10px" }}>E-mail</p>
                <p style={{ fontFamily:"var(--font-jost)", fontSize:"16px", fontWeight:400, color:"var(--pearl)" }}>{client.email}</p>
              </div>
            )}
          </div>
        </div>

        {/* ACTION CARDS */}
        <div className="mob-grid-1" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"16px", marginBottom:"40px" }}>
          {/* Orders */}
          <Link href="/orders" style={{ textDecoration:"none" }}>
            <div style={{ padding:"32px 28px", border:"1px solid rgba(201,149,106,.12)", background:"transparent", cursor:"pointer", transition:"border-color .3s, background .3s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(201,149,106,.3)"; (e.currentTarget as HTMLElement).style.background = "rgba(201,149,106,.04)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(201,149,106,.12)"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
              <div style={{ width:"40px", height:"40px", marginBottom:"20px", display:"flex", alignItems:"center", justifyContent:"center", border:"1px solid rgba(201,149,106,.2)" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                </svg>
              </div>
              <p style={{ fontFamily:"var(--font-jost)", fontSize:"18px", fontWeight:600, color:"var(--pearl)", marginBottom:"6px" }}>Historia zamówień</p>
              <p style={{ fontFamily:"var(--font-jost)", fontSize:"14px", fontWeight:400, color:"var(--text-muted)", lineHeight:1.5 }}>Przeglądaj swoje zamówienia i ich status</p>
              <p style={{ marginTop:"20px", fontFamily:"var(--font-jost)", fontSize:"13px", fontWeight:500, color:"var(--gold)", letterSpacing:".05em" }}>Przejdź →</p>
            </div>
          </Link>

          {/* Addresses */}
          <Link href="/account/addresses" style={{ textDecoration:"none" }}>
            <div style={{ padding:"32px 28px", border:"1px solid rgba(201,149,106,.12)", background:"transparent", cursor:"pointer", transition:"border-color .3s, background .3s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(201,149,106,.3)"; (e.currentTarget as HTMLElement).style.background = "rgba(201,149,106,.04)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(201,149,106,.12)"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
              <div style={{ width:"40px", height:"40px", marginBottom:"20px", display:"flex", alignItems:"center", justifyContent:"center", border:"1px solid rgba(201,149,106,.2)" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
              </div>
              <p style={{ fontFamily:"var(--font-jost)", fontSize:"18px", fontWeight:600, color:"var(--pearl)", marginBottom:"6px" }}>Adresy dostawy</p>
              <p style={{ fontFamily:"var(--font-jost)", fontSize:"14px", fontWeight:400, color:"var(--text-muted)", lineHeight:1.5 }}>Zarządzaj swoimi adresami i paczkomatami</p>
              <p style={{ marginTop:"20px", fontFamily:"var(--font-jost)", fontSize:"13px", fontWeight:500, color:"var(--gold)", letterSpacing:".05em" }}>Zarządzaj →</p>
            </div>
          </Link>
        </div>

        {/* LOGOUT */}
        <div style={{ height:"1px", background:"rgba(201,149,106,.1)", marginBottom:"32px" }}/>
        <button onClick={handleLogout}
          style={{ background:"none", border:"none", cursor:"pointer", fontFamily:"var(--font-jost)", fontSize:"14px", letterSpacing:".1em", color:"var(--text-muted)", padding:"0", transition:"color .3s" }}
          onMouseEnter={e => (e.currentTarget.style.color = "var(--pearl)")}
          onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}>
          Wyloguj się
        </button>

      </div>
    </div>
  );
}
