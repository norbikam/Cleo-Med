"use client";

export default function MembercardInfo() {
  return (
    <section className="relative min-h-auto flex items-center justify-center px-4 py-20">
      {/* Background layer with fixed attachment for parallax effect */}
      <div
        className="absolute inset-0 z-[-1] bg-cover bg-center md:bg-fixed bg-no-repeat sm:bg-scroll"
        style={{
          backgroundImage:
            "url(/membercardinfobg.jpeg)",
        }}
      />
      
      {/* Content layer */}
      <div className="relative max-w-3xl mx-auto text-whitesmoke text-center">
        <h2 className="text-4xl font-bold mb-6">Karta stałego klienta</h2>
        <p className="text-lg mb-4 font-extralight">
        W ramach podziękowania za zaufanie i lojalność wprowadziliśmy specjalne karty stałego klienta.</p>
      </div>
    </section>
  );
}