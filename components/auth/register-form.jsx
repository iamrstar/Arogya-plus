"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/components/auth/auth-provider"
import {
  User,
  Mail,
  Lock,
  ShieldCheck,
  Phone,
  MapPin,
  Upload,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Stethoscope,
  Heart,
  Activity,
  Bot,
  Send,
  MessageCircle,
  Sparkles,
  Loader2,
  AlertCircle
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function RegisterForm() {
  const { register, sendOtp } = useAuth()
  const router = useRouter()
  const [step, setStep] = useState(1) // 1: Initial Info, 2: OTP, 3: Details & Proof, 4: Success
  const [registeredUser, setRegisteredUser] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    userType: "patient",
    phone: "",
    address: "",
    bloodGroup: "",
    aadharId: "",
    specialization: "", // for doctors
    experience: "", // for doctors
    department: "", // for staff
  })
  const [otp, setOtp] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // AI Assisted Registration State
  const [isAiMode, setIsAiMode] = useState(false)
  const [chatMessages, setChatMessages] = useState([
    { role: "assistant", content: "Namaste! I am Swasthya. If you are not sure which specialist to choose, tell me what you are feeling in English, Hinglish, or Bengali (English letters). I will guide you." }
  ])
  const [chatInput, setChatInput] = useState("")
  const [isChatLoading, setIsChatLoading] = useState(false)
  const scrollRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [chatMessages])

  const handleSendOtp = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const result = await sendOtp(formData.email)
    if (result.success) {
      setStep(2)
    } else {
      setError(result.error || "Failed to send verification code.")
    }
    setIsLoading(false)
  }

  const handleFinalRegister = async (e) => {
    if (e) e.preventDefault()
    setIsLoading(true)
    setError("")

    const result = await register({
      ...formData,
      otp,
    })

    if (result.success) {
      setRegisteredUser(result.user)
      setStep(4)
      toast.success("Arogya ID Generated Successfully!")
    } else {
      setError(result.error || "Registration failed. Check your verification code.")
    }
    setIsLoading(false)
  }

  const handleAiChat = async (e) => {
    e.preventDefault()
    if (!chatInput.trim() || isChatLoading) return

    const userMsg = { role: "user", content: chatInput }
    setChatMessages(prev => [...prev, userMsg])
    setChatInput("")
    setIsChatLoading(true)

    try {
      const resp = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: chatInput, mode: "diagnostic" }),
      })
      const data = await resp.json()

      const assistantMsg = { role: "assistant", content: data.reply }
      setChatMessages(prev => [...prev, assistantMsg])

      if (data.suggestedSpecialist) {
        setFormData(prev => ({ ...prev, specialization: data.suggestedSpecialist }))
      }
    } catch (err) {
      console.error("AI Error:", err)
    } finally {
      setIsChatLoading(false)
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const resp = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, otp }),
      })
      const data = await resp.json()

      if (data.success) {
        setStep(3)
      } else {
        setError(data.error || "Invalid or expired verification code.")
      }
    } catch (err) {
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const updateFormData = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Progress Multi-step Indicator */}
      {!isAiMode && (
        <div className="flex items-center justify-between mb-12 relative">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2 -z-10" />
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex flex-col items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black transition-all ${step >= s ? "bg-primary text-white scale-110 shadow-lg shadow-primary/20" : "bg-white text-slate-300 border-2 border-slate-100"
                }`}>
                {step > s ? <CheckCircle2 className="w-6 h-6" /> : s}
              </div>
              <span className={`text-[10px] uppercase font-black tracking-widest ${step >= s ? "text-primary" : "text-slate-400"}`}>
                {s === 1 ? "Identity" : s === 2 ? "Verify" : "Clinical"}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white rounded-[2.5rem] p-10 shadow-[0_32px_64px_-16px_rgba(13,148,136,0.1)] border border-slate-100 mb-8 overflow-hidden relative min-h-[500px] flex flex-col">
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-bl-[10rem] -z-10" />

        <div className="mb-10 text-center">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            {isAiMode ? "Swasthya Guided Intake" : step === 1 ? "Create Your Medical Identity" : step === 2 ? "Universal Verification" : "Health System Integration"}
          </h2>
          <p className="text-slate-500 font-medium">
            {isAiMode ? "Our AI is helping you find the right specialist" : step === 1 ? "Start your journey with India's premier healthcare network" : step === 2 ? `Verification code sent to ${formData.email}` : "Complete your profile for personalized clinical care"}
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-8 rounded-2xl bg-red-50/50 border-red-100 animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription className="font-bold text-xs">{error}</AlertDescription>
          </Alert>
        )}

        {isAiMode ? (
          <div className="flex-1 flex flex-col h-[400px]">
            <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 mb-6 p-4 bg-slate-50/50 rounded-3xl border border-slate-100">
              {chatMessages.map((msg, i) => (
                <div key={i} className={cn("flex flex-col", msg.role === "user" ? "items-end" : "items-start")}>
                  <div className={cn(
                    "max-w-[85%] p-4 rounded-2xl text-sm font-medium shadow-sm",
                    msg.role === "user" ? "bg-primary text-white rounded-tr-none" : "bg-white text-slate-700 rounded-tl-none border border-slate-100"
                  )}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isChatLoading && <div className="animate-pulse w-24 h-8 bg-slate-100 rounded-full" />}
            </div>

            {formData.specialization && (
              <div className="mb-4 p-4 bg-green-50 border border-green-100 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3 text-green-700 font-bold text-sm">
                  <Sparkles className="w-5 h-5" />
                  Recommended: {formData.specialization}
                </div>
                <Button size="sm" onClick={() => setIsAiMode(false)} className="rounded-lg h-8 bg-green-500 hover:bg-green-600 font-bold text-[10px] uppercase tracking-widest">Confirm & Proceed</Button>
              </div>
            )}

            <form onSubmit={handleAiChat} className="relative">
              <Input
                placeholder="Ex: Mere seene mein dard hai / Amar buke betha hochhe"
                className="h-14 pl-6 pr-14 rounded-2xl bg-white border-slate-100 shadow-sm font-bold text-slate-900 placeholder:text-slate-400"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
              />
              <Button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-primary shadow-lg shadow-primary/20">
                <Send className="w-5 h-5" />
              </Button>
            </form>
            <Button variant="ghost" onClick={() => setIsAiMode(false)} className="mt-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Manual Selection</Button>
          </div>
        ) : (
          <>
            {step === 1 && (
              <form onSubmit={handleSendOtp} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        placeholder="Enter legal name"
                        className="h-14 pl-12 rounded-2xl bg-slate-50/50 border-slate-100 font-bold text-slate-900 placeholder:text-slate-400"
                        value={formData.name}
                        onChange={(e) => updateFormData("name", e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Account Category</Label>
                    <Select value={formData.userType} onValueChange={(val) => updateFormData("userType", val)}>
                      <SelectTrigger className="h-14 rounded-2xl bg-slate-50/50 border-slate-100 font-black text-slate-900">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl">
                        <SelectItem value="patient">Patient Account</SelectItem>
                        <SelectItem value="doctor">Medical Specialist</SelectItem>
                        <SelectItem value="staff">Hospital Operations</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Universal Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      type="email"
                      placeholder="name@personal.in"
                      className="h-14 pl-12 rounded-2xl bg-slate-50/50 border-slate-100 font-bold text-slate-900 placeholder:text-slate-400"
                      value={formData.email}
                      onChange={(e) => updateFormData("email", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Secure Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      type="password"
                      placeholder="Minimum 8 characters"
                      className="h-14 pl-12 rounded-2xl bg-slate-50/50 border-slate-100 font-bold text-slate-900 placeholder:text-slate-400"
                      value={formData.password}
                      onChange={(e) => updateFormData("password", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full h-16 rounded-2xl bg-primary hover:bg-primary/90 font-black text-lg transition-all active:scale-95 shadow-xl shadow-primary/20" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      Send Verification Code
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </>
                  )}
                </Button>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleVerifyOtp} className="space-y-8">
                <div className="flex flex-col items-center gap-6">
                  <div className="w-20 h-20 rounded-[2rem] bg-primary/10 flex items-center justify-center text-primary">
                    <ShieldCheck className="w-10 h-10" />
                  </div>
                  <div className="w-full space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-center block">Enter 6-Digit Token</Label>
                    <Input
                      type="text"
                      maxLength={6}
                      placeholder="000000"
                      className="h-20 rounded-[2rem] bg-slate-50 border-slate-200 text-center text-4xl font-black tracking-[0.5em] text-primary"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button variant="ghost" onClick={() => setStep(1)} className="flex-1 h-14 rounded-2xl font-bold text-slate-400" type="button">
                    <ArrowLeft className="mr-2 w-4 h-4" /> Back
                  </Button>
                  <Button type="submit" className="flex-[2] h-14 rounded-2xl bg-primary font-black shadow-lg shadow-primary/20" disabled={isLoading}>
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Verify & Continue"}
                  </Button>
                </div>
              </form>
            )}

            {step === 3 && (
              <form onSubmit={handleFinalRegister} className="space-y-8">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        placeholder="+91 Contact"
                        className="h-14 pl-12 rounded-2xl bg-slate-50/50 border-slate-100 font-bold text-slate-900 placeholder:text-slate-400"
                        value={formData.phone}
                        onChange={(e) => updateFormData("phone", e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Aadhar ID</Label>
                    <div className="relative">
                      <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        placeholder="12-digit number"
                        className="h-14 pl-12 rounded-2xl bg-slate-50/50 border-slate-100 font-bold text-slate-900 placeholder:text-slate-400"
                        value={formData.aadharId}
                        onChange={(e) => updateFormData("aadharId", e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                {formData.userType === 'patient' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Primary Clinical Concern</Label>
                      <Button
                        variant="ghost"
                        type="button"
                        onClick={() => setIsAiMode(true)}
                        className="h-8 rounded-lg bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest hover:bg-primary/10"
                      >
                        <Bot className="w-3.5 h-3.5 mr-1.5" /> Help Me Choose Specialist
                      </Button>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                      <Select value={formData.specialization} onValueChange={(v) => updateFormData("specialization", v)}>
                        <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-slate-100 font-bold text-slate-900">
                          <SelectValue placeholder="Select Specialization" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          {['Cardiology', 'Neurology', 'Orthopedics', 'Dermatology', 'Pediatrics'].map(s => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select value={formData.bloodGroup} onValueChange={(v) => updateFormData("bloodGroup", v)}>
                        <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-slate-100 font-bold text-slate-900">
                          <SelectValue placeholder="Blood Group" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(g => (
                            <SelectItem key={g} value={g}>{g}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {formData.userType === 'staff' && (
                  <div className="grid md:grid-cols-2 gap-6">
                    <Select value={formData.department} onValueChange={(v) => updateFormData("department", v)}>
                      <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-slate-100 font-bold text-slate-900">
                        <SelectValue placeholder="Assigned Department" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'ICU', 'General Medicine'].map(d => (
                          <SelectItem key={d} value={d}>{d}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={formData.role} onValueChange={(v) => updateFormData("role", v)}>
                      <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-slate-100 font-bold text-slate-900">
                        <SelectValue placeholder="Staff Role" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {['Nurse', 'Ward Boy', 'Lab Technician', 'Pharmacist', 'Receptionist'].map(r => (
                          <SelectItem key={r} value={r}>{r}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {formData.userType === 'doctor' && (
                  <div className="grid md:grid-cols-2 gap-6">
                    <Input
                      placeholder="Specialization (e.g. Cardiology)"
                      className="h-14 rounded-2xl bg-slate-50 border-slate-100 font-bold text-slate-900 placeholder:text-slate-400"
                      value={formData.specialization}
                      onChange={(e) => updateFormData("specialization", e.target.value)}
                      required
                    />
                    <Input
                      type="number"
                      placeholder="Years of Experience"
                      className="h-14 rounded-2xl bg-slate-50 border-slate-100 font-bold text-slate-900 placeholder:text-slate-400"
                      value={formData.experience}
                      onChange={(e) => updateFormData("experience", e.target.value)}
                      required
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      placeholder="Registry residential details"
                      className="h-14 pl-12 rounded-2xl bg-slate-50/50 border-slate-100 font-bold text-slate-900 placeholder:text-slate-400"
                      value={formData.address}
                      onChange={(e) => updateFormData("address", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button variant="ghost" onClick={() => setStep(2)} className="flex-1 h-14 rounded-2xl font-bold text-slate-400" type="button">
                    <ArrowLeft className="mr-2 w-4 h-4" /> Back
                  </Button>
                  <Button type="submit" className="flex-[2] h-16 rounded-2xl bg-primary hover:bg-primary/90 font-black text-lg transition-all active:scale-95 shadow-xl shadow-primary/20" disabled={isLoading}>
                    {isLoading ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <>
                        Complete Identity Setup
                        <CheckCircle2 className="ml-2 w-5 h-5" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}
            {step === 4 && (
              <div className="py-10 flex flex-col items-center text-center space-y-8 animate-in zoom-in duration-500">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 animate-pulse" />
                  <div className="w-24 h-24 rounded-[2.5rem] bg-primary flex items-center justify-center text-white relative z-10 shadow-2xl shadow-primary/40">
                    <CheckCircle2 className="w-12 h-12" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h2 className="text-4xl font-black text-slate-900 tracking-tight">Identity Synchronized!</h2>
                  <p className="text-slate-500 font-medium max-w-sm mx-auto">Your clinical profile is now active within the Arogya 2.0 ecosystem.</p>
                </div>

                <div className="w-full bg-slate-50 border border-slate-100 rounded-3xl p-8 space-y-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Your Universal Arogya ID</p>
                    <p className="text-3xl font-black text-primary tracking-tighter">{registeredUser?._id || "GENERATING..."}</p>
                  </div>
                  <div className="h-px bg-slate-200 w-1/2 mx-auto" />
                  <div className="flex justify-center gap-8">
                    <div>
                      <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Category</p>
                      <p className="text-sm font-bold text-slate-700 capitalize">{registeredUser?.userType || "User"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Network Status</p>
                      <p className="text-sm font-bold text-green-600 flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        Online
                      </p>
                    </div>
                  </div>
                </div>

                <div className="w-full space-y-4 pt-4">
                  <Button
                    onClick={() => router.push("/")}
                    className="w-full h-16 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-lg transition-all active:scale-95 shadow-xl"
                  >
                    Enter Clinical Portal
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <div className="text-center space-y-6">
        {step < 4 && (
          <p className="text-sm text-slate-500">
            Already have a clinical identity?{" "}
            <Link href="/" className="text-primary font-black hover:underline underline-offset-4 decoration-primary/30">
              Initialize Session
            </Link>
          </p>
        )}
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          Secured by Arogya Global ID Matrix
        </p>
      </div>
    </div>
  )
}
