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
        <h2 className="text-black text-3xl pb-8">Zabieg z użyciem urządzenia</h2>
        <div className="flex flex-col container text-black text-2xl w-full text-center justify-items-center border-black border md:grid md:grid-cols-3">
          <div className="col-span-2 align-middle">
          <h2 className="py-20 text-6xl">Dermapen 4 – mezoterapia mikroigłowa</h2>
          <ul>
            <li>Automatyczne mikronakłucia stymulujące regenerację skóry</li>
            <li>Pobudzenie produkcji kolagenu i elastyny</li>
          </ul>
          <p className="py-4 text-4xl text-left">Zabiegi:</p>
          <ul className="list-disc pr-8 pl-8 text-left pb-10">
            <li>Odmładzanie skóry</li>
            <li>Redukcja blizn i rozstępów</li>
            <li>Wyrównanie kolorytu skóry</li>
          </ul>
          </div>
          <div className="justify-items-right">
            <Image src="/pics/p20.jpeg" alt="" width={1000} height={1000}/>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
