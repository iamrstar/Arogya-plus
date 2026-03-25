import { getDB } from "./mongodb"

export const collections = {
  users: "users",
  doctors: "doctors",
  patients: "patients",
  staff: "staff",
  appointments: "appointments",
  labTests: "lab_tests",
  treatments: "treatments",
  prescriptions: "prescriptions",
  payments: "payments",
  notifications: "notifications",
  departments: "departments",
  hospitals: "hospitals",
  beds: "beds",
  rooms: "rooms",
  admissions: "admissions",
  otps: "otps",
  pharmacyOrders: "pharmacyOrders",
  purchaseOrders: "purchaseOrders",
  prescriptions: "prescriptions",
}

// Generate unique ID
function generateId() {
  return Math.random().toString(36).substr(2, 9)
}

// User operations
export async function createUser(userData) {
  const db = getDB()
  const user = {
    _id: generateId(),
    ...userData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  db.users.push(user)
  return { insertedId: user._id }
}

export async function findUserByEmail(email) {
  const db = getDB()
  return db.users.find((u) => u.email?.toLowerCase() === email?.toLowerCase())
}

export async function findUserById(id) {
  const db = getDB()
  return db.users.find((u) => u._id === id)
}

export async function updateUser(id, updates) {
  const db = getDB()
  const userIndex = db.users.findIndex((u) => u._id === id)
  if (userIndex !== -1) {
    db.users[userIndex] = {
      ...db.users[userIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    return { modifiedCount: 1 }
  }
  return { modifiedCount: 0 }
}

// Doctor operations
export async function createDoctor(doctorData) {
  const db = getDB()
  const doctor = {
    _id: generateId(),
    ...doctorData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  db.users.push(doctor)
  return { insertedId: doctor._id }
}

export async function findDoctorById(id) {
  const db = getDB()
  return db.users.find((u) => u._id === id && u.userType === "doctor")
}

export async function getAllDoctors(filter = {}) {
  const db = getDB()
  return db.users.filter((u) => u.userType === "doctor")
}

// Patient operations
export async function createPatient(patientData) {
  return createUser(patientData)
}

export async function findPatientById(id) {
  const db = getDB()
  return db.users.find((u) => u._id === id && u.userType === "patient")
}

export async function updatePatient(id, updates) {
  return updateUser(id, updates)
}

// Appointment operations
export async function createAppointment(appointmentData) {
  const db = getDB()

  // Auto-assignment logic for First Visits
  if (appointmentData.type === "First Visit" || !appointmentData.doctorId) {
    const deptDoctors = db.users.filter(u => u.userType === "doctor" && u.specialization === appointmentData.department)
    const primaryDoctor = deptDoctors.find(u => u.isHeadOfDept) || deptDoctors[0]

    if (primaryDoctor) {
      appointmentData.doctorId = primaryDoctor._id
      appointmentData.doctorName = primaryDoctor.name
    }
  }

  // Calculate standard 30-day follow-up
  const followUpDate = new Date(appointmentData.appointmentDate)
  followUpDate.setDate(followUpDate.getDate() + 30)

  const appointment = {
    _id: generateId(),
    ...appointmentData,
    followUpDate: followUpDate.toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  db.appointments.push(appointment)
  return { insertedId: appointment._id, appointment }
}

export async function getAppointmentsByPatient(patientId) {
  const db = getDB()
  return db.appointments
    .filter((a) => a.patientId === patientId)
    .sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate))
}

export async function getAppointmentsByDoctor(doctorId) {
  const db = getDB()
  return db.appointments
    .filter((a) => a.doctorId === doctorId)
    .map(a => {
      const patient = db.users.find(u => u._id === (a.patientId || a._id))
      return {
        ...a,
        _id: a._id, // Ensure ID is consistent
        patientId: patient?._id || a.patientId,
        medicationLog: patient?.medicationLog || [],
        testLog: patient?.testLog || []
      }
    })
    .sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate))
}

export async function updateAppointment(id, updates) {
  const db = getDB()
  const appIndex = db.appointments.findIndex((a) => a._id === id)
  if (appIndex !== -1) {
    db.appointments[appIndex] = {
      ...db.appointments[appIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    return { modifiedCount: 1 }
  }
  return { modifiedCount: 0 }
}

// Lab Test operations
export async function createLabTest(testData) {
  const db = getDB()
  const test = {
    _id: generateId(),
    ...testData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  db.labTests.push(test)
  return { insertedId: test._id }
}

export async function getLabTestsByPatient(patientId) {
  const db = getDB()
  return db.labTests
    .filter((t) => t.patientId === patientId)
    .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))
}

export async function updateLabTest(id, updates) {
  const db = getDB()
  const testIndex = db.labTests.findIndex((t) => t._id === id)
  if (testIndex !== -1) {
    db.labTests[testIndex] = {
      ...db.labTests[testIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    return { modifiedCount: 1 }
  }
  return { modifiedCount: 0 }
}

// Treatment operations
export async function createTreatment(treatmentData) {
  const db = getDB()
  const treatment = {
    _id: generateId(),
    ...treatmentData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  db.treatments.push(treatment)
  return { insertedId: treatment._id }
}

export async function getTreatmentsByPatient(patientId) {
  const db = getDB()
  return db.treatments
    .filter((t) => t.patientId === patientId)
    .sort((a, b) => new Date(b.startDate) - new Date(a.startDate))
}

export async function updateTreatment(id, updates) {
  const db = getDB()
  const treatIndex = db.treatments.findIndex((t) => t._id === id)
  if (treatIndex !== -1) {
    db.treatments[treatIndex] = {
      ...db.treatments[treatIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    return { modifiedCount: 1 }
  }
  return { modifiedCount: 0 }
}

// Payment operations
export async function createPayment(paymentData) {
  const db = getDB()
  const payment = {
    _id: generateId(),
    ...paymentData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  db.payments.push(payment)
  return { insertedId: payment._id }
}

export async function getPaymentsByPatient(patientId) {
  const db = getDB()
  return db.payments
    .filter((p) => p.patientId === patientId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

export async function updatePayment(id, updates) {
  const db = getDB()
  const payIndex = db.payments.findIndex((p) => p._id === id)
  if (payIndex !== -1) {
    db.payments[payIndex] = {
      ...db.payments[payIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    return { modifiedCount: 1 }
  }
  return { modifiedCount: 0 }
}

// Notification operations
export async function createNotification(notificationData) {
  const db = getDB()
  const notification = {
    _id: generateId(),
    ...notificationData,
    createdAt: new Date().toISOString(),
    read: false,
  }
  db.notifications.push(notification)
  return { insertedId: notification._id }
}

export async function getNotificationsByUser(userId) {
  const db = getDB()
  return db.notifications
    .filter((n) => n.userId === userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

export async function updateNotification(id, updates) {
  const db = getDB()
  const notifIndex = db.notifications.findIndex((n) => n._id === id)
  if (notifIndex !== -1) {
    db.notifications[notifIndex] = {
      ...db.notifications[notifIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    return { modifiedCount: 1 }
  }
  return { modifiedCount: 0 }
}

// OTP operations
export async function createOTP(email, otp) {
  const db = getDB()
  const normalizedEmail = email.trim().toLowerCase()
  const otpEntry = {
    _id: generateId(),
    email: normalizedEmail,
    otp,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 10 * 60000).toISOString(), // 10 minutes
  }
  if (!db.otps) db.otps = []
  db.otps.push(otpEntry)
  console.log(`[AA] OTP Created for ${normalizedEmail}: ${otp}`)
  console.log(`[AA] Current OTP count in store: ${db.otps.length}`)
  return { success: true }
}

export async function verifyOTP(email, otp, shouldDelete = true) {
  const db = getDB()
  if (!db.otps) {
    console.log("[AA] OTP verification failed: No otps collection in DB")
    return false
  }

  const normalizedEmail = email.trim().toLowerCase()
  console.log(`[AA] Verifying OTP for ${normalizedEmail}: ${otp} (delete: ${shouldDelete})`)
  console.log(`[AA] Active OTPs in store:`, db.otps.map(o => ({ email: o.email, otp: o.otp })))

  const otpEntryIndex = db.otps.findIndex(
    (o) => o.email.toLowerCase() === normalizedEmail && o.otp === otp && new Date(o.expiresAt) > new Date()
  )

  if (otpEntryIndex !== -1) {
    console.log(`[AA] OTP Verified successfully for ${email}`)
    if (shouldDelete) {
      // Remove the OTP after verification
      db.otps.splice(otpEntryIndex, 1)
      console.log(`[AA] OTP record deleted from store`)
    }
    return true
  }

  console.log(`[AA] OTP Verification FAILED for ${email}`)
  return false
}

export async function clearExistingUsers() {
  const db = getDB()
  db.users = []
  return { success: true }
}

// Pharmacy operations
export async function createPharmacyOrder(orderData) {
  const db = getDB()
  const order = {
    _id: generateId(),
    ...orderData,
    status: "Pending",
    createdAt: new Date().toISOString(),
  }
  if (!db.pharmacyOrders) db.pharmacyOrders = []
  db.pharmacyOrders.push(order)
  return order
}

// Prescription operations
export async function createPrescription(prescriptionData) {
  const db = getDB()
  const prescription = {
    _id: `RX-${Date.now()}`,
    ...prescriptionData,
    date: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  }

  if (!db.prescriptions) db.prescriptions = []
  db.prescriptions.push(prescription)

  // Deduct stock if medicine is provided
  if (prescriptionData.medicineId || prescriptionData.medicineName) {
    await deductMedicineStock(
      prescriptionData.medicineId || prescriptionData.medicineName,
      prescriptionData.quantity || 1
    )
  }

  return prescription
}

export async function deductMedicineStock(identifier, quantity) {
  const db = getDB()
  const meds = db.medicines || []

  const medicine = meds.find(m => m._id === identifier || m.name === identifier)
  if (!medicine) return null

  medicine.stock = Math.max(0, (medicine.stock || 0) - quantity)

  // Update status based on new stock
  if (medicine.stock === 0) medicine.status = "Out of Stock"
  else if (medicine.stock <= 10) medicine.status = "Critical"
  else if (medicine.stock <= 30) medicine.status = "Low Stock"
  else medicine.status = "In Stock"

  return medicine
}

export async function getPharmacyOrders(query = {}) {
  const db = getDB()
  if (!db.pharmacyOrders) return []
  return db.pharmacyOrders.filter((o) => {
    if (query.patientId && o.patientId !== query.patientId) return false
    if (query.status && o.status !== query.status) return false
    return true
  })
}

export async function updatePharmacyOrder(orderId, updates) {
  const db = getDB()
  if (!db.pharmacyOrders) return null
  const index = db.pharmacyOrders.findIndex((o) => o._id === orderId)
  if (index !== -1) {
    db.pharmacyOrders[index] = {
      ...db.pharmacyOrders[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    return db.pharmacyOrders[index]
  }
  return null
}
// Hospital operations
export async function getAllHospitals() {
  const db = getDB()
  if (!db.hospitals) return []
  return db.hospitals
}

// Purchase Order operations
export async function createPurchaseOrder(orderData) {
  const db = getDB()
  const order = {
    _id: `PO-${Date.now()}`,
    ...orderData,
    status: "Sent to Supplier",
    createdAt: new Date().toISOString(),
  }
  if (!db.purchaseOrders) db.purchaseOrders = []
  db.purchaseOrders.push(order)
  return order
}

export async function getPurchaseOrders() {
  const db = getDB()
  return db.purchaseOrders || []
}

// Daily Medication Plan operations
export async function addToDailyPlan(patientId, item) {
  const db = getDB()
  const patient = db.admittedPatients.find(p => p._id === patientId)
  if (!patient) return null

  if (!patient.dailyMedicationPlan) patient.dailyMedicationPlan = []

  const newItem = {
    _id: `DP-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    ...item,
    status: "pending",
    createdAt: new Date().toISOString()
  }

  patient.dailyMedicationPlan.push(newItem)
  return newItem
}

export async function removeFromDailyPlan(patientId, planItemId) {
  const db = getDB()
  const patient = db.admittedPatients.find(p => p._id === patientId)
  if (!patient || !patient.dailyMedicationPlan) return false

  const index = patient.dailyMedicationPlan.findIndex(i => i._id === planItemId)
  if (index !== -1) {
    patient.dailyMedicationPlan.splice(index, 1)
    return true
  }
  return false
}
