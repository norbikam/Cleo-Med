"use client"; // Only needed in Next.js 13 app directory for client components

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Replace these with your own images or slide content
const slides = [
  "/slideshow/cleo1.jpeg",
  "/slideshow/cleo2.jpeg",
  "/slideshow/cleo3.jpeg",
  "/slideshow/cleo4.jpeg",
];

// Variants for slide transitions
const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
  }),
};

const swipeConfidenceThreshold = 10000;
const swipePower = (offset: number, velocity: number) =>
  Math.abs(offset) * velocity;

export default function Slideshow() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setCurrent((prev) => (prev + newDirection + slides.length) % slides.length);
  };

  // Auto-pagination effect
  useEffect(() => {
    const interval = setTimeout(() => {
      paginate(1); // Moves to the next slide
    }, 5000); // 5 seconds

    return () => clearTimeout(interval); // Clears timeout on unmount or user interaction
  }, [current]); // Resets timer on slide change

  return (
    <motion.div
      className="relative overflow-hidden w-full h-64 md:h-96 bg-gray-200"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <AnimatePresence custom={direction}>
        <motion.img
          key={current}
          src={slides[current]}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 },
          }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={1}
          onDragEnd={(e, { offset, velocity }) => {
            const swipe = swipePower(offset.x, velocity.x);
            if (swipe < -swipeConfidenceThreshold) {
              paginate(1);
            } else if (swipe > swipeConfidenceThreshold) {
              paginate(-1);
            }
          }}
          className="absolute w-full h-full object-cover"
        />
      </AnimatePresence>

      {/* Navigation dots */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              if (index !== current) {
                setDirection(index > current ? 1 : -1);
                setCurrent(index);
              }
            }}
            className={`w-3 h-3 rounded-full transition-colors duration-300 ${
              index === current ? "bg-white" : "bg-gray-500"
            }`}
          />
        ))}
      </div>
    </motion.div>
  );
}
