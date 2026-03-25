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
import { Calendar, Clock, User, Plus, Search, Filter, AlertCircle, Loader2, ArrowRight, CheckCircle2 } from "lucide-react"
import { PatientLayout } from "@/components/layouts/patient-layout"
import { useAuth } from "@/components/auth/auth-provider"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "sonner"

export default function PatientAppointments() {
  const { token, user } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null) // ID of appointment being processed
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [rescheduleData, setRescheduleData] = useState({ date: "", time: "" })
  const [bookingForm, setBookingForm] = useState({
    doctorId: "",
    doctorName: "",
    specialization: "",
    date: "",
    time: "",
    reason: "",
  })

  useEffect(() => {
    fetchAppointments()
    fetchDoctors()

    // Clinical Refresh Listener for AI-driven booking
    const handleClinicalRefresh = () => {
      fetchAppointments()
    }
    window.addEventListener("clinical-appointment-update", handleClinicalRefresh)
    return () => window.removeEventListener("clinical-appointment-update", handleClinicalRefresh)
  }, [])

  const fetchAppointments = async () => {
    try {
      const response = await fetch("/api/appointments", {
        headers: { "Authorization": `Bearer ${token}` }
      })
      const data = await response.json()
      if (response.ok) {
        setAppointments(data)
      } else {
        setError("Failed to synchronize with clinical registry")
      }
    } catch (err) {
      setError("Clinical network timeout. Please retry.")
    } finally {
      setLoading(false)
    }
  }

  const fetchDoctors = async () => {
    try {
      const response = await fetch("/api/doctors")
      const data = await response.json()
      if (response.ok) {
        setDoctors(data)
      }
    } catch (err) {
      console.error("Clinical registry sync error:", err)
    }
  }

  const handleBookAppointment = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const doctor = doctors.find(d => d.id === bookingForm.doctorId)
    const appointmentData = {
      ...bookingForm,
      doctorName: doctor?.name,
      specialization: doctor?.specialization,
      appointmentDate: bookingForm.date,
    }

    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(appointmentData),
      })

      if (response.ok) {
        toast.success("Appointment Synchronized!")
        fetchAppointments()
        setBookingForm({ doctorId: "", doctorName: "", specialization: "", date: "", time: "", reason: "" })
      } else {
        setError("Clinical scheduling failure. Check availability.")
      }
    } catch (err) {
      setError("Network interruption. Retry scheduling.")
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
        toast.success("Appointment Voided Successfully")
        fetchAppointments()
      } else {
        toast.error("Vocation failure. Record is locked.")
      }
    } catch (err) {
      toast.error("Clinical sync failure")
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
        toast.success("Arogya ID: Schedule Adjusted")
        setIsRescheduleOpen(false)
        fetchAppointments()
      } else {
        toast.error("Reschedule failed. Clinical conflict.")
      }
    } catch (err) {
      toast.error("Clinical bridge interrupted")
    } finally {
      setActionLoading(null)
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
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredAppointments = appointments.filter((appointment) => {
    const matchesSearch =
      appointment.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.reason.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter = filterStatus === "all" || appointment.status.toLowerCase() === filterStatus.toLowerCase()

    return matchesSearch && matchesFilter
  })

  if (loading) {
    return (
      <PatientLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading appointments...</p>
          </div>
        </div>
      </PatientLayout>
    )
  }

  return (
    <PatientLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">My Appointments</h1>
            <p className="text-muted-foreground">Manage your medical appointments</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Book Appointment
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Book New Appointment</DialogTitle>
                <DialogDescription>Schedule an appointment with one of our doctors</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleBookAppointment} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="doctor">Select Doctor</Label>
                  <Select
                    value={bookingForm.doctorId}
                    onValueChange={(value) => setBookingForm({ ...bookingForm, doctorId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a doctor" />
                    </SelectTrigger>
                    <SelectContent>
                      {doctors.map((doctor) => (
                        <SelectItem key={doctor.id} value={doctor.id}>
                          {doctor.name} - {doctor.specialization}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={bookingForm.date}
                      onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time">Time</Label>
                    <Select
                      value={bookingForm.time}
                      onValueChange={(value) => setBookingForm({ ...bookingForm, time: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="09:00 AM">09:00 AM</SelectItem>
                        <SelectItem value="10:00 AM">10:00 AM</SelectItem>
                        <SelectItem value="11:00 AM">11:00 AM</SelectItem>
                        <SelectItem value="02:00 PM">02:00 PM</SelectItem>
                        <SelectItem value="03:00 PM">03:00 PM</SelectItem>
                        <SelectItem value="04:00 PM">04:00 PM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reason">Reason for Visit</Label>
                  <Textarea
                    id="reason"
                    placeholder="Describe your symptoms or reason for the appointment"
                    value={bookingForm.reason}
                    onChange={(e) => setBookingForm({ ...bookingForm, reason: e.target.value })}
                    required
                  />
                </div>

                <Button type="submit" className="w-full">
                  Book Appointment
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {error && (
          <Alert variant="destructive" className="rounded-2xl bg-red-50/50 border-red-100 animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription className="font-bold text-xs">{error}</AlertDescription>
          </Alert>
        )}

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
                    : "Book your first appointment to get started"}
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
                        <h3 className="font-semibold text-lg">{appointment.doctorName}</h3>
                        <p className="text-muted-foreground">{appointment.specialization}</p>
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
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Reschedule Dialog */}
        <Dialog open={isRescheduleOpen} onOpenChange={setIsRescheduleOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Reschedule Appointment</DialogTitle>
              <DialogDescription>
                Adjust the clinical schedule for your visit with {selectedAppointment?.doctorName}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleReschedule} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reschedule-date">New Date</Label>
                  <Input
                    id="reschedule-date"
                    type="date"
                    value={rescheduleData.date}
                    onChange={(e) => setRescheduleData({ ...rescheduleData, date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reschedule-time">New Time</Label>
                  <Select
                    value={rescheduleData.time}
                    onValueChange={(value) => setRescheduleData({ ...rescheduleData, time: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="09:00 AM">09:00 AM</SelectItem>
                      <SelectItem value="10:00 AM">10:00 AM</SelectItem>
                      <SelectItem value="11:00 AM">11:00 AM</SelectItem>
                      <SelectItem value="02:00 PM">02:00 PM</SelectItem>
                      <SelectItem value="03:00 PM">03:00 PM</SelectItem>
                      <SelectItem value="04:00 PM">04:00 PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="pt-4 flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsRescheduleOpen(false)}
                >
                  Keep Existing
                </Button>
                <Button type="submit" className="flex-1" disabled={actionLoading === selectedAppointment?._id}>
                  {actionLoading === selectedAppointment?._id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Confirm Reschedule"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </PatientLayout>
  )
}
