"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import * as THREE from "three";
import BIRDS from "vanta/dist/vanta.birds.min";

interface VantaEffect {
  destroy: () => void;
}

export default function OurTeam() {
  const [vantaEffect, setVantaEffect] = useState<VantaEffect | null>(null);
  const vantaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!vantaEffect) {
      setVantaEffect(
        BIRDS({
          el: vantaRef.current,
          THREE,
          color: 0x333333,
          backgroundColor: 0xffffff,
          birdSize: 1.2,
          wingSpan: 20,
          speedLimit: 4,
          separation: 50,
          alignment: 50,
        })
      );
    }

    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, [vantaEffect]);

  return (
    <section ref={vantaRef} className="relative min-h-screen flex items-center justify-center px-6">
      <div className="relative z-10 text-white text-center max-w-[80%]">
        <h2 className="text-4xl font-bold mb-4">Nasza Galeria</h2>
        <p className="text-lg text-white-100 mb-8">
          Zobacz kilka wybranych zdjęć z naszych zabiegów i kliniki.
        </p>

        <div className="flex justify-center gap-4 overflow-hidden">
          {["/treatments/diagnosta.jpg", "/treatments/diagnosta.jpg", "/treatments/diagnosta.jpg", "/treatments/diagnosta.jpg"].map((src, index) => (
            <div key={index} className="w-1/4 rounded-lg overflow-hidden shadow-lg">
              <Image src={src} alt={`Gallery image ${index + 1}`} width={300} height={200} className="object-cover" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
