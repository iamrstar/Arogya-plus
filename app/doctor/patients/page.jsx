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
import { User, Search, Filter, Calendar, Activity, Phone, Mail, MapPin, Heart } from "lucide-react"
import { DoctorLayout } from "@/components/layouts/doctor-layout"

export default function DoctorPatients() {
  const [patients, setPatients] = useState([])
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")

  useEffect(() => {
    fetchPatients()
  }, [])

  const fetchPatients = async () => {
    // Mock data - replace with actual API call
    setPatients([
      {
        id: "PAT001",
        name: "Rahul Verma",
        age: 38,
        gender: "Male",
        phone: "+91-9876543221",
        email: "rahul.verma@email.com",
        address: "123 Main Street, Mumbai",
        bloodGroup: "O+",
        lastVisit: "2024-01-10",
        condition: "Hypertension",
        status: "Stable",
        allergies: ["Penicillin"],
        emergencyContact: "+91-9876543222",
        appointments: [
          { date: "2024-01-15", time: "10:00 AM", reason: "Regular Checkup", status: "Scheduled" },
          { date: "2024-01-10", time: "2:00 PM", reason: "Follow-up", status: "Completed" },
        ],
        labReports: [
          { date: "2024-01-10", test: "Complete Blood Count", result: "Normal", status: "Completed" },
          { date: "2024-01-12", test: "Lipid Profile", result: "Pending", status: "Pending" },
        ],
        prescriptions: [
          {
            date: "2024-01-10",
            medicines: [{ name: "Amlodipine 5mg", dosage: "1 tablet", frequency: "Once daily", duration: "30 days" }],
          },
        ],
      },
      {
        id: "PAT002",
        name: "Sunita Singh",
        age: 34,
        gender: "Female",
        phone: "+91-9876543223",
        email: "sunita.singh@email.com",
        address: "456 Park Avenue, Mumbai",
        bloodGroup: "A+",
        lastVisit: "2024-01-08",
        condition: "Diabetes Type 2",
        status: "Under Treatment",
        allergies: [],
        emergencyContact: "+91-9876543224",
        appointments: [{ date: "2024-01-20", time: "11:30 AM", reason: "Diabetes Management", status: "Scheduled" }],
        labReports: [{ date: "2024-01-08", test: "HbA1c", result: "7.2%", status: "Completed" }],
        prescriptions: [
          {
            date: "2024-01-08",
            medicines: [{ name: "Metformin 500mg", dosage: "1 tablet", frequency: "Twice daily", duration: "30 days" }],
          },
        ],
      },
      {
        id: "PAT003",
        name: "Amit Kumar",
        age: 45,
        gender: "Male",
        phone: "+91-9876543225",
        email: "amit.kumar@email.com",
        address: "789 Garden Road, Mumbai",
        bloodGroup: "B+",
        lastVisit: "2024-01-05",
        condition: "Coronary Artery Disease",
        status: "Critical",
        allergies: ["Aspirin", "Iodine"],
        emergencyContact: "+91-9876543226",
        appointments: [{ date: "2024-01-18", time: "2:00 PM", reason: "Cardiac Evaluation", status: "Scheduled" }],
        labReports: [{ date: "2024-01-05", test: "Cardiac Enzymes", result: "Elevated", status: "Completed" }],
        prescriptions: [
          {
            date: "2024-01-05",
            medicines: [
              { name: "Atorvastatin 20mg", dosage: "1 tablet", frequency: "Once daily", duration: "30 days" },
              { name: "Clopidogrel 75mg", dosage: "1 tablet", frequency: "Once daily", duration: "30 days" },
            ],
          },
        ],
      },
    ])
    setLoading(false)
  }

  const getStatusColor = (status) => {
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
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredPatients = patients.filter((patient) => {
    const matchesSearch =
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.condition.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.id.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter = filterStatus === "all" || patient.status.toLowerCase() === filterStatus.toLowerCase()

    return matchesSearch && matchesFilter
  })

  if (loading) {
    return (
      <DoctorLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading patients...</p>
          </div>
        </div>
      </DoctorLayout>
    )
  }

  return (
    <DoctorLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">My Patients</h1>
            <p className="text-muted-foreground">Manage and monitor your patients</p>
          </div>
          <Button>Add New Patient</Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search patients by name, condition, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Patients</SelectItem>
              <SelectItem value="stable">Stable</SelectItem>
              <SelectItem value="under treatment">Under Treatment</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Patients Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPatients.length === 0 ? (
            <div className="col-span-full">
              <Card>
                <CardContent className="p-8 text-center">
                  <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No patients found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm || filterStatus !== "all"
                      ? "Try adjusting your search or filter criteria"
                      : "Add your first patient to get started"}
                  </p>
                </CardContent>
              </Card>
            </div>
          ) : (
            filteredPatients.map((patient) => (
              <Card key={patient.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-primary/10 rounded-full p-2">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{patient.name}</CardTitle>
                        <CardDescription>
                          {patient.age} years • {patient.gender}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge className={getStatusColor(patient.status)}>{patient.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm">
                    <Heart className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Condition:</span>
                    <span className="font-medium">{patient.condition}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Last Visit:</span>
                    <span className="font-medium">{patient.lastVisit}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Blood Group:</span>
                    <span className="font-medium">{patient.bloodGroup}</span>
                  </div>

                  <div className="pt-2 border-t">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full bg-transparent"
                          onClick={() => setSelectedPatient(patient)}
                        >
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="flex items-center space-x-3">
                            <div className="bg-primary/10 rounded-full p-2">
                              <User className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <span>{selectedPatient?.name}</span>
                              <Badge className={`ml-2 ${getStatusColor(selectedPatient?.status || "")}`}>
                                {selectedPatient?.status}
                              </Badge>
                            </div>
                          </DialogTitle>
                          <DialogDescription>Patient ID: {selectedPatient?.id}</DialogDescription>
                        </DialogHeader>

                        {selectedPatient && (
                          <Tabs defaultValue="overview" className="mt-4">
                            <TabsList className="grid w-full grid-cols-4">
                              <TabsTrigger value="overview">Overview</TabsTrigger>
                              <TabsTrigger value="appointments">Appointments</TabsTrigger>
                              <TabsTrigger value="reports">Lab Reports</TabsTrigger>
                              <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
                            </TabsList>

                            <TabsContent value="overview" className="space-y-4">
                              <div className="grid md:grid-cols-2 gap-4">
                                <Card>
                                  <CardHeader>
                                    <CardTitle className="text-lg">Personal Information</CardTitle>
                                  </CardHeader>
                                  <CardContent className="space-y-3">
                                    <div className="flex items-center space-x-2">
                                      <User className="h-4 w-4 text-muted-foreground" />
                                      <span className="text-sm">
                                        {selectedPatient.age} years, {selectedPatient.gender}
                                      </span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <Phone className="h-4 w-4 text-muted-foreground" />
                                      <span className="text-sm">{selectedPatient.phone}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <Mail className="h-4 w-4 text-muted-foreground" />
                                      <span className="text-sm">{selectedPatient.email}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <MapPin className="h-4 w-4 text-muted-foreground" />
                                      <span className="text-sm">{selectedPatient.address}</span>
                                    </div>
                                  </CardContent>
                                </Card>

                                <Card>
                                  <CardHeader>
                                    <CardTitle className="text-lg">Medical Information</CardTitle>
                                  </CardHeader>
                                  <CardContent className="space-y-3">
                                    <div>
                                      <span className="text-sm text-muted-foreground">Blood Group:</span>
                                      <span className="text-sm font-medium ml-2">{selectedPatient.bloodGroup}</span>
                                    </div>
                                    <div>
                                      <span className="text-sm text-muted-foreground">Current Condition:</span>
                                      <span className="text-sm font-medium ml-2">{selectedPatient.condition}</span>
                                    </div>
                                    <div>
                                      <span className="text-sm text-muted-foreground">Allergies:</span>
                                      <span className="text-sm font-medium ml-2">
                                        {selectedPatient.allergies.length > 0
                                          ? selectedPatient.allergies.join(", ")
                                          : "None"}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-sm text-muted-foreground">Emergency Contact:</span>
                                      <span className="text-sm font-medium ml-2">
                                        {selectedPatient.emergencyContact}
                                      </span>
                                    </div>
                                  </CardContent>
                                </Card>
                              </div>
                            </TabsContent>

                            <TabsContent value="appointments" className="space-y-4">
                              {selectedPatient.appointments.map((appointment, index) => (
                                <Card key={index}>
                                  <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <p className="font-medium">{appointment.reason}</p>
                                        <p className="text-sm text-muted-foreground">
                                          {appointment.date} at {appointment.time}
                                        </p>
                                      </div>
                                      <Badge className={getStatusColor(appointment.status)}>{appointment.status}</Badge>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </TabsContent>

                            <TabsContent value="reports" className="space-y-4">
                              {selectedPatient.labReports.map((report, index) => (
                                <Card key={index}>
                                  <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <p className="font-medium">{report.test}</p>
                                        <p className="text-sm text-muted-foreground">Date: {report.date}</p>
                                        <p className="text-sm">Result: {report.result}</p>
                                      </div>
                                      <Badge className={getStatusColor(report.status)}>{report.status}</Badge>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </TabsContent>

                            <TabsContent value="prescriptions" className="space-y-4">
                              {selectedPatient.prescriptions.map((prescription, index) => (
                                <Card key={index}>
                                  <CardHeader>
                                    <CardTitle className="text-lg">Prescription - {prescription.date}</CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="space-y-3">
                                      {prescription.medicines.map((medicine, medIndex) => (
                                        <div key={medIndex} className="border rounded-lg p-3 bg-muted/30">
                                          <h4 className="font-medium">{medicine.name}</h4>
                                          <div className="grid grid-cols-3 gap-2 mt-2 text-sm text-muted-foreground">
                                            <div>
                                              <span className="font-medium">Dosage:</span> {medicine.dosage}
                                            </div>
                                            <div>
                                              <span className="font-medium">Frequency:</span> {medicine.frequency}
                                            </div>
                                            <div>
                                              <span className="font-medium">Duration:</span> {medicine.duration}
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </TabsContent>
                          </Tabs>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </DoctorLayout>
  )
}
