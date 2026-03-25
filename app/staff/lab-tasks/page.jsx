"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { StaffLayout } from "@/components/layouts/staff-layout"
import {
    Beaker,
    Search,
    Calendar,
    Clock,
    CheckCircle2,
    AlertCircle,
    ClipboardList,
    Stethoscope,
    FileEdit,
    ArrowRight,
    Filter,
    Loader2
} from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { toast } from "sonner"

export default function LabTechnicianDashboard() {
    const { token, user } = useAuth()
    const [tasks, setTasks] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
    const [activeStatus, setActiveStatus] = useState("Pending")
    const [selectedTask, setSelectedTask] = useState(null)
    const [reporting, setReporting] = useState(false)

    // Form State
    const [reportForm, setReportForm] = useState({
        result: "",
        referenceRange: "",
        notes: ""
    })

    useEffect(() => {
        if (token) fetchTasks()
    }, [token, selectedDate, activeStatus])

    const fetchTasks = async () => {
        try {
            setLoading(true)
            const res = await fetch(`/api/lab/tasks?date=${selectedDate}&status=${activeStatus}`, {
                headers: { "Authorization": `Bearer ${token}` }
            })
            const data = await res.json()
            if (res.ok) setTasks(data)
        } catch (error) {
            toast.error("Diagnostic sync failure")
        } finally {
            setLoading(false)
        }
    }

    const handleUpdateStatus = async (testId, status) => {
        try {
            const res = await fetch("/api/lab/tasks", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ testId, status })
            })
            if (res.ok) {
                toast.success(`Task marked as ${status}`)
                fetchTasks()
            }
        } catch (error) {
            toast.error("Status update failed")
        }
    }

    const handleFinalizeReport = async () => {
        if (!reportForm.result) {
            toast.error("Result findings are required")
            return
        }

        try {
            setReporting(true)
            const res = await fetch("/api/lab/tasks", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    testId: selectedTask._id,
                    status: "Completed",
                    ...reportForm
                })
            })
            if (res.ok) {
                toast.success("Diagnostic report finalized")
                setSelectedTask(null)
                setReportForm({ result: "", referenceRange: "", notes: "" })
                fetchTasks()
            }
        } catch (error) {
            toast.error("Report finalization failed")
        } finally {
            setReporting(false)
        }
    }

    const filteredTasks = tasks.filter(t =>
        t.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.testName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t._id.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const getStatusBadge = (status) => {
        switch (status) {
            case "Pending": return <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-100 font-bold uppercase text-[10px]">Pending Collection</Badge>
            case "In Progress": return <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-100 font-bold uppercase text-[10px]">Processing</Badge>
            case "Completed": return <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-100 font-bold uppercase text-[10px]">Report Finalized</Badge>
            default: return <Badge variant="outline">{status}</Badge>
        }
    }

    return (
        <StaffLayout>
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-slate-900 rounded-xl">
                                <Beaker className="h-4 w-4 text-white" />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Diagnostic Lifecycle</p>
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Diagnostic Station</h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="pl-12 h-12 rounded-2xl border-slate-100 bg-white shadow-sm font-bold text-xs"
                            />
                        </div>
                    </div>
                </div>

                {/* Filters & Search */}
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                        <Input
                            placeholder="Search by Patient Name, ID, or Investigation..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-12 h-14 rounded-3xl border-slate-100 bg-white shadow-sm focus:ring-primary focus:border-primary text-sm font-medium"
                        />
                    </div>

                    <Tabs value={activeStatus} onValueChange={setActiveStatus} className="w-full lg:w-auto">
                        <TabsList className="bg-white border border-slate-100 p-1.5 rounded-[2rem] h-14 shadow-sm w-full lg:w-auto">
                            <TabsTrigger value="Pending" className="rounded-[1.5rem] px-8 h-full data-[state=active]:bg-amber-50 data-[state=active]:text-amber-600 font-black text-[10px] uppercase tracking-widest">
                                Assigned
                            </TabsTrigger>
                            <TabsTrigger value="In Progress" className="rounded-[1.5rem] px-8 h-full data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 font-black text-[10px] uppercase tracking-widest">
                                Processing
                            </TabsTrigger>
                            <TabsTrigger value="Completed" className="rounded-[1.5rem] px-8 h-full data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-600 font-black text-[10px] uppercase tracking-widest">
                                Records
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                {/* Task Grid */}
                {loading ? (
                    <div className="h-[400px] flex items-center justify-center">
                        <div className="text-center space-y-4">
                            <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto opacity-50" />
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Syncing Investigations</p>
                        </div>
                    </div>
                ) : filteredTasks.length === 0 ? (
                    <Card className="rounded-[3rem] border-dashed border-slate-200 bg-slate-50/50">
                        <CardContent className="p-24 text-center">
                            <ClipboardList className="h-16 w-16 text-slate-300 mx-auto mb-6 opacity-20" />
                            <h3 className="text-2xl font-black text-slate-400">Diagnostic station is clear</h3>
                            <p className="text-slate-400 text-xs mt-2 font-medium tracking-wide">No tests found for the selected criteria.</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        {filteredTasks.map((task) => (
                            <Card key={task._id} className="rounded-[2.5rem] border-none shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden bg-white/80 backdrop-blur-sm group">
                                <div className="p-8">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex gap-4">
                                            <div className="bg-slate-900 rounded-2xl p-4 text-white shadow-lg group-hover:scale-110 transition-transform">
                                                <Stethoscope className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="text-xl font-bold text-slate-900">{task.patientName}</h3>
                                                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-tighter decoration-primary decoration-2 ml-2">ID: {task._id}</span>
                                                </div>
                                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">ORDERED BY <span className="text-slate-900 tracking-widest font-bold">{task.orderedBy}</span></p>
                                            </div>
                                        </div>
                                        {getStatusBadge(task.status)}
                                    </div>

                                    <div className="space-y-4 mb-8 bg-slate-50/50 rounded-[2rem] p-6 border border-slate-100">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Investigation</span>
                                            <span className="text-sm font-black text-slate-900">{task.testName}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</span>
                                            <Badge variant="secondary" className="bg-white border-slate-100 text-[10px] font-black uppercase px-3 py-1">{task.category}</Badge>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Received</span>
                                            <span className="text-[10px] font-bold text-slate-600">{new Date(task.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        {task.status === "Pending" && (
                                            <Button
                                                className="flex-1 rounded-2xl h-12 bg-slate-900 hover:bg-primary transition-all font-black text-[10px] uppercase tracking-widest shadow-lg"
                                                onClick={() => handleUpdateStatus(task._id, "In Progress")}
                                            >
                                                Start Processing
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </Button>
                                        )}
                                        {task.status === "In Progress" && (
                                            <Button
                                                className="flex-1 rounded-2xl h-12 bg-blue-600 hover:bg-blue-700 transition-all font-black text-[10px] uppercase tracking-widest shadow-lg"
                                                onClick={() => setSelectedTask(task)}
                                            >
                                                Add Clinical Report
                                                <FileEdit className="ml-2 h-4 w-4" />
                                            </Button>
                                        )}
                                        {task.status === "Completed" && (
                                            <Button
                                                variant="outline"
                                                className="flex-1 rounded-2xl h-12 border-slate-100 bg-slate-50 hover:bg-white transition-all font-black text-[10px] uppercase tracking-widest"
                                                onClick={() => setSelectedTask(task)}
                                            >
                                                View Final Report
                                                <CheckCircle2 className="ml-2 h-4 w-4 text-emerald-500" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Report Generation Modal */}
                <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
                    <DialogContent className="sm:max-w-[600px] rounded-[3rem] p-0 overflow-hidden border-none shadow-2xl">
                        <div className="bg-slate-900 p-8 text-white">
                            <DialogHeader>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                                        <FileEdit className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <DialogTitle className="text-2xl font-black">Clinical Report Entry</DialogTitle>
                                        <DialogDescription className="text-white/60 font-medium">Finalizing results for {selectedTask?.patientName}</DialogDescription>
                                    </div>
                                </div>
                            </DialogHeader>
                        </div>

                        <div className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Investigation</Label>
                                    <div className="p-4 bg-slate-50 rounded-2xl font-bold text-sm border border-slate-100">{selectedTask?.testName}</div>
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Category</Label>
                                    <div className="p-4 bg-slate-50 rounded-2xl font-bold text-sm border border-slate-100">{selectedTask?.category}</div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Diagnostic Findings / Result</Label>
                                <Input
                                    placeholder="Enter numerical values or brief findings..."
                                    value={reportForm.result}
                                    onChange={(e) => setReportForm({ ...reportForm, result: e.target.value })}
                                    className="h-14 rounded-2xl border-slate-100 bg-white shadow-sm focus:ring-primary font-bold text-sm"
                                    disabled={selectedTask?.status === "Completed"}
                                />
                                {selectedTask?.status === "Completed" && <div className="p-4 bg-slate-50 rounded-2xl font-bold text-sm border border-slate-100">{selectedTask?.result}</div>}
                            </div>

                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Normal Reference Range</Label>
                                <Input
                                    placeholder="e.g., 4.5 - 11.0 K/uL"
                                    value={reportForm.referenceRange}
                                    onChange={(e) => setReportForm({ ...reportForm, referenceRange: e.target.value })}
                                    className="h-14 rounded-2xl border-slate-100 bg-white shadow-sm focus:ring-primary font-bold text-sm"
                                    disabled={selectedTask?.status === "Completed"}
                                />
                                {selectedTask?.status === "Completed" && <div className="p-4 bg-slate-50 rounded-2xl font-bold text-sm border border-slate-100">{selectedTask?.referenceRange}</div>}
                            </div>

                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Additional Clinical Notes</Label>
                                <Textarea
                                    placeholder="Add any specific observations or critical alerts..."
                                    value={reportForm.notes}
                                    onChange={(e) => setReportForm({ ...reportForm, notes: e.target.value })}
                                    className="min-h-[120px] rounded-[2rem] border-slate-100 bg-white shadow-sm focus:ring-primary font-medium text-sm p-6"
                                    disabled={selectedTask?.status === "Completed"}
                                />
                                {selectedTask?.status === "Completed" && <div className="p-6 bg-slate-50 rounded-[2rem] font-medium text-sm border border-slate-100">{selectedTask?.notes}</div>}
                            </div>

                            {selectedTask?.status !== "Completed" && (
                                <DialogFooter className="pt-4">
                                    <Button
                                        variant="outline"
                                        className="rounded-2xl h-14 px-8 border-slate-100 font-black text-[10px] uppercase tracking-widest"
                                        onClick={() => setSelectedTask(null)}
                                    >
                                        Discard
                                    </Button>
                                    <Button
                                        className="rounded-2xl h-14 px-12 bg-slate-900 hover:bg-primary transition-all font-black text-[10px] uppercase tracking-widest shadow-lg"
                                        onClick={handleFinalizeReport}
                                        disabled={reporting}
                                    >
                                        {reporting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Finalize Clinical Report"}
                                    </Button>
                                </DialogFooter>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </StaffLayout>
    )
}
