"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AdminLayout } from "@/components/layouts/admin-layout"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pill, Search, AlertTriangle, TrendingUp, Package, Loader2, Truck, Clock, User, CheckCircle2, ArrowUpRight, Activity, ShoppingCart, Plus, Timer, Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export default function MedicalStockAdmin() {
    const [medicines, setMedicines] = useState([])
    const [orders, setOrders] = useState([])
    const [purchaseOrders, setPurchaseOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [filterStatus, setFilterStatus] = useState("All")
    const [isRestockDialogOpen, setIsRestockDialogOpen] = useState(false)
    const [isFulfillDialogOpen, setIsFulfillDialogOpen] = useState(false)
    const [isAddMedDialogOpen, setIsAddMedDialogOpen] = useState(false)
    const [selectedMed, setSelectedMed] = useState(null)
    const [restockQty, setRestockQty] = useState(100)
    const [fulfillQty, setFulfillQty] = useState(100)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [now, setNow] = useState(Date.now())

    const [newMed, setNewMed] = useState({
        name: "",
        category: "General",
        stock: 0,
        unit: "Tablets",
        expiry: "",
        supplier: "MediLife Solutions"
    })

    useEffect(() => {
        fetchAll()
        const timer = setInterval(() => setNow(Date.now()), 1000)
        return () => clearInterval(timer)
    }, [])

    const fetchAll = async () => {
        try {
            const [medRes, orderRes, poRes] = await Promise.all([
                fetch("/api/admin/medicines"),
                fetch("/api/pharmacy/order"),
                fetch("/api/admin/purchase-orders")
            ])
            setMedicines(await medRes.json())
            setOrders(await orderRes.json())
            setPurchaseOrders(await poRes.json())
        } catch (e) { console.error(e) }
        setLoading(false)
    }

    const handleRestock = async () => {
        if (!selectedMed) return
        setIsSubmitting(true)
        try {
            const poRes = await fetch("/api/admin/purchase-orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    medicineId: selectedMed._id,
                    medicineName: selectedMed.name,
                    supplier: selectedMed.supplier,
                    quantity: restockQty,
                    unit: selectedMed.unit
                })
            })

            const medRes = await fetch("/api/admin/medicines", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ medicineId: selectedMed._id, action: "request", restockStatus: true })
            })

            if (poRes.ok && medRes.ok) {
                toast.success(`Purchase Order created! Supplier will deliver in approx. 10 minutes.`)
                setIsRestockDialogOpen(false)
                fetchAll()
            } else {
                toast.error("Failed to process restock request.")
            }
        } catch (e) {
            console.error(e)
            toast.error("An error occurred.")
        }
        setIsSubmitting(false)
    }

    const handleFulfillment = async () => {
        if (!selectedMed) return
        setIsSubmitting(true)
        try {
            const medRes = await fetch("/api/admin/medicines", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ medicineId: selectedMed._id, action: "fulfill", incrementQty: fulfillQty })
            })

            const pendingPo = purchaseOrders.find(po => po.medicineId === selectedMed._id && po.status !== 'Delivered')
            if (pendingPo) {
                await fetch("/api/admin/purchase-orders", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ orderId: pendingPo._id, status: "Delivered", receivedQty: fulfillQty })
                })
            }

            if (medRes.ok) {
                toast.success(`Stock fulfilled! Added ${fulfillQty} ${selectedMed.unit} to inventory.`)
                setIsFulfillDialogOpen(false)
                fetchAll()
            } else {
                toast.error("Failed to fulfill stock.")
            }
        } catch (e) {
            console.error(e)
            toast.error("An error occurred.")
        }
        setIsSubmitting(false)
    }

    const handleAddMedicine = async () => {
        if (!newMed.name || !newMed.expiry) {
            toast.error("Please fill all required fields")
            return
        }
        setIsSubmitting(true)
        try {
            const res = await fetch("/api/admin/medicines", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newMed)
            })
            if (res.ok) {
                toast.success(`${newMed.name} added to inventory!`)
                setIsAddMedDialogOpen(false)
                setNewMed({
                    name: "",
                    category: "General",
                    stock: 0,
                    unit: "Tablets",
                    expiry: "",
                    supplier: "MediLife Solutions"
                })
                fetchAll()
            } else {
                toast.error("Failed to add medicine")
            }
        } catch (e) {
            toast.error("An error occurred")
        }
        setIsSubmitting(false)
    }

    const formatTimeLeft = (targetTime) => {
        if (!targetTime) return null;
        const diff = targetTime - now
        if (isNaN(diff) || diff <= 0) return null
        const mins = Math.floor(diff / 60000)
        const secs = Math.floor((diff % 60000) / 1000)
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`
    }

    const statusFilters = ["All", "In Stock", "Low Stock", "Critical", "Out of Stock"]

    const getStatusBadge = (status) => {
        const styles = {
            "In Stock": "bg-green-50 text-green-600",
            "Low Stock": "bg-amber-50 text-amber-600",
            "Critical": "bg-red-50 text-red-600",
            "Out of Stock": "bg-slate-100 text-slate-500",
        }
        return <Badge className={cn("border-none font-black text-[10px] uppercase tracking-widest px-3 py-1", styles[status] || "bg-slate-50 text-slate-500")}>{status}</Badge>
    }

    const filtered = medicines.filter(m => {
        const name = String(m.name || "").toLowerCase()
        const cat = String(m.category || "").toLowerCase()
        const matchSearch = name.includes(searchTerm.toLowerCase()) || cat.includes(searchTerm.toLowerCase())
        const matchFilter = filterStatus === "All" || m.status === filterStatus
        return matchSearch && matchFilter
    })

    const totalValue = medicines.reduce((sum, m) => sum + (m.stock || 0) * 10, 0)
    const criticalCount = medicines.filter(m => m.status === "Critical" || m.status === "Out of Stock").length

    if (loading) return (
        <AdminLayout>
            <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Loading Medicine Inventory...</p>
            </div>
        </AdminLayout>
    )

    return (
        <AdminLayout>
            <div className="space-y-10 pb-16">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2rem] border-2 border-slate-50 shadow-sm transition-all hover:shadow-md">
                    <div className="space-y-3">
                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/5 text-primary text-[10px] font-black uppercase tracking-[0.2em]">
                            <Activity className="w-3.5 h-3.5 mr-2" /> Pharmacy Workspace
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Medicine Inventory</h1>
                        <p className="text-slate-500 font-medium tracking-tight">Managing <span className="text-slate-900 font-bold">{medicines.length} clinical items</span> · <span className="text-red-500 font-bold">{criticalCount} stock alarms active</span></p>
                    </div>
                    <Button
                        onClick={() => setIsAddMedDialogOpen(true)}
                        className="h-16 px-10 rounded-2xl bg-slate-900 hover:bg-primary text-white font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-slate-200 gap-4 group transition-all hover:scale-[1.02] active:scale-95"
                    >
                        <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform" />
                        Add New Medicine
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { label: "Total Asset Value", val: `₹${(totalValue / 100000).toFixed(1)}L`, icon: <TrendingUp className="text-green-600 w-6 h-6" />, sub: `${medicines.length} Stock Units` },
                        { label: "Procurement Requests", val: purchaseOrders.filter(p => p.status !== 'Delivered').length, icon: <Truck className="text-amber-500 w-6 h-6" />, sub: `${purchaseOrders.length} History Logs` },
                        { label: "Sales & Dispatch", val: orders.filter(o => o.status === 'Pending').length, icon: <ShoppingCart className="text-primary w-6 h-6" />, sub: `Active Pharmacy Queue` },
                    ].map((s, i) => (
                        <Card key={i} className="rounded-[2.5rem] border-2 border-slate-50 hover:border-primary/20 transition-all group overflow-hidden bg-white shadow-sm hover:shadow-xl">
                            <CardContent className="p-10 pb-8">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="w-16 h-16 bg-slate-50 rounded-[1.2rem] flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">{s.icon}</div>
                                </div>
                                <h3 className="text-4xl font-black text-slate-900 tracking-tight">{s.val}</h3>
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mt-2">{s.label}</p>
                                <div className="h-px bg-slate-50 w-full my-6" />
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary" /> {s.sub}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Tabs defaultValue="inventory" className="w-full">
                    <TabsList className="bg-slate-50/80 p-1.5 rounded-[1.5rem] border-2 border-slate-100 w-full md:w-fit mb-10">
                        <TabsTrigger value="inventory" className="rounded-xl font-black text-[10px] uppercase tracking-widest px-12 py-4 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-lg transition-all">Clinical Inventory</TabsTrigger>
                        <TabsTrigger value="purchase-orders" className="rounded-xl font-black text-[10px] uppercase tracking-widest px-12 py-4 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-lg transition-all">Procurement Logs</TabsTrigger>
                    </TabsList>

                    <TabsContent value="inventory" className="space-y-10">
                        {/* Search Bar - Repositioned for focus */}
                        <div className="flex flex-col md:flex-row gap-6">
                            <div className="relative flex-1 group">
                                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                                <Input
                                    placeholder="Scan or Search Medicines (e.g. Dolo, Antibiotics...)"
                                    className="pl-14 rounded-[1.5rem] h-16 border-2 border-slate-50 bg-white shadow-xl shadow-slate-100 focus:border-primary/20 transition-all font-bold text-lg"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-2 p-1.5 bg-slate-100/50 rounded-2xl border-2 border-slate-50 overflow-x-auto no-scrollbar">
                                {statusFilters.map(s => (
                                    <Button
                                        key={s}
                                        variant={filterStatus === s ? "default" : "ghost"}
                                        className={cn("rounded-xl font-black text-[10px] uppercase tracking-widest px-8 h-12 shadow-none transition-all",
                                            filterStatus === s ? "bg-white text-primary shadow-md hover:bg-white" : "text-slate-400 hover:text-slate-600")}
                                        onClick={() => setFilterStatus(s)}
                                    >
                                        {s}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        {/* Medicine Registry Table */}
                        <Card className="rounded-[3rem] border-2 border-slate-50 overflow-hidden shadow-2xl shadow-slate-100 bg-white">
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-slate-50/80 border-b-2 border-slate-100 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                                <th className="px-10 py-8 text-left">Clinical Item & Batch</th>
                                                <th className="px-6 py-8 text-left">Classification</th>
                                                <th className="px-6 py-8 text-left">Stock Volume</th>
                                                <th className="px-6 py-8 text-left">Logistics</th>
                                                <th className="px-6 py-8 text-left">Inventory State</th>
                                                <th className="px-10 py-8 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y-2 divide-slate-50">
                                            {filtered.map(med => {
                                                const timeLeft = med.restockRequested ? formatTimeLeft(med.availableToFulfillAt) : null
                                                const isRequested = med.restockRequested

                                                return (
                                                    <tr key={med._id} className={cn("hover:bg-primary/[0.02] transition-colors group", (med.status === "Critical" || med.status === "Out of Stock") && "bg-red-50/10")}>
                                                        <td className="px-10 py-8">
                                                            <div className="flex items-center gap-5">
                                                                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-xs shadow-xl transition-transform group-hover:scale-110",
                                                                    med.status === "In Stock" ? "bg-green-500 shadow-green-100" :
                                                                        med.status === "Low Stock" ? "bg-amber-500 shadow-amber-100" :
                                                                            med.status === "Critical" ? "bg-red-500 shadow-red-100" : "bg-slate-400"
                                                                )}>
                                                                    <Pill className="w-6 h-6" />
                                                                </div>
                                                                <div>
                                                                    <p className="font-black text-slate-900 tracking-tight text-lg">{med.name}</p>
                                                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{med.batch} · <span className="text-primary/60">EXP {med.expiry}</span></p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-8">
                                                            <Badge variant="outline" className="rounded-xl border-2 border-slate-100 text-[9px] font-black uppercase tracking-widest bg-slate-50 text-slate-500 px-4 py-2 hover:bg-white transition-colors capitalize">{med.category}</Badge>
                                                        </td>
                                                        <td className="px-6 py-8">
                                                            <div className="space-y-3">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-black text-slate-900 text-lg">{med.stock}</span>
                                                                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{med.unit}</span>
                                                                </div>
                                                                <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                                                                    <div className={cn("h-full rounded-full transition-all duration-1000",
                                                                        med.stock > 100 ? "bg-green-500 w-full" :
                                                                            med.stock > 20 ? "bg-amber-500 w-[40%]" :
                                                                                med.stock > 0 ? "bg-red-500 w-[15%]" : "bg-slate-200 w-0"
                                                                    )} />
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-8">
                                                            <div className="space-y-1">
                                                                <p className="text-xs text-slate-700 font-black tracking-tight">{med.supplier}</p>
                                                                <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em]">Certified Lab</p>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-8">{getStatusBadge(med.status)}</td>
                                                        <td className="px-10 py-8 text-right">
                                                            {med.status === "In Stock" && !isRequested ? (
                                                                <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-300">
                                                                    <CheckCircle2 className="w-4 h-4" /> Secure
                                                                </div>
                                                            ) : !isRequested ? (
                                                                <Button
                                                                    variant="default"
                                                                    size="sm"
                                                                    className="h-11 rounded-xl text-[10px] font-black uppercase tracking-widest bg-slate-900 hover:bg-primary shadow-xl shadow-slate-200 transition-all"
                                                                    onClick={() => { setSelectedMed(med); setRestockQty(100); setIsRestockDialogOpen(true); }}
                                                                >
                                                                    Reorder Stock
                                                                </Button>
                                                            ) : timeLeft ? (
                                                                <div className="inline-flex items-center gap-3 px-6 py-3 bg-amber-50 rounded-[1.2rem] border-2 border-amber-100 shadow-inner">
                                                                    <Timer className="w-4 h-4 text-amber-500 animate-spin" />
                                                                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-600">Transit: <span className="text-sm">{timeLeft}</span></span>
                                                                </div>
                                                            ) : (
                                                                <Button
                                                                    variant="default"
                                                                    size="sm"
                                                                    className="h-11 rounded-xl text-[10px] font-black uppercase tracking-widest bg-green-500 hover:bg-green-600 text-white shadow-xl shadow-green-100 animate-bounce"
                                                                    onClick={() => { setSelectedMed(med); setFulfillQty(100); setIsFulfillDialogOpen(true); }}
                                                                >
                                                                    Receive Stock
                                                                </Button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="purchase-orders">
                        <Card className="rounded-[3rem] border-2 border-slate-50 overflow-hidden shadow-2xl shadow-slate-100 bg-white">
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-slate-50/80 border-b-2 border-slate-100 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                                <th className="px-10 py-8 text-left">Order UUID</th>
                                                <th className="px-6 py-8 text-left">Clinical Item</th>
                                                <th className="px-6 py-8 text-left">Volume</th>
                                                <th className="px-6 py-8 text-left">Receipt Date</th>
                                                <th className="px-6 py-8 text-left">Logistics Partner</th>
                                                <th className="px-10 py-8 text-right">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y-2 divide-slate-50">
                                            {[...purchaseOrders].reverse().map(po => (
                                                <tr key={po._id} className="hover:bg-slate-50/30 transition-colors">
                                                    <td className="px-10 py-8 font-mono text-[10px] font-black text-slate-400 uppercase tracking-tighter">{po._id}</td>
                                                    <td className="px-6 py-8 font-black text-slate-900 tracking-tight text-sm">{po.medicineName}</td>
                                                    <td className="px-6 py-8">
                                                        <span className="font-black text-slate-900">{po.quantity}</span>
                                                        <span className="text-[10px] text-slate-400 font-black uppercase ml-1">{po.unit}</span>
                                                    </td>
                                                    <td className="px-6 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{new Date(po.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                                                    <td className="px-6 py-8 text-xs text-slate-600 font-black uppercase tracking-tight">{po.supplier}</td>
                                                    <td className="px-10 py-8 text-right">
                                                        <Badge className={cn("border-2 px-5 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest",
                                                            po.status === 'Delivered' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-primary/5 text-primary border-primary/10'
                                                        )}>
                                                            {po.status}
                                                        </Badge>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

            {/* ADD MEDICINE DIALOG */}
            <Dialog open={isAddMedDialogOpen} onOpenChange={setIsAddMedDialogOpen}>
                <DialogContent className="rounded-[3rem] max-w-lg border-none p-0 overflow-hidden shadow-2xl">
                    <div className="bg-slate-900 p-12 text-white relative">
                        <Plus className="w-20 h-20 text-primary opacity-20 absolute -top-4 -right-4 rotate-12" />
                        <h2 className="text-4xl font-black mb-1 tracking-tight">New Asset Entry</h2>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em]">Clinical Inventory Protocol</p>
                    </div>

                    <div className="p-10 space-y-8 bg-white">
                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-3 col-span-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Pharmaceutical Name</label>
                                <Input
                                    placeholder="Ex: Paracetamol 500mg"
                                    className="h-16 rounded-[1.2rem] border-2 border-slate-50 bg-slate-50/50 px-8 font-bold text-lg"
                                    value={newMed.name}
                                    onChange={e => setNewMed({ ...newMed, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Therapeutic Class</label>
                                <Select onValueChange={v => setNewMed({ ...newMed, category: v })} defaultValue={newMed.category}>
                                    <SelectTrigger className="h-16 rounded-[1.2rem] border-2 border-slate-50 bg-slate-50/50 px-6 font-bold">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-[1.2rem] border-slate-100 shadow-2xl">
                                        <SelectItem value="Antibiotic">Antibiotic</SelectItem>
                                        <SelectItem value="Analgesic">Analgesic</SelectItem>
                                        <SelectItem value="Cardiac">Cardiac</SelectItem>
                                        <SelectItem value="Antidiabetic">Antidiabetic</SelectItem>
                                        <SelectItem value="General">General</SelectItem>
                                        <SelectItem value="Critical Care">Critical Care</SelectItem>
                                        <SelectItem value="Statins">Statins</SelectItem>
                                        <SelectItem value="NSAIDs">NSAIDs</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Opening Stock</label>
                                <div className="relative">
                                    <Input
                                        type="number"
                                        className="h-16 rounded-[1.2rem] border-2 border-slate-50 bg-slate-50/50 px-8 font-bold text-lg"
                                        value={newMed.stock}
                                        onChange={e => setNewMed({ ...newMed, stock: parseInt(e.target.value) })}
                                    />
                                    <span className="absolute right-8 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase text-slate-300">Units</span>
                                </div>
                            </div>
                            <div className="space-y-3 font-bold">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Expiry Schedule</label>
                                <div className="relative">
                                    <Input
                                        type="month"
                                        className="h-16 rounded-[1.2rem] border-2 border-slate-50 bg-slate-50/50 px-8 font-bold"
                                        value={newMed.expiry}
                                        onChange={e => setNewMed({ ...newMed, expiry: e.target.value })}
                                    />
                                    <CalendarIcon className="absolute right-8 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 pointer-events-none" />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Verified Supplier</label>
                                <Select onValueChange={v => setNewMed({ ...newMed, supplier: v })} defaultValue={newMed.supplier}>
                                    <SelectTrigger className="h-16 rounded-[1.2rem] border-2 border-slate-50 bg-slate-50/50 px-6 font-bold">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-[1.2rem] border-slate-100 shadow-2xl">
                                        <SelectItem value="MediLife Solutions">MediLife Solutions</SelectItem>
                                        <SelectItem value="Apex Pharma">Apex Pharma</SelectItem>
                                        <SelectItem value="Global Health Corp">Global Health Corp</SelectItem>
                                        <SelectItem value="BioGen Logistics">BioGen Logistics</SelectItem>
                                        <SelectItem value="Micro Labs Ltd">Micro Labs Ltd</SelectItem>
                                        <SelectItem value="Cipla Ltd">Cipla Ltd</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="pt-6 flex flex-col gap-4">
                            <Button
                                onClick={handleAddMedicine}
                                className="h-20 rounded-[1.8rem] bg-primary hover:bg-primary/90 text-white font-black text-sm uppercase tracking-[0.3em] shadow-2xl shadow-primary/30 transition-all hover:scale-[1.02] active:scale-95"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : "Authorize Stock Entry"}
                            </Button>
                            <Button variant="ghost" onClick={() => setIsAddMedDialogOpen(false)} className="h-12 rounded-xl text-slate-400 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-colors">Discard Draft</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* RESTOCK DIALOG */}
            <Dialog open={isRestockDialogOpen} onOpenChange={setIsRestockDialogOpen}>
                <DialogContent className="rounded-[3.5rem] max-w-sm border-none p-0 overflow-hidden shadow-2xl">
                    <div className="bg-slate-900 p-10 text-white relative">
                        <Truck className="w-20 h-20 text-primary opacity-20 absolute -top-4 -right-4 rotate-12" />
                        <h2 className="text-3xl font-black mb-1">Stock Order</h2>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{selectedMed?.name}</p>
                    </div>
                    <div className="p-10 space-y-8 bg-white">
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Supply Volume</label>
                                <span className="text-lg font-black text-primary">{restockQty} {selectedMed?.unit}</span>
                            </div>
                            <input
                                type="range" min="50" max="2000" step="50" value={restockQty}
                                onChange={(e) => setRestockQty(parseInt(e.target.value))}
                                className="w-full h-2.5 bg-slate-100 rounded-full appearance-none cursor-pointer accent-primary"
                            />
                            <div className="flex justify-between text-[10px] font-black text-slate-300 uppercase tracking-widest px-1">
                                <span>50</span>
                                <span>1000</span>
                                <span>2000</span>
                            </div>
                        </div>
                        <Button
                            onClick={handleRestock}
                            className="w-full h-16 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl shadow-primary/20 transition-all"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Dispatch Purchase Order"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* FULFILL DIALOG */}
            <Dialog open={isFulfillDialogOpen} onOpenChange={setIsFulfillDialogOpen}>
                <DialogContent className="rounded-[3.5rem] max-w-sm border-none p-0 overflow-hidden shadow-2xl">
                    <div className="bg-green-600 p-10 text-white relative">
                        <Package className="w-20 h-20 text-white opacity-20 absolute -top-4 -right-4 rotate-12" />
                        <h2 className="text-3xl font-black mb-1">Verify Supply</h2>
                        <p className="text-green-100 text-[10px] font-black uppercase tracking-widest">{selectedMed?.name}</p>
                    </div>
                    <div className="p-10 space-y-8 bg-white">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Actual Delivered Volume</label>
                                <span className="text-lg font-black text-green-600">{fulfillQty} {selectedMed?.unit}</span>
                            </div>
                            <Input
                                type="number" value={fulfillQty}
                                onChange={(e) => setFulfillQty(parseInt(e.target.value))}
                                className="h-16 rounded-[1.2rem] border-2 border-slate-50 bg-slate-50/50 px-8 font-black text-xl"
                            />
                            <p className="text-[10px] text-slate-400 italic font-bold px-1 text-center mt-2 tracking-tight">Physically verify shipment before authorizing inventory update.</p>
                        </div>
                        <Button
                            onClick={handleFulfillment}
                            className="w-full h-16 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl shadow-green-100 transition-all"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Authorize & Update Stock"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    )
}
