// components/ProceduresGrid.tsx
"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const services = [
  {
    title: "Zabiegi",
    image: "/treatments/twarz/nici-liftingujace.jpeg",
    href: "/zabiegi",
  },
  {
    title: "Szkolenia",
    image: "/treatments/training/laser.jpeg",
    href: "/szkolenia",
  },
]

const treatments = [
  {
    title: "Zabiegi na twarz",
    image: "/treatments/zabieginatwarz.jpg",
    href: "/zabiegi/zabiegi-na-twarz",
  },
  {
    title: "Zabiegi na ciało",
    image: "/treatments/zabieginacialo.jpg",
    href: "/zabiegi/zabiegi-na-cialo",
  },
  {
    title: "Zabiegi na skórę głowy i włosy",
    image: "/treatments/zabieginawlosy.jpeg",
    href: "/zabiegi/zabiegi-na-skore-glowy-i-wlosy",
  },
  {
    title: "Zabiegi laserowe i technologiczne",
    image: "/treatments/zabiegilaserowe.jpeg",
    href: "/zabiegi/zabiegi-laserowe",
  }
];

const training = [
  {
    title: "Systemy laserowe do terapii skóry",
    image: "",
    href: ""
  },
  {
    title: "Technologie modelowania sylwetki",
    image: "",
    href: ""
  },
  {
    title: "Urządzenia do zabiegów odmładzających i liftingujących",
    image: "",
    href: ""
  },
  {
    title: "Nowoczesne metody usuwania tatuaży",
    image: "",
    href: ""
  },
]

export function Services() {
  return(
    <section className="py-16 px-4 sm:px-8 lg:px-16 bg-white">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-5xl font-light text-gray-800 mb-12 text-center">
          Usługi
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((services) => (
            <motion.div
              key={services.href}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.01 }}
              className="relative group overflow-hidden shadow-(color:black) shadow-2xl imagebutton"
            >
              <a
                href={services.href}
                className="block relative h-96 w-full"
                role="button"
              >
                {/* Image with overlay */}
                <div className="absolute inset-0 z-0">
                  <Image
                    src={services.image}
                    alt={services.title}
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
                      {services.title}
                    </h3>
                    <span className="inline-block py-1 px-3 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
                      Sprawdź →
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

export function Treatments() {
  return (
    <section className="py-16 px-4 sm:px-8 lg:px-16 bg-white">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-5xl font-light text-gray-800 mb-12 text-center">
          Nasze Zabiegi
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {treatments.map((treatments) => (
            <motion.div
              key={treatments.href}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.01 }}
              className="relative group overflow-hidden shadow-(color:black) shadow-2xl imagebutton"
            >
              <a
                href={treatments.href}
                className="block relative h-96 w-full"
                role="button"
              >
                {/* Image with overlay */}
                <div className="absolute inset-0 z-0">
                  <Image
                    src={treatments.image}
                    alt={treatments.title}
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
                      {treatments.title}
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

export function Trainings(){
  return(
    <section className="py-16 px-4 sm:px-8 lg:px-16 bg-white">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-5xl font-light text-gray-800 mb-12 text-center">
          Szkolenia
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {training.map((training) => (
            <motion.div
              key={training.href}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.01 }}
              className="relative group overflow-hidden shadow-(color:black) shadow-2xl imagebutton"
            >
              <a
                href={training.href}
                className="block relative h-96 w-full"
                role="button"
              >
                {/* Image with overlay */}
                <div className="absolute inset-0 z-0">
                  <Image
                    src={training.image}
                    alt={training.title}
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
                      {training.title}
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
  )
}