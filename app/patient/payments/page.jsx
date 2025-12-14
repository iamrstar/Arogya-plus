"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PatientLayout } from "@/components/layouts/patient-layout"
import { CreditCard, Download, Filter, Search, CheckCircle, Clock, AlertCircle } from "lucide-react"

export default function PatientPayments() {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState("")

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    // Mock data - replace with actual API call
    setPayments([
      {
        id: "PAY001",
        invoiceNo: "INV-2024-001",
        description: "Cardiology Consultation",
        amount: 500,
        date: "2024-01-10",
        dueDate: "2024-01-15",
        status: "Paid",
        method: "Credit Card",
      },
      {
        id: "PAY002",
        invoiceNo: "INV-2024-002",
        description: "Lab Tests - CBC, Lipid Profile",
        amount: 1200,
        date: "2024-01-12",
        dueDate: "2024-01-20",
        status: "Pending",
        method: null,
      },
      {
        id: "PAY003",
        invoiceNo: "INV-2024-003",
        description: "Neurology Follow-up",
        amount: 750,
        date: "2024-01-15",
        dueDate: "2024-01-22",
        status: "Overdue",
        method: null,
      },
    ])
    setLoading(false)
  }

  const handleRazorpayPayment = async (payment) => {
    try {
      const response = await fetch("/api/payments/razorpay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: payment.amount * 100, // Razorpay expects amount in paise
          invoiceNo: payment.invoiceNo,
          description: payment.description,
        }),
      })

      const data = await response.json()

      // Initialize Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: payment.amount * 100,
        currency: "INR",
        name: "Arogya Hospital",
        description: payment.description,
        order_id: data.orderId,
        handler: async (response) => {
          // Verify payment on backend
          const verifyResponse = await fetch("/api/payments/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              invoiceNo: payment.invoiceNo,
            }),
          })

          if (verifyResponse.ok) {
            alert("Payment successful!")
            fetchPayments()
          }
        },
        prefill: {
          name: "Patient Name",
          email: "patient@example.com",
          contact: "9876543210",
        },
        theme: {
          color: "#0891b2",
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (error) {
      console.error("Payment error:", error)
      alert("Payment failed. Please try again.")
    }
  }

  const getStatusIcon = (status) => {
    if (status === "Paid") return <CheckCircle className="w-5 h-5 text-green-600" />
    if (status === "Pending") return <Clock className="w-5 h-5 text-yellow-600" />
    if (status === "Overdue") return <AlertCircle className="w-5 h-5 text-red-600" />
    return <CreditCard className="w-5 h-5 text-blue-600" />
  }

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "overdue":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.description.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter = filterStatus === "all" || payment.status.toLowerCase() === filterStatus.toLowerCase()

    return matchesSearch && matchesFilter
  })

  if (loading) {
    return (
      <PatientLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading payments...</p>
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
            <h1 className="text-2xl font-bold">Payments</h1>
            <p className="text-muted-foreground">Manage your hospital bills and payments</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-muted-foreground text-sm">Total Due</p>
                <p className="text-3xl font-bold text-primary mt-2">₹1,950</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-muted-foreground text-sm">Paid</p>
                <p className="text-3xl font-bold text-green-600 mt-2">₹500</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-muted-foreground text-sm">Overdue</p>
                <p className="text-3xl font-bold text-red-600 mt-2">₹750</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search payments..."
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
              <SelectItem value="all">All Payments</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Payments List */}
        <div className="grid gap-4">
          {filteredPayments.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No payments found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || filterStatus !== "all"
                    ? "Try adjusting your search or filter criteria"
                    : "No payment records available"}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredPayments.map((payment) => (
              <Card key={payment.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="bg-primary/10 rounded-full p-3">{getStatusIcon(payment.status)}</div>
                      <div>
                        <h3 className="font-semibold text-lg">{payment.description}</h3>
                        <p className="text-muted-foreground">Invoice: {payment.invoiceNo}</p>
                        <p className="text-sm text-muted-foreground mt-1">Date: {payment.date}</p>
                        <p className="text-sm text-muted-foreground">Due: {payment.dueDate}</p>
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <p className="text-2xl font-bold text-primary">₹{payment.amount}</p>
                      <Badge className={getStatusColor(payment.status)}>{payment.status}</Badge>
                      {payment.status === "Pending" && (
                        <Button size="sm" className="w-full mt-2" onClick={() => handleRazorpayPayment(payment)}>
                          <CreditCard className="h-4 w-4 mr-2" />
                          Pay Now
                        </Button>
                      )}
                      {payment.status === "Overdue" && (
                        <Button
                          size="sm"
                          className="w-full mt-2 bg-red-600 hover:bg-red-700"
                          onClick={() => handleRazorpayPayment(payment)}
                        >
                          Pay Overdue
                        </Button>
                      )}
                      {payment.status === "Paid" && (
                        <Button size="sm" variant="outline" className="w-full mt-2 bg-transparent">
                          <Download className="h-4 w-4 mr-2" />
                          Receipt
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

      {/* Razorpay Script */}
      <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
    </PatientLayout>
  )
}
