"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DoctorLayout } from "@/components/layouts/doctor-layout"
import { useAuth } from "@/components/auth/auth-provider"
import { Calendar, Users, FileText, Beaker, Pill, TrendingUp, Loader2 } from "lucide-react"

export default function DoctorAnalytics() {
    const { token } = useAuth()
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (token) {
            fetchAnalytics()
        }
    }, [token])

    const fetchAnalytics = async () => {
        try {
            const res = await fetch("/api/doctor/analytics", {
                headers: { "Authorization": `Bearer ${token}` }
            })
            const json = await res.json()
            if (res.ok) {
                setData(json)
            }
        } catch (error) {
            console.error("Failed to fetch analytics", error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <DoctorLayout>
                <div className="flex items-center justify-center min-h-[400px]">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </DoctorLayout>
        )
    }

    if (!data) return null

    const maxRevenue = Math.max(...data.revenueByMonth.map(m => m.revenue))

    return (
        <DoctorLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold">Analytics Overview</h1>
                    <p className="text-muted-foreground">Monitor your clinical performance and patient statistics</p>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="rounded-2xl border-none shadow-md bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-blue-100 font-medium">Total Appointments</p>
                                    <h3 className="text-4xl font-black mt-2">{data.metrics.totalAppointments}</h3>
                                </div>
                                <div className="p-3 bg-white/20 rounded-xl">
                                    <Calendar className="w-6 h-6 text-white" />
                                </div>
                            </div>
                            <div className="mt-4 text-sm font-medium text-blue-100 flex items-center">
                                <TrendingUp className="w-4 h-4 mr-1" />
                                +12% from last month
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl border-none shadow-md bg-white">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-slate-500 font-medium">Unique Patients</p>
                                    <h3 className="text-4xl font-black mt-2 text-slate-800">{data.metrics.totalPatients}</h3>
                                </div>
                                <div className="p-3 bg-purple-100 rounded-xl">
                                    <Users className="w-6 h-6 text-purple-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl border-none shadow-md bg-white">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-slate-500 font-medium">Pending Lab Reports</p>
                                    <h3 className="text-4xl font-black mt-2 text-slate-800">{data.metrics.pendingLabReports}</h3>
                                </div>
                                <div className="p-3 bg-orange-100 rounded-xl">
                                    <Beaker className="w-6 h-6 text-orange-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl border-none shadow-md bg-white">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-slate-500 font-medium">Prescriptions Written</p>
                                    <h3 className="text-4xl font-black mt-2 text-slate-800">{data.metrics.totalPrescriptions}</h3>
                                </div>
                                <div className="p-3 bg-green-100 rounded-xl">
                                    <Pill className="w-6 h-6 text-green-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Bar Chart */}
                    <Card className="col-span-1 lg:col-span-2 rounded-2xl shadow-sm border-slate-100">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold text-slate-800">Revenue Trend (Last 6 Months)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-end justify-between h-64 mt-4 gap-2">
                                {data.revenueByMonth.map((item, idx) => {
                                    const heightPercentage = (item.revenue / maxRevenue) * 100;
                                    return (
                                        <div key={idx} className="flex flex-col items-center flex-1 group">
                                            <div className="w-full flex justify-center items-end h-full relative">
                                                <div 
                                                    className="w-full max-w-[40px] bg-primary/20 group-hover:bg-primary transition-all duration-300 rounded-t-lg relative"
                                                    style={{ height: `${heightPercentage}%` }}
                                                >
                                                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white text-xs font-bold py-1 px-2 rounded transition-opacity whitespace-nowrap">
                                                        ₹{item.revenue.toLocaleString()}
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="text-xs font-bold text-slate-400 mt-3 uppercase">{item.month}</p>
                                        </div>
                                    )
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Completion Donut/Progress */}
                    <Card className="col-span-1 rounded-2xl shadow-sm border-slate-100">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold text-slate-800">Appointment Completion</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center justify-center min-h-[250px]">
                            <div className="relative w-48 h-48">
                                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                    <path
                                        className="text-slate-100"
                                        strokeWidth="3"
                                        stroke="currentColor"
                                        fill="none"
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    />
                                    <path
                                        className="text-primary transition-all duration-1000 ease-out"
                                        strokeWidth="3"
                                        strokeDasharray={`${data.metrics.totalAppointments > 0 ? (data.metrics.completedAppointments / data.metrics.totalAppointments) * 100 : 0}, 100`}
                                        stroke="currentColor"
                                        fill="none"
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-3xl font-black text-slate-800">
                                        {data.metrics.totalAppointments > 0 ? Math.round((data.metrics.completedAppointments / data.metrics.totalAppointments) * 100) : 0}%
                                    </span>
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Completed</span>
                                </div>
                            </div>
                            <div className="mt-6 flex gap-6 text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-primary"></div>
                                    <span className="font-medium text-slate-600">Completed ({data.metrics.completedAppointments})</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                                    <span className="font-medium text-slate-600">Total ({data.metrics.totalAppointments})</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DoctorLayout>
    )
}
