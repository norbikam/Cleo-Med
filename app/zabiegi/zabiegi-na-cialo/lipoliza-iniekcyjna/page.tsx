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
      <h2 className="text-black text-3xl pb-8">Zabiegi na ciało</h2>
        <div className="treatmentcon flex flex-col container text-black text-2xl w-full text-center justify-items-center border-black border md:grid md:grid-cols-3">
          <div className="col-span-2 align-middle">
          <h2 className="py-20 text-6xl">Lipoliza iniekcyjna</h2>
          <p>miejscowa redukcja tkanki tłuszczowej (np. brzuch, uda, ramiona)</p>
          </div>
          <div className="justify-items-right">
            <Image src="/pics/p1.jpeg" alt="" width={1000} height={1000}/>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
