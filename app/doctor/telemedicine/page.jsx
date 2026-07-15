"use client"

import { useState, useEffect } from "react"
import { DoctorLayout } from "@/components/layouts/doctor-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Video, Mic, MicOff, VideoOff, PhoneOff, Maximize, User, FileText, Activity } from "lucide-react"

export default function DoctorTelemedicine() {
  const [appointments, setAppointments] = useState([])
  const [activeCall, setActiveCall] = useState(null)
  const [callState, setCallState] = useState({ mic: true, video: true })

  useEffect(() => {
    // Fetch doctor's appointments
    const fetchAppointments = async () => {
      const token = localStorage.getItem("token")
      const res = await fetch("/api/doctor/appointments", {
        headers: { "Authorization": `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setAppointments(data.filter(a => a.type === "Tele-Consultation"))
      }
    }
    fetchAppointments()
  }, [])

  const joinCall = (appointment) => {
    setActiveCall(appointment)
  }

  const endCall = () => {
    setActiveCall(null)
  }

  return (
    <DoctorLayout>
      <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-6 h-[calc(100vh-4rem)] flex flex-col">
        
        {!activeCall && (
          <div>
            <h1 className="text-3xl font-black tracking-tighter text-slate-900 flex items-center gap-3">
              Virtual Clinic <Video className="w-8 h-8 text-primary" />
            </h1>
            <p className="text-slate-500 font-medium mt-2">Manage your online consultations</p>
          </div>
        )}

        {!activeCall ? (
          <div className="mt-8">
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Upcoming Virtual Sessions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {appointments.length > 0 ? (
                appointments.map(apt => (
                  <Card key={apt._id} className="rounded-[2rem] border-none shadow-xl bg-white overflow-hidden transition-all hover:-translate-y-1">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <Badge className="bg-primary/10 text-primary border-none mb-3">{apt.time}</Badge>
                          <h3 className="text-xl font-black">{apt.patientName}</h3>
                          <p className="text-slate-500 text-sm">ID: {apt.patientId}</p>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                          <User className="w-6 h-6 text-slate-400" />
                        </div>
                      </div>
                      
                      <Button onClick={() => joinCall(apt)} className="w-full h-12 rounded-xl font-bold gap-2 bg-slate-900 hover:bg-slate-800 text-white">
                        <Video className="w-4 h-4" /> Start Consultation
                      </Button>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full p-12 text-center border-2 border-dashed border-slate-200 rounded-[2rem]">
                  <p className="text-slate-500 font-bold">No virtual consultations scheduled.</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex gap-6 animate-in slide-in-from-bottom-8 duration-500">
            {/* Left: Video Call Interface */}
            <div className="flex-1 flex flex-col bg-slate-900 rounded-[2rem] overflow-hidden shadow-2xl relative">
              <div className="h-16 bg-black/40 px-6 flex justify-between items-center z-10 backdrop-blur-md">
                <div className="flex items-center gap-4 text-white">
                  <Badge variant="destructive" className="animate-pulse flex gap-2"><div className="w-2 h-2 rounded-full bg-white"></div> IN CALL</Badge>
                  <span className="font-bold">{activeCall.patientName}</span>
                </div>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                  <Maximize className="w-5 h-5" />
                </Button>
              </div>

              <div className="flex-1 relative flex items-center justify-center bg-slate-800">
                {/* Patient Video Placeholder */}
                <div className="w-48 h-48 rounded-full bg-slate-700 flex items-center justify-center">
                  <User className="w-20 h-20 text-slate-500" />
                </div>
                <p className="absolute bottom-8 text-white font-medium bg-black/50 px-4 py-1 rounded-full">Patient Feed</p>

                {/* Picture in Picture (Doctor) */}
                <div className="absolute bottom-8 right-8 w-40 h-56 bg-slate-700 rounded-2xl border-4 border-slate-900 overflow-hidden shadow-2xl flex items-center justify-center">
                  {!callState.video ? (
                    <User className="w-12 h-12 text-slate-500" />
                  ) : (
                    <p className="text-slate-400 text-xs text-center px-4">Your Camera</p>
                  )}
                </div>
              </div>

              {/* Controls */}
              <div className="h-24 bg-black/60 backdrop-blur-xl flex items-center justify-center gap-6 z-10">
                <Button variant="outline" size="icon" className={`w-14 h-14 rounded-full border-0 ${callState.mic ? 'bg-white/10 text-white' : 'bg-red-500 text-white'}`} onClick={() => setCallState(p => ({ ...p, mic: !p.mic }))}>
                  {callState.mic ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
                </Button>
                <Button variant="outline" size="icon" className={`w-14 h-14 rounded-full border-0 ${callState.video ? 'bg-white/10 text-white' : 'bg-red-500 text-white'}`} onClick={() => setCallState(p => ({ ...p, video: !p.video }))}>
                  {callState.video ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
                </Button>
                <Button variant="destructive" size="icon" className="w-16 h-16 rounded-[1.5rem] bg-red-600 hover:bg-red-700" onClick={endCall}>
                  <PhoneOff className="w-7 h-7" />
                </Button>
              </div>
            </div>

            {/* Right: Clinical History Split Screen */}
            <div className="w-[400px] xl:w-[500px] flex flex-col gap-6 hidden lg:flex">
              <Card className="flex-1 rounded-[2rem] border-none shadow-xl bg-white overflow-hidden flex flex-col">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                  <h3 className="font-black text-lg flex items-center gap-2"><FileText className="w-5 h-5 text-primary" /> Clinical Summary</h3>
                </div>
                <CardContent className="flex-1 p-6 overflow-y-auto space-y-6">
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Patient Details</h4>
                    <p className="font-bold text-slate-900">{activeCall.patientName}</p>
                    <p className="text-sm text-slate-500">ID: {activeCall.patientId}</p>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Recent Vitals (From Home Kit)</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <p className="text-xs text-slate-500 font-medium">BP</p>
                        <p className="font-bold">120/80</p>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <p className="text-xs text-slate-500 font-medium">SpO2</p>
                        <p className="font-bold text-green-600">98%</p>
                      </div>
                    </div>
                  </div>
                  <div>
                     <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Ongoing Medications</h4>
                     <ul className="space-y-2">
                       <li className="text-sm bg-slate-50 p-3 rounded-xl border border-slate-100 flex justify-between">
                         <span className="font-bold">Aspirin 75mg</span>
                         <span className="text-slate-500">1x Daily</span>
                       </li>
                     </ul>
                  </div>
                </CardContent>
              </Card>
              
              <Button className="h-16 rounded-[2rem] w-full bg-primary hover:bg-primary/90 text-lg font-bold shadow-xl shadow-primary/20">
                Write E-Prescription
              </Button>
            </div>
          </div>
        )}

      </div>
    </DoctorLayout>
  )
}
