"use client";

import { useEffect, useState } from "react";
import { usePageTexts, pt } from "@/lib/hooks/use-page-texts";

function computeLine(before: string, after: string, nextDay: string): string {
  const now = new Date();
  const day = now.getDay();
  const isWeekday = day >= 1 && day <= 5;

  if (!isWeekday) return `__${nextDay}__`;

  const target = new Date();
  target.setHours(14, 0, 0, 0);
  if (now >= target) return `__${nextDay}__`;

  const diff = target.getTime() - now.getTime();
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  const s = Math.floor((diff % 60_000) / 1_000);

  const time = [
    h > 0 && `${h} godz.`,
    `${m} min.`,
    `${String(s).padStart(2, "0")} sek.`,
  ].filter(Boolean).join(" ");

  return `${before} __${time}__ ${after}`;
}

export function shippingToday(): boolean {
  const now = new Date();
  const day = now.getDay();
  return day >= 1 && day <= 5 && now.getHours() < 14;
}

export default function AnnouncementBar() {
  const texts = usePageTexts();
  const [line, setLine] = useState<string | null>(null);

  useEffect(() => {
    const before  = pt(texts, "announcement_before", "Zamów w ciągu");
    const after   = pt(texts, "announcement_after",  "a przesyłkę wyślemy jeszcze dzisiaj!");
    const nextDay = pt(texts, "announcement_next_day", "Zamówienie zostanie wysłane w następny dzień roboczy");
    const tick = () => setLine(computeLine(before, after, nextDay));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [texts]);

  const parts = (line ?? "__Zamówienie zostanie wysłane w następny dzień roboczy__").split("__");

  return (
    <div id="ann-bar" style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
      minHeight: "36px", background: "#0a0a0a",
      display: "flex", alignItems: "center", justifyContent: "center",
      borderBottom: "1px solid rgba(201,149,106,.08)",
      padding: "6px 16px",
    }}>
      <p style={{
        fontFamily: "var(--font-jost)", fontSize: "13px", fontWeight: 500,
        letterSpacing: ".04em", color: "#F8F4EE",
        textAlign: "center", margin: 0,
      }}>
        {parts.map((p, i) =>
          i % 2 === 1
            ? <span key={i} style={{ color: "#C9956A", fontWeight: 600 }}>{p}</span>
            : p
        )}
      </p>
    </div>
  );
}
