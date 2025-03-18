"use client";

import Navigation from "../navbar";
import Footer from "../footer";
import OurTeam from "../components/OurTeam";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen gap-16 font-[family-name:var(--font-geist-sans)]">
      <header>
        <Navigation />
      </header>
      <main style={{ maxWidth: "98vw" }} className="overflow-hidden pt-20 text-center">
        <div className="text-black py-20 bg-white">
          <h2 className="text-3xl font-medium">O nas</h2>
          <p className="text-xl">Lorem ipsum dolor sit amet, consectetur.</p>
        </div>
        
        <div className="flex flex-col md:grid md:grid-cols-2 md:gap-8 items-center text-black w-full px-6 md:px-12">
          {/* First Section */}
          <div className="splitimagetop w-full h-64 bg-gray-300 md:h-[85vh]"></div>
          <div className="text-left md:w-[30vw] md:pl-20">
            <p>Dzięki szerokiej ofercie z zakresu kosmetologii...</p>
            <br />
            <p>Gabinet Kosmetologii Estetycznej DERMESTETICA oferuje...</p>
            <br />
            <p>Zabiegi wykonywane są na renomowanych liniach...</p>
          </div>
          
          {/* Second Section */}
          <div className="text-left md:text-right md:w-[30vw] md:pr-20 order-2 md:order-1">
            <p>W skład naszego personelu wchodzą...</p>
            <br />
            <p>W trosce o Państwa bezpieczeństwo...</p>
            <br />
            <p>Jako nieliczni prowadzimy procedurę...</p>
          </div>
          <div className="splitimagebot w-full h-64 bg-gray-300 md:h-[85vh] order-1 md:order-2"></div>
        </div>

        <OurTeam />
      </main>
      <Footer />
    </div>
  );
}
