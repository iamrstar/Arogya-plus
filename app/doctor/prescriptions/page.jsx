"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/components/auth/auth-provider"
import { DoctorLayout } from "@/components/layouts/doctor-layout"
import {
    FileText,
    Search,
    Calendar,
    User,
    Activity,
    Download,
    Clipboard,
    ChevronRight,
    Loader2,
    Filter,
    Edit3,
    Droplets
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { toast } from "sonner"

export default function PrescriptionArchive() {
    const { token } = useAuth()
    const [prescriptions, setPrescriptions] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")

    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [selectedPrescription, setSelectedPrescription] = useState(null)
    const [editMedicines, setEditMedicines] = useState([])
    const [editLoading, setEditLoading] = useState(false)

    const fetchPrescriptions = async () => {
            try {
                const response = await fetch("/api/doctor/prescriptions", {
                    headers: { "Authorization": `Bearer ${token}` }
                })
                const data = await response.json()
                if (response.ok) {
                    setPrescriptions(data)
                }
            } catch (error) {
                console.error("Archive fetch error:", error)
            } finally {
                setLoading(false)
            }
        }

    useEffect(() => {
        if (token) fetchPrescriptions()
    }, [token])

    const handleEditClick = (prescription) => {
        setSelectedPrescription(prescription)
        setEditMedicines(prescription.medicines.map(m => ({ ...m })))
        setIsEditModalOpen(true)
    }

    const handleSaveEdit = async () => {
        if (!selectedPrescription) return
        setEditLoading(true)
        try {
            const response = await fetch("/api/doctor/prescriptions/edit", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    sessionId: selectedPrescription.sessionId,
                    medicines: editMedicines
                })
            })
            const data = await response.json()
            if (response.ok) {
                toast.success("Prescription updated successfully")
                setIsEditModalOpen(false)
                fetchPrescriptions()
            } else {
                toast.error(data.error || "Failed to update prescription")
            }
        } catch (error) {
            toast.error("Network error")
        } finally {
            setEditLoading(false)
        }
    }

    const handleAddBloodRequest = () => {
        setEditMedicines([...editMedicines, { 
            name: "Blood Transfusion", 
            dosage: "1 Unit O+", 
            frequency: "Immediate", 
            duration: "1 Day" 
        }])
    }

    const filtered = prescriptions.filter(p =>
        p.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <DoctorLayout>
            <div className="max-w-7xl mx-auto space-y-10 py-10 px-6">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-primary/10 rounded-2xl text-primary shadow-sm border border-primary/20">
                                <FileText className="w-8 h-8" />
                            </div>
                            <Badge variant="outline" className="text-[10px] font-black tracking-widest uppercase text-slate-400 border-slate-200">
                                Clinical Registry
                            </Badge>
                        </div>
                        <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-2">Prescription Archive</h1>
                        <p className="text-slate-500 font-medium max-w-lg">Access and download legal-grade digital prescriptions for all historical consultations.</p>
                    </div>

                    <div className="relative group max-w-md w-full">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-primary transition-colors" />
                        <Input
                            placeholder="Search by Patient or Diagnosis..."
                            className="h-16 pl-14 pr-6 rounded-[2rem] bg-white border-slate-100 shadow-xl shadow-slate-200/50 
                                     focus-visible:ring-primary focus-visible:border-primary text-sm font-bold"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Main Archive Grid */}
                {loading ? (
                    <div className="py-40 flex flex-col items-center justify-center space-y-4">
                        <Loader2 className="w-12 h-12 text-primary animate-spin" />
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Synchronizing Clinical Vault...</p>
                    </div>
                ) : filtered.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                        {filtered.map((prescription) => (
                            <Card key={prescription.sessionId} className="group border-none shadow-sm hover:shadow-2xl transition-all duration-500 rounded-[2.5rem] overflow-hidden bg-white">
                                <CardContent className="p-0">
                                    <div className="flex flex-col md:flex-row md:items-center">
                                        {/* Date Indicator */}
                                        <div className="bg-slate-900 md:w-48 p-8 text-white flex flex-col items-center justify-center text-center">
                                            <Calendar className="w-6 h-6 text-primary mb-2 opacity-50" />
                                            <p className="text-2xl font-black tracking-tighter">
                                                {new Date(prescription.date).getDate()}
                                            </p>
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                                {new Date(prescription.date).toLocaleString('default', { month: 'short' })} {new Date(prescription.date).getFullYear()}
                                            </p>
                                        </div>

                                        {/* Clinical Info */}
                                        <div className="flex-1 p-8 md:px-12 grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-primary">
                                                    <User className="w-4 h-4" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Patient Name</span>
                                                </div>
                                                <h3 className="text-xl font-black text-slate-900 tracking-tight">{prescription.patientName}</h3>
                                            </div>

                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-slate-400">
                                                    <Activity className="w-4 h-4" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">Clinical Diagnosis</span>
                                                </div>
                                                <p className="text-sm font-bold text-slate-600 truncate max-w-[200px]">
                                                    {prescription.diagnosis || "General Consultation"}
                                                </p>
                                            </div>

                                            <div className="flex justify-end items-center gap-4">
                                                <div className="hidden lg:block text-right pr-6 border-r border-slate-100">
                                                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Items</p>
                                                    <p className="text-xs font-black text-slate-500">{prescription.medicines.length} Medicines</p>
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    <Button
                                                        onClick={() => handleEditClick(prescription)}
                                                        variant="outline"
                                                        className="rounded-2xl h-10 px-8 bg-white border-slate-200 text-slate-700 hover:text-primary font-black text-[10px] uppercase tracking-[0.2em] shadow-sm transition-all duration-300 group"
                                                    >
                                                        <Edit3 className="w-4 h-4 mr-2" />
                                                        Modify
                                                    </Button>
                                                    <Button
                                                        onClick={() => window.open(`/api/doctor/prescription-pdf?appointmentId=${prescription.appointmentId}&patientId=${prescription.patientId}`, "_blank")}
                                                        className="rounded-2xl h-10 px-8 bg-slate-900 hover:bg-primary text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:shadow-primary/30 transition-all duration-300 group"
                                                    >
                                                        <Download className="w-4 h-4 mr-2 group-hover:-translate-y-1 transition-transform" />
                                                        Download PDF
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card className="rounded-[3rem] border-dashed border-2 border-slate-100 bg-slate-50/50 py-32 flex flex-col items-center justify-center text-center">
                        <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-xl mb-6">
                            <Clipboard className="w-10 h-10 text-slate-200" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-300 tracking-tight mb-2">Clinical vault is empty</h3>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">No prescriptions match your synchronization criteria.</p>
                    </Card>
                )}
            </div>

            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-[2rem]">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black">Edit Prescription</DialogTitle>
                        <DialogDescription>
                            Modifying prescription for {selectedPrescription?.patientName}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        {editMedicines.map((med, idx) => (
                            <div key={idx} className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100 relative">
                                <div className="absolute top-4 right-4">
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="text-red-500 h-8 px-2 hover:bg-red-50 rounded-lg text-[10px] font-black uppercase tracking-widest"
                                        onClick={() => {
                                            const updated = [...editMedicines]
                                            updated.splice(idx, 1)
                                            setEditMedicines(updated)
                                        }}
                                    >
                                        Remove
                                    </Button>
                                </div>
                                <Input 
                                    placeholder="Medicine Name (e.g. Paracetamol 500mg)"
                                    value={med.name}
                                    onChange={(e) => {
                                        const updated = [...editMedicines]
                                        updated[idx].name = e.target.value
                                        setEditMedicines(updated)
                                    }}
                                    className="pr-20"
                                />
                                <div className="grid grid-cols-2 gap-3">
                                    <Input 
                                        placeholder="Dosage"
                                        value={med.dosage}
                                        onChange={(e) => {
                                            const updated = [...editMedicines]
                                            updated[idx].dosage = e.target.value
                                            setEditMedicines(updated)
                                        }}
                                    />
                                    <Input 
                                        placeholder="Frequency"
                                        value={med.frequency || med.instructions}
                                        onChange={(e) => {
                                            const updated = [...editMedicines]
                                            updated[idx].frequency = e.target.value
                                            updated[idx].instructions = e.target.value
                                            setEditMedicines(updated)
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                        <div className="flex gap-4 pt-2">
                            <Button variant="outline" className="flex-1 border-dashed rounded-xl h-12" onClick={() => setEditMedicines([...editMedicines, { name: "", dosage: "", frequency: "", duration: "" }])}>
                                + Add Medicine
                            </Button>
                            <Button variant="outline" className="flex-1 border-dashed border-red-200 text-red-500 hover:bg-red-50 rounded-xl h-12" onClick={handleAddBloodRequest}>
                                <Droplets className="w-4 h-4 mr-2" />
                                + Blood Request
                            </Button>
                        </div>
                        <Button 
                            className="w-full bg-slate-900 hover:bg-primary text-white rounded-xl h-14 mt-4 font-black uppercase tracking-widest" 
                            onClick={handleSaveEdit}
                            disabled={editLoading}
                        >
                            {editLoading ? "Saving Changes..." : "Save Changes"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </DoctorLayout>
    )
}
