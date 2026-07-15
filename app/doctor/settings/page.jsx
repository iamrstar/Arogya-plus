"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DoctorLayout } from "@/components/layouts/doctor-layout"
import { useAuth } from "@/components/auth/auth-provider"
import { User, Bell, Shield, Mail, Key, Phone, Save, Loader2, Stethoscope, Clock } from "lucide-react"

export default function DoctorSettings() {
    const { user } = useAuth()
    const [activeTab, setActiveTab] = useState("profile")
    const [isSaving, setIsSaving] = useState(false)

    const handleSave = () => {
        setIsSaving(true)
        setTimeout(() => setIsSaving(false), 1000)
    }

    if (!user) return null

    return (
        <DoctorLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold">Settings</h1>
                    <p className="text-muted-foreground">Manage your account settings and preferences</p>
                </div>

                <div className="flex flex-col md:flex-row gap-6">
                    {/* Settings Navigation */}
                    <div className="w-full md:w-64 shrink-0 flex md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0">
                        <Button 
                            variant={activeTab === "profile" ? "default" : "ghost"} 
                            className="justify-start whitespace-nowrap"
                            onClick={() => setActiveTab("profile")}
                        >
                            <User className="w-4 h-4 mr-2" />
                            Personal Profile
                        </Button>
                        <Button 
                            variant={activeTab === "schedule" ? "default" : "ghost"} 
                            className="justify-start whitespace-nowrap"
                            onClick={() => setActiveTab("schedule")}
                        >
                            <Clock className="w-4 h-4 mr-2" />
                            Consultation Hours
                        </Button>
                        <Button 
                            variant={activeTab === "notifications" ? "default" : "ghost"} 
                            className="justify-start whitespace-nowrap"
                            onClick={() => setActiveTab("notifications")}
                        >
                            <Bell className="w-4 h-4 mr-2" />
                            Notifications
                        </Button>
                        <Button 
                            variant={activeTab === "security" ? "default" : "ghost"} 
                            className="justify-start whitespace-nowrap text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => setActiveTab("security")}
                        >
                            <Shield className="w-4 h-4 mr-2" />
                            Security
                        </Button>
                    </div>

                    {/* Settings Content */}
                    <div className="flex-1 space-y-6">
                        {activeTab === "profile" && (
                            <Card className="rounded-2xl border-slate-100 shadow-sm">
                                <CardHeader>
                                    <CardTitle>Personal Profile</CardTitle>
                                    <CardDescription>Update your personal and professional details.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="flex items-center gap-6">
                                        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary text-3xl font-bold uppercase ring-4 ring-primary/5">
                                            {user.name.split(' ').map(n => n[0]).join('').replace('.', '').substring(0, 2)}
                                        </div>
                                        <div>
                                            <Button variant="outline" className="mb-2">Change Avatar</Button>
                                            <p className="text-xs text-muted-foreground">Recommended size: 500x500px</p>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700">Full Name</label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                <Input defaultValue={user.name} className="pl-10" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700">Specialization</label>
                                            <div className="relative">
                                                <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                <Input defaultValue={user.specialization || "General"} className="pl-10" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700">Email Address</label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                <Input defaultValue={user.email} className="pl-10" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700">Phone Number</label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                <Input defaultValue="+91 98765 43210" className="pl-10" />
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="border-t border-slate-100 pt-6">
                                    <Button onClick={handleSave} disabled={isSaving} className="w-full md:w-auto">
                                        {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                                        Save Changes
                                    </Button>
                                </CardFooter>
                            </Card>
                        )}

                        {activeTab === "schedule" && (
                            <Card className="rounded-2xl border-slate-100 shadow-sm">
                                <CardHeader>
                                    <CardTitle>Consultation Hours</CardTitle>
                                    <CardDescription>Manage your availability for patient appointments.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map(day => (
                                            <div key={day} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                                                <div className="w-32 font-bold text-slate-700">{day}</div>
                                                <div className="flex-1 flex gap-4 items-center justify-end">
                                                    <Input defaultValue="09:00 AM" className="w-28 text-center bg-white" />
                                                    <span className="text-slate-400 font-medium">to</span>
                                                    <Input defaultValue="05:00 PM" className="w-28 text-center bg-white" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                                <CardFooter className="border-t border-slate-100 pt-6">
                                    <Button onClick={handleSave} disabled={isSaving}>
                                        {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                                        Update Schedule
                                    </Button>
                                </CardFooter>
                            </Card>
                        )}

                        {activeTab === "notifications" && (
                            <Card className="rounded-2xl border-slate-100 shadow-sm">
                                <CardHeader>
                                    <CardTitle>Notification Preferences</CardTitle>
                                    <CardDescription>Control when and how you receive alerts.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                                        <div>
                                            <h4 className="font-bold text-slate-800">New Appointment Alerts</h4>
                                            <p className="text-sm text-slate-500">Get notified when a patient books a new consultation.</p>
                                        </div>
                                        <div className="w-12 h-6 bg-primary rounded-full relative cursor-pointer">
                                            <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1"></div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                                        <div>
                                            <h4 className="font-bold text-slate-800">Lab Result Updates</h4>
                                            <p className="text-sm text-slate-500">Get notified when a prescribed lab report is ready.</p>
                                        </div>
                                        <div className="w-12 h-6 bg-primary rounded-full relative cursor-pointer">
                                            <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1"></div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                                        <div>
                                            <h4 className="font-bold text-slate-800">Daily Digest</h4>
                                            <p className="text-sm text-slate-500">Receive a summary email of your schedule every morning.</p>
                                        </div>
                                        <div className="w-12 h-6 bg-slate-300 rounded-full relative cursor-pointer">
                                            <div className="w-4 h-4 bg-white rounded-full absolute left-1 top-1"></div>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="border-t border-slate-100 pt-6">
                                    <Button onClick={handleSave} disabled={isSaving}>
                                        {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                                        Save Preferences
                                    </Button>
                                </CardFooter>
                            </Card>
                        )}

                        {activeTab === "security" && (
                            <Card className="rounded-2xl border-slate-100 shadow-sm border-t-4 border-t-red-500">
                                <CardHeader>
                                    <CardTitle>Security</CardTitle>
                                    <CardDescription>Update your password and secure your account.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Current Password</label>
                                        <div className="relative">
                                            <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <Input type="password" placeholder="••••••••" className="pl-10" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">New Password</label>
                                        <div className="relative">
                                            <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <Input type="password" placeholder="••••••••" className="pl-10" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Confirm New Password</label>
                                        <div className="relative">
                                            <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <Input type="password" placeholder="••••••••" className="pl-10" />
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="border-t border-slate-100 pt-6">
                                    <Button onClick={handleSave} disabled={isSaving} variant="destructive">
                                        {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Shield className="w-4 h-4 mr-2" />}
                                        Update Password
                                    </Button>
                                </CardFooter>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </DoctorLayout>
    )
}
