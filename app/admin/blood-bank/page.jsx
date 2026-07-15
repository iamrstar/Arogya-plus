"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/layouts/admin-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, Droplet, Plus, Activity, CheckCircle, XCircle } from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function BloodBankDashboard() {
  const [inventory, setInventory] = useState([])
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)
  const [isAddStockModalOpen, setIsAddStockModalOpen] = useState(false)
  
  const [newStock, setNewStock] = useState({ bloodGroup: "", units: 1 })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const res = await fetch("/api/admin/blood-bank", {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token") || ''}` }
      })
      const data = await res.json()
      if (res.ok) {
        setInventory(data.inventory || [])
        setRequests(data.requests || [])
      } else {
        toast.error(data.error || "Failed to load blood bank data")
      }
    } catch (err) {
      toast.error("Network error fetching blood bank data")
    } finally {
      setLoading(false)
    }
  }

  const handleProcessRequest = async (requestId, action) => {
    setActionLoading(requestId)
    try {
      const res = await fetch("/api/admin/blood-bank", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token") || ''}`
        },
        body: JSON.stringify({ requestId, action })
      })
      const data = await res.json()
      
      if (res.ok) {
        toast.success(data.message)
        fetchData()
      } else {
        toast.error(data.error || "Failed to process request")
      }
    } catch (err) {
      toast.error("Network error")
    } finally {
      setActionLoading(null)
    }
  }

  const handleAddStock = async () => {
    if (!newStock.bloodGroup || newStock.units < 1) return toast.error("Select group and valid units")
    
    try {
        const res = await fetch("/api/admin/blood-bank", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${localStorage.getItem("token") || ''}`
            },
            body: JSON.stringify({ action: "ADD_STOCK", ...newStock })
        })
        const data = await res.json()
        if (res.ok) {
            toast.success("Stock added successfully")
            setIsAddStockModalOpen(false)
            fetchData()
        } else {
            toast.error(data.error || "Failed to add stock")
        }
    } catch (err) {
        toast.error("Network error")
    }
  }

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
        
        {/* Header */}
        <div className="flex justify-between items-center">
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Blood Bank</h1>
                <p className="text-slate-500 font-medium mt-1 text-sm">Inventory & Transfusion Requests</p>
            </div>
            <Button 
                onClick={() => setIsAddStockModalOpen(true)}
                className="bg-red-600 hover:bg-red-700 text-white rounded-xl h-12 px-6 font-bold tracking-wide"
            >
                <Plus className="w-5 h-5 mr-2" /> Record Donation
            </Button>
        </div>

        {/* Inventory Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {inventory.map(item => (
                <Card key={item.bloodGroup} className={`rounded-3xl border-none shadow-sm ${item.units < 5 ? "bg-red-50" : "bg-white"}`}>
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                        <Droplet className={`w-8 h-8 mb-2 ${item.units < 5 ? "text-red-500" : "text-red-400"}`} />
                        <h3 className="text-2xl font-black text-slate-800">{item.bloodGroup}</h3>
                        <p className={`text-xs font-bold mt-1 uppercase tracking-widest ${item.units < 5 ? "text-red-600" : "text-slate-400"}`}>
                            {item.units} Units
                        </p>
                    </CardContent>
                </Card>
            ))}
        </div>

        {/* Requests List */}
        <div>
            <h2 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Active Transfusion Requests
            </h2>
            <div className="space-y-4">
                {requests.filter(r => r.status === "Pending").length === 0 ? (
                    <div className="py-10 text-center bg-white rounded-[2rem] border border-slate-100 shadow-sm">
                        <Droplet className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No pending requests</p>
                    </div>
                ) : (
                    requests.filter(r => r.status === "Pending").map(req => (
                        <Card key={req._id} className="rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                            <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6 bg-white">
                                <div className="w-20 h-20 rounded-full bg-red-50 border-4 border-red-100 flex items-center justify-center shrink-0">
                                    <span className="text-2xl font-black text-red-600">{req.bloodGroup}</span>
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="text-lg font-black text-slate-900">{req.patientName}</h3>
                                        <Badge variant="outline" className="bg-slate-50 uppercase tracking-widest text-[9px] font-bold">
                                            {req.urgency}
                                        </Badge>
                                    </div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                                        Request ID: {req._id} • {req.units} Units Required
                                    </p>
                                </div>
                                <div className="flex items-center gap-3 w-full md:w-auto">
                                    <Button 
                                        onClick={() => handleProcessRequest(req._id, "REJECT")}
                                        disabled={actionLoading === req._id}
                                        variant="outline" 
                                        className="flex-1 md:flex-none h-12 rounded-xl border-slate-200 text-slate-600 font-bold"
                                    >
                                        Reject
                                    </Button>
                                    <Button 
                                        onClick={() => handleProcessRequest(req._id, "APPROVE")}
                                        disabled={actionLoading === req._id}
                                        className="flex-1 md:flex-none h-12 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold px-8"
                                    >
                                        {actionLoading === req._id ? <Loader2 className="w-5 h-5 animate-spin" /> : "Approve & Deduct"}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
      </div>

      <Dialog open={isAddStockModalOpen} onOpenChange={setIsAddStockModalOpen}>
        <DialogContent className="rounded-[2rem] p-8 border-none shadow-2xl max-w-sm">
            <DialogHeader className="mb-6">
                <DialogTitle className="text-2xl font-black flex items-center gap-2">
                    <Droplet className="w-6 h-6 text-red-500" />
                    Record Donation
                </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1 mb-1 block">Blood Group</label>
                    <Select value={newStock.bloodGroup} onValueChange={(val) => setNewStock({...newStock, bloodGroup: val})}>
                        <SelectTrigger className="h-12 rounded-xl border-slate-200 bg-slate-50 font-bold">
                            <SelectValue placeholder="Select Group" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                            {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bg => (
                                <SelectItem key={bg} value={bg} className="font-bold">{bg}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1 mb-1 block">Units Collected</label>
                    <Input 
                        type="number" 
                        min="1"
                        value={newStock.units}
                        onChange={(e) => setNewStock({...newStock, units: parseInt(e.target.value) || 1})}
                        className="h-12 rounded-xl border-slate-200 bg-slate-50 font-bold" 
                    />
                </div>
                <Button 
                    onClick={handleAddStock}
                    className="w-full h-12 rounded-xl bg-red-600 hover:bg-red-700 font-bold tracking-widest uppercase mt-4"
                >
                    Add to Inventory
                </Button>
            </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}
