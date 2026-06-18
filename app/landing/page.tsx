"use client";

import Link from "next/link";

export default function LandingPage() {
  return (
    <div style={{
      minHeight:"100vh", background:"var(--obsidian)",
      display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center",
      padding:"40px 24px",
    }}>

      {/* Logo */}
      <div style={{ textAlign:"center", marginBottom:"40px" }}>
        <p style={{ fontFamily:"var(--font-cinzel)", fontSize:"22px", fontWeight:500, letterSpacing:".22em", color:"var(--gold)" }}>CLEOMED</p>
        <p style={{ fontFamily:"var(--font-jost)", fontSize:"11px", letterSpacing:".4em", textTransform:"uppercase", color:"var(--text-muted)", marginTop:"6px" }}>Panel Produktów</p>
      </div>

      {/* Tekst - przeglądanie bez konta */}
      <div style={{ maxWidth:"680px", width:"100%", marginBottom:"28px" }}>
        <p style={{ fontFamily:"var(--font-cinzel)", fontSize:"9.5px", letterSpacing:".35em", textTransform:"uppercase", color:"var(--gold)", marginBottom:"10px" }}>Przeglądaj bez konta</p>
        <p style={{ fontFamily:"var(--font-jost)", fontSize:"13px", color:"var(--text-muted)", lineHeight:1.75 }}>
          Możesz swobodnie przeglądać ofertę bez logowania. Aby złożyć zamówienie, napisz do nas na WhatsApp.
        </p>
        <a
          href="https://api.whatsapp.com/send?phone=48694242921"
          target="_blank"
          rel="noopener noreferrer"
          style={{ display:"inline-block", marginTop:"10px", fontFamily:"var(--font-jost)", fontSize:"13px", color:"var(--gold)", textDecoration:"none", borderBottom:"1px solid rgba(154,107,32,.35)", paddingBottom:"1px" }}>
          Napisz na WhatsApp →
        </a>
      </div>

      {/* Kafelki */}
      <div className="landing-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"2px", width:"100%", maxWidth:"680px" }}>

        <Link href="/katalog" style={{ display:"block", textDecoration:"none", background:"#fff", border:"1px solid rgba(154,107,32,.1)", padding:"52px 36px", textAlign:"center", transition:"border-color .3s" }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(154,107,32,.3)")}
          onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(154,107,32,.1)")}>
          <p style={{ fontFamily:"var(--font-cinzel)", fontSize:"11px", letterSpacing:".45em", textTransform:"uppercase", color:"var(--gold)", marginBottom:"20px" }}>Katalog</p>
          <p style={{ fontFamily:"var(--font-cormorant)", fontSize:"34px", fontWeight:400, color:"var(--pearl)", lineHeight:1.0, marginBottom:"20px" }}>
            Przeglądaj<br/><em style={{ fontStyle:"italic" }}>produkty</em>
          </p>
          <p style={{ fontFamily:"var(--font-jost)", fontSize:"14px", fontWeight:400, color:"var(--text-muted)", lineHeight:1.7 }}>
            Przeglądaj nasze produkty<br/>i kategorie bez logowania
          </p>
        </Link>

        <Link href="/login" style={{ display:"block", textDecoration:"none", background:"var(--gold)", padding:"52px 36px", textAlign:"center", transition:"background .3s" }}
          onMouseEnter={e => (e.currentTarget.style.background = "var(--gold-light)")}
          onMouseLeave={e => (e.currentTarget.style.background = "var(--gold)")}>
          <p style={{ fontFamily:"var(--font-cinzel)", fontSize:"11px", letterSpacing:".45em", textTransform:"uppercase", color:"rgba(255,255,255,.65)", marginBottom:"20px" }}>Sklep</p>
          <p style={{ fontFamily:"var(--font-cormorant)", fontSize:"34px", fontWeight:400, color:"#fff", lineHeight:1.0, marginBottom:"20px" }}>
            Zamów<br/><em style={{ fontStyle:"italic" }}>produkty</em>
          </p>
          <p style={{ fontFamily:"var(--font-jost)", fontSize:"14px", fontWeight:400, color:"rgba(255,255,255,.7)", lineHeight:1.7 }}>
            Zaloguj się i złóż<br/>zamówienie
          </p>
        </Link>

      </div>

      {/* Tekst - konto klienta */}
      <div style={{ maxWidth:"680px", width:"100%", marginTop:"28px" }}>
        <p style={{ fontFamily:"var(--font-cinzel)", fontSize:"9.5px", letterSpacing:".35em", textTransform:"uppercase", color:"var(--gold)", marginBottom:"10px" }}>Masz konto klienta?</p>
        <p style={{ fontFamily:"var(--font-jost)", fontSize:"13px", color:"var(--text-muted)", lineHeight:1.75 }}>
          Jeśli w ciągu ostatnich 3 miesięcy składałeś u nas zamówienie, możesz zarejestrować się numerem telefonu i ustawić hasło. Zyskasz dostęp do historii zamówień, zapisanych adresów dostawy oraz możliwość składania zamówień bezpośrednio przez sklep.
        </p>
      </div>

      <style>{`
        @media (max-width: 500px) {
          .landing-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
