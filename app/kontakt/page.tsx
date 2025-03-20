"use client";

import Navigation from "../navbar";
import Footer from "../footer";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen gap-16 font-[family-name:var(--font-geist-sans)]">
      <header>
        <Navigation />
      </header>
      <main style={{ maxWidth: "98vw" }} className="overflow-hidden pt-20 text-center">
        <h2 className="text-black text-2xl pt-6" style={{fontSize:"5rem"}}>Kontakt</h2>
        <h3 className="text-gray-500 pb-10 py-4 text-2xl">Slogan...</h3>
        <div className="w-[98vw] flex flex-col md:grid md:grid-cols-5 md:gap-8 items-center text-black w-full bg-white">
          <div className="text-center md:w-full col-span-3 justify-items-center">
            <h2 style={{fontSize:"4rem"}}>CleoMed</h2>
            <p style={{marginTop:"-1.5rem"}}>Gabinet kosmetyczny</p><br />
            <div className="flex flex-col justify-center text-xl w-full md:grid md:grid-cols-2 md:text-center">
              <div className="flex flex-col sm:w-full"><p>ul. Wileńska 39</p><p>76-200 Słupsk</p></div>
              <div className="flex flex-col sm:w-full md:py-0 sm:py-10"><p>example@email.com</p><p>+48 123 456 789</p></div>
            </div>
            <br />
            <iframe className="justify-self-center" src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2318.3073038303396!2d17.0172382770225!3d54.46498239043967!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x46fe10a824f679b9%3A0xef089efff4316619!2sC.H.%20Manhatan!5e0!3m2!1spl!2spl!4v1742386425730!5m2!1spl!2spl" width="800" height="450" loading="lazy"></iframe>
            </div>
          <div className="splitimagetop w-full h-64 bg-gray-300 md:h-[85vh] col-span-2"></div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
