"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { AdminLayout } from "@/components/layouts/admin-layout"
import { Dialog, DialogContent, Header, DialogTitle, DialogDescription, DialogFooter, DialogHeader } from "@/components/ui/dialog"
import { Beaker, Search, Filter, CheckCircle, Clock, AlertCircle, Loader2, Download, Eye, Plus, ChevronRight, Microscope, FlaskConical } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export default function AdminDiagnostics() {
    const [tests, setTests] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [selectedTest, setSelectedTest] = useState(null)
    const [isUpdating, setIsUpdating] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Form states
    const [result, setResult] = useState("")
    const [referenceRange, setReferenceRange] = useState("")
    const [notes, setNotes] = useState("")

    useEffect(() => {
        fetchTests()
    }, [])

    const fetchTests = async () => {
        try {
            const res = await fetch("/api/admin/diagnostics")
            setTests(await res.json())
        } catch (e) { console.error(e) }
        setLoading(false)
    }

    const handleUpdateResult = async () => {
        if (!result) {
            toast.error("Please enter the test result")
            return
        }
        setIsSubmitting(true)
        try {
            const res = await fetch("/api/admin/diagnostics", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    testId: selectedTest._id,
                    result,
                    referenceRange,
                    notes
                })
            })
            if (res.ok) {
                toast.success("Result posted successfully!")
                setIsUpdating(false)
                fetchTests()
            } else {
                toast.error("Failed to update result")
            }
        } catch (e) {
            toast.error("An error occurred")
        }
        setIsSubmitting(false)
    }

    const getStatusBadge = (status) => {
        const styles = {
            "Completed": "bg-green-50 text-green-600",
            "Pending": "bg-amber-50 text-amber-600",
            "Processing": "bg-blue-50 text-blue-600",
        }
        return <Badge className={cn("border-none font-black text-[10px] uppercase tracking-widest px-3 py-1", styles[status] || "bg-slate-50 text-slate-500")}>{status}</Badge>
    }

    const filtered = tests.filter(t =>
        t.testName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.category.toLowerCase().includes(searchTerm.toLowerCase())
    ).filter(t => statusFilter === "all" || t.status === statusFilter)

    if (loading) return (
        <AdminLayout>
            <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Loading Diagnostic Logs...</p>
            </div>
        </AdminLayout>
    )

    return (
        <AdminLayout>
            <div className="space-y-8 pb-16">
                <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
                    <div className="space-y-3">
                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-500/5 text-blue-600 text-[10px] font-black uppercase tracking-[0.2em]">
                            <Microscope className="w-3 h-3 mr-2" /> Central Diagnostics
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight text-nowrap">Laboratory Results</h1>
                        <p className="text-slate-500 font-medium">{tests.filter(t => t.status === "Pending").length} laboratory tests awaiting results</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                        <div className="relative w-full md:w-80">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input placeholder="Search test or patient..." className="pl-12 rounded-xl h-12 shadow-sm border-slate-100" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                        </div>
                        <Button className="h-12 px-6 rounded-xl bg-slate-900 hover:bg-primary text-white font-black text-[10px] uppercase tracking-widest gap-2">
                            <Plus className="w-4 h-4" /> New Lab Order
                        </Button>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex gap-2 p-1 bg-slate-100/50 w-fit rounded-2xl border border-slate-100">
                    {["all", "Pending", "Completed"].map((s) => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={cn(
                                "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                statusFilter === s ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            {s === "all" ? "All Tests" : s}
                        </button>
                    ))}
                </div>

                {/* Grid View */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map(test => (
                        <Card key={test._id} className="rounded-[2.5rem] border-2 border-slate-50 hover:border-primary/20 hover:shadow-2xl transition-all duration-500 group">
                            <CardContent className="p-8 space-y-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-lg group-hover:scale-110 transition-transform">
                                            <FlaskConical className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-slate-900 leading-tight">{test.testName}</h3>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{test.category}</p>
                                        </div>
                                    </div>
                                    {getStatusBadge(test.status)}
                                </div>

                                <div className="space-y-4">
                                    <div className="p-5 bg-slate-50/50 rounded-2xl border border-slate-50">
                                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2">Patient Information</p>
                                        <div className="flex items-center justify-between">
                                            <p className="font-bold text-slate-800">{test.patientName}</p>
                                            <p className="text-[10px] font-black text-slate-400">ID: {test.patientId}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Ordered By</p>
                                            <p className="font-bold text-xs text-slate-700">{test.orderedBy}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Order Date</p>
                                            <p className="font-bold text-xs text-slate-700">{test.orderDate}</p>
                                        </div>
                                    </div>
                                </div>

                                {test.status === "Completed" ? (
                                    <div className="pt-2 border-t border-slate-50">
                                        <div className="flex items-center justify-between p-4 bg-green-50/50 rounded-2xl mb-4 border border-green-50">
                                            <div>
                                                <p className="text-[9px] font-black text-green-600 uppercase tracking-widest mb-1">Result</p>
                                                <p className="text-sm font-black text-slate-900">{test.result}</p>
                                            </div>
                                            <CheckCircle className="w-5 h-5 text-green-500" />
                                        </div>
                                        <Button variant="outline" className="w-full h-12 rounded-xl text-[10px] font-black uppercase tracking-widest gap-2">
                                            <Eye className="w-4 h-4" /> View Full Report
                                        </Button>
                                    </div>
                                ) : (
                                    <Button
                                        className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black text-[11px] uppercase tracking-[0.1em] gap-2 shadow-xl shadow-primary/10 transition-all hover:scale-[1.02]"
                                        onClick={() => {
                                            setSelectedTest(test);
                                            setResult("");
                                            setReferenceRange(test.referenceRange || "");
                                            setNotes("");
                                            setIsUpdating(true);
                                        }}
                                    >
                                        Update Laboratory Result
                                        <ChevronRight className="w-4 h-4" />
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Update Result Dialog */}
            <Dialog open={isUpdating} onOpenChange={setIsUpdating}>
                <DialogContent className="rounded-[3rem] max-w-xl border-none p-0 overflow-hidden shadow-2xl">
                    <div className="bg-primary p-12 text-white relative">
                        <Microscope className="w-20 h-20 text-white opacity-20 absolute -top-4 -right-4 rotate-12" />
                        <h2 className="text-4xl font-black mb-1 tracking-tight">Post Result</h2>
                        <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.3em]">Patient: {selectedTest?.patientName}</p>
                        <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.3em] mt-1">Test: {selectedTest?.testName}</p>
                    </div>

                    <div className="p-10 space-y-6 bg-white">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Test Outcome</label>
                                <Input
                                    value={result}
                                    onChange={e => setResult(e.target.value)}
                                    placeholder="e.g. 140 mg/dL"
                                    className="h-14 rounded-2xl border-2 border-slate-50 bg-slate-50/50 px-6 font-bold"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Reference Range</label>
                                <Input
                                    value={referenceRange}
                                    onChange={e => setReferenceRange(e.target.value)}
                                    placeholder="e.g. 70-110 mg/dL"
                                    className="h-14 rounded-2xl border-2 border-slate-50 bg-slate-50/50 px-6 font-bold"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Clinical Remarks</label>
                            <Textarea
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                                placeholder="Enter any additional observations or notes..."
                                className="min-h-[120px] rounded-[2rem] border-2 border-slate-50 bg-slate-50/50 px-6 py-4 font-bold resize-none"
                            />
                        </div>

                        <div className="pt-6 flex flex-col gap-4">
                            <Button
                                onClick={handleUpdateResult}
                                className="h-20 rounded-[2rem] bg-slate-900 hover:bg-primary text-white font-black text-xs uppercase tracking-[0.2em] shadow-2xl transition-all hover:scale-[1.02]"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : "Authorize & Publish Result"}
                            </Button>
                            <Button variant="ghost" onClick={() => setIsUpdating(false)} className="rounded-xl text-slate-400 text-[10px] font-black uppercase tracking-widest h-12">Discard Protocol</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    )
}
