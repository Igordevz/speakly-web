import { instance } from "@/lib/axios";
import React, { createContext, useState, ReactNode, useEffect } from "react";
import Cookies from "js-cookie";

interface User {
  id: string;
  name: string;
  email: string;
  Audio: Record<string, unknown>[];
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
    } catch (err) {
      console.error("this operation error", err)
      setIsEmailSent(false)
   
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
      console.log(response.data.user)
      setUser(response.data.user);
    } catch (error) {
      console.error("Failed to fetch user:", error);
      setUser(null); 
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