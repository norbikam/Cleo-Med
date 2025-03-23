import Navigation from "@/app/navbar";
import Footer from "@/app/footer";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata, ResolvingMetadata } from "next";
import BooksyWidget from "@/app/components/BooksyWidget";

type Treatment = {
  title: string;
  description: string[];
  benefits?: string[];
  treatments: string[];
  image: string;
};

const treatments: Record<string, Treatment> = {
    "lipoliza-iniekcyjna": {
      title: "Lipoliza iniekcyjna",
      description: [
        "Miejscowa redukcja tkanki tłuszczowej (np. brzuch, uda, ramiona)",
      ],
      treatments: [],
      image: "/pics/p8.jpeg", // Podmień na właściwy obrazek
    },
    karboksyterapia: {
      title: "Karboksyterapia",
      description: [
        "Terapia dwutlenkiem węgla poprawiająca mikrokrążenie",
        "Redukcja cellulitu",
      ],
      treatments: [],
      image: "/pics/p9.jpeg",
    },
    endermologia: {
      title: "Endermologia",
      description: [
        "Masaż podciśnieniowy poprawiający jędrność skóry",
        "Redukcja tkanki tłuszczowej",
      ],
      treatments: [],
      image: "/pics/p10.jpeg",
    },
    "osocze-bogatoplytkowe": {
      title: "Osocze bogatopłytkowe (PRP) na ciało",
      description: [
        "Regeneracja skóry",
        "Redukcja rozstępów i blizn",
      ],
      treatments: [],
      image: "/pics/p11.jpeg",
    },
    "mezoterapia-iglowa": {
      title: "Mezoterapia igłowa na ciało",
      description: [
        "Poprawa elastyczności skóry",
        "Redukcja cellulitu i rozstępów",
      ],
      treatments: [],
      image: "/pics/p12.jpeg",
    },
    "modelowanie-sylwetki": {
      title: "Modelowanie sylwetki za pomocą kwasu hialuronowego",
      description: [
        "Powiększanie pośladków",
        "Korekta asymetrii sylwetki",
      ],
      treatments: [],
      image: "/pics/p13.jpeg",
    },
    "rf-mikroiglowy": {
      title: "RF mikroigłowy na ciało",
      description: [
        "Lifting i ujędrnienie skóry",
        "Redukcja blizn i rozstępów",
      ],
      treatments: [],
      image: "/pics/p14.jpeg",
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
          Zabiegi na ciało
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
