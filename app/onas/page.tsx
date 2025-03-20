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
        <div className="text-black py-20">
          <h2 className="text-3xl font-medium">O nas</h2>
          <p className="text-xl">Poznaj nasz zespół</p>
        </div>
        
        <div className="flex flex-col md:grid md:grid-cols-2 md:gap-8 items-center text-black w-full px-6 md:px-12 bg-white w-[98vw] font-light">
          {/* First Section */}
          <div className="splitimagetop w-full h-64 bg-gray-300 md:h-[85vh]"></div>
          <div className="text-left md:w-[30vw] md:pl-20">
            <p>Z ponad 15-letnim doświadczeniem w branży kosmetologii i medycyny estetycznej, specjalizujemy się w dostarczaniu zaawansowanych rozwiązań poprawiających wygląd i kondycję skóry. Naszym priorytetem jest skuteczność, bezpieczeństwo oraz naturalne efekty, osiągane dzięki wykorzystaniu innowacyjnych technologii i najwyższej jakości preparatów.</p>            
            <br />
            <p>Oferujemy szeroki wachlarz zabiegów, obejmujących pielęgnację i regenerację skóry, modelowanie sylwetki oraz nowoczesne terapie laserowe. Pracujemy wyłącznie na sprawdzonych produktach, w tym toksynach, stymulatorach tkankowych i niciach PDO, które pozwalają uzyskać długotrwałe i naturalne rezultaty.</p>
            <br />
            <p>W naszej ofercie znajdą Państwo szeroką gamę zabiegów, w tym:</p>
              <ul className="list-disc pl-8 pr-8">
                <li>Zabiegi na twarz</li>
                <li>Zabiegi na ciało</li>
                <li>Zabiegi laserowe</li>
                <li>Zabiegi odmładzające</li>
                <li>Zabiegi relaksacyjne</li>
                <li>Usuwanie tatuaży</li>
              </ul>
          </div>
          
          {/* Second Section */}
          <div className="text-left md:text-right md:w-[30vw] md:pr-20 order-2 md:order-1">
            <h2 className="text-xl font-medium">Szkolenia</h2>
            <br/>
            <p>Oprócz profesjonalnych usług oferujemy również specjalistyczne szkolenia dla kosmetologów i lekarzy medycyny estetycznej. Programy szkoleniowe obejmują zarówno techniki manualne, jak i obsługę zaawansowanych urządzeń, takich jak:</p>
            <br />
            <ul className="list-disc pl-8 pr-8">
              <li>Systemy laserowe do terapii skóry</li>
              <li>Technologie modelowania sylwetki</li>
              <li>Urządzenia do zabiegów odmładzających i liftingujących</li>
              <li>Nowoczesne metody usuwania tatuaży</li>
            </ul>
            <br />
            <p>Szkolenia prowadzone są przez doświadczonych specjalistów i zakończone certyfikacją, potwierdzającą zdobyte kwalifikacje.</p>
            <br />
            <p>Zapraszamy do skorzystania z naszej oferty – łączymy profesjonalizm z indywidualnym podejściem, aby zapewnić najwyższy poziom usług i satysfakcję naszych klientów.</p>
          </div>
          <div className="splitimagebot w-full h-64 bg-gray-300 md:h-[85vh] order-1 md:order-2"></div>
        </div>

        <OurTeam />
      </main>
      <Footer />
    </div>
  );
}
