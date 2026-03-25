import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { getAllHospitals } from "@/lib/mongodb-models"

export async function GET() {
    try {
        const store = await connectDB()

        // Seed Fallback if store is empty due to HMR/History
        if (!store.hospitals || store.hospitals.length === 0) {
            store.hospitals = [
                {
                    _id: "HOSP001",
                    name: "Apollo Multispecialty Hospital",
                    city: "Kolkata",
                    specialities: ["Cardiology", "Neurology", "Gastroenterology"],
                    lat: 22.5697,
                    lng: 88.4067,
                    rating: 4.8,
                    address: "Canal Circular Rd, Kadapara, Kolkata, West Bengal"
                },
                {
                    _id: "HOSP002",
                    name: "AIIMS Delhi",
                    city: "Delhi",
                    specialities: ["Oncology", "Pediatrics", "Cardiology"],
                    lat: 28.5672,
                    lng: 77.2100,
                    rating: 4.9,
                    address: "Ansari Nagar, New Delhi"
                },
                {
                    _id: "HOSP003",
                    name: "Manipal Hospital Old Airport Road",
                    city: "Bangalore",
                    specialities: ["Orthopedics", "Pulmonology", "Neurology"],
                    lat: 12.9593,
                    lng: 77.6444,
                    rating: 4.7,
                    address: "98, Old Airport Rd, HAL 2nd Stage, Bangalore, Karnataka"
                },
                {
                    _id: "HOSP004",
                    name: "Fortis Memorial Research Institute",
                    city: "Gurgaon",
                    specialities: ["Transplant", "Hematology", "Robotic Surgery"],
                    lat: 28.4552,
                    lng: 77.0717,
                    rating: 4.8,
                    address: "Sector 44, Gurgaon, Haryana"
                }
            ]
        }

        const hospitals = await getAllHospitals()
        return NextResponse.json(hospitals)
    } catch (error) {
        console.error("[AA] Hospitals GET error:", error)
        return NextResponse.json({ error: "Failed to fetch medical centers" }, { status: 500 })
    }
}
