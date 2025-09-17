"use client"

import { Button } from "@/components/ui/button"
import { LogOut, User } from "lucide-react"
import Cookies from "js-cookie"
import logo from "../../../public/speakly.png"
import Image from "next/image"
export default function DashboardHeader() {

  function Logout(){
    Cookies.remove("@jwt")
    location.replace("/login");
  }

  return (
    <header className="border-b ">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center space-x-4">
          <Image src={logo} alt="d" className="w-10 rounded-sm"/>
        </div>

        <div className="flex items-center space-x-4 ">
          <Button variant="ghost" size="sm" onClick={Logout} className="cursor-pointer">
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </div>
      </div>
    </header>
  )
}
