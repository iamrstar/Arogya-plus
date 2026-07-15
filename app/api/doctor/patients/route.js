import { NextResponse } from "next/server"
import { getDB, connectDB } from "@/lib/mongodb"
import { verifyToken } from "@/lib/auth"

export async function GET(request) {
    try {
        await connectDB()
        const token = request.headers.get("authorization")?.split(" ")[1]
        const user = verifyToken(token)

        if (!user || (user.role !== "doctor" && user.userType !== "doctor")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const db = getDB()
        
        // 1. Gather all unique patients this doctor has interacted with (OPD)
        const doctorAppointments = db.appointments.filter(a => a.doctorId === user.userId)
        
        const outpatientIds = [...new Set(doctorAppointments.map(a => a.patientId))]
        
        // Fetch personal info and medical history for Outpatients
        const outpatients = outpatientIds.map(patientId => {
            const patientData = db.users.find(u => u._id === patientId) || {}
            
            // All appointments for this patient
            const allAppointments = db.appointments.filter(a => a.patientId === patientId)
            
            // Lab Reports
            const labReports = db.labTests ? db.labTests.filter(t => t.patientId === patientId) : []
            
            // Prescriptions
            const prescriptions = db.prescriptions ? db.prescriptions.filter(p => p.patientId === patientId) : []

            // Normalize appointments
            const normalizedAppointments = allAppointments.map(a => {
                let d = a.date
                if (!d && a.appointmentDate) d = new Date(a.appointmentDate).toISOString().split('T')[0]
                return { ...a, date: d || "N/A" }
            })

            return {
                id: patientId,
                name: patientData.name || normalizedAppointments[0]?.patientName || "Unknown Patient",
                age: patientData.age || 35,
                gender: patientData.gender || "Not Specified",
                phone: patientData.phone || "+91-0000000000",
                email: patientData.email || "No Email",
                address: patientData.address || "Unknown Address",
                bloodGroup: patientData.bloodGroup || "O+",
                lastVisit: normalizedAppointments.sort((a, b) => new Date(b.date) - new Date(a.date))[0]?.date || "N/A",
                condition: prescriptions[prescriptions.length - 1]?.condition || "General Consultation",
                status: "Stable", // Default for OPD
                allergies: patientData.allergies || ["None"],
                emergencyContact: patientData.emergencyContact || "N/A",
                appointments: normalizedAppointments.map(a => ({
                    date: a.date,
                    time: a.time || "10:00 AM",
                    reason: a.reason || "General Consultation",
                    status: a.status || "Scheduled"
                })),
                labReports: labReports.map(l => ({
                    date: l.orderDate,
                    test: l.testName,
                    result: l.result || "Awaiting Result",
                    status: l.status
                })),
                prescriptions: prescriptions.map(p => ({
                    date: new Date(p.date).toISOString().split('T')[0],
                    medicines: [{
                        name: p.medicineName,
                        dosage: p.dosage,
                        frequency: p.instructions,
                        duration: p.duration
                    }]
                })),
                type: "outpatient"
            }
        })

        // 2. Gather Admitted Patients (IPD)
        const admitted = db.admittedPatients ? db.admittedPatients.filter(a => a.doctor === user.name) : []
        
        const admittedPatients = admitted.map(admitData => {
            const patientId = admitData.originalId
            const patientData = db.users.find(u => u._id === patientId) || {}
            
            // All appointments for this patient
            const allAppointments = db.appointments.filter(a => a.patientId === patientId)
            
            // Lab Reports
            const labReports = db.labTests ? db.labTests.filter(t => t.patientId === patientId) : []
            
            // Prescriptions
            const prescriptions = db.prescriptions ? db.prescriptions.filter(p => p.patientId === patientId) : []

            // Normalize appointments
            const normalizedAppointments = allAppointments.map(a => {
                let d = a.date
                if (!d && a.appointmentDate) d = new Date(a.appointmentDate).toISOString().split('T')[0]
                return { ...a, date: d || "N/A" }
            })

            return {
                id: patientId,
                name: admitData.name || patientData.name || normalizedAppointments[0]?.patientName || "Unknown Patient",
                age: admitData.age || patientData.age || 35,
                gender: admitData.gender || patientData.gender || "Not Specified",
                phone: patientData.phone || "+91-0000000000",
                email: patientData.email || "No Email",
                address: patientData.address || "Unknown Address",
                bloodGroup: patientData.bloodGroup || "O+",
                lastVisit: admitData.admissionDate || normalizedAppointments.sort((a, b) => new Date(b.date) - new Date(a.date))[0]?.date || "N/A",
                condition: admitData.condition || "Under Observation",
                status: "Critical", // Often IPD patients are under closer watch
                allergies: patientData.allergies || ["None"],
                emergencyContact: patientData.emergencyContact || "N/A",
                appointments: normalizedAppointments.map(a => ({
                    date: a.date,
                    time: a.time || "10:00 AM",
                    reason: a.reason || "General Consultation",
                    status: a.status || "Scheduled"
                })),
                labReports: labReports.map(l => ({
                    date: l.orderDate,
                    test: l.testName,
                    result: l.result || "Awaiting Result",
                    status: l.status
                })),
                prescriptions: prescriptions.map(p => ({
                    date: new Date(p.date).toISOString().split('T')[0],
                    medicines: [{
                        name: p.medicineName,
                        dosage: p.dosage,
                        frequency: p.instructions,
                        duration: p.duration
                    }]
                })),
                type: "admitted",
                ward: admitData.department,
                bed: admitData.bed
            }
        })

        // Merge, ensuring we don't have duplicates if an admitted patient also had an OPD appointment
        const admittedIds = new Set(admittedPatients.map(p => p.id))
        const finalOutpatients = outpatients.filter(p => !admittedIds.has(p.id))

        return NextResponse.json({
            outpatients: finalOutpatients,
            admittedPatients
        })
    } catch (error) {
        console.error("[AA] Doctor Patients GET error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
