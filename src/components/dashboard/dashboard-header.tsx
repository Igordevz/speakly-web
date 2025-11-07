"use client"

import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import Cookies from "js-cookie"
import logo from "../../../public/speakly.png"
import Image from "next/image"
import { useContext } from "react"
import { contextApi } from "@/context/auth"

export default function DashboardHeader() {
  const { user } = useContext(contextApi);

  function Logout(){
    Cookies.remove("@jwt")
    location.replace("/login");
  }

  const getColorFromEmail = (email: string) => {
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-orange-500",
      "bg-indigo-500",
      "bg-teal-500",
      "bg-red-500",
    ];
    const hash = email.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const getInitial = (email: string) => {
    return email.charAt(0).toUpperCase();
  };

  return (
    <header className="border-b ">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center space-x-4">
          <Image src={logo} alt="d" className="w-10 rounded-sm"/>
        </div>

        <div className="flex items-center space-x-4 ">
          {user?.email && (
            <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-muted/50">
              <div
                className={`w-8 h-8 rounded-full ${getColorFromEmail(user.email)} flex items-center justify-center text-white font-semibold text-sm shadow-sm`}
              >
                {getInitial(user.email)}
              </div>
              <span className="text-sm font-medium text-foreground hidden sm:inline">
                {user.email}
              </span>
            </div>
          )}
          <Button variant="ghost" size="sm" onClick={Logout} className="cursor-pointer">
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </div>
      </div>
    </header>
  )
}
