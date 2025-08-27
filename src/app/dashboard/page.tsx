"use client"

import { Leaf, LogOut, User, Settings, BarChart3, Package, Truck } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { redirect } from "next/navigation"

export default function DashboardPage() {
  // This would normally use the auth hook, but for SSR we'll handle it differently
  // In a real app, you'd want to check auth status here
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      {/* Header */}
      <header className="bg-white border-b border-green-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="green-gradient text-white flex size-10 items-center justify-center rounded-lg green-shadow">
                <Leaf className="size-6" />
              </div>
              <span className="text-2xl font-bold text-green-700">Arizon</span>
            </div>
            
            <div className="flex items-center gap-4">
              <button 
                className="text-gray-600 hover:text-gray-800 transition-colors"
                title="Paramètres"
                aria-label="Paramètres"
              >
                <Settings className="w-5 h-5" />
              </button>
              <button 
                className="text-gray-600 hover:text-gray-800 transition-colors"
                title="Profil utilisateur"
                aria-label="Profil utilisateur"
              >
                <User className="w-5 h-5" />
              </button>
              <button className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors">
                <LogOut className="w-5 h-5" />
                <span>Déconnexion</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Tableau de bord</h1>
          <p className="text-gray-600">Bienvenue sur votre espace personnel Arizon</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Produits actifs</p>
                <p className="text-2xl font-bold text-gray-900">24</p>
              </div>
              <div className="green-gradient p-3 rounded-lg">
                <Package className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Commandes en cours</p>
                <p className="text-2xl font-bold text-gray-900">8</p>
              </div>
              <div className="green-gradient p-3 rounded-lg">
                <Truck className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revenus du mois</p>
                <p className="text-2xl font-bold text-gray-900">€2,450</p>
              </div>
              <div className="green-gradient p-3 rounded-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Clients satisfaits</p>
                <p className="text-2xl font-bold text-gray-900">156</p>
              </div>
              <div className="green-gradient p-3 rounded-lg">
                <User className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-green-100">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Actions rapides</h2>
            <div className="space-y-3">
              <Link 
                href="/products/new" 
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-green-50 transition-colors text-gray-700 hover:text-green-700"
              >
                <div className="green-gradient p-2 rounded-lg">
                  <Package className="w-4 h-4 text-white" />
                </div>
                <span>Ajouter un nouveau produit</span>
              </Link>
              
              <Link 
                href="/orders" 
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-green-50 transition-colors text-gray-700 hover:text-green-700"
              >
                <div className="green-gradient p-2 rounded-lg">
                  <Truck className="w-4 h-4 text-white" />
                </div>
                <span>Gérer les commandes</span>
              </Link>
              
              <Link 
                href="/analytics" 
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-green-50 transition-colors text-gray-700 hover:text-green-700"
              >
                <div className="green-gradient p-2 rounded-lg">
                  <BarChart3 className="w-4 h-4 text-white" />
                </div>
                <span>Voir les analyses</span>
              </Link>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-green-100">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Activité récente</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-800">Nouvelle commande reçue</p>
                  <p className="text-xs text-gray-500">Il y a 2 heures</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-800">Produit mis à jour</p>
                  <p className="text-xs text-gray-500">Il y a 1 jour</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-800">Paiement reçu</p>
                  <p className="text-xs text-gray-500">Il y a 2 jours</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
