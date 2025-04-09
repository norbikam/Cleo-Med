import Navigation from "@/app/navbar";
import Footer from "@/app/footer";
import Image from "next/image";
import BooksyWidget from "@/app/components/BooksyWidget";
import { notFound } from "next/navigation";
import type { Metadata, ResolvingMetadata } from "next";

type Treatment = {
  title: string;
  description: string[];
  benefits?: string[];
  treatments: string[];
  image: string;
};

const treatments: Record<string, Treatment> = {
  morpheus: {
    title: "Morpheus 8 – RF mikroigłowy",
    description: [
      "Urządzenie łączące mikronakłuwanie i fale radiowe (RF)",
      "Działanie na różnych głębokościach skóry (do 8 mm)",
      "Efekty: lifting skóry, poprawa owalu twarzy, redukcja zmarszczek, rozstępów i blizn",
    ],
    treatments: [
      "Lifting skóry twarzy i szyi",
      "Redukcja rozstępów",
      "Ujędrnianie skóry na ciele",
      "Leczenie blizn potrądzikowych",
    ],
    image: "/pics/p1.jpeg",
  },
  dermapen: {
    title: "Dermapen 4 – mezoterapia mikroigłowa",
    description: [
      "Automatyczne mikronakłucia stymulujące regenerację skóry",
      "Pobudzenie produkcji kolagenu i elastyny",
    ],
    treatments: [
      "Odmładzanie skóry",
      "Redukcja blizn i rozstępów",
      "Wyrównanie kolorytu skóry",
    ],
    image: "/pics/p2.jpeg",
  },
  "laser-hybrydowy": {
    title: "Laser hybrydowy (frakcyjny + Er:YAG)",
    description: [
      "Połączenie technologii lasera frakcyjnego i erbowo-yagowego (Er:YAG)",
      "Działa na różnych głębokościach skóry, łącząc efekt ablacyjny i termiczny",
    ],
    benefits: [
      "Precyzyjna kontrola złuszczania naskórka",
      "Głębokie stymulowanie produkcji kolagenu",
      "Krótszy okres rekonwalescencji w porównaniu do klasycznego lasera CO2",
    ],
    treatments: [
      "Odmładzanie skóry",
      "Poprawa napięcia i elastyczności",
      "Redukcja blizn i przebarwień",
      "Wygładzanie zmarszczek",
    ],
    image: "/pics/p3.jpeg",
  },
  "laser-pikosekundowy": {
    title: "Laser pikosekundowy",
    description: [
      "Krótkie impulsy światła laserowego rozbijające pigment",
    ],
    treatments: [
      "Usuwanie tatuaży",
      "Melasma",
      "Znamię Ota",
      "Plamy soczewicowate (Lentigo)",
      "Piegi",
      "Rogowacenie łojotokowe",
      "Odmładzanie skóry",
      "Peeling węglowy",
    ],
    image: "/pics/p4.jpeg",
  },
  "laser-diodowy": {
    title: "Laser diodowy",
    description: [
      "Emisja światła niszcząca mieszki włosowe",
    ],
    treatments: [
      "Depilacja laserowa",
    ],
    image: "/pics/p5.jpeg",
  },
  hifu: {
    title: "HIFU – ultradźwiękowy lifting skóry",
    description: [
      "Wysokoczęstotliwościowe fale ultradźwiękowe działające w głębokich warstwach skóry",
    ],
    treatments: [
      "Lifting twarzy i szyi",
      "Ujędrnianie skóry",
      "Redukcja zmarszczek",
    ],
    image: "/pics/p6.jpeg",
  },
  hulabo: {
    title: "Hulabo 448k – zaawansowana terapia radiofrekwencyjna",
    description: [
      "Urządzenie wykorzystujące fale radiowe o częstotliwości 448 kHz",
      "Pobudza procesy regeneracyjne i poprawia metabolizm komórkowy",
    ],
    treatments: [
      "Redukcja cellulitu",
      "Ujędrnianie skóry twarzy i ciała",
      "Przyspieszenie regeneracji mięśni i tkanek",
      "Poprawa krążenia i drenaż limfatyczny",
    ],
    image: "/pics/p7.jpeg",
  },
};

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata(
  { params }: Props,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params;
  const treatment = treatments[slug];
  return {
    title: treatment ? treatment.title : "Zabieg nie znaleziony",
  };
}

export default async function TreatmentPage({ params }: Props) {
  const { slug } = await params;
  const treatment = treatments[slug];

  if (!treatment) {
    return notFound();
  }

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen gap-16 font-[family-name:var(--font-geist-sans)]">
      <header>
        <Navigation />
      </header>
      <main
        style={{ maxWidth: "98vw" }}
        className="overflow-hidden pt-20 text-center w-[98vw] justify-items-center"
      >
        <h2 className="text-black text-3xl pb-8">
          Zabieg z użyciem urządzenia
        </h2>
        <div className="treatmentcon flex flex-col container text-black text-2xl w-full text-center justify-items-center border border-black md:grid md:grid-cols-3 pl-6">
          <div className="col-span-2 align-middle pl-6">
            <h2 className="py-20 text-6xl">{treatment.title}</h2>
            <ul className="mb-8">
              {treatment.description.map((desc, index) => (
                <li key={index}>{desc}</li>
              ))}
            </ul>
            {treatment.benefits && (
              <>
                <p className="py-4 text-4xl text-left">Zalety:</p>
                <ul className="list-disc pr-8 pl-8 text-left pb-10">
                  {treatment.benefits.map((benefit, index) => (
                    <li key={index}>{benefit}</li>
                  ))}
                </ul>
              </>
            )}
            <p className="py-4 text-4xl text-left">Zabiegi:</p>
            <ul className="list-disc pr-8 pl-8 text-left pb-10">
              {treatment.treatments.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
            <BooksyWidget />
          </div>
          <div className="justify-items-right">
            <Image
              src={treatment.image}
              alt={treatment.title}
              width={1000}
              height={1000}
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
