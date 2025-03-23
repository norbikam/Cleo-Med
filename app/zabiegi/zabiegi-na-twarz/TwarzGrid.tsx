// components/ProceduresGrid.tsx
"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

const procedures = [
  {
    title: "Mezoterapia igłowa",
    image: "/treatments/twarz/mezoterapia-iglowa.jpeg",
    href: "/zabiegi/zabiegi-na-twarz/mezoterapia-iglowa",
  },
  {
    title: "Mezoterapia mikroigłowa (Dermapen 4)",
    image: "/treatments/twarz/dermapen.jpeg",
    href: "/zabiegi/zabiegi-na-twarz/mezoterapia-mikroiglowa",
  },
  {
    title: "Peelingi chemiczne",
    image: "/treatments/twarz/peeling-chemiczny.jpeg",
    href: "/zabiegi/zabiegi-na-twarz/peelingi-chemiczne",
  },
  {
    title: "Botoks",
    image: "/treatments/twarz/botoks.jpeg",
    href: "/zabiegi/zabiegi-na-twarz/botoks",
  },
  {
    title: "Kwas hialuronowy",
    image: "/treatments/twarz/kwas-hialuronowy.jpeg",
    href: "/zabiegi/zabiegi-na-twarz/kwas-hialuronowy",
  },
  {
    title: "Osocze bogatopłytkowe (PRP, „wampirzy lifting”)",
    image: "/treatments/twarz/osocze-bogatoplytkowe.jpeg",
    href: "/zabiegi/zabiegi-na-twarz/osocze-bogatoplytkowe",
  },
  {
    title: "Nici liftingujące PDO",
    image: "/treatments/twarz/nici-liftingujace.jpeg",
    href: "/zabiegi/zabiegi-na-twarz/nici-liftingujace-pdo",
  },
  {
    title: "Lipoliza iniekcyjna",
    image: "/treatments/twarz/lipoliza-iniekcyjna.jpeg",
    href: "/zabiegi/zabiegi-na-twarz/lipoliza-iniekcyjna",
  },
  {
    title: "Wypełnianie doliny łez",
    image: "/treatments/twarz/dolina-lez.jpeg",
    href: "/zabiegi/zabiegi-na-twarz/wypelnianie-doliny-lez",
  }
];

export default function TwarzGrid() {
  return (
    <section className="py-16 px-4 sm:px-8 lg:px-16 bg-white">
      <div className="max-w-7xl mx-auto">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {procedures.map((procedure) => (
            <motion.div
              key={procedure.href}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.01 }}
              className="relative group overflow-hidden shadow-2xl"
            >
              <Link href={procedure.href}>
                <div className="block relative h-96 w-full cursor-pointer">
                  {/* Obraz z nakładką */}
                  <div className="absolute inset-0 z-0">
                    <Image
                      src={procedure.image}
                      alt={procedure.title}
                      fill
                      className="object-cover object-center"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-black/30 transition-all duration-300 group-hover:bg-black/20" />
                  </div>

                  {/* Treść */}
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
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}