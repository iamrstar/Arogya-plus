"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/layouts/admin-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, Receipt, FileText, Search, CreditCard, Banknote, UserCheck } from "lucide-react"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function AdminBilling() {
  const [bills, setBills] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedBill, setSelectedBill] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    fetchBills()
  }, [])

  const fetchBills = async () => {
    try {
      const res = await fetch("/api/admin/billing", {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token") || ''}` }
      })
      const data = await res.json()
      if (res.ok) {
        setBills(data)
      } else {
        toast.error(data.error || "Failed to load billing data")
      }
    } catch (err) {
      toast.error("Network error fetching bills")
    } finally {
      setLoading(false)
    }
  }

  const handleProcessPayment = async (paymentMethod) => {
    if (!selectedBill) return
    setActionLoading(selectedBill.patientId)

    try {
      const res = await fetch("/api/admin/billing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token") || ''}`
        },
        body: JSON.stringify({ 
            patientId: selectedBill.patientId, 
            admissionId: selectedBill.admissionId,
            totalAmount: selectedBill.totalAmount,
            paymentMethod 
        })
      })
      const data = await res.json()
      
      if (res.ok) {
        toast.success(`Payment successful. ${selectedBill.type === "IPD" ? "Patient Discharged." : ""}`)
        setIsModalOpen(false)
        fetchBills()
      } else {
        toast.error(data.error || "Failed to process payment")
      }
    } catch (err) {
      toast.error("Network error")
    } finally {
      setActionLoading(null)
    }
  }

  const filteredBills = bills.filter(b => 
    (b.patientName || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
    (b.patientId || "").toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalRevenuePending = bills.reduce((sum, b) => sum + b.totalAmount, 0)

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-[50vh]">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-8 pb-20">
        
        {/* Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-slate-900 text-white rounded-3xl border-none">
                <CardContent className="p-8">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                            <Banknote className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Pending Revenue</p>
                            <h3 className="text-3xl font-black">₹{totalRevenuePending.toLocaleString()}</h3>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Card className="bg-white rounded-3xl border-slate-100 shadow-sm">
                <CardContent className="p-8">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center">
                            <UserCheck className="w-6 h-6 text-amber-500" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pending Discharges (IPD)</p>
                            <h3 className="text-3xl font-black text-slate-900">{bills.filter(b => b.type === "IPD").length}</h3>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input 
            placeholder="Search Patient Name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 h-14 rounded-2xl bg-white border-none shadow-sm font-bold"
          />
        </div>

        {/* Bills List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBills.length === 0 ? (
            <div className="col-span-full py-20 text-center flex flex-col items-center">
              <Receipt className="w-16 h-16 text-slate-200 mb-4" />
              <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No pending bills found</p>
            </div>
          ) : (
            filteredBills.map(bill => (
              <Card key={bill.patientId} className="rounded-[2rem] overflow-hidden transition-all shadow-sm hover:shadow-xl border border-slate-100 group">
                <CardContent className="p-0 flex flex-col h-full">
                  <div className="p-6 bg-slate-50 flex-1">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <Badge className={`mb-2 shadow-sm font-black text-[10px] uppercase tracking-widest ${bill.type === "IPD" ? "bg-primary text-white" : "bg-purple-100 text-purple-700"}`}>
                            {bill.type} {bill.type === "IPD" ? "DISCHARGE" : "BILL"}
                        </Badge>
                        <h3 className="text-xl font-black text-slate-900">{bill.patientName}</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">ID: {bill.patientId}</p>
                      </div>
                    </div>
                    {bill.type === "IPD" && (
                        <div className="mb-4">
                            <p className="text-sm font-bold text-slate-600">{bill.department}</p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{bill.daysAdmitted} Days Admitted</p>
                        </div>
                    )}
                    <div className="mt-4 pt-4 border-t border-slate-200">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Due</p>
                        <p className="text-2xl font-black text-slate-900">₹{bill.totalAmount.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="p-4 bg-white">
                    <Button 
                        onClick={() => {
                            setSelectedBill(bill)
                            setIsModalOpen(true)
                        }}
                        className="w-full h-12 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 font-black uppercase tracking-widest text-[10px] transition-all"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      View Invoice Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Invoice Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl rounded-[3rem] p-0 overflow-hidden border-none shadow-2xl">
          {selectedBill && (
            <>
                <div className="bg-slate-900 p-8 text-white relative">
                    <Receipt className="w-20 h-20 text-white opacity-10 absolute -top-4 -right-4 rotate-12" />
                    <h2 className="text-3xl font-black mb-1 tracking-tight">Final Invoice</h2>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">Patient: <span className="text-white tracking-widest">{selectedBill.patientName}</span></p>
                </div>
                
                <div className="p-8 bg-slate-50 space-y-6 max-h-[60vh] overflow-y-auto">
                    <div className="space-y-2">
                        {selectedBill.breakdown.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center p-4 bg-white rounded-2xl border border-slate-100">
                                <p className="text-sm font-bold text-slate-700">{item.item}</p>
                                <p className="text-sm font-black text-slate-900">₹{item.amount.toLocaleString()}</p>
                            </div>
                        ))}
                    </div>
                    
                    <div className="flex justify-between items-center p-6 bg-primary/5 rounded-3xl border-2 border-primary/20">
                        <p className="text-sm font-black uppercase tracking-widest text-primary">Total Amount Due</p>
                        <p className="text-3xl font-black text-primary">₹{selectedBill.totalAmount.toLocaleString()}</p>
                    </div>
                </div>

                <div className="p-8 bg-white border-t border-slate-100 flex flex-col sm:flex-row gap-4">
                    <Button 
                        onClick={() => handleProcessPayment("Credit Card")}
                        disabled={actionLoading === selectedBill.patientId}
                        className="flex-1 h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-widest transition-all"
                    >
                        {actionLoading === selectedBill.patientId ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                            <>
                                <CreditCard className="w-4 h-4 mr-2" />
                                Pay via Card
                            </>
                        )}
                    </Button>
                    <Button 
                        onClick={() => handleProcessPayment("Cash")}
                        disabled={actionLoading === selectedBill.patientId}
                        className="flex-1 h-14 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-black text-xs uppercase tracking-widest transition-all"
                    >
                        {actionLoading === selectedBill.patientId ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                            <>
                                <Banknote className="w-4 h-4 mr-2" />
                                Pay in Cash
                            </>
                        )}
                    </Button>
                </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}
