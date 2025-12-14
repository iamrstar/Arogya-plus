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
  const appointment = {
    _id: generateId(),
    ...appointmentData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  db.appointments.push(appointment)
  return { insertedId: appointment._id }
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
