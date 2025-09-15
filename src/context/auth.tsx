"use client"

import { instance } from "@/lib/axios"
import React, { createContext, useState, ReactNode } from "react"

interface AuthContextProps {
  isLoading: boolean
  isEmailSent: boolean
  LoginToMagicLink: (email: string) => Promise<void>
  setIsEmailSent: (value: boolean) => void
  email: string
}

export const contextApi = createContext<AuthContextProps>({
  isLoading: false,
  isEmailSent: false,
  LoginToMagicLink: async () => {},
  setIsEmailSent: () => {},
  email: "",
})

type IChildren = {
  children: ReactNode
}

export default function AuthProvider({ children }: IChildren) {
  const [isLoading, setIsLoading] = useState(false)
  const [isEmailSent, setIsEmailSent] = useState(false)
  const [email, setEmail] = useState("")

  async function LoginToMagicLink(passedEmail: string) {
    setIsLoading(true)
    setEmail(passedEmail)
    try {
      await instance.post("/auth/magic-link", {
        email: passedEmail,
      })
      setIsEmailSent(true)
    } catch (err) {
      console.error("this operation error", err)
      setIsEmailSent(false)
      // Re-throw error to be caught by the form
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <contextApi.Provider value={{ isLoading, LoginToMagicLink, isEmailSent, setIsEmailSent, email }}>
      {children}
    </contextApi.Provider>
  )
}