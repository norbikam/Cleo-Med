"use client";

import Image from "next/image";

export default function OurTeam() {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 animated-bg">
      <div className="relative z-10 text-white text-center max-w-[80%]">
        <h2 className="text-4xl font-bold mb-4">Nasza Galeria</h2>
        <p className="text-lg text-gray-100 mb-8">
          Zobacz kilka wybranych zdjęć z naszych zabiegów i kliniki.
        </p>

        <div className="flex justify-center gap-4 overflow-hidden">
          {[
            "/treatments/diagnosta.jpg",
            "/treatments/diagnosta.jpg",
            "/treatments/diagnosta.jpg",
            "/treatments/diagnosta.jpg",
          ].map((src, index) => (
            <div key={index} className="w-1/4 overflow-hidden"  >
              <Image
                src={src}
                alt={`Gallery image ${index + 1}`}
                width={300}
                height={200}
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      <style jsx global>{`
        .animated-bg {
          background: linear-gradient(45deg,rgb(136, 136, 136),rgb(204, 175, 175),rgb(150, 136, 136),rgb(204, 159, 159));
          background-size: 400% 400%;
          animation: gradientAnimation 15s ease infinite;
        }
        @keyframes gradientAnimation {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
    </section>
  );
}
