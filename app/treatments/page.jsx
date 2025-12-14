"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import PatientLayout from "@/components/layouts/patient-layout"
import DoctorLayout from "@/components/layouts/doctor-layout"
import { Activity, Calendar, User } from "lucide-react"

export default function TreatmentsPage() {
  const [treatments, setTreatments] = useState([])
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState(null)

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}")
    setUserRole(user.role)
    fetchTreatments()
  }, [])

  const fetchTreatments = async () => {
    try {
      const response = await fetch("/api/treatments")
      const data = await response.json()
      setTreatments(data)
    } catch (error) {
      console.error("Error fetching treatments:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      ongoing: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      scheduled: "bg-yellow-100 text-yellow-800",
      cancelled: "bg-red-100 text-red-800",
    }
    return colors[status] || "bg-gray-100 text-gray-800"
  }

  const TreatmentCard = ({ treatment }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-lg">{treatment.diagnosis}</h3>
              <p className="text-sm text-gray-600">{treatment.treatmentType}</p>
            </div>
            <Badge className={getStatusColor(treatment.status)}>{treatment.status}</Badge>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              <span>Dr. {treatment.doctorName}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              <span>Started: {new Date(treatment.startDate).toLocaleDateString()}</span>
            </div>
            {treatment.endDate && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                <span>Ended: {new Date(treatment.endDate).toLocaleDateString()}</span>
              </div>
            )}
            {treatment.procedures && (
              <div className="flex items-start gap-2 mt-3">
                <Activity className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-xs">Procedures:</p>
                  <p className="text-xs text-gray-600">{treatment.procedures.join(", ")}</p>
                </div>
              </div>
            )}
          </div>

          {treatment.notes && (
            <div className="p-2 bg-blue-50 rounded border border-blue-200">
              <p className="text-xs text-blue-700">{treatment.notes}</p>
            </div>
          )}

          <div className="flex gap-2 pt-4 border-t">
            <Button size="sm" variant="outline" className="flex-1 bg-transparent">
              View Details
            </Button>
            {treatment.status === "ongoing" && (
              <Button size="sm" className="flex-1">
                Update Progress
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const content = (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Treatments</h1>
        <p className="text-gray-600 mt-1">Track your medical treatments and procedures</p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">Loading treatments...</p>
        </div>
      ) : treatments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {treatments.map((treatment) => (
            <TreatmentCard key={treatment._id} treatment={treatment} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-12 text-center">
            <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No treatments found</p>
          </CardContent>
        </Card>
      )}
    </div>
  )

  if (userRole === "patient") return <PatientLayout>{content}</PatientLayout>
  if (userRole === "doctor") return <DoctorLayout>{content}</DoctorLayout>

  return content
}
