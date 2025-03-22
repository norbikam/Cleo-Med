"use client"
import { Facebook, Instagram, WhatsApp } from "./components/Social";

export default function Footer(){
  return(
    <div>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center align-middle mb-10 text-black bg-gray-100 py-12 font-extralight mt-12" style={{width:"98vw"}}>
        <Facebook/>
        <Instagram/>
        <WhatsApp/>
              
        <h2 className="text-end">Projekt i wykonanie Norbert Okoniewski</h2>
      </footer>
    </div>
  )
}