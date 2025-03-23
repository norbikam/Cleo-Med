"use client";

import Navigation from "@/app/navbar";
import Footer from "@/app/footer";
import Image from "next/image";
import BooksyWidget from "@/app/components/BooksyWidget";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen gap-16 font-[family-name:var(--font-geist-sans)]">
      <header>
        <Navigation />
      </header>
      <main style={{ maxWidth: "98vw" }} className="overflow-hidden pt-20 text-center w-[98vw] justify-items-center">
        <h2 className="text-black text-3xl pb-8">Zabieg z użyciem urządzenia</h2>
        <div className="treatmentcon flex flex-col container text-black text-2xl w-full text-center justify-items-center border-black border md:grid md:grid-cols-3">
          <div className="col-span-2 align-middle">
          <h2 className="py-20 text-6xl">Morpheus 8 – RF mikroigłowy</h2>
          <ul>
            <li>Urządzenie łączące mikronakłuwanie i fale radiowe (RF)</li>
            <li>Działanie na różnych głębokościach skóry (do 8 mm)</li>
            <li>Efekty: lifting skóry, poprawa owalu twarzy, redukcja zmarszczek, rozstępów i blizn</li>
          </ul>
          <p className="py-4 text-4xl text-left">Zabiegi:</p>
          <ul className="list-disc pr-8 pl-8 text-left pb-10">
            <li>Lifting skóry twarzy i szyi</li>
            <li>Redukcja rozstępów</li>
            <li>Ujędrnianie skóry na ciele</li>
            <li>Leczenie blizn potrądzikowych</li>
          </ul>
          <BooksyWidget/>
          </div>
          <div className="justify-items-right">
            <Image src="/pics/p14.jpeg" alt="" width={1000} height={1000}/>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
