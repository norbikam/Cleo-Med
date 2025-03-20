"use client";

import Navigation from "@/app/navbar";
import Footer from "@/app/footer";
import Image from "next/image";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen gap-16 font-[family-name:var(--font-geist-sans)]">
      <header>
        <Navigation />
      </header>
      <main style={{ maxWidth: "98vw" }} className="overflow-hidden pt-20 text-center w-[98vw] justify-items-center">
        <h2 className="text-black text-6xl pb-8">Zabiegi na skórę głowy i włosy</h2>
        <div className="container text-black text-2xl w-full text-center justify-items-center border-black border flex">
          <div className="w-2/3">
          <h2 className="py-20" style={{fontSize:"4rem"}}>Mezoterapia skóry głowy</h2>
          <p>stymulacja wzrostu włosów poprzez dostarczanie składników odżywczych</p>
          </div>
          <div className="w-1/3 justify-items-right">
            <Image src="/treatments/zabieg.jpeg" alt="" width={1000} height={1000}/>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
