"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PatientLayout } from "@/components/layouts/patient-layout"
import { FileText, Calendar, User, Filter, Search, Download, Loader2, FileUp, Eye } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function PatientRecords() {
    const { token, user } = useAuth()
    const [records, setRecords] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedRecord, setSelectedRecord] = useState(null)

    useEffect(() => {
        if (token) {
            fetchRecords()
        }
    }, [token])

    const fetchRecords = async () => {
        try {
            // Structure for real API
            setRecords([
                {
                    id: "REC001",
                    documentName: "Aadhar Linkage Confirmation",
                    type: "Clinical Identity",
                    doctorName: "System Generated",
                    date: new Date().toLocaleDateString(),
                    status: "verified",
                    fileSize: "1.2 MB",
                    patientName: user?.name || "Patient",
                    patientId: "PAT" + Math.floor(Math.random() * 10000000),
                    details: {
                        summary: "Aadhar linkage successfully verified with UIDAI database.",
                        findings: [
                            "Identity Matched",
                            "Biometrics Verified",
                            "Mobile Linked"
                        ],
                        notes: "Patient identity is fully secured and verified for clinical procedures."
                    }
                },
                {
                    id: "REC002",
                    documentName: "Initial Clinical Assessment",
                    type: "Clinical Note",
                    doctorName: "Dr. Rajesh Kumar",
                    date: "2024-03-12",
                    status: "signed",
                    fileSize: "0.8 MB",
                    patientName: user?.name || "Patient",
                    patientId: "PAT" + Math.floor(Math.random() * 10000000),
                    details: {
                        summary: "Patient presented with mild chest discomfort and fatigue.",
                        vitals: {
                            bp: "120/80 mmHg",
                            hr: "72 bpm",
                            temp: "98.6 °F",
                            spo2: "99%"
                        },
                        findings: [
                            "Normal sinus rhythm on ECG.",
                            "No respiratory distress.",
                            "Patient advised rest and hydration."
                        ],
                        notes: "Follow up if symptoms persist after 48 hours."
                    }
                }
            ])
            setLoading(false)
        } catch (err) {
            console.error("Clinical registry sync error")
            setLoading(false)
        }
    }

    const filteredRecords = records.filter((r) =>
        r.documentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.type.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (loading) {
        return (
            <PatientLayout>
                <div className="flex items-center justify-center min-h-[400px]">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </PatientLayout>
        )
    }

    return (
        <PatientLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Medical Records</h1>
                        <p className="text-muted-foreground">Your clinical documents and reports</p>
                    </div>
                    <Button className="bg-primary">
                        <FileUp className="h-4 w-4 mr-2" />
                        Upload Document
                    </Button>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by document name or type..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>

                <div className="grid gap-4">
                    {filteredRecords.length === 0 ? (
                        <Card>
                            <CardContent className="p-8 text-center text-muted-foreground font-bold">
                                No clinical records found.
                            </CardContent>
                        </Card>
                    ) : (
                        filteredRecords.map((r) => (
                            <Card key={r.id} className="hover:shadow-md transition-shadow">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex gap-4">
                                            <div className="bg-slate-100 p-3 rounded-xl">
                                                <FileText className="h-6 w-6 text-slate-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg text-slate-900">{r.documentName}</h3>
                                                <p className="text-sm font-medium text-slate-600">{r.type}</p>
                                                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                                    <span className="flex items-center gap-1 font-bold">
                                                        <User className="h-3 w-3" /> {r.doctorName}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" /> {r.date}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        {r.fileSize}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Badge variant="outline" className="font-bold px-3 py-1 bg-green-50 text-green-700 border-green-100">
                                                {r.status.toUpperCase()}
                                            </Badge>
                                            <Button size="sm" variant="ghost" className="h-10 w-10 p-0 hover:bg-slate-100" onClick={() => setSelectedRecord(r)}>
                                                <Eye className="h-4 w-4 text-slate-700" />
                                            </Button>
                                            <Button size="sm" variant="ghost" className="h-10 w-10 p-0 hover:bg-slate-100">
                                                <Download className="h-4 w-4 text-slate-700" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>

            <Dialog open={!!selectedRecord} onOpenChange={(open) => !open && setSelectedRecord(null)}>
                <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col gap-0 p-0 overflow-hidden border-none shadow-2xl rounded-2xl">
                    <DialogHeader className="p-6 pb-4 bg-white border-b border-slate-100 shrink-0 relative z-10">
                        <DialogTitle className="flex items-center gap-2 text-xl font-black text-slate-800">
                            <FileText className="w-6 h-6 text-primary" />
                            {selectedRecord?.documentName}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="flex-1 overflow-y-auto bg-slate-100 p-6 md:p-10 flex flex-col items-center justify-start relative">
                        <div className="w-full max-w-3xl relative">
                            {/* Dynamic Document Rendering */}
                            <div className="bg-white text-slate-900 w-full min-h-[600px] p-8 md:p-12 shadow-xl ring-1 ring-slate-900/5 mx-auto rounded-xl relative z-10">
                                {/* Header */}
                                <div className="border-b-2 border-slate-200 pb-6 mb-6 flex justify-between items-start">
                                    <div>
                                        <h1 className="text-2xl font-black text-primary uppercase tracking-wider">Arogya Medical Record</h1>
                                        <p className="text-sm font-bold text-slate-500 mt-1">{selectedRecord?.documentName}</p>
                                    </div>
                                    <div className="text-right text-xs font-medium text-slate-500 space-y-1">
                                        <p>Record ID: {selectedRecord?.id}</p>
                                        <p>Date: {selectedRecord?.date}</p>
                                        <p>Status: <span className="uppercase text-green-600 font-bold">{selectedRecord?.status}</span></p>
                                    </div>
                                </div>
                                
                                {/* Patient Info */}
                                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100 mb-8">
                                    <div>
                                        <p className="text-[10px] uppercase font-bold text-slate-400">Patient Name</p>
                                        <p className="font-semibold text-slate-800">{selectedRecord?.patientName}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase font-bold text-slate-400">Patient ID</p>
                                        <p className="font-semibold text-slate-800">{selectedRecord?.patientId}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase font-bold text-slate-400">Provider</p>
                                        <p className="font-semibold text-slate-800">{selectedRecord?.doctorName}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase font-bold text-slate-400">Document Type</p>
                                        <p className="font-semibold text-slate-800">{selectedRecord?.type}</p>
                                    </div>
                                </div>

                                {/* Details */}
                                <div className="space-y-6">
                                    {selectedRecord?.details?.summary && (
                                        <div>
                                            <h2 className="text-sm font-bold uppercase text-slate-800 border-b border-slate-200 pb-2 mb-3">Clinical Summary</h2>
                                            <p className="text-sm text-slate-600 leading-relaxed">{selectedRecord.details.summary}</p>
                                        </div>
                                    )}

                                    {selectedRecord?.details?.vitals && (
                                        <div>
                                            <h2 className="text-sm font-bold uppercase text-slate-800 border-b border-slate-200 pb-2 mb-3">Vitals & Measurements</h2>
                                            <div className="grid grid-cols-4 gap-4">
                                                {Object.entries(selectedRecord.details.vitals).map(([key, value]) => (
                                                    <div key={key} className="bg-white p-3 rounded-lg border border-slate-200 text-center shadow-sm">
                                                        <p className="text-[10px] uppercase font-bold text-slate-400">{key}</p>
                                                        <p className="font-bold text-slate-800 mt-1">{value}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {selectedRecord?.details?.findings && (
                                        <div>
                                            <h2 className="text-sm font-bold uppercase text-slate-800 border-b border-slate-200 pb-2 mb-3">Key Findings</h2>
                                            <ul className="list-disc pl-5 space-y-2">
                                                {selectedRecord.details.findings.map((finding, idx) => (
                                                    <li key={idx} className="text-sm text-slate-600 font-medium">{finding}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {selectedRecord?.details?.notes && (
                                        <div>
                                            <h2 className="text-sm font-bold uppercase text-slate-800 border-b border-slate-200 pb-2 mb-3">Physician Notes</h2>
                                            <p className="text-sm text-slate-600 leading-relaxed italic">"{selectedRecord.details.notes}"</p>
                                        </div>
                                    )}
                                </div>

                                {/* Footer signature */}
                                <div className="mt-16 pt-8 border-t border-slate-200 flex justify-end">
                                    <div className="text-center">
                                        <div className="w-40 border-b-2 border-slate-800 mb-2"></div>
                                        <p className="text-xs font-bold text-slate-800 uppercase">{selectedRecord?.doctorName}</p>
                                        <p className="text-[10px] font-medium text-slate-500 uppercase">Authorized Signature</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </PatientLayout>
    )
}
