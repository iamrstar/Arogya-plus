"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { AdminLayout } from "@/components/layouts/admin-layout"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { UserCheck, Search, LogOut as Discharge, Loader2, AlertCircle, Heart, Activity, Pill, Plus, Check, ChevronsUpDown, Scissors, IndianRupee, Trash2, ShoppingCart } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export default function AdmittedPatients() {
    const [patients, setPatients] = useState([])
    const [medicines, setMedicines] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [discharging, setDischarging] = useState(null)
    const [isMedicating, setIsMedicating] = useState(false)
    const [selectedPatient, setSelectedPatient] = useState(null)
    const [selectedMedId, setSelectedMedId] = useState("")
    const [isComboboxOpen, setIsComboboxOpen] = useState(false)
    const [medQty, setMedQty] = useState(1)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [billingData, setBillingData] = useState(null)
    const [isBillingOpen, setIsBillingOpen] = useState(false)
    const [isFinalizing, setIsFinalizing] = useState(false)
    const [medicationQueue, setMedicationQueue] = useState([]) // { id, name, qty, price, unit }
    const [medSearch, setMedSearch] = useState("")

    useEffect(() => {
        fetchPatients()
        fetchMedicines()
    }, [])

    const fetchPatients = async () => {
        try {
            const res = await fetch("/api/admin/admitted")
            const data = await res.json()
            // Only show patients who have been physically shifted to a bed
            setPatients(data.filter(p => p.isShifted !== false))
        } catch (e) { console.error(e) }
        setLoading(false)
    }

    const fetchMedicines = async () => {
        try {
            const res = await fetch("/api/admin/medicines")
            const data = await res.json()
            setMedicines(Array.isArray(data) ? data : (data.value || []))
        } catch (e) { console.error(e) }
    }

    const openMedicationDialog = (patient) => {
        setSelectedPatient(patient)
        setMedSearch("")
        setSelectedMedId("")
        setMedQty(1)
        setMedicationQueue([])
        setIsMedicating(true)
        fetchMedicines() // Refresh when opening
    }

    const handleDischargeClick = async (patient) => {
        setDischarging(patient._id)
        try {
            const res = await fetch(`/api/admin/admitted?patientId=${patient._id}&action=bill`)
            const bill = await res.json()
            setBillingData({ ...bill, patientId: patient._id })
            setIsBillingOpen(true)
        } catch (e) {
            toast.error("Failed to generate bill")
        }
        setDischarging(null)
    }

    const finalizeDischarge = async () => {
        if (!billingData) return
        setIsFinalizing(true)
        try {
            const res = await fetch("/api/admin/admitted", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ patientId: billingData.patientId, action: "discharge" })
            })
            if (res.ok) {
                toast.success(`Patient discharged. Invoice ${billingData.invoiceNo || 'generated'} and bed released.`)
                setIsBillingOpen(false)
                setBillingData(null)
                fetchPatients()
            } else {
                toast.error("Discharge failed")
            }
        } catch (e) {
            toast.error("An error occurred")
        }
        setIsFinalizing(false)
    }

    const addToQueue = () => {
        if (!selectedMedId) return toast.error("Select a medicine first")
        const med = medicines.find(m => m._id === selectedMedId)
        if (!med) return

        if (med.stock < medQty) return toast.error(`Insufficient stock for ${med.name}`)

        const existing = medicationQueue.find(q => q.id === selectedMedId)
        if (existing) {
            setMedicationQueue(medicationQueue.map(q =>
                q.id === selectedMedId ? { ...q, qty: q.qty + medQty } : q
            ))
        } else {
            setMedicationQueue([...medicationQueue, {
                id: med._id,
                name: med.name,
                qty: medQty,
                price: med.price,
                unit: med.unit
            }])
        }

        setSelectedMedId("")
        setMedQty(1)
        toast.success(`Added ${med.name} to administration list`)
    }

    const removeFromQueue = (id) => {
        setMedicationQueue(medicationQueue.filter(q => q.id !== id))
    }

    const handleMedicate = async () => {
        if (medicationQueue.length === 0) {
            toast.error("Add at least one item to the list")
            return
        }
        setIsSubmitting(true)
        try {
            const res = await fetch("/api/admin/admitted", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    patientId: selectedPatient._id,
                    action: "medicate",
                    items: medicationQueue.map(q => ({ medicineId: q.id, quantity: q.qty }))
                })
            })
            const data = await res.json()
            if (res.ok) {
                toast.success(`Administered ${data.medicines.join(', ')} to ${selectedPatient.name}.`)
                setIsMedicating(false)
                setMedicationQueue([])
                fetchMedicines()
            } else {
                toast.error(data.error || "Medication failed")
            }
        } catch (e) {
            toast.error("An error occurred")
        }
        setIsSubmitting(false)
    }

    const handleAdministerPlanItem = async (planItem) => {
        setIsSubmitting(true)
        try {
            const res = await fetch("/api/admin/admitted", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    patientId: selectedPatient._id,
                    action: "medicate",
                    planItemId: planItem._id,
                    items: [{ medicineId: planItem.medicineId, quantity: planItem.quantity }]
                })
            })
            if (res.ok) {
                toast.success(`Administered ${planItem.medicineName} per doctor's protocol.`)
                fetchPatients()
                // Update selected patient local state to reflect the change immediately
                setSelectedPatient(prev => ({
                    ...prev,
                    dailyMedicationPlan: prev.dailyMedicationPlan.map(i =>
                        i._id === planItem._id ? { ...i, status: "administered" } : i
                    )
                }))
            } else {
                const data = await res.json()
                toast.error(data.error || "Failed to administer order")
            }
        } catch (e) {
            toast.error("An error occurred while administering order")
        } finally {
            setIsSubmitting(false)
        }
    }

    const getStatusBadge = (status) => {
        const styles = {
            "Critical": "bg-red-50 text-red-600",
            "Stable": "bg-green-50 text-green-600",
            "Improving": "bg-blue-50 text-blue-600",
            "Under Observation": "bg-amber-50 text-amber-600",
            "Post Surgery": "bg-purple-50 text-purple-600",
            "Pre Surgery": "bg-indigo-50 text-indigo-600",
            "Recovering": "bg-teal-50 text-teal-600",
            "Stabilizing": "bg-cyan-50 text-cyan-600",
            "Under Phototherapy": "bg-pink-50 text-pink-600",
        }
        return <Badge className={cn("border-none font-black text-[10px] uppercase tracking-widest px-3 py-1", styles[status] || "bg-slate-50 text-slate-500")}>{status}</Badge>
    }

    const filtered = patients.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.condition.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (loading) return (
        <AdminLayout>
            <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Loading Patient Registry...</p>
            </div>
        </AdminLayout>
    )

    const selectedMedicine = medicines.find((med) => med._id === selectedMedId)

    return (
        <AdminLayout>
            <div className="space-y-8 pb-16">
                <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
                    <div className="space-y-3">
                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-purple-500/5 text-purple-600 text-[10px] font-black uppercase tracking-[0.2em]">
                            <UserCheck className="w-3 h-3 mr-2" /> Inpatient Registry
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Admitted Patients</h1>
                        <p className="text-slate-500 font-medium">{patients.length} patients currently admitted · <span className="text-red-500 font-bold">{patients.filter(p => p.status === "Critical").length} in critical condition</span></p>
                    </div>
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input placeholder="Search patients..." className="pl-12 rounded-xl h-12 shadow-sm border-slate-100" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                    </div>
                </div>

                {/* Patient Cards */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map(patient => (
                        <Card key={patient._id} className={cn(
                            "rounded-[2rem] border-2 group hover:shadow-2xl transition-all duration-500",
                            patient.status === "Critical" ? "border-red-100 hover:border-red-200" : "border-slate-50 hover:border-primary/20"
                        )}>
                            <CardContent className="p-8 space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-sm shadow-lg transform group-hover:scale-110 transition-transform",
                                            patient.status === "Critical" ? "bg-red-500 shadow-red-100" : "bg-primary shadow-primary/10"
                                        )}>
                                            {patient.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-slate-900 leading-tight">{patient.name}</h3>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{patient.age}Y · {patient.gender} · ID: {patient._id}</p>
                                        </div>
                                    </div>
                                    {patient.status === "Critical" && <Heart className="w-5 h-5 text-red-500 animate-pulse fill-red-500" />}
                                </div>

                                <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                                    <div className="space-y-1">
                                        <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Department</p>
                                        <p className="font-bold text-slate-700 text-xs">{patient.department}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Bed Number</p>
                                        <p className="font-bold text-slate-900 border-2 border-slate-50 rounded-lg px-2 py-0.5 w-fit text-xs">{patient.bed}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Assigned Doctor</p>
                                        <p className="font-bold text-slate-700 text-xs">Dr. {patient.doctor}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Admission</p>
                                        <p className="font-bold text-slate-700 text-xs">{patient.admissionDate}</p>
                                    </div>
                                </div>

                                <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-50">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Activity className="w-3.5 h-3.5 text-primary" />
                                        <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Condition Protocol</p>
                                    </div>
                                    <p className="text-xs font-bold text-slate-800 italic tracking-tight underline decoration-primary/20 decoration-2 underline-offset-4">{patient.condition}</p>
                                </div>

                                <div className="flex flex-col gap-3 pt-2">
                                    <div className="flex items-center justify-between">
                                        {getStatusBadge(patient.status)}
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="text-red-500 hover:bg-red-50 font-black text-[10px] uppercase tracking-widest h-8 rounded-lg"
                                            onClick={() => handleDischargeClick(patient)}
                                            disabled={discharging === patient._id}
                                        >
                                            {discharging === patient._id ? <Loader2 className="w-3 h-3 animate-spin" /> : "Discharge"}
                                        </Button>
                                    </div>
                                    <Button
                                        className="w-full h-12 rounded-xl bg-slate-900 hover:bg-primary text-white font-black text-[10px] uppercase tracking-widest gap-2 shadow-xl shadow-slate-200 transition-all hover:scale-[1.02]"
                                        onClick={() => openMedicationDialog(patient)}
                                    >
                                        <Pill className="w-4 h-4" />
                                        Administer Medicine
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Medicate Dialog */}
            <Dialog open={isMedicating} onOpenChange={(open) => { setIsMedicating(open); if (!open) { setMedicationQueue([]); setMedSearch(""); } }}>
                <DialogContent className="rounded-[2.5rem] max-w-4xl border-none p-0 overflow-hidden shadow-2xl">
                    <div className="bg-primary p-8 text-white relative">
                        <Pill className="w-16 h-16 text-white opacity-20 absolute -top-4 -right-4 rotate-12" />
                        <h2 className="text-3xl font-black mb-1 tracking-tight">Medication Protocol</h2>
                        <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em]">Patient: {selectedPatient?.name}</p>
                    </div>

                    <div className="p-8 grid md:grid-cols-2 gap-8 bg-white max-h-[85vh] overflow-y-auto">
                        {/* Selector Column */}
                        <div className="space-y-6">
                            {/* DOCTOR'S ORDERS SECTION */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Doctor's Orders</h3>
                                    <Badge variant="outline" className="text-[8px] font-bold text-primary border-primary/20">Authorized Protocol</Badge>
                                </div>

                                {selectedPatient?.dailyMedicationPlan && selectedPatient.dailyMedicationPlan.length > 0 ? (
                                    <div className="space-y-6">
                                        {["Morning", "Afternoon", "Evening", "Night"].map(shift => {
                                            const shiftItems = selectedPatient.dailyMedicationPlan.filter(i => i.shift === shift || (!i.shift && shift === "Morning"))
                                            if (shiftItems.length === 0) return null
                                            return (
                                                <div key={shift} className="space-y-2">
                                                    <p className="text-[8px] font-black uppercase tracking-widest text-slate-300 ml-1">{shift} Doses</p>
                                                    <div className="space-y-2">
                                                        {shiftItems.map((item) => (
                                                            <div key={item._id} className={cn(
                                                                "p-4 rounded-2xl border transition-all flex items-center justify-between group/order",
                                                                item.status === "administered" ? "bg-slate-50 border-slate-100 opacity-60" : "bg-primary/5 border-primary/10 shadow-sm"
                                                            )}>
                                                                <div className="flex items-center gap-3">
                                                                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shadow-sm",
                                                                        item.status === "administered" ? "bg-white text-slate-300" : "bg-white text-primary"
                                                                    )}>
                                                                        {item.status === "administered" ? <Check className="w-4 h-4" /> : <Pill className="w-4 h-4" />}
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-[11px] font-bold text-slate-900">{item.medicineName}</p>
                                                                        <p className="text-[9px] text-slate-500 font-medium">{item.dosage} · {item.quantity} {item.unit} · {item.instructions}</p>
                                                                    </div>
                                                                </div>
                                                                {item.status === "pending" && (
                                                                    <Button
                                                                        size="sm"
                                                                        className="h-8 rounded-xl bg-primary hover:bg-primary/90 text-[9px] font-black uppercase tracking-widest px-4 opacity-0 group-hover/order:opacity-100 transition-all font-bold"
                                                                        onClick={() => handleAdministerPlanItem(item)}
                                                                        disabled={isSubmitting}
                                                                    >
                                                                        Push
                                                                    </Button>
                                                                )}
                                                                {item.status === "administered" && (
                                                                    <Badge variant="outline" className="text-[8px] font-bold text-green-500 border-green-100 capitalize">Given</Badge>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                ) : (
                                    <div className="py-12 text-center border-2 border-dashed border-slate-100 rounded-[2rem]">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">No daily orders</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Selector & History Column */}
                        <div className="bg-slate-50 rounded-[2.5rem] p-8 space-y-8 flex flex-col">
                            <Tabs defaultValue="administer" className="h-full flex flex-col">
                                <TabsList className="bg-white/50 p-1.5 rounded-2xl border border-slate-100 mb-6 mx-auto">
                                    <TabsTrigger value="administer" className="rounded-xl px-8 py-2.5 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm font-black text-[10px] uppercase tracking-widest transition-all">Add Dose</TabsTrigger>
                                    <TabsTrigger value="history" className="rounded-xl px-8 py-2.5 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm font-black text-[10px] uppercase tracking-widest transition-all">History Log</TabsTrigger>
                                </TabsList>

                                <TabsContent value="administer" className="space-y-6 m-0 flex-1">
                                    <div className="space-y-4">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Search & Select Item</label>
                                            <div className="space-y-2">
                                                <div className="relative group/search">
                                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within/search:text-primary transition-colors" />
                                                    <Input
                                                        placeholder="Find in inventory..."
                                                        value={medSearch}
                                                        onChange={(e) => setMedSearch(e.target.value)}
                                                        className="h-14 rounded-2xl border-2 border-white bg-white px-11 font-bold text-slate-700 focus:border-primary/20 transition-all text-sm shadow-sm"
                                                    />
                                                </div>

                                                <div className="max-h-[200px] overflow-y-auto rounded-[2rem] border-2 border-white bg-white/50 divide-y divide-white/50 shadow-inner">
                                                    {medicines.filter(m =>
                                                        m.name.toLowerCase().includes(medSearch.toLowerCase()) ||
                                                        m.category.toLowerCase().includes(medSearch.toLowerCase())
                                                    ).map((med) => (
                                                        <div
                                                            key={med._id}
                                                            onClick={() => setSelectedMedId(med._id)}
                                                            className={cn(
                                                                "p-4 cursor-pointer transition-all flex items-center justify-between group/med",
                                                                selectedMedId === med._id ? "bg-white" : "hover:bg-white/40"
                                                            )}
                                                        >
                                                            <div className="flex flex-col">
                                                                <span className={cn("text-[11px] font-black tracking-tight uppercase", selectedMedId === med._id ? "text-primary" : "text-slate-600")}>{med.name}</span>
                                                                <span className="text-[9px] text-slate-400 font-bold tracking-widest leading-none mt-1">{med.category} · ₹{med.price} · {med.stock} {med.unit}</span>
                                                            </div>
                                                            {selectedMedId === med._id && <div className="w-2 h-2 rounded-full bg-primary" />}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-4">
                                            <div className="flex-1 space-y-3">
                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Quantity</label>
                                                <Input
                                                    type="number"
                                                    value={medQty}
                                                    onChange={(e) => setMedQty(parseInt(e.target.value) || 0)}
                                                    className="h-14 rounded-2xl border-2 border-white bg-white px-6 font-black text-slate-900 shadow-sm"
                                                />
                                            </div>
                                            <div className="flex items-end flex-1 pb-0.5">
                                                <Button
                                                    onClick={addToQueue}
                                                    className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-primary text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-slate-200 transition-all active:scale-95"
                                                >
                                                    Queue Dose
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4 pt-4 border-t border-white flex-1 overflow-y-auto max-h-[250px]">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Administration List</h3>
                                            <Badge variant="outline" className="text-[9px] font-bold text-slate-900 border-slate-200">{medicationQueue.length} items</Badge>
                                        </div>
                                        <div className="space-y-2">
                                            {medicationQueue.map((item) => (
                                                <div key={item.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group/qitem animate-in slide-in-from-right-2">
                                                    <div>
                                                        <p className="text-[11px] font-bold text-slate-900 uppercase tracking-tight">{item.name}</p>
                                                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{item.qty} {item.unit} · ₹{item.price * item.qty}</p>
                                                    </div>
                                                    <Button variant="ghost" size="icon" onClick={() => removeFromQueue(item.id)} className="h-8 w-8 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-xl">
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <Button
                                        onClick={handleMedicate}
                                        disabled={medicationQueue.length === 0 || isSubmitting}
                                        className="w-full h-16 rounded-[1.5rem] bg-slate-900 hover:bg-primary text-white font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-slate-200 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                                    >
                                        Authorize Administration
                                    </Button>
                                </TabsContent>

                                <TabsContent value="history" className="m-0 flex-1 overflow-y-auto max-h-[500px]">
                                    <div className="space-y-8">
                                        {selectedPatient?.medicationLog && selectedPatient.medicationLog.length > 0 ? (
                                            Object.entries(
                                                selectedPatient.medicationLog.reduce((acc, log) => {
                                                    const date = new Date(log.date).toLocaleDateString('en-IN');
                                                    if (!acc[date]) acc[date] = [];
                                                    acc[date].push(log);
                                                    return acc;
                                                }, {})
                                            ).sort(([a], [b]) => new Date(b) - new Date(a)).map(([date, logs]) => (
                                                <div key={date} className="space-y-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-px flex-1 bg-slate-200" />
                                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 whitespace-nowrap">{date}</span>
                                                        <div className="h-px flex-1 bg-slate-200" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        {logs.reverse().map((log, idx) => (
                                                            <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                                                                        <Clock className="w-4 h-4" />
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-[11px] font-bold text-slate-900">{log.name}</p>
                                                                        <p className="text-[9px] text-slate-400 font-bold">{new Date(log.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · Qty: {log.quantity}</p>
                                                                    </div>
                                                                </div>
                                                                <Badge variant="outline" className="text-[8px] font-black text-slate-400">Done</Badge>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="py-20 text-center">
                                                <Clipboard className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 italic">No medication history found</p>
                                            </div>
                                        )}
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
            {/* Billing Summary Dialog */}
            < Dialog open={isBillingOpen} onOpenChange={setIsBillingOpen} >
                <DialogContent className="rounded-[3rem] max-w-2xl border-none p-0 overflow-hidden shadow-2xl">
                    <div className="bg-slate-900 p-12 text-white relative">
                        <IndianRupee className="w-20 h-20 text-primary opacity-20 absolute -top-4 -right-4 rotate-12" />
                        <h2 className="text-4xl font-black mb-1 tracking-tight">Final Settlement</h2>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em]">Inpatient Invoice — PREVIEW</p>
                    </div>

                    <div className="p-10 space-y-8 bg-white">
                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-1">
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Patient Details</p>
                                <p className="text-xl font-black text-slate-900">{billingData?.patientName}</p>
                                <p className="text-xs text-slate-500">Admitted: {billingData?.admissionDate}</p>
                            </div>
                            <div className="text-right space-y-1">
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Billing Period</p>
                                <p className="text-xl font-black text-slate-900">{billingData?.days} Day(s)</p>
                                <p className="text-xs text-slate-500">Stay Duration</p>
                            </div>
                        </div>

                        <div className="rounded-3xl border-2 border-slate-50 overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-slate-50">
                                    <tr className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        <th className="px-6 py-4 text-left">Description</th>
                                        <th className="px-6 py-4 text-center">Unit Price</th>
                                        <th className="px-6 py-4 text-center">Qty/Days</th>
                                        <th className="px-6 py-4 text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y-2 divide-slate-50">
                                    <tr className="text-sm">
                                        <td className="px-6 py-5 font-bold text-slate-700">Bed Charges ({billingData?.days} days)</td>
                                        <td className="px-6 py-5 text-center text-slate-500 font-medium">₹{billingData?.bedRate}</td>
                                        <td className="px-6 py-5 text-center text-slate-500 font-medium">{billingData?.days}</td>
                                        <td className="px-6 py-5 text-right font-black text-slate-900">₹{billingData?.bedTotal}</td>
                                    </tr>
                                    {(billingData?.medications || []).map((med, i) => (
                                        <tr key={i} className="text-sm">
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-700">{med.name}</span>
                                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{med.medicineId?.startsWith('CON') ? 'Clinical Supply' : 'Medication'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-center text-slate-500 font-medium">₹{med.price}</td>
                                            <td className="px-6 py-5 text-center text-slate-500 font-medium">{med.quantity}</td>
                                            <td className="px-6 py-5 text-right font-black text-slate-900">₹{med.price * med.quantity}</td>
                                        </tr>
                                    ))}

                                    {(billingData?.otProcedures || []).map((ot, i) => (
                                        <tr key={`ot-${i}`} className="text-sm bg-red-50/30">
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-2">
                                                    <Scissors className="w-3 h-3 text-red-500" />
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-slate-900">{ot.procedure}</span>
                                                        <span className="text-[10px] text-red-500 font-black uppercase tracking-widest">Surgical Procedure</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-center text-slate-500 font-medium">₹{ot.cost}</td>
                                            <td className="px-6 py-5 text-center text-slate-500 font-medium">1</td>
                                            <td className="px-6 py-5 text-right font-black text-red-600">₹{ot.cost}</td>
                                        </tr>
                                    ))}
                                    {(!billingData?.medications || billingData.medications.length === 0) && (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-4 text-[10px] font-black text-center text-slate-300 uppercase tracking-widest italic">No medication charges recorded</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex flex-col gap-6">
                            <div className="flex items-center justify-between p-8 bg-primary/5 rounded-[2rem] border-2 border-primary/10">
                                <div>
                                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-1">Grand Total (Incl. Taxes)</p>
                                    <p className="text-xs text-slate-400 font-bold">Payments to be settled at the counter.</p>
                                </div>
                                <p className="text-5xl font-black text-primary">₹{billingData?.grandTotal}</p>
                            </div>

                            <div className="flex flex-col gap-4">
                                <Button
                                    onClick={finalizeDischarge}
                                    className="h-20 rounded-[1.8rem] bg-slate-900 hover:bg-slate-800 text-white font-black text-sm uppercase tracking-[0.3em] shadow-2xl transition-all hover:scale-[1.02] active:scale-95"
                                    disabled={isFinalizing}
                                >
                                    {isFinalizing ? <Loader2 className="w-6 h-6 animate-spin text-primary" /> : "Authorize Clearance & Discharge"}
                                </Button>
                                <Button variant="ghost" onClick={() => setIsBillingOpen(false)} className="h-12 rounded-xl text-slate-400 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-colors">Go Back</Button>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog >
        </AdminLayout >
    )
}
