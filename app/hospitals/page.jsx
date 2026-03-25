"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Heart, MapPin, Navigation, Star, Phone, Activity, Search, Loader2, Hospital, ArrowRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"

export default function HospitalsPage() {
    const [hospitals, setHospitals] = useState([])
    const [userLocation, setUserLocation] = useState(null)
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")

    useEffect(() => {
        fetchHospitals()
        detectLocation()
    }, [])

    const fetchHospitals = async () => {
        try {
            const res = await fetch("/api/hospitals")
            if (res.ok) {
                const data = await res.json()
                setHospitals(data)
            }
        } catch (error) {
            console.error("Failed to fetch hospitals:", error)
        } finally {
            setLoading(false)
        }
    }

    const detectLocation = () => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    })
                    toast.success("Location synchronized for clinical lookup")
                },
                (error) => {
                    console.error("Geolocation error:", error)
                    toast.error("Location access denied. Using default clinical view.")
                }
            )
        }
    }

    // Haversine formula to calculate distance in km
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371 // Radius of the earth in km
        const dLat = deg2rad(lat2 - lat1)
        const dLon = deg2rad(lon2 - lon1)
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
        return (R * c).toFixed(1)
    }

    const [selectedMapHospital, setSelectedMapHospital] = useState(null)

    const deg2rad = (deg) => deg * (Math.PI / 180)

    const filteredHospitals = hospitals
        .filter(h =>
            h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            h.specialities.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
        )
        .map(h => ({
            ...h,
            distance: userLocation ? calculateDistance(userLocation.lat, userLocation.lng, h.lat, h.lng) : null
        }))
        .sort((a, b) => (a.distance || 9999) - (b.distance || 9999))

    return (
        <div className="min-h-screen bg-[#f8fafb]">
            {/* Header */}
            <nav className="fixed top-0 w-full z-50 border-b border-border/40 bg-white/80 backdrop-blur-md">
                <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center space-x-2 group">
                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                            <Heart className="w-6 h-6 fill-current" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-black tracking-tighter text-primary leading-none">AROGYA</span>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Global Healthcare</span>
                        </div>
                    </Link>
                    <Button variant="ghost" asChild className="font-bold text-slate-600">
                        <Link href="/">Back to Home</Link>
                    </Button>
                </div>
            </nav>

            <main className="pt-32 pb-20 container mx-auto px-6">
                {/* Hero Section */}
                <div className="max-w-3xl mb-16 space-y-6">
                    <Badge variant="outline" className="px-4 py-1.5 rounded-full bg-primary/5 text-primary border-primary/10 font-bold uppercase tracking-wider text-[10px]">
                        <MapPin className="w-3 h-3 mr-2" />
                        Geolocation Enabled Lookup
                    </Badge>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-none">
                        Find Super-Speciality <br />
                        <span className="text-primary italic">Medical Centers </span> Near You.
                    </h1>
                    <p className="text-lg text-slate-500 font-medium">
                        Search across our clinical network for the most advanced healthcare facilities equipped with AI-driven diagnostics and world-reknowned specialists.
                    </p>

                    <div className="relative max-w-xl group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                        <Input
                            placeholder="Search by hospital name or speciality (e.g. Cardiology)..."
                            className="h-16 pl-14 rounded-2xl border-slate-200 bg-white shadow-sm focus:ring-primary/20 text-lg font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Results Grid */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 space-y-4">
                        <Loader2 className="w-10 h-10 text-primary animate-spin" />
                        <p className="text-slate-500 font-bold animate-pulse uppercase tracking-widest text-xs">Syncing with Clinical Registry...</p>
                    </div>
                ) : (
                    <div className="grid lg:grid-cols-2 gap-8">
                        <AnimatePresence mode="popLayout">
                            {filteredHospitals.map((hospital, index) => (
                                <motion.div
                                    key={hospital._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <div className="group bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all relative overflow-hidden">
                                        {/* Premium Decorative Element */}
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[5rem] group-hover:scale-110 transition-transform" />

                                        <div className="relative z-10 flex flex-col md:flex-row gap-8">
                                            <div className="w-24 h-24 bg-slate-50 rounded-3xl flex items-center justify-center flex-shrink-0 group-hover:bg-primary/10 transition-colors">
                                                <Hospital className="w-10 h-10 text-primary" />
                                            </div>

                                            <div className="flex-1 space-y-4">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <h3 className="text-2xl font-black text-slate-900 group-hover:text-primary transition-colors">{hospital.name}</h3>
                                                        <div className="flex items-center text-slate-500 text-sm font-medium mt-1">
                                                            <MapPin className="w-3.5 h-3.5 mr-1" />
                                                            {hospital.address}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center px-3 py-1 bg-yellow-400/10 text-yellow-600 rounded-full text-sm font-black">
                                                        <Star className="w-3.5 h-3.5 mr-1 fill-current" />
                                                        {hospital.rating}
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap gap-2">
                                                    {hospital.specialities.map(spec => (
                                                        <Badge key={spec} variant="secondary" className="rounded-full bg-slate-100 text-slate-600 hover:bg-primary/20 hover:text-primary transition-colors border-none font-bold text-[10px]">
                                                            {spec}
                                                        </Badge>
                                                    ))}
                                                </div>

                                                <div className="flex items-center gap-6 pt-4 border-t border-slate-50">
                                                    <div className="flex items-center gap-2">
                                                        <Navigation className="w-4 h-4 text-primary" />
                                                        <span className="text-sm font-black text-slate-900">
                                                            {hospital.distance ? `${hospital.distance} KM` : "Syncing..."}
                                                        </span>
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-sans">DISTANCE</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Activity className="w-4 h-4 text-secondary" />
                                                        <span className="text-sm font-black text-slate-900 uppercase">Super Speciality</span>
                                                    </div>
                                                </div>

                                                <div className="flex gap-4 pt-4">
                                                    <Button
                                                        className="flex-1 h-14 rounded-2xl bg-slate-900 hover:bg-primary text-white font-black uppercase tracking-widest text-xs group/btn shadow-lg transition-all active:scale-95"
                                                        onClick={() => setSelectedMapHospital(hospital)}
                                                    >
                                                        Find on Map
                                                        <Navigation className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                                                    </Button>
                                                    <Button variant="outline" asChild className="w-14 h-14 rounded-2xl border-slate-200 flex items-center justify-center p-0 hover:bg-primary/5 hover:border-primary transition-all active:scale-95">
                                                        <a href={`tel:+911800400000`}>
                                                            <Phone className="w-5 h-5 text-primary" />
                                                        </a>
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}

                {/* Map View Modal */}
                <Dialog open={!!selectedMapHospital} onOpenChange={() => setSelectedMapHospital(null)}>
                    <DialogContent className="sm:max-w-[800px] h-[600px] p-0 overflow-hidden rounded-[2.5rem] border-none">
                        <DialogHeader className="p-6 bg-white/80 backdrop-blur-md absolute top-0 w-full z-10 border-b border-slate-100">
                            <DialogTitle className="flex items-center gap-3 text-2xl font-black text-slate-900">
                                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                                    <MapPin className="w-5 h-5" />
                                </div>
                                {selectedMapHospital?.name}
                            </DialogTitle>
                        </DialogHeader>
                        <div className="w-full h-full pt-20">
                            {selectedMapHospital && (
                                <iframe
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    loading="lazy"
                                    allowFullScreen
                                    referrerPolicy="no-referrer-when-downgrade"
                                    src={`https://maps.google.com/maps?q=${selectedMapHospital.lat},${selectedMapHospital.lng}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                                ></iframe>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
            </main>
        </div>
    )
}
