"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, FileText, Clock, Activity, CheckCircle, User, TestTube, Pill } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { DoctorLayout } from "@/components/layouts/doctor-layout"

export default function DoctorDashboard() {
  const { user } = useAuth()
  const [dashboardData, setDashboardData] = useState({
    todayAppointments: [],
    recentPatients: [],
    pendingReports: [],
    stats: {
      totalPatients: 0,
      todayAppointments: 0,
      pendingReports: 0,
      completedToday: 0,
    },
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Mock data - replace with actual API calls
      setDashboardData({
        todayAppointments: [
          {
            id: "APT001",
            patientName: "Rahul Verma",
            time: "10:00 AM",
            reason: "Regular Checkup",
            status: "Scheduled",
            patientId: "PAT001",
          },
          {
            id: "APT002",
            patientName: "Sunita Singh",
            time: "11:30 AM",
            reason: "Follow-up",
            status: "In Progress",
            patientId: "PAT002",
          },
          {
            id: "APT003",
            patientName: "Amit Kumar",
            time: "2:00 PM",
            reason: "Chest Pain",
            status: "Scheduled",
            patientId: "PAT003",
          },
        ],
        recentPatients: [
          {
            id: "PAT001",
            name: "Rahul Verma",
            lastVisit: "2024-01-10",
            condition: "Hypertension",
            status: "Stable",
          },
          {
            id: "PAT002",
            name: "Sunita Singh",
            lastVisit: "2024-01-08",
            condition: "Diabetes",
            status: "Under Treatment",
          },
          {
            id: "PAT003",
            name: "Amit Kumar",
            lastVisit: "2024-01-05",
            condition: "Heart Disease",
            status: "Critical",
          },
        ],
        pendingReports: [
          {
            id: "LAB001",
            patientName: "Rahul Verma",
            testName: "Complete Blood Count",
            date: "2024-01-12",
            priority: "Normal",
          },
          {
            id: "LAB002",
            patientName: "Sunita Singh",
            testName: "HbA1c",
            date: "2024-01-11",
            priority: "High",
          },
        ],
        stats: {
          totalPatients: 156,
          todayAppointments: 8,
          pendingReports: 12,
          completedToday: 5,
        },
      })
      setLoading(false)
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "scheduled":
        return "bg-blue-100 text-blue-800"
      case "in progress":
        return "bg-yellow-100 text-yellow-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "stable":
        return "bg-green-100 text-green-800"
      case "under treatment":
        return "bg-yellow-100 text-yellow-800"
      case "critical":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "normal":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <DoctorLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </DoctorLayout>
    )
  }

  return (
    <DoctorLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-primary">Good morning, {user?.name}!</h1>
              <p className="text-muted-foreground">
                You have {dashboardData.stats.todayAppointments} appointments today
              </p>
            </div>
            <div className="bg-primary/20 rounded-full p-3">
              <Activity className="h-8 w-8 text-primary" />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 rounded-full p-2">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Patients</p>
                  <p className="text-xl font-bold">{dashboardData.stats.totalPatients}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="bg-green-100 rounded-full p-2">
                  <Calendar className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Today's Appointments</p>
                  <p className="text-xl font-bold">{dashboardData.stats.todayAppointments}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="bg-orange-100 rounded-full p-2">
                  <FileText className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending Reports</p>
                  <p className="text-xl font-bold">{dashboardData.stats.pendingReports}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="bg-purple-100 rounded-full p-2">
                  <CheckCircle className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Completed Today</p>
                  <p className="text-xl font-bold">{dashboardData.stats.completedToday}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Today's Appointments */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Today's Appointments</CardTitle>
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData.todayAppointments.map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="bg-primary/10 rounded-full p-2">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{appointment.patientName}</p>
                          <p className="text-sm text-muted-foreground">{appointment.reason}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-2 mb-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{appointment.time}</span>
                        </div>
                        <Badge className={getStatusColor(appointment.status)}>{appointment.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Appointment
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <TestTube className="h-4 w-4 mr-2" />
                  Order Lab Test
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Pill className="h-4 w-4 mr-2" />
                  Write Prescription
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <FileText className="h-4 w-4 mr-2" />
                  View Patient Records
                </Button>
              </CardContent>
            </Card>

            {/* Pending Reports */}
            <Card>
              <CardHeader>
                <CardTitle>Pending Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dashboardData.pendingReports.map((report) => (
                    <div key={report.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-sm">{report.patientName}</p>
                        <Badge className={getPriorityColor(report.priority)}>{report.priority}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{report.testName}</p>
                      <p className="text-xs text-muted-foreground">{report.date}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Patients */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Patients</CardTitle>
              <Button variant="outline" size="sm">
                View All Patients
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              {dashboardData.recentPatients.map((patient) => (
                <div key={patient.id} className="p-4 border rounded-lg">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="bg-primary/10 rounded-full p-2">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{patient.name}</p>
                      <p className="text-sm text-muted-foreground">Last visit: {patient.lastVisit}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Condition:</span>
                      <span className="text-sm font-medium">{patient.condition}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Status:</span>
                      <Badge className={getStatusColor(patient.status)}>{patient.status}</Badge>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-3 bg-transparent">
                    View Details
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DoctorLayout>
  )
}
