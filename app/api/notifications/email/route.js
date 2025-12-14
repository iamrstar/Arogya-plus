import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { createNotification } from "@/lib/mongodb-models"

export async function POST(request) {
  try {
    await connectDB()

    const { to, subject, template, data, userId } = await request.json()

    // Email service templates
    const emailTemplates = {
      appointment_confirmation: `
        <h2>Appointment Confirmed</h2>
        <p>Dear ${data.patientName},</p>
        <p>Your appointment with Dr. ${data.doctorName} is confirmed for ${data.date} at ${data.time}.</p>
        <p>Location: ${data.location}</p>
      `,
      lab_report_ready: `
        <h2>Lab Report Ready</h2>
        <p>Dear ${data.patientName},</p>
        <p>Your lab report for ${data.testName} is now ready.</p>
        <p>You can download it from your patient portal.</p>
      `,
      payment_confirmation: `
        <h2>Payment Received</h2>
        <p>Dear ${data.patientName},</p>
        <p>We have received your payment of ₹${data.amount} for invoice ${data.invoiceNo}.</p>
        <p>Transaction ID: ${data.transactionId}</p>
      `,
      appointment_reminder: `
        <h2>Appointment Reminder</h2>
        <p>Dear ${data.patientName},</p>
        <p>This is a reminder about your appointment with Dr. ${data.doctorName} tomorrow at ${data.time}.</p>
      `,
    }

    const emailBody = emailTemplates[template] || ""

    // Log email in database
    await createNotification({
      userId,
      type: "email",
      title: subject,
      message: emailBody,
      recipient: to,
      channel: "email",
      template,
      status: "sent",
    })

    // TODO: Integrate with email service provider (SendGrid, Nodemailer, AWS SES)
    console.log(`[AA] Email sent to ${to}: ${subject}`)

    return NextResponse.json({ success: true, message: "Email notification sent" })
  } catch (error) {
    console.error("[AA] Email notification error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
