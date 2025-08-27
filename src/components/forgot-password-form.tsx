import type React from "react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { Loader2, Mail, AlertCircle, CheckCircle } from "lucide-react"

export function ForgotPasswordForm({ className, ...props }: React.ComponentProps<"form">) {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [validationError, setValidationError] = useState('')
  
  const { requestPasswordReset, error, clearError } = useAuth()

  const validateEmail = (email: string) => {
    if (!email.trim()) {
      return 'L\'email est requis'
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return 'Format d\'email invalide'
    }
    return ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    
    const emailError = validateEmail(email)
    if (emailError) {
      setValidationError(emailError)
      return
    }
    
    setIsSubmitting(true)
    setValidationError('')
    
    try {
      const success = await requestPasswordReset(email)
      if (success) {
        setIsSubmitted(true)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEmailChange = (value: string) => {
    setEmail(value)
    if (validationError) {
      setValidationError('')
    }
  }

  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="green-gradient w-16 h-16 rounded-full flex items-center justify-center green-shadow">
          <CheckCircle className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800">Email envoyé !</h1>
        <p className="text-gray-600 text-sm max-w-sm">
          Nous avons envoyé un lien de réinitialisation à <strong>{email}</strong>. 
          Vérifiez votre boîte de réception et suivez les instructions.
        </p>
        <div className="flex flex-col gap-2 w-full">
          <Button 
            onClick={() => setIsSubmitted(false)}
            className="w-full green-gradient text-white font-semibold py-3 rounded-lg hover:opacity-90 transition-all duration-200 green-shadow"
          >
            Envoyer un autre email
          </Button>
          <Link 
            href="/login"
            className="text-green-600 hover:text-green-700 font-medium text-sm underline underline-offset-4"
          >
            Retour à la connexion
          </Link>
        </div>
      </div>
    )
  }

  return (
    <form className={cn("flex flex-col gap-6", className)} onSubmit={handleSubmit} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="green-gradient w-16 h-16 rounded-full flex items-center justify-center mb-4 green-shadow">
          <Mail className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800">Mot de passe oublié</h1>
        <p className="text-gray-600 text-sm text-balance max-w-sm">
          Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe
        </p>
      </div>

      {(error || validationError) && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <span className="text-red-700 text-sm">
            {validationError || error?.message}
          </span>
        </div>
      )}

      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="email" className="text-gray-700 font-medium">
            Adresse email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="jean.dupont@exemple.com"
            value={email}
            onChange={(e) => handleEmailChange(e.target.value)}
            className={cn(
              "border-gray-200 focus:border-green-500 focus:ring-green-500",
              (validationError || error) && "border-red-300 focus:border-red-500 focus:ring-red-500"
            )}
            required
          />
        </div>

        <Button 
          type="submit" 
          className="w-full green-gradient text-white font-semibold py-3 rounded-lg hover:opacity-90 transition-all duration-200 green-shadow"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Envoi en cours...
            </>
          ) : (
            'Envoyer le lien de réinitialisation'
          )}
        </Button>
      </div>

      <div className="text-center text-sm text-gray-600">
        Vous vous souvenez de votre mot de passe ?{" "}
        <Link href="/login" className="text-green-600 hover:text-green-700 font-medium underline underline-offset-4">
          Retour à la connexion
        </Link>
      </div>
    </form>
  )
}
