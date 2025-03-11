"use client"

import Image from "next/image";
import Navigation from "./navbar";
import Slideshow from "./slideshow"
import ProceduresGrid from "./components/ProceduresGrid";
import Footer from "./footer";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen gap-16 font-[family-name:var(--font-geist-sans)]">
      <header>
      <Navigation/>
      </header>
      <main className="maincomp w-full">
          <Slideshow/>
          <ProceduresGrid/>
        </main>

      
      <Footer />
    </div>
  );
}
