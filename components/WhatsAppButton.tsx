"use client";

import { useState, useRef, useEffect } from "react";

export default function WhatsAppButton() {
  const [open, setOpen]       = useState(false);
  const [msg,  setMsg]        = useState("");
  const inputRef              = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 120);
  }, [open]);

  function send() {
    const text = msg.trim() || "Dzień dobry, chciałbym uzyskać informacje.";
    window.open(`https://wa.me/48694242921?text=${encodeURIComponent(text)}`, "_blank");
    setOpen(false);
    setMsg("");
  }

  return (
    <>
      {/* POPUP */}
      {open && (
        <div style={{
          position:"fixed", bottom:"116px", right:"24px", zIndex:1000,
          width:"320px", background:"#fff",
          boxShadow:"0 0 0 1px rgba(0,0,0,.08), 0 -8px 32px rgba(0,0,0,.14), -8px 0 32px rgba(0,0,0,.06), 8px 0 32px rgba(0,0,0,.06)",
          animation:"waPopup .22s cubic-bezier(.16,1,.3,1)",
        }}>
          {/* Header */}
          <div style={{ background:"#25D366", padding:"18px 20px", display:"flex", alignItems:"center", gap:"12px" }}>
            <div style={{
              width:"42px", height:"42px", borderRadius:"50%",
              background:"rgba(255,255,255,.25)",
              display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
            }}>
              <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
                <path d="M16 3C9.373 3 4 8.373 4 15c0 2.385.668 4.61 1.824 6.51L4 29l7.697-1.797A11.93 11.93 0 0 0 16 28c6.627 0 12-5.373 12-12S22.627 3 16 3Z" fill="white"/>
                <path d="M22 19.3c-.306-.153-1.812-.894-2.093-.996-.28-.102-.484-.153-.688.153-.204.306-.79.996-.968 1.2-.178.204-.357.23-.663.077-.306-.154-1.293-.477-2.462-1.52-.91-.81-1.525-1.81-1.703-2.116-.178-.306-.019-.47.134-.623.137-.136.306-.357.459-.535.153-.178.204-.306.306-.51.102-.204.051-.383-.025-.536-.077-.153-.688-1.658-.942-2.27-.248-.596-.5-.515-.688-.525l-.586-.01c-.204 0-.535.077-.815.383s-1.07 1.046-1.07 2.55c0 1.505 1.096 2.958 1.249 3.162.153.204 2.155 3.29 5.22 4.614.73.315 1.299.503 1.743.644.733.232 1.4.2 1.927.121.588-.088 1.812-.74 2.068-1.455.255-.715.255-1.327.178-1.455-.076-.128-.28-.204-.586-.357Z" fill="#25D366"/>
              </svg>
            </div>
            <div style={{ flex:1 }}>
              <p style={{ margin:0, fontSize:"15px", fontWeight:600, color:"#fff", fontFamily:"var(--font-jost)" }}>Cleo Med</p>
              <p style={{ margin:0, fontSize:"12px", color:"rgba(255,255,255,.8)", fontFamily:"var(--font-jost)" }}>Odpowiadamy od 8:00 do 15:30</p>
            </div>
            <button onClick={() => setOpen(false)} style={{
              background:"none", border:"none", cursor:"pointer",
              color:"rgba(255,255,255,.8)", fontSize:"20px", lineHeight:1, padding:"4px",
            }}>×</button>
          </div>

          {/* Chat bubble */}
          <div style={{ padding:"20px", background:"#f0f2f5" }}>
            <div style={{
              background:"#fff",
              padding:"12px 14px", maxWidth:"85%",
              boxShadow:"0 1px 4px rgba(0,0,0,.08)",
              fontFamily:"var(--font-jost)", fontSize:"14px",
              color:"#111", lineHeight:1.6,
            }}>
              Cześć! 👋 W czym możemy pomóc?
            </div>
          </div>

          {/* Input */}
          <div style={{ padding:"12px 16px 16px", background:"#fff", borderTop:"1px solid #f0f2f5" }}>
            <div style={{ display:"flex", gap:"8px", alignItems:"flex-end" }}>
              <textarea
                ref={inputRef}
                value={msg}
                onChange={e => setMsg(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                placeholder="Napisz wiadomość..."
                rows={2}
                style={{
                  flex:1, resize:"none", border:"1px solid #e5e7eb",
                  padding:"10px 12px",
                  fontFamily:"var(--font-jost)", fontSize:"14px",
                  color:"#111", outline:"none", lineHeight:1.5,
                }}
              />
              <button onClick={send} style={{
                width:"40px", height:"40px", flexShrink:0,
                background:"#25D366", border:"none",
                cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
                transition:"background .2s",
              }}
                onMouseEnter={e => (e.currentTarget.style.background = "#1ebe5d")}
                onMouseLeave={e => (e.currentTarget.style.background = "#25D366")}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M22 2L11 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            <p style={{ margin:"8px 0 0", fontSize:"11px", color:"#9ca3af", fontFamily:"var(--font-jost)", textAlign:"center" }}>
              Otworzy się WhatsApp z Twoją wiadomością
            </p>
          </div>
        </div>
      )}

      {/* FLOATING BUTTON */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Napisz na WhatsApp"
        className="wa-btn"
      >
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
        ) : (
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <path d="M16 3C9.373 3 4 8.373 4 15c0 2.385.668 4.61 1.824 6.51L4 29l7.697-1.797A11.93 11.93 0 0 0 16 28c6.627 0 12-5.373 12-12S22.627 3 16 3Z" fill="white"/>
            <path d="M22.003 19.3c-.306-.153-1.812-.894-2.093-.996-.28-.102-.484-.153-.688.153-.204.306-.79.996-.968 1.2-.178.204-.357.23-.663.077-.306-.154-1.293-.477-2.462-1.52-.91-.81-1.525-1.81-1.703-2.116-.178-.306-.019-.47.134-.623.137-.136.306-.357.459-.535.153-.178.204-.306.306-.51.102-.204.051-.383-.025-.536-.077-.153-.688-1.658-.942-2.27-.248-.596-.5-.515-.688-.525l-.586-.01c-.204 0-.535.077-.815.383s-1.07 1.046-1.07 2.55c0 1.505 1.096 2.958 1.249 3.162.153.204 2.155 3.29 5.22 4.614.73.315 1.299.503 1.743.644.733.232 1.4.2 1.927.121.588-.088 1.812-.74 2.068-1.455.255-.715.255-1.327.178-1.455-.076-.128-.28-.204-.586-.357Z" fill="#25D366"/>
          </svg>
        )}
      </button>

      <style>{`
        @keyframes waPopup {
          from { opacity:0; transform:translateY(12px) scale(.97); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
      `}</style>
    </>
  );
}
