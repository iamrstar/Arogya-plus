import { NextResponse } from "next/server"
import { getDB, connectDB } from "@/lib/mongodb"
import { verifyToken } from "@/lib/auth"

export async function GET(request) {
    try {
        await connectDB()
        const token = request.headers.get("authorization")?.split(" ")[1]
        const user = verifyToken(token)

        if (!user || user.role !== "Super Admin") {
            return NextResponse.json({ error: "Unauthorized. Admin access only." }, { status: 401 })
        }

        const store = getDB()
        const activeBills = []

        // 1. Gather IPD (Admitted) Patients Billing
        const admitted = store.admittedPatients || []
        
        admitted.forEach(patient => {
            if (patient.status === "Discharged") return;

            let totalAmount = 0
            const breakdown = []

            // A. Room Charges
            const dept = store.departments?.find(d => d.name === patient.department)
            const bedRate = dept?.bedRate || 2000
            
            // Calculate days admitted
            const admissionDate = new Date(patient.admissionDate)
            const today = new Date()
            const diffTime = Math.abs(today - admissionDate)
            const daysAdmitted = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)))
            
            const roomCharge = daysAdmitted * bedRate
            totalAmount += roomCharge
            breakdown.push({
                item: `Room Charge (${patient.department} - ${daysAdmitted} days @ ₹${bedRate}/day)`,
                amount: roomCharge
            })

            // B. Pharmacy Charges
            const pharmacyBills = store.payments?.filter(p => p.patientId === patient.patientId || p.patientId === patient.originalId) || []
            pharmacyBills.forEach(bill => {
                if (bill.status !== "Paid") {
                    totalAmount += bill.amount
                    breakdown.push({ item: `Pharmacy Bill (${bill.orderId})`, amount: bill.amount })
                }
            })

            // C. OT Surgeries
            const surgeries = store.otSchedule?.filter(ot => ot.patientId === patient._id || ot.patientId === patient.originalId) || []
            surgeries.forEach(surgery => {
                totalAmount += surgery.cost || 50000
                breakdown.push({ item: `Surgery: ${surgery.procedure}`, amount: surgery.cost || 50000 })
            })

            // D. Diagnostics (Lab Tests)
            const tests = store.labTests?.filter(t => t.patientId === patient.patientId || t.patientId === patient.originalId) || []
            tests.forEach(test => {
                const diagInfo = store.masterDiagnostics?.find(d => d.name === test.testName)
                const testCost = diagInfo?.price || 500
                totalAmount += testCost
                breakdown.push({ item: `Lab Test: ${test.testName}`, amount: testCost })
            })

            activeBills.push({
                patientId: patient.patientId || patient.originalId || patient._id,
                admissionId: patient._id,
                patientName: patient.name,
                type: "IPD",
                department: patient.department,
                daysAdmitted,
                totalAmount,
                breakdown,
                status: "Pending Discharge"
            })
        })

        // 2. Gather OPD Pending Payments (Walk-ins with unpaid pharmacy or lab bills)
        // For simplicity, we look for payments in store.payments with status "Pending Payment"
        const opdPayments = store.payments?.filter(p => p.status === "Pending Payment") || []
        
        // Group by patient
        const opdMap = {}
        opdPayments.forEach(payment => {
            if (!opdMap[payment.patientId]) {
                opdMap[payment.patientId] = {
                    patientId: payment.patientId,
                    patientName: payment.patientName,
                    type: "OPD",
                    totalAmount: 0,
                    breakdown: [],
                    status: "Pending Payment"
                }
            }
            opdMap[payment.patientId].totalAmount += payment.amount
            opdMap[payment.patientId].breakdown.push({ item: `${payment.type} Bill (${payment.orderId})`, amount: payment.amount })
        })

        Object.values(opdMap).forEach(opdBill => activeBills.push(opdBill))

        return NextResponse.json(activeBills)
    } catch (error) {
        console.error("[AA] Billing GET error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function POST(request) {
    try {
        await connectDB()
        const token = request.headers.get("authorization")?.split(" ")[1]
        const user = verifyToken(token)

        if (!user || user.role !== "Super Admin") {
            return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
        }

        const store = getDB()
        const { patientId, admissionId, totalAmount, paymentMethod } = await request.json()

        // 1. If IPD, discharge patient
        if (admissionId) {
            const admittedIndex = store.admittedPatients?.findIndex(p => p._id === admissionId)
            if (admittedIndex !== -1) {
                store.admittedPatients[admittedIndex].status = "Discharged"
                store.admittedPatients[admittedIndex].dischargeDate = new Date().toISOString()
                
                // Free the bed
                const bed = store.beds?.find(b => b.patientId === admissionId)
                if (bed) {
                    bed.status = "Available"
                    bed.patientId = null
                    bed.patientName = null
                    bed.admissionDate = null
                }
            }
        }

        // 2. Mark all pharmacy/lab payments for this patient as Paid
        if (store.payments) {
            store.payments.forEach(p => {
                if ((p.patientId === patientId || (admissionId && p.patientId === admissionId)) && p.status !== "Paid") {
                    p.status = "Paid"
                }
            })
        }

        // 3. Record final master invoice
        if (!store.invoices) store.invoices = []
        const masterInvoice = {
            _id: `INV-MASTER-${Date.now()}`,
            patientId,
            admissionId,
            totalAmount,
            paymentMethod: paymentMethod || "Card",
            date: new Date().toISOString(),
            status: "Paid",
            processedBy: user.name
        }
        store.invoices.push(masterInvoice)

        return NextResponse.json({ success: true, message: "Payment processed and patient discharged.", invoice: masterInvoice })
    } catch (error) {
        console.error("[AA] Billing POST error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
