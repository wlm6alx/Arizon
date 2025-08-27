"use client"

import { Leaf } from "lucide-react"
import Link from "next/link"
import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="bg-muted relative hidden lg:block overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-600/20 to-green-800/20 z-10" />
        <img
          src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2032&q=80"
          alt="Ferme moderne avec technologie agricole"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute bottom-8 left-8 right-8 z-20 text-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full">
              <Leaf className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Arizon</h2>
              <p className="text-white/80 text-sm">Plateforme Agricole Intelligente</p>
            </div>
          </div>
          <p className="text-white/90 text-lg leading-relaxed">
            Accédez à votre espace personnel et gérez vos activités agricoles en toute simplicité.
          </p>
        </div>
      </div>
      
      <div className="flex flex-col gap-4 p-6 md:p-10 bg-gradient-to-br from-green-50 to-white">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link href="/" className="flex items-center gap-2 font-medium text-green-700 hover:text-green-800 transition-colors">
            <div className="green-gradient text-white flex size-8 items-center justify-center rounded-lg green-shadow">
              <Leaf className="size-5" />
            </div>
            <span className="text-xl font-bold">Arizon</span>
          </Link>
        </div>
        
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-md">
            <LoginForm />
          </div>
        </div>
        
        <div className="text-center text-xs text-gray-500 mt-8">
          <p>© 2024 Arizon. Tous droits réservés.</p>
          <p className="mt-1">
            En vous connectant, vous acceptez nos{' '}
            <a href="/terms" className="text-green-600 hover:text-green-700 underline">
              conditions d&apos;utilisation
            </a>{' '}
            et notre{' '}
            <a href="/privacy" className="text-green-600 hover:text-green-700 underline">
              politique de confidentialité
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
