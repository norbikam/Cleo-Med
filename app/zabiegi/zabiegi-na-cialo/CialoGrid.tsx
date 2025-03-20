// components/ProceduresGrid.tsx
"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const procedures = [
  {
    title: "Lipoliza iniekcyjna",
    image: "/treatments/cialo/lipoliza-iniekcyjna.jpeg",
    href: "/zabiegi/zabiegi-na-cialo/lipoliza-iniekcyjna",
  },
  {
    title: "Karboksyterapia",
    image: "/treatments/cialo/karboksyterapia.jpeg",
    href: "/zabiegi/zabiegi-na-cialo/karboksyterapia",
  },
  {
    title: "Endermologia",
    image: "/treatments/cialo/endermologia.jpeg",
    href: "/zabiegi/zabiegi-na-cialo/endermologia",
  },
  {
    title: "Osocze bogatopłytkowe",
    image: "/treatments/cialo/osocze-bogatoplytkowe.jpeg",
    href: "/zabiegi/zabiegi-na-cialo/osocze-bogatoplytkowe",
  },
  {
    title: "Mezoterapia igłowa na ciało",
    image: "/treatments/cialo/mezoterapia-iglowa.jpeg",
    href: "/zabiegi/zabiegi-na-cialo/mezoterapia-iglowa",
  },
  {
    title: "Modelowanie sylwetki za pomocą kwasu hialuronowego",
    image: "/treatments/cialo/kwas-hialuronowy.jpeg",
    href: "/zabiegi/zabiegi-na-cialo/modelowanie-sylwetki",
  },
  {
    title: "RF mikroigłowy",
    image: "/treatments/cialo/rf-mikroiglowy.jpeg",
    href: "/zabiegi/zabiegi-na-cialo/rf-mikroiglowy",
  },
];

export default function CialoGrid() {
  return (
    <section className="py-16 px-4 sm:px-8 lg:px-16 bg-white">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-5xl font-light text-gray-800 mb-12 text-center">
          Nasze Zabiegi
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {procedures.map((procedure) => (
            <motion.div
              key={procedure.href}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.01 }}
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