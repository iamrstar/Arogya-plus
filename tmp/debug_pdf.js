const { connectDB } = require("./lib/mongodb");
const { generatePrescriptionPDF } = require("./lib/mail-utils");
const fs = require("fs");

async function debug() {
    try {
        const appointmentId = "25cvdmvad";
        console.log(`[DEBUG] Loading store for ${appointmentId}...`);
        const store = await connectDB();

        const sessionPrescriptions = (store.prescriptions || []).filter(p => p.appointmentId === appointmentId);
        console.log(`[DEBUG] Found ${sessionPrescriptions.length} items in archive.`);

        const normalizedPrescriptions = []
        sessionPrescriptions.forEach(p => {
            if (p.medicineName) {
                normalizedPrescriptions.push({
                    name: p.medicineName,
                    dosage: p.dosage,
                    duration: p.duration,
                    instructions: p.instructions
                })
            } else if (Array.isArray(p.prescription)) {
                normalizedPrescriptions.push(...p.prescription.map(m => ({
                    name: m.name,
                    dosage: m.dosage,
                    duration: m.duration,
                    instructions: m.instructions
                })))
            }
        })

        const sessionTests = (store.labTests || [])
            .filter(t => t.appointmentId === appointmentId)
            .map(t => t.testName);

        const appointment = (store.appointments || []).find(a => a._id === appointmentId);
        const followUpDate = appointment?.followUpDate || null;

        const details = {
            patientName: sessionPrescriptions[0]?.patientName || "Test Patient",
            doctorName: sessionPrescriptions[0]?.doctorName || "Test Doctor",
            diagnosis: sessionPrescriptions[0]?.diagnosis || "Test Diagnosis",
            prescriptions: normalizedPrescriptions,
            tests: sessionTests,
            followUpDate: followUpDate
        };

        console.log("[DEBUG] Details for PDF:", JSON.stringify(details, null, 2));

        console.log("[DEBUG] Starting PDF Generation...");
        const buffer = await generatePrescriptionPDF(details);

        fs.writeFileSync("/tmp/debug_prescription.pdf", buffer);
        console.log("[DEBUG] SUCCESS: PDF written to /tmp/debug_prescription.pdf");

    } catch (err) {
        console.error("[DEBUG] FATAL FAILURE:", err);
    }
}

debug();
