"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import PatientLayout from "@/components/layouts/patient-layout"
import DoctorLayout from "@/components/layouts/doctor-layout"
import StaffLayout from "@/components/layouts/staff-layout"
import { Calendar, Clock, MapPin, AlertCircle } from "lucide-react"

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState(null)
  const [showBooking, setShowBooking] = useState(false)

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}")
    setUserRole(user.role)
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    try {
      const response = await fetch("/api/appointments")
      const data = await response.json()
      setAppointments(data)
    } catch (error) {
      console.error("Error fetching appointments:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      scheduled: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
      pending: "bg-yellow-100 text-yellow-800",
    }
    return colors[status] || "bg-gray-100 text-gray-800"
  }

  const AppointmentCard = ({ appointment }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-lg">{appointment.doctorName}</h3>
              <p className="text-sm text-gray-600">{appointment.specialization}</p>
            </div>
            <Badge className={getStatusColor(appointment.status)}>{appointment.status}</Badge>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              <span>{new Date(appointment.date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              <span>{appointment.time}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              <span>{appointment.location}</span>
            </div>
            {appointment.notes && (
              <div className="flex items-start gap-2 mt-3 p-2 bg-blue-50 rounded">
                <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-700">{appointment.notes}</p>
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-4 border-t">
            {appointment.status === "scheduled" && (
              <>
                <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                  Reschedule
                </Button>
                <Button size="sm" variant="destructive" className="flex-1">
                  Cancel
                </Button>
              </>
            )}
            {appointment.status === "completed" && (
              <Button size="sm" className="w-full">
                View Report
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const content = (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Appointments</h1>
          <p className="text-gray-600 mt-1">Manage your medical appointments</p>
        </div>
        {userRole === "patient" && (
          <Button onClick={() => setShowBooking(!showBooking)} size="lg">
            Book Appointment
          </Button>
        )}
      </div>

      {showBooking && userRole === "patient" && (
        <Card className="border-primary bg-primary/5">
          <CardHeader>
            <CardTitle>Book New Appointment</CardTitle>
            <CardDescription>Schedule an appointment with a specialist</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Select Doctor</label>
                <select className="w-full border rounded-lg p-2 bg-white">
                  <option>Dr. Rajesh Kumar - Cardiology</option>
                  <option>Dr. Priya Singh - Neurology</option>
                  <option>Dr. Amit Patel - Orthopedics</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Preferred Date</label>
                <input type="date" className="w-full border rounded-lg p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Preferred Time</label>
                <select className="w-full border rounded-lg p-2 bg-white">
                  <option>09:00 AM</option>
                  <option>10:00 AM</option>
                  <option>02:00 PM</option>
                  <option>03:00 PM</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Reason for Visit</label>
                <input type="text" placeholder="Brief description" className="w-full border rounded-lg p-2" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Additional Notes</label>
                <textarea
                  placeholder="Any additional information"
                  className="w-full border rounded-lg p-2"
                  rows="3"
                ></textarea>
              </div>
              <div className="md:col-span-2 flex gap-2">
                <Button className="flex-1">Confirm Booking</Button>
                <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setShowBooking(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">Loading appointments...</p>
        </div>
      ) : appointments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {appointments.map((appointment) => (
            <AppointmentCard key={appointment._id} appointment={appointment} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-12 text-center">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No appointments found</p>
            {userRole === "patient" && (
              <Button className="mt-4" onClick={() => setShowBooking(true)}>
                Book Your First Appointment
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )

  if (userRole === "patient") return <PatientLayout>{content}</PatientLayout>
  if (userRole === "doctor") return <DoctorLayout>{content}</DoctorLayout>
  if (userRole === "staff") return <StaffLayout>{content}</StaffLayout>

  return content
}
