"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DoctorLayout } from "@/components/layouts/doctor-layout"
import { Calendar, Clock, User, Search, Filter } from "lucide-react"

export default function DoctorAppointments() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")

  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    // Mock data - replace with actual API call
    setAppointments([
      {
        id: "APT001",
        patientName: "John Doe",
        patientId: "PAT001",
        date: "2024-01-15",
        time: "10:00 AM",
        status: "Scheduled",
        reason: "Regular Checkup",
        location: "Room 301",
      },
      {
        id: "APT002",
        patientName: "Jane Smith",
        patientId: "PAT002",
        date: "2024-01-15",
        time: "11:00 AM",
        status: "Scheduled",
        reason: "Follow-up consultation",
        location: "Room 301",
      },
      {
        id: "APT003",
        patientName: "Robert Johnson",
        patientId: "PAT003",
        date: "2024-01-20",
        time: "2:30 PM",
        status: "Completed",
        reason: "Post-treatment review",
        location: "Room 301",
      },
    ])
    setLoading(false)
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
      appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.reason.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter = filterStatus === "all" || appointment.status.toLowerCase() === filterStatus.toLowerCase()

    return matchesSearch && matchesFilter
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

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search appointments..."
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
                      {appointment.status === "Scheduled" && (
                        <div className="flex space-x-2 mt-2">
                          <Button size="sm" variant="outline">
                            Start Consultation
                          </Button>
                          <Button size="sm" variant="outline">
                            Reschedule
                          </Button>
                        </div>
                      )}
                      {appointment.status === "Completed" && (
                        <Button size="sm" variant="outline" className="w-full bg-transparent">
                          View Notes
                        </Button>
                      )}
                    </div>
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
