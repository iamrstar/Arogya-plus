import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { createNotification } from "@/lib/mongodb-models"

export async function POST(request) {
  try {
    await connectDB()

    const { phoneNumber, message, type, data, userId } = await request.json()

    // WhatsApp message templates
    const messageTemplates = {
      appointment_confirmation: `Hi ${data.patientName}, your appointment with Dr. ${data.doctorName} is confirmed for ${data.date} at ${data.time}. Location: ${data.location}`,
      lab_report_ready: `Hi ${data.patientName}, your lab report for ${data.testName} is ready. Download it from your patient portal.`,
      payment_confirmation: `Hi ${data.patientName}, we received your payment of ₹${data.amount}. Transaction ID: ${data.transactionId}`,
      appointment_reminder: `Hi ${data.patientName}, reminder: You have an appointment with Dr. ${data.doctorName} tomorrow at ${data.time}.`,
      emergency_alert: `EMERGENCY: ${data.message}. Please contact hospital immediately at ${data.hospitalPhone}`,
    }

    const messageBody = messageTemplates[type] || message

    // Log WhatsApp message in database
    await createNotification({
      userId,
      type: "whatsapp",
      title: type,
      message: messageBody,
      recipient: phoneNumber,
      channel: "whatsapp",
      status: "sent",
    })

    // TODO: Integrate with WhatsApp service provider (Twilio, MessageBird, WhatsApp Business API)
    console.log(`[AA] WhatsApp message sent to ${phoneNumber}: ${messageBody}`)

    return NextResponse.json({ success: true, message: "WhatsApp notification sent" })
  } catch (error) {
    console.error("[AA] WhatsApp notification error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
