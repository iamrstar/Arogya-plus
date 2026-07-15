"use client"

import { useState, useEffect } from "react"
import { PatientLayout } from "@/components/layouts/patient-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Video, Mic, MicOff, VideoOff, PhoneOff, Settings, CheckCircle2, AlertCircle, Maximize, User } from "lucide-react"

export default function PatientTelemedicine() {
  const [appointments, setAppointments] = useState([])
  const [activeCall, setActiveCall] = useState(null)
  const [callState, setCallState] = useState({ mic: true, video: true })

  useEffect(() => {
    // Fetch appointments
    const fetchAppointments = async () => {
      const token = localStorage.getItem("token")
      const res = await fetch("/api/appointments", {
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
    <PatientLayout>
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 h-[calc(100vh-4rem)] flex flex-col">
        
        {!activeCall && (
          <div>
            <h1 className="text-3xl font-black tracking-tighter text-slate-900 flex items-center gap-3">
              Virtual Care Clinic <Video className="w-8 h-8 text-primary" />
            </h1>
            <p className="text-slate-500 font-medium mt-2">Connect with your specialists from the comfort of your home</p>
          </div>
        )}

        {!activeCall ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            <div className="space-y-6">
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Waiting Room</h2>
              {appointments.length > 0 ? (
                appointments.map(apt => (
                  <Card key={apt._id} className="rounded-[2rem] border-none shadow-xl bg-white overflow-hidden">
                    <CardContent className="p-8">
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <Badge className="bg-primary/10 text-primary border-none mb-3">Today, {apt.time}</Badge>
                          <h3 className="text-xl font-black">{apt.doctorName}</h3>
                          <p className="text-slate-500 text-sm">{apt.type}</p>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                          <User className="w-6 h-6 text-slate-400" />
                        </div>
                      </div>
                      
                      <div className="bg-slate-50 rounded-2xl p-4 mb-6 flex items-center gap-3 text-sm text-slate-600">
                        <CheckCircle2 className="w-5 h-5 text-green-500" /> System check complete. Camera & Microphone are ready.
                      </div>

                      <Button onClick={() => joinCall(apt)} className="w-full h-14 rounded-xl text-lg font-bold gap-2">
                        <Video className="w-5 h-5" /> Join Consultation
                      </Button>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-[2rem]">
                  <p className="text-slate-500 font-bold">No virtual consultations scheduled for today.</p>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Telemedicine Guidelines</h2>
              <Card className="rounded-[2rem] border-none shadow-sm bg-slate-50/50">
                <CardContent className="p-8 space-y-4 text-slate-600 text-sm">
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm">1</div>
                    <p>Find a quiet, well-lit place with a strong internet connection.</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm">2</div>
                    <p>Have your previous reports and current medications handy.</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm">3</div>
                    <p>Join the waiting room 5 minutes before your scheduled time.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col bg-slate-900 rounded-[2rem] overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-300">
            {/* Top Bar */}
            <div className="h-16 bg-black/40 px-6 flex justify-between items-center z-10 backdrop-blur-md">
              <div className="flex items-center gap-4 text-white">
                <Badge variant="destructive" className="animate-pulse flex gap-2"><div className="w-2 h-2 rounded-full bg-white"></div> LIVE</Badge>
                <span className="font-bold">{activeCall.doctorName}</span>
                <span className="text-slate-400 text-sm hidden sm:inline">| End-to-end encrypted</span>
              </div>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                <Maximize className="w-5 h-5" />
              </Button>
            </div>

            {/* Video Area */}
            <div className="flex-1 relative flex items-center justify-center bg-slate-800">
              {/* Doctor Video Placeholder */}
              <div className="w-48 h-48 rounded-full bg-slate-700 flex items-center justify-center animate-pulse">
                <User className="w-20 h-20 text-slate-500" />
              </div>
              <p className="absolute bottom-8 text-white font-medium bg-black/50 px-4 py-1 rounded-full">{activeCall.doctorName}</p>

              {/* Picture in Picture (Self) */}
              <div className="absolute bottom-8 right-8 w-48 h-64 bg-slate-700 rounded-2xl border-4 border-slate-900 overflow-hidden shadow-2xl flex items-center justify-center">
                {!callState.video ? (
                  <User className="w-12 h-12 text-slate-500" />
                ) : (
                  <p className="text-slate-400 text-xs text-center px-4">Your Camera Feed<br/>(Simulated)</p>
                )}
              </div>
            </div>

            {/* Controls */}
            <div className="h-24 bg-black/60 backdrop-blur-xl flex items-center justify-center gap-6 z-10">
              <Button 
                variant="outline" 
                size="icon" 
                className={`w-14 h-14 rounded-full border-0 ${callState.mic ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-red-500 text-white hover:bg-red-600'}`}
                onClick={() => setCallState(p => ({ ...p, mic: !p.mic }))}
              >
                {callState.mic ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                className={`w-14 h-14 rounded-full border-0 ${callState.video ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-red-500 text-white hover:bg-red-600'}`}
                onClick={() => setCallState(p => ({ ...p, video: !p.video }))}
              >
                {callState.video ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
              </Button>
              <Button 
                variant="destructive" 
                size="icon" 
                className="w-16 h-16 rounded-[1.5rem] bg-red-600 hover:bg-red-700 shadow-xl shadow-red-600/20"
                onClick={endCall}
              >
                <PhoneOff className="w-7 h-7" />
              </Button>
            </div>
          </div>
        )}

      </div>
    </PatientLayout>
  )
}
