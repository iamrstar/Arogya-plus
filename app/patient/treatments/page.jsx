"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PatientLayout } from "@/components/layouts/patient-layout"
import { Activity, Calendar, User, Filter, Search } from "lucide-react"

export default function PatientTreatments() {
  const [treatments, setTreatments] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")

  useEffect(() => {
    fetchTreatments()
  }, [])

  const fetchTreatments = async () => {
    // Mock data - replace with actual API call
    setTreatments([
      {
        id: "TRT001",
        diagnosis: "Hypertension",
        treatmentType: "Medication",
        doctorName: "Rajesh Kumar",
        startDate: "2024-01-01",
        endDate: null,
        status: "Ongoing",
        procedures: ["Blood Pressure Monitoring", "Medication Adjustment"],
        notes: "Continue current medication. Follow-up in 2 weeks.",
      },
      {
        id: "TRT002",
        diagnosis: "Migraine",
        treatmentType: "Therapy",
        doctorName: "Priya Sharma",
        startDate: "2023-12-15",
        endDate: "2024-01-10",
        status: "Completed",
        procedures: ["Neurological Assessment", "Migraine Management"],
        notes: "Treatment completed successfully. Patient shows improvement.",
      },
      {
        id: "TRT003",
        diagnosis: "Knee Pain",
        treatmentType: "Physical Therapy",
        doctorName: "Amit Patel",
        startDate: "2024-01-05",
        endDate: null,
        status: "Ongoing",
        procedures: ["Physiotherapy Sessions", "Exercise Regimen"],
        notes: "Continue exercises as prescribed. Attend weekly sessions.",
      },
    ])
    setLoading(false)
  }

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "ongoing":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "scheduled":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredTreatments = treatments.filter((treatment) => {
    const matchesSearch =
      treatment.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
      treatment.treatmentType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      treatment.doctorName.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter = filterStatus === "all" || treatment.status.toLowerCase() === filterStatus.toLowerCase()

    return matchesSearch && matchesFilter
  })

  if (loading) {
    return (
      <PatientLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading treatments...</p>
          </div>
        </div>
      </PatientLayout>
    )
  }

  return (
    <PatientLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">My Treatments</h1>
          <p className="text-muted-foreground">Track your medical treatments and procedures</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search treatments..."
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
              <SelectItem value="all">All Treatments</SelectItem>
              <SelectItem value="ongoing">Ongoing</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Treatments List */}
        <div className="grid gap-4">
          {filteredTreatments.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No treatments found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || filterStatus !== "all"
                    ? "Try adjusting your search or filter criteria"
                    : "Your treatments will appear here"}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredTreatments.map((treatment) => (
              <Card key={treatment.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">{treatment.diagnosis}</h3>
                        <p className="text-muted-foreground">{treatment.treatmentType}</p>
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
                        <span>Started: {treatment.startDate}</span>
                      </div>
                      {treatment.endDate && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-primary" />
                          <span>Ended: {treatment.endDate}</span>
                        </div>
                      )}
                      {treatment.procedures && (
                        <div className="flex items-start gap-2 mt-3">
                          <Activity className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium text-xs">Procedures:</p>
                            <p className="text-xs text-muted-foreground">{treatment.procedures.join(", ")}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {treatment.notes && (
                      <div className="p-3 bg-blue-50 rounded border border-blue-200">
                        <p className="text-xs text-blue-700">{treatment.notes}</p>
                      </div>
                    )}

                    <div className="flex gap-2 pt-4 border-t">
                      <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                        View Details
                      </Button>
                      {treatment.status === "Ongoing" && (
                        <Button size="sm" className="flex-1">
                          Update Progress
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
    </PatientLayout>
  )
}
