"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PatientLayout } from "@/components/layouts/patient-layout"
import { FileText, Calendar, User, Filter, Search, Download, Loader2, FileUp } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"

export default function PatientRecords() {
    const { token, user } = useAuth()
    const [records, setRecords] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")

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
                    fileSize: "1.2 MB"
                },
                {
                    id: "REC002",
                    documentName: "Initial Clinical Assessment",
                    type: "Clinical Note",
                    doctorName: "Dr. Rajesh Kumar",
                    date: "2024-03-12",
                    status: "signed",
                    fileSize: "0.8 MB"
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
        </PatientLayout>
    )
}
