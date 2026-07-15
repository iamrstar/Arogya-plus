"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StaffLayout } from "@/components/layouts/staff-layout"
import { useAuth } from "@/components/auth/auth-provider"
import { Calendar as CalendarIcon, Clock, MapPin, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function StaffSchedule() {
    const { user } = useAuth()
    const [loading, setLoading] = useState(false)

    if (!user) return null

    // Mock weekly schedule
    const schedule = [
        { day: "Monday", date: "Jul 15", shift: "Morning", time: "08:00 AM - 04:00 PM", location: user.department || "General Ward", status: "Active" },
        { day: "Tuesday", date: "Jul 16", shift: "Morning", time: "08:00 AM - 04:00 PM", location: user.department || "General Ward", status: "Upcoming" },
        { day: "Wednesday", date: "Jul 17", shift: "Morning", time: "08:00 AM - 04:00 PM", location: user.department || "General Ward", status: "Upcoming" },
        { day: "Thursday", date: "Jul 18", shift: "Off Duty", time: "-", location: "-", status: "Off" },
        { day: "Friday", date: "Jul 19", shift: "Evening", time: "04:00 PM - 12:00 AM", location: user.department || "General Ward", status: "Upcoming" },
        { day: "Saturday", date: "Jul 20", shift: "Evening", time: "04:00 PM - 12:00 AM", location: user.department || "General Ward", status: "Upcoming" },
        { day: "Sunday", date: "Jul 21", shift: "Off Duty", time: "-", location: "-", status: "Off" },
    ]

    return (
        <StaffLayout>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">My Schedule</h1>
                        <p className="text-muted-foreground">View your upcoming shifts and assignments</p>
                    </div>
                    <Button variant="outline" className="bg-white">
                        <CalendarIcon className="w-4 h-4 mr-2" />
                        Sync Calendar
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Schedule Overview */}
                    <Card className="col-span-1 lg:col-span-2 rounded-2xl shadow-sm border-slate-100">
                        <CardHeader>
                            <CardTitle>This Week's Shifts</CardTitle>
                            <CardDescription>Your assigned duties from Jul 15 - Jul 21</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {schedule.map((shift, idx) => (
                                <div key={idx} className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                                    shift.status === 'Active' 
                                        ? 'bg-primary/5 border-primary/20 ring-1 ring-primary/10' 
                                        : shift.status === 'Off' 
                                            ? 'bg-slate-50 border-slate-100 opacity-70' 
                                            : 'bg-white border-slate-100 hover:shadow-md'
                                }`}>
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-lg ${shift.status === 'Off' ? 'bg-slate-200' : 'bg-blue-50 text-blue-600'}`}>
                                            <CalendarIcon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-800">{shift.day}</h3>
                                            <p className="text-sm font-medium text-slate-500">{shift.date}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex-1 flex flex-col sm:flex-row gap-4 sm:justify-around text-sm font-medium text-slate-600">
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-slate-400" />
                                            {shift.shift !== "Off Duty" ? shift.time : <span className="text-slate-400">Rest Day</span>}
                                        </div>
                                        {shift.shift !== "Off Duty" && (
                                            <div className="flex items-center gap-2">
                                                <MapPin className="w-4 h-4 text-slate-400" />
                                                {shift.location}
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        {shift.status === "Active" ? (
                                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none font-bold uppercase tracking-wider text-[10px]">Today</Badge>
                                        ) : shift.status === "Upcoming" ? (
                                            <Badge variant="outline" className="text-slate-500 border-slate-200 font-bold uppercase tracking-wider text-[10px]">{shift.shift}</Badge>
                                        ) : (
                                            <Badge variant="secondary" className="bg-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">Off Duty</Badge>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Quick Stats / Info */}
                    <div className="space-y-6">
                        <Card className="rounded-2xl shadow-sm border-slate-100">
                            <CardHeader>
                                <CardTitle>Current Shift Info</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <p className="text-sm text-slate-500 font-medium mb-1">Shift Type</p>
                                    <p className="font-bold text-slate-900">{user.shift || "Morning"} Shift</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500 font-medium mb-1">Primary Department</p>
                                    <p className="font-bold text-slate-900">{user.department || "General Ward"}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500 font-medium mb-1">Total Hours (This Week)</p>
                                    <p className="font-bold text-slate-900">40 Hours</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="rounded-2xl shadow-sm border-slate-100 bg-amber-50">
                            <CardContent className="p-6">
                                <div className="flex gap-4">
                                    <AlertCircle className="w-6 h-6 text-amber-600 shrink-0" />
                                    <div>
                                        <h3 className="font-bold text-amber-900 mb-2">Leave Request Policy</h3>
                                        <p className="text-sm text-amber-700 font-medium leading-relaxed">
                                            All shift swaps or leave requests must be submitted at least 48 hours in advance to your department head.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </StaffLayout>
    )
}
