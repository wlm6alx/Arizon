"use client";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { useUserProfile } from "@/hooks/use-user-profile";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";

export default function Header() {
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [open, setOpen] = useState(false);
  
  // Hooks for user data and authentication
  const { user } = useUserProfile();
  const { logout } = useAuth();
  const router = useRouter();

  const menuRef = useRef<HTMLDivElement | null>(null);
  const LangueRef = useRef<HTMLDivElement | null>(null);

  // Gestion ouverture/fermeture
  const toggleLang = () => {
    setIsLangOpen(!isLangOpen);
    setOpen(false);
  };

  const toggleMenu = () => {
    setOpen(!open);
    setIsLangOpen(false);
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      setOpen(false);
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Get user display name
  const getUserDisplayName = () => {
    if (!user) return "Chargement...";
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user.username) {
      return user.username;
    }
    return user.email;
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user) return "?";
    if (user.firstName && user.lastName) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
    }
    if (user.username) {
      return user.username.charAt(0).toUpperCase();
    }
    return user.email.charAt(0).toUpperCase();
  };

  // Fermer si clic en dehors
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        LangueRef.current &&
        !LangueRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
        setIsLangOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="flex items-center justify-between px-6 py-3 bg-white relative">
      {/* Logo */}
      <div className="flex items-center space-x-2">
        <Image alt="Logo Arizon" src="../AriZon.svg" width={192} height={80} />
      </div>

      {/* Barre de recherche */}
      <div className="flex items-center w-1/2">
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Tapez ici pour rechercher"
            className="w-full rounded-full border px-3 py-2 pr-12 focus:outline-none"
          />
          <button 
            className="absolute inset-y-0 right-2 flex items-center justify-center"
            title="Rechercher"
            aria-label="Rechercher"
          >
            <Image
              alt="Search button"
              src="/SearchButton.svg"
              width={24}
              height={24}
            />
          </button>
        </div>
      </div>

      {/* Sélecteur de langue + hamburger */}
      <div className="flex items-center space-x-4 relative">
        {/* Langue */}
        <div ref={LangueRef} className="flex items-center">
          <button 
            onClick={toggleLang} 
            className="items-center"
            title="Changer de langue"
            aria-label="Changer de langue"
          >
            <Image
              alt="Selection de la langue"
              src="../globeMonde.svg"
              width={16}
              height={16}
            />
          </button>
          {isLangOpen && (
            <div className="absolute top-8 right-8 border-2 border-black rounded w-32 bg-gray-300 shadow-md">
              <div className="flex flex-col items-center">
                <button 
                  className="w-full text-gray-700 py-2 hover:bg-gray-100 rounded"
                  title="Sélectionner le français"
                  aria-label="Sélectionner le français"
                >
                  Français
                </button>
                <span className="block w-2/5 h-0.5 bg-gray-300 my-1"></span>
                <button 
                  className="w-full text-gray-700 py-2 hover:bg-gray-100 rounded"
                  title="Sélectionner l'anglais"
                  aria-label="Sélectionner l'anglais"
                >
                  Anglais
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bouton hamburger animé */}
        <div ref={menuRef} className="flex items-center relative">
          <button
            onClick={toggleMenu}
            className="relative w-10 h-10 flex flex-col justify-center items-center group"
            title="Ouvrir le menu"
            aria-label="Ouvrir le menu"
            aria-expanded={open ? "true" : "false"}
          >
            <span
              className={`block h-0.5 w-6 bg-gray-800 rounded transition-transform duration-300 ${
                open ? "rotate-45 translate-y-1.5" : ""
              }`}
            ></span>
            <span
              className={`block h-0.5 w-6 bg-gray-800 rounded transition-all duration-300 my-1 ${
                open ? "opacity-0" : "opacity-100"
              }`}
            ></span>
            <span
              className={`block h-0.5 w-6 bg-gray-800 rounded transition-transform duration-300 ${
                open ? "-rotate-45 -translate-y-1.5" : ""
              }`}
            ></span>
          </button>

          {/* Menu déroulant */}
          {open && (
            <div className="absolute top-14 right-0 shadow-lg rounded-lg w-72 bg-white py-4 z-50 transition-all duration-300 ease-in-out">
              {/* Avatar + nom */}
              <div className="flex flex-col items-center">
                {user?.avatar ? (
                  <Image
                    src={user.avatar}
                    alt="Profile"
                    width={80}
                    height={80}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-blue-500 flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">
                      {getUserInitials()}
                    </span>
                  </div>
                )}
                
                <h2 className="mt-2 text-lg font-semibold text-center px-4">
                  {getUserDisplayName()}
                </h2>
                
                {user?.email && (
                  <p className="text-sm text-gray-500 mt-1">{user.email}</p>
                )}

                <button 
                  onClick={() => router.push('/profile')}
                  className="mt-2 text-gray-700 py-2 px-6 rounded hover:bg-gray-200 flex items-center gap-2"
                  title="Voir le profil"
                  aria-label="Voir le profil"
                >
                  <Image
                    alt="profile icon"
                    src="../Profile.svg"
                    width={14}
                    height={14}
                  />
                  Vue de profil
                </button>
              </div>

              {/* Séparateur */}
              <div className="flex justify-center my-3">
                <span className="block w-4/5 h-0.5 bg-gray-300"></span>
              </div>

              {/* Liens */}
              <div className="flex flex-col items-center">
                <button 
                  className="w-full text-gray-700 py-2 hover:bg-gray-100 rounded"
                  title="Voir mes commandes"
                  aria-label="Voir mes commandes"
                >
                  Mes commandes
                </button>
                <span className="block w-2/5 h-0.5 bg-gray-300 my-1"></span>
                <button 
                  className="w-full text-gray-700 py-2 hover:bg-gray-100 rounded"
                  title="Personnaliser mon compte"
                  aria-label="Personnaliser mon compte"
                >
                  Personnalisation
                </button>
              </div>

              {/* Déconnexion */}
              <div className="mt-4 text-center">
                <button 
                  onClick={handleLogout}
                  className="bg-red-600 text-white py-2 px-6 rounded hover:bg-red-700 transition-colors"
                  title="Se déconnecter du compte"
                  aria-label="Se déconnecter du compte"
                >
                  Se déconnecter
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
 