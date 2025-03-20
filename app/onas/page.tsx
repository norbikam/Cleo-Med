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
            <p>Jesteśmy zespołem z ponad dziesięcioletnim doświadczeniem w branży kosmetologii i medycyny estetycznej. Naszym celem jest dostarczanie najwyższej jakości usług, które podkreślają naturalne piękno i dbają o zdrowie skóry.</p>
            <br />
            <p>Wykonujemy szereg zabiegów z wykorzystaniem najnowszych technik oraz najlepszej jakości toksyn, stymulatorów i nici PDO, które pozwalają uzyskać naturalne i długotrwałe efekty odmładzające, liftingujące i regenerujące.</p>
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
            <p>Oprócz profesjonalnych usług kosmetologicznych i estetycznych, oferujemy również szkolenia dla osób, które chcą poszerzyć swoją wiedzę i umiejętności w zakresie nowoczesnych technik kosmetologicznych.</p>
            <br />
            <p>Prowadzimy zarówno tradycyjne szkolenia teoretyczno-praktyczne, obejmujące techniki pielęgnacyjne, zabiegi odmładzające i modelujące, jak i specjalistyczne kursy z obsługi zaawansowanych urządzeń, takich jak:</p>
            <ul className="list-disc pl-8 pr-8">
              <li>Lasery do usuwania owłosienia i przebarwień,
              </li>
              <li>Urządzenia do modelowania sylwetki i redukcji cellulitu,
              </li>
              <li>Aparaty do terapii anti-aging i stymulacji kolagenu,
              </li>
              <li>Technologie do liftingu i ujędrniania skóry,
              </li>
              <li>Lasery do usuwania tatuaży – nowoczesne metody skutecznego eliminowania pigmentu z minimalnym ryzykiem uszkodzeń skóry.
              </li>
            </ul>
            <br />
            <p>Nasze szkolenia są prowadzone przez doświadczonych specjalistów i zakończone certyfikatem, który potwierdza zdobyte kwalifikacje.</p>
            <br />
            <p>Zapraszamy do skorzystania z naszych usług i szkoleń – gwarantujemy profesjonalizm, indywidualne podejście oraz nowoczesne technologie na najwyższym poziomie!</p>
          </div>
          <div className="splitimagebot w-full h-64 bg-gray-300 md:h-[85vh] order-1 md:order-2"></div>
        </div>

        <OurTeam />
      </main>
      <Footer />
    </div>
  );
}
