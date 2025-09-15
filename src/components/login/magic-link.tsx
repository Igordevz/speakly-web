"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, ArrowLeft, CheckCircle } from "lucide-react"

interface MagicLinkLoginProps {
  className?: string
}

export default function MagicLinkLogin({ className }: MagicLinkLoginProps) {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isEmailSent, setIsEmailSent] = useState(false)
  const [error, setError] = useState("")

  const sendMagicLink = async (email: string) => {
    // Aqui você implementaria a lógica real para enviar o magic link
    console.log("Enviando magic link para:", email)

    // Simula delay da API
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Exemplo de integração com uma API:
    // const response = await fetch('/api/auth/magic-link', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ email })
    // })
    //
    // if (!response.ok) {
    //   throw new Error('Falha ao enviar magic link')
    // }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      setError("Por favor, insira seu email")
      return
    }

    if (!email.includes("@")) {
      setError("Por favor, insira um email válido")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      await sendMagicLink(email)
      setIsEmailSent(true)
    } catch (err) {
      setError("Erro ao enviar o link. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackToLogin = () => {
    setIsEmailSent(false)
    setEmail("")
    setError("")
  }

  if (isEmailSent) {
    return (
      <Card className={`w-full max-w-md mx-auto ${className}`}>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
            <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-2xl font-bold">Link enviado!</CardTitle>
          <CardDescription className="text-center">
            Enviamos um link mágico para <strong>{email}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-4 text-center">
            <Mail className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Verifique sua caixa de entrada e clique no link para fazer login. O link expira em 15 minutos.
            </p>
          </div>

          <div className="text-center text-sm text-muted-foreground py-2">
            Não recebeu o email? Verifique sua pasta de spam ou{" "}
            <button onClick={handleBackToLogin} className="text-primary hover:underline font-medium mt-2 cursor-pointer">
              tente novamente
            </button>
          </div>

          <Button variant="outline" onClick={handleBackToLogin} className="w-full bg-transparent cursor-pointer">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao login
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`w-full max-w-md mx-auto ${className}`}>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Entrar com Magic Link</CardTitle>
        <CardDescription>Digite seu email e enviaremos um link para fazer login</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className={error ? "border-destructive" : ""}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          <Button type="submit" className="w-full cursor-pointer" disabled={isLoading}>
            {isLoading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Enviando...
              </>
            ) : ( 
              <>
                <Mail className="mr-2 h-4 w-4" />
                Enviar Magic Link
              </>
            )}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          Ao continuar, você concorda com nossos{" "}
          <a href="#" className="text-primary hover:underline">
            Termos de Serviço
          </a>{" "}
          e{" "}
          <a href="#" className="text-primary hover:underline">
            Política de Privacidade
          </a>
        </div>
      </CardContent>
    </Card>
  )
}
