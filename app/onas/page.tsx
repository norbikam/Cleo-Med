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
        
        

  <div className="flex flex-col md:grid md:grid-cols-2 items-center text-black w-full bg-white font-light">
  {/* First Section */}
    <div className="splitimagetop w-full h-full bg-gray-300 "></div>
    <div className="text-left px-6 md:px-20 md:max-w-[30vw] py-6">
      <p>
        <strong>Cleo – Centrum Medycyny Estetycznej i Kosmetologii</strong> to miejsce, gdzie pasja do piękna spotyka się z profesjonalizmem i nowoczesnymi technologiami. Od ponad 15 lat pomagamy naszym Klientkom i Klientom wydobywać naturalne piękno, poprawiać kondycję skóry oraz czuć się pewniej we własnym ciele. Naszym priorytetem jest skuteczność, bezpieczeństwo oraz naturalne efekty, osiągane dzięki wykorzystaniu innowacyjnych technologii i najwyższej jakości preparatów.
      </p>
      <br />
      <p>
        W naszej ofercie znajdą Państwo szeroki wachlarz zabiegów, obejmujących pielęgnację i regenerację skóry, modelowanie sylwetki oraz nowoczesne terapie laserowe. Pracujemy wyłącznie na sprawdzonych produktach, takich jak toksyny botulinowe, stymulatory tkankowe i nici PDO, które pozwalają uzyskać długotrwałe i naturalne rezultaty.
      </p>
      <br />
      <p>
        Nasze usługi obejmują:
      </p>
      <ul className="list-disc pl-8 pr-8">
        <li>Zabiegi na twarz – poprawiające kondycję skóry i podkreślające naturalne piękno</li>
        <li>Zabiegi na ciało – modelujące sylwetkę i wspomagające redukcję tkanki tłuszczowej</li>
        <li>Zabiegi laserowe – skuteczne terapie dla różnych problemów skórnych</li>
        <li>Zabiegi odmładzające – przywracające skórze młody wygląd</li>
        <li>Zabiegi relaksacyjne – zapewniające odprężenie i regenerację</li>
        <li>Usuwanie tatuaży – nowoczesne metody eliminacji niechcianych tatuaży</li>
      </ul>
    </div>

  {/* Second Section */}
    <div className="text-left md:text-right px-6 md:px-20 md:max-w-[30vw] py-6">
      <h2 className="text-xl font-medium">Szkolenia</h2>
      <br />
      <p>
        Oprócz profesjonalnych usług oferujemy również specjalistyczne szkolenia dla kosmetologów i lekarzy medycyny estetycznej. Programy szkoleniowe obejmują zarówno techniki manualne, jak i obsługę zaawansowanych urządzeń, takich jak:
      </p>
      <br />
      <ul className="list-disc pl-8 pr-8">
        <li>Systemy laserowe do terapii skóry</li>
        <li>Technologie modelowania sylwetki</li>
        <li>Urządzenia do zabiegów odmładzających i liftingujących</li>
        <li>Nowoczesne metody usuwania tatuaży</li>
      </ul>
      <br />
      <p>
        Szkolenia prowadzone są przez doświadczonych specjalistów i zakończone certyfikacją, potwierdzającą zdobyte kwalifikacje. Uczestnicy mogą liczyć na pełne wsparcie merytoryczne i praktyczne, a także dostęp do najnowszych metod i rozwiązań wykorzystywanych w medycynie estetycznej.
      </p>
      <br />
      <p>
        W <strong>Cleo</strong> tworzymy atmosferę spokoju i zaufania, w której każda osoba może poczuć się wyjątkowo. Dbamy nie tylko o urodę, ale też o dobre samopoczucie – wierzymy, że jedno wynika z drugiego.
      </p>
      <br />
      <p>
        Zapraszamy do skorzystania z naszej oferty – łączymy profesjonalizm z indywidualnym podejściem, aby zapewnić najwyższy poziom usług i satysfakcję naszych klientów.
      </p>
    </div>
    <div className="splitimagebot w-full h-full h-min-[200px] text-transparent py-64">x</div>
</div>


        <OurTeam />
      </main>
      <Footer />
    </div>
  );
}