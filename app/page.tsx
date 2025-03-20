"use client"

import Navigation from "./navbar";
import Slideshow from "./components/slideshow"
import ProceduresGrid from "./components/ProceduresGrid";
import Footer from "./footer";
import OurTeam from "./components/OurTeam";
import FourPhotoSlideshow from "./components/FourPhotoSlideshow";
import VoucherInfo from "./components/VoucherInfo";
import InfoBlocks from "./components/InfoBlocks";
import FourPhotoSlideshowGap from "./components/FourPhotoSlideshowGap"
import MembercardInfo from "./components/MembercardInfo";
import Partner from "./components/Partner";


export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen gap-16 font-[family-name:var(--font-geist-sans)]">
      <header>
        <Navigation/>
      </header>
      <main style={{maxWidth:"98vw"}} className="overflow-hidden pt-14">
          <Slideshow />
          <ProceduresGrid />
          <Partner />
          <OurTeam />
          <FourPhotoSlideshow />
          <VoucherInfo />
          <FourPhotoSlideshowGap />
          <div className="infomembermerge">
            <MembercardInfo />
            <InfoBlocks />
          </div>
        </main>
      <Footer/>
    </div>
  );
}
