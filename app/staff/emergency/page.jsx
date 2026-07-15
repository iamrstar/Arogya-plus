"use client"

import { useState, useEffect } from "react"
import { StaffLayout } from "@/components/layouts/staff-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, PhoneCall, Truck, Activity, Siren, MapPin, Clock } from "lucide-react"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function EmergencyTriage() {
  const [ambulances, setAmbulances] = useState([])
  const [cases, setCases] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false)
  
  const [newCase, setNewCase] = useState({ callerName: "", phone: "", location: "", condition: "", ambulanceId: "" })

  useEffect(() => {
    fetchEmergencyData()
  }, [])

  const fetchEmergencyData = async () => {
    try {
      const res = await fetch("/api/staff/emergency", {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token") || ''}` }
      })
      const data = await res.json()
      if (res.ok) {
        setAmbulances(data.ambulances || [])
        setCases(data.emergencyCases || [])
      } else {
        toast.error(data.error || "Failed to load emergency data")
      }
    } catch (err) {
      toast.error("Network error fetching emergency data")
    } finally {
      setLoading(false)
    }
  }

  const handleDispatch = async () => {
    if (!newCase.callerName || !newCase.phone || !newCase.location || !newCase.ambulanceId) {
        return toast.error("Please fill all required fields")
    }
    
    try {
        const res = await fetch("/api/staff/emergency", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${localStorage.getItem("token") || ''}`
            },
            body: JSON.stringify({ action: "DISPATCH_AMBULANCE", ...newCase })
        })
        const data = await res.json()
        if (res.ok) {
            toast.success("Ambulance dispatched successfully")
            setIsDispatchModalOpen(false)
            setNewCase({ callerName: "", phone: "", location: "", condition: "", ambulanceId: "" })
            fetchEmergencyData()
        } else {
            toast.error(data.error || "Failed to dispatch ambulance")
        }
    } catch (err) {
        toast.error("Network error")
    }
  }

  const handleArrived = async (caseId) => {
    setActionLoading(caseId)
    try {
        const res = await fetch("/api/staff/emergency", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${localStorage.getItem("token") || ''}`
            },
            body: JSON.stringify({ action: "ARRIVED", caseId })
        })
        const data = await res.json()
        if (res.ok) {
            toast.success("Patient arrived at ER. Ambulance freed.")
            fetchEmergencyData()
        } else {
            toast.error(data.error || "Action failed")
        }
    } catch (err) {
        toast.error("Network error")
    } finally {
        setActionLoading(null)
    }
  }

  if (loading) {
    return (
      <StaffLayout role="Ambulance Driver" title="Emergency Triage" description="Manage ambulances and emergency calls">
        <div className="flex items-center justify-center h-[50vh]">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      </StaffLayout>
    )
  }

  const availableAmbulances = ambulances.filter(a => a.status === "Available")
  const activeCases = cases.filter(c => c.status === "Dispatched")

  return (
    <StaffLayout role="Ambulance Driver" title="Emergency Triage" description="Manage ambulances and emergency calls">
      <div className="space-y-8 pb-20">
        
        {/* Header */}
        <div className="flex justify-between items-center">
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <Siren className="w-8 h-8 text-red-500 animate-pulse" />
                    ER & Ambulance Triage
                </h1>
            </div>
            <Button 
                onClick={() => setIsDispatchModalOpen(true)}
                className="bg-red-600 hover:bg-red-700 text-white rounded-xl h-12 px-6 font-bold tracking-wide shadow-lg shadow-red-200"
            >
                <PhoneCall className="w-5 h-5 mr-2" /> Log Emergency & Dispatch
            </Button>
        </div>

        {/* Ambulances Overview */}
        <div>
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4">Ambulance Fleet Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {ambulances.map(amb => (
                    <Card key={amb._id} className={`rounded-3xl border-none shadow-sm ${amb.status === 'Available' ? 'bg-white' : amb.status === 'On Duty' ? 'bg-red-50' : 'bg-slate-100'}`}>
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${amb.status === 'Available' ? 'bg-green-100 text-green-600' : amb.status === 'On Duty' ? 'bg-red-100 text-red-600' : 'bg-slate-200 text-slate-500'}`}>
                                    <Truck className="w-6 h-6" />
                                </div>
                                <Badge className={`uppercase tracking-widest text-[9px] font-black ${amb.status === 'Available' ? 'bg-green-100 text-green-700' : amb.status === 'On Duty' ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-slate-200 text-slate-600'}`}>
                                    {amb.status}
                                </Badge>
                            </div>
                            <h3 className="text-xl font-black text-slate-900">{amb._id}</h3>
                            <p className="text-xs font-bold text-slate-500 mt-1">Driver: {amb.driver}</p>
                            <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-slate-400 mt-4 pt-4 border-t border-slate-100">
                                <MapPin className="w-3 h-3" /> {amb.location}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>

        {/* Active Dispatches */}
        <div>
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                Active Dispatches <Badge className="bg-red-500 hover:bg-red-600">{activeCases.length}</Badge>
            </h2>
            <div className="space-y-4">
                {activeCases.length === 0 ? (
                    <div className="py-10 text-center bg-white rounded-[2rem] border border-slate-100 shadow-sm">
                        <Activity className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No active emergency runs</p>
                    </div>
                ) : (
                    activeCases.map(emr => (
                        <Card key={emr._id} className="rounded-3xl border-2 border-red-100 shadow-sm overflow-hidden bg-white">
                            <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
                                <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                                    <Siren className="w-8 h-8 text-red-500 animate-pulse" />
                                </div>
                                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Caller</p>
                                        <p className="font-black text-slate-900">{emr.callerName}</p>
                                        <p className="text-xs font-bold text-slate-500">{emr.phone}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Location & Condition</p>
                                        <p className="font-bold text-slate-900 truncate">{emr.location}</p>
                                        <p className="text-xs font-bold text-red-600">{emr.condition || "Emergency"}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Dispatch Details</p>
                                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 uppercase tracking-widest text-[9px] font-black mb-1">
                                            {emr.assignedAmbulance}
                                        </Badge>
                                        <p className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> {new Date(emr.timestamp).toLocaleTimeString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="w-full md:w-auto mt-4 md:mt-0">
                                    <Button 
                                        onClick={() => handleArrived(emr._id)}
                                        disabled={actionLoading === emr._id}
                                        className="w-full md:w-auto h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold px-8"
                                    >
                                        {actionLoading === emr._id ? <Loader2 className="w-5 h-5 animate-spin" /> : "Mark Arrived at ER"}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
      </div>

      <Dialog open={isDispatchModalOpen} onOpenChange={setIsDispatchModalOpen}>
        <DialogContent className="rounded-[2rem] p-8 border-none shadow-2xl max-w-md">
            <DialogHeader className="mb-6">
                <DialogTitle className="text-2xl font-black flex items-center gap-2">
                    <PhoneCall className="w-6 h-6 text-red-500" />
                    Log Emergency Call
                </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1 mb-1 block">Caller Name</label>
                        <Input 
                            placeholder="John Doe"
                            value={newCase.callerName}
                            onChange={(e) => setNewCase({...newCase, callerName: e.target.value})}
                            className="h-12 rounded-xl border-slate-200 bg-slate-50 font-bold" 
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1 mb-1 block">Phone</label>
                        <Input 
                            placeholder="+91..."
                            value={newCase.phone}
                            onChange={(e) => setNewCase({...newCase, phone: e.target.value})}
                            className="h-12 rounded-xl border-slate-200 bg-slate-50 font-bold" 
                        />
                    </div>
                </div>
                
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1 mb-1 block">Location</label>
                    <Input 
                        placeholder="123 Street Name, City"
                        value={newCase.location}
                        onChange={(e) => setNewCase({...newCase, location: e.target.value})}
                        className="h-12 rounded-xl border-slate-200 bg-slate-50 font-bold" 
                    />
                </div>

                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1 mb-1 block">Patient Condition / Notes</label>
                    <Input 
                        placeholder="Severe chest pain..."
                        value={newCase.condition}
                        onChange={(e) => setNewCase({...newCase, condition: e.target.value})}
                        className="h-12 rounded-xl border-slate-200 bg-slate-50 font-bold" 
                    />
                </div>

                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1 mb-1 block">Dispatch Ambulance</label>
                    <Select value={newCase.ambulanceId} onValueChange={(val) => setNewCase({...newCase, ambulanceId: val})}>
                        <SelectTrigger className="h-12 rounded-xl border-slate-200 bg-slate-50 font-bold">
                            <SelectValue placeholder="Select Available Ambulance" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                            {availableAmbulances.length === 0 && <SelectItem value="none" disabled>No ambulances available</SelectItem>}
                            {availableAmbulances.map(a => (
                                <SelectItem key={a._id} value={a._id} className="font-bold">{a._id} ({a.driver})</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <Button 
                    onClick={handleDispatch}
                    disabled={availableAmbulances.length === 0}
                    className="w-full h-12 rounded-xl bg-red-600 hover:bg-red-700 font-black tracking-widest uppercase mt-4 shadow-lg shadow-red-200"
                >
                    Dispatch Now
                </Button>
            </div>
        </DialogContent>
      </Dialog>
    </StaffLayout>
  )
}
