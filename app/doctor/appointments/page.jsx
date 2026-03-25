"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DoctorLayout } from "@/components/layouts/doctor-layout"
import { Calendar, Clock, User, Search, Filter, AlertCircle, Loader2, CheckCircle2, Pill, Stethoscope, Plus, Trash2, Hospital, AlertTriangle, Clipboard, FileText } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

export default function DoctorAppointments() {
  const { token } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [showAllDates, setShowAllDates] = useState(false)
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [rescheduleData, setRescheduleData] = useState({ date: "", time: "" })
  const [isConsulting, setIsConsulting] = useState(false)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [selectedHistoryPatient, setSelectedHistoryPatient] = useState(null)
  const [consultStep, setConsultStep] = useState(1) // 1: serious check, 2: shift check, 3: main form
  const [medicines, setMedicines] = useState([])
  const [medSearch, setMedSearch] = useState("")
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
  const [consultForm, setConsultForm] = useState({
    diagnosis: "",
    isSerious: false,
    shiftToHospital: false,
    prescriptions: [],
    tests: [],
    followUpDate: ""
  })

  useEffect(() => {
    if (token && token !== "null") {
      fetchAppointments()
      fetchMedicines()
      fetchMasterDiagnostics()
    }
  }, [token])

  const fetchMasterDiagnostics = async () => {
    try {
      const res = await fetch("/api/admin/master-diagnostics")
      const data = await res.json()
      if (data && data.length > 0) setMasterDiagnostics(data)
    } catch (e) {
      console.error("Error fetching diagnostics:", e)
    }
  }

  const fetchMedicines = async () => {
    try {
      const res = await fetch("/api/admin/medicines")
      const data = await res.json()
      setMedicines(data)
    } catch (e) { console.error(e) }
  }

  const fetchAppointments = async () => {
    try {
      const response = await fetch("/api/appointments", {
        headers: { "Authorization": `Bearer ${token}` }
      })
      const data = await response.json()
      if (response.ok) {
        setAppointments(data)
      } else {
        setError("Clinical registry synchronization failed")
      }
    } catch (err) {
      setError("Network timeout. Please retry clinical sync.")
    } finally {
      setLoading(false)
    }
  }

  const handleCancelAppointment = async (id) => {
    if (!confirm("Confirm cancellation of this clinical appointment?")) return

    setActionLoading(id)
    try {
      const response = await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status: "cancelled" }),
      })

      if (response.ok) {
        toast.success("Appointment Voided")
        fetchAppointments()
      } else {
        toast.error("Status update failure")
      }
    } catch (err) {
      toast.error("Network error")
    } finally {
      setActionLoading(null)
    }
  }

  const handleReschedule = async (e) => {
    e.preventDefault()
    setActionLoading(selectedAppointment._id)
    try {
      const response = await fetch(`/api/appointments/${selectedAppointment._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          appointmentDate: rescheduleData.date,
          time: rescheduleData.time,
        }),
      })

      if (response.ok) {
        toast.success("Schedule Updated")
        setIsRescheduleOpen(false)
        fetchAppointments()
      } else {
        toast.error("Clinical conflict detected")
      }
    } catch (err) {
      toast.error("Network synchronization failure")
    } finally {
      setActionLoading(null)
    }
  }

  const handleSubmitConsultation = async () => {
    if (!consultForm.diagnosis) return toast.error("Clinical diagnosis is required")
    setActionLoading(selectedAppointment._id)
    try {
      const response = await fetch("/api/doctor/consultation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          appointmentId: selectedAppointment._id,
          patientId: selectedAppointment.patientId,
          patientName: selectedAppointment.patientName,
          ...consultForm
        }),
      })

      if (response.ok) {
        toast.success("Consultation finalized & digitalized")
        setIsConsulting(false)
        fetchAppointments()
      } else {
        toast.error("Finalization failure")
      }
    } catch (err) {
      toast.error("Network synchronization failure")
    } finally {
      setActionLoading(null)
    }
  }

  const addVialPrescription = () => {
    const vial = {
      id: Date.now(),
      name: "Emergency Dosage Vial (Multi-Vitamin/Saline)",
      dosage: "1 Vial IV",
      quantity: 1,
      duration: "Immediate",
      instructions: "Stat dose"
    }
    setConsultForm(prev => ({
      ...prev,
      prescriptions: [...prev.prescriptions, vial]
    }))
  }

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "scheduled":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredAppointments = appointments.filter((appointment) => {
    const matchesSearch =
      (appointment.patientName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (appointment.reason || "").toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter = filterStatus === "all" || (appointment.status || "").toLowerCase() === filterStatus.toLowerCase()

    // Date Filtering Logic
    const matchesDate = showAllDates || appointment.date === selectedDate

    return matchesSearch && matchesFilter && matchesDate
  })

  if (loading) {
    return (
      <DoctorLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading appointments...</p>
          </div>
        </div>
      </DoctorLayout>
    )
  }

  return (
    <DoctorLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">My Appointments</h1>
          <p className="text-muted-foreground">Manage your patient appointments</p>
        </div>

        {error && (
          <Alert variant="destructive" className="rounded-2xl bg-red-50/50 border-red-100 animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription className="font-bold text-xs">{error}</AlertDescription>
          </Alert>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search appointments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11 rounded-xl"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative group">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary opacity-50 group-focus-within:opacity-100 transition-opacity" />
              <Input
                type="date"
                className="pl-9 h-11 rounded-xl bg-white border-slate-200 focus:border-primary focus:ring-primary w-full sm:w-44 font-bold text-xs shadow-sm"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value)
                  setShowAllDates(false)
                }}
              />
            </div>

            <Button
              variant={showAllDates ? "default" : "outline"}
              className={cn(
                "h-11 rounded-xl px-4 font-black text-[10px] uppercase tracking-widest transition-all",
                showAllDates ? "bg-slate-900" : "bg-white text-slate-400 border-slate-100 shadow-sm"
              )}
              onClick={() => setShowAllDates(!showAllDates)}
            >
              {showAllDates ? "Showing All" : "Filter Date"}
            </Button>
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Appointments</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Appointments List */}
        <div className="grid gap-4">
          {filteredAppointments.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No appointments found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || filterStatus !== "all"
                    ? "Try adjusting your search or filter criteria"
                    : "No appointments scheduled"}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredAppointments.map((appointment) => (
              <Card key={appointment.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="bg-primary/10 rounded-full p-3">
                        <User className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{appointment.patientName}</h3>
                        <p className="text-muted-foreground">ID: {appointment.patientId}</p>
                        <p className="text-sm text-muted-foreground mt-1">{appointment.reason}</p>
                        <p className="text-sm text-muted-foreground">{appointment.location}</p>
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{appointment.date}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{appointment.time}</span>
                      </div>
                      <Badge className={getStatusColor(appointment.status)}>{appointment.status}</Badge>
                      {appointment.status.toLowerCase() === "scheduled" && (
                        <div className="flex space-x-2 mt-2">
                          <Button
                            size="sm"
                            className="bg-primary hover:bg-primary/90"
                            onClick={() => {
                              setSelectedAppointment(appointment)
                              setConsultStep(1)
                              setConsultForm({
                                diagnosis: "",
                                isSerious: false,
                                shiftToHospital: false,
                                prescriptions: [],
                                tests: []
                              })
                              setIsConsulting(true)
                            }}
                          >
                            <Stethoscope className="w-4 h-4 mr-2" />
                            Consult
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedAppointment(appointment)
                              setRescheduleData({ date: appointment.date, time: appointment.time })
                              setIsRescheduleOpen(true)
                            }}
                            disabled={actionLoading === appointment._id}
                          >
                            Reschedule
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleCancelAppointment(appointment._id)}
                            disabled={actionLoading === appointment._id}
                          >
                            {actionLoading === appointment._id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Cancel"}
                          </Button>
                        </div>
                      )}
                      <div className="flex flex-col gap-2 mt-2">
                        {appointment.status.toLowerCase() === "completed" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 font-bold"
                            onClick={() => {
                              setSelectedHistoryPatient(appointment)
                              setIsHistoryOpen(true)
                            }}
                          >
                            <Clipboard className="w-4 h-4 mr-2" />
                            View Notes & PDF
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="w-full text-[10px] font-black uppercase tracking-widest text-slate-400"
                          onClick={() => {
                            setSelectedHistoryPatient(appointment)
                            setIsHistoryOpen(true)
                          }}
                        >
                          Clinical History
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Clinical History Dialog */}
        <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
          <DialogContent className="rounded-[3rem] max-w-2xl border-none p-0 overflow-hidden shadow-2xl">
            <div className="bg-slate-900 p-10 text-white relative">
              <Clipboard className="w-16 h-16 text-primary opacity-20 absolute -top-4 -right-4 rotate-12" />
              <h2 className="text-3xl font-black mb-1 tracking-tight">Clinical Timeline</h2>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">Patient: <span className="text-white tracking-widest">{selectedHistoryPatient?.patientName}</span></p>
            </div>

            <div className="p-10 bg-white max-h-[70vh] overflow-y-auto space-y-8">
              {selectedHistoryPatient?.medicationLog && selectedHistoryPatient.medicationLog.length > 0 ? (
                Object.entries(
                  selectedHistoryPatient.medicationLog.reduce((acc, log) => {
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
                            onClick={() => window.open(`/api/doctor/prescription-pdf?appointmentId=${session.appointmentId}&patientId=${selectedHistoryPatient.patientId}`, "_blank")}
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

                      {/* Integrated Lab Results */}
                      {selectedHistoryPatient?.testLog?.filter(t => (t.appointmentId || `LEGACY-${t.date}`) === sessionId).map((test, idx) => (
                        <div key={`test-${idx}`} className="bg-blue-50/30 p-5 rounded-[2rem] border border-blue-100 flex flex-col gap-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-blue-600 shadow-sm border border-blue-100">
                                <Beaker className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{test.name}</p>
                                <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">DIAGNOSTIC INVESTIGATION</p>
                              </div>
                            </div>
                            <Badge variant="outline" className={`text-[8px] font-black uppercase px-3 py-1 ${test.status === "Completed" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"
                              }`}>
                              {test.status}
                            </Badge>
                          </div>
                          {test.status === "Completed" && test.result && (
                            <div className="ml-14 p-4 bg-white rounded-2xl border border-blue-50">
                              <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1">Findings</p>
                              <p className="text-xs font-black text-slate-700">{test.result}</p>
                            </div>
                          )}
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

        {/* Consultation Dial (E-Prescription & Triage) */}
        <Dialog open={isConsulting} onOpenChange={setIsConsulting}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-[2rem]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black">Clinical Consultation</DialogTitle>
              <DialogDescription>
                Synchronizing medical outcomes for {selectedAppointment?.patientName}
              </DialogDescription>
            </DialogHeader>

            {consultStep === 1 && (
              <div className="py-10 text-center space-y-6">
                <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto animate-pulse" />
                <h3 className="text-xl font-bold">Is the patient's condition serious?</h3>
                <div className="flex justify-center gap-4 pt-4">
                  <Button
                    variant="outline" size="lg" className="w-32 rounded-xl"
                    onClick={() => {
                      setConsultForm(prev => ({ ...prev, isSerious: false }))
                      setConsultStep(3)
                    }}
                  >No</Button>
                  <Button
                    variant="destructive" size="lg" className="w-32 rounded-xl"
                    onClick={() => {
                      setConsultForm(prev => ({ ...prev, isSerious: true }))
                      setConsultStep(2)
                    }}
                  >Yes</Button>
                </div>
              </div>
            )}

            {consultStep === 2 && (
              <div className="py-10 text-center space-y-6">
                <Hospital className="w-16 h-16 text-primary mx-auto" />
                <h3 className="text-xl font-bold">Initiate Hospital Admission/Shifting?</h3>
                <p className="text-muted-foreground max-w-sm mx-auto">This will trigger emergency protocols and assign dosage vials.</p>
                <div className="flex justify-center gap-4 pt-4">
                  <Button
                    variant="outline" size="lg" className="w-32 rounded-xl"
                    onClick={() => {
                      setConsultForm(prev => ({ ...prev, shiftToHospital: false }))
                      setConsultStep(3)
                    }}
                  >No</Button>
                  <Button
                    className="w-32 rounded-xl bg-primary" size="lg"
                    onClick={() => {
                      setConsultForm(prev => ({ ...prev, shiftToHospital: true }))
                      addVialPrescription()
                      setConsultStep(3)
                    }}
                  >Yes, Shift</Button>
                </div>
              </div>
            )}

            {consultStep === 3 && (
              <div className="space-y-6 py-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Diagnosis & Clinical Notes</Label>
                  <textarea
                    className="w-full h-32 p-4 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-primary/20 outline-none font-bold text-sm"
                    placeholder="Enter patient diagnosis and medical assessment..."
                    value={consultForm.diagnosis}
                    onChange={(e) => setConsultForm(prev => ({ ...prev, diagnosis: e.target.value }))}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  {/* Medicine Selector */}
                  <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Prescribe Medicines</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        placeholder="Search stock..."
                        className="pl-10 rounded-xl"
                        value={medSearch}
                        onChange={(e) => setMedSearch(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
                      />
                    </div>
                    <div className="max-h-48 overflow-y-auto space-y-1 pr-2">
                      {medicines.filter(m => m.name.toLowerCase().includes(medSearch.toLowerCase())).map(m => (
                        <div key={m._id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-slate-50 transition-all group">
                          <div>
                            <p className="text-xs font-black">{m.name}</p>
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Stock: {m.stock} {m.unit}</p>
                          </div>
                          <Button
                            type="button"
                            size="sm" variant="ghost" className="h-8 w-8 p-0"
                            onClick={() => {
                              const newItem = {
                                id: Date.now(),
                                name: m.name,
                                medicineId: m._id,
                                dosage: "1-0-1",
                                quantity: 10,
                                duration: "5 days",
                                instructions: "After food"
                              }
                              setConsultForm(prev => ({ ...prev, prescriptions: [...prev.prescriptions, newItem] }))
                            }}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Lab Test Selector */}
                  <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Diagnostic Orders</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        placeholder="Search investigations..."
                        className="pl-10 rounded-xl"
                        value={diagSearch}
                        onChange={(e) => setDiagSearch(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
                      />
                    </div>
                    <div className="max-h-48 overflow-y-auto space-y-1 pr-2">
                      {masterDiagnostics.filter(d => d.name.toLowerCase().includes(diagSearch.toLowerCase())).map(d => (
                        <div key={d._id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-slate-50 transition-all group">
                          <div>
                            <p className="text-xs font-black">{d.name}</p>
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">{d.category}</p>
                          </div>
                          <Button
                            type="button"
                            size="sm" variant="ghost" className="h-8 w-8 p-0"
                            onClick={() => {
                              const needsPart = Object.keys(ANATOMICAL_MAP).find(key => d.name.startsWith(key))
                              if (needsPart) {
                                setPendingTest({ ...d, mapKey: needsPart })
                              } else {
                                if (!consultForm.tests.includes(d.name)) {
                                  setConsultForm(prev => ({ ...prev, tests: [...prev.tests, d.name] }))
                                }
                              }
                            }}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Summary Table */}
                {(consultForm.prescriptions.length > 0 || consultForm.tests.length > 0) && (
                  <div className="p-6 rounded-3xl bg-slate-50 border-2 border-slate-100 space-y-4 animate-in fade-in zoom-in-95">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Session Protocol</h4>
                    <div className="space-y-4">
                      {consultForm.prescriptions.map((p, i) => (
                        <div key={p.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="bg-primary/5 p-2 rounded-xl">
                                <Pill className="w-4 h-4 text-primary" />
                              </div>
                              <span className="text-sm font-black text-slate-900">{p.name}</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full"
                              onClick={() => setConsultForm(prev => ({ ...prev, prescriptions: prev.prescriptions.filter(item => item.id !== p.id) }))}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>

                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                            <div className="space-y-1">
                              <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Quantity</label>
                              <Input
                                type="number"
                                value={p.quantity}
                                onChange={(e) => {
                                  const updated = [...consultForm.prescriptions];
                                  updated[i].quantity = e.target.value;
                                  setConsultForm({ ...consultForm, prescriptions: updated });
                                }}
                                className="h-10 rounded-xl bg-slate-100/50 border-none font-bold text-xs"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Dosage</label>
                              <Input
                                value={p.dosage}
                                onChange={(e) => {
                                  const updated = [...consultForm.prescriptions];
                                  updated[i].dosage = e.target.value;
                                  setConsultForm({ ...consultForm, prescriptions: updated });
                                }}
                                className="h-10 rounded-xl bg-slate-100/50 border-none font-bold text-xs"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Duration</label>
                              <Input
                                value={p.duration}
                                onChange={(e) => {
                                  const updated = [...consultForm.prescriptions];
                                  updated[i].duration = e.target.value;
                                  setConsultForm({ ...consultForm, prescriptions: updated });
                                }}
                                className="h-10 rounded-xl bg-slate-100/50 border-none font-bold text-xs"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Timing</label>
                              <Select
                                value={p.instructions}
                                onValueChange={(val) => {
                                  const updated = [...consultForm.prescriptions];
                                  updated[i].instructions = val;
                                  setConsultForm({ ...consultForm, prescriptions: updated });
                                }}
                              >
                                <SelectTrigger className="h-10 rounded-xl bg-slate-100/50 border-none font-bold text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-none shadow-2xl">
                                  <SelectItem value="After food">After food</SelectItem>
                                  <SelectItem value="Before food">Before food</SelectItem>
                                  <SelectItem value="At bedtime">At bedtime</SelectItem>
                                  <SelectItem value="With water">With water</SelectItem>
                                  <SelectItem value="Empty stomach">Empty stomach</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      ))}

                      {consultForm.tests.map((t, i) => (
                        <div key={i} className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                          <div className="flex items-center gap-3">
                            <div className="bg-blue-500/5 p-2 rounded-xl">
                              <Stethoscope className="w-4 h-4 text-blue-500" />
                            </div>
                            <span className="text-xs font-black text-slate-900">{t}</span>
                          </div>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full" onClick={() => setConsultForm(prev => ({ ...prev, tests: prev.tests.filter(item => item !== t) }))}><Trash2 className="w-3 h-3" /></Button>
                        </div>
                      ))}
                    </div>

                    {!consultForm.shiftToHospital && (
                      <div className="mt-8 p-6 rounded-[2.5rem] bg-indigo-50/50 border border-indigo-100/50 space-y-4 animate-in slide-in-from-bottom-2 duration-500">
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
                )}

                <div className="flex gap-4 pt-4">
                  <Button type="button" variant="outline" className="flex-1 rounded-2xl h-14 font-black uppercase text-xs tracking-widest" onClick={() => setConsultStep(1)}>Back</Button>
                  <Button
                    type="button"
                    className="flex-1 rounded-2xl h-14 bg-slate-900 font-black uppercase text-xs tracking-widest text-white shadow-xl shadow-slate-200"
                    onClick={handleSubmitConsultation}
                    disabled={actionLoading !== null}
                  >
                    {actionLoading === selectedAppointment?._id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Finalize Consultation"}
                  </Button>
                </div>
              </div>
            )}
            {pendingTest && (
              <div className="absolute inset-0 z-[100] bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-8 animate-in fade-in zoom-in duration-200 rounded-[3rem]">
                <div className="w-full max-w-sm space-y-6 text-center">
                  <div className="space-y-1">
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
                    className="w-full text-[10px] font-black uppercase tracking-widest text-slate-400 mt-4 h-10"
                    onClick={() => setPendingTest(null)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DoctorLayout>
  )
}
