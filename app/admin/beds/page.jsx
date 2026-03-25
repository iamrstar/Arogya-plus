"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { AdminLayout } from "@/components/layouts/admin-layout"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { useSearchParams } from "next/navigation"
import { BedDouble, Loader2, UserPlus, UserMinus, ArrowRightLeft, Wrench, ChevronDown } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export default function BedManagement() {
    const searchParams = useSearchParams()
    const deptParam = searchParams.get('dept')

    const [beds, setBeds] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedDept, setSelectedDept] = useState("Cardiology")
    const [selectedBed, setSelectedBed] = useState(null)
    const [actionDialog, setActionDialog] = useState({ open: false, bed: null, type: null })
    const [transferStep, setTransferStep] = useState(null) // { patient, patientId, fromBed, toDept }
    const [newPatient, setNewPatient] = useState({ name: "", id: "" })
    const [actionLoading, setActionLoading] = useState(false)

    const departments = ["Cardiology", "Neurology", "Orthopedics", "General Medicine", "ICU", "Pediatrics"]

    useEffect(() => {
        fetchBeds()
        if (deptParam && departments.includes(deptParam)) {
            setSelectedDept(deptParam)
        }
    }, [deptParam])
    const deptColors = {
        Cardiology: { bg: "#fef2f2", border: "#fca5a5", accent: "#ef4444", text: "#991b1b" },
        Neurology: { bg: "#f5f3ff", border: "#c4b5fd", accent: "#8b5cf6", text: "#5b21b6" },
        Orthopedics: { bg: "#eff6ff", border: "#93c5fd", accent: "#3b82f6", text: "#1e40af" },
        "General Medicine": { bg: "#ecfdf5", border: "#6ee7b7", accent: "#10b981", text: "#065f46" },
        ICU: { bg: "#fffbeb", border: "#fcd34d", accent: "#f59e0b", text: "#92400e" },
        Pediatrics: { bg: "#fdf2f8", border: "#f9a8d4", accent: "#ec4899", text: "#9d174d" },
    }

    useEffect(() => { fetchBeds() }, [])

    const fetchBeds = async () => {
        try {
            const res = await fetch("/api/admin/beds")
            setBeds(await res.json())
        } catch (e) { console.error(e) }
        setLoading(false)
    }

    const handleBedClick = (bed) => {
        // If we are in transfer step, assign patient to this bed
        if (transferStep && bed.status === "Available") {
            handleTransferAssign(bed)
            return
        }

        setSelectedBed(bed)
        if (bed.status === "Available") {
            setActionDialog({ open: true, bed, type: "assign" })
        } else if (bed.status === "Occupied") {
            setActionDialog({ open: true, bed, type: "occupied" })
        }
    }

    const handleRelease = async () => {
        setActionLoading(true)
        try {
            await fetch("/api/admin/beds", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ bedId: actionDialog.bed._id, action: "release" })
            })
            toast.success(`🛏️ Bed ${actionDialog.bed.bedNumber} released — ${actionDialog.bed.patientName} discharged`)
            setActionDialog({ open: false, bed: null, type: null })
            fetchBeds()
        } catch (e) { toast.error("Failed to release bed") }
        setActionLoading(false)
    }

    const handleAssign = async () => {
        if (!newPatient.name.trim()) return toast.error("Please enter patient name")
        setActionLoading(true)
        try {
            await fetch("/api/admin/beds", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ bedId: actionDialog.bed._id, action: "assign", patientName: newPatient.name, patientId: newPatient.id || undefined })
            })
            toast.success(`✅ Bed ${actionDialog.bed.bedNumber} assigned to ${newPatient.name}`)
            setActionDialog({ open: false, bed: null, type: null })
            setNewPatient({ name: "", id: "" })
            fetchBeds()
        } catch (e) { toast.error("Failed to assign bed") }
        setActionLoading(false)
    }

    const startTransfer = () => {
        const bed = actionDialog.bed
        setTransferStep({ patient: bed.patientName, patientId: bed.patientId, fromBed: bed.bedNumber, fromDept: bed.department })
        setActionDialog({ open: false, bed: null, type: null })
        toast.info(`Select a department and click an available bed to transfer ${bed.patientName}`)
    }

    const handleTransferAssign = async (targetBed) => {
        setActionLoading(true)
        try {
            // Release old bed
            const oldBed = beds.find(b => b.bedNumber === transferStep.fromBed)
            if (oldBed) {
                await fetch("/api/admin/beds", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ bedId: oldBed._id, action: "release" })
                })
            }
            // Assign new bed
            await fetch("/api/admin/beds", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ bedId: targetBed._id, action: "assign", patientName: transferStep.patient, patientId: transferStep.patientId })
            })
            toast.success(`🔄 ${transferStep.patient} transferred from ${transferStep.fromBed} → ${targetBed.bedNumber} (${targetBed.department})`)
            setTransferStep(null)
            fetchBeds()
        } catch (e) { toast.error("Transfer failed") }
        setActionLoading(false)
    }

    const cancelTransfer = () => {
        setTransferStep(null)
        toast.info("Transfer cancelled")
    }

    const deptBeds = beds.filter(b => b.department === selectedDept)
    const allOccupied = beds.filter(b => b.status === "Occupied").length
    const allAvailable = beds.filter(b => b.status === "Available").length

    if (loading) return (
        <AdminLayout>
            <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Loading Bed Registry...</p>
            </div>
        </AdminLayout>
    )

    return (
        <AdminLayout>
            <div className="space-y-8 pb-16">
                {/* Header */}
                <div className="space-y-3">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Bed Allocation Console</h1>
                    <p className="text-slate-500 font-medium">Click any bed to manage. <span className="text-green-600 font-bold">{allAvailable} available</span> · <span className="text-red-600 font-bold">{allOccupied} occupied</span> · {beds.length} total</p>
                </div>

                {/* Transfer Banner */}
                {transferStep && (
                    <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-200 flex items-center justify-between animate-pulse">
                        <div className="flex items-center gap-3">
                            <ArrowRightLeft className="w-5 h-5 text-amber-600" />
                            <div>
                                <p className="font-bold text-amber-900">Transfer Mode Active</p>
                                <p className="text-xs text-amber-700">Moving <span className="font-bold">{transferStep.patient}</span> from <span className="font-bold">{transferStep.fromBed}</span> ({transferStep.fromDept}) → Select a new department and click an available bed</p>
                            </div>
                        </div>
                        <Button variant="outline" className="rounded-xl border-amber-300 text-amber-700" onClick={cancelTransfer}>Cancel</Button>
                    </div>
                )}

                {/* Legend */}
                <div className="flex flex-wrap items-center gap-6 p-4 rounded-2xl bg-white border border-slate-100">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Legend:</span>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-green-500 border-2 border-green-600" />
                        <span className="text-xs font-bold text-slate-600">Available</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-red-500 border-2 border-red-600" />
                        <span className="text-xs font-bold text-slate-600">Occupied</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-amber-400 border-2 border-amber-500" />
                        <span className="text-xs font-bold text-slate-600">Maintenance</span>
                    </div>
                    {transferStep && (
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-blue-500 border-2 border-blue-600 animate-pulse" />
                            <span className="text-xs font-bold text-blue-600">Select for Transfer</span>
                        </div>
                    )}
                </div>

                {/* Department Tabs — like BookMyShow show times */}
                <div className="flex flex-wrap gap-3">
                    {departments.map(dept => {
                        const dOcc = beds.filter(b => b.department === dept && b.status === "Occupied").length
                        const dTotal = beds.filter(b => b.department === dept).length
                        const isSelected = selectedDept === dept
                        const colors = deptColors[dept]
                        return (
                            <button
                                key={dept}
                                onClick={() => setSelectedDept(dept)}
                                className={cn(
                                    "px-5 py-3 rounded-xl font-bold text-sm transition-all border-2",
                                    isSelected
                                        ? "shadow-lg scale-105"
                                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                                )}
                                style={isSelected ? { backgroundColor: colors.accent, borderColor: colors.accent, color: "#fff" } : {}}
                            >
                                {dept}
                                <Badge className="ml-2 text-[10px] px-2 rounded-full" style={isSelected ? { backgroundColor: "rgba(255,255,255,0.3)", color: "#fff" } : { backgroundColor: colors.bg, color: colors.text }}>
                                    {dOcc}/{dTotal}
                                </Badge>
                            </button>
                        )
                    })}
                </div>

                {/* Cinema-Style Seat Grid */}
                <Card className="rounded-2xl border-slate-100 overflow-hidden">
                    <CardContent className="p-8">
                        {/* Department Header */}
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center px-5 py-2 rounded-full text-xs font-black uppercase tracking-[0.2em] mb-3" style={{ backgroundColor: deptColors[selectedDept].bg, color: deptColors[selectedDept].text }}>
                                {selectedDept} · Floor {departments.indexOf(selectedDept) + 1}
                            </div>
                            <div className="w-64 h-1 mx-auto rounded-full mt-4" style={{ backgroundColor: deptColors[selectedDept].accent, opacity: 0.3 }} />
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Nursing Station</p>
                        </div>

                        {/* Bed Grid — Cinema Style */}
                        <div className="flex flex-wrap justify-center gap-4 max-w-xl mx-auto">
                            {deptBeds.map((bed, idx) => {
                                const isOccupied = bed.status === "Occupied"
                                const isAvailable = bed.status === "Available"
                                const isMaintenance = bed.status === "Maintenance"
                                const isTransferTarget = transferStep && isAvailable

                                return (
                                    <button
                                        key={bed._id}
                                        onClick={() => handleBedClick(bed)}
                                        disabled={isMaintenance && !transferStep}
                                        className={cn(
                                            "relative w-24 h-24 rounded-2xl border-2 flex flex-col items-center justify-center gap-1 transition-all duration-200 cursor-pointer group",
                                            isOccupied && !transferStep && "bg-red-500 border-red-600 text-white hover:bg-red-600 hover:scale-105 shadow-lg shadow-red-500/20",
                                            isAvailable && !transferStep && "bg-green-500 border-green-600 text-white hover:bg-green-600 hover:scale-105 shadow-lg shadow-green-500/20",
                                            isTransferTarget && "bg-blue-500 border-blue-600 text-white hover:bg-blue-600 hover:scale-110 shadow-lg shadow-blue-500/30 animate-pulse",
                                            isMaintenance && "bg-amber-400 border-amber-500 text-white cursor-not-allowed opacity-60",
                                            isOccupied && transferStep && "bg-red-500/50 border-red-400 text-white cursor-not-allowed opacity-50",
                                        )}
                                    >
                                        <BedDouble className="w-6 h-6" />
                                        <span className="text-xs font-black">{bed.bedNumber}</span>
                                        {isOccupied && (
                                            <span className="text-[8px] font-bold truncate max-w-[80px] opacity-80">{bed.patientName?.split(' ')[0]}</span>
                                        )}
                                        {isMaintenance && (
                                            <Wrench className="w-3 h-3 absolute top-1 right-1 opacity-70" />
                                        )}
                                        {/* Hover tooltip */}
                                        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-slate-900 text-white text-[10px] rounded-lg font-bold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                            {isOccupied ? `${bed.patientName} · ${bed.admissionDate}` : isAvailable ? "Click to assign patient" : "Under maintenance"}
                                        </div>
                                    </button>
                                )
                            })}
                        </div>

                        {/* Department Stats */}
                        <div className="flex justify-center gap-8 mt-8 pt-6 border-t border-slate-100">
                            <div className="text-center">
                                <p className="text-2xl font-black" style={{ color: deptColors[selectedDept].accent }}>{deptBeds.filter(b => b.status === "Occupied").length}</p>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Occupied</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-black text-green-600">{deptBeds.filter(b => b.status === "Available").length}</p>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Available</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-black text-amber-500">{deptBeds.filter(b => b.status === "Maintenance").length}</p>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Maintenance</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* ── ASSIGN DIALOG (Available Bed Clicked) ── */}
            <Dialog open={actionDialog.open && actionDialog.type === "assign"} onOpenChange={(v) => !v && setActionDialog({ open: false, bed: null, type: null })}>
                <DialogContent className="rounded-2xl max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black flex items-center gap-2">
                            <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center text-white">
                                <UserPlus className="w-5 h-5" />
                            </div>
                            Book Bed {actionDialog.bed?.bedNumber}
                        </DialogTitle>
                        <DialogDescription>Assign a patient to this available bed in {actionDialog.bed?.department}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Patient ID</label>
                            <Input placeholder="e.g. PAT-2026-001" value={newPatient.id} onChange={e => setNewPatient(p => ({ ...p, id: e.target.value }))} className="rounded-xl h-12" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Patient Full Name *</label>
                            <Input placeholder="Enter patient full name" value={newPatient.name} onChange={e => setNewPatient(p => ({ ...p, name: e.target.value }))} className="rounded-xl h-12" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => { setActionDialog({ open: false, bed: null, type: null }); setNewPatient({ name: "", id: "" }) }} className="rounded-xl">Cancel</Button>
                        <Button onClick={handleAssign} className="rounded-xl bg-green-500 hover:bg-green-600" disabled={actionLoading}>
                            {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm Admission"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── OCCUPIED BED DIALOG (Occupied Bed Clicked) ── */}
            <Dialog open={actionDialog.open && actionDialog.type === "occupied"} onOpenChange={(v) => !v && setActionDialog({ open: false, bed: null, type: null })}>
                <DialogContent className="rounded-2xl max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black flex items-center gap-2">
                            <div className="w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center text-white">
                                <BedDouble className="w-5 h-5" />
                            </div>
                            Bed {actionDialog.bed?.bedNumber}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        {/* Patient Info */}
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 font-black text-sm">
                                    {actionDialog.bed?.patientName?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900">{actionDialog.bed?.patientName}</p>
                                    <p className="text-xs text-slate-500">ID: {actionDialog.bed?.patientId} · Since: {actionDialog.bed?.admissionDate}</p>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-3">
                            <button
                                className="w-full p-4 rounded-xl border-2 border-red-200 hover:border-red-400 hover:bg-red-50 transition-all text-left group flex items-center gap-4"
                                onClick={handleRelease}
                                disabled={actionLoading}
                            >
                                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center group-hover:bg-red-100 transition-colors">
                                    {actionLoading ? <Loader2 className="w-5 h-5 text-red-500 animate-spin" /> : <UserMinus className="w-5 h-5 text-red-500" />}
                                </div>
                                <div>
                                    <p className="font-bold text-red-800">Release Bed / Discharge</p>
                                    <p className="text-xs text-red-600/70">Patient will be discharged and bed will be freed</p>
                                </div>
                            </button>

                            <button
                                className="w-full p-4 rounded-xl border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 transition-all text-left group flex items-center gap-4"
                                onClick={startTransfer}
                            >
                                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                                    <ArrowRightLeft className="w-5 h-5 text-blue-500" />
                                </div>
                                <div>
                                    <p className="font-bold text-blue-800">Shift to Another Department</p>
                                    <p className="text-xs text-blue-600/70">Transfer patient to a different department's available bed</p>
                                </div>
                            </button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    )
}
