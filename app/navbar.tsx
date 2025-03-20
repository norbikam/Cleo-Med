"use client"; // Only needed in Next.js 13 app directory for client components

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaFacebookF, FaInstagram } from "react-icons/fa";
import { HiMenu, HiX } from "react-icons/hi";
import Link from "next/link";
/*import { usePathname } from "next/navigation";

 type NavItem = {
  href: string;
  label: string;
};

const navItems: NavItem[] = [
  { href: "/", label: "Home" },
  { href: "/about", label: "O Nas" },
  { href: "/services", label: "Zabiegi" },
  { href: "/contact", label: "Kontakt" },
];*/

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  /*const pathname = usePathname();*/

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /*const isActive = (href: string) => pathname === href;*/

  return (
    <header>
      <motion.nav
        className={`fixed top-0 left-0 w-full bg-white shadow-md z-50 transition-all duration-700 ${
          scrolled ? "py-2 pb-6 bg-gray-100/50" : "py-6 pb-4"
        }`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Top Row with Socials & Contact (Animated Shrink) */}
        <motion.div
          className="hidden md:block bg-gray-100 overflow-hidden"
          initial={{ height: "auto" }}
          animate={{ height: scrolled ? 0 : "40px" }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        >
          <div className="py-2 md:px-12 flex justify-between items-center text-gray-700">
            <div className="flex space-x-3">
              <Link href="https://www.facebook.com/profile.php?id=100051111260227&mibextid=wwXIfr&rdid=vZfqH4cPYbiOzgqR" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">
                <FaFacebookF />
              </Link>
              <Link href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-pink-600">
                <FaInstagram />
              </Link>
            </div>
            <div className="flex space-x-4 text-sm font-extralight">
              <p>Phone: +123 456 789</p>
              <p>Email: example@email.com</p>
            </div>
          </div>
        </motion.div>

        {/* Main navigation row */}
        <div className="flex items-center justify-between max-w-[80vw] mx-auto px-6 md:px-12 pt-4">
          {/* Desktop Navigation Links (visible on md and up when not scrolled) */}
            <div className="hidden md:flex space-x-[10vw] text-xl font-extralight">
              <Link href="/" className="transition duration-500 text-gray-700 border-t-transparent hover:text-gray-900 border-t hover:border-black">
                Strona główna
              </Link>
              <a href="/onas" className="transition duration-500 text-gray-700 border-t-transparent hover:text-gray-900 border-t hover:border-black">
                O nas
              </a>
            </div>

          {/* Center Logo */}
          <motion.div
            className={`font-bold transition-all duration-500 text-black ${
              scrolled ? "text-lg opacity-50" : "text-3xl"
            }`}
          >
            LOGO
          </motion.div>

          {/* Desktop Navigation Links (visible on md and up when not scrolled) */}
            <div className="hidden md:flex space-x-[10vw] text-xl font-extralight">
              <a href="/zabiegi" className="transition duration-500 text-gray-700 border-t-transparent hover:text-gray-900 border-t hover:border-black">
                Zabiegi
              </a>
              <a href="/kontakt" className="transition duration-500 text-gray-700 border-t-transparent hover:text-gray-900 border-t hover:border-black">
                Kontakt
              </a>
            </div>

          {/* Mobile Hamburger Menu (visible on mobile only) */}
          <div className="md:hidden">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-gray-700 focus:outline-none"
            >
              {menuOpen ? (
                <HiX className="h-6 w-6" />
              ) : (
                <HiMenu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Navigation Menu (animated expandable list) */}
      <AnimatePresence>
        {menuOpen && !scrolled && (
          <motion.div
            className="md:hidden fixed top-20 left-0 w-full bg-white shadow-md z-[60]"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-col space-y-2 px-6 py-4 text-xl">
              <Link
                href="/"
                className="text-gray-700 hover:text-gray-900"
                onClick={() => setMenuOpen(false)}
              >
                Strona Główna
              </Link>
              <a
                href="/onas"
                className="text-gray-700 hover:text-gray-900"
                onClick={() => setMenuOpen(false)}
              >
                O nas
              </a>
              <a
                href="/zabiegi"
                className="text-gray-700 hover:text-gray-900"
                onClick={() => setMenuOpen(false)}
              >
                Zabiegi
              </a>
              <a
                href="/kontakt"
                className="text-gray-700 hover:text-gray-900"
                onClick={() => setMenuOpen(false)}
              >
                Kontakt
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {menuOpen && scrolled && (
          <motion.div
            className="md:hidden fixed top-10 left-0 w-full bg-white shadow-md z-[60]"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-col space-y-2 px-6 py-4 text-xl">
              <Link
                href="/"
                className="text-gray-700 hover:text-gray-900"
                onClick={() => setMenuOpen(false)}
              >
                Strona Główna
              </Link>
              <a
                href="/onas"
                className="text-gray-700 hover:text-gray-900"
                onClick={() => setMenuOpen(false)}
              >
                O nas
              </a>
              <a
                href="/zabiegi"
                className="text-gray-700 hover:text-gray-900"
                onClick={() => setMenuOpen(false)}
              >
                Zabiegi
              </a>
              <a
                href="/kontat"
                className="text-gray-700 hover:text-gray-900"
                onClick={() => setMenuOpen(false)}
              >
                Kontakt
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
