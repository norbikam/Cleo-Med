"use client";

import Image from "next/image";

export default function OurTeam() {
  const teamMembers = [
    { src: "/treatments/diagnosta.jpg", name: "Team Member 1" },
    { src: "/treatments/diagnosta.jpg", name: "Team Member 2" },
    { src: "/treatments/diagnosta.jpg", name: "Team Member 3" },
    { src: "/treatments/diagnosta.jpg", name: "Team Member 4" },
  ];

  return (
    <section className="relative flex items-center justify-center px-6 animated-bg py-20">
      <div className="relative z-10 text-white text-center max-w-[80%]">
        <h2 className="text-4xl font-bold mb-4">Poznaj nasz zespół</h2>
        <p className="text-lg text-gray-100 mb-8">
          Nasz wykwalifikowany zespół tworzy to wyjątkowe miejsce. Każdy z nas jest inny, ale wszyscy działamy z tą samą pasją.
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          {teamMembers.map((member, index) => (
            <div
              key={index}
              className="relative overflow-hidden shadow-lg w-1/3 md:w-1/5"
            >
              <Image
                src={member.src}
                alt={`Team member ${index + 1}`}
                width={300}
                height={200}
                className="object-cover"
              />
              {/* Overlay caption */}
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 opacity-0 hover:opacity-100 transition-opacity duration-300">
                <span className="text-xl font-semibold">{member.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx global>{`
        .animated-bg {
          background: linear-gradient(
            45deg,
            rgb(163, 163, 163),
            rgb(150, 137, 137),
            rgb(214, 185, 185),
            rgb(214, 158, 158)
          );
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
