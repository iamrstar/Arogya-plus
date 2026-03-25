const { store, connectDB } = require("./lib/mongodb");
const { deductMedicineStock, addToDailyPlan } = require("./lib/mongodb-models");

async function runTest() {
    console.log("=== STARTING RECONCILIATION TEST ===");
    const db = await connectDB();

    // 1. Check Initial State
    const med = db.medicines.find(m => m.name.includes("Paracetamol"));
    const initialStock = med.stock;
    console.log(`Initial Paracetamol Stock: ${initialStock}`);

    // 2. Simulate Patient in OPD
    const patientId = "TEST-PAT-001";
    db.opdQueue.push({
        _id: patientId,
        name: "Test Reconciliation Patient",
        age: 30,
        gender: "Female",
        department: "General Medicine"
    });
    console.log("Patient added to OPD Queue.");

    // 3. Doctor Consultation & Admission
    const doctorId = "DOC001";
    const admissionId = "TEST-ADM-001";

    // Simulation of Doctor API Logic
    const opdPatient = db.opdQueue.pop();
    const newAdmitted = {
        _id: admissionId,
        originalId: patientId,
        name: opdPatient.name,
        department: opdPatient.department,
        status: "Pending Shifting",
        isShifted: false,
        dailyMedicationPlan: [
            { _id: "PLAN-TEST-01", medicineId: med._id, medicineName: med.name, dosage: "500mg", shift: "Morning", status: "pending" }
        ],
        medicationLog: [],
        admissionDate: new Date().toISOString().split('T')[0]
    };
    db.admittedPatients.push(newAdmitted);

    db.staffTasks.push({
        _id: "TASK-TEST-01",
        type: "Shifting",
        admissionId: admissionId,
        status: "Pending"
    });
    console.log("Admission authorized and Shifting task created.");

    // 4. Ward Boy Shifting
    const task = db.staffTasks.find(t => t._id === "TASK-TEST-01");
    task.status = "Completed";
    const admittedPatient = db.admittedPatients.find(p => p._id === admissionId);
    admittedPatient.status = "Shifted";
    admittedPatient.isShifted = true;
    console.log("Patient shifted to Ward.");

    // 5. Nurse Medication Administration
    // Simulation of Medicate API Logic
    const planItem = admittedPatient.dailyMedicationPlan[0];
    const qty = 1;

    const updatedMed = await deductMedicineStock(planItem.medicineId, qty);
    admittedPatient.medicationLog.push({
        medicineId: updatedMed._id,
        name: updatedMed.name,
        quantity: qty,
        price: updatedMed.price,
        date: new Date().toISOString()
    });
    planItem.status = "administered";
    console.log("Medication administered by Nurse.");

    // 6. Verification
    console.log("\n=== FINAL RECONCILIATION CHECK ===");
    console.log(`New Paracetamol Stock: ${med.stock} (Expected: ${initialStock - 1})`);
    console.log(`Patient Medication Log: ${JSON.stringify(admittedPatient.medicationLog[0])}`);

    if (med.stock === initialStock - 1 && admittedPatient.medicationLog.length > 0) {
        console.log("\nSUCCESS: Reconciliation cycle verified.");
    } else {
        console.log("\nFAILURE: Data inconsistency detected.");
    }
}

runTest().catch(console.error);
