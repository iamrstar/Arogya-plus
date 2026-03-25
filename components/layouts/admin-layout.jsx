"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Heart, LayoutDashboard, BedDouble, Users, Pill, Calendar, Scissors, UserCheck, Menu, LogOut, ShieldCheck } from 'lucide-react'

export function AdminLayout({ children }) {
    const pathname = usePathname()
    const [sidebarOpen, setSidebarOpen] = useState(false)

    const navigation = [
        { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
        { name: "Departments & Beds", href: "/admin/beds", icon: BedDouble },
        { name: "Admitted Patients", href: "/admin/admitted", icon: UserCheck },
        { name: "OT Schedule", href: "/admin/ot-schedule", icon: Scissors },
        { name: "Staff Management", href: "/admin/staff", icon: Users },
        { name: "Medicine Inventory", href: "/admin/medical", icon: Pill },
    ]

    const isActive = (href) => pathname === href

    const Sidebar = ({ mobile = false }) => (
        <div className={`flex flex-col h-full ${mobile ? "w-full" : "w-72"}`}>
            <div className="flex items-center space-x-3 p-6 border-b border-border">
                <div className="bg-primary rounded-full p-2">
                    <Heart className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-primary">Arogya</h1>
                    <p className="text-xs text-muted-foreground flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Admin Console</p>
                </div>
            </div>

            <div className="p-4 border-b border-border">
                <div className="flex items-center space-x-3">
                    <div className="bg-red-500/10 rounded-full p-2">
                        <ShieldCheck className="h-5 w-5 text-red-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">Hospital Admin</p>
                        <p className="text-xs text-muted-foreground truncate">Super Administrator</p>
                    </div>
                </div>
            </div>

            <nav className="flex-1 p-4 space-y-1">
                {navigation.map((item) => {
                    const Icon = item.icon
                    return (
                        <Link key={item.name} href={item.href}>
                            <Button
                                variant={isActive(item.href) ? "default" : "ghost"}
                                className="w-full justify-start h-11"
                                onClick={() => mobile && setSidebarOpen(false)}
                            >
                                <Icon className="h-4 w-4 mr-3" />
                                {item.name}
                            </Button>
                        </Link>
                    )
                })}
            </nav>

            <div className="p-4 border-t border-border">
                <Link href="/">
                    <Button variant="outline" className="w-full bg-transparent">
                        <LogOut className="h-4 w-4 mr-2" />
                        Exit Admin
                    </Button>
                </Link>
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-background">
            <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
                <div className="flex flex-col flex-grow bg-card border-r border-border">
                    <Sidebar />
                </div>
            </div>

            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetContent side="left" className="p-0 w-72">
                    <Sidebar mobile />
                </SheetContent>
            </Sheet>

            <div className="lg:pl-72">
                <header className="bg-card border-b border-border sticky top-0 z-40">
                    <div className="flex items-center justify-between px-4 py-3">
                        <div className="flex items-center space-x-4">
                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button variant="ghost" size="sm" className="lg:hidden">
                                        <Menu className="h-5 w-5" />
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="left" className="p-0 w-72">
                                    <Sidebar mobile />
                                </SheetContent>
                            </Sheet>
                            <h1 className="text-xl font-semibold">Hospital Administration</h1>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            System Online
                        </div>
                    </div>
                </header>
                <main className="p-6">{children}</main>
            </div>
        </div>
    )
}

export default AdminLayout
