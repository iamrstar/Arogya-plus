"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import {
    MessageCircle,
    X,
    Send,
    Bot,
    User,
    Sparkles,
    Minus,
    Maximize2,
    Heart,
    Activity,
    Calendar,
    Pill,
    Stethoscope,
    Globe,
    Check
} from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/components/auth/auth-provider"
import { toast } from "sonner"

export function SwasthyaAssistant() {
    const { token, user } = useAuth()
    const [isOpen, setIsOpen] = useState(false)
    const [isMinimized, setIsMinimized] = useState(false)
    const [language, setLanguage] = useState(null) // English, Hindi, Bengali
    const [bookingData, setBookingData] = useState(null)
    const [messages, setMessages] = useState([
        {
            role: "assistant",
            content: "Namaste! I am Swasthya, your Arogya AI Assistant. How can I help you with your health journey today?",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
    ])
    const [input, setInput] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const scrollRef = useRef(null)

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    const handleSendMessage = async (e) => {
        e.preventDefault()
        if (!input.trim() || isLoading) return

        const userMessage = {
            role: "user",
            content: input,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
        setMessages(prev => [...prev, userMessage])
        setInput("")
        setIsLoading(true)

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: input,
                    history: messages,
                    language: language || "English"
                }),
            })

            if (!response.ok) {
                const errorData = await response.text();
                console.error("Chat API error:", errorData);
                throw new Error("Failed to get response from Swasthya AI");
            }

            const data = await response.json()
            const assistantMessage = {
                role: "assistant",
                content: data.reply || "I'm having trouble processing that right now.",
                isBooking: data.isBookingAction,
                specialist: data.suggestedSpecialist,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
            if (data.isBookingAction) {
                setBookingData({ specialist: data.suggestedSpecialist })
            }
            setMessages(prev => [...prev, assistantMessage])
        } catch (error) {
            console.error("Chat error:", error)
            setMessages(prev => [...prev, {
                role: "assistant",
                content: "I'm sorry, I'm experiencing a technical connection issue. Please try again in a moment.",
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }])
        } finally {
            setIsLoading(false)
        }
    }

    const quickActions = [
        { label: "Book Appointment", icon: <Calendar className="w-3 h-3" /> },
        { label: "Check Vitals", icon: <Activity className="w-3 h-3" /> },
        { label: "Order Medicines", icon: <Pill className="w-3 h-3" /> },
        { label: "Find Specialist", icon: <Stethoscope className="w-3 h-3" /> },
    ]

    return (
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className={cn(
                            "mb-4 w-[380px] md:w-[420px] transition-all duration-300 overflow-hidden rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(13,148,136,0.25)] border border-slate-100 bg-white",
                            isMinimized ? "h-[70px]" : "h-[600px]"
                        )}
                    >
                        {/* Assistant Header */}
                        <div className="bg-primary p-6 flex items-center justify-between text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />

                            <div className="flex items-center gap-4 relative z-10">
                                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20">
                                    <Bot className="w-7 h-7" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black tracking-tight leading-none">Swasthya AI</h3>
                                    <div className="flex items-center gap-1.5 mt-1">
                                        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-white/70">Online Assistant</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 relative z-10">
                                <button onClick={() => setIsMinimized(!isMinimized)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                                    {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                                </button>
                                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {!isMinimized && (
                            <>
                                {/* Chat Area */}
                                <div
                                    ref={scrollRef}
                                    className="h-[430px] overflow-y-auto p-6 space-y-6 bg-slate-50/50"
                                >
                                    {/* Language Selection if not set */}
                                    {!language && messages.length === 1 && (
                                        <div className="flex flex-col gap-3 p-4 bg-primary/5 rounded-[2rem] border border-primary/10">
                                            <p className="text-[10px] font-black uppercase text-primary tracking-widest text-center mb-1">Select Language / भाषा चुनें</p>
                                            <div className="flex gap-2 justify-center">
                                                {["English", "Hindi", "Bengali"].map(lang => (
                                                    <Button
                                                        key={lang}
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => {
                                                            setLanguage(lang)
                                                            const greeting = lang === "Hindi" ? "Namaste! Main Swasthya hoon." : lang === "Bengali" ? "Namaste! Ami Swasthya." : "Namaste! I am Swasthya."
                                                            setMessages(prev => [...prev, { role: "assistant", content: greeting, time: "Now" }])
                                                        }}
                                                        className="rounded-xl border-slate-200 text-[10px] font-bold"
                                                    >
                                                        <Globe className="w-3 h-3 mr-1.5" />
                                                        {lang}
                                                    </Button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {messages.map((msg, i) => (
                                        <div key={i} className={cn("flex flex-col", msg.role === "user" ? "items-end" : "items-start")}>
                                            <div className={cn(
                                                "max-w-[85%] p-4 rounded-[1.5rem] text-sm font-medium leading-relaxed shadow-sm",
                                                msg.role === "user"
                                                    ? "bg-primary text-white rounded-tr-none"
                                                    : "bg-white text-slate-700 border border-slate-100 rounded-tl-none"
                                            )}>
                                                {msg.content}

                                                {msg.isBooking && bookingData && (
                                                    <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                                                        <p className="text-[10px] font-black uppercase text-primary tracking-widest">Clinical Action Ready</p>
                                                        <Button
                                                            size="sm"
                                                            className="w-full bg-primary hover:bg-primary/90 text-white rounded-xl h-10 font-bold"
                                                            onClick={async () => {
                                                                setIsLoading(true)
                                                                try {
                                                                    const res = await fetch("/api/appointments", {
                                                                        method: "POST",
                                                                        headers: {
                                                                            "Content-Type": "application/json",
                                                                            "Authorization": `Bearer ${token}`
                                                                        },
                                                                        body: JSON.stringify({
                                                                            doctorName: `Dept of ${msg.specialist}`,
                                                                            appointmentDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
                                                                            time: "10:00 AM",
                                                                            reason: "AI Assisted Booking: " + messages[messages.length - 2].content,
                                                                            type: "Consultation"
                                                                        })
                                                                    })
                                                                    if (res.ok) {
                                                                        toast.success("Appointment Scheduled via Swasthya!")
                                                                        window.dispatchEvent(new Event("clinical-appointment-update"))
                                                                        setMessages(prev => [...prev, {
                                                                            role: "assistant",
                                                                            content: language === "Hindi" ? "Aapka appointment book ho gaya hai!" : language === "Bengali" ? "Apnar appointment book hoyechhe!" : "Your appointment is confirmed!",
                                                                            time: "Just Now"
                                                                        }])
                                                                        setBookingData(null)
                                                                    }
                                                                } catch (err) {
                                                                    toast.error("Clinical sync failure")
                                                                } finally {
                                                                    setIsLoading(false)
                                                                }
                                                            }}
                                                        >
                                                            <Calendar className="w-4 h-4 mr-2" />
                                                            {language === "Hindi" ? "Appointment Confirm Karein" : language === "Bengali" ? "Appointment Nischit Korun" : "Confirm Appointment"}
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                            <span className="text-[9px] font-black uppercase text-slate-400 mt-2 px-1 tracking-widest">{msg.time}</span>
                                        </div>
                                    ))}
                                    {isLoading && (
                                        <div className="flex items-start gap-4 animate-pulse">
                                            <div className="w-8 h-8 rounded-xl bg-slate-100" />
                                            <div className="w-24 h-8 bg-slate-100 rounded-full" />
                                        </div>
                                    )}
                                </div>

                                {/* Integration Quick Actions */}
                                <div className="px-6 py-2 flex gap-2 overflow-x-auto no-scrollbar border-t border-slate-50">
                                    {quickActions.map((action, i) => (
                                        <Button
                                            key={i}
                                            variant="outline"
                                            onClick={() => setInput(action.label)}
                                            className="whitespace-nowrap h-8 rounded-full border-slate-100 bg-white text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary hover:text-white transition-all"
                                        >
                                            {action.icon}
                                            <span className="ml-1.5">{action.label}</span>
                                        </Button>
                                    ))}
                                </div>

                                {/* Input Area */}
                                <CardFooter className="p-6 pt-2 bg-white">
                                    <form onSubmit={handleSendMessage} className="w-full relative">
                                        <Input
                                            placeholder="Ask anything about your health..."
                                            className="h-14 pl-6 pr-14 rounded-2xl bg-slate-50 border-slate-100 focus:ring-primary/20 font-bold text-slate-900 placeholder:text-slate-400"
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                        />
                                        <Button
                                            type="submit"
                                            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/10"
                                            disabled={isLoading}
                                        >
                                            <Send className="w-5 h-5" />
                                        </Button>
                                    </form>
                                </CardFooter>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            <button
                onClick={() => {
                    if (isOpen && isMinimized) {
                        setIsMinimized(false)
                    } else {
                        setIsOpen(!isOpen)
                    }
                }}
                className={cn(
                    "w-16 h-16 rounded-[2rem] shadow-2xl flex items-center justify-center transition-all duration-500 hover:scale-110 active:scale-95 group relative",
                    isOpen && !isMinimized ? "bg-white text-primary border-2 border-primary/20 rotate-90" : "bg-primary text-white"
                )}
            >
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full scale-125 -z-10 group-hover:scale-150 transition-transform" />
                {isOpen && !isMinimized ? <Minus className="w-8 h-8" /> : <MessageCircle className="w-8 h-8" />}
                {!isOpen && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-secondary text-secondary-foreground text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white animate-bounce">
                        1
                    </div>
                )}
            </button>
        </div>
    )
}
