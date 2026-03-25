"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PatientLayout } from "@/components/layouts/patient-layout"
import { Pill, Calendar, User, Filter, Search, Download, Loader2 } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"

export default function PatientPrescriptions() {
    const { token, user } = useAuth()
    const [prescriptions, setPrescriptions] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [expandedSession, setExpandedSession] = useState(null)

    useEffect(() => {
        if (token) {
            fetchPrescriptions()
        }
    }, [token])

    const fetchPrescriptions = async () => {
        try {
            const res = await fetch("/api/patient/prescriptions", {
                headers: { "Authorization": `Bearer ${token}` }
            })
            const data = await res.json()
            if (res.ok) {
                setPrescriptions(data)
            }
        } catch (err) {
            console.error("Clinical vault synchronization failed")
        } finally {
            setLoading(false)
        }
    }

    const filteredSessions = prescriptions.filter((s) =>
        s.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.medicines.some(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()))
    )

    if (loading) {
        return (
            <PatientLayout>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center space-y-4">
                        <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto opacity-50" />
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Synchronizing Vault</p>
                    </div>
                </div>
            </PatientLayout>
        )
    }

    return (
        <PatientLayout>
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex items-end justify-between">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-2">Prescription Vault</p>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Medical History</h1>
                    </div>
                    <Button variant="outline" className="rounded-2xl border-slate-100 bg-white shadow-sm hover:shadow-md transition-all font-bold text-xs" onClick={() => window.print()}>
                        <Download className="h-4 w-4 mr-2" />
                        Export Log
                    </Button>
                </div>

                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                    <Input
                        placeholder="Search by doctor, diagnosis, or medicine..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-12 h-14 rounded-[2rem] border-slate-100 bg-white shadow-sm focus:ring-primary focus:border-primary text-sm font-medium"
                    />
                </div>

                <div className="space-y-4">
                    {filteredSessions.length === 0 ? (
                        <Card className="rounded-[2.5rem] border-dashed border-slate-200 bg-slate-50/50">
                            <CardContent className="p-16 text-center">
                                <Pill className="h-12 w-12 text-slate-300 mx-auto mb-4 opacity-20" />
                                <h3 className="text-xl font-bold text-slate-400">Clinical registry is quiet</h3>
                                <p className="text-slate-400 text-xs mt-1">No prescriptions found matching your search</p>
                            </CardContent>
                        </Card>
                    ) : (
                        filteredSessions.map((session) => (
                            <div key={session.sessionId} className="group">
                                <Card
                                    className={`rounded-[2rem] border-none shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden cursor-pointer ${expandedSession === session.sessionId ? 'ring-2 ring-primary/20 shadow-xl' : 'bg-white'}`}
                                    onClick={() => setExpandedSession(expandedSession === session.sessionId ? null : session.sessionId)}
                                >
                                    <div className="p-8">
                                        <div className="flex items-start justify-between">
                                            <div className="flex gap-6">
                                                <div className="bg-slate-900 rounded-3xl p-4 text-white shadow-lg group-hover:scale-110 transition-transform">
                                                    <Calendar className="h-6 w-6" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <h3 className="font-black text-xl text-slate-900">{session.doctorName}</h3>
                                                        <Badge variant="outline" className="rounded-full border-slate-100 bg-slate-50 text-[10px] uppercase font-black px-3 py-1 tracking-widest text-slate-500">
                                                            {session.diagnosis}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                                        CONSULTATION ON <span className="text-slate-900 tracking-widest">{new Date(session.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    className="rounded-full bg-slate-100 hover:bg-primary hover:text-white transition-all font-black text-[10px] uppercase tracking-widest h-10 px-6"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        window.open(`/api/doctor/prescription-pdf?appointmentId=${session.appointmentId}&patientId=${session.patientId}`, "_blank")
                                                    }}
                                                >
                                                    <Download className="w-3 h-3 mr-2" />
                                                    View PDF
                                                </Button>
                                                <div className={`p-2 rounded-full transition-transform duration-500 bg-slate-50 ${expandedSession === session.sessionId ? 'rotate-180' : ''}`}>
                                                    <Filter className="w-4 h-4 text-slate-400" />
                                                </div>
                                            </div>
                                        </div>

                                        {expandedSession === session.sessionId && (
                                            <div className="mt-8 pt-8 border-t border-slate-50 animate-in fade-in slide-in-from-top-4 duration-500">
                                                <div className="grid gap-4 md:grid-cols-2">
                                                    {session.medicines.map((med, idx) => (
                                                        <div key={idx} className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100 group/med hover:bg-white hover:shadow-md transition-all">
                                                            <div className="flex items-center gap-4 mb-4">
                                                                <div className="bg-white p-3 rounded-2xl shadow-sm group-hover/med:bg-primary transition-colors">
                                                                    <Pill className="w-5 h-5 text-primary group-hover/med:text-white" />
                                                                </div>
                                                                <div>
                                                                    <h4 className="font-black text-slate-800 tracking-tight">{med.name}</h4>
                                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dosage: {med.dosage}</p>
                                                                </div>
                                                            </div>
                                                            <div className="space-y-3">
                                                                <div className="flex items-center justify-between text-[11px] font-medium p-3 bg-white rounded-2xl border border-slate-50">
                                                                    <span className="text-slate-400">Duration</span>
                                                                    <span className="text-slate-900 font-bold">{med.duration}</span>
                                                                </div>
                                                                <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                                                                    <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Clinical Instruction</p>
                                                                    <p className="text-xs text-slate-700 font-medium leading-relaxed">{med.instructions}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                {session.tests && session.tests.length > 0 && (
                                                    <div className="mt-8">
                                                        <div className="flex items-center gap-3 mb-6">
                                                            <div className="h-px flex-1 bg-slate-100" />
                                                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Diagnostic Investigations</p>
                                                            <div className="h-px flex-1 bg-slate-100" />
                                                        </div>
                                                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                                            {session.tests.map((test, idx) => (
                                                                <div key={idx} className="bg-slate-50/20 rounded-3xl p-6 border border-slate-100 hover:bg-white transition-all">
                                                                    <div className="flex justify-between items-start mb-4">
                                                                        <div>
                                                                            <h4 className="font-black text-slate-800 text-sm">{test.name}</h4>
                                                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">{test.category}</p>
                                                                        </div>
                                                                        <Badge variant="outline" className={`text-[9px] font-black uppercase px-2 py-0.5 ${test.status === "Completed" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                                                                test.status === "In Progress" ? "bg-blue-50 text-blue-600 border-blue-100" :
                                                                                    "bg-amber-50 text-amber-600 border-amber-100"
                                                                            }`}>
                                                                            {test.status}
                                                                        </Badge>
                                                                    </div>
                                                                    {test.status === "Completed" ? (
                                                                        <div className="space-y-3">
                                                                            <div className="p-4 bg-white rounded-2xl border border-slate-50 shadow-sm">
                                                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Findings / Result</p>
                                                                                <p className="text-xs font-black text-slate-900">{test.result}</p>
                                                                            </div>
                                                                            {test.referenceRange && (
                                                                                <div className="p-4 bg-white rounded-2xl border border-slate-50">
                                                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Reference Range</p>
                                                                                    <p className="text-xs font-medium text-slate-600 italic">{test.referenceRange}</p>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    ) : (
                                                                        <div className="p-4 bg-slate-100/50 rounded-2xl border border-dashed border-slate-200 text-center">
                                                                            <p className="text-[9px] font-bold text-slate-400">Processing results...</p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </PatientLayout>
    )
}
