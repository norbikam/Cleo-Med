"use client";

import Link from "next/link";


export default function Partner() {
  return (
    <section className="relative flex items-center justify-center px-4 py-12">
        <Link href="https://glowupskin.pl/">
      {/* Background layer with fixed attachment for parallax effect */}
      <div
        className="absolute inset-0 z-[-1] bg-cover bg-center md:bg-fixed sm:bg-scroll"
        style={{
          backgroundImage:"url('/pics/blurrygbg.png')",
        }}
      />
      
      {/* Content layer */}
      <div className="relative max-w-3xl mx-auto text-black text-center text-xl font-extralight py-16">
        <h2 className="text-4xl font-bold mb-6">GlowUpSkin</h2>
        <p className="text-lg mb-4">Oficjalny partner i dostawca produktów</p>
      </div>
      </Link>
    </section>
  );
}
