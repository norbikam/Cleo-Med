// components/ProceduresGrid.tsx
"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const procedures = [
  {
    title: "Medycyna Estetyczna",
    image: "/treatments/medycyna-estetyczna.jpg",
    href: "/zabiegi/medycyna-estetyczna",
  },
  {
    title: "Laseroterapia",
    image: "/treatments/laseroterapia.jpg",
    href: "/zabiegi/laseroterapia",
  },
  {
    title: "Kosmetyka Profesjonalna",
    image: "/treatments/kosmetyka.jpg",
    href: "/zabiegi/kosmetyka-profesjonalna",
  },
  {
    title: "Body Contouring",
    image: "/treatments/body-contouring.jpg",
    href: "/zabiegi/body-contouring",
  },
  {
    title: "Trychologia",
    image: "/treatments/trychologia.jpg",
    href: "/zabiegi/trychologia",
  },
  {
    title: "Diagnosta Skóry",
    image: "/treatments/diagnosta.jpg",
    href: "/zabiegi/diagnosta-skory",
  },
];

export default function ProceduresGrid() {
  return (
    <section className="py-16 px-4 sm:px-8 lg:px-16 bg-white">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-800 mb-12 text-center">
          Nasze Zabiegi
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {procedures.map((procedure) => (
            <motion.div
              key={procedure.href}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.05 }}
              className="relative group overflow-hidden shadow-(color:black) shadow-2xl imagebutton"
            >
              <a
                href={procedure.href}
                className="block relative h-96 w-full"
                role="button"
              >
                {/* Image with overlay */}
                <div className="absolute inset-0 z-0">
                  <Image
                    src={procedure.image}
                    alt={procedure.title}
                    fill
                    className="object-cover object-center"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-black/30 transition-all duration-300 group-hover:bg-black/20"/>
                </div>

                {/* Content */}
                <div className="relative z-10 h-full flex items-end p-6">
                  <motion.div
                    className="text-white"
                    initial={{ y: 20 }}
                    whileHover={{ y: 0 }}
                  >
                    <h3 className="text-2xl font-semibold mb-2">
                      {procedure.title}
                    </h3>
                    <span className="inline-block py-1 px-3 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
                      Poznaj szczegóły →
                    </span>
                  </motion.div>
                </div>
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}