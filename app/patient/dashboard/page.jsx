"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/components/auth/auth-provider"
import { PatientLayout } from "@/components/layouts/patient-layout"

export default function PatientDashboard() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [labReports, setLabReports] = useState([])
  const [prescriptions, setPrescriptions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch patient data
    fetchPatientData()
  }, [])

  const fetchPatientData = async () => {
    try {
      // Mock data for now - replace with actual API calls
      setAppointments([
        {
          id: "APT001",
          doctorName: "Dr. Rajesh Kumar",
          specialization: "Cardiology",
          date: "2024-01-15",
          time: "10:00 AM",
          status: "Scheduled",
          reason: "Regular Checkup",
        },
        {
          id: "APT002",
          doctorName: "Dr. Priya Sharma",
          specialization: "Neurology",
          date: "2024-01-20",
          time: "2:30 PM",
          status: "Completed",
          reason: "Follow-up",
        },
      ])

      setLabReports([
        {
          id: "LAB001",
          testName: "Complete Blood Count",
          date: "2024-01-10",
          status: "Completed",
          result: "Normal",
          doctorName: "Dr. Rajesh Kumar",
        },
        {
          id: "LAB002",
          testName: "Lipid Profile",
          date: "2024-01-12",
          status: "Pending",
          result: "-",
          doctorName: "Dr. Rajesh Kumar",
        },
      ])

      setPrescriptions([
        {
          id: "PRES001",
          doctorName: "Dr. Rajesh Kumar",
          date: "2024-01-10",
          medicines: [
            { name: "Paracetamol 500mg", dosage: "1 tablet", frequency: "Twice daily", duration: "5 days" },
            { name: "Amoxicillin 250mg", dosage: "1 capsule", frequency: "Three times daily", duration: "7 days" },
          ],
        },
      ])

      setLoading(false)
    } catch (error) {
      console.error("Error fetching patient data:", error)
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "scheduled":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <PatientLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading your dashboard...</p>
          </div>
        </div>
      </PatientLayout>
    )
  }

  return (
    <PatientLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-primary">Welcome back, {user?.name}!</h1>
              <p className="text-muted-foreground">Here's your health overview for today</p>
            </div>
            <div className="bg-primary/20 rounded-full p-3">
              <span className="text-2xl">❤️</span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 rounded-full p-2">
                  <span className="text-xl">📅</span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Upcoming</p>
                  <p className="text-xl font-bold">{appointments.filter((apt) => apt.status === "Scheduled").length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="bg-green-100 rounded-full p-2">
                  <span className="text-xl">📋</span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Lab Reports</p>
                  <p className="text-xl font-bold">{labReports.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="bg-purple-100 rounded-full p-2">
                  <span className="text-xl">💊</span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Prescriptions</p>
                  <p className="text-xl font-bold">{prescriptions.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="bg-orange-100 rounded-full p-2">
                  <span className="text-xl">📊</span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Health Score</p>
                  <p className="text-xl font-bold">85%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="appointments" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="reports">Lab Reports</TabsTrigger>
            <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          {/* Appointments Tab */}
          <TabsContent value="appointments" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">My Appointments</h2>
              <Button>Book New Appointment</Button>
            </div>

            <div className="grid gap-4">
              {appointments.map((appointment) => (
                <Card key={appointment.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="bg-primary/10 rounded-full p-3">
                          <span className="text-2xl">👨‍⚕️</span>
                        </div>
                        <div>
                          <h3 className="font-semibold">{appointment.doctorName}</h3>
                          <p className="text-sm text-muted-foreground">{appointment.specialization}</p>
                          <p className="text-sm text-muted-foreground">{appointment.reason}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-2 mb-2">
                          <span>📅</span>
                          <span className="text-sm">{appointment.date}</span>
                        </div>
                        <div className="flex items-center space-x-2 mb-2">
                          <span>🕐</span>
                          <span className="text-sm">{appointment.time}</span>
                        </div>
                        <Badge className={getStatusColor(appointment.status)}>{appointment.status}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Lab Reports Tab */}
          <TabsContent value="reports" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Lab Reports</h2>
              <Button variant="outline">Request New Test</Button>
            </div>

            <div className="grid gap-4">
              {labReports.map((report) => (
                <Card key={report.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="bg-secondary/10 rounded-full p-3">
                          <span className="text-2xl">🧪</span>
                        </div>
                        <div>
                          <h3 className="font-semibold">{report.testName}</h3>
                          <p className="text-sm text-muted-foreground">Ordered by {report.doctorName}</p>
                          <p className="text-sm text-muted-foreground">Date: {report.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusColor(report.status)}>{report.status}</Badge>
                        {report.status === "Completed" && (
                          <div className="mt-2">
                            <p className="text-sm font-medium">Result: {report.result}</p>
                            <Button size="sm" variant="outline" className="mt-1 bg-transparent">
                              View Report
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Prescriptions Tab */}
          <TabsContent value="prescriptions" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">My Prescriptions</h2>
              <Button variant="outline">Order Medicines</Button>
            </div>

            <div className="grid gap-4">
              {prescriptions.map((prescription) => (
                <Card key={prescription.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">Prescription from {prescription.doctorName}</CardTitle>
                        <CardDescription>Date: {prescription.date}</CardDescription>
                      </div>
                      <div className="bg-primary/10 rounded-full p-2">
                        <span className="text-xl">💊</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {prescription.medicines.map((medicine, index) => (
                        <div key={index} className="border rounded-lg p-3 bg-muted/30">
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
            </div>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">My Profile</h2>
              <Button variant="outline">Edit Profile</Button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">👤</span>
                    <div>
                      <p className="font-medium">{user?.name}</p>
                      <p className="text-sm text-muted-foreground">Full Name</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">✉️</span>
                    <div>
                      <p className="font-medium">{user?.email}</p>
                      <p className="text-sm text-muted-foreground">Email Address</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">📱</span>
                    <div>
                      <p className="font-medium">{user?.phone}</p>
                      <p className="text-sm text-muted-foreground">Phone Number</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">📍</span>
                    <div>
                      <p className="font-medium">{user?.address || "Not provided"}</p>
                      <p className="text-sm text-muted-foreground">Address</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Medical Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">🩸</span>
                    <div>
                      <p className="font-medium">{user?.bloodGroup || "Not specified"}</p>
                      <p className="text-sm text-muted-foreground">Blood Group</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">⚠️</span>
                    <div>
                      <p className="font-medium">
                        {user?.allergies && user.allergies.length > 0 ? user.allergies.join(", ") : "None"}
                      </p>
                      <p className="text-sm text-muted-foreground">Allergies</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">🚨</span>
                    <div>
                      <p className="font-medium">{user?.emergencyContact || "Not provided"}</p>
                      <p className="text-sm text-muted-foreground">Emergency Contact</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PatientLayout>
  )
}
