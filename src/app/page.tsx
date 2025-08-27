import { Leaf, ArrowRight, Users, Package, Truck, BarChart3 } from "lucide-react"
import Link from "next/link"

export default function RootPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
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
    </div>
  )
}
