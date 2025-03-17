"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

export default function InfiniteCarousel() {
  const photos = [
    "/treatments/prv1.jpg",
    "/treatments/kosmetyka.jpg",
    "/treatments/diagnosta.jpg",
    "/treatments/laseroterapia.jpg",
    "/treatments/body-contouring.jpg",
    "/treatments/formy-platnosci.png",
    "/treatments/trychologia.jpg",
    "/treatments/medycyna-estetyczna.jpg",
  ];

  const [visible, setVisible] = useState(4);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [photoList, setPhotoList] = useState([...photos]); // Początkowa lista

  useEffect(() => {
    const updateVisible = () => {
      setVisible(window.innerWidth < 768 ? 1 : 4);
    };
    updateVisible();
    window.addEventListener("resize", updateVisible);
    return () => window.removeEventListener("resize", updateVisible);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        if (prevIndex + 1 >= photoList.length - visible) {
          // Gdy dojdziemy do końca, dodajemy nową kopię zdjęć
          setPhotoList((prev) => [...prev, ...photos]);
        }
        return prevIndex + 1;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [photoList, visible]);

  return (
    <div className="w-full overflow-hidden">
      <motion.div
        className="flex"
        animate={{ x: `-${currentIndex * (100 / visible)}%` }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {photoList.map((src, index) => (
          <div
            key={index}
            className="flex-shrink-0"
            style={{ width: `${100 / visible}%` }}
          >
            <Image
              src={src}
              alt={`Slide ${index + 1}`}
              width={500}
              height={300}
              className="object-cover"
            />
          </div>
        ))}
      </motion.div>
    </div>
  );
}