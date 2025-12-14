"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DoctorLayout } from "@/components/layouts/doctor-layout"
import { Beaker, Download, Eye, Search, Filter, CheckCircle, AlertCircle } from "lucide-react"

export default function DoctorLabReports() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [selectedReport, setSelectedReport] = useState(null)

  useEffect(() => {
    fetchLabReports()
  }, [])

  const fetchLabReports = async () => {
    // Mock data - replace with actual API call
    setReports([
      {
        id: "LAB001",
        patientName: "John Doe",
        testName: "Complete Blood Count (CBC)",
        category: "Hematology",
        orderDate: "2024-01-10",
        resultDate: "2024-01-12",
        status: "Completed",
        result: "Normal",
      },
      {
        id: "LAB002",
        patientName: "Jane Smith",
        testName: "Thyroid Function Test (TSH)",
        category: "Endocrinology",
        orderDate: "2024-01-15",
        resultDate: null,
        status: "Pending",
        result: null,
      },
      {
        id: "LAB003",
        patientName: "Robert Johnson",
        testName: "Lipid Profile",
        category: "Biochemistry",
        orderDate: "2024-01-05",
        resultDate: "2024-01-07",
        status: "Completed",
        result: "Slightly Elevated",
      },
    ])
    setLoading(false)
  }

  const getStatusIcon = (status) => {
    if (status === "Completed") return <CheckCircle className="w-5 h-5 text-green-600" />
    if (status === "Pending") return <AlertCircle className="w-5 h-5 text-yellow-600" />
    return <Beaker className="w-5 h-5 text-blue-600" />
  }

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.testName.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter = filterStatus === "all" || report.status.toLowerCase() === filterStatus.toLowerCase()

    return matchesSearch && matchesFilter
  })

  if (loading) {
    return (
      <DoctorLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading lab reports...</p>
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
          <h1 className="text-2xl font-bold">Lab Reports</h1>
          <p className="text-muted-foreground">View patient laboratory test results</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search reports..."
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
              <SelectItem value="all">All Reports</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Reports List */}
        <div className="grid gap-4">
          {filteredReports.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Beaker className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No lab reports found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || filterStatus !== "all"
                    ? "Try adjusting your search or filter criteria"
                    : "No lab reports available"}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredReports.map((report) => (
              <Card key={report.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="bg-primary/10 rounded-full p-3">{getStatusIcon(report.status)}</div>
                      <div>
                        <h3 className="font-semibold text-lg">{report.testName}</h3>
                        <p className="text-muted-foreground">Patient: {report.patientName}</p>
                        <p className="text-sm text-muted-foreground mt-1">{report.category}</p>
                        <p className="text-sm text-muted-foreground">Order Date: {report.orderDate}</p>
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <Badge className={getStatusColor(report.status)}>{report.status}</Badge>
                      {report.status === "Completed" && (
                        <div className="flex space-x-2 mt-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="h-4 w-4 mr-1" />
                            Download
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
      </div>
    </DoctorLayout>
  )
}
