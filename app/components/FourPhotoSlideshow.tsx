"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

export default function InfiniteCarousel() {
  const photos = [
    "/treatments/diagnosta.jpg",
    "/treatments/diagnosta.jpg",
    "/treatments/diagnosta.jpg",
    "/treatments/diagnosta.jpg",
    "/treatments/diagnosta.jpg",
    "/treatments/diagnosta.jpg",
    "/treatments/diagnosta.jpg",
    "/treatments/diagnosta.jpg",
  ];

  // Responsive: 1 visible on mobile, 4 on desktop.
  const [visible, setVisible] = useState(4);
  useEffect(() => {
    const updateVisible = () => {
      if (window.innerWidth < 768) {
        setVisible(1);
      } else {
        setVisible(4);
      }
    };
    updateVisible();
    window.addEventListener("resize", updateVisible);
    return () => window.removeEventListener("resize", updateVisible);
  }, []);

  const n = photos.length;
  // Extend photos three times for seamless looping.
  const extendedPhotos = [...photos, ...photos, ...photos];
  // Start in the middle copy.
  const initialIndex = n;
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // Auto-play: Move one slide every 3 seconds.
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => prev + 1);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // When currentIndex moves out of the middle copy, adjust it instantly.
  useEffect(() => {
    if (currentIndex >= n * 2) {
      setCurrentIndex((prev) => prev - n);
    } else if (currentIndex < n) {
      setCurrentIndex((prev) => prev + n);
    }
  }, [currentIndex, n]);

  // A lower threshold for swipe detection.
  const swipeConfidenceThreshold = 1000;
  const swipePower = (offset: number, velocity: number) =>
    Math.abs(offset) * velocity;

  return (
    <div className="w-full overflow-hidden">
      <motion.div
        className="flex"
        drag="x"
        dragElastic={0.2}
        onDragEnd={(e, info) => {
          const swipe = swipePower(info.offset.x, info.velocity.x);
          if (swipe < -swipeConfidenceThreshold) {
            setCurrentIndex((prev) => prev + 1);
          } else if (swipe > swipeConfidenceThreshold) {
            setCurrentIndex((prev) => prev - 1);
          }
        }}
        animate={{ x: `-${currentIndex * (100 / visible)}%` }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {extendedPhotos.map((src, index) => (
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
