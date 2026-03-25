import { NextResponse } from "next/server"

export async function POST(req) {
    try {
        const body = await req.json()
        const { message, history, language = "English" } = body

        console.log("[AA] Chatbot request:", { message, language })

        if (!message) {
            return NextResponse.json({ reply: "I didn't catch that. Could you repeat?" })
        }

        const userMessage = message.toLowerCase()

        // Translations Dictionary
        const i18n = {
            English: {
                greeting: "Namaste! I am Swasthya, your clinical assistant. How can I help you today?",
                specialistPrompt: (spec) => `I suggest consulting our ${spec} department. Shall I book an appointment?`,
                unknown: "Please tell me more about your concern. What is happening?",
                emergency: "If this is a medical emergency, call +91 1800-400-AROGYA immediately.",
                bookingConfirmed: "Appointment confirmed! View it in your 'Appointments' tab.",
                langPrompt: "Which language do you prefer? (English/Hindi/Bengali)"
            },
            Hindi: {
                greeting: "Namaste! Main Swasthya hoon, aapka clinical assistant. Aaj main aapki kaise madad kar sakta hoon?",
                specialistPrompt: (spec) => `Main aapko ${spec} vibhaag (department) dikhane ki salaah deta hoon. Kya main appointment book kar doon?`,
                unknown: "Kripya apne baare mein aur batayein. Kya ho raha hai?",
                emergency: "Yadi yeh medical emergency hai, toh turant +91 1800-400-AROGYA par call karein.",
                bookingConfirmed: "Appointment confirm ho gaya hai! Isse 'Appointments' tab mein dekhein.",
                langPrompt: "Aap kaunsi bhasha pasand karte hain? (English/Hindi/Bengali)"
            },
            Bengali: {
                greeting: "Namaste! Ami Swasthya, apnar clinical assistant. Aaj ami apnay kivabe sahayya korte pari?",
                specialistPrompt: (spec) => `Ami apnay ${spec} bibhag-er (department) sathe poramorsho karar upodesh dichhi. Ami ki appointment book korbo?`,
                unknown: "Anugraha kore apnar somossa somporke aro bolun. Ki hochhe?",
                emergency: "Jodi eti medical emergency hoy, tobe ekhuni +91 1800-400-AROGYA-te call korun.",
                bookingConfirmed: "Appointment nischit hoyechhe! Eti 'Appointments' tab-e dekhun.",
                langPrompt: "Apni kon bhasha pochhondo koren? (English/Hindi/Bengali)"
            }
        }

        const currentI18n = i18n[language] || i18n.English

        // Diagnostic Patterns
        const diagnostics = {
            Cardiology: ["chest pain", "heart", "dil", "buke batha", "seene mein dard", "cardiac"],
            Neurology: ["headache", "brain", "sir dard", "matha betha", "migraine", "nerve"],
            Orthopedics: ["bone", "fracture", "joint pain", "addi", "haad", "back pain", "pither betha"],
            Dermatology: ["skin", "rash", "khujli", "itckiness", "chorakati", "acne"],
            Pediatrics: ["child", "baby", "baccha", "sisu", "infant"]
        }

        let reply = ""
        let isBookingAction = false
        let suggestedSpecialist = null

        // Detect Specialist
        for (const [specialist, patterns] of Object.entries(diagnostics)) {
            if (patterns.some(p => userMessage.includes(p))) {
                suggestedSpecialist = specialist
                reply = currentI18n.specialistPrompt(specialist)
                isBookingAction = true
                break
            }
        }

        if (!reply) {
            if (userMessage.includes("emergency")) {
                reply = currentI18n.emergency
            } else if (userMessage.includes("appointment") || userMessage.includes("book")) {
                reply = language === "English" ? "Which symptoms are you experiencing?" :
                    language === "Hindi" ? "Aapko kya symptoms ho rahe hain?" :
                        "Apnar ki ki symptoms hochhe?"
            } else if (userMessage.includes("hello") || userMessage.includes("namaste")) {
                reply = currentI18n.greeting
            } else {
                reply = currentI18n.unknown
            }
        }

        return NextResponse.json({ reply, suggestedSpecialist, isBookingAction })
    } catch (error) {
        return NextResponse.json({ error: "Failed to process clinical request" }, { status: 500 })
    }
}
