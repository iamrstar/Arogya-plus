"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Calendar, Clock, CheckCircle, Activity, FileText, Pill, TestTube, Bed, Car } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { StaffLayout } from "@/components/layouts/staff-layout"

export default function StaffDashboard() {
  const { user } = useAuth()
  const [dashboardData, setDashboardData] = useState({
    tasks: [],
    patients: [],
    stats: {
      totalTasks: 0,
      completedToday: 0,
      pendingTasks: 0,
      assignedPatients: 0,
    },
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Mock data based on staff role - replace with actual API calls
      const mockData = getRoleBasedData(user?.role)
      setDashboardData(mockData)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      setLoading(false)
    }
  }

  const getRoleBasedData = (role) => {
    const baseData = {
      stats: {
        totalTasks: 12,
        completedToday: 8,
        pendingTasks: 4,
        assignedPatients: 15,
      },
    }

    switch (role?.toLowerCase()) {
      case "nurse":
        return {
          ...baseData,
          tasks: [
            {
              id: "T001",
              type: "Medication",
              patient: "Rahul Verma",
              description: "Administer morning medications",
              time: "09:00 AM",
              status: "Pending",
              priority: "High",
            },
            {
              id: "T002",
              type: "Vital Signs",
              patient: "Sunita Singh",
              description: "Check vital signs and record",
              time: "10:30 AM",
              status: "Completed",
              priority: "Normal",
            },
            {
              id: "T003",
              type: "Wound Care",
              patient: "Amit Kumar",
              description: "Change surgical dressing",
              time: "02:00 PM",
              status: "Pending",
              priority: "High",
            },
          ],
          patients: [
            { id: "PAT001", name: "Rahul Verma", room: "301-A", condition: "Post-surgery", status: "Stable" },
            { id: "PAT002", name: "Sunita Singh", room: "302-B", condition: "Diabetes", status: "Monitoring" },
            { id: "PAT003", name: "Amit Kumar", room: "303-A", condition: "Cardiac", status: "Critical" },
          ],
        }

      case "receptionist":
        return {
          ...baseData,
          tasks: [
            {
              id: "T001",
              type: "Appointment",
              patient: "New Patient",
              description: "Schedule appointment with Dr. Kumar",
              time: "09:15 AM",
              status: "Completed",
              priority: "Normal",
            },
            {
              id: "T002",
              type: "Registration",
              patient: "Walk-in Patient",
              description: "Complete patient registration",
              time: "11:00 AM",
              status: "Pending",
              priority: "High",
            },
            {
              id: "T003",
              type: "Insurance",
              patient: "Priya Sharma",
              description: "Verify insurance coverage",
              time: "01:30 PM",
              status: "Pending",
              priority: "Normal",
            },
          ],
          patients: [
            {
              id: "PAT001",
              name: "Today's Appointments",
              room: "15 scheduled",
              condition: "Various",
              status: "Active",
            },
            { id: "PAT002", name: "Walk-in Patients", room: "3 waiting", condition: "Various", status: "Waiting" },
            { id: "PAT003", name: "Insurance Claims", room: "8 pending", condition: "Various", status: "Processing" },
          ],
        }

      case "lab technician":
        return {
          ...baseData,
          tasks: [
            {
              id: "T001",
              type: "Blood Test",
              patient: "Rahul Verma",
              description: "Complete Blood Count analysis",
              time: "08:30 AM",
              status: "Completed",
              priority: "High",
            },
            {
              id: "T002",
              type: "Urine Test",
              patient: "Sunita Singh",
              description: "Urine analysis for diabetes monitoring",
              time: "10:00 AM",
              status: "In Progress",
              priority: "Normal",
            },
            {
              id: "T003",
              type: "X-Ray",
              patient: "Amit Kumar",
              description: "Chest X-ray interpretation",
              time: "02:30 PM",
              status: "Pending",
              priority: "High",
            },
          ],
          patients: [
            { id: "LAB001", name: "Blood Samples", room: "12 pending", condition: "Analysis", status: "Processing" },
            { id: "LAB002", name: "Urine Samples", room: "8 pending", condition: "Analysis", status: "Processing" },
            { id: "LAB003", name: "Reports Ready", room: "15 completed", condition: "Ready", status: "Completed" },
          ],
        }

      case "pharmacist":
        return {
          ...baseData,
          tasks: [
            {
              id: "T001",
              type: "Prescription",
              patient: "Rahul Verma",
              description: "Prepare cardiac medications",
              time: "09:00 AM",
              status: "Completed",
              priority: "High",
            },
            {
              id: "T002",
              type: "Inventory",
              patient: "Stock Check",
              description: "Check insulin stock levels",
              time: "11:00 AM",
              status: "Pending",
              priority: "Normal",
            },
            {
              id: "T003",
              type: "Consultation",
              patient: "Sunita Singh",
              description: "Medication counseling session",
              time: "03:00 PM",
              status: "Pending",
              priority: "Normal",
            },
          ],
          patients: [
            { id: "MED001", name: "Prescriptions", room: "18 pending", condition: "Various", status: "Processing" },
            { id: "MED002", name: "Low Stock Items", room: "5 items", condition: "Reorder", status: "Alert" },
            { id: "MED003", name: "Consultations", room: "3 scheduled", condition: "Various", status: "Scheduled" },
          ],
        }

      default:
        return {
          ...baseData,
          tasks: [
            {
              id: "T001",
              type: "General",
              patient: "Hospital Operations",
              description: "Daily operational tasks",
              time: "09:00 AM",
              status: "Pending",
              priority: "Normal",
            },
          ],
          patients: [
            { id: "GEN001", name: "General Tasks", room: "Various", condition: "Operational", status: "Active" },
          ],
        }
    }
  }

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "in progress":
        return "bg-blue-100 text-blue-800"
      case "critical":
        return "bg-red-100 text-red-800"
      case "stable":
        return "bg-green-100 text-green-800"
      case "monitoring":
        return "bg-yellow-100 text-yellow-800"
      case "alert":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-800"
      case "normal":
        return "bg-green-100 text-green-800"
      case "low":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getRoleIcon = (role) => {
    switch (role?.toLowerCase()) {
      case "nurse":
        return <Activity className="h-8 w-8 text-primary" />
      case "receptionist":
        return <Users className="h-8 w-8 text-primary" />
      case "lab technician":
        return <TestTube className="h-8 w-8 text-primary" />
      case "pharmacist":
        return <Pill className="h-8 w-8 text-primary" />
      case "ambulance driver":
        return <Car className="h-8 w-8 text-primary" />
      case "ward boy":
        return <Bed className="h-8 w-8 text-primary" />
      default:
        return <Users className="h-8 w-8 text-primary" />
    }
  }

  if (loading) {
    return (
      <StaffLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </StaffLayout>
    )
  }

  return (
    <StaffLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-primary">Welcome, {user?.name}!</h1>
              <p className="text-muted-foreground">
                {user?.role} • {user?.shift} Shift • {dashboardData.stats.pendingTasks} tasks pending
              </p>
            </div>
            <div className="bg-primary/20 rounded-full p-3">{getRoleIcon(user?.role)}</div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 rounded-full p-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Tasks</p>
                  <p className="text-xl font-bold">{dashboardData.stats.totalTasks}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="bg-green-100 rounded-full p-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Completed Today</p>
                  <p className="text-xl font-bold">{dashboardData.stats.completedToday}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="bg-yellow-100 rounded-full p-2">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending Tasks</p>
                  <p className="text-xl font-bold">{dashboardData.stats.pendingTasks}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="bg-purple-100 rounded-full p-2">
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Assigned</p>
                  <p className="text-xl font-bold">{dashboardData.stats.assignedPatients}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="tasks" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="tasks">My Tasks</TabsTrigger>
            <TabsTrigger value="assignments">My Assignments</TabsTrigger>
          </TabsList>

          {/* Tasks Tab */}
          <TabsContent value="tasks" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Today's Tasks</h2>
              <Button variant="outline">Add Task</Button>
            </div>

            <div className="grid gap-4">
              {dashboardData.tasks.map((task) => (
                <Card key={task.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="bg-primary/10 rounded-full p-3">
                          {task.type === "Medication" && <Pill className="h-5 w-5 text-primary" />}
                          {task.type === "Vital Signs" && <Activity className="h-5 w-5 text-primary" />}
                          {task.type === "Blood Test" && <TestTube className="h-5 w-5 text-primary" />}
                          {task.type === "Appointment" && <Calendar className="h-5 w-5 text-primary" />}
                          {!["Medication", "Vital Signs", "Blood Test", "Appointment"].includes(task.type) && (
                            <FileText className="h-5 w-5 text-primary" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold">{task.type}</h3>
                          <p className="text-sm text-muted-foreground">{task.patient}</p>
                          <p className="text-sm text-muted-foreground">{task.description}</p>
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{task.time}</span>
                        </div>
                        <div className="flex space-x-2">
                          <Badge className={getStatusColor(task.status)}>{task.status}</Badge>
                          <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                        </div>
                        {task.status === "Pending" && (
                          <Button size="sm" className="mt-2">
                            Mark Complete
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Assignments Tab */}
          <TabsContent value="assignments" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">My Assignments</h2>
              <Button variant="outline">View All</Button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dashboardData.patients.map((assignment) => (
                <Card key={assignment.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="bg-secondary/10 rounded-full p-2">
                        {user?.role === "nurse" && <Activity className="h-5 w-5 text-secondary" />}
                        {user?.role === "receptionist" && <Users className="h-5 w-5 text-secondary" />}
                        {user?.role === "lab technician" && <TestTube className="h-5 w-5 text-secondary" />}
                        {user?.role === "pharmacist" && <Pill className="h-5 w-5 text-secondary" />}
                        {!["nurse", "receptionist", "lab technician", "pharmacist"].includes(user?.role) && (
                          <FileText className="h-5 w-5 text-secondary" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold">{assignment.name}</h3>
                        <p className="text-sm text-muted-foreground">{assignment.room}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Condition:</span>
                        <span className="text-sm font-medium">{assignment.condition}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Status:</span>
                        <Badge className={getStatusColor(assignment.status)}>{assignment.status}</Badge>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="w-full mt-3 bg-transparent">
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </StaffLayout>
  )
}
