"use client";

import Navigation from "@/app/navbar";
import Footer from "@/app/footer";
import CialoGrid from "./CialoGrid";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen gap-16 font-[family-name:var(--font-geist-sans)]">
      <header>
        <Navigation />
      </header>
      <main style={{ maxWidth: "98vw" }} className="overflow-hidden pt-20 text-center w-[98vw]">
        <h2 className="text-black text-[5rem] pb-8">Zabiegi na ciało</h2>
        <CialoGrid />
      </main>
      <Footer />
    </div>
  );
}
