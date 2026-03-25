"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { AdminLayout } from "@/components/layouts/admin-layout"
import { Scissors, Clock, CheckCircle2, Play, Loader2, Plus, BedDouble, User, Stethoscope } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export default function OTSchedule() {
    const [schedule, setSchedule] = useState([])
    const [beds, setBeds] = useState([])
    const [loading, setLoading] = useState(true)
    const [showScheduleDialog, setShowScheduleDialog] = useState(false)
    const [selectedDept, setSelectedDept] = useState("")
    const [selectedBed, setSelectedBed] = useState("")
    const [formData, setFormData] = useState({ procedure: "", otRoom: "OT-1", time: "", surgeon: "", cost: 50000 })
    const [submitting, setSubmitting] = useState(false)

    const departments = ["Cardiology", "Neurology", "Orthopedics", "General Medicine", "ICU", "Pediatrics"]
    const doctors = [
        { name: "Dr. Rajesh Kumar", dept: "Cardiology" },
        { name: "Dr. Priya Sharma", dept: "Neurology" },
        { name: "Dr. Amit Patel", dept: "Orthopedics" },
        { name: "Dr. Sneha Reddy", dept: "General Medicine" },
        { name: "Dr. Vikram Singh", dept: "ICU" },
        { name: "Dr. Ananya Das", dept: "Pediatrics" },
    ]
    const otRooms = ["OT-1", "OT-2", "OT-3"]
    const timeSlots = [
        "08:00 AM — 10:00 AM", "10:00 AM — 12:00 PM", "12:00 PM — 02:00 PM",
        "02:00 PM — 04:00 PM", "04:00 PM — 06:00 PM", "06:00 PM — 08:00 PM"
    ]

    useEffect(() => { fetchAll() }, [])

    const fetchAll = async () => {
        try {
            const [otRes, bedRes] = await Promise.all([
                fetch("/api/admin/ot-schedule"),
                fetch("/api/admin/beds")
            ])
            setSchedule(await otRes.json())
            setBeds(await bedRes.json())
        } catch (e) { console.error(e) }
        setLoading(false)
    }

    const updateStatus = async (otId, newStatus) => {
        try {
            await fetch("/api/admin/ot-schedule", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ otId, status: newStatus })
            })
            toast.success(`OT status updated to ${newStatus}`)
            fetchAll()
        } catch (e) { toast.error("Failed to update") }
    }

    const handleScheduleOT = async () => {
        const bed = beds.find(b => b._id === selectedBed)
        if (!bed || !formData.procedure || !formData.surgeon || !formData.time) {
            return toast.error("Please fill all fields")
        }

        setSubmitting(true)
        try {
            const res = await fetch("/api/admin/ot-schedule", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    patient: bed.patientName,
                    patientId: bed.patientId,
                    surgeon: formData.surgeon,
                    procedure: formData.procedure,
                    otRoom: formData.otRoom,
                    time: formData.time,
                    department: bed.department,
                    bedNumber: bed.bedNumber,
                    cost: formData.cost
                })
            })
            if (res.ok) {
                toast.success(`🏥 OT scheduled for ${bed.patientName} — ${formData.procedure}`)
                setShowScheduleDialog(false)
                setSelectedDept("")
                setSelectedBed("")
                setFormData({ procedure: "", otRoom: "OT-1", time: "", surgeon: "" })
                fetchAll()
            }
        } catch (e) { toast.error("Failed to schedule") }
        setSubmitting(false)
    }

    // Filter occupied beds by selected department
    const deptBeds = beds.filter(b => b.department === selectedDept && b.status === "Occupied")

    const getStatusIcon = (status) => {
        if (status === "Completed") return <CheckCircle2 className="w-5 h-5 text-green-500" />
        if (status === "In Progress") return <Play className="w-5 h-5 text-amber-500" />
        return <Clock className="w-5 h-5 text-blue-500" />
    }

    const getStatusBadge = (status) => {
        const styles = {
            "Completed": "bg-green-50 text-green-600",
            "In Progress": "bg-amber-50 text-amber-600",
            "Scheduled": "bg-blue-50 text-blue-600"
        }
        return <Badge className={cn("border-none font-black text-[10px] uppercase tracking-widest px-3 py-1", styles[status] || "bg-slate-50 text-slate-500")}>{status}</Badge>
    }

    if (loading) return (
        <AdminLayout>
            <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Loading OT Schedule...</p>
            </div>
        </AdminLayout>
    )

    return (
        <AdminLayout>
            <div className="space-y-8 pb-16">
                <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
                    <div className="space-y-3">
                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-amber-500/5 text-amber-600 text-[10px] font-black uppercase tracking-[0.2em]">
                            <Scissors className="w-3 h-3 mr-2" /> Operation Theatre
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Today's OT Schedule</h1>
                        <p className="text-slate-500 font-medium">{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} · {schedule.length} surgeries</p>
                    </div>
                    <Button
                        onClick={() => setShowScheduleDialog(true)}
                        className="h-14 px-8 rounded-2xl bg-primary shadow-xl shadow-primary/20 font-black text-xs uppercase tracking-widest"
                    >
                        <Plus className="w-5 h-5 mr-3" />
                        Schedule OT
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-6">
                    {[
                        { label: "Completed", val: schedule.filter(s => s.status === "Completed").length, color: "text-green-600" },
                        { label: "In Progress", val: schedule.filter(s => s.status === "In Progress").length, color: "text-amber-600" },
                        { label: "Scheduled", val: schedule.filter(s => s.status === "Scheduled").length, color: "text-blue-600" },
                    ].map((s, i) => (
                        <Card key={i} className="rounded-2xl border-slate-100">
                            <CardContent className="p-6 text-center">
                                <h3 className="text-4xl font-black text-slate-900">{s.val}</h3>
                                <p className={cn("text-xs font-black uppercase tracking-widest mt-1", s.color)}>{s.label}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Schedule List */}
                <div className="space-y-4">
                    {schedule.map((ot) => (
                        <Card key={ot._id} className={cn(
                            "rounded-2xl border-l-4 hover:shadow-lg transition-all",
                            ot.status === "Completed" ? "border-l-green-500" :
                                ot.status === "In Progress" ? "border-l-amber-500" : "border-l-blue-500"
                        )}>
                            <CardContent className="p-6">
                                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center",
                                            ot.status === "Completed" ? "bg-green-50" : ot.status === "In Progress" ? "bg-amber-50" : "bg-blue-50"
                                        )}>
                                            {getStatusIcon(ot.status)}
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="text-lg font-black text-slate-900">{ot.procedure}</h3>
                                            <p className="text-xs text-slate-500 font-medium">
                                                Patient: <span className="font-bold text-slate-700">{ot.patient}</span> ·
                                                Surgeon: <span className="font-bold text-slate-700">{ot.surgeon}</span>
                                                {ot.bedNumber && <> · Bed: <span className="font-bold text-slate-700">{ot.bedNumber}</span></>}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-slate-900">{ot.otRoom}</p>
                                            <p className="text-xs text-slate-400">{ot.time}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">{ot.department}</p>
                                            {getStatusBadge(ot.status)}
                                            {ot.cost > 0 && <p className="text-[10px] font-black text-slate-900 mt-2 tracking-tighter">₹{ot.cost.toLocaleString()}</p>}
                                        </div>
                                        <div className="flex gap-2">
                                            {ot.status === "Scheduled" && (
                                                <Button size="sm" className="rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs"
                                                    onClick={() => updateStatus(ot._id, "In Progress")}>
                                                    Start
                                                </Button>
                                            )}
                                            {ot.status === "In Progress" && (
                                                <Button size="sm" className="rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold text-xs"
                                                    onClick={() => updateStatus(ot._id, "Completed")}>
                                                    Complete
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* ── SCHEDULE OT DIALOG ── */}
            <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
                <DialogContent className="rounded-2xl max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black flex items-center gap-2">
                            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white">
                                <Scissors className="w-5 h-5" />
                            </div>
                            Schedule New OT
                        </DialogTitle>
                        <DialogDescription>Select department, patient bed, procedure, and assign surgeon</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-5 py-4">
                        {/* Step 1: Department */}
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">
                                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-white text-[10px] font-black mr-2">1</span>
                                Select Department
                            </label>
                            <Select value={selectedDept} onValueChange={(v) => { setSelectedDept(v); setSelectedBed("") }}>
                                <SelectTrigger className="rounded-xl h-12">
                                    <SelectValue placeholder="Choose department" />
                                </SelectTrigger>
                                <SelectContent>
                                    {departments.map(d => (
                                        <SelectItem key={d} value={d}>
                                            <span className="flex items-center gap-2">
                                                <BedDouble className="w-3 h-3" /> {d}
                                                <span className="text-[10px] text-slate-400 ml-1">
                                                    ({beds.filter(b => b.department === d && b.status === "Occupied").length} patients)
                                                </span>
                                            </span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Step 2: Bed / Patient */}
                        {selectedDept && (
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">
                                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-white text-[10px] font-black mr-2">2</span>
                                    Select Patient (Bed)
                                </label>
                                {deptBeds.length === 0 ? (
                                    <p className="text-sm text-slate-400 p-4 bg-slate-50 rounded-xl text-center">No admitted patients in {selectedDept}</p>
                                ) : (
                                    <div className="grid grid-cols-1 gap-2">
                                        {deptBeds.map(bed => (
                                            <button
                                                key={bed._id}
                                                onClick={() => setSelectedBed(bed._id)}
                                                className={cn(
                                                    "p-3 rounded-xl border-2 text-left transition-all flex items-center gap-3",
                                                    selectedBed === bed._id
                                                        ? "border-primary bg-primary/5"
                                                        : "border-slate-200 hover:border-slate-300"
                                                )}
                                            >
                                                <div className={cn(
                                                    "w-10 h-10 rounded-lg flex items-center justify-center font-black text-xs",
                                                    selectedBed === bed._id ? "bg-primary text-white" : "bg-red-50 text-red-500"
                                                )}>
                                                    <BedDouble className="w-4 h-4" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-bold text-sm text-slate-900">{bed.patientName}</p>
                                                    <p className="text-[10px] text-slate-400">Bed {bed.bedNumber} · Since {bed.admissionDate}</p>
                                                </div>
                                                {selectedBed === bed._id && <CheckCircle2 className="w-5 h-5 text-primary" />}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Step 3: Procedure */}
                        {selectedBed && (
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">
                                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-white text-[10px] font-black mr-2">3</span>
                                    Procedure Name
                                </label>
                                <Input
                                    placeholder="e.g. Appendectomy, Knee Replacement..."
                                    value={formData.procedure}
                                    onChange={e => setFormData(p => ({ ...p, procedure: e.target.value }))}
                                    className="rounded-xl h-12"
                                />
                            </div>
                        )}

                        {/* Step 4: Assign Doctor */}
                        {selectedBed && formData.procedure && (
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">
                                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-white text-[10px] font-black mr-2">4</span>
                                    Assign Surgeon
                                </label>
                                <Select value={formData.surgeon} onValueChange={v => setFormData(p => ({ ...p, surgeon: v }))}>
                                    <SelectTrigger className="rounded-xl h-12">
                                        <SelectValue placeholder="Select surgeon" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {doctors.map(d => (
                                            <SelectItem key={d.name} value={d.name}>
                                                <span className="flex items-center gap-2">
                                                    <Stethoscope className="w-3 h-3" /> {d.name}
                                                    <span className="text-[10px] text-slate-400 ml-1">({d.dept})</span>
                                                </span>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* Step 5: OT Room & Time */}
                        {selectedBed && formData.surgeon && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">OT Room</label>
                                    <Select value={formData.otRoom} onValueChange={v => setFormData(p => ({ ...p, otRoom: v }))}>
                                        <SelectTrigger className="rounded-xl h-12">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {otRooms.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Time Slot</label>
                                    <Select value={formData.time} onValueChange={v => setFormData(p => ({ ...p, time: v }))}>
                                        <SelectTrigger className="rounded-xl h-12">
                                            <SelectValue placeholder="Select time" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {timeSlots.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        )}

                        {/* Step 6: Cost */}
                        {selectedBed && formData.time && (
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">
                                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-white text-[10px] font-black mr-2">6</span>
                                    Procedure Cost (INR)
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400">₹</span>
                                    <Input
                                        type="number"
                                        value={formData.cost}
                                        onChange={e => setFormData(p => ({ ...p, cost: parseInt(e.target.value) }))}
                                        className="rounded-xl h-12 pl-10 font-bold"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowScheduleDialog(false)} className="rounded-xl">Cancel</Button>
                        <Button
                            onClick={handleScheduleOT}
                            className="rounded-xl bg-primary"
                            disabled={submitting || !selectedBed || !formData.procedure || !formData.surgeon || !formData.time}
                        >
                            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Schedule Surgery"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    )
}
