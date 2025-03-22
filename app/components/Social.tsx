"use client";

import Link from "next/link";
import { FaFacebookF, FaInstagram, FaWhatsapp } from "react-icons/fa";


export function Facebook() {
  return (
    <Link
      href="https://www.facebook.com/profile.php?id=100051111260227&mibextid=wwXIfr&rdid=vZfqH4cPYbiOzgqR"
      target="_blank"
      rel="noopener noreferrer"
      className="hover:text-blue-600"
      >
      <FaFacebookF />
    </Link>
  );
}

export function FacebookColor() {
  return (
    <Link
      href="https://www.facebook.com/profile.php?id=100051111260227&mibextid=wwXIfr&rdid=vZfqH4cPYbiOzgqR"
      target="_blank"
      rel="noopener noreferrer"
      className="hover:text-blue-600 text-blue-400"
      >
      <FaFacebookF />
    </Link>
  );
}

export function Instagram() {
    return (
      <Link
                href="https://www.instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-pink-600"
              >
                <FaInstagram />
                </Link>
    );
}

export function InstagramColor() {
  return (
    <Link
              href="https://www.instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-pink-600 text-pink-400"
            >
              <FaInstagram />
              </Link>
  );
}

export function WhatsApp() {
    return (
      <Link
              href="https://wa.me/48696273477"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-green-600">
              <FaWhatsapp/>
              </Link>
    );
  }

  export function WhatsAppColor() {
    return (
      <Link
              href="https://wa.me/48696273477"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-green-600 text-green-400">
              <FaWhatsapp/>
              </Link>
    );
  }