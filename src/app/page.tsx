import { Leaf, ArrowRight, Users, Package, Truck, BarChart3 } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-green-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="green-gradient text-white flex size-10 items-center justify-center rounded-lg green-shadow">
                <Leaf className="size-6" />
              </div>
              <span className="text-2xl font-bold text-green-700">Arizon</span>
            </div>
            
            <nav className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-gray-600 hover:text-green-700 transition-colors">
                Fonctionnalités
              </a>
              <a href="#about" className="text-gray-600 hover:text-green-700 transition-colors">
                À propos
              </a>
              <a href="#contact" className="text-gray-600 hover:text-green-700 transition-colors">
                Contact
              </a>
            </nav>
            
            <div className="flex items-center gap-4">
              <Link 
                href="/login"
                className="text-green-700 hover:text-green-800 font-medium transition-colors"
              >
                Connexion
              </Link>
              <Link 
                href="/signup"
                className="green-gradient text-white px-6 py-2 rounded-lg font-medium hover:opacity-90 transition-all duration-200 green-shadow"
              >
                Commencer
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6 leading-tight">
            La révolution agricole
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-green-800">
              {" "}numérique
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Connectez producteurs et consommateurs sur une plateforme intelligente qui transforme 
            l&apos;agriculture moderne. Gestion simplifiée, traçabilité complète, avenir durable.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/signup"
              className="green-gradient text-white px-8 py-4 rounded-lg text-lg font-semibold hover:opacity-90 transition-all duration-200 green-shadow inline-flex items-center gap-2"
            >
              Commencer gratuitement
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              href="/login"
              className="border-2 border-green-600 text-green-700 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-50 transition-all duration-200"
            >
              Se connecter
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Fonctionnalités principales
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Tout ce dont vous avez besoin pour gérer votre activité agricole en toute simplicité
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="green-gradient w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 green-shadow">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Gestion des utilisateurs</h3>
              <p className="text-gray-600">
                Gérez facilement vos clients, fournisseurs et équipes avec des rôles et permissions personnalisables.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="green-gradient w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 green-shadow">
                <Package className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Catalogue de produits</h3>
              <p className="text-gray-600">
                Créez et gérez votre catalogue de produits avec des images, descriptions et prix détaillés.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="green-gradient w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 green-shadow">
                <Truck className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Suivi des commandes</h3>
              <p className="text-gray-600">
                Suivez vos commandes en temps réel, de la réception à la livraison finale.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="green-gradient w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 green-shadow">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Analyses et rapports</h3>
              <p className="text-gray-600">
                Obtenez des insights précieux sur vos performances et prenez des décisions éclairées.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="green-gradient w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 green-shadow">
                <Leaf className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Agriculture durable</h3>
              <p className="text-gray-600">
                Contribuez à une agriculture plus durable avec nos outils de traçabilité et de certification.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="green-gradient w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 green-shadow">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Communauté active</h3>
              <p className="text-gray-600">
                Rejoignez une communauté d&apos;agriculteurs passionnés et partagez vos expériences.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-800 mb-6">
            Prêt à transformer votre agriculture ?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Rejoignez des milliers d&apos;agriculteurs qui ont déjà fait le choix de l&apos;innovation.
          </p>
          <Link 
            href="/signup"
            className="green-gradient text-white px-8 py-4 rounded-lg text-lg font-semibold hover:opacity-90 transition-all duration-200 green-shadow inline-flex items-center gap-2"
          >
            Créer mon compte gratuitement
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="green-gradient text-white flex size-8 items-center justify-center rounded-lg">
                  <Leaf className="size-5" />
                </div>
                <span className="text-xl font-bold">Arizon</span>
              </div>
              <p className="text-gray-300">
                La plateforme agricole intelligente qui connecte producteurs et consommateurs.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Produit</h3>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-white transition-colors">Fonctionnalités</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Tarifs</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Intégrations</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Centre d&apos;aide</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Légal</h3>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-white transition-colors">Confidentialité</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Conditions</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookies</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
            <p>© 2024 Arizon. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
