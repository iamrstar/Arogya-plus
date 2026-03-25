"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { AdminLayout } from "@/components/layouts/admin-layout"
import { Users, Search, Filter, Clock, Loader2, Phone, Plus, X, ShieldCheck, Key, Eye, EyeOff } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export default function StaffManagementAdmin() {
    const [staff, setStaff] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [filterShift, setFilterShift] = useState("All")
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [newStaff, setNewStaff] = useState({
        name: "",
        email: "",
        password: "",
        role: "Nurse",
        department: "Cardiology",
        shift: "Morning",
        phone: "",
        specialization: ""
    })
    const [viewingCredentials, setViewingCredentials] = useState(null)
    const [isCredModalOpen, setIsCredModalOpen] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    useEffect(() => { fetchStaff() }, [])

    const fetchStaff = async () => {
        try {
            const res = await fetch("/api/admin/staff")
            setStaff(await res.json())
        } catch (e) { console.error(e) }
        setLoading(false)
    }

    const handleAddStaff = async (e) => {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            const res = await fetch("/api/admin/staff", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newStaff)
            })
            if (res.ok) {
                toast.success("Staff member registered successfully")
                setIsAddModalOpen(false)
                setNewStaff({
                    name: "", email: "", password: "", role: "Nurse",
                    department: "Cardiology", shift: "Morning", phone: "", specialization: ""
                })
                fetchStaff()
            } else {
                const err = await res.json()
                toast.error(err.error || "Failed to add staff")
            }
        } catch (e) {
            toast.error("An error occurred")
        } finally {
            setIsSubmitting(false)
        }
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
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-3">
                        <h1 className="text-4xl font-black text-foreground tracking-tight">Staff Management</h1>
                        <p className="text-muted-foreground font-medium">{staff.length} personnel · {staff.filter(s => s.status === "On Duty").length} currently on duty</p>
                    </div>
                    <Button
                        onClick={() => setIsAddModalOpen(true)}
                        size="lg"
                        className="h-14 px-8 rounded-2xl bg-primary shadow-xl shadow-primary/20 font-black text-xs uppercase tracking-widest group text-primary-foreground"
                    >
                        <Plus className="w-5 h-5 mr-3 group-hover:rotate-90 transition-transform" />
                        Add New Personnel
                    </Button>
                </div>

                {/* Add Staff Modal */}
                <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                    <DialogContent className="max-w-2xl rounded-[3rem] p-0 border-none overflow-hidden shadow-2xl bg-card text-card-foreground">
                        <div className="bg-slate-900 p-10 text-white relative">
                            <ShieldCheck className="w-20 h-20 text-primary opacity-20 absolute -top-4 -right-4 rotate-12" />
                            <DialogHeader>
                                <DialogTitle className="text-3xl font-black tracking-tight text-white">Personnel Registration</DialogTitle>
                                <DialogDescription className="text-slate-400 font-medium mt-2">
                                    Register new clinical or administrative staff to the Arogya ecosystem.
                                </DialogDescription>
                            </DialogHeader>
                        </div>

                        <form onSubmit={handleAddStaff} className="p-10 space-y-6 max-h-[75vh] overflow-y-auto">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Full Identity Name</Label>
                                    <Input
                                        placeholder="e.g. Dr. Ankit Sharma"
                                        className="h-14 rounded-2xl bg-muted/30 border-border font-bold text-foreground"
                                        value={newStaff.name}
                                        onChange={e => setNewStaff({ ...newStaff, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Contact Number</Label>
                                    <Input
                                        placeholder="+91 98XXX XXX00"
                                        className="h-14 rounded-2xl bg-muted/30 border-border font-bold text-foreground"
                                        value={newStaff.phone}
                                        onChange={e => setNewStaff({ ...newStaff, phone: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email Address (Username)</Label>
                                    <Input
                                        type="email"
                                        placeholder="name@arogya.com"
                                        className="h-14 rounded-2xl bg-muted/30 border-border font-bold text-foreground"
                                        value={newStaff.email}
                                        onChange={e => setNewStaff({ ...newStaff, email: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Access Password</Label>
                                    <Input
                                        type="password"
                                        placeholder="••••••••"
                                        className="h-14 rounded-2xl bg-muted/30 border-border font-bold text-foreground"
                                        value={newStaff.password}
                                        onChange={e => setNewStaff({ ...newStaff, password: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Organization Role</Label>
                                    <Select value={newStaff.role} onValueChange={v => setNewStaff({ ...newStaff, role: v })}>
                                        <SelectTrigger className="h-14 rounded-2xl bg-muted/30 border-border font-bold text-foreground">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl bg-card border-border">
                                            {["Doctor", "Nurse", "Receptionist", "Lab Technician", "Pharmacist", "Ward Boy"].map(r => (
                                                <SelectItem key={r} value={r} className="text-foreground focus:bg-muted font-bold text-xs">{r}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Assigned Department</Label>
                                    <Select value={newStaff.department} onValueChange={v => setNewStaff({ ...newStaff, department: v })}>
                                        <SelectTrigger className="h-14 rounded-2xl bg-muted/30 border-border font-bold text-foreground">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl bg-card border-border">
                                            {["Cardiology", "Neurology", "Orthopedics", "General Medicine", "Pediatrics", "ICU", "Diagnostics", "Pharmacy", "Front Desk"].map(d => (
                                                <SelectItem key={d} value={d} className="text-foreground focus:bg-muted font-bold text-xs">{d}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Working Shift</Label>
                                    <Select value={newStaff.shift} onValueChange={v => setNewStaff({ ...newStaff, shift: v })}>
                                        <SelectTrigger className="h-14 rounded-2xl bg-muted/30 border-border font-bold text-foreground">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl bg-card border-border">
                                            {["Morning", "Evening", "Night"].map(s => (
                                                <SelectItem key={s} value={s} className="text-foreground focus:bg-muted font-bold text-xs">{s}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                {newStaff.role === "Doctor" && (
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Clinical Specialization</Label>
                                        <Input
                                            placeholder="e.g. Senior Cardiologist"
                                            className="h-14 rounded-2xl bg-muted/30 border-border font-bold text-foreground"
                                            value={newStaff.specialization}
                                            onChange={e => setNewStaff({ ...newStaff, specialization: e.target.value })}
                                            required
                                        />
                                    </div>
                                )}
                            </div>

                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full h-16 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-black text-lg shadow-xl shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-2 mt-4"
                            >
                                {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : "Authorize & Register Personnel"}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>

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
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input placeholder="Search staff by name, role, or department..." className="pl-12 rounded-xl h-12 bg-card border-border text-foreground" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
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
                <Card className="rounded-2xl border-border overflow-hidden bg-card">
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-muted/50 border-b border-border text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                                        <th className="px-6 py-5 text-left">Staff Details</th>
                                        <th className="px-6 py-5 text-left">Department</th>
                                        <th className="px-6 py-5 text-left">Shift</th>
                                        <th className="px-6 py-5 text-left">Status</th>
                                        <th className="px-6 py-5 text-left">Contact</th>
                                        <th className="px-6 py-5 text-left">Joined</th>
                                        <th className="px-6 py-5 text-center">Credentials</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {filtered.map(person => (
                                        <tr key={person._id} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-xs">
                                                        {person.name.split(' ').map(n => n[0]).join('')}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-sm text-foreground">{person.name}</p>
                                                        <p className="text-[10px] text-muted-foreground font-bold">{person.role} · {person._id}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5"><span className="font-medium text-sm text-muted-foreground">{person.department}</span></td>
                                            <td className="px-6 py-5">{getShiftBadge(person.shift)}</td>
                                            <td className="px-6 py-5">{getStatusBadge(person.status)}</td>
                                            <td className="px-6 py-5"><span className="text-xs text-muted-foreground font-medium">{person.phone}</span></td>
                                            <td className="px-6 py-5"><span className="text-xs text-muted-foreground opacity-60 uppercase font-black tracking-widest">{person.joinDate}</span></td>
                                            <td className="px-6 py-5 text-center">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-9 w-9 p-0 rounded-full hover:bg-primary/10 text-primary transition-colors"
                                                    onClick={() => {
                                                        setViewingCredentials(person)
                                                        setIsCredModalOpen(true)
                                                        setShowPassword(false)
                                                    }}
                                                >
                                                    <Key className="w-4 h-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Credential Reveal Modal */}
                <Dialog open={isCredModalOpen} onOpenChange={setIsCredModalOpen}>
                    <DialogContent className="max-w-md rounded-[2.5rem] p-0 border-none overflow-hidden shadow-2xl bg-card text-card-foreground">
                        <div className="bg-primary p-8 text-primary-foreground relative">
                            <Key className="w-16 h-16 text-white opacity-20 absolute -top-2 -right-2 rotate-12" />
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-black tracking-tight">Access Credentials</DialogTitle>
                                <DialogDescription className="text-primary-foreground/70 font-bold text-xs uppercase tracking-widest">
                                    Confidential Security Look-up
                                </DialogDescription>
                            </DialogHeader>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Personnel Name</Label>
                                    <p className="font-bold text-lg text-foreground">{viewingCredentials?.name}</p>
                                </div>
                                <div className="h-px bg-border" />
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">User ID (Email)</Label>
                                    <div className="flex items-center justify-between bg-muted/30 p-4 rounded-xl border border-border">
                                        <span className="font-bold text-sm text-foreground">{viewingCredentials?.email}</span>
                                        <Button
                                            variant="ghost" size="sm" className="h-8 text-[10px] font-black uppercase tracking-widest"
                                            onClick={() => {
                                                navigator.clipboard.writeText(viewingCredentials?.email)
                                                toast.success("Email copied")
                                            }}
                                        >Copy</Button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">System Password</Label>
                                    <div className="flex items-center justify-between bg-muted/30 p-4 rounded-xl border border-border">
                                        <span className="font-mono font-bold text-sm text-foreground">
                                            {showPassword ? viewingCredentials?.password : "••••••••••••"}
                                        </span>
                                        <Button
                                            variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                onClick={() => setIsCredModalOpen(false)}
                                className="w-full h-12 rounded-xl font-black text-[10px] uppercase tracking-widest"
                            >Close Vault</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </AdminLayout>
    )
}
