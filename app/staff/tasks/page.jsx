"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Clock,
  Plus,
  Search,
  Filter,
  CheckCircle,
  Activity,
  FileText,
  Pill,
  TestTube,
  Users,
  Calendar,
} from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { StaffLayout } from "@/components/layouts/staff-layout"

export default function StaffTasks() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterPriority, setFilterPriority] = useState("all")
  const [newTask, setNewTask] = useState({
    type: "",
    patient: "",
    description: "",
    time: "",
    priority: "Normal",
  })

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      setLoading(true)
      // 1. Fetch Admin/Administrative Tasks if role allows
      const staffRes = await fetch(`/api/staff/tasks?role=${user?.role}&staffId=${user?.userId}`)
      const staffTasks = await staffRes.json()

      // 2. If Nurse, fetch Admitted Patients to get Medication Protocols
      let clinicalTasks = []
      if (user?.role?.toLowerCase() === "nurse") {
        const patientRes = await fetch("/api/admin/admitted")
        const patients = await patientRes.json()

        patients.forEach(p => {
          // FILTER: Only show patients in the nurse's department
          if (p.department !== user?.department) return

          if (p.dailyMedicationPlan && Array.isArray(p.dailyMedicationPlan)) {
            p.dailyMedicationPlan.forEach(plan => {
              // Convert plan to task format
              clinicalTasks.push({
                _id: plan._id,
                id: plan._id,
                type: "Medication",
                patient: p.name,
                patientId: p._id,
                description: `${plan.medicineName} - ${plan.dosage} (${plan.instructions})`,
                medicineId: plan.medicineId,
                time: plan.shift,
                date: new Date().toISOString().split('T')[0],
                status: (plan.status === "completed" || plan.status === "administered") ? "Completed" : "Pending",
                priority: "High",
                assignedBy: "Doctor",
                room: p.bed,
                isClinical: true
              })
            })
          }
        })
      }

      // 3. Filter Administrative Tasks by department if applicable
      const filteredStaffTasks = staffTasks.filter(t => {
        if (!user?.department) return true
        if (t.type === "Shifting" && t.to) {
          return t.to.toLowerCase().includes(user.department.toLowerCase()) || t.patientName
        }
        return true
      })

      const allTasks = [...filteredStaffTasks, ...clinicalTasks]
      setTasks(allTasks)
    } catch (e) {
      console.error("Error fetching tasks:", e)
    }
    setLoading(false)
  }

  const handleAddTask = async (e) => {
    e.preventDefault()
    const task = {
      id: `T${Date.now()}`,
      ...newTask,
      date: new Date().toISOString().split("T")[0],
      status: "Pending",
      assignedBy: user?.name,
    }

    setTasks([...tasks, task])
    setNewTask({
      type: "",
      patient: "",
      description: "",
      time: "",
      priority: "Normal",
    })
  }

  const handleStatusChange = async (taskId, newStatus, isClinical, patientId, medicineId) => {
    if (isClinical) {
      // Clinical tasks need to be updated via patient protocol API
      try {
        const res = await fetch("/api/admin/admitted", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ patientId, planItemId: taskId, action: "medicate", medicineId, quantity: 1 })
        })
        if (res.ok) fetchTasks()
      } catch (e) { console.error(e) }
    } else {
      // Staff tasks updated via staff tasks API
      try {
        const res = await fetch("/api/staff/tasks", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ taskId, action: newStatus === "Completed" ? "complete" : "accept" })
        })
        if (res.ok) fetchTasks()
      } catch (e) { console.error(e) }
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
      case "overdue":
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

  const getTaskIcon = (type) => {
    switch (type.toLowerCase()) {
      case "medication":
        return <Pill className="h-5 w-5 text-primary" />
      case "vital signs":
        return <Activity className="h-5 w-5 text-primary" />
      case "lab sample":
        return <TestTube className="h-5 w-5 text-primary" />
      case "wound care":
        return <FileText className="h-5 w-5 text-primary" />
      case "patient education":
        return <Users className="h-5 w-5 text-primary" />
      default:
        return <FileText className="h-5 w-5 text-primary" />
    }
  }

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.type.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = filterStatus === "all" || task.status.toLowerCase() === filterStatus.toLowerCase()
    const matchesPriority = filterPriority === "all" || task.priority.toLowerCase() === filterPriority.toLowerCase()

    return matchesSearch && matchesStatus && matchesPriority
  })

  if (loading) {
    return (
      <StaffLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading tasks...</p>
          </div>
        </div>
      </StaffLayout>
    )
  }

  return (
    <StaffLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">My Tasks</h1>
            <p className="text-muted-foreground">Manage your daily tasks and assignments</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Task</DialogTitle>
                <DialogDescription>Create a new task for yourself or your team</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddTask} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Task Type</Label>
                    <Select value={newTask.type} onValueChange={(value) => setNewTask({ ...newTask, type: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Medication">Medication</SelectItem>
                        <SelectItem value="Vital Signs">Vital Signs</SelectItem>
                        <SelectItem value="Lab Sample">Lab Sample</SelectItem>
                        <SelectItem value="Wound Care">Wound Care</SelectItem>
                        <SelectItem value="Patient Education">Patient Education</SelectItem>
                        <SelectItem value="Documentation">Documentation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="patient">Patient</Label>
                    <Input
                      id="patient"
                      value={newTask.patient}
                      onChange={(e) => setNewTask({ ...newTask, patient: e.target.value })}
                      placeholder="Patient name"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    placeholder="Task description"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="time">Time</Label>
                    <Input
                      id="time"
                      type="time"
                      value={newTask.time}
                      onChange={(e) => setNewTask({ ...newTask, time: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={newTask.priority}
                      onValueChange={(value) => setNewTask({ ...newTask, priority: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Normal">Normal</SelectItem>
                        <SelectItem value="Low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button type="submit" className="w-full">
                  Add Task
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
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
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="high">High Priority</SelectItem>
              <SelectItem value="normal">Normal Priority</SelectItem>
              <SelectItem value="low">Low Priority</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tasks List */}
        <div className="grid gap-4">
          {filteredTasks.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No tasks found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || filterStatus !== "all" || filterPriority !== "all"
                    ? "Try adjusting your search or filter criteria"
                    : "Add your first task to get started"}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredTasks.map((task) => (
              <Card key={task.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="bg-primary/10 rounded-full p-3">{getTaskIcon(task.type)}</div>
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold">{task.type}</h3>
                          <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          <strong>Patient:</strong> {task.patient} {task.room && `• Room: ${task.room}`}
                        </p>
                        <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                        {task.assignedBy && (
                          <p className="text-xs text-muted-foreground">Assigned by: {task.assignedBy}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{task.time}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{task.date}</span>
                      </div>
                      <Badge className={getStatusColor(task.status)}>{task.status}</Badge>
                      <div className="flex space-x-2 mt-2">
                        {task.status === "Pending" && (
                          <>
                            <Button size="sm" onClick={() => handleStatusChange(task.id, "In Progress", task.isClinical, task.patientId, task.medicineId)}>
                              {task.isClinical ? "Mark as Given" : "Start"}
                            </Button>
                            {!task.isClinical && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleStatusChange(task.id, "Completed", task.isClinical, task.patientId, task.medicineId)}
                              >
                                Complete
                              </Button>
                            )}
                          </>
                        )}
                        {task.status === "In Progress" && (
                          <Button size="sm" onClick={() => handleStatusChange(task.id, "Completed", task.isClinical, task.patientId, task.medicineId)}>
                            <CheckCircle className="h-4 w-4 mr-1" />
                            {task.isClinical ? "Confirm Given" : "Complete"}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </StaffLayout>
  )
}
