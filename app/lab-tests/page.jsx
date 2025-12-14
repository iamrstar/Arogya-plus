"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import PatientLayout from "@/components/layouts/patient-layout"
import DoctorLayout from "@/components/layouts/doctor-layout"
import StaffLayout from "@/components/layouts/staff-layout"
import { Beaker, Download, Eye, AlertCircle, CheckCircle } from "lucide-react"

export default function LabTestsPage() {
  const [tests, setTests] = useState([])
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState(null)
  const [selectedTest, setSelectedTest] = useState(null)

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}")
    setUserRole(user.role)
    fetchLabTests()
  }, [])

  const fetchLabTests = async () => {
    try {
      const response = await fetch("/api/lab-tests")
      const data = await response.json()
      setTests(data)
    } catch (error) {
      console.error("Error fetching lab tests:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status) => {
    if (status === "completed") return <CheckCircle className="w-5 h-5 text-green-600" />
    if (status === "pending") return <AlertCircle className="w-5 h-5 text-yellow-600" />
    return <Beaker className="w-5 h-5 text-blue-600" />
  }

  const getStatusColor = (status) => {
    const colors = {
      completed: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      processing: "bg-blue-100 text-blue-800",
      cancelled: "bg-red-100 text-red-800",
    }
    return colors[status] || "bg-gray-100 text-gray-800"
  }

  const TestCard = ({ test }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <div className="flex items-start gap-3">
              {getStatusIcon(test.status)}
              <div>
                <h3 className="font-semibold text-lg">{test.testName}</h3>
                <p className="text-sm text-gray-600">{test.category}</p>
              </div>
            </div>
            <Badge className={getStatusColor(test.status)}>{test.status}</Badge>
          </div>

          <div className="space-y-2 text-sm">
            <div>
              <span className="text-gray-600">Ordered by: </span>
              <span className="font-medium">{test.orderedBy}</span>
            </div>
            <div>
              <span className="text-gray-600">Order Date: </span>
              <span className="font-medium">{new Date(test.orderDate).toLocaleDateString()}</span>
            </div>
            {test.resultDate && (
              <div>
                <span className="text-gray-600">Result Date: </span>
                <span className="font-medium">{new Date(test.resultDate).toLocaleDateString()}</span>
              </div>
            )}
            {test.referenceRange && (
              <div className="mt-3 p-2 bg-blue-50 rounded">
                <p className="text-xs font-medium text-blue-900">Reference Range:</p>
                <p className="text-xs text-blue-700">{test.referenceRange}</p>
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-4 border-t">
            {test.status === "completed" && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 bg-transparent"
                  onClick={() => setSelectedTest(test)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Report
                </Button>
                <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </>
            )}
            {test.status === "pending" && (
              <Button size="sm" disabled className="w-full">
                Awaiting Results
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
        <h1 className="text-3xl font-bold">Lab Tests</h1>
        <p className="text-gray-600 mt-1">View and manage your laboratory test results</p>
      </div>

      {selectedTest && (
        <Card className="border-primary bg-primary/5">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{selectedTest.testName}</CardTitle>
                <CardDescription>Test Report Details</CardDescription>
              </div>
              <Button variant="ghost" onClick={() => setSelectedTest(null)}>
                ✕
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Test Category</p>
                <p className="font-medium">{selectedTest.category}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <Badge className={getStatusColor(selectedTest.status)}>{selectedTest.status}</Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600">Ordered Date</p>
                <p className="font-medium">{new Date(selectedTest.orderDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Result Date</p>
                <p className="font-medium">{new Date(selectedTest.resultDate).toLocaleDateString()}</p>
              </div>
            </div>

            {selectedTest.result && (
              <div className="p-4 bg-white rounded-lg border">
                <h4 className="font-semibold mb-2">Test Result</h4>
                <p className="text-sm">{selectedTest.result}</p>
              </div>
            )}

            {selectedTest.notes && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2">Doctor's Notes</h4>
                <p className="text-sm text-blue-800">{selectedTest.notes}</p>
              </div>
            )}

            <div className="flex gap-2 pt-4 border-t">
              <Button className="flex-1">
                <Download className="w-4 h-4 mr-2" />
                Download Report
              </Button>
              <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setSelectedTest(null)}>
                Close
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">Loading lab tests...</p>
        </div>
      ) : tests.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tests.map((test) => (
            <TestCard key={test._id} test={test} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-12 text-center">
            <Beaker className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No lab tests found</p>
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
