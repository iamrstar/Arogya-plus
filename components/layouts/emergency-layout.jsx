"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { ShieldAlert, Activity, LayoutDashboard, Truck, LogOut, Bell, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth/auth-provider"

export function EmergencyLayout({ children }) {
  const pathname = usePathname()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { user, logout, token } = useAuth()

  useEffect(() => {
    if (!token) {
      router.push("/")
    } else if (user?.userType !== "emergency") {
      router.push("/")
    }
  }, [token, user, router])

  if (!token || user?.userType !== "emergency") return null

  const navigation = [
    { name: "Live Dashboard", href: "/emergency/dashboard", icon: LayoutDashboard },
    { name: "Active Dispatches", href: "/emergency/dispatches", icon: Activity },
    { name: "Fleet Status", href: "/emergency/fleet", icon: Truck },
  ]

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans selection:bg-red-500/30">
      {/* Mobile Header */}
      <div className="md:hidden bg-slate-900 text-white p-4 flex items-center justify-between shadow-xl sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-600 rounded-xl shadow-lg shadow-red-500/20">
            <ShieldAlert className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-lg font-black tracking-tighter">Emergency</span>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Dispatch Center</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-white hover:bg-slate-800">
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-slate-100 flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:flex-shrink-0
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="p-8 hidden md:flex items-center gap-4">
          <div className="p-3 bg-red-600 rounded-2xl shadow-xl shadow-red-500/30 ring-4 ring-red-50">
            <ShieldAlert className="w-8 h-8 text-white" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900 tracking-tighter">Emergency</span>
            <p className="text-[10px] text-red-600 font-black uppercase tracking-widest">Dispatch Center</p>
          </div>
        </div>

        <div className="px-6 pb-6">
          <div className="bg-slate-900 rounded-[2rem] p-6 text-white shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 transition-transform group-hover:scale-110 duration-500">
              <ShieldAlert className="w-24 h-24" />
            </div>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">On Duty</p>
            <h3 className="font-black text-lg tracking-tight line-clamp-1">{user?.name}</h3>
            <p className="text-xs text-red-400 mt-1">{user?.role || "Dispatcher"}</p>
          </div>
        </div>

        <nav className="flex-1 px-6 space-y-2 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-bold transition-all duration-300 group
                  ${isActive 
                    ? "bg-red-50 text-red-600 shadow-sm" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"}
                `}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <item.icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? "scale-110" : "group-hover:scale-110"}`} />
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="p-6 mt-auto">
          <Button 
            variant="outline" 
            className="w-full justify-start gap-3 rounded-2xl h-14 border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-100 font-bold transition-all"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5" />
            Exit Console
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-20 bg-white/80 backdrop-blur-xl border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-30 hidden md:flex">
          <h2 className="text-xl font-black text-slate-900 tracking-tight capitalize">
            {pathname.split("/").pop().replace("-", " ")}
          </h2>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" className="rounded-2xl h-12 w-12 border-slate-200 text-slate-500 hover:text-slate-900 relative shadow-sm">
              <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping"></span>
              <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full"></span>
              <Bell className="w-5 h-5" />
            </Button>
            <div className="h-12 flex items-center gap-3 pl-4 border-l border-slate-200">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-red-600 font-black">
                {user?.name?.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 relative">
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.015] pointer-events-none mix-blend-overlay"></div>
          {children}
        </main>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  )
}
