"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/components/auth/auth-provider"
import { DoctorLayout } from "@/components/layouts/doctor-layout"
import {
  Users,
  Calendar,
  Clock,
  Clipboard,
  Activity,
  CheckCircle2,
  AlertCircle,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Stethoscope,
  TrendingUp,
  Mail,
  Phone,
  Video,
  Pill,
  Loader2,
  ChevronRight,
  Check,
  ChevronsUpDown,
  Trash2,
  ShoppingCart,
  FileText,
  Hospital
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export default function DoctorDashboard() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [patients, setPatients] = useState([])
  const [medicines, setMedicines] = useState([])
  const [loading, setLoading] = useState(true)
  const [isPrescribing, setIsPrescribing] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [isComboboxOpen, setIsComboboxOpen] = useState(false)
  const [protocolQueue, setProtocolQueue] = useState([])
  const [medSearch, setMedSearch] = useState("")
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [opdQueue, setOpdQueue] = useState([])
  const [isConsulting, setIsConsulting] = useState(false)
  const [consultForm, setConsultForm] = useState({
    diagnosis: "",
    condition: "Neutral",
    admitRequested: false,
    wardType: "General Ward",
    tests: [],
    followUpDate: ""
  })
  const [masterDiagnostics, setMasterDiagnostics] = useState([
    { _id: "DIAG001", name: "Complete Blood Count (CBC)", category: "Hematology", price: 500 },
    { _id: "DIAG002", name: "Blood Glucose (Fasting)", category: "Biochemistry", price: 150 },
    { _id: "DIAG003", name: "Blood Glucose (Post-Prandial)", category: "Biochemistry", price: 150 },
    { _id: "DIAG004", name: "Liver Function Test (LFT)", category: "Biochemistry", price: 1200 },
    { _id: "DIAG005", name: "Kidney Function Test (KFT)", category: "Biochemistry", price: 1000 },
    { _id: "DIAG006", name: "Lipid Profile", category: "Biochemistry", price: 800 },
    { _id: "DIAG007", name: "HbA1c", category: "Biochemistry", price: 550 },
    { _id: "DIAG008", name: "Serum Electrolytes", category: "Biochemistry", price: 700 },
    { _id: "DIAG014", name: "X-Ray Chest PA View", category: "Radiology", price: 600 },
    { _id: "DIAG015", name: "USG Abdomen & Pelvis", category: "Radiology", price: 1500 },
    { _id: "DIAG016", name: "CT Scan Brain (Plain)", category: "Radiology", price: 3500 },
    { _id: "DIAG017", name: "MRI Brain (Plain)", category: "Radiology", price: 7500 },
    { _id: "DIAG018", name: "ECG (12-Lead)", category: "Cardiology", price: 300 },
    { _id: "DIAG019", name: "Echocardiogram", category: "Cardiology", price: 2500 }
  ])
  const [diagSearch, setDiagSearch] = useState("")
  const [pendingTest, setPendingTest] = useState(null)
  const ANATOMICAL_MAP = {
    "X-Ray": ["Chest PA", "Abdomen", "KUB", "Hand (L)", "Hand (R)", "Foot (L)", "Foot (R)", "Knee (L)", "Knee (R)", "Cervical Spine", "Lumbar Spine"],
    "USG": ["Abdomen & Pelvis", "Whole Abdomen", "Thyroid", "KUB", "Follicular Study", "Scrotum", "Neck"],
    "CT Scan": ["Brain", "HRCT Chest", "Abdomen (CECT)", "NCCT Abdomen", "Whole Body", "PNC"],
    "MRI": ["Brain", "Spine (Cervical)", "Spine (Lumbar)", "Knee", "Shoulder"]
  }
  const [prescriptionForm, setPrescriptionForm] = useState({
    medicineId: "",
    quantity: 1,
    dosage: "1-0-1",
    shift: "Morning",
    duration: "5 days",
    instructions: "After food"
  })

  useEffect(() => {
    if (user) {
      fetchDoctorData()
      fetchMedicines()
      fetchOPDQueue()
      fetchMasterDiagnostics()
    }
  }, [user])

  const fetchOPDQueue = async () => {
    try {
      const res = await fetch(`/api/doctor/opd?doctorId=${user?.userId || 'DOC002'}`)
      const data = await res.json()
      setOpdQueue(data)
    } catch (e) { console.error(e) }
  }

  const fetchMasterDiagnostics = async () => {
    try {
      const res = await fetch("/api/admin/master-diagnostics")
      const data = await res.json()
      if (data && data.length > 0) setMasterDiagnostics(data)
    } catch (e) { console.error("Diagnostic Registry Sync Error:", e) }
  }

  const fetchDoctorData = async () => {
    try {
      const res = await fetch("/api/admin/admitted")
      const data = await res.json()

      const today = new Date().toISOString().split('T')[0]

      // Filter for active, department-specific patients
      const activeInpatients = data.filter(p =>
        p.status !== "Discharged" &&
        p.isShifted !== false &&
        (!user?.specialization || p.department === user.specialization)
      )

      // Fetch real appointments for the summary (Today only)
      let todayAppointments = []
      try {
        const appRes = await fetch("/api/appointments", {
          headers: { "Authorization": `Bearer ${localStorage.getItem("token") || ''}` }
        })
        const appData = await appRes.json()
        todayAppointments = appData.filter(a => a.date === today)
      } catch (err) {
        console.error("Dashboard Appointment Sync Error:", err)
      }

      setAppointments(todayAppointments.length > 0 ? todayAppointments : activeInpatients.slice(0, 3).map(p => ({
        id: p._id,
        patientName: p.name,
        time: "10:30 AM",
        status: "In-Ward",
        reason: p.condition,
        priority: "Normal",
        vitals: "98.6°F | 72 BPM | 120/80 BP"
      })))

      setPatients(activeInpatients)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching doctor data:", error)
      setLoading(false)
    }
  }

  const fetchMedicines = async () => {
    try {
      const res = await fetch("/api/admin/medicines")
      const data = await res.json()
      setMedicines(data)
    } catch (e) { console.error(e) }
  }

  const handlePrescribe = async () => {
    if (!prescriptionForm.medicineId || !selectedPatient) {
      toast.error("Please select a medicine")
      return
    }

    try {
      const selectedMed = medicines.find(m => m._id === prescriptionForm.medicineId)

      const res = await fetch("/api/doctor/prescriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: selectedPatient._id,
          patientName: selectedPatient.name,
          doctorId: user?.userId,
          doctorName: user?.name,
          medicineId: selectedMed._id,
          medicineName: selectedMed.name,
          ...prescriptionForm
        })
      })

      if (res.ok) {
        toast.success(`Prescription issued for ${selectedPatient.name}. Stock updated!`)
        setIsPrescribing(false)
        setPrescriptionForm({ ...prescriptionForm, medicineId: "" })
        fetchMedicines()
      } else {
        const err = await res.json()
        toast.error(err.error || "Failed to issue prescription")
      }
    } catch (e) {
      toast.error("An error occurred")
    }
  }

  const addToProtocolQueue = () => {
    if (!prescriptionForm.medicineId) return toast.error("Select a medicine first")
    const med = medicines.find(m => m._id === prescriptionForm.medicineId)
    if (!med) return

    const newItem = {
      _id: `PQ-${Date.now()}`,
      medicineId: med._id,
      medicineName: med.name,
      quantity: prescriptionForm.quantity,
      dosage: prescriptionForm.dosage,
      shift: prescriptionForm.shift,
      duration: prescriptionForm.duration,
      date: new Date().toLocaleDateString('en-IN'),
      instructions: prescriptionForm.instructions,
      unit: med.unit
    }

    setProtocolQueue([...protocolQueue, newItem])
    setPrescriptionForm({ ...prescriptionForm, medicineId: "", duration: "5 days" })
    setMedSearch("")
    toast.success(`Added ${med.name} to protocol list`)
  }

  const handleProtocolSubmit = async () => {
    if (protocolQueue.length === 0) return toast.error("Add at least one item to the protocol")
    setLoading(true)

    try {
      const res = await fetch("/api/doctor/daily-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: selectedPatient._id,
          items: protocolQueue
        })
      })

      if (res.ok) {
        toast.success(`Authorized protocol for ${selectedPatient.name}`)
        setIsPrescribing(false)
        setProtocolQueue([])
        fetchDoctorData()
      } else {
        toast.error("Failed to authorize protocol")
      }
    } catch (e) {
      toast.error("Failed to submit protocol")
    } finally {
      setLoading(false)
    }
  }

  const handleAddToPlan = async () => {
    if (!prescriptionForm.medicineId || !selectedPatient) {
      toast.error("Please select a medicine")
      return
    }

    try {
      const selectedMed = medicines.find(m => m._id === prescriptionForm.medicineId)
      const res = await fetch("/api/doctor/daily-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: selectedPatient._id,
          medicineId: selectedMed._id,
          medicineName: selectedMed.name,
          quantity: prescriptionForm.quantity,
          dosage: prescriptionForm.dosage,
          instructions: prescriptionForm.instructions,
          unit: selectedMed.unit
        })
      })

      if (res.ok) {
        toast.success(`Dose added to ${selectedPatient.name}'s daily plan!`)
        setIsPrescribing(false)
        setPrescriptionForm({ ...prescriptionForm, medicineId: "" })
        fetchDoctorData()
      } else {
        toast.error("Failed to add to plan")
      }
    } catch (e) {
      toast.error("An error occurred")
    }
  }

  const handleConsultSubmit = async () => {
    if (!consultForm.diagnosis) return toast.error("Please enter diagnosis")
    setLoading(true)

    try {
      const res = await fetch("/api/doctor/consult", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: selectedPatient._id,
          doctorId: user?.userId || 'DOC002',
          ...consultForm,
          prescription: protocolQueue // Batch prescriptions from the cart
        })
      })

      if (res.ok) {
        toast.success(consultForm.admitRequested ? "Patient admitted to ward!" : "Consultation completed")
        setIsConsulting(false)
        setProtocolQueue([])
        setConsultForm({ diagnosis: "", condition: "Neutral", admitRequested: false, wardType: "General Ward", tests: [] })
        fetchOPDQueue()
        fetchDoctorData()
      } else {
        toast.error("Failed to submit consultation")
      }
    } catch (e) {
      toast.error("Error submitting consultation")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <DoctorLayout>
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Initializing Clinical Terminal</p>
        </div>
      </DoctorLayout>
    )
  }

  const selectedMedicine = medicines.find((med) => med._id === prescriptionForm.medicineId)

  return (
    <DoctorLayout>
      <div className="space-y-10 pb-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/5 text-primary text-[10px] font-black uppercase tracking-[0.2em]">
              Medical Registry: {user?.id || "DR-402-A"}
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Clinical Workspace</h1>
            <p className="text-slate-500 font-medium tracking-tight italic">Namaste Dr. {user?.name}. Managing <span className="text-primary font-bold">{patients.length} active patients</span> in the hospital.</p>
          </div>
          <div className="flex gap-4">
            <Button size="lg" className="h-14 px-8 rounded-2xl bg-primary shadow-xl shadow-primary/20 font-black text-xs uppercase tracking-widest group">
              <Plus className="w-5 h-5 mr-3 group-hover:rotate-90 transition-transform" />
              New Consultation
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: "Active Patients", val: patients.length, icon: <Users className="w-6 h-6" />, color: "bg-blue-50 text-blue-600", trend: "Ward Monitoring" },
            { label: "Critical Alerts", val: patients.filter(p => (p.condition || "").toLowerCase().includes('critical')).length, icon: <AlertCircle className="w-6 h-6" />, color: "bg-red-50 text-red-600", trend: "Urgent Attention" },
            { label: "Prescriptions", val: "12", icon: <Pill className="w-6 h-6" />, color: "bg-amber-50 text-amber-600", trend: "Deducted from Stock" },
            { label: "Efficiency", val: "98%", icon: <TrendingUp className="w-6 h-6" />, color: "bg-primary/5 text-primary", trend: "Excellent" },
          ].map((stat, i) => (
            <Card key={i} className="bg-white border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm group hover:shadow-xl transition-all">
              <CardContent className="p-8 pb-6">
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 mb-6", stat.color)}>
                  {stat.icon}
                </div>
                <div className="space-y-1">
                  <h3 className="text-4xl font-black text-slate-900">{stat.val}</h3>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">{stat.label}</p>
                </div>
                <div className="pt-6 mt-6 border-t border-slate-50 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <Clock className="w-3.5 h-3.5" />
                  {stat.trend}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="patients" className="space-y-8">
          <TabsList className="bg-slate-50/80 p-1.5 rounded-2xl border border-slate-100 w-full md:w-fit">
            <TabsTrigger value="patients" className="rounded-xl px-10 py-3 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm font-black text-xs uppercase tracking-widest transition-all">Ward Patients</TabsTrigger>
            <TabsTrigger value="opd" className="rounded-xl px-10 py-3 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm font-black text-xs uppercase tracking-widest transition-all gap-2">
              OPD Queue
              {opdQueue.length > 0 && <Badge className="bg-primary text-white text-[10px] h-5 w-5 p-0 flex items-center justify-center rounded-full">{opdQueue.length}</Badge>}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="patients" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {patients.map(p => (
                <Card key={p._id} className="bg-white border-slate-100 rounded-[2.5rem] hover:shadow-xl transition-all group overflow-hidden border-2 hover:border-primary/20">
                  <CardContent className="p-8">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-6">
                        <div className="w-20 h-20 rounded-3xl bg-slate-100 flex items-center justify-center text-slate-400 text-2xl font-black border-4 border-white shadow-lg overflow-hidden group-hover:scale-105 transition-transform">
                          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${p.name}`} alt="" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-2xl font-black text-slate-900">{p.name}</h4>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[10px] font-bold border-none bg-slate-50 text-slate-400 tracking-widest px-0">BED: {p.bed}</Badge>
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{p.department}</p>
                          </div>
                        </div>
                      </div>
                      <Badge className={cn("px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest",
                        (p.condition || "").toLowerCase().includes('critical') ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"
                      )}>{p.condition}</Badge>
                    </div>

                    {/* DAILY MEDICATION ORDERS (Grouped by Shift) */}
                    <div className="mb-8 space-y-6">
                      <div className="flex items-center justify-between">
                        <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Daily Protocol ({new Date().toLocaleDateString('en-IN')})</h5>
                        <Badge variant="outline" className="text-[9px] font-bold text-primary border-primary/20">{p.dailyMedicationPlan?.length || 0} Ordered</Badge>
                      </div>

                      {p.dailyMedicationPlan && p.dailyMedicationPlan.length > 0 ? (
                        <div className="space-y-6">
                          {["Morning", "Afternoon", "Evening", "Night"].map(shift => {
                            const shiftItems = p.dailyMedicationPlan.filter(i => i.shift === shift || (!i.shift && shift === "Morning"))
                            if (shiftItems.length === 0) return null
                            return (
                              <div key={shift} className="space-y-3">
                                <div className="flex items-center gap-3">
                                  <div className="h-px flex-1 bg-slate-100" />
                                  <span className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-300">{shift} Shift</span>
                                  <div className="h-px flex-1 bg-slate-100" />
                                </div>
                                <div className="space-y-2">
                                  {shiftItems.map((item) => (
                                    <div key={item._id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 group/item">
                                      <div className="flex items-center gap-4">
                                        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-primary shadow-sm border border-slate-50">
                                          <Pill className="w-4 h-4" />
                                        </div>
                                        <div>
                                          <p className="text-sm font-bold text-slate-900">{item.medicineName}</p>
                                          <p className="text-[10px] text-slate-400 font-medium">{item.dosage} · {item.quantity} {item.unit} · {item.instructions}</p>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-3">
                                        <Badge className={cn("text-[8px] font-black uppercase tracking-widest",
                                          item.status === "pending" ? "bg-amber-50 text-amber-600" : "bg-green-50 text-green-600"
                                        )}>{item.status}</Badge>
                                        <Button
                                          variant="ghost" size="icon"
                                          className="h-8 w-8 text-slate-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover/item:opacity-100 transition-all"
                                          onClick={() => handleRemoveFromPlan(p._id, item._id)}
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </Button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        <div className="py-8 text-center border-2 border-dashed border-slate-100 rounded-[2rem]">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">No active daily plan</p>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-4">
                      <Button
                        onClick={() => { setSelectedPatient(p); setIsPrescribing(true); }}
                        className="flex-1 h-14 rounded-2xl bg-slate-900 hover:bg-primary text-white font-black text-[10px] uppercase tracking-widest transition-all gap-3"
                      >
                        <Pill className="w-4 h-4" />
                        Prescribe Medicine
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => { setSelectedPatient(p); setIsHistoryOpen(true); }}
                        className="h-14 w-15 px-6 rounded-2xl border-slate-100 hover:bg-slate-50 transition-all font-black text-[10px] uppercase tracking-widest"
                      >
                        History
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="opd" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(opdQueue || []).map((p) => (
                <Card key={p._id} className="bg-white border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl transition-all group border-t-4 border-t-primary">
                  <CardContent className="p-8">
                    <div className="flex items-start justify-between mb-6">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-primary/10 text-primary text-[8px] font-black tracking-widest uppercase px-2">OPD-REG</Badge>
                          <Badge variant="outline" className="text-[8px] font-bold text-slate-400">{p.gender} · {p.age}y</Badge>
                        </div>
                        <h3 className="text-xl font-black text-slate-900 leading-tight">{p.name}</h3>
                      </div>
                      <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all">
                        <Stethoscope className="w-6 h-6" />
                      </div>
                    </div>

                    <div className="space-y-4 mb-8">
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Reason for Visit</p>
                        <p className="text-xs font-bold text-slate-700">{p.reason}</p>
                      </div>
                      <div className="flex items-center gap-3 text-slate-500">
                        <Clock className="w-4 h-4 text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Registered {new Date(p.registeredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>

                    <Button
                      onClick={() => { setSelectedPatient(p); setIsConsulting(true); }}
                      className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-primary text-white font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-slate-200"
                    >
                      Start Consultation
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
            {(opdQueue || []).length === 0 && (
              <div className="py-20 text-center flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-[3rem] bg-slate-50/50">
                <Users className="w-16 h-16 text-slate-200 mb-4" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Queue is empty · No patients waiting</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* NEW PRESCRIPTION DIALOG */}
      <Dialog open={isPrescribing} onOpenChange={(open) => { setIsPrescribing(open); if (!open) { setProtocolQueue([]); setMedSearch(""); } }}>
        <DialogContent className="rounded-[3rem] max-w-4xl border-none p-0 overflow-hidden shadow-2xl">
          <div className="bg-slate-900 p-8 text-white relative">
            <Pill className="w-16 h-16 text-primary opacity-20 absolute -top-4 -right-4 rotate-12" />
            <h2 className="text-3xl font-black mb-1 tracking-tight">E-Prescription</h2>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">Patient: <span className="text-white tracking-widest">{selectedPatient?.name}</span></p>
          </div>

          <div className="p-8 grid md:grid-cols-2 gap-8 bg-white max-h-[85vh] overflow-y-auto">
            {/* Left Column: Medicine Selector */}
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Search & Select Medicine</label>
                <div className="relative group/search">
                  <Input
                    placeholder="Search medicine name..."
                    value={medSearch}
                    onChange={(e) => setMedSearch(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') e.preventDefault() }}
                    className="h-14 rounded-2xl border-2 border-slate-50 bg-slate-50/50 px-6 font-bold text-slate-700 focus:bg-white focus:border-primary/20 transition-all text-sm"
                  />
                </div>

                <div className="max-h-[220px] overflow-y-auto rounded-2xl border-2 border-slate-50 divide-y divide-slate-50">
                  {medicines.filter(m =>
                    m.name.toLowerCase().includes(medSearch.toLowerCase()) ||
                    m.category.toLowerCase().includes(medSearch.toLowerCase())
                  ).map((med) => (
                    <div
                      key={med._id}
                      onClick={() => setPrescriptionForm({ ...prescriptionForm, medicineId: med._id })}
                      className={cn(
                        "p-4 cursor-pointer transition-all flex items-center justify-between group/med",
                        prescriptionForm.medicineId === med._id ? "bg-primary/5" : "hover:bg-slate-50"
                      )}
                    >
                      <div className="flex flex-col">
                        <span className={cn("text-xs font-black tracking-tight", prescriptionForm.medicineId === med._id ? "text-primary" : "text-slate-600")}>{med.name}</span>
                        <span className="text-[9px] text-slate-400 uppercase font-bold tracking-widest">{med.category} · {med.stock} {med.unit}</span>
                      </div>
                      {prescriptionForm.medicineId === med._id && <Check className="w-4 h-4 text-primary" />}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Quantity</label>
                  <Input
                    type="number"
                    value={prescriptionForm.quantity}
                    onChange={(e) => setPrescriptionForm({ ...prescriptionForm, quantity: e.target.value })}
                    className="h-14 rounded-2xl border-2 border-slate-50 bg-slate-50/50 px-6 font-black text-slate-900"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Daily Shift</label>
                  <Select
                    value={prescriptionForm.shift}
                    onValueChange={(v) => setPrescriptionForm({ ...prescriptionForm, shift: v })}
                  >
                    <SelectTrigger className="h-14 rounded-2xl border-2 border-slate-50 bg-slate-50/50 px-6 font-black text-slate-900">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-slate-100">
                      <SelectItem value="Morning" className="font-bold">Morning</SelectItem>
                      <SelectItem value="Afternoon" className="font-bold">Afternoon</SelectItem>
                      <SelectItem value="Evening" className="font-bold">Evening</SelectItem>
                      <SelectItem value="Night" className="font-bold">Night</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Dosage</label>
                  <Select
                    value={prescriptionForm.dosage}
                    onValueChange={(v) => setPrescriptionForm({ ...prescriptionForm, dosage: v })}
                  >
                    <SelectTrigger className="h-14 rounded-2xl border-2 border-slate-50 bg-slate-50/50 px-6 font-black text-slate-900">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-slate-100">
                      <SelectItem value="1-0-1" className="font-bold">1-0-1</SelectItem>
                      <SelectItem value="1-1-1" className="font-bold">1-1-1</SelectItem>
                      <SelectItem value="1-0-0" className="font-bold">1-0-0</SelectItem>
                      <SelectItem value="0-0-1" className="font-bold">0-0-1</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Duration</label>
                  <Input
                    value={prescriptionForm.duration}
                    onChange={(e) => setPrescriptionForm({ ...prescriptionForm, duration: e.target.value })}
                    placeholder="e.g. 5 days"
                    className="h-14 rounded-2xl border-2 border-slate-100 bg-white px-6 font-black text-slate-900"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Instructions</label>
                  <Select
                    value={prescriptionForm.instructions}
                    onValueChange={(v) => setPrescriptionForm({ ...prescriptionForm, instructions: v })}
                  >
                    <SelectTrigger className="h-14 rounded-2xl border-2 border-slate-100 bg-white px-6 font-black text-slate-900">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-slate-100">
                      <SelectItem value="After food" className="font-bold">After food</SelectItem>
                      <SelectItem value="Before food" className="font-bold">Before food</SelectItem>
                      <SelectItem value="Empty stomach" className="font-bold">Empty stomach</SelectItem>
                      <SelectItem value="At bedtime" className="font-bold">At bedtime</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                type="button"
                onClick={addToProtocolQueue}
                className="w-full h-14 rounded-2xl border-2 border-primary/20 bg-primary/5 hover:bg-primary text-primary hover:text-white font-black text-[10px] uppercase tracking-[0.2em] transition-all gap-2"
              >
                Add to Protocol List
              </Button>
            </div>

            {/* Right Column: Protocol Cart */}
            <div className="bg-slate-50 rounded-[2.5rem] p-8 space-y-6 flex flex-col">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Protocol Preview</h3>
                <Badge variant="outline" className="text-[9px] font-black text-primary border-primary/20">{protocolQueue.length} items</Badge>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto max-h-[400px]">
                {protocolQueue.length > 0 ? (
                  protocolQueue.map((item, idx) => (
                    <div key={idx} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between group/qitem">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                          <Pill className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900">{item.medicineName}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{item.dosage} · Qty: {item.quantity} · {item.duration} · {item.shift}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost" size="icon"
                        onClick={() => setProtocolQueue(protocolQueue.filter((_, i) => i !== idx))}
                        className="h-8 w-8 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-lg group-hover/qitem:opacity-100 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-slate-200 rounded-[2.5rem]">
                    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-300 mb-4">
                      <ShoppingCart className="w-8 h-8" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Queue is empty</p>
                  </div>
                )}
              </div>

              <div className="pt-4 flex flex-col gap-3">
                <Button
                  type="button"
                  onClick={handleProtocolSubmit}
                  disabled={protocolQueue.length === 0}
                  className="h-16 rounded-[1.5rem] bg-slate-900 hover:bg-primary text-white font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-slate-200 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                >
                  Sign & Digitalize Protocol
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsPrescribing(false)}
                  className="font-black text-[10px] text-slate-400 uppercase tracking-widest hover:text-slate-600"
                >
                  Discard Protocol
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* OPD CONSULTATION DIALOG */}
      <Dialog open={isConsulting} onOpenChange={setIsConsulting}>
        <DialogContent className="rounded-[3rem] max-w-4xl border-none p-0 overflow-hidden shadow-2xl">
          <div className="bg-primary p-12 text-white relative">
            <Stethoscope className="w-20 h-20 text-white opacity-20 absolute -top-4 -right-4 rotate-12" />
            <h2 className="text-4xl font-black mb-1 tracking-tight text-white">OPD Consultation</h2>
            <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.3em]">Patient: <span className="text-white tracking-widest">{selectedPatient?.name}</span></p>
          </div>

          <div className="p-10 space-y-8 bg-white max-h-[80vh] overflow-y-auto">
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 ml-1">Clinical Assessment</label>
              <textarea
                value={consultForm.diagnosis}
                onChange={e => setConsultForm({ ...consultForm, diagnosis: e.target.value })}
                placeholder="Enter patient diagnosis and medical remarks..."
                className="w-full min-h-[140px] rounded-[2rem] border-2 border-slate-50 bg-slate-50/50 px-8 py-6 font-bold text-slate-700 focus:bg-white focus:border-primary/20 transition-all text-sm resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 ml-1">Emergency Admission</label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={consultForm.admitRequested ? "default" : "outline"}
                    className={cn("flex-1 h-16 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all", consultForm.admitRequested && "bg-red-500 hover:bg-red-600")}
                    onClick={() => setConsultForm({ ...consultForm, admitRequested: !consultForm.admitRequested })}
                  >
                    {consultForm.admitRequested ? "Cancel Admission" : "Request Admission"}
                  </Button>
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 ml-1">Waitlist Priority</label>
                <Select
                  value={consultForm.condition}
                  onValueChange={v => setConsultForm({ ...consultForm, condition: v })}
                >
                  <SelectTrigger className="h-16 rounded-2xl border-2 border-slate-50 bg-slate-50/50 px-8 font-black text-slate-900">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-slate-100">
                    <SelectItem value="Stable" className="font-bold">Stable</SelectItem>
                    <SelectItem value="Critical" className="font-bold">Critical</SelectItem>
                    <SelectItem value="Serious" className="font-bold text-red-500">Serious Condition</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Diagnostic Investigations</label>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search tests..."
                    className="h-10 pl-10 rounded-xl"
                    value={diagSearch}
                    onChange={e => setDiagSearch(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') e.preventDefault() }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[180px] overflow-y-auto p-1">
                {masterDiagnostics.filter(d =>
                  d.name.toLowerCase().includes(diagSearch.toLowerCase()) ||
                  d.category.toLowerCase().includes(diagSearch.toLowerCase())
                ).map(d => (
                  <Button
                    type="button"
                    key={d._id}
                    variant={consultForm.tests.includes(d.name) ? "default" : "outline"}
                    className={cn(
                      "h-auto py-3 px-4 rounded-2xl justify-start text-left flex flex-col items-start gap-1 transition-all",
                      consultForm.tests.includes(d.name) ? "bg-primary border-primary" : "hover:border-primary/50"
                    )}
                    onClick={() => {
                      const needsPart = Object.keys(ANATOMICAL_MAP).find(key => d.name.startsWith(key))
                      if (needsPart) {
                        setPendingTest({ ...d, mapKey: needsPart })
                      } else {
                        const updated = consultForm.tests.includes(d.name)
                          ? consultForm.tests.filter(t => t !== d.name)
                          : [...consultForm.tests, d.name];
                        setConsultForm({ ...consultForm, tests: updated });
                      }
                    }}
                  >
                    <span className="text-[10px] font-black leading-tight uppercase tracking-tight">{d.name}</span>
                    <span className={cn("text-[8px] font-bold uppercase opacity-60", consultForm.tests.includes(d.name) ? "text-white" : "text-slate-400")}>{d.category}</span>
                  </Button>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex flex-col gap-4">
              <div className="flex items-center justify-between px-2">
                <div className="space-y-0.5">
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Medication Protocol</p>
                  <p className="text-[8px] font-bold text-slate-400">{protocolQueue.length} Items · {consultForm.tests.length} Investigations</p>
                </div>
                <Button
                  variant="ghost"
                  className="text-[10px] font-black text-primary uppercase tracking-widest gap-2"
                  onClick={() => setIsPrescribing(true)}
                >
                  <Plus className="w-3 h-3" /> Edit RX Cart
                </Button>
              </div>

              <Button
                type="button"
                onClick={handleConsultSubmit}
                className="h-20 rounded-[2rem] bg-slate-900 hover:bg-primary text-white font-black text-xs uppercase tracking-[0.2em] shadow-2xl transition-all hover:scale-[1.02] shadow-slate-200"
                disabled={loading}
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Authorize & Close Consultation"}
              </Button>

              {!consultForm.admitRequested && (
                <div className="p-6 rounded-[2.5rem] bg-indigo-50/50 border border-indigo-100/50 space-y-4 animate-in slide-in-from-bottom-2 duration-500">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                      <Calendar className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest leading-none">Next Appointment</h4>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-1">Schedule follow-up visit</p>
                    </div>
                  </div>
                  <Input
                    type="date"
                    className="h-12 rounded-2xl bg-white border-none font-bold text-xs shadow-sm"
                    value={consultForm.followUpDate}
                    onChange={(e) => setConsultForm(prev => ({ ...prev, followUpDate: e.target.value }))}
                  />
                </div>
              )}
            </div>
          </div>
          {pendingTest && (
            <div className="absolute inset-0 z-[100] bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-8 animate-in fade-in zoom-in duration-200 rounded-[3rem]">
              <div className="w-full max-w-sm space-y-6">
                <div className="text-center space-y-1">
                  <h3 className="text-xl font-black tracking-tight text-slate-900">Select Body Part</h3>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Specify region for {pendingTest.name}</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {ANATOMICAL_MAP[pendingTest.mapKey]?.map(part => (
                    <Button
                      key={part}
                      type="button"
                      variant="outline"
                      className="h-12 rounded-xl font-bold text-xs hover:border-primary hover:bg-primary/5 hover:text-primary transition-all text-slate-700"
                      onClick={() => {
                        const detailedName = `${pendingTest.name} [${part}]`
                        if (!consultForm.tests.includes(detailedName)) {
                          setConsultForm(prev => ({ ...prev, tests: [...prev.tests, detailedName] }))
                        }
                        setPendingTest(null)
                      }}
                    >
                      {part}
                    </Button>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full text-[10px] font-black uppercase tracking-widest text-slate-400 mt-4"
                  onClick={() => setPendingTest(null)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* CLINICAL HISTORY DIALOG */}
      <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <DialogContent className="rounded-[3rem] max-w-2xl border-none p-0 overflow-hidden shadow-2xl">
          <div className="bg-slate-900 p-10 text-white relative">
            <Clipboard className="w-16 h-16 text-primary opacity-20 absolute -top-4 -right-4 rotate-12" />
            <h2 className="text-3xl font-black mb-1 tracking-tight">Clinical Timeline</h2>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">Patient: <span className="text-white tracking-widest">{selectedPatient?.name}</span></p>
          </div>

          <div className="p-10 bg-white max-h-[70vh] overflow-y-auto space-y-8">
            {selectedPatient?.medicationLog && selectedPatient.medicationLog.length > 0 ? (
              Object.entries(
                selectedPatient.medicationLog.reduce((acc, log) => {
                  const sessionId = log.appointmentId || `LEGACY-${log.date}`
                  if (!acc[sessionId]) acc[sessionId] = {
                    date: new Date(log.date).toLocaleDateString('en-IN'),
                    rawDate: new Date(log.date),
                    logs: [],
                    appointmentId: log.appointmentId
                  }
                  acc[sessionId].logs.push(log)
                  return acc
                }, {})
              ).sort(([, a], [, b]) => b.rawDate - a.rawDate).map(([sessionId, session]) => (
                <div key={sessionId} className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="h-px flex-1 bg-slate-100" />
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 whitespace-nowrap">{session.date}</span>
                      {session.appointmentId && (
                        <button
                          onClick={() => window.open(`/api/doctor/prescription-pdf?appointmentId=${session.appointmentId}&patientId=${selectedPatient._id || selectedPatient.id}`, "_blank")}
                          className="flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-primary/5 text-primary hover:bg-primary/10 transition-colors"
                        >
                          <FileText className="w-3 h-3" />
                          <span className="text-[8px] font-black uppercase tracking-widest">View PDF Prescription</span>
                        </button>
                      )}
                    </div>
                    <div className="h-px flex-1 bg-slate-100" />
                  </div>
                  <div className="space-y-3">
                    {session.logs.map((log, idx) => (
                      <div key={idx} className="bg-slate-50 p-5 rounded-[2rem] border border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-primary shadow-sm border border-slate-100">
                            <Clock className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-900">{log.name}</p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                              {new Date(log.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · Dosage: {log.dosage}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-[8px] font-black text-green-500 border-green-100 bg-green-50 px-3 py-1">ADMINISTERED</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-20 text-center flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center text-slate-200 mb-4 animate-pulse">
                  <Clipboard className="w-10 h-10" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">No Clinical History Found</p>
              </div>
            )}
          </div>

          <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-center">
            <Button
              onClick={() => setIsHistoryOpen(false)}
              className="rounded-xl px-10 h-12 bg-slate-900 hover:bg-slate-800 text-white font-black text-[10px] uppercase tracking-widest"
            >
              Close Records
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DoctorLayout>
  )
}
