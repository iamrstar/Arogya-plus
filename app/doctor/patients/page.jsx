"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Search, Filter, Calendar, Activity, Phone, Mail, MapPin, Heart, BedDouble, Stethoscope } from "lucide-react"
import { DoctorLayout } from "@/components/layouts/doctor-layout"
import { useAuth } from "@/components/auth/auth-provider"

export default function DoctorPatients() {
  const { token } = useAuth()
  const [outpatients, setOutpatients] = useState([])
  const [admittedPatients, setAdmittedPatients] = useState([])
  const [activeTab, setActiveTab] = useState("outpatients")
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  
  const [isPrescribeModalOpen, setIsPrescribeModalOpen] = useState(false)
  const [newPrescription, setNewPrescription] = useState([{ name: "", dosage: "", frequency: "", duration: "" }])
  const [prescribeLoading, setPrescribeLoading] = useState(false)

  useEffect(() => {
    if (token) fetchPatients()
  }, [token])

  const fetchPatients = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/doctor/patients", {
        headers: { "Authorization": `Bearer ${token}` }
      })
      const data = await res.json()
      if (res.ok) {
        setOutpatients(data.outpatients || [])
        setAdmittedPatients(data.admittedPatients || [])
      }
    } catch (error) {
      console.error("Failed to fetch patients", error)
    } finally {
      setLoading(false)
    }
  }

  const handlePrescribeSubmit = async () => {
    if (!selectedPatient) return
    setPrescribeLoading(true)
    try {
      const res = await fetch("/api/doctor/prescribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          patientId: selectedPatient.id || selectedPatient._id,
          doctorId: user?._id,
          medicines: newPrescription
        })
      })
      const data = await res.json()
      if (res.ok) {
        toast.success(data.message)
        setIsPrescribeModalOpen(false)
        setNewPrescription([{ name: "", dosage: "", frequency: "", duration: "" }])
        fetchPatients()
        // We'd ideally re-fetch the single patient data too, or just close the main modal
      } else {
        toast.error(data.error || "Failed to prescribe")
      }
    } catch (error) {
      toast.error("Network error")
    } finally {
      setPrescribeLoading(false)
    }
  }

  const getStatusColor = (status) => {
    if (!status) return "bg-gray-100 text-gray-800"
    switch (status.toLowerCase()) {
      case "stable":
        return "bg-green-100 text-green-800"
      case "under treatment":
        return "bg-yellow-100 text-yellow-800"
      case "critical":
        return "bg-red-100 text-red-800"
      case "scheduled":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-amber-100 text-amber-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const currentList = activeTab === "outpatients" ? outpatients : admittedPatients

  const filteredPatients = currentList.filter((patient) => {
    const matchesSearch =
      patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.condition?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.id?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter = filterStatus === "all" || patient.status?.toLowerCase() === filterStatus.toLowerCase()

    return matchesSearch && matchesFilter
  })

  if (loading) {
    return (
      <DoctorLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground font-medium uppercase tracking-widest text-xs">Syncing Patients...</p>
          </div>
        </div>
      </DoctorLayout>
    )
  }

  return (
    <DoctorLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">My Patients</h1>
            <p className="text-muted-foreground">Manage and monitor your patients</p>
          </div>
          <Button className="rounded-full shadow-md">Add New Patient</Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-white border border-slate-100 p-1.5 rounded-[2rem] shadow-sm mb-6 w-full max-w-md h-14">
            <TabsTrigger value="outpatients" className="rounded-[1.5rem] px-8 h-full flex-1 data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-black text-xs uppercase tracking-widest">
              <Stethoscope className="w-4 h-4 mr-2" />
              Outpatients
            </TabsTrigger>
            <TabsTrigger value="admitted" className="rounded-[1.5rem] px-8 h-full flex-1 data-[state=active]:bg-red-50 data-[state=active]:text-red-600 font-black text-xs uppercase tracking-widest">
              <BedDouble className="w-4 h-4 mr-2" />
              Admitted (IPD)
            </TabsTrigger>
          </TabsList>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
              <Input
                placeholder={`Search ${activeTab === 'outpatients' ? 'outpatients' : 'admitted patients'} by name, condition, or ID...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-14 rounded-3xl border-slate-100 bg-white shadow-sm focus:ring-primary focus:border-primary text-sm font-medium"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-48 h-14 rounded-3xl border-slate-100 bg-white shadow-sm text-sm font-medium">
                <Filter className="h-4 w-4 mr-2 text-slate-400" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-none shadow-xl">
                <SelectItem value="all">All Patients</SelectItem>
                <SelectItem value="stable">Stable</SelectItem>
                <SelectItem value="under treatment">Under Treatment</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <TabsContent value="outpatients" className="m-0 border-none outline-none">
            {/* Patients Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPatients.length === 0 ? (
                <div className="col-span-full">
                  <Card className="rounded-[3rem] border-dashed border-slate-200 bg-slate-50/50">
                    <CardContent className="p-24 text-center">
                      <User className="h-16 w-16 text-slate-300 mx-auto mb-6 opacity-50" />
                      <h3 className="text-2xl font-black text-slate-400">No outpatients found</h3>
                      <p className="text-slate-400 text-xs mt-2 font-medium tracking-wide">
                        {searchTerm || filterStatus !== "all"
                          ? "Try adjusting your search or filter criteria"
                          : "You have no upcoming or past outpatient consultations"}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                filteredPatients.map(renderPatientCard)
              )}
            </div>
          </TabsContent>

          <TabsContent value="admitted" className="m-0 border-none outline-none">
             {/* Patients Grid */}
             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPatients.length === 0 ? (
                <div className="col-span-full">
                  <Card className="rounded-[3rem] border-dashed border-slate-200 bg-red-50/30">
                    <CardContent className="p-24 text-center">
                      <BedDouble className="h-16 w-16 text-red-200 mx-auto mb-6 opacity-50" />
                      <h3 className="text-2xl font-black text-red-300">No admitted patients</h3>
                      <p className="text-red-300/80 text-xs mt-2 font-medium tracking-wide">
                        {searchTerm || filterStatus !== "all"
                          ? "Try adjusting your search or filter criteria"
                          : "You currently have no patients admitted to the wards"}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                filteredPatients.map(renderPatientCard)
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DoctorLayout>
  )

  function renderPatientCard(patient) {
    return (
      <Card key={patient.id} className="cursor-pointer hover:shadow-xl transition-all duration-300 rounded-[2.5rem] border-none shadow-sm overflow-hidden group">
        <div className="p-6 pb-0">
          <div className="flex justify-between items-start mb-4">
            <div className="flex gap-4">
              <div className={`p-4 rounded-2xl shadow-lg transition-transform group-hover:scale-110 ${patient.type === 'admitted' ? 'bg-red-600 text-white' : 'bg-slate-900 text-white'}`}>
                {patient.type === 'admitted' ? <BedDouble className="w-6 h-6" /> : <User className="w-6 h-6" />}
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 line-clamp-1">{patient.name}</h3>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-1">{patient.age} YRS • {patient.gender}</p>
              </div>
            </div>
          </div>
          <div className="mb-4">
            <Badge className={`rounded-xl border-none font-bold uppercase tracking-wider text-[10px] ${getStatusColor(patient.status)}`}>
              {patient.status}
            </Badge>
          </div>
        </div>

        <div className="space-y-4 bg-slate-50/50 p-6 m-2 rounded-[2rem] border border-slate-100">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Heart className="w-3 h-3" /> Condition
            </span>
            <span className="text-sm font-bold text-slate-900 line-clamp-1 max-w-[150px] text-right">{patient.condition}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Calendar className="w-3 h-3" /> {patient.type === 'admitted' ? 'Admitted' : 'Last Visit'}
            </span>
            <span className="text-sm font-bold text-slate-600">{patient.lastVisit}</span>
          </div>
          {patient.type === 'admitted' && (
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <MapPin className="w-3 h-3" /> Location
              </span>
              <Badge variant="secondary" className="bg-white border-slate-200 text-slate-600 font-bold text-[10px] uppercase">
                {patient.ward} • {patient.bed}
              </Badge>
            </div>
          )}

          <div className="pt-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full bg-white border-slate-200 hover:bg-slate-50 hover:text-primary transition-colors rounded-2xl h-12 font-black text-[10px] uppercase tracking-widest shadow-sm"
                  onClick={() => setSelectedPatient(patient)}
                >
                  View Medical Profile
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl sm:max-w-4xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] p-0 border-none shadow-2xl">
                <div className="bg-slate-900 p-8 text-white sticky top-0 z-10">
                  <DialogHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                        <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-md">
                            <User className="h-8 w-8" />
                        </div>
                        <div>
                            <DialogTitle className="text-2xl font-black">{selectedPatient?.name}</DialogTitle>
                            <DialogDescription className="text-white/60 font-medium text-xs tracking-wider uppercase mt-1">Patient ID: {selectedPatient?.id}</DialogDescription>
                        </div>
                        </div>
                        <Badge className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border-none ${getStatusColor(selectedPatient?.status)}`}>
                        {selectedPatient?.status}
                        </Badge>
                    </div>
                  </DialogHeader>
                </div>

                <div className="p-8">
                {selectedPatient && (
                  <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="bg-slate-100 p-1.5 rounded-[2rem] mb-8 w-full h-14 flex overflow-x-auto">
                      <TabsTrigger value="overview" className="rounded-[1.5rem] px-6 h-full flex-1 data-[state=active]:bg-white data-[state=active]:shadow-sm font-black text-[10px] uppercase tracking-widest">Overview</TabsTrigger>
                      <TabsTrigger value="appointments" className="rounded-[1.5rem] px-6 h-full flex-1 data-[state=active]:bg-white data-[state=active]:shadow-sm font-black text-[10px] uppercase tracking-widest">History</TabsTrigger>
                      <TabsTrigger value="reports" className="rounded-[1.5rem] px-6 h-full flex-1 data-[state=active]:bg-white data-[state=active]:shadow-sm font-black text-[10px] uppercase tracking-widest">Lab Reports</TabsTrigger>
                      <TabsTrigger value="prescriptions" className="rounded-[1.5rem] px-6 h-full flex-1 data-[state=active]:bg-white data-[state=active]:shadow-sm font-black text-[10px] uppercase tracking-widest">Prescriptions</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-6 outline-none">
                      <div className="grid md:grid-cols-2 gap-6">
                        <Card className="rounded-[2rem] border-slate-100 shadow-sm">
                          <CardHeader className="bg-slate-50 rounded-t-[2rem] border-b border-slate-100">
                            <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-500">Personal Info</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-6 p-6">
                            <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><User className="w-4 h-4"/> Demographics</span>
                              <span className="text-sm font-bold text-slate-800">{selectedPatient.age} yrs • {selectedPatient.gender}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Phone className="w-4 h-4"/> Contact</span>
                              <span className="text-sm font-bold text-slate-800">{selectedPatient.phone}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Mail className="w-4 h-4"/> Email</span>
                              <span className="text-sm font-bold text-slate-800">{selectedPatient.email}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><MapPin className="w-4 h-4"/> Address</span>
                              <span className="text-sm font-bold text-slate-800 text-right max-w-[200px]">{selectedPatient.address}</span>
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="rounded-[2rem] border-slate-100 shadow-sm">
                          <CardHeader className="bg-slate-50 rounded-t-[2rem] border-b border-slate-100">
                            <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-500">Medical Data</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-6 p-6">
                            <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Activity className="w-4 h-4"/> Blood Group</span>
                              <Badge className="bg-red-50 text-red-600 hover:bg-red-50 border-none font-black px-3">{selectedPatient.bloodGroup}</Badge>
                            </div>
                            <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Heart className="w-4 h-4"/> Primary Condition</span>
                              <span className="text-sm font-bold text-slate-800">{selectedPatient.condition}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Allergies</span>
                              <span className="text-sm font-bold text-red-600">{selectedPatient.allergies.length > 0 ? selectedPatient.allergies.join(", ") : "None Known"}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Emergency Contact</span>
                              <span className="text-sm font-bold text-slate-800">{selectedPatient.emergencyContact}</span>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>

                    <TabsContent value="appointments" className="space-y-4 outline-none">
                      {selectedPatient.appointments.length === 0 ? (
                        <p className="text-slate-400 text-center py-10 font-medium">No appointment history found.</p>
                      ) : (
                        selectedPatient.appointments.map((appointment, index) => (
                          <Card key={index} className="rounded-2xl border-slate-100 shadow-sm">
                            <CardContent className="p-6">
                              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                  <p className="font-bold text-lg text-slate-800 mb-1">{appointment.reason || "General Consultation"}</p>
                                  <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                                    <Calendar className="w-4 h-4" /> {appointment.date}
                                    {appointment.time && <><span className="mx-2">•</span><Clock className="w-4 h-4" /> {appointment.time}</>}
                                  </div>
                                </div>
                                <Badge className={`rounded-xl border-none font-bold uppercase tracking-wider text-[10px] ${getStatusColor(appointment.status)}`}>
                                  {appointment.status}
                                </Badge>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </TabsContent>

                    <TabsContent value="reports" className="space-y-4 outline-none">
                      {selectedPatient.labReports.length === 0 ? (
                        <p className="text-slate-400 text-center py-10 font-medium">No lab reports found.</p>
                      ) : (
                        selectedPatient.labReports.map((report, index) => (
                          <Card key={index} className="rounded-2xl border-slate-100 shadow-sm">
                            <CardContent className="p-6">
                              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                  <p className="font-bold text-lg text-slate-800 mb-1">{report.test}</p>
                                  <p className="text-sm font-medium text-slate-500 mb-2">Ordered on {report.date}</p>
                                  <div className="inline-flex bg-slate-50 border border-slate-100 rounded-lg p-3 w-full md:w-auto">
                                    <span className="text-xs font-black uppercase text-slate-400 mr-2 tracking-widest">Result:</span>
                                    <span className="text-sm font-bold text-slate-900">{report.result}</span>
                                  </div>
                                </div>
                                <Badge className={`rounded-xl border-none font-bold uppercase tracking-wider text-[10px] ${getStatusColor(report.status)}`}>
                                  {report.status}
                                </Badge>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </TabsContent>

                    <TabsContent value="prescriptions" className="space-y-4 outline-none">
                      <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <div>
                          <h3 className="font-black text-slate-800">Current Medications</h3>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Pharmacological Profile</p>
                        </div>
                        <Button 
                          onClick={() => setIsPrescribeModalOpen(true)}
                          className="rounded-xl font-bold bg-primary hover:bg-primary/90 text-white shadow-sm"
                        >
                          + New Prescription
                        </Button>
                      </div>

                      {selectedPatient.prescriptions.length === 0 ? (
                        <p className="text-slate-400 text-center py-10 font-medium">No prescription history found.</p>
                      ) : (
                        selectedPatient.prescriptions.map((prescription, index) => (
                          <Card key={index} className="rounded-[2rem] border-slate-100 shadow-sm overflow-hidden">
                            <CardHeader className="bg-slate-50 border-b border-slate-100 py-4 px-6">
                              <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                <Calendar className="w-4 h-4"/> Prescribed on {prescription.date}
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                              <div className="space-y-4">
                                {prescription.medicines.map((medicine, medIndex) => (
                                  <div key={medIndex} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                                    <h4 className="font-bold text-lg text-primary mb-4">{medicine.name}</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                      <div className="bg-slate-50 rounded-xl p-3">
                                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Dosage</p>
                                        <p className="font-bold text-slate-800 text-sm">{medicine.dosage}</p>
                                      </div>
                                      <div className="bg-slate-50 rounded-xl p-3">
                                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Frequency</p>
                                        <p className="font-bold text-slate-800 text-sm">{medicine.frequency}</p>
                                      </div>
                                      <div className="bg-slate-50 rounded-xl p-3">
                                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Duration</p>
                                        <p className="font-bold text-slate-800 text-sm">{medicine.duration}</p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </TabsContent>
                  </Tabs>
                )}
                </div>
              </DialogContent>
            </Dialog>
            <Dialog open={isPrescribeModalOpen} onOpenChange={setIsPrescribeModalOpen}>
              <DialogContent className="max-w-md rounded-[2rem]">
                <DialogHeader>
                  <DialogTitle>Add New Prescription</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  {newPrescription.map((med, idx) => (
                    <div key={idx} className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <Input 
                        placeholder="Medicine Name (e.g. Paracetamol 500mg)"
                        value={med.name}
                        onChange={(e) => {
                          const updated = [...newPrescription]
                          updated[idx].name = e.target.value
                          setNewPrescription(updated)
                        }}
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <Input 
                          placeholder="Dosage (e.g. 1 Tablet)"
                          value={med.dosage}
                          onChange={(e) => {
                            const updated = [...newPrescription]
                            updated[idx].dosage = e.target.value
                            setNewPrescription(updated)
                          }}
                        />
                        <Input 
                          placeholder="Frequency (e.g. BD)"
                          value={med.frequency}
                          onChange={(e) => {
                            const updated = [...newPrescription]
                            updated[idx].frequency = e.target.value
                            setNewPrescription(updated)
                          }}
                        />
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full border-dashed" onClick={() => setNewPrescription([...newPrescription, { name: "", dosage: "", frequency: "", duration: "" }])}>
                    + Add Another Medicine
                  </Button>
                  <Button 
                    className="w-full bg-primary hover:bg-primary/90 text-white" 
                    onClick={handlePrescribeSubmit}
                    disabled={prescribeLoading}
                  >
                    {prescribeLoading ? "Saving..." : "Submit Prescription"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </Card>
    )
  }
}
