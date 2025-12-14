"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Heart, Home, Calendar, FileText, Pill, CreditCard, User, Bell, Menu, LogOut, Phone, TestTube } from 'lucide-react'
import { useAuth } from "@/components/auth/auth-provider"

export function PatientLayout({ children }) {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navigation = [
    { name: "Dashboard", href: "/patient/dashboard", icon: Home },
    { name: "Appointments", href: "/patient/appointments", icon: Calendar },
    { name: "Lab Reports", href: "/patient/reports", icon: TestTube },
    { name: "Prescriptions", href: "/patient/prescriptions", icon: Pill },
    { name: "Medical Records", href: "/patient/records", icon: FileText },
    { name: "Payments", href: "/patient/payments", icon: CreditCard },
    { name: "Profile", href: "/patient/profile", icon: User },
  ]

  const isActive = (href) => pathname === href

  const Sidebar = ({ mobile = false }) => (
    <div className={`flex flex-col h-full ${mobile ? "w-full" : "w-64"}`}>
      {/* Logo */}
      <div className="flex items-center space-x-3 p-6 border-b border-border">
        <div className="bg-primary rounded-full p-2">
          <Heart className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-primary">Arogya</h1>
          <p className="text-sm text-muted-foreground">Patient Portal</p>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="bg-primary/10 rounded-full p-2">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{user?.name}</p>
            <p className="text-sm text-muted-foreground truncate">Patient ID: {user?.patientId}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon
          return (
            <Link key={item.name} href={item.href}>
              <Button
                variant={isActive(item.href) ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => mobile && setSidebarOpen(false)}
              >
                <Icon className="h-4 w-4 mr-3" />
                {item.name}
              </Button>
            </Link>
          )
        })}
      </nav>

      {/* Emergency Contact */}
      <div className="p-4 border-t border-border">
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-2">
            <Phone className="h-4 w-4 text-red-600" />
            <span className="text-sm font-medium text-red-800">Emergency</span>
          </div>
          <p className="text-sm text-red-700">Call: +91-9876543210</p>
        </div>
      </div>

      {/* Logout */}
      <div className="p-4 border-t border-border">
        <Button variant="outline" className="w-full bg-transparent" onClick={logout}>
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-card border-r border-border">
          <Sidebar />
        </div>
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <Sidebar mobile />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Header */}
        <header className="bg-card border-b border-border sticky top-0 z-40">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center space-x-4">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="lg:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-64">
                  <Sidebar mobile />
                </SheetContent>
              </Sheet>
              <h1 className="text-xl font-semibold">Patient Portal</h1>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Bell className="h-5 w-5" />
              </Button>
              <div className="flex items-center space-x-2">
                <div className="bg-primary/10 rounded-full p-1">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm font-medium hidden sm:inline">{user?.name}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}

export default PatientLayout
