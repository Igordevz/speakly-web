"use client"

import { Button } from "@/components/ui/button"
import { LogOut, User } from "lucide-react"
import Cookies from "js-cookie"

export default function DashboardHeader() {

  function Logout(){
    Cookies.remove("@jwt")
    location.replace("/login");
  }

  return (
    <header className="border-b bg-card">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold">Audio Dashboard</h1>
        </div>

        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm">
            <User className="h-4 w-4 mr-2" />
            Perfil
          </Button>
          <Button variant="ghost" size="sm" onClick={Logout}>
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </div>
      </div>
    </header>
  )
}
