"use client";

export default function MembercardInfo() {
  return (
    <section className="relative min-h-auto flex items-center justify-center px-4 py-20">
      {/* Background layer with fixed attachment for parallax effect */}
      <div
        className="absolute inset-0 z-[-1] bg-cover bg-center md:bg-fixed bg-no-repeat sm:bg-scroll"
        style={{
          backgroundImage:
            "url(https://img.freepik.com/darmowe-zdjecie/rozmazana-buzka-kobieta-trzyma-wizytowke_23-2149343413.jpg?t=st=1742240040~exp=1742243640~hmac=a17e3cfebc8740be914aebc395871b36d583ef845c0a2623613545e2fd07b104&w=2000)",
        }}
      />
      
      {/* Content layer */}
      <div className="relative max-w-3xl mx-auto text-whitesmoke text-center">
        <h2 className="text-4xl font-bold mb-6">Karta stałego klienta</h2>
        <p className="text-lg mb-4 font-extralight">
        W PODZIĘKOWANIU ZA ZAUFANIE I PRZYWIĄZANIE, ZOSTAŁY WPROWADZONE KARTY STAŁEGO KLIENTA.</p>
      </div>
    </section>
  );
}
