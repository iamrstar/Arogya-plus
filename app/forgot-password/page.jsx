"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Heart, ArrowLeft, Mail, Lock, ShieldCheck, CheckCircle2, ArrowRight, AlertCircle, Loader2 } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function ForgotPasswordPage() {
    const { sendOtp } = useAuth()
    const [step, setStep] = useState(1) // 1: Email, 2: OTP & New Password, 3: Success
    const [email, setEmail] = useState("")
    const [otp, setOtp] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")

    const handleSendOtp = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")

        const result = await sendOtp(email)
        if (result.success) {
            setStep(2)
        } else {
            setError(result.error || "Failed to send OTP. Please check your email.")
        }
        setIsLoading(false)
    }

    const handleResetPassword = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")

        try {
            const response = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp, newPassword }),
            })

            const data = await response.json()
            if (response.ok) {
                setStep(3)
            } else {
                setError(data.error || "Failed to reset password. Check your OTP.")
            }
        } catch (err) {
            setError("An error occurred. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-background text-foreground relative overflow-hidden flex flex-col items-center justify-center p-6 selection:bg-primary/20">
            {/* Background Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/5 rounded-full blur-[120px]" />

            <div className="w-full max-w-md relative z-10">
                <Link href="/" className="inline-flex items-center text-slate-400 hover:text-primary mb-12 transition-colors group font-bold uppercase tracking-widest text-[10px]">
                    <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Back to Authorized Access
                </Link>

                <div className="bg-white rounded-[3rem] p-10 shadow-[0_32px_64px_-16px_rgba(13,148,136,0.1)] border border-slate-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[5rem] -z-10" />

                    <div className="text-center mb-10">
                        <div className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-primary">
                            <ShieldCheck className="w-10 h-10" />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Identity Recovery</h1>
                        <p className="text-slate-500 font-medium text-sm mt-3 leading-relaxed">
                            {step === 1 && "Confirm your registered clinical email to receive a secure token."}
                            {step === 2 && `We've dispatched a 6-digit verification code to your portal.`}
                            {step === 3 && "Your secure credentials have been successfully updated."}
                        </p>
                    </div>

                    {step === 1 && (
                        <form onSubmit={handleSendOtp} className="space-y-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Universal Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input
                                        type="email"
                                        placeholder="name@healthcare.in"
                                        className="h-16 pl-12 rounded-2xl bg-slate-50/50 border-slate-100 text-slate-900 placeholder:text-slate-300 focus:ring-primary/20 font-bold"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            {error && (
                                <Alert variant="destructive" className="rounded-2xl bg-red-50/50 border-red-100 animate-in fade-in slide-in-from-top-2">
                                    <AlertCircle className="w-4 h-4" />
                                    <AlertDescription className="font-bold text-xs">{error}</AlertDescription>
                                </Alert>
                            )}

                            <Button type="submit" className="w-full h-16 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black text-lg shadow-xl shadow-primary/20 transition-all active:scale-95" disabled={isLoading}>
                                {isLoading ? (
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                ) : (
                                    <>
                                        Request OTP
                                        <ArrowRight className="ml-2 w-5 h-5" />
                                    </>
                                )}
                            </Button>
                        </form>
                    )}

                    {step === 2 && (
                        <form onSubmit={handleResetPassword} className="space-y-8">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 text-center block">Verification Token</Label>
                                <div className="relative">
                                    <Input
                                        type="text"
                                        placeholder="000000"
                                        maxLength={6}
                                        className="h-20 rounded-[2rem] bg-slate-50 border-slate-200 text-center text-4xl font-black tracking-[0.5em] focus:ring-primary/20 text-primary"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">New Secure Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input
                                        type="password"
                                        placeholder="Minimum 8 characters"
                                        className="h-16 pl-12 rounded-2xl bg-slate-50/50 border-slate-100 font-bold"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            {error && (
                                <Alert variant="destructive" className="rounded-2xl bg-red-50/50 border-red-100 animate-in fade-in slide-in-from-top-2">
                                    <AlertCircle className="w-4 h-4" />
                                    <AlertDescription className="font-bold text-xs">{error}</AlertDescription>
                                </Alert>
                            )}

                            <Button type="submit" className="w-full h-16 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black text-lg shadow-xl shadow-primary/20 transition-all active:scale-95" disabled={isLoading}>
                                {isLoading ? (
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                ) : (
                                    <>
                                        Update Credentials
                                        <CheckCircle2 className="ml-2 w-5 h-5" />
                                    </>
                                )}
                            </Button>

                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="w-full text-[10px] font-black text-slate-400 hover:text-primary uppercase tracking-[0.2em] transition-colors py-2"
                            >
                                Change Registry Email
                            </button>
                        </form>
                    )}

                    {step === 3 && (
                        <div className="text-center space-y-10 py-6">
                            <div className="w-24 h-24 bg-green-50 rounded-[2.5rem] flex items-center justify-center mx-auto text-green-500 animate-bounce">
                                <CheckCircle2 className="w-12 h-12" />
                            </div>
                            <div className="space-y-3">
                                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Access Restored</h2>
                                <p className="text-slate-500 font-medium">Your identity has been re-verified and secured.</p>
                            </div>
                            <Link href="/">
                                <Button className="w-full h-16 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black text-lg shadow-xl shadow-primary/20 transition-all">
                                    Return to Portal
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>

                <p className="text-center text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 mt-12 px-12 leading-relaxed">
                    Identity recovery is regulated by the Arogya Global Security Protocols.
                </p>
            </div>
        </div>
    )
}
