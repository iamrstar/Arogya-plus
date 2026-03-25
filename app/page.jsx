"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/components/auth/auth-provider"
import {
  Heart,
  ShieldCheck,
  Stethoscope,
  Users,
  ArrowRight,
  Video,
  Calendar,
  Lock,
  Mail,
  UserCheck,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function HomePage() {
  const { login } = useAuth()
  const router = useRouter()
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
    userType: "patient",
  })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const result = await login(loginData.email, loginData.password, loginData.userType)
    if (result.success) {
      router.push(`/${loginData.userType}/dashboard`)
    } else {
      setError(result.error || "Authentication failed. Please check your credentials.")
    }
    setIsLoading(false)
  }

  // Smart Category Detection
  useEffect(() => {
    const email = loginData.email.toLowerCase()
    if (email.includes("priya@") || email.includes("rajesh@") || email.includes("amit@")) {
      setLoginData(prev => ({ ...prev, userType: "doctor" }))
    } else if (email === "admin@arogya.com") {
      setLoginData(prev => ({ ...prev, userType: "admin" }))
    } else if (email.includes("@arogya.com")) {
      setLoginData(prev => ({ ...prev, userType: "staff" }))
    }
  }, [loginData.email])

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20 selection:text-primary">
      {/* Premium Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-2 group">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
              <Heart className="w-6 h-6 fill-current" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tighter text-primary leading-none uppercase">Arogya</span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Global Healthcare</span>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <Link href="#care" className="text-sm font-bold text-slate-600 hover:text-primary transition-colors">Specialties</Link>
            <Link href="/hospitals" className="text-sm font-bold text-slate-600 hover:text-primary transition-colors">Find Hospital</Link>
            <Link href="#insurance" className="text-sm font-bold text-slate-600 hover:text-primary transition-colors">Insurance</Link>
            <Button className="rounded-xl font-bold bg-primary px-6 h-11 hover:scale-105 transition-transform shadow-lg shadow-primary/10">
              Book Appointment
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="pt-20">
        {/* Split Hero Section */}
        <section className="relative min-h-screen md:min-h-[80vh] overflow-visible">
          <div className="container mx-auto h-full px-6 flex flex-col md:flex-row items-center gap-12 py-12 pb-20">

            {/* Left Column: Branding and Trust */}
            <div className="flex-1 space-y-8 text-center md:text-left">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/5 border border-primary/10 text-primary">
                <ShieldCheck className="w-4 h-4 mr-2" />
                <span className="text-xs font-bold uppercase tracking-wider">India's Trusted Medical Network</span>
              </div>

              <h1 className="text-5xl lg:text-7xl font-black text-foreground leading-[1.1] tracking-tight">
                Healthcare that <br />
                <span className="text-primary italic">Understands </span> You.
              </h1>

              <p className="text-lg text-muted-foreground max-w-xl leading-relaxed font-medium">
                Experience world-class medical care with Arogya 2.0. Connecting
                <span className="text-foreground font-bold"> thousands of Indian specialists </span>
                with patients across the nation.
              </p>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                <Button size="lg" className="h-16 px-8 rounded-2xl bg-secondary text-secondary-foreground font-black text-lg shadow-xl shadow-secondary/20 hover:scale-105 transition-transform">
                  Join as Patient
                </Button>
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="w-12 h-12 rounded-full border-4 border-background bg-slate-200 overflow-hidden ring-1 ring-slate-100">
                      <img src={`https://i.pravatar.cc/100?u=${i}`} alt="" />
                    </div>
                  ))}
                  <div className="w-12 h-12 rounded-full border-4 border-background bg-primary flex items-center justify-center text-[10px] font-bold text-white ring-1 ring-slate-100">
                    10K+
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: High-End Portal */}
            <div className="w-full md:w-[450px] relative">
              <div className="absolute inset-0 bg-primary/5 blur-[100px] -z-10 rounded-full" />

              <div className="bg-card rounded-[2.5rem] p-8 shadow-[0_32px_64px_-16px_rgba(13,148,136,0.15)] border border-border relative overflow-hidden group">
                {/* Subtle Indian Pattern Overlay */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full opacity-50 transition-transform group-hover:scale-110" />

                <div className="relative z-10 space-y-6">
                  <div className="space-y-1">
                    <h2 className="text-2xl font-black text-foreground">Patient Portal</h2>
                    <p className="text-sm text-muted-foreground font-medium">Access your digital health universe</p>
                  </div>

                  <form onSubmit={handleLogin} className="space-y-5">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Account Category</Label>
                      <Select
                        value={loginData.userType}
                        onValueChange={(value) => setLoginData({ ...loginData, userType: value })}
                      >
                        <SelectTrigger className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 focus:ring-primary/20">
                          <SelectValue placeholder="Select user type" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-slate-100">
                          <SelectItem value="patient" className="rounded-xl">Patient Account</SelectItem>
                          <SelectItem value="doctor" className="rounded-xl">Medical Professional</SelectItem>
                          <SelectItem value="staff" className="rounded-xl">Hospital Staff</SelectItem>
                          <SelectItem value="admin" className="rounded-xl">Administrator</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Universal Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          type="email"
                          placeholder="name@healthcare.in"
                          className="h-14 pl-12 rounded-2xl border-border bg-muted/30 focus:ring-primary/20 font-medium text-foreground"
                          value={loginData.email}
                          onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between ml-1">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Secure Pin</Label>
                        <Link href="/forgot-password" size="sm" className="text-[10px] font-black text-primary uppercase tracking-wider hover:underline">
                          Lost Access?
                        </Link>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="h-14 pl-12 pr-12 rounded-2xl border-border bg-muted/30 focus:ring-primary/20 text-foreground"
                          value={loginData.password}
                          onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {error && (
                      <Alert variant="destructive" className="rounded-2xl bg-red-50/50 border-red-100 animate-in fade-in slide-in-from-top-2">
                        <AlertCircle className="w-4 h-4" />
                        <AlertDescription className="font-bold text-xs">{error}</AlertDescription>
                      </Alert>
                    )}

                    <Button
                      type="submit"
                      className="w-full h-16 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black text-lg shadow-xl shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                      ) : (
                        <>
                          Initialize Session
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </Button>

                    <div className="text-center pt-2">
                      <p className="text-sm text-slate-500">
                        New to Arogya?{" "}
                        <Link href="/register" className="text-primary font-black hover:underline underline-offset-4 decoration-primary/30">
                          Create Account
                        </Link>
                      </p>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Clinical Excellence Showcase */}
        <section className="py-24 bg-slate-50/50">
          <div className="container mx-auto px-6">
            <div className="flex items-end justify-between mb-16">
              <div className="space-y-2">
                <p className="text-xs font-black text-primary uppercase tracking-[0.3em]">Services & Care</p>
                <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Clinical Specializations</h2>
              </div>
              <Button variant="ghost" className="text-primary font-black uppercase text-xs tracking-widest group">
                Explore All <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                { title: "Precision Cardiology", desc: "Advanced heart care using AI-driven predictive analytics.", icon: <Heart className="text-red-500" /> },
                { title: "Neurological Excellence", desc: "Expert intervention for complex brain and nerve disorders.", icon: <UserCheck className="text-blue-500" /> },
                { title: "Holistic Wellness", desc: "Integrating traditional Indian swasthya with modern medicine.", icon: <Stethoscope className="text-teal-500" /> },
              ].map((s, i) => (
                <div key={i} className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all">
                  <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-6">
                    {s.icon}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-4">{s.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed mb-8">{s.desc}</p>
                  <Button variant="link" className="p-0 text-primary font-black text-xs uppercase tracking-widest">Read More</Button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Cultural Hero Section with Generated Assets */}
        <section className="py-24 relative overflow-hidden">
          <div className="container mx-auto px-6 relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <div className="flex-1 relative">
                <div className="absolute inset-0 bg-primary/20 blur-[120px] rounded-full scale-75" />
                <img
                  src="/assets/hero_doctor.png"
                  alt="Professional Indian Doctor"
                  className="relative rounded-[3rem] shadow-2xl object-cover w-full h-[500px] border-8 border-white"
                />
                <div className="absolute -bottom-10 -right-10 bg-white p-6 rounded-3xl shadow-2xl border border-slate-100 max-w-[200px] hidden md:block">
                  <p className="text-xs font-black uppercase text-slate-400 mb-2 tracking-widest">Live Status</p>
                  <p className="text-sm font-bold text-slate-900">Dr. Alok Verma is now online for consultation</p>
                </div>
              </div>
              <div className="flex-1 space-y-8">
                <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-[1.1]">
                  The Future of <br />
                  <span className="text-primary italic">Indian Healthcare </span> Starts Here.
                </h2>
                <p className="text-lg text-slate-600 leading-relaxed font-medium">
                  From remote health monitoring to specialized surgical interventions, we empower every Indian with world-class digital health infrastructure.
                </p>
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <p className="text-3xl font-black text-secondary tracking-tighter">1.2B+</p>
                    <p className="text-xs font-black uppercase text-slate-400 tracking-widest">Lives Empowered</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-3xl font-black text-primary tracking-tighter">50K+</p>
                    <p className="text-xs font-black uppercase text-slate-400 tracking-widest">Certified Specialists</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Compassionate Care Section */}
        <section className="py-24 bg-primary text-white overflow-hidden rounded-[4rem] mx-6 mb-24 relative shadow-2xl">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <img src="/assets/hospital_bg.png" className="w-full h-full object-cover grayscale" />
          </div>

          <div className="container mx-auto px-12 relative z-10 flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 space-y-6">
              <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-none">Compassion in every connection.</h2>
              <p className="text-lg text-white/70 max-w-xl">
                Our digital platform is designed to maintain the human touch in healthcare, ensuring every patient feels understood and cared for.
              </p>
              <Button className="h-16 px-10 rounded-2xl bg-white text-primary font-black text-lg hover:scale-105 transition-transform shadow-2xl">
                Book Home Consultation
              </Button>
            </div>
            <div className="flex-1">
              <img
                src="/assets/patient_care.png"
                alt="Indian Patient Care"
                className="rounded-[3rem] shadow-2xl border-4 border-white/20 w-full h-[400px] object-cover"
              />
            </div>
          </div>
        </section>
      </main>

      {/* Simplified Medical Footer */}
      <footer className="bg-slate-900 text-white py-20">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 border-b border-white/5 pb-20 mb-10">
            <div className="space-y-6 col-span-2">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
                  <Heart className="w-5 h-5 fill-current" />
                </div>
                <span className="text-xl font-black tracking-tighter">AROGYA 2.0</span>
              </div>
              <p className="text-slate-500 max-w-sm">
                Empowering the nation through intelligent healthcare infrastructure and compassionate care.
              </p>
            </div>
            <div className="space-y-4">
              <p className="text-xs font-black uppercase tracking-widest text-primary">Emergency</p>
              <p className="text-2xl font-black">+91 1800-400-AROGYA</p>
              <p className="text-sm text-slate-500">Available 24/7 across all major cities</p>
            </div>
            <div className="space-y-4">
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">Governance</p>
              <ul className="space-y-2 text-sm text-slate-500">
                <li className="hover:text-white transition-colors cursor-pointer text-xs font-bold uppercase tracking-widest">Medical Ethics</li>
                <li className="hover:text-white transition-colors cursor-pointer text-xs font-bold uppercase tracking-widest">Privacy Policy</li>
                <li className="hover:text-white transition-colors cursor-pointer text-xs font-bold uppercase tracking-widest">Terms of Service</li>
              </ul>
            </div>
          </div>
          <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.3em] text-slate-700">
            <p>© 2026 Arogya Healthcare Ecosystem</p>
            <p>Regulated by Medical Council of India</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
