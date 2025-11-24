"use client";

import { instance } from "@/lib/axios";
import React, { createContext, useState, ReactNode, useEffect } from "react";
import Cookies from "js-cookie";
import { toast } from "sonner";

export interface ApiMediaFile {
  id: string;
  name: string;
  file_size: number;
  text_brute: string;
  resume: string;
  createdAt: string | number | Date;
}

interface User {
  id: string;
  name: string;
  email: string;
  Media: ApiMediaFile[];
}

interface AuthContextProps {
  user: User | null;
  isLoading: boolean;
  isEmailSent: boolean;
  email: string;
  LoginToMagicLink: (email: string) => Promise<void>;
  setIsEmailSent: (value: boolean) => void;
  fetchUser: () => Promise<void>;
}

export const contextApi = createContext<AuthContextProps>({} as AuthContextProps);

type IChildren = {
  children: ReactNode
}

export default function AuthProvider({ children }: IChildren) {
  const [isLoading, setIsLoading] = useState(false)
  const [isEmailSent, setIsEmailSent] = useState(false)
  const [email, setEmail] = useState("")
  const [user, setUser] = useState<User | null>(null);

  async function LoginToMagicLink(passedEmail: string) {
    setIsLoading(true)
    setEmail(passedEmail)
    try {
      await instance.post("/auth/magic-link", {
        email: passedEmail,
      })
      setIsEmailSent(true)
    } catch (err: unknown) {
      console.error("Login Magic Link error:", err)
      setIsEmailSent(false)
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("An unexpected error occurred during login.");
      }
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const fetchUser = async () => {
    const token = Cookies.get("@jwt");
    if (!token) {
      setUser(null);
      return;
    }

    try {
      const response = await instance.get("/user");
      setUser(response.data.user);
    } catch (error: unknown) {
      Cookies.remove("@jwt")
      console.error("Failed to fetch user:", error);
      setUser(null);
      if (error instanceof Error) {
        toast.error(`Failed to fetch user: ${error.message}`);
      } else {
        toast.error("Failed to fetch user data.");
      }
    }
  };

  useEffect(() => {
    fetchUser();
  }, []); 

  return (
    <contextApi.Provider value={{ isLoading, LoginToMagicLink, isEmailSent, setIsEmailSent, email, user, fetchUser }}>
      {children}
    </contextApi.Provider>
  )
}