"use client"

import Navigation from "../navbar";
import Footer from "../footer";
import OurTeam from "../components/OurTeam";
import Image from "next/image";



export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen gap-16 font-[family-name:var(--font-geist-sans)]">
      <header>
        <Navigation/>
      </header>
      <main style={{maxWidth:"98vw"}} className="onasmaincont overflow-hidden pt-20 text-center">
          <div className="onasheader text-black py-20 bg-white">
            <h2 className="text-3xl font-medium">O nas</h2>
            <p className="text-xl">Lorem ipsum dolor sit amet, consectetur.</p>
          </div>
          <div className="onassplit h-screen">
            <div className="onassplitleft flex text-black" style={{minHeight:"50vh"}}>
                <div className="left w-1/2">
                    <Image src={'/treatments/diagnosta.jpg'} alt="" width={1000} height={500}></Image>
                </div>
                <div className="right flex w-1/2 text-center align-middle justify-center">
                    <div className="flex flex-col w-1/3 h-screen align-middle justify-center ">
                    <h2 className="text-2xl">tekst</h2><br/>
                    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Vero quisquam totam ab? Nihil illum sit tempora odio laudantium modi beatae totam officia quae eaque nobis, culpa dolores facilis doloremque minima cupiditate dolorem temporibus deleniti eligendi. Alias impedit dolore id aperiam commodi tenetur tempore ipsum aliquam eius, ducimus pariatur sint quod!</p>
                    </div>
                </div>
            </div>
            <div className="onassplitright flex text-black" style={{minHeight:"50vh"}}>
                <div className="left flex w-1/2 text-center align-center justify-center">
                    <div className="flex flex-col w-1/3 h-screen align-middle justify-center">
                    <h2 className="text-2xl">tekst</h2><br/>
                    <p className="">Lorem ipsum dolor sit amet consectetur adipisicing elit. Repudiandae qui quaerat, ea porro nam ullam sit facere exercitationem vero pariatur alias quod voluptatem non laudantium saepe? Officia rem dignissimos maxime!</p>
                    </div>
                </div>
                <div className="right w-1/2 bg-white">
                    <Image src={'/treatments/diagnosta.jpg'} alt="" width={1000} height={500}></Image>
                </div>
            </div>
          </div>
          <OurTeam/>
        </main>
      <Footer/>
    </div>
  );
}
