import Navigation from "@/app/navbar";
import Footer from "@/app/footer";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata, ResolvingMetadata } from "next";
import ZolmiButton from "@/app/components/ZolmiButton";

type Treatment = {
    title: string;
    description: string[];
    treatments: string[];
    image: string;
  };
  
  const treatments: Record<string, Treatment> = {
    "mezoterapia-iglowa": {
      title: "Mezoterapia igłowa",
      description: [
        "Intensywne nawilżenie, regeneracja i odmłodzenie skóry poprzez wprowadzenie koktajli odżywczych",
      ],
      treatments: [],
      image: "/pics/p1.jpeg",
    },
    "mezoterapia-mikroiglowa": {
      title: "Mezoterapia mikroigłowa (Dermapen 4)",
      description: [
        "Poprawa jędrności, redukcja blizn, zmarszczek i rozszerzonych porów",
      ],
      treatments: [],
      image: "/pics/p2.jpeg",
    },
    "peelingi-chemiczne": {
      title: "Peelingi chemiczne",
      description: [
        "Usuwanie martwego naskórka, wyrównanie kolorytu, stymulacja odnowy skóry",
      ],
      treatments: [],
      image: "/pics/p3.jpeg",
    },
    botoks: {
      title: "Botoks",
      description: [
        "Redukcja zmarszczek mimicznych (czoło, lwia zmarszczka, kurze łapki)",
      ],
      treatments: [],
      image: "/pics/p3.jpeg",
    },
    "kwas-hialuronowy": {
      title: "Kwas hialuronowy",
      description: [
        "Wypełnianie bruzd nosowo-wargowych, modelowanie ust i konturu twarzy",
      ],
      treatments: [],
      image: "/pics/p4.jpeg",
    },
    "osocze-bogatoplytkowe": {
      title: "Osocze bogatopłytkowe (PRP, „wampirzy lifting”)",
      description: [
        "Intensywna regeneracja skóry i stymulacja produkcji kolagenu",
      ],
      treatments: [],
      image: "/pics/p5.jpeg",
    },
    "nici-liftingujace-pdo": {
      title: "Nici liftingujące PDO",
      description: [
        "Uniesienie owalu twarzy, poprawa jędrności skóry",
      ],
      treatments: [],
      image: "/pics/p6.jpeg",
    },
    "lipoliza-iniekcyjna": {
      title: "Lipoliza iniekcyjna",
      description: [
        "Redukcja miejscowej tkanki tłuszczowej, np. podwójnego podbródka",
      ],
      treatments: [],
      image: "/pics/p7.jpeg",
    },
    "wypelnianie-doliny-lez": {
      title: "Wypełnianie doliny łez",
      description: [
        "Poprawa wyglądu skóry pod oczami, redukcja cieni",
      ],
      treatments: [],
      image: "/pics/p8.jpeg",
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
        className="overflow-hidden pt-20 text-center w-[98vw] justify-items-center w-max-[98vw]"
      >
        <h2 className="text-black text-3xl pb-8">
          Zabiegi na twarz
        </h2>
        <div className="treatmentcon flex flex-col container text-black text-2xl w-full text-center justify-items-center border border-black md:grid md:grid-cols-3">
          <div className="col-span-2 align-middle py-6 px-8 md:px-0">
            <h2 className="py-20 text-2xl md:text-6xl">{treatment.title}</h2>
            <ul className="mb-8">
              {treatment.description.map((desc, index) => (
                <li key={index}>{desc}</li>
              ))}
            </ul>
            <ul className="list-disc pr-8 pl-0 md:pl-8 text-left pb-10">
              {treatment.treatments.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
            <ZolmiButton />
          </div>
          <div className="overflow-hidden">
                      <Image
                        src={treatment.image}
                        alt={treatment.title}
                        width={1000}
                        height={1600}
                        className="object-cover w-full h-full"
                      />
                      </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
