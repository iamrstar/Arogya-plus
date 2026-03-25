"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AdminLayout } from "@/components/layouts/admin-layout"
import { BedDouble, Users, Scissors, Pill, Activity, AlertTriangle, TrendingUp, Heart } from "lucide-react"
import { cn } from "@/lib/utils"

export default function AdminDashboard() {
    const [data, setData] = useState({ beds: [], admittedPatients: [], otSchedule: [], staff: [], medicines: [] })
    const [loading, setLoading] = useState(true)

    useEffect(() => { fetchAll() }, [])

    const fetchAll = async () => {
        try {
            const [bedsRes, admRes, otRes, staffRes, medRes] = await Promise.all([
                fetch("/api/admin/beds"), fetch("/api/admin/admitted"),
                fetch("/api/admin/ot-schedule"), fetch("/api/admin/staff"),
                fetch("/api/admin/medicines")
            ])
            const [beds, admitted, ot, staff, meds] = await Promise.all([
                bedsRes.json(), admRes.json(), otRes.json(), staffRes.json(), medRes.json()
            ])
            setData({ beds, admittedPatients: admitted, otSchedule: ot, staff, medicines: meds })
        } catch (e) { console.error(e) }
        setLoading(false)
    }

    const totalBeds = data.beds.length
    const occupied = data.beds.filter(b => b.status === "Occupied").length
    const available = data.beds.filter(b => b.status === "Available").length
    const critical = data.medicines.filter(m => m.status === "Critical" || m.status === "Out of Stock").length
    const onDuty = data.staff.filter(s => s.status === "On Duty").length
    const otToday = data.otSchedule.length
    const inProgress = data.otSchedule.filter(o => o.status === "In Progress").length

    const stats = [
        { label: "Total Beds", val: totalBeds, sub: `${occupied} occupied`, icon: <BedDouble className="w-6 h-6" />, color: "bg-blue-50 text-blue-600" },
        { label: "Available Beds", val: available, sub: `${Math.round(available / totalBeds * 100)}% capacity free`, icon: <Heart className="w-6 h-6" />, color: "bg-green-50 text-green-600" },
        { label: "Admitted Patients", val: data.admittedPatients.length, sub: `${data.admittedPatients.filter(p => p.status === "Critical").length} critical`, icon: <Users className="w-6 h-6" />, color: "bg-purple-50 text-purple-600" },
        { label: "OT Surgeries", val: otToday, sub: `${inProgress} in progress`, icon: <Scissors className="w-6 h-6" />, color: "bg-amber-50 text-amber-600" },
        { label: "Staff On Duty", val: onDuty, sub: `of ${data.staff.length} total`, icon: <Activity className="w-6 h-6" />, color: "bg-teal-50 text-teal-600" },
        { label: "Medicine Alerts", val: critical, sub: "need restocking", icon: <AlertTriangle className="w-6 h-6" />, color: "bg-red-50 text-red-600" },
    ]

    // Department-wise bed occupancy
    const depts = ["Cardiology", "Neurology", "Orthopedics", "General Medicine", "ICU", "Pediatrics"]
    const deptColors = { Cardiology: "#ef4444", Neurology: "#8b5cf6", Orthopedics: "#3b82f6", "General Medicine": "#10b981", ICU: "#f59e0b", Pediatrics: "#ec4899" }

    if (loading) return (
        <AdminLayout>
            <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Loading Hospital Data...</p>
            </div>
        </AdminLayout>
    )

    return (
        <AdminLayout>
            <div className="space-y-10 pb-16">
                <div className="space-y-3">
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-red-500/5 text-red-600 text-[10px] font-black uppercase tracking-[0.2em]">
                        Admin Console — Live
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Hospital Command Center</h1>
                    <p className="text-slate-500 font-medium">Real-time overview of all hospital operations for {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {stats.map((stat, i) => (
                        <Card key={i} className="bg-white border-slate-100 rounded-[2rem] shadow-sm hover:shadow-xl transition-all group">
                            <CardContent className="p-8">
                                <div className="flex items-center justify-between mb-6">
                                    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform", stat.color)}>
                                        {stat.icon}
                                    </div>
                                </div>
                                <h3 className="text-4xl font-black text-slate-900">{stat.val}</h3>
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mt-1">{stat.label}</p>
                                <p className="text-xs text-slate-400 mt-4 font-medium">{stat.sub}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Department Occupancy */}
                <Card className="bg-white border-slate-100 rounded-[2rem] shadow-sm">
                    <CardContent className="p-8">
                        <h2 className="text-2xl font-black text-slate-900 mb-8">Department-wise Bed Occupancy</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {depts.map(dept => {
                                const deptBeds = data.beds.filter(b => b.department === dept)
                                const deptOcc = deptBeds.filter(b => b.status === "Occupied").length
                                const deptTotal = deptBeds.length
                                const pct = deptTotal > 0 ? Math.round(deptOcc / deptTotal * 100) : 0
                                return (
                                    <Link key={dept} href={`/admin/beds?dept=${dept}`} className="block group/dept">
                                        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-primary/20 hover:bg-white hover:shadow-xl transition-all cursor-pointer">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="font-bold text-slate-900 group-hover/dept:text-primary transition-colors">{dept}</h3>
                                                <Badge className="text-white text-[10px] font-black" style={{ backgroundColor: deptColors[dept] }}>{pct}%</Badge>
                                            </div>
                                            <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden mb-3">
                                                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: deptColors[dept] }} />
                                            </div>
                                            <div className="flex justify-between text-xs text-slate-500 font-medium">
                                                <span>{deptOcc} Occupied</span>
                                                <span className="group-hover/dept:text-primary transition-colors">{deptTotal - deptOcc} Free →</span>
                                            </div>
                                        </div>
                                    </Link>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    )
}
