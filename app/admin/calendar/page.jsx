"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AdminLayout } from "@/components/layouts/admin-layout"
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, User, Scissors, Video, MoreHorizontal, Loader2, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { format, startOfWeek, addDays, isSameDay } from "date-fns"

export default function AdminCalendar() {
    const [events, setEvents] = useState([])
    const [loading, setLoading] = useState(true)
    const [currentDate, setCurrentDate] = useState(new Date())
    const [selectedDate, setSelectedDate] = useState(new Date())

    useEffect(() => {
        fetchEvents()
    }, [])

    const fetchEvents = async () => {
        try {
            const res = await fetch("/api/admin/calendar")
            setEvents(await res.json())
        } catch (e) { console.error(e) }
        setLoading(false)
    }

    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

    const getEventsForDate = (date) => {
        return events.filter(e => e.date === format(date, "yyyy-MM-dd"))
    }

    if (loading) return (
        <AdminLayout>
            <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Synchronizing Schedules...</p>
            </div>
        </AdminLayout>
    )

    return (
        <AdminLayout>
            <div className="space-y-8 pb-16">
                {/* Header */}
                <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
                    <div className="space-y-3">
                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-slate-900/5 text-slate-900 text-[10px] font-black uppercase tracking-[0.2em]">
                            <CalendarIcon className="w-3 h-3 mr-2" /> Schedule Management
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Hospital Calendar</h1>
                        <p className="text-slate-500 font-medium">Viewing schedule for <span className="font-bold text-slate-900">{format(currentDate, "MMMM yyyy")}</span></p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200">
                            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-lg hover:bg-white hover:shadow-sm" onClick={() => setCurrentDate(addDays(currentDate, -7))}>
                                <ChevronLeft className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" className="px-4 font-black text-[10px] uppercase tracking-widest" onClick={() => setCurrentDate(new Date())}>Today</Button>
                            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-lg hover:bg-white hover:shadow-sm" onClick={() => setCurrentDate(addDays(currentDate, 7))}>
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                        <Button className="h-12 px-6 rounded-xl bg-primary hover:bg-primary/90 text-white font-black text-[10px] uppercase tracking-widest gap-2 shadow-xl shadow-primary/10 transition-all hover:scale-[1.02]">
                            <Plus className="w-4 h-4" /> New Booking
                        </Button>
                    </div>
                </div>

                {/* Legend */}
                <div className="flex gap-6 pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Outpatient Apt</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">OT Procedure</span>
                    </div>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-4">
                    {weekDays.map((day, i) => (
                        <div key={i} className="space-y-4">
                            <div className={cn(
                                "flex flex-col items-center py-4 rounded-2xl border-2 transition-all",
                                isSameDay(day, new Date()) ? "bg-primary text-white border-primary shadow-xl shadow-primary/20" : "bg-white border-slate-50 text-slate-400"
                            )}>
                                <span className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-60">{format(day, "EEE")}</span>
                                <span className={cn("text-2xl font-black", isSameDay(day, new Date()) ? "text-white" : "text-slate-900")}>{format(day, "d")}</span>
                            </div>

                            <div className="space-y-3 min-h-[400px]">
                                {getEventsForDate(day).map((event) => (
                                    <Card key={event.id} className={cn(
                                        "rounded-2xl border-none shadow-sm hover:shadow-md transition-all cursor-pointer group overflow-hidden",
                                        event.type === "OT" ? "bg-red-500 text-white" : "bg-white border-slate-100 border text-slate-900"
                                    )}>
                                        <CardContent className="p-4 space-y-3">
                                            <div className="flex justify-between items-start">
                                                <div className={cn(
                                                    "px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest",
                                                    event.type === "OT" ? "bg-white/20 text-white" : "bg-blue-50 text-blue-600"
                                                )}>
                                                    {event.type}
                                                </div>
                                                <Clock className={cn("w-3 h-3 opacity-60", event.type === "OT" ? "text-white" : "text-slate-400")} />
                                            </div>
                                            <div>
                                                <p className="text-[11px] font-black leading-tight mb-1">{event.title.split(': ')[1]}</p>
                                                <p className={cn("text-[9px] font-bold opacity-60", event.type === "OT" ? "text-white" : "text-slate-500")}>{event.time}</p>
                                            </div>
                                            <div className={cn("flex items-center gap-2 pt-2 border-t", event.type === "OT" ? "border-white/10" : "border-slate-50")}>
                                                <User className={cn("w-3 h-3 opacity-60", event.type === "OT" ? "text-white" : "text-slate-400")} />
                                                <p className={cn("text-[9px] font-black uppercase tracking-widest truncate", event.type === "OT" ? "text-white" : "text-slate-400")}>{event.doctor.split(' ')[1]}</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                                {getEventsForDate(day).length === 0 && (
                                    <div className="h-20 rounded-2xl border-2 border-dashed border-slate-100 flex items-center justify-center">
                                        <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">No Events</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Day Detail/List (For Mobile/Small Screens) */}
                <div className="space-y-4">
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Today's Timeline</h3>
                    <div className="space-y-3">
                        {getEventsForDate(new Date()).length === 0 ? (
                            <p className="text-slate-400 font-medium italic">No events scheduled for today.</p>
                        ) : (
                            getEventsForDate(new Date()).map(event => (
                                <div key={event.id} className="flex items-center gap-6 p-6 bg-white rounded-3xl border-2 border-slate-50 hover:border-primary/20 transition-all">
                                    <div className="w-20 text-right">
                                        <p className="text-sm font-black text-slate-900">{event.time}</p>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{event.type}</p>
                                    </div>
                                    <div className={cn("w-1 h-12 rounded-full", event.type === "OT" ? "bg-red-500" : "bg-blue-500")} />
                                    <div className="flex-1">
                                        <h4 className="font-black text-slate-900">{event.title}</h4>
                                        <p className="text-xs text-slate-500 font-medium">{event.details} · Dr. {event.doctor}</p>
                                    </div>
                                    <Button variant="ghost" size="icon" className="rounded-xl"><MoreHorizontal className="w-4 h-4 text-slate-400" /></Button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}
