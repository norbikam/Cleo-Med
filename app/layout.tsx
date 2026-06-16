import type { Metadata } from "next";
import { Cormorant_Garamond, Jost, Cinzel } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const jost = Jost({
  subsets: ["latin", "latin-ext"],
  weight: ["200", "300", "400", "500", "600"],
  variable: "--font-jost",
  display: "swap",
});

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-cinzel",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Cleo Med — Dystrybucja B2B",
  description: "Profesjonalne preparaty medycyny estetycznej dla gabinetów i klinik.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl" className={`${cormorant.variable} ${jost.variable} ${cinzel.variable}`}>
      <body>{children}</body>
    </html>
  );
}
