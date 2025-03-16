"use client"

import Navigation from "./navbar";
import Slideshow from "./components/slideshow"
import ProceduresGrid from "./components/ProceduresGrid";
import Footer from "./footer";
import OurTeam from "./components/OurTeam";
import FourPhotoSlideshow from "./components/FourPhotoSlideshow";
import VoucherInfo from "./components/VoucherInfo";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen gap-16 font-[family-name:var(--font-geist-sans)] scroll-smooth">
      <header>
      <Navigation/>
      </header>
      <main className="mt-12 w-full">
          <Slideshow/>
          <ProceduresGrid/>
          <OurTeam/>
          <FourPhotoSlideshow/>
          <VoucherInfo />
        </main>
      <Footer/>
    </div>
  );
}
