"use client";

import Navigation from "../navbar";
import Footer from "../footer";
import { Trainings } from "../components/ImageButtonGrid";


export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen gap-16 font-[family-name:var(--font-geist-sans)]">
      <header>
        <Navigation />
      </header>
      <main style={{ maxWidth: "98vw" }} className="overflow-hidden pt-20 text-center w-[98vw]">
        <Trainings/>
      </main>
      <Footer />
    </div>
  );
}
