"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PatientLayout } from "@/components/layouts/patient-layout"
import { Beaker, Download, Eye, Search, Filter, AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"

export default function PatientLabReports() {
  const { token, user } = useAuth()
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [selectedReport, setSelectedReport] = useState(null)

  useEffect(() => {
    if (token) {
      fetchLabReports()
    }
  }, [token])

  const fetchLabReports = async () => {
    try {
      // In a real app, we'd use useAuth's patient ID. 
      // For demo purposes, we'll fetch reports for ADM001 (Arjun Mehta)
      const res = await fetch("/api/admin/diagnostics?patientId=ADM001")
      setReports(await res.json())
    } catch (e) {
      console.error("Failed to fetch lab reports", e)
    }
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
      case "processing":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.testName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.category.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter = filterStatus === "all" || report.status.toLowerCase() === filterStatus.toLowerCase()

    return matchesSearch && matchesFilter
  })

  if (loading && reports.length === 0) {
    return (
      <PatientLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PatientLayout>
    )
  }

  return (
    <PatientLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Lab Reports</h1>
          <p className="text-muted-foreground">View and download your laboratory test results</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search lab reports..."
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

        {/* Selected Report Detail */}
        {selectedReport && (
          <Card className="border-primary bg-primary/5">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{selectedReport.testName}</CardTitle>
                  <CardDescription>Test Report Details</CardDescription>
                </div>
                <Button variant="ghost" onClick={() => setSelectedReport(null)}>
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Category</p>
                  <p className="font-medium">{selectedReport.category}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge className={getStatusColor(selectedReport.status)}>{selectedReport.status}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ordered Date</p>
                  <p className="font-medium">{selectedReport.orderDate}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Result Date</p>
                  <p className="font-medium">{selectedReport.resultDate || "Pending"}</p>
                </div>
              </div>

              {selectedReport.result && (
                <div className="p-4 bg-white rounded-lg border">
                  <h4 className="font-semibold mb-2">Test Result</h4>
                  <p className="text-sm">{selectedReport.result}</p>
                </div>
              )}

              {selectedReport.referenceRange && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-2">Reference Range</h4>
                  <p className="text-sm text-blue-800">{selectedReport.referenceRange}</p>
                </div>
              )}

              {selectedReport.notes && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-2">Doctor's Notes</h4>
                  <p className="text-sm text-blue-800">{selectedReport.notes}</p>
                </div>
              )}

              <div className="flex gap-2 pt-4 border-t">
                <Button className="flex-1">
                  <Download className="w-4 h-4 mr-2" />
                  Download Report
                </Button>
                <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setSelectedReport(null)}>
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

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
                    : "Your lab reports will appear here"}
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
                        <p className="text-muted-foreground">{report.category}</p>
                        <p className="text-sm text-muted-foreground mt-1">Ordered by: {report.orderedBy}</p>
                        <p className="text-sm text-muted-foreground">Order Date: {report.orderDate}</p>
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <Badge className={getStatusColor(report.status)}>{report.status}</Badge>
                      {report.status === "Completed" && (
                        <div className="flex space-x-2 mt-2">
                          <Button size="sm" variant="outline" onClick={() => setSelectedReport(report)}>
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                        </div>
                      )}
                      {report.status === "Pending" && (
                        <p className="text-sm text-muted-foreground">Awaiting results...</p>
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
