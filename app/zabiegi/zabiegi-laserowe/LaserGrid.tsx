"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

const procedures = [
  {
    title: "Morpheus 8 – RF mikroigłowy",
    image: "/treatments/maszyny/morpheus.jpeg",
    href: "/zabiegi/zabiegi-laserowe/morpheus",
  },
  {
    title: "Dermapen 4 – mezoterapia mikroigłowa",
    image: "/treatments/maszyny/dermapen.jpeg",
    href: "/zabiegi/zabiegi-laserowe/dermapen",
  },
  {
    title: "Laser hybrydowy (frakcyjny + Er:YAG)",
    image: "/treatments/maszyny/laser-hybrydowy.jpeg",
    href: "/zabiegi/zabiegi-laserowe/laser-hybrydowy",
  },
  {
    title: "Laser pikosekundowy",
    image: "/treatments/maszyny/laser-pikosekundowy.jpeg",
    href: "/zabiegi/zabiegi-laserowe/laser-pikosekundowy",
  },
  {
    title: "Laser diodowy",
    image: "/treatments/maszyny/laser-diodowy.jpeg",
    href: "/zabiegi/zabiegi-laserowe/laser-diodowy",
  },
  {
    title: "HIFU – ultradźwiękowy lifting skóry",
    image: "/treatments/maszyny/hifu.jpeg",
    href: "/zabiegi/zabiegi-laserowe/hifu",
  },
  {
    title: "Hulabo 448k – zaawansowana terapia radiofrekwencyjna",
    image: "/treatments/maszyny/hulabo.jpeg",
    href: "/zabiegi/zabiegi-laserowe/hulabo",
  },
];

export default function LaserGrid() {
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
