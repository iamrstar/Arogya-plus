"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/layouts/admin-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Activity, HeartPulse, ShieldAlert, ArrowRightRight, Droplet, Clock, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"

export default function OrganRegistry() {
  const [data, setData] = useState({ organs: [], waitlist: [] })
  const [loading, setLoading] = useState(true)
  const [isMatching, setIsMatching] = useState(false)

  const fetchData = async () => {
    try {
      const res = await fetch("/api/admin/organs")
      if (res.ok) {
        const json = await res.json()
        setData(json)
      }
    } catch (error) {
      toast.error("Failed to load registry data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleMatch = async (organId, waitlistId) => {
    setIsMatching(true)
    try {
      const res = await fetch("/api/admin/organs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "match", matchData: { organId, waitlistId } })
      })
      if (res.ok) {
        toast.success("Match Successful! Transplant protocol initiated.")
        fetchData()
      } else {
        toast.error("Match failed.")
      }
    } catch (e) {
      toast.error("Error running match algorithm")
    } finally {
      setIsMatching(false)
    }
  }

  return (
    <AdminLayout>
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-slate-900 flex items-center gap-3">
            Organ Registry <HeartPulse className="w-8 h-8 text-rose-500" />
          </h1>
          <p className="text-slate-500 font-medium mt-2">National transplant network and matching system</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Waitlist */}
          <Card className="rounded-[2rem] border-none shadow-xl bg-slate-900 text-white overflow-hidden">
            <div className="p-8 pb-4">
              <Badge variant="secondary" className="bg-rose-500/20 text-rose-300 border-none mb-4">Urgent Queue</Badge>
              <h2 className="text-2xl font-black tracking-tight">Transplant Waitlist</h2>
              <p className="text-slate-400 text-sm mt-1">Patients awaiting organ allocation</p>
            </div>
            <CardContent className="p-6 space-y-4">
              {data.waitlist.map(patient => (
                <div key={patient._id} className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:bg-white/10 transition-colors">
                  {patient.status === "Critical" && (
                    <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-100 transition-opacity">
                      <ShieldAlert className="w-16 h-16 text-rose-500" />
                    </div>
                  )}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold">{patient.patientName}</h3>
                      <p className="text-xs text-slate-400">ID: {patient.patientId}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Priority</span>
                      <span className={`text-xl font-black ${patient.urgencyScore > 90 ? 'text-rose-500' : 'text-amber-400'}`}>{patient.urgencyScore}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="bg-slate-800 rounded-xl px-4 py-2 flex items-center gap-2">
                      <HeartPulse className="w-4 h-4 text-slate-400" />
                      <span className="font-bold">{patient.organNeeded}</span>
                    </div>
                    <div className="bg-rose-950/50 text-rose-200 rounded-xl px-4 py-2 flex items-center gap-2">
                      <Droplet className="w-4 h-4 text-rose-400" />
                      <span className="font-bold">{patient.bloodGroup}</span>
                    </div>
                  </div>
                  
                  {patient.status === "Matched" && (
                     <div className="mt-4 flex items-center gap-2 text-green-400 font-bold bg-green-400/10 p-3 rounded-xl">
                       <CheckCircle2 className="w-5 h-5" /> Match Found - Prep Started
                     </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Inventory */}
          <div className="space-y-6">
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-2">Available Organs</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {data.organs.map(organ => (
                <Card key={organ._id} className="rounded-2xl border-slate-200 shadow-sm hover:shadow-lg transition-all relative overflow-hidden group">
                  <div className={`h-1.5 w-full absolute top-0 left-0 ${organ.status === 'Available' ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <Badge variant="outline" className={organ.status === 'Available' ? 'text-green-600 border-green-200 bg-green-50' : 'text-slate-500'}>
                        {organ.status}
                      </Badge>
                      <span className="text-xs font-bold text-slate-400">{organ._id}</span>
                    </div>
                    
                    <h3 className="text-2xl font-black text-slate-900 mb-4">{organ.type}</h3>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-2">
                        <span className="text-slate-500 font-medium flex items-center gap-1.5"><Droplet className="w-4 h-4 text-rose-500"/> Blood Type</span>
                        <span className="font-bold text-slate-900">{organ.bloodGroup}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-2">
                        <span className="text-slate-500 font-medium flex items-center gap-1.5"><Activity className="w-4 h-4 text-blue-500"/> Donor</span>
                        <span className="font-bold text-slate-900">{organ.donor}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500 font-medium flex items-center gap-1.5"><Clock className="w-4 h-4 text-amber-500"/> Viability</span>
                        <span className="font-bold text-slate-900">48 hrs</span>
                      </div>
                    </div>

                    {organ.status === "Available" && (
                      <Button 
                        disabled={isMatching}
                        onClick={() => {
                           // Find a matching waitlist patient
                           const match = data.waitlist.find(w => w.organNeeded === organ.type && w.bloodGroup === organ.bloodGroup && w.status !== "Matched")
                           if (match) {
                             handleMatch(organ._id, match._id)
                           } else {
                             toast.error("No compatible patient found on waitlist.")
                           }
                        }}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-lg"
                      >
                        Run HLA Match <ArrowRightRight className="w-4 h-4 ml-2" />
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

        </div>
      </div>
    </AdminLayout>
  )
}
