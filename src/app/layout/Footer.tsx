"use client";
import Image from "next/image";
import Link from "next/link";
export default function Footer() {
  return (
    <footer className="w-full border-t border-gray-300 bg-white px-4 py-3
      flex flex-col sm:flex-row items-center justify-between text-xs sm:text-sm text-gray-600
      fixed bottom-0 left-0 z-50
    ">
      {/* Partie gauche */}
      <div className="flex flex-wrap items-center justify-center space-x-1 sm:space-x-2 mb-2 sm:mb-0">
        <span>© 2025 AriZon, Inc.</span>
        <span className="hidden sm:inline">·</span>
        <Link href="/ProductsList" className="hover:underline">Terms</Link>
        <span className="hidden sm:inline">·</span>
        <Link href="/Historique" className="hover:underline">Sitemap</Link>
        <span className="hidden sm:inline">·</span>
        <Link href="#" className="hover:underline">Privacy</Link>
        <span className="hidden sm:inline">·</span>
        <Link href="#" className="hover:underline">Your Privacy Choices</Link>
        <Image 
          src="ChekBoxFooter.svg" 
          alt="privacy icon"
          width={26} 
          height={12} 
          className="inline-block ml-1"
        />
      </div>

      {/* Partie droite */}
      <div className="flex flex-wrap items-center justify-center space-x-2 sm:space-x-4">
        {/* Sélecteur de langue */}
        <button className="flex items-center space-x-1 hover:underline">
          <Image src="/globeMonde.svg" alt="lang" width={16} height={16} />
          <span>Français (CMR)</span>
        </button>

        {/* Nom utilisateur */}
        <span className="hover:underline cursor-pointer">Fefa</span>

        {/* Support & ressources */}
        <div className="relative group">
          <button className="flex items-center space-x-1 hover:underline">
            <span>Support & resources</span>
            <span className="transform group-hover:rotate-180 transition">&#x25B2;</span>
          </button>
          {/* Menu déroulant */}
          <div className="absolute bottom-10 right-0 mt-2 hidden group-hover:block bg-white border rounded shadow-md w-48 text-gray-700 z-50">
            <Link href="#" className="block px-4 py-2 hover:bg-gray-100">Aide</Link>
            <Link href="#" className="block px-4 py-2 hover:bg-gray-100">Centre support</Link>
            <Link href="#" className="block px-4 py-2 hover:bg-gray-100">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
