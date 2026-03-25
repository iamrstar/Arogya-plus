"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { AdminLayout } from "@/components/layouts/admin-layout"
import { Users, Search, Filter, Clock, Loader2, Phone } from "lucide-react"
import { cn } from "@/lib/utils"

export default function StaffManagementAdmin() {
    const [staff, setStaff] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [filterShift, setFilterShift] = useState("All")

    useEffect(() => { fetchStaff() }, [])

    const fetchStaff = async () => {
        try {
            const res = await fetch("/api/admin/staff")
            setStaff(await res.json())
        } catch (e) { console.error(e) }
        setLoading(false)
    }

    const shifts = ["All", "Morning", "Evening", "Night"]

    const getStatusBadge = (status) => {
        if (status === "On Duty") return <Badge className="bg-green-50 text-green-600 border-none font-black text-[10px] uppercase tracking-widest px-3 py-1">On Duty</Badge>
        return <Badge className="bg-slate-100 text-slate-400 border-none font-black text-[10px] uppercase tracking-widest px-3 py-1">On Leave</Badge>
    }

    const getShiftBadge = (shift) => {
        const colors = { Morning: "bg-amber-50 text-amber-600", Evening: "bg-blue-50 text-blue-600", Night: "bg-indigo-50 text-indigo-600" }
        return <Badge className={cn("border-none font-bold text-[10px] uppercase tracking-widest px-3 py-1", colors[shift] || "bg-slate-50 text-slate-500")}>{shift}</Badge>
    }

    const filtered = staff.filter(s => {
        const matchSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.department.toLowerCase().includes(searchTerm.toLowerCase()) || s.role.toLowerCase().includes(searchTerm.toLowerCase())
        const matchShift = filterShift === "All" || s.shift === filterShift
        return matchSearch && matchShift
    })

    if (loading) return (
        <AdminLayout>
            <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Loading Staff Data...</p>
            </div>
        </AdminLayout>
    )

    return (
        <AdminLayout>
            <div className="space-y-8 pb-16">
                <div className="space-y-3">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Staff Management</h1>
                    <p className="text-slate-500 font-medium">{staff.length} personnel · {staff.filter(s => s.status === "On Duty").length} currently on duty</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: "Total Staff", val: staff.length, color: "text-blue-600" },
                        { label: "On Duty", val: staff.filter(s => s.status === "On Duty").length, color: "text-green-600" },
                        { label: "On Leave", val: staff.filter(s => s.status === "On Leave").length, color: "text-slate-400" },
                        { label: "Departments", val: [...new Set(staff.map(s => s.department))].length, color: "text-purple-600" },
                    ].map((s, i) => (
                        <Card key={i} className="rounded-2xl border-slate-100">
                            <CardContent className="p-6 text-center">
                                <h3 className={cn("text-3xl font-black", s.color)}>{s.val}</h3>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">{s.label}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input placeholder="Search staff by name, role, or department..." className="pl-12 rounded-xl h-12" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                    </div>
                    <div className="flex gap-2">
                        {shifts.map(s => (
                            <Button key={s} variant={filterShift === s ? "default" : "outline"} className="rounded-xl font-bold text-xs" onClick={() => setFilterShift(s)}>
                                {s}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Staff Table */}
                <Card className="rounded-2xl border-slate-100 overflow-hidden">
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                        <th className="px-6 py-5 text-left">Staff Details</th>
                                        <th className="px-6 py-5 text-left">Department</th>
                                        <th className="px-6 py-5 text-left">Shift</th>
                                        <th className="px-6 py-5 text-left">Status</th>
                                        <th className="px-6 py-5 text-left">Contact</th>
                                        <th className="px-6 py-5 text-left">Joined</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {filtered.map(person => (
                                        <tr key={person._id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-xs">
                                                        {person.name.split(' ').map(n => n[0]).join('')}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-sm text-slate-900">{person.name}</p>
                                                        <p className="text-[10px] text-slate-400 font-bold">{person.role} · {person._id}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5"><span className="font-medium text-sm text-slate-600">{person.department}</span></td>
                                            <td className="px-6 py-5">{getShiftBadge(person.shift)}</td>
                                            <td className="px-6 py-5">{getStatusBadge(person.status)}</td>
                                            <td className="px-6 py-5"><span className="text-xs text-slate-500 font-medium">{person.phone}</span></td>
                                            <td className="px-6 py-5"><span className="text-xs text-slate-400">{person.joinDate}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    )
}
