"use client"; // Only needed in Next.js 13 app directory for client components

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Replace these with your own images or slide content
const slides = [
  "https://media.istockphoto.com/id/2038457340/pl/zdj%C4%99cie/zbli%C5%BCenie-bardzo-szczeg%C3%B3%C5%82owe-uj%C4%99cie-kobiecej-sk%C3%B3ry-z-piegami-i-pipet%C4%85-z-serum-przyci%C4%99te.jpg?s=2048x2048&w=is&k=20&c=VHvrZLXFQGcfeZG75sgip1OkjaL5K9b3uXxHgbmd2IA=",
  "https://media.istockphoto.com/id/1644805424/pl/zdj%C4%99cie/kobieta-nak%C5%82adaj%C4%85ca-olejek-eteryczny-na-twarz-zbli%C5%BCenie.jpg?s=2048x2048&w=is&k=20&c=XTwl0lHMOxBuL0WrxTmJ0corsRmBDj5qrdpaxz3t7Q0=",
  "https://media.istockphoto.com/id/1943298633/pl/zdj%C4%99cie/pi%C4%99kna-m%C5%82oda-kobieta-nak%C5%82adaj%C4%85ca-serum-na-twarz-na-be%C5%BCowym-tle-zbli%C5%BCenie-miejsce-na-tekst.jpg?s=2048x2048&w=is&k=20&c=86hqC1yu5u4ycaTUSvb1Ij4WaMhP8kdgExebPTOpoCk=",
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
  const [direction, setDirection] = useState(0);

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setCurrent((prev) => (prev + newDirection + slides.length) % slides.length);
  };

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
