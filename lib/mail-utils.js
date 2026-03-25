import nodemailer from "nodemailer"
import { PDFDocument, StandardFonts, rgb } from "pdf-lib"

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "info.arogyahealth@gmail.com",
    pass: "axog klxz urds kuob",
  },
})

export async function sendEmail({ to, subject, html }) {
  try {
    const info = await transporter.sendMail({
      from: '"Arogya Health" <info.arogyahealth@gmail.com>',
      to,
      subject,
      html,
    })
    console.log("[AA] Email sent: %s", info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error("[AA] Error sending email:", error)
    return { success: false, error: error.message }
  }
}

export async function sendOTPEmail(to, otp) {
  const subject = "Your Arogya Health OTP Verification Code"
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 30px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 28px; letter-spacing: 1px;">Arogya Health</h1>
      </div>
      <div style="padding: 40px; color: #333; line-height: 1.6;">
        <h2 style="margin-top: 0; color: #1e293b;">OTP Verification</h2>
        <p>Hello,</p>
        <p>Your one-time password (OTP) for verification at Arogya Health is:</p>
        <div style="background-color: #f1f5f9; padding: 20px; text-align: center; border-radius: 8px; margin: 30px 0;">
          <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #0f172a;">${otp}</span>
        </div>
        <p>This code will expire in 10 minutes. Please do not share this code with anyone.</p>
        <p>If you didn't request this code, you can safely ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 40px 0;">
        <p style="font-size: 12px; color: #64748b; text-align: center;">© ${new Date().getFullYear()} Arogya Health. All rights reserved.</p>
      </div>
    </div>
  `
  return sendEmail({ to, subject, html })
}

export async function sendAppointmentEmail(to, appointmentDetails) {
  const { patientName, doctorName, appointmentDate, department } = appointmentDetails
  const subject = "Appointment Confirmation - Arogya Health"
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 30px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 28px;">Appointment Confirmed</h1>
      </div>
      <div style="padding: 40px; color: #333; line-height: 1.6;">
        <p>Dear <strong>${patientName}</strong>,</p>
        <p>Your appointment has been successfully scheduled. Here are the details:</p>
        <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 20px; border-radius: 4px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Doctor:</strong> ${doctorName}</p>
          <p style="margin: 5px 0;"><strong>Department:</strong> ${department}</p>
          <p style="margin: 5px 0;"><strong>Date & Time:</strong> ${new Date(appointmentDate).toLocaleString()}</p>
          <p style="margin: 5px 0;"><strong>Status:</strong> Scheduled</p>
        </div>
        <p>Please arrive 15 minutes before your scheduled time. If you need to reschedule, please contact us at least 24 hours in advance.</p>
        <p>Thank you for choosing Arogya Health.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 40px 0;">
        <p style="font-size: 12px; color: #64748b; text-align: center;">© ${new Date().getFullYear()} Arogya Health. All rights reserved.</p>
      </div>
    </div>
  `
  return sendEmail({ to, subject, html })
}
export async function generatePrescriptionPDF(details) {
  try {
    const { patientName, doctorName, diagnosis, prescriptions, tests, followUpDate } = details
    const pdfDoc = await PDFDocument.create()
    const page = pdfDoc.addPage([600, 800])
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

    // Header: Clinic Branding
    page.drawText("AROGYA CLINIC & DIAGNOSTIC CENTER", { x: 50, y: 750, size: 24, font: boldFont, color: rgb(0.1, 0.2, 0.4) })
    page.drawText("Digital Health Record System", { x: 50, y: 730, size: 10, font, color: rgb(0.4, 0.4, 0.4) })

    // Divider
    page.drawLine({ start: { x: 50, y: 710 }, end: { x: 550, y: 710 }, thickness: 2, color: rgb(0.1, 0.2, 0.4) })

    // Metadata
    page.drawText(`Patient Name: ${patientName || "Unknown Patient"}`, { x: 50, y: 680, size: 12, font: boldFont })
    page.drawText(`Date: ${new Date().toLocaleDateString('en-IN')}`, { x: 400, y: 680, size: 12, font })
    page.drawText(`Consulting Physician: Dr. ${doctorName || "Primary Clinician"}`, { x: 50, y: 660, size: 12, font: boldFont })

    // Clinical Diagnosis
    page.drawText("CLINICAL DIAGNOSIS", { x: 50, y: 620, size: 10, font: boldFont, color: rgb(0.5, 0.5, 0.5) })
    page.drawText(diagnosis || "General Consultation", { x: 50, y: 605, size: 14, font })

    // Prescription Section
    page.drawText("MEDICATION REGIMEN (Rx)", { x: 50, y: 560, size: 10, font: boldFont, color: rgb(0.5, 0.5, 0.5) })

    let currentY = 540
    if (prescriptions && prescriptions.length > 0) {
      prescriptions.forEach((p, index) => {
        if (currentY > 150) { // Pagination guard
          page.drawText(`${index + 1}. ${p.name || "Medicine"}`, { x: 60, y: currentY, size: 12, font: boldFont })
          page.drawText(`   Dosage: ${p.dosage || "As directed"} | Duration: ${p.duration || "N/A"} | ${p.instructions || ""}`, { x: 60, y: currentY - 15, size: 10, font })
          currentY -= 40
        }
      })
    } else {
      page.drawText("No medications prescribed in this session.", { x: 60, y: currentY, size: 10, font, color: rgb(0.4, 0.4, 0.4) })
      currentY -= 40
    }

    // Lab Tests
    if (tests && tests.length > 0) {
      page.drawText("INVESTIGATIONS & RESULTS", { x: 50, y: currentY - 20, size: 10, font: boldFont, color: rgb(0.5, 0.5, 0.5) })
      currentY -= 40
      tests.forEach((t) => {
        if (currentY > 100) {
          const isObject = typeof t === 'object' && t !== null
          const name = isObject ? t.name : t
          const status = isObject ? (t.status || "Ordered") : "Ordered"
          const result = isObject ? t.result : null

          page.drawText(`• ${name}`, { x: 60, y: currentY, size: 11, font: boldFont })
          page.drawText(`[${status}]`, { x: 300, y: currentY, size: 9, font, color: status === 'Completed' ? rgb(0, 0.5, 0) : rgb(0.5, 0.5, 0) })

          if (result) {
            currentY -= 15
            page.drawText(`   Result: ${result}`, { x: 70, y: currentY, size: 10, font, color: rgb(0.2, 0.2, 0.2) })
            if (t.referenceRange) {
              page.drawText(` (Ref: ${t.referenceRange})`, { x: 250, y: currentY, size: 8, font, color: rgb(0.5, 0.5, 0.5) })
            }
          }
          currentY -= 25
        }
      })
    }

    // Follow-up
    if (followUpDate && !isNaN(new Date(followUpDate).getTime())) {
      const fDate = new Date(followUpDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
      page.drawText("NEXT APPOINTMENT (FOLLOW-UP)", { x: 50, y: 100, size: 10, font: boldFont, color: rgb(0, 0.4, 0.4) })
      page.drawText(fDate, { x: 50, y: 80, size: 14, font: boldFont, color: rgb(0.1, 0.3, 0.3) })
    }

    // Footer Disclaimer
    page.drawText("This is a digitally generated clinical prescription. No physical signature required.", { x: 150, y: 30, size: 8, font, color: rgb(0.6, 0.6, 0.6) })

    const pdfBytes = await pdfDoc.save()
    return Buffer.from(pdfBytes)
  } catch (err) {
    console.error("[AA] PDF Generation Fatal Error:", err)
    throw err // Re-throw for API to catch
  }
}

export async function sendEPrescriptionEmail(to, details) {
  const { patientName, doctorName, diagnosis, prescriptions, tests, isSerious, shiftToHospital, followUpDate } = details
  const subject = `E-Prescription - ${patientName} - Arogya Health`

  // Generate PDF Buffer
  const pdfBuffer = await generatePrescriptionPDF(details)

  const followUpHtml = followUpDate ? `
    <div style="background-color: #f0fdfa; border: 1px solid #ccfbf1; border-radius: 12px; padding: 20px; margin-top: 30px; border-left: 4px solid #0d9488;">
      <h4 style="color: #0f766e; margin-top: 0; text-transform: uppercase; font-size: 11px; letter-spacing: 1px;">📅 Follow-up Appointment</h4>
      <p style="color: #134e4a; font-size: 15px; font-weight: bold; margin-bottom: 5px;">${new Date(followUpDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      <p style="color: #0f766e; font-size: 12px; margin-bottom: 0;">Please bring this digital prescription during your next visit.</p>
    </div>
  ` : ""

  const prescriptionHtml = prescriptions.map(p => `
    <div style="padding: 15px; border-bottom: 1px solid #eee;">
      <p style="margin: 0; font-weight: bold; color: #1e293b;">${p.name}</p>
      <p style="margin: 5px 0 0; font-size: 13px; color: #64748b;">Dosage: ${p.dosage} | Duration: ${p.duration}</p>
      <p style="margin: 3px 0 0; font-size: 12px; font-style: italic; color: #94a3b8;">${p.instructions}</p>
    </div>
  `).join("")

  const testHtml = tests.length > 0 ? `
    <div style="margin-top: 20px;">
      <h3 style="font-size: 14px; text-transform: uppercase; color: #64748b; margin-bottom: 10px;">Diagnostic Tests Ordered</h3>
      <ul style="margin: 0; padding-left: 20px; color: #1e293b;">
        ${tests.map(t => `<li style="margin-bottom: 5px;">${t}</li>`).join("")}
      </ul>
    </div>
  ` : ""

  const emergencyHtml = shiftToHospital ? `
    <div style="background-color: #fef2f2; border: 1px solid #fee2e2; border-radius: 8px; padding: 20px; margin-top: 30px; text-align: center;">
      <h3 style="color: #991b1b; margin-top: 0;">⚠️ Hospital Shift Initiated</h3>
      <p style="color: #b91c1c; font-size: 14px; margin-bottom: 0;">A referral for emergency hospital admission has been registered. Our staff will coordinate transport and bed assignment immediately.</p>
    </div>
  ` : ""

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 20px; overflow: hidden; background: #fff;">
      <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 40px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 24px; letter-spacing: 2px;">AROGYA HEALTH</h1>
        <p style="margin: 10px 0 0; font-size: 14px; opacity: 0.8; letter-spacing: 4px; text-transform: uppercase;">Digital Prescription</p>
      </div>
      
      <div style="padding: 40px; color: #333; line-height: 1.6;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 30px; border-bottom: 2px solid #f1f5f9; padding-bottom: 15px;">
          <div>
            <p style="margin: 0; font-size: 11px; text-transform: uppercase; color: #94a3b8; font-weight: bold;">Patient</p>
            <p style="margin: 0; font-size: 16px; font-weight: bold; color: #1e293b;">${patientName}</p>
          </div>
          <div style="text-align: right;">
            <p style="margin: 0; font-size: 11px; text-transform: uppercase; color: #94a3b8; font-weight: bold;">Practitioner</p>
            <p style="margin: 0; font-size: 16px; font-weight: bold; color: #1e293b;">${doctorName}</p>
          </div>
        </div>

        <div style="margin-bottom: 30px;">
          <h3 style="font-size: 14px; text-transform: uppercase; color: #64748b; margin-bottom: 10px;">Clinical Diagnosis</h3>
          <p style="background: #f8fafc; padding: 15px; border-radius: 12px; margin: 0; color: #1e293b; font-weight: 500;">${diagnosis}</p>
        </div>

        <div style="border: 1px solid #f1f5f9; border-radius: 15px; overflow: hidden;">
          <div style="background: #f1f5f9; padding: 10px 20px;">
            <p style="margin: 0; font-size: 11px; font-weight: bold; text-transform: uppercase; color: #64748b;">Medication Regimen</p>
          </div>
          ${prescriptionHtml}
        </div>

        ${testHtml}
        ${followUpHtml}
        ${emergencyHtml}

        <div style="margin-top: 40px; text-align: center;">
          <p style="font-size: 12px; color: #94a3b8;">This is a digitally signed e-prescription. QR verification available at clinical portal.</p>
        </div>

        <hr style="border: none; border-top: 1px solid #eee; margin: 40px 0;">
        <p style="font-size: 12px; color: #64748b; text-align: center;">© ${new Date().getFullYear()} Arogya Health. All rights reserved.</p>
      </div>
    </div>
  `

  return sendEmail({
    to,
    subject,
    html,
    attachments: [
      {
        filename: `Prescription_${patientName.replace(/\s+/g, '_')}.pdf`,
        content: pdfBuffer
      }
    ]
  })
}
