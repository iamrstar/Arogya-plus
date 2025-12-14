"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Heart, Home, Calendar, Users, FileText, TestTube, Pill, Activity, Settings, Bell, Menu, LogOut, Phone, Bed, Car, Shield, ClipboardList } from 'lucide-react'
import { useAuth } from "@/components/auth/auth-provider"

export function StaffLayout({ children }) {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Role-based navigation
  const getNavigation = (role) => {
    const baseNav = [
      { name: "Dashboard", href: "/staff/dashboard", icon: Home },
      { name: "Tasks", href: "/staff/tasks", icon: ClipboardList },
      { name: "Schedule", href: "/staff/schedule", icon: Calendar },
      { name: "Settings", href: "/staff/settings", icon: Settings },
    ]

    switch (role?.toLowerCase()) {
      case "nurse":
        return [
          ...baseNav.slice(0, 3),
          { name: "Patients", href: "/staff/patients", icon: Users },
          { name: "Medications", href: "/staff/medications", icon: Pill },
          { name: "Vital Signs", href: "/staff/vitals", icon: Activity },
          ...baseNav.slice(3),
        ]

      case "receptionist":
        return [
          ...baseNav.slice(0, 3),
          { name: "Appointments", href: "/staff/appointments", icon: Calendar },
          { name: "Patients", href: "/staff/patients", icon: Users },
          { name: "Registration", href: "/staff/registration", icon: FileText },
          ...baseNav.slice(3),
        ]

      case "lab technician":
        return [
          ...baseNav.slice(0, 3),
          { name: "Lab Tests", href: "/staff/lab-tests", icon: TestTube },
          { name: "Reports", href: "/staff/reports", icon: FileText },
          { name: "Equipment", href: "/staff/equipment", icon: Settings },
          ...baseNav.slice(3),
        ]

      case "pharmacist":
        return [
          ...baseNav.slice(0, 3),
          { name: "Prescriptions", href: "/staff/prescriptions", icon: Pill },
          { name: "Inventory", href: "/staff/inventory", icon: FileText },
          { name: "Consultations", href: "/staff/consultations", icon: Users },
          ...baseNav.slice(3),
        ]

      case "ambulance driver":
        return [
          ...baseNav.slice(0, 3),
          { name: "Emergency Calls", href: "/staff/emergency", icon: Phone },
          { name: "Vehicle Status", href: "/staff/vehicle", icon: Car },
          { name: "Routes", href: "/staff/routes", icon: FileText },
          ...baseNav.slice(3),
        ]

      case "ward boy":
        return [
          ...baseNav.slice(0, 3),
          { name: "Room Management", href: "/staff/rooms", icon: Bed },
          { name: "Patient Transport", href: "/staff/transport", icon: Users },
          { name: "Maintenance", href: "/staff/maintenance", icon: Settings },
          ...baseNav.slice(3),
        ]

      case "security":
        return [
          ...baseNav.slice(0, 3),
          { name: "Security Rounds", href: "/staff/security", icon: Shield },
          { name: "Visitor Log", href: "/staff/visitors", icon: Users },
          { name: "Incidents", href: "/staff/incidents", icon: FileText },
          ...baseNav.slice(3),
        ]

      case "admin":
        return [
          ...baseNav.slice(0, 3),
          { name: "Staff Management", href: "/staff/management", icon: Users },
          { name: "Reports", href: "/staff/reports", icon: FileText },
          { name: "Analytics", href: "/staff/analytics", icon: Activity },
          ...baseNav.slice(3),
        ]

      default:
        return baseNav
    }
  }

  const navigation = getNavigation(user?.role)

  const isActive = (href) => pathname === href

  const getRoleIcon = (role) => {
    switch (role?.toLowerCase()) {
      case "nurse":
        return <Activity className="h-5 w-5 text-primary" />
      case "receptionist":
        return <Users className="h-5 w-5 text-primary" />
      case "lab technician":
        return <TestTube className="h-5 w-5 text-primary" />
      case "pharmacist":
        return <Pill className="h-5 w-5 text-primary" />
      case "ambulance driver":
        return <Car className="h-5 w-5 text-primary" />
      case "ward boy":
        return <Bed className="h-5 w-5 text-primary" />
      case "security":
        return <Shield className="h-5 w-5 text-primary" />
      case "admin":
        return <Settings className="h-5 w-5 text-primary" />
      default:
        return <Users className="h-5 w-5 text-primary" />
    }
  }

  const Sidebar = ({ mobile = false }) => (
    <div className={`flex flex-col h-full ${mobile ? "w-full" : "w-64"}`}>
      {/* Logo */}
      <div className="flex items-center space-x-3 p-6 border-b border-border">
        <div className="bg-primary rounded-full p-2">
          <Heart className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-primary">Arogya</h1>
          <p className="text-sm text-muted-foreground">Staff Portal</p>
        </div>
      </div>

      {/* Staff Info */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="bg-primary/10 rounded-full p-2">{getRoleIcon(user?.role)}</div>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{user?.name}</p>
            <p className="text-sm text-muted-foreground truncate">{user?.role}</p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.shift} Shift • ID: {user?.staffId}
            </p>
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
              <h1 className="text-xl font-semibold">Staff Portal</h1>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Bell className="h-5 w-5" />
              </Button>
              <div className="flex items-center space-x-2">
                <div className="bg-primary/10 rounded-full p-1">{getRoleIcon(user?.role)}</div>
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

export default StaffLayout
