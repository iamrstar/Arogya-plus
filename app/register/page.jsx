"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Heart, ArrowLeft } from "lucide-react"
import { RegisterForm } from "@/components/auth/register-form"

export default function RegisterPage() {
  const [showSuccess, setShowSuccess] = useState(false)

  return (
    <div className="min-h-screen bg-[#020617] text-slate-50 relative overflow-hidden flex flex-col">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/5 bg-black/20 backdrop-blur-md">
        <div className="container mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-4 transition-transform hover:scale-[1.02]">
              <div className="bg-gradient-to-br from-primary to-primary/60 rounded-xl p-2.5 shadow-lg shadow-primary/20">
                <Heart className="h-7 w-7 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tighter text-white">AROGYA 2.0</h1>
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary/80">Next-Gen Care</p>
              </div>
            </Link>
            <Link href="/">
              <Button variant="ghost" className="text-slate-400 hover:text-white hover:bg-white/5 rounded-xl border border-white/5">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Login
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 relative z-10 container mx-auto px-6 py-12 flex items-center justify-center">
        <div className="w-full max-w-4xl grid lg:grid-cols-[1fr_2fr] gap-12 items-center">
          <div className="hidden lg:block space-y-6">
            <h2 className="text-5xl font-extrabold leading-tight text-white">Experience</h2>
            <h2 className="text-5xl font-extrabold leading-tight text-primary">Modern</h2>
            <h2 className="text-5xl font-extrabold leading-tight text-white">Healthcare.</h2>
            <p className="text-slate-400 text-lg max-w-sm">
              Join thousands of patients and professionals in our unified healthcare ecosystem. Simple, secure, and state-of-the-art.
            </p>
            <div className="flex gap-4 pt-4">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-[#020617] bg-slate-800" />
                ))}
              </div>
              <p className="text-sm text-slate-500 flex items-center gap-1">
                <span className="text-white font-bold">4.9/5</span> rating from users
              </p>
            </div>
          </div>

          <div className="w-full max-w-md mx-auto lg:max-w-none">
            {showSuccess ? (
              <div className="text-center p-12 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] animate-in zoom-in-95 duration-500">
                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Heart className="w-10 h-10 text-green-500" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">Registration Complete!</h2>
                <p className="text-slate-400 mb-8">Welcome to Arogya 2.0. Your healthcare journey starts here.</p>
                <Link href="/">
                  <Button className="w-full h-12 rounded-xl text-lg font-bold">Go to Dashboard</Button>
                </Link>
              </div>
            ) : (
              <RegisterForm onSuccess={() => setShowSuccess(true)} />
            )}
          </div>
        </div>
      </main>

      <footer className="relative z-10 py-8 text-center border-t border-white/5">
        <p className="text-slate-500 text-sm">© 2026 Arogya 2.0 Health Systems. All rights reserved.</p>
      </footer>
    </div>
  )
}
