"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { PatientLayout } from "@/components/layouts/patient-layout"
import { CreditCard, Download, Filter, Search, CheckCircle, Clock, AlertCircle, Loader2, Landmark, AlertTriangle, IndianRupee, Wifi, WifiOff } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export default function PatientPayments() {
  const { token, user } = useAuth()
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [paymentDialog, setPaymentDialog] = useState({ open: false, payment: null })
  const [onlineWarning, setOnlineWarning] = useState(false)

  useEffect(() => {
    if (token) fetchPayments()
  }, [token])

  const fetchPayments = async () => {
    setPayments([
      { id: "PAY001", invoiceNo: "INV-2026-001", description: "Cardiology Consultation — Dr. Rajesh Kumar", amount: 1500, date: "2026-03-10", dueDate: "2026-03-15", status: "Paid", method: "Counter Payment" },
      { id: "PAY002", invoiceNo: "INV-2026-002", description: "Lab Tests — CBC, Lipid Profile, HbA1c", amount: 2800, date: "2026-03-12", dueDate: "2026-03-20", status: "Pending", method: null },
      { id: "PAY003", invoiceNo: "INV-2026-003", description: "Neurology Follow-up — Dr. Priya Sharma", amount: 1200, date: "2026-03-15", dueDate: "2026-03-22", status: "Pending", method: null },
      { id: "PAY004", invoiceNo: "INV-2026-004", description: "MRI Brain — Diagnostic Center", amount: 8500, date: "2026-03-16", dueDate: "2026-03-18", status: "Overdue", method: null },
      { id: "PAY005", invoiceNo: "INV-2026-005", description: "Pharmacy — Medicines (5 items)", amount: 650, date: "2026-03-18", dueDate: "2026-03-25", status: "Pending", method: null },
    ])
    setLoading(false)
  }

  const handlePayOnline = (payment) => {
    setOnlineWarning(true)
    setPaymentDialog({ open: false, payment: null })
  }

  const handlePayAtCounter = (payment) => {
    // Mark as counter payment
    setPayments(prev => prev.map(p =>
      p.id === payment.id ? { ...p, status: "Paid", method: "Counter Payment" } : p
    ))
    setPaymentDialog({ open: false, payment: null })
    toast.success(`Payment of ₹${payment.amount} marked for counter collection. Please visit the billing counter with Invoice ${payment.invoiceNo}.`)
  }

  const getStatusIcon = (status) => {
    if (status === "Paid") return <CheckCircle className="w-5 h-5 text-green-600" />
    if (status === "Pending") return <Clock className="w-5 h-5 text-amber-600" />
    if (status === "Overdue") return <AlertCircle className="w-5 h-5 text-red-600" />
    return <CreditCard className="w-5 h-5 text-blue-600" />
  }

  const getStatusBadge = (status) => {
    const s = { Paid: "bg-green-50 text-green-600", Pending: "bg-amber-50 text-amber-600", Overdue: "bg-red-50 text-red-600" }
    return <Badge className={cn("border-none font-black text-[10px] uppercase tracking-widest px-3 py-1", s[status] || "bg-slate-50 text-slate-500")}>{status}</Badge>
  }

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) || payment.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === "all" || payment.status.toLowerCase() === filterStatus.toLowerCase()
    return matchesSearch && matchesFilter
  })

  const totalDue = payments.filter(p => p.status !== "Paid").reduce((s, p) => s + p.amount, 0)
  const totalPaid = payments.filter(p => p.status === "Paid").reduce((s, p) => s + p.amount, 0)
  const overdue = payments.filter(p => p.status === "Overdue").reduce((s, p) => s + p.amount, 0)

  if (loading) return (
    <PatientLayout>
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    </PatientLayout>
  )

  return (
    <PatientLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Payments & Billing</h1>
          <p className="text-slate-500 font-medium mt-1">Manage your hospital bills and payment records</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="rounded-2xl border-slate-100">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
                  <IndianRupee className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Due</p>
                  <p className="text-2xl font-black text-amber-600">₹{totalDue.toLocaleString('en-IN')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-slate-100">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Paid</p>
                  <p className="text-2xl font-black text-green-600">₹{totalPaid.toLocaleString('en-IN')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-slate-100">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Overdue</p>
                  <p className="text-2xl font-black text-red-600">₹{overdue.toLocaleString('en-IN')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search payments..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 rounded-xl" />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-48 rounded-xl">
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
        <div className="space-y-4">
          {filteredPayments.length === 0 ? (
            <Card className="rounded-2xl border-slate-100">
              <CardContent className="p-8 text-center">
                <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No payments found</h3>
              </CardContent>
            </Card>
          ) : (
            filteredPayments.map(payment => (
              <Card key={payment.id} className="rounded-2xl border-slate-100 hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center">{getStatusIcon(payment.status)}</div>
                      <div>
                        <h3 className="font-bold text-slate-900">{payment.description}</h3>
                        <p className="text-xs text-slate-400 mt-1">Invoice: {payment.invoiceNo} · Date: {payment.date} · Due: {payment.dueDate}</p>
                        {payment.method && <p className="text-xs text-green-600 font-bold mt-1">Paid via: {payment.method}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-2xl font-black text-primary">₹{payment.amount.toLocaleString('en-IN')}</p>
                        {getStatusBadge(payment.status)}
                      </div>
                      {(payment.status === "Pending" || payment.status === "Overdue") && (
                        <Button
                          className={cn("rounded-xl font-bold", payment.status === "Overdue" ? "bg-red-500 hover:bg-red-600" : "bg-primary")}
                          onClick={() => setPaymentDialog({ open: true, payment })}
                        >
                          <CreditCard className="w-4 h-4 mr-2" />
                          Pay Now
                        </Button>
                      )}
                      {payment.status === "Paid" && (
                        <Button variant="outline" className="rounded-xl font-bold">
                          <Download className="w-4 h-4 mr-2" />Receipt
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

      {/* Payment Method Dialog */}
      <Dialog open={paymentDialog.open} onOpenChange={(v) => !v && setPaymentDialog({ open: false, payment: null })}>
        <DialogContent className="rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-black">Choose Payment Method</DialogTitle>
            <DialogDescription>Select how you'd like to pay ₹{paymentDialog.payment?.amount?.toLocaleString('en-IN')} for {paymentDialog.payment?.description}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Online Payment Option */}
            <button
              className="w-full p-5 rounded-2xl border-2 border-slate-200 hover:border-primary/50 hover:bg-primary/5 transition-all text-left group"
              onClick={() => handlePayOnline(paymentDialog.payment)}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Wifi className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-black text-slate-900">Pay Online (UPI / Card / NetBanking)</p>
                  <p className="text-xs text-slate-500 mt-1">Pay instantly using Razorpay gateway</p>
                </div>
              </div>
            </button>

            {/* Counter Payment Option */}
            <button
              className="w-full p-5 rounded-2xl border-2 border-slate-200 hover:border-green-500/50 hover:bg-green-50 transition-all text-left group"
              onClick={() => handlePayAtCounter(paymentDialog.payment)}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center group-hover:bg-green-100 transition-colors">
                  <Landmark className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="font-black text-slate-900">Pay at Billing Counter</p>
                  <p className="text-xs text-slate-500 mt-1">Visit Counter #3 (Ground Floor) with your invoice</p>
                </div>
              </div>
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Online Payment Warning Dialog */}
      <Dialog open={onlineWarning} onOpenChange={setOnlineWarning}>
        <DialogContent className="rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl font-black text-red-600">
              <AlertTriangle className="w-6 h-6" />
              Payment Gateway Alert
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="p-4 rounded-2xl bg-red-50 border border-red-100">
              <div className="flex items-start gap-3">
                <WifiOff className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-bold text-red-800">High Traffic — Payment Failures Expected</p>
                  <p className="text-sm text-red-600 mt-2">Due to extremely high traffic on our payment servers, online payments are currently experiencing intermittent failures. We strongly recommend paying at the billing counter to avoid transaction issues.</p>
                </div>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-green-50 border border-green-100">
              <div className="flex items-start gap-3">
                <Landmark className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-bold text-green-800">Recommended: Pay at Counter</p>
                  <p className="text-sm text-green-600 mt-1">Visit <span className="font-bold">Billing Counter #3 (Ground Floor)</span> for a seamless payment experience. Cash, Card, and UPI all accepted at the counter.</p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="flex gap-3">
            <Button variant="outline" className="rounded-xl flex-1" onClick={() => setOnlineWarning(false)}>Go Back</Button>
            <Button className="rounded-xl flex-1 bg-red-500 hover:bg-red-600" onClick={() => {
              toast.error("Payment failed! Please try again later or pay at the counter.")
              setOnlineWarning(false)
            }}>
              Try Anyway
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PatientLayout>
  )
}
