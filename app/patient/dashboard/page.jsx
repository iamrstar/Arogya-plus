"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/components/auth/auth-provider"
import { PatientLayout } from "@/components/layouts/patient-layout"
import {
  Heart,
  Calendar,
  FileText,
  Pill,
  Activity,
  Clock,
  User,
  MapPin,
  Phone,
  Mail,
  ArrowRight,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Video,
  XCircle,
  ShieldCheck
} from "lucide-react"
import { cn } from "@/lib/utils"

export default function PatientDashboard() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [labReports, setLabReports] = useState([])
  const [prescriptions, setPrescriptions] = useState([])
  const [loading, setLoading] = useState(true)

  // Pharmacy E-Commerce State
  const [selectedPrescription, setSelectedPrescription] = useState(null)
  const [orderStatus, setOrderStatus] = useState('idle') // 'idle' | 'processing' | 'success'
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const [newAppointment, setNewAppointment] = useState({
    department: "Orthopedics",
    appointmentDate: new Date().toISOString().split('T')[0],
    time: "10:00 AM",
    reason: "",
    type: "First Visit"
  })

  useEffect(() => {
    fetchPatientData()
  }, [])

  const fetchPatientData = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      // 1. Fetch Appointments
      const appRes = await fetch("/api/appointments", {
        headers: { "Authorization": `Bearer ${token}` }
      })
      if (appRes.ok) {
        const data = await appRes.json()
        setAppointments(data)
      }

      // 2. Fetch Clinical History (Meds & Labs)
      const historyRes = await fetch("/api/patient/history", {
        headers: { "Authorization": `Bearer ${token}` }
      })
      if (historyRes.ok) {
        const history = await historyRes.json()

        // Map medication log to dashboard structure
        setPrescriptions(history.medicationLog.length > 0 ? [
          {
            id: `PRES-${Date.now()}`,
            doctorName: "Clinical Team",
            date: new Date().toLocaleDateString(),
            medicines: history.medicationLog.map(m => ({
              name: m.name,
              dosage: m.dosage,
              frequency: m.instructions,
              duration: m.duration || "As prescribed",
              price: 150 // Standard pharmacy reference
            }))
          }
        ] : [])

        // Map test log to dashboard structure
        setLabReports(history.testLog.map((t, index) => ({
          id: `LAB-${index}-${Date.now()}`,
          testName: t.name,
          date: t.date,
          status: t.status,
          result: "Pending Review",
          doctorName: "Diagnostic Specialist"
        })))
      }

      setLoading(false)
    } catch (error) {
      console.error("Clinical sync error:", error)
      setLoading(false)
    }
  }

  const handleCreateOrder = async (prescription) => {
    setOrderStatus('processing')

    try {
      const response = await fetch("/api/pharmacy/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: user?._id || "P-101",
          patientName: user?.name,
          prescriptionId: prescription.id,
          medicines: prescription.medicines,
          totalAmount: prescription.medicines.reduce((acc, med) => acc + (med.price || 0), 0),
          address: user?.address || "Registered Hospital Address",
        }),
      })

      if (response.ok) {
        setOrderStatus('success')
        setTimeout(() => {
          setOrderStatus('idle')
          setSelectedPrescription(null)
        }, 2000)
      }
    } catch (error) {
      console.error("Order error:", error)
      setOrderStatus('idle')
    }
  }

  const handleBookAppointment = async (e) => {
    e.preventDefault()
    setLoading(true)
    const token = localStorage.getItem("token")
    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(newAppointment)
      })
      if (response.ok) {
        setIsBookingOpen(false)
        fetchPatientData()
      }
    } catch (error) {
      console.error("Booking error:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    switch (status.toLowerCase()) {
      case "scheduled":
        return <Badge className="bg-primary/10 text-primary border-none rounded-lg px-2.5 font-bold">Scheduled</Badge>
      case "completed":
        return <Badge className="bg-green-500/10 text-green-500 border-none rounded-lg px-2.5 font-bold">Completed</Badge>
      case "pending":
        return <Badge className="bg-secondary/10 text-secondary-foreground border-none rounded-lg px-2.5 font-bold">In Progress</Badge>
      default:
        return <Badge className="bg-slate-100 text-slate-500 border-none rounded-lg px-2.5 font-bold">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <PatientLayout>
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Synchronizing Health Data</p>
        </div>
      </PatientLayout>
    )
  }

  return (
    <PatientLayout>
      <div className="space-y-10 pb-16 relative">
        {/* Pharmacy Checkout Modal */}
        {selectedPrescription && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 backdrop-blur-md bg-slate-900/40 animate-in fade-in duration-300">
            <Card className="w-full max-w-lg bg-white rounded-[3rem] overflow-hidden shadow-2xl border-none">
              <CardHeader className="p-10 border-b border-slate-50 relative">
                <button onClick={() => setSelectedPrescription(null)} className="absolute top-8 right-8 p-2 rounded-xl hover:bg-slate-50 text-slate-400 transition-colors"><XCircle className="w-6 h-6" /></button>
                <CardTitle className="text-2xl font-black text-slate-900 leading-none">Pharmacy Checkout</CardTitle>
                <CardDescription className="text-slate-500 font-medium mt-2">Prescription ID: {selectedPrescription.id}</CardDescription>
              </CardHeader>
              <CardContent className="p-10 space-y-8">
                <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Medicines to Fulfill</p>
                  {selectedPrescription.medicines.map((m, i) => (
                    <div key={i} className="flex justify-between items-center py-3 border-b border-slate-50 last:border-none">
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-slate-800">{m.name}</p>
                        <p className="text-[10px] uppercase font-black text-slate-400 tracking-wider text-primary">{m.dosage} • {m.duration}</p>
                      </div>
                      <p className="text-sm font-black text-slate-900 tracking-tighter">₹{m.price}</p>
                    </div>
                  ))}
                </div>

                <div className="p-8 rounded-[2rem] bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Digital Settlement</p>
                  <p className="text-3xl font-black text-primary tracking-tighter">₹{selectedPrescription.medicines.reduce((a, b) => a + b.price, 0)}</p>
                </div>

                {orderStatus === 'success' ? (
                  <div className="flex flex-col items-center gap-4 py-8 animate-in zoom-in duration-500">
                    <div className="w-16 h-16 rounded-full bg-green-500 text-white flex items-center justify-center shadow-lg shadow-green-500/20">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <p className="text-sm font-black text-green-600 uppercase tracking-[0.2em]">Medical Order Confirmed</p>
                  </div>
                ) : (
                  <Button
                    onClick={() => handleCreateOrder(selectedPrescription)}
                    disabled={orderStatus === 'processing'}
                    className="w-full h-16 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black text-lg shadow-[0_20px_40px_-12px_rgba(13,148,136,0.3)] transition-all active:scale-95 flex items-center justify-center gap-3"
                  >
                    {orderStatus === 'processing' ? 'Processing Secure Payment...' : 'Schedule Clinical Delivery'}
                    {orderStatus !== 'processing' && <ArrowRight className="w-5 h-5" />}
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        )}
        {/* Appointment Booking Modal */}
        {isBookingOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 backdrop-blur-md bg-slate-900/40 animate-in fade-in duration-300">
            <Card className="w-full max-w-lg bg-white rounded-[3rem] overflow-hidden shadow-2xl border-none">
              <CardHeader className="p-10 border-b border-slate-50 relative">
                <button onClick={() => setIsBookingOpen(false)} className="absolute top-8 right-8 p-2 rounded-xl hover:bg-slate-50 text-slate-400 transition-colors"><XCircle className="w-6 h-6" /></button>
                <CardTitle className="text-2xl font-black text-slate-900 leading-none">Book Consultation</CardTitle>
                <CardDescription className="text-slate-500 font-medium mt-2">Specialized healthcare at your fingertips</CardDescription>
              </CardHeader>
              <CardContent className="p-10 space-y-6">
                <form onSubmit={handleBookAppointment} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Clinical Department</label>
                    <Select value={newAppointment.department} onValueChange={(v) => setNewAppointment({ ...newAppointment, department: v })}>
                      <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-slate-100 font-bold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {['Cardiology', 'Neurology', 'Orthopedics', 'Dermatology', 'Pediatrics'].map(d => (
                          <SelectItem key={d} value={d}>{d}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Preferred Date</label>
                      <Input
                        type="date"
                        className="h-14 rounded-2xl bg-slate-50 border-slate-100 font-bold"
                        value={newAppointment.appointmentDate}
                        onChange={(e) => setNewAppointment({ ...newAppointment, appointmentDate: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Session Type</label>
                      <Select value={newAppointment.type} onValueChange={(v) => setNewAppointment({ ...newAppointment, type: v })}>
                        <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-slate-100 font-bold">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="First Visit">First Visit</SelectItem>
                          <SelectItem value="Follow-up">Regular Follow-up</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Symptoms/Reason</label>
                    <Input
                      placeholder="Briefly describe your concern"
                      className="h-14 rounded-2xl bg-slate-50 border-slate-100 font-bold"
                      value={newAppointment.reason}
                      onChange={(e) => setNewAppointment({ ...newAppointment, reason: e.target.value })}
                    />
                  </div>
                  <Button type="submit" className="w-full h-16 rounded-2xl bg-primary font-black text-lg shadow-xl shadow-primary/20">
                    Confirm Clinical Request
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Clinical Welcome Header */}
        <div className="relative overflow-hidden bg-white border border-slate-100 rounded-[3rem] p-10 shadow-sm">
          <div className="absolute top-0 right-0 w-64 h-full bg-primary/5 rounded-l-full -z-10" />

          <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
            <div className="space-y-4 flex-1">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/5 text-primary text-[10px] font-black uppercase tracking-[0.2em]">
                Active Health Cycle
              </div>
              <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">Namaste, {user?.name?.split(' ')[0]}</h1>
              <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Arogya ID: {user?._id}</div>
              <p className="text-slate-500 max-w-lg font-medium leading-relaxed">
                Your health vitals are looking excellent this morning. You have <span className="text-primary font-bold">{appointments.filter(a => a.status.toLowerCase() === 'scheduled').length} upcoming medical consultations</span> across our Indian network.
              </p>
              <div className="flex gap-4 pt-4">
                <Button
                  onClick={() => setIsBookingOpen(true)}
                  className="h-12 px-8 rounded-xl bg-primary shadow-lg shadow-primary/20 font-bold hover:scale-105 transition-transform"
                >
                  Book Consultation
                </Button>
                <Button variant="outline" className="h-12 px-8 rounded-xl border-slate-200 text-slate-600 font-bold">
                  Help & Support
                </Button>
              </div>
            </div>
            <div className="hidden lg:block w-48 h-48 bg-slate-50 rounded-[3rem] p-6 border-4 border-white shadow-xl rotate-3 transition-transform hover:rotate-0">
              <div className="text-center space-y-2">
                <Activity className="w-10 h-10 text-primary mx-auto" />
                <p className="text-2xl font-black text-slate-900 leading-none">88%</p>
                <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Wellness Score</p>
              </div>
            </div>
          </div>
        </div>

        {/* Vital Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "Encounters", val: appointments.length, icon: <Calendar className="w-5 h-5" />, color: "bg-blue-50 text-blue-600" },
            { label: "Lab Reports", val: labReports.length, icon: <FileText className="w-5 h-5" />, color: "bg-purple-50 text-purple-600" },
            { label: "Medications", val: prescriptions.length, icon: <Pill className="w-5 h-5" />, color: "bg-green-50 text-green-600" },
            { label: "Telehealth", val: "Online", icon: <Video className="w-5 h-5" />, color: "bg-primary/10 text-primary" },
          ].map((stat, i) => (
            <Card key={i} className="bg-white border-slate-100 rounded-[2rem] hover:shadow-xl hover:-translate-y-1 transition-all group overflow-hidden">
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-4">
                  <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", stat.color)}>
                    {stat.icon}
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="text-3xl font-black text-slate-900">{stat.val}</h3>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Workspace Hub */}
        <Tabs defaultValue="appointments" className="space-y-8">
          <TabsList className="bg-slate-50/80 p-1.5 rounded-2xl border border-slate-100">
            <TabsTrigger value="appointments" className="rounded-xl px-8 py-2.5 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm font-black text-xs uppercase tracking-widest transition-all">Daily Queue</TabsTrigger>
            <TabsTrigger value="reports" className="rounded-xl px-8 py-2.5 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm font-black text-xs uppercase tracking-widest transition-all">Medical Repository</TabsTrigger>
            <TabsTrigger value="prescriptions" className="rounded-xl px-8 py-2.5 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm font-black text-xs uppercase tracking-widest transition-all">Pharmacy</TabsTrigger>
            <TabsTrigger value="settings" className="rounded-xl px-8 py-2.5 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm font-black text-xs uppercase tracking-widest transition-all">Account Hub</TabsTrigger>
          </TabsList>

          <TabsContent value="appointments" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-8">
              {appointments.map((apt) => (
                <Card key={apt.id} className="bg-white border-slate-100 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all group overflow-hidden">
                  <CardContent className="p-10 flex flex-col md:flex-row gap-8 items-start justify-between">
                    <div className="flex gap-6">
                      <div className="w-16 h-16 rounded-[1.5rem] bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-xl border-4 border-white shadow-lg">
                        {apt.doctorName.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xl font-bold text-slate-900">{apt.doctorName}</h4>
                        <p className="text-xs font-black text-primary uppercase tracking-widest">{apt.specialization}</p>
                        <p className="text-sm text-slate-500 mt-4 leading-relaxed font-medium">"{apt.reason}"</p>
                      </div>
                    </div>
                    <div className="space-y-4 md:text-right w-full md:w-auto pt-2">
                      <div className="flex items-center md:justify-end gap-2 text-slate-500 font-bold text-sm">
                        <Calendar className="w-4 h-4 text-primary" />
                        {apt.date}
                      </div>
                      <div className="flex items-center md:justify-end gap-2 text-slate-500 font-bold text-sm">
                        <Clock className="w-4 h-4 text-primary" />
                        {apt.time}
                      </div>
                      {apt.followUpDate && (
                        <div className="flex items-center md:justify-end gap-2 text-green-600 font-bold text-[10px] uppercase tracking-widest mt-2 bg-green-50 px-3 py-1 rounded-full">
                          <CheckCircle2 className="w-3 h-3" />
                          Next Visit: {apt.followUpDate}
                        </div>
                      )}
                      <div>
                        {getStatusBadge(apt.status)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <div className="grid gap-6">
              {labReports.map((report) => (
                <Card key={report.id} className="bg-white border-slate-100 rounded-[2rem] hover:shadow-md transition-all px-8 py-6">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-slate-900">{report.testName}</h4>
                        <div className="flex gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                          <span>{report.date}</span>
                          <span>Issued by {report.doctorName}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Observation</p>
                        <p className={cn("text-xs font-black", report.result === "Normal" ? "text-green-500" : "text-secondary-foreground")}>
                          {report.result}
                        </p>
                      </div>
                      <Button variant="outline" className="rounded-xl border-slate-200 text-primary font-bold">Download Vault</Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="prescriptions" className="space-y-6">
            {prescriptions.map((pres) => (
              <Card key={pres.id} className="bg-white border-slate-100 rounded-[3rem] shadow-sm overflow-hidden">
                <CardHeader className="p-10 border-b border-slate-50 bg-slate-50/30">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="space-y-2 text-center md:text-left">
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight">Clinical Prescription Registry</h3>
                      <p className="text-slate-500 text-sm font-medium">Certified by {pres.doctorName} on {pres.date}</p>
                    </div>
                    <Button
                      onClick={() => setSelectedPrescription(pres)}
                      className="h-14 px-10 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-primary/20 hover:scale-105 transition-all w-full md:w-auto"
                    >
                      Process Fulfillment
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-10 grid md:grid-cols-2 gap-8">
                  {pres.medicines.map((med, idx) => (
                    <div key={idx} className="p-8 rounded-[2.5rem] bg-white border border-slate-100 group hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all">
                      <div className="flex justify-between items-start mb-6">
                        <div className="space-y-1">
                          <h4 className="text-xl font-bold text-slate-900">{med.name}</h4>
                          <p className="text-[10px] font-black uppercase text-primary tracking-widest">Medical Grade Fulfillable</p>
                        </div>
                        <Badge className="bg-primary/5 text-primary border-none rounded-lg px-3 py-1 text-[10px] uppercase font-black">{med.duration}</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-8 pt-4 border-t border-slate-50">
                        <div className="space-y-2">
                          <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Clinical Dosage</p>
                          <p className="text-xs font-bold text-slate-700">{med.dosage}</p>
                        </div>
                        <div className="space-y-2 text-right">
                          <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Unit Pricing</p>
                          <p className="text-lg font-black text-slate-900">₹{med.price || 99}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="settings" className="space-y-8">
            <div className="grid lg:grid-cols-2 gap-8">
              <Card className="bg-white border-slate-100 rounded-[3rem] p-10 space-y-8">
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                  <User className="w-6 h-6 text-primary" />
                  Universal Profile
                </h3>
                <div className="space-y-6">
                  {[
                    { label: "Identity Name", val: user?.name, icon: <User className="w-4 h-4" /> },
                    { label: "Connected Network", val: user?.phone, icon: <Phone className="w-4 h-4" /> },
                    { label: "Clinical Email", val: user?.email, icon: <Mail className="w-4 h-4" /> },
                    { label: "Registry Address", val: user?.address || "Universal Access", icon: <MapPin className="w-4 h-4" /> },
                  ].map((it, i) => (
                    <div key={i} className="flex gap-5 p-6 rounded-2xl bg-slate-50/80 border border-slate-100">
                      <div className="text-primary mt-1">{it.icon}</div>
                      <div>
                        <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">{it.label}</p>
                        <p className="text-sm font-bold text-slate-900">{it.val}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="bg-white border-slate-100 rounded-[3rem] p-10 space-y-8">
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                  <Activity className="w-6 h-6 text-primary" />
                  Clinical Metadata
                </h3>
                <div className="space-y-6">
                  <div className="flex gap-5 p-6 rounded-2xl bg-slate-50/80 border border-slate-100">
                    <div className="text-primary mt-1"><Heart className="w-4 h-4" /></div>
                    <div>
                      <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">Blood Registry</p>
                      <p className="text-sm font-bold text-slate-900">{user?.bloodGroup || "O+"}</p>
                    </div>
                  </div>
                  <div className="flex gap-5 p-6 rounded-2xl bg-secondary/10 border border-secondary/5">
                    <div className="text-secondary-foreground mt-1"><AlertCircle className="w-4 h-4" /></div>
                    <div>
                      <p className="text-[10px] uppercase font-black text-secondary-foreground/50 tracking-widest mb-1">Critical Allergies</p>
                      <p className="text-sm font-bold text-secondary-foreground/80">Penicillin, Industrial Dust</p>
                    </div>
                  </div>
                  <div className="flex gap-5 p-6 rounded-2xl bg-green-50/80 border border-green-100">
                    <div className="text-green-600 mt-1"><ShieldCheck className="w-4 h-4" /></div>
                    <div>
                      <p className="text-[10px] uppercase font-black text-green-400 tracking-widest mb-1">Vault Status</p>
                      <p className="text-sm font-black text-green-600 flex items-center gap-1 uppercase tracking-widest">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Verified
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PatientLayout>
  )
}
