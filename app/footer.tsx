"use client"
import Link from "next/link"
import { FaFacebookF, FaInstagram } from "react-icons/fa";

export default function Footer(){
  return(
    <div>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center align-middle mb-10 text-black">
        <Link
                href="https://www.facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-600"
              >
                <FaFacebookF />
              </Link>
              <Link
                href="https://www.instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-pink-600"
              >
                <FaInstagram />
              </Link>
        <h2 className="text-end">Projekt i wykonanie Norbert Okoniewski</h2>
      </footer>
    </div>
  )
}