"use client"

import { useState, useEffect } from "react"
import { EmergencyLayout } from "@/components/layouts/emergency-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Phone, MapPin, Clock, Siren, ChevronRight, Activity, Truck, Plus } from "lucide-react"
import { toast } from "sonner"

export default function EmergencyDashboard() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [isManualDispatchOpen, setIsManualDispatchOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    location: "",
    caller: "",
    phone: "",
    type: "Public Emergency"
  })

  const fetchRequests = async () => {
    try {
      const res = await fetch("/api/emergency/requests")
      const data = await res.json()
      if (res.ok) setRequests(data)
    } catch (error) {
      console.error("Failed to fetch emergency requests")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
    const interval = setInterval(fetchRequests, 5000) // Poll every 5s for real-time feel
    return () => clearInterval(interval)
  }, [])

  const handleManualDispatch = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const res = await fetch("/api/emergency/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })
      if (res.ok) {
        toast.success("Ambulance Dispatched successfully!")
        setFormData({ location: "", caller: "", phone: "", type: "Public Emergency" })
        setIsManualDispatchOpen(false)
        fetchRequests()
      }
    } catch (error) {
      toast.error("Failed to create dispatch request")
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateStatus = async (id, newStatus, assignedAmbulance = null) => {
    try {
      const res = await fetch("/api/emergency/requests", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus, assignedAmbulance })
      })
      if (res.ok) {
        toast.success(`Status updated to ${newStatus}`)
        fetchRequests()
      }
    } catch (error) {
      toast.error("Failed to update status")
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending": return "bg-red-500 text-white animate-pulse"
      case "Dispatched": return "bg-orange-500 text-white"
      case "En Route": return "bg-blue-500 text-white"
      case "Arrived": return "bg-purple-500 text-white"
      case "Resolved": return "bg-green-500 text-white"
      default: return "bg-slate-500 text-white"
    }
  }

  return (
    <EmergencyLayout>
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        
        <div className="flex flex-col md:flex-row justify-between gap-6 items-start md:items-center">
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-slate-900 flex items-center gap-3">
              Live Operations <Activity className="w-8 h-8 text-red-500" />
            </h1>
            <p className="text-slate-500 font-medium mt-2">Monitor and dispatch emergency medical services</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            
            <Dialog open={isManualDispatchOpen} onOpenChange={setIsManualDispatchOpen}>
              <DialogTrigger asChild>
                <Button className="h-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-[2rem] shadow-xl shadow-red-600/20 px-6">
                  <Plus className="w-5 h-5 mr-2" />
                  Manual Dispatch
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] rounded-[2rem]">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-black tracking-tight text-slate-900">New Emergency Dispatch</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleManualDispatch} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Emergency Location</Label>
                    <Input 
                      required
                      placeholder="e.g. 123 Main St, Sector 4"
                      className="rounded-xl h-12 bg-slate-50 border-slate-200"
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Caller Name</Label>
                    <Input 
                      required
                      placeholder="e.g. John Doe"
                      className="rounded-xl h-12 bg-slate-50 border-slate-200"
                      value={formData.caller}
                      onChange={(e) => setFormData({...formData, caller: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Phone Number</Label>
                    <Input 
                      required
                      placeholder="e.g. +91 9876543210"
                      className="rounded-xl h-12 bg-slate-50 border-slate-200"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Emergency Type</Label>
                    <Input 
                      required
                      placeholder="e.g. Cardiac Arrest, Accident"
                      className="rounded-xl h-12 bg-slate-50 border-slate-200"
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                    />
                  </div>
                  <Button type="submit" disabled={isSubmitting} className="w-full rounded-xl h-12 bg-red-600 hover:bg-red-700 mt-4">
                    {isSubmitting ? "Dispatching..." : "Send Ambulance Immediately"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>

            <Card className="bg-red-600 border-none shadow-xl shadow-red-600/20 rounded-[2rem] px-8 py-4 text-white">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">Active Critical</p>
              <p className="text-4xl font-black">{requests.filter(r => r.status === "Pending").length}</p>
            </Card>
            <Card className="bg-slate-900 border-none shadow-xl shadow-slate-900/20 rounded-[2rem] px-8 py-4 text-white">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">Fleet En Route</p>
              <p className="text-4xl font-black">{requests.filter(r => ["Dispatched", "En Route"].includes(r.status)).length}</p>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 px-2">Incoming Dispatch Feed</h2>
            
            {loading ? (
              <div className="h-40 flex items-center justify-center text-slate-400 font-bold animate-pulse">Loading Live Feed...</div>
            ) : requests.length === 0 ? (
              <Card className="border-dashed border-2 bg-transparent p-12 text-center rounded-[3rem]">
                <Siren className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-400 font-bold">No active emergency requests.</p>
              </Card>
            ) : (
              requests.map(request => (
                <Card key={request._id} className={`border-none shadow-sm hover:shadow-xl transition-all duration-300 rounded-[2rem] overflow-hidden ${request.status === 'Pending' ? 'ring-2 ring-red-500 ring-offset-4' : ''}`}>
                  <CardContent className="p-0 flex flex-col md:flex-row">
                    
                    {/* Status Strip */}
                    <div className={`w-full md:w-32 flex flex-col items-center justify-center p-6 ${getStatusColor(request.status)}`}>
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-2">Status</span>
                      <span className="font-bold text-center leading-tight">{request.status}</span>
                    </div>

                    <div className="flex-1 p-6 flex flex-col md:flex-row gap-6 justify-between items-center bg-white">
                      <div className="space-y-4 w-full md:w-auto">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Siren className="w-4 h-4 text-red-500" />
                            <span className="text-sm font-black text-slate-900">{request.type}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-500 text-xs font-bold">
                            <Clock className="w-3 h-3" />
                            {new Date(request.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-start gap-2 text-sm text-slate-700">
                            <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                            <span className="font-medium">{request.location}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-700">
                            <Phone className="w-4 h-4 text-slate-400" />
                            <span className="font-medium">{request.caller} ({request.phone})</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 w-full md:w-auto min-w-[160px]">
                        {request.status === "Pending" && (
                          <Button 
                            className="w-full bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg shadow-red-500/30"
                            onClick={() => updateStatus(request._id, "Dispatched", "AMB-0" + Math.floor(Math.random() * 5 + 1))}
                          >
                            <Truck className="w-4 h-4 mr-2" />
                            Dispatch Unit
                          </Button>
                        )}
                        {request.status === "Dispatched" && (
                          <Button 
                            className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-xl shadow-lg"
                            onClick={() => updateStatus(request._id, "En Route")}
                          >
                            Mark En Route
                          </Button>
                        )}
                        {request.status === "En Route" && (
                          <Button 
                            className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-xl shadow-lg"
                            onClick={() => updateStatus(request._id, "Arrived")}
                          >
                            Unit Arrived
                          </Button>
                        )}
                        {request.status === "Arrived" && (
                          <Button 
                            className="w-full bg-green-500 hover:bg-green-600 text-white rounded-xl shadow-lg"
                            onClick={() => updateStatus(request._id, "Resolved")}
                          >
                            Resolve Case
                          </Button>
                        )}
                        {request.assignedAmbulance && (
                          <div className="text-center mt-2">
                            <Badge variant="outline" className="border-slate-200 text-slate-500 font-bold">
                              Unit: {request.assignedAmbulance}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>

                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
             <Card className="bg-slate-900 text-white border-none rounded-[2rem] overflow-hidden shadow-2xl">
                <div className="p-8 pb-4">
                  <h3 className="text-lg font-black tracking-tight mb-1">Fleet Operations</h3>
                  <p className="text-xs text-slate-400 font-medium">Real-time ambulance tracking</p>
                </div>
                <div className="p-4 space-y-2">
                  {[1, 2, 3, 4, 5].map((unit) => {
                    // Just visually fake the fleet status based on active requests
                    const isBusy = requests.some(r => r.assignedAmbulance === `AMB-0${unit}` && !["Resolved"].includes(r.status))
                    return (
                      <div key={unit} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isBusy ? 'bg-orange-500/20 text-orange-400' : 'bg-green-500/20 text-green-400'}`}>
                            <Truck className="w-4 h-4" />
                          </div>
                          <span className="font-bold text-sm">AMB-0{unit}</span>
                        </div>
                        <Badge variant="secondary" className={`${isBusy ? 'bg-orange-500 text-white' : 'bg-green-500 text-white'} font-black text-[10px] uppercase tracking-widest`}>
                          {isBusy ? "On Call" : "Available"}
                        </Badge>
                      </div>
                    )
                  })}
                </div>
             </Card>
          </div>
        </div>
      </div>
    </EmergencyLayout>
  )
}
