"use client"

import { useState, useEffect } from "react"
import { StaffLayout } from "@/components/layouts/staff-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, Pill, CheckCircle2, AlertTriangle, Search, Clock, FileText, ShoppingCart } from "lucide-react"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"

export default function PharmacyDashboard() {
  const [orders, setOrders] = useState([])
  const [lowStock, setLowStock] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchPharmacyData()
  }, [])

  const fetchPharmacyData = async () => {
    try {
      const res = await fetch("/api/staff/pharmacy", {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token") || ''}` }
      })
      const data = await res.json()
      if (res.ok) {
        setOrders(data.orders || [])
        setLowStock(data.lowStock || [])
      } else {
        toast.error(data.error || "Failed to load pharmacy data")
      }
    } catch (err) {
      toast.error("Network error fetching pharmacy data")
    } finally {
      setLoading(false)
    }
  }

  const handleDispense = async (orderId) => {
    if (!confirm("Are you sure you want to dispense these medicines and generate a bill?")) return

    setActionLoading(orderId)
    try {
      const res = await fetch("/api/staff/pharmacy", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token") || ''}`
        },
        body: JSON.stringify({ orderId, action: "DISPENSE" })
      })
      const data = await res.json()
      
      if (res.ok) {
        toast.success(`Medicines dispensed! Total Bill Generated: ₹${data.totalCost}`)
        fetchPharmacyData()
      } else {
        toast.error(data.error || "Failed to dispense medicines")
      }
    } catch (err) {
      toast.error("Network error")
    } finally {
      setActionLoading(null)
    }
  }

  const filteredOrders = orders.filter(o => 
    (o.patientName || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
    (o.orderId || "").toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <StaffLayout role="Pharmacist" title="Pharmacy Dispatch Center" description="Manage e-prescriptions and medication billing">
        <div className="flex items-center justify-center h-[50vh]">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      </StaffLayout>
    )
  }

  return (
    <StaffLayout role="Pharmacist" title="Pharmacy Dispatch Center" description="Manage e-prescriptions and medication billing">
      <div className="space-y-8 pb-20">
        
        {/* Critical Alerts */}
        {lowStock.length > 0 && (
          <div className="bg-red-50 border border-red-100 rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-500" />
              <h3 className="text-lg font-black text-red-700">Critical Stock Alerts</h3>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {lowStock.map(med => (
                <div key={med._id} className="min-w-[200px] bg-white rounded-2xl p-4 shadow-sm">
                  <p className="font-bold text-slate-800 truncate">{med.name}</p>
                  <p className="text-xs font-black text-red-500 uppercase mt-1">{med.stock} {med.unit} Left</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input 
              placeholder="Search by Patient or Order ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-14 rounded-2xl bg-white border-none shadow-sm font-bold"
            />
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="h-10 px-4 rounded-xl bg-white">Total Orders: {orders.length}</Badge>
            <Badge variant="outline" className="h-10 px-4 rounded-xl bg-amber-50 text-amber-600 border-amber-200">Pending: {orders.filter(o => o.status === "Pending").length}</Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredOrders.length === 0 ? (
            <div className="col-span-full py-20 text-center flex flex-col items-center">
              <ShoppingCart className="w-16 h-16 text-slate-200 mb-4" />
              <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No prescription orders found</p>
            </div>
          ) : (
            filteredOrders.map(order => (
              <Card key={order.orderId} className={`rounded-[2rem] overflow-hidden transition-all shadow-sm hover:shadow-lg border-2 ${order.status === "Pending" ? "border-amber-100" : "border-slate-100 opacity-70"}`}>
                <CardContent className="p-0">
                  {/* Header */}
                  <div className={`p-6 ${order.status === "Pending" ? "bg-amber-50/50" : "bg-slate-50"}`}>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <Badge className="bg-white text-slate-500 hover:bg-white mb-2 shadow-sm font-black text-[10px] uppercase tracking-widest">{order.orderId}</Badge>
                        <h3 className="text-xl font-black text-slate-900">{order.patientName}</h3>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Dr. {order.doctorName}</p>
                      </div>
                      <Badge className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                        order.status === "Pending" ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"
                      }`}>
                        {order.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                      <Clock className="w-3.5 h-3.5" />
                      Prescribed: {new Date(order.date).toLocaleString('en-IN')}
                    </div>
                  </div>

                  {/* Medicines List */}
                  <div className="p-6 space-y-4 bg-white">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Prescribed Items ({order.items.length})</h4>
                    <div className="space-y-3">
                      {order.items.map(item => (
                        <div key={item._id} className="flex justify-between items-center p-4 rounded-2xl border border-slate-100 bg-slate-50">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${item.status === "Pending" ? "bg-blue-100 text-blue-600" : "bg-green-100 text-green-600"}`}>
                              <Pill className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-800">{item.medicineName}</p>
                              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{item.dosage} • {item.instructions}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-black text-slate-900">Qty: {item.quantity}</p>
                            <p className="text-[9px] font-bold text-slate-400">{item.duration}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {order.status === "Pending" && (
                      <div className="pt-4 mt-2 border-t border-slate-100">
                        <Button 
                          onClick={() => handleDispense(order.orderId)}
                          disabled={actionLoading === order.orderId}
                          className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-primary font-black uppercase tracking-[0.2em] shadow-lg shadow-slate-200 transition-all text-xs"
                        >
                          {actionLoading === order.orderId ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <>
                              <FileText className="w-4 h-4 mr-2" />
                              Dispense & Generate Bill
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </StaffLayout>
  )
}
