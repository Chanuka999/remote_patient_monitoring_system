import User from "../model/User.js";
import Measurement from "../model/Measurement.js";
import Appointment from "../model/Appointment.js";

// Build a comprehensive knowledge base from MongoDB
export const buildChatbotKnowledgeBase = async () => {
  try {
    const doctors = await User.find({ role: "doctor" }).select(
      "name email number",
    );

    const patients = await User.find({ role: "patient" }).select(
      "name symptoms",
    );
    const allSymptoms = [];
    patients.forEach((p) => {
      if (Array.isArray(p.symptoms)) allSymptoms.push(...p.symptoms);
    });

    const symptomFrequency = {};
    allSymptoms.forEach((s) => {
      const key = String(s).toLowerCase();
      symptomFrequency[key] = (symptomFrequency[key] || 0) + 1;
    });

    const measurements = await Measurement.find()
      .sort({ createdAt: -1 })
      .limit(100);
    const avgStats = {};
    if (measurements.length > 0) {
      avgStats.avgSystolic =
        measurements.reduce((sum, m) => sum + (m.systolic || 0), 0) /
        measurements.length;
      avgStats.avgDiastolic =
        measurements.reduce((sum, m) => sum + (m.diastolic || 0), 0) /
        measurements.length;
      avgStats.avgHeartRate =
        measurements.reduce((sum, m) => sum + (m.heartRate || 0), 0) /
        measurements.length;
      avgStats.avgTemperature =
        measurements.reduce((sum, m) => sum + (m.temperature || 0), 0) /
        measurements.length;
      avgStats.avgOxygen =
        measurements.reduce((sum, m) => sum + (m.oxygenSaturation || 0), 0) /
        measurements.length;
      avgStats.avgGlucose =
        measurements.reduce((sum, m) => sum + (m.glucoseLevel || 0), 0) /
        measurements.length;
    }

    let upcomingAppointments = [];
    let pendingAppointmentCount = 0;
    try {
      const now = new Date();
      const rawAppointments = await Appointment.find({
        status: { $in: ["approved", "pending"] },
        appointmentDate: { $gte: now },
      })
        .populate("patientId", "name")
        .populate("doctorId", "name")
        .limit(10);

      upcomingAppointments = rawAppointments.map((a) => ({
        patient:
          a.patientSnapshot?.name || a.patientId?.name || "Unknown Patient",
        doctor: a.doctorSnapshot?.name || a.doctorId?.name || "Unknown Doctor",
        date: a.appointmentDate,
        timeSlot: a.timeSlot,
        reason: a.reason,
        status: a.status,
      }));
      pendingAppointmentCount = await Appointment.countDocuments({
        status: "pending",
      });
    } catch (apptErr) {
      console.warn("Could not fetch appointments:", apptErr.message);
    }

    return {
      doctors,
      patientCount: patients.length,
      symptomFrequency,
      commonSymptoms: Object.entries(symptomFrequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([symptom]) => symptom),
      measurementStats: avgStats,
      upcomingAppointments,
      pendingAppointmentCount,
    };
  } catch (error) {
    console.error("Error building knowledge base:", error);
    return null;
  }
};

// Build the system prompt string that instructs the AI on its role
export const buildSystemPrompt = (knowledgeBase) => {
  const kb = knowledgeBase || {};
  const doctors = kb.doctors || [];
  const commonSymptoms = kb.commonSymptoms || [];
  const stats = kb.measurementStats || {};
  const patientCount = kb.patientCount || 0;
  const pendingAppointments = kb.pendingAppointmentCount || 0;

  const doctorList =
    doctors.length > 0
      ? doctors
          .map(
            (d, i) =>
              `  ${i + 1}. Dr. ${d.name} — Contact: ${d.number || d.email || "available via platform"}`,
          )
          .join("\n")
      : "  No doctors currently registered";

  const symptomList =
    commonSymptoms.length > 0
      ? commonSymptoms.map((s) => `  - ${s}`).join("\n")
      : "  No symptom data available yet";

  const statsText =
    Object.keys(stats).length > 0
      ? [
          `  Avg Blood Pressure: ${Math.round(stats.avgSystolic || 0)}/${Math.round(stats.avgDiastolic || 0)} mmHg`,
          `  Avg Heart Rate: ${Math.round(stats.avgHeartRate || 0)} bpm`,
          `  Avg Oxygen Saturation: ${Math.round(stats.avgOxygen || 0)}%`,
          `  Avg Temperature: ${(stats.avgTemperature || 0).toFixed(1)}°C`,
          `  Avg Glucose: ${Math.round(stats.avgGlucose || 0)} mg/dL`,
        ].join("\n")
      : "  No measurement stats available yet";

  return `You are HealthLink, a dedicated healthcare assistant for the HealthLink Remote Patient Monitoring System (RPMS).

PLATFORM OVERVIEW:
HealthLink RPMS helps patients monitor chronic conditions like hypertension, diabetes, and heart disease from home. Patients can log symptoms, record vital measurements, book appointments with doctors, and receive health alerts. Doctors can monitor patient health data and receive automated risk alerts.

YOUR ROLE:
- Answer health questions with accurate, responsible medical guidance
- Help users navigate the HealthLink platform (Dashboard, Symptoms, Messages, Appointments)
- Connect patients with available doctors when needed
- Interpret symptoms and vital readings using the platform's real patient data context
- Always prioritize patient safety — escalate emergencies immediately

AVAILABLE DOCTORS ON THIS PLATFORM:
${doctorList}

COMMONLY REPORTED SYMPTOMS IN THIS SYSTEM:
${symptomList}

CURRENT SYSTEM STATS:
  Total registered patients: ${patientCount}
  Pending appointment requests: ${pendingAppointments}

RECENT PATIENT MEASUREMENT AVERAGES (from our patient population):
${statsText}

NORMAL HEALTH RANGES (for patient education):
  Blood Pressure: 90–120 / 60–80 mmHg (normal); ≥140/90 mmHg = hypertension
  Heart Rate: 60–100 bpm (resting adult)
  Oxygen Saturation (SpO2): ≥95% (normal); <92% = seek immediate help
  Temperature: 36.1–37.2°C / 97–99°F (normal); >38°C = fever
  Blood Glucose (fasting): 70–100 mg/dL (normal); >126 mg/dL = diabetes range
  Blood Glucose (post-meal): <140 mg/dL (normal); >200 mg/dL = diabetes concern

PLATFORM NAVIGATION GUIDE:
  - Patient Dashboard: View health summary, log measurements, review alerts
  - Symptoms page: Add or update your symptom list for doctor review
  - Messages: Send direct messages to your doctor
  - Appointments: Book or check appointment request status
  - Emergency SOS: Use for life-threatening emergencies only

EMERGENCY ESCALATION (CRITICAL — ALWAYS FOLLOW):
  If ANY of the following are mentioned, immediately direct to emergency services:
  • Chest pain, pressure, or tightness
  • Cannot breathe / severe shortness of breath
  • Signs of stroke (face drooping, arm weakness, speech difficulty)
  • Loss of consciousness or fainting
  • Severe uncontrolled bleeding
  • Suspected heart attack
  • SpO2 / oxygen saturation below 90%
  Always respond: "This is a medical emergency — call emergency services NOW or press Emergency SOS on the dashboard."

COMMUNICATION STYLE:
  - Be clear, empathetic, and easy to understand
  - Use plain language; avoid excessive medical jargon
  - Always recommend consulting a doctor for diagnosis — you do not diagnose
  - Keep responses focused and actionable
  - Acknowledge the user's concern before giving guidance`;
};

export const getChatbotTrainingData = async (req, res) => {
  try {
    const knowledgeBase = await buildChatbotKnowledgeBase();
    if (!knowledgeBase) {
      return res
        .status(200)
        .json({ success: false, message: "Unable to build knowledge base" });
    }
    return res.status(200).json({ success: true, data: knowledgeBase });
  } catch (error) {
    console.error("/api/chatbot/training error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: String(error),
    });
  }
};

// Fallback contextual response — used when Gemini API is unavailable
// conversationHistory: array of { role: "user"|"model", parts: [{ text }] }
export const buildContextualResponse = async (
  userMessage,
  conversationHistory = [],
) => {
  try {
    const knowledgeBase = await buildChatbotKnowledgeBase();
    const normalized = String(userMessage || "")
      .toLowerCase()
      .trim();

    // Derive context clues from recent conversation history
    const historyText = conversationHistory
      .slice(-6)
      .map((item) => {
        const role = item.role === "user" ? "Patient" : "Assistant";
        const text = item.parts?.[0]?.text || item.text || "";
        return `${role}: ${text}`;
      })
      .join("\n");
    const fullContext = historyText
      ? `${historyText}\nPatient: ${userMessage}`
      : userMessage;
    const contextNorm = fullContext.toLowerCase();

    // 1. Emergency — highest priority
    if (
      /chest pain|can'?t breathe|cannot breathe|shortness of breath|severe bleeding|unconscious|stroke|heart attack|emergency|fainting|spo2.*<.*9[0-2]|oxygen.*below/.test(
        contextNorm,
      )
    ) {
      const doctors = knowledgeBase?.doctors || [];
      const docContact =
        doctors.length > 0
          ? `\nYou may also attempt to reach: ${doctors
              .slice(0, 2)
              .map(
                (d) =>
                  `Dr. ${d.name} (${d.number || d.email || "via platform"})`,
              )
              .join(", ")}`
          : "";
      return `MEDICAL EMERGENCY — Call emergency services IMMEDIATELY or press Emergency SOS on your dashboard. Do NOT wait for further chat guidance if you have chest pain, severe breathing trouble, fainting, stroke signs, or uncontrolled bleeding.${docContact}`;
    }

    // 2. Appointment queries
    if (
      /appointment|book|schedule|visit|availability|confirm appointment|cancel appointment/.test(
        contextNorm,
      )
    ) {
      const doctors = knowledgeBase?.doctors || [];
      const pending = knowledgeBase?.pendingAppointmentCount || 0;
      const doctorNames =
        doctors.length > 0
          ? doctors
              .slice(0, 4)
              .map((d) => `Dr. ${d.name}`)
              .join(", ")
          : "our registered doctors";

      if (/cancel/.test(contextNorm)) {
        return "To cancel an appointment, go to the Appointments section on your dashboard, find your upcoming booking, and select Cancel. If you need help, message your doctor directly via Messages.";
      }
      if (/status|confirm|approved|pending/.test(contextNorm)) {
        return `You can check your appointment status in the Appointments section on your dashboard. Currently there are ${pending} pending request(s) awaiting doctor review. Once approved, you will be notified.`;
      }
      return `To book an appointment, go to the Appointments section on your dashboard and submit a request. You can request a consultation with: ${doctorNames}.\n\nThere are currently ${pending} pending request(s) in the system. Your doctor will review and confirm your appointment.`;
    }

    // 3. Doctor / consultation queries
    if (
      /doctor|consultant|specialist|physician|who can help|contact a doctor|speak to a doctor/.test(
        contextNorm,
      )
    ) {
      const doctors = knowledgeBase?.doctors || [];
      if (doctors.length > 0) {
        const doctorList = doctors
          .slice(0, 5)
          .map(
            (d, i) =>
              `${i + 1}. Dr. ${d.name} — ${d.number || d.email || "Available via Messages"}`,
          )
          .join("\n");
        return `Here are the doctors available on this platform:\n\n${doctorList}\n\nYou can send them a direct message via the Messages section, or book a consultation through Appointments on your dashboard.`;
      }
      return "You can connect with our registered doctors via the Messages section on your Patient Dashboard, or book an appointment from the Appointments page.";
    }

    // 4. Blood pressure / hypertension
    if (/blood pressure|bp|hypertension|systolic|diastolic/.test(contextNorm)) {
      const stats = knowledgeBase?.measurementStats || {};
      const avgNote =
        Object.keys(stats).length > 0
          ? `\n\nFor context, our platform's patient average is ${Math.round(stats.avgSystolic || 0)}/${Math.round(stats.avgDiastolic || 0)} mmHg.`
          : "";
      return `Normal blood pressure is 90–120 / 60–80 mmHg. A reading of 140/90 mmHg or higher indicates hypertension and requires medical attention.${avgNote}\n\nIf your reading is consistently high, log it in the dashboard and message your doctor. If you also have chest pain, severe headache, blurred vision, or shortness of breath, seek urgent care.`;
    }

    // 5. Blood sugar / diabetes
    if (/sugar|glucose|diabetes|diabetic|blood sugar|hba1c/.test(contextNorm)) {
      const stats = knowledgeBase?.measurementStats || {};
      const avgNote =
        Object.keys(stats).length > 0 && stats.avgGlucose
          ? `\n\nOur platform's patient average glucose is ${Math.round(stats.avgGlucose)} mg/dL.`
          : "";
      return `Normal fasting blood glucose is 70–100 mg/dL. Above 126 mg/dL (fasting) suggests diabetes and requires medical evaluation.${avgNote}\n\nLog your readings in the Measurements section on your dashboard. If levels are consistently out of range or you feel unwell, contact your doctor. For very high (>300 mg/dL) or very low (<60 mg/dL) levels, seek medical care urgently.`;
    }

    // 6. Oxygen saturation / SPO2
    if (
      /spo2|oxygen saturation|oxygen level|o2 level|low oxygen/.test(
        contextNorm,
      )
    ) {
      const stats = knowledgeBase?.measurementStats || {};
      const avgNote =
        Object.keys(stats).length > 0
          ? `\n\nOur platform's patient average SpO2 is ${Math.round(stats.avgOxygen || 0)}%.`
          : "";
      return `Normal oxygen saturation (SpO2) is 95–100%. A reading below 92% is concerning and requires urgent medical attention.${avgNote}\n\nIf your SpO2 is low: sit upright, stay calm, and recheck. If it remains low or breathing is difficult, seek emergency care immediately and do not delay.`;
    }

    // 7. Heart rate
    if (
      /heart rate|heartbeat|heart beat|pulse|tachycardia|bradycardia|palpitation/.test(
        contextNorm,
      )
    ) {
      const stats = knowledgeBase?.measurementStats || {};
      const avgNote =
        Object.keys(stats).length > 0
          ? `\n\nOur platform's patient average heart rate is ${Math.round(stats.avgHeartRate || 0)} bpm.`
          : "";
      return `Normal resting heart rate for adults is 60–100 bpm. Above 100 is tachycardia; below 60 is bradycardia.${avgNote}\n\nOccasional variations are normal. If you regularly experience an abnormal rate, or have palpitations with dizziness, chest discomfort, or shortness of breath, consult your doctor via Messages or book an appointment.`;
    }

    // 8. Temperature / fever
    if (
      /fever|high temperature|body temperature|chills|sweating|shivering|hot body/.test(
        contextNorm,
      )
    ) {
      return "Normal body temperature is 36.1–37.2°C (97–99°F). A temperature above 38°C (100.4°F) is a fever.\n\nRest, stay hydrated, and monitor. Seek prompt medical care if:\n• Fever is above 39.5°C (103°F)\n• Fever lasts more than 2–3 days\n• You have difficulty breathing, confusion, a rash, or stiff neck alongside the fever\n• It is a child under 3 months with any fever\n\nLog your temperature in the Measurements section so your doctor can track it.";
    }

    // 9. Headache / dizziness
    if (
      /headache|head pain|migraine|dizzy|dizziness|lightheaded|vertigo/.test(
        contextNorm,
      )
    ) {
      return "Headaches and dizziness can have many causes — dehydration, stress, blood pressure changes, or more serious conditions.\n\nFor mild headache: rest, drink water, and avoid screens. For dizziness: sit or lie down safely.\n\nSeek urgent care if you experience:\n• Sudden severe 'thunderclap' headache\n• Headache with fever, stiff neck, or confusion\n• Dizziness with chest pain, fainting, or weakness\n• Recurring severe episodes\n\nLog your symptoms and consult your doctor if this happens frequently.";
    }

    // 10. Breathing (non-emergency)
    if (
      /breathing|breathless|out of breath|wheezing|asthma|shortness/.test(
        contextNorm,
      )
    ) {
      return "Mild shortness of breath can result from exertion, anxiety, or minor respiratory issues. Sit upright, breathe slowly, and try to relax.\n\nSeek immediate medical help if:\n• Breathing is severe or getting rapidly worse\n• You have chest pain alongside breathing difficulty\n• Your lips or fingernails look blue or grey\n• SpO2 drops below 92%\n\nLog your symptom in the dashboard and message your doctor about recurring breathing difficulties.";
    }

    // 11. Medication
    if (
      /medication|medicine|drug|tablet|pill|prescription|dose|dosage|side effect/.test(
        contextNorm,
      )
    ) {
      return "I can share general information about medications, but I cannot prescribe or recommend specific drugs. Always follow your doctor's prescription.\n\nFor questions about your current medication:\n• Message your doctor via the Messages section\n• Book an appointment for a detailed review\n• Do not change dosage without medical advice\n\nIf you suspect a medication reaction (rash, swelling, difficulty breathing, or rapid heartbeat), seek emergency care immediately.";
    }

    // 12. Symptom logging
    if (
      /symptom|log symptom|record symptom|add symptom|sick|feeling sick|unwell/.test(
        contextNorm,
      )
    ) {
      const commonSymptoms = knowledgeBase?.commonSymptoms || [];
      const symptomNote =
        commonSymptoms.length > 0
          ? `\n\nCommon symptoms reported on this platform include: ${commonSymptoms.slice(0, 6).join(", ")}.`
          : "";
      return `You can log symptoms through the Symptoms section on your Patient Dashboard. Your doctor will review these to monitor your condition over time.${symptomNote}\n\nDescribe what you are experiencing below and I can provide more specific guidance.`;
    }

    // 13. Dashboard / navigation
    if (
      /dashboard|navigate|how to use|where is|find the|use the app|use the system|what can i do/.test(
        contextNorm,
      )
    ) {
      return "Here is how to navigate the HealthLink platform:\n\n• Dashboard — Your health summary, recent alerts, and quick actions\n• Symptoms — Add or update your symptom list for doctor review\n• Measurements — Submit vital readings (BP, heart rate, glucose, SpO2, temperature)\n• Messages — Contact your doctor directly\n• Appointments — Book or check the status of your appointments\n• Emergency SOS — Immediate alert to medical staff for life-threatening situations\n\nWhat specific feature would you like help with?";
    }

    // 14. Greetings
    if (
      /^(hi|hello|hey|good morning|good afternoon|good evening|greetings|howdy)/.test(
        normalized,
      )
    ) {
      const patientCount = knowledgeBase?.patientCount || 0;
      const doctorCount = knowledgeBase?.doctors?.length || 0;
      return `Hello! I am HealthLink, your healthcare assistant. We currently support ${patientCount} patient(s) with ${doctorCount} doctor(s) on the platform.\n\nI can help you with:\n• Understanding your health readings (BP, glucose, SpO2, heart rate)\n• Guidance on symptoms and when to seek care\n• Connecting with your doctor via Messages or Appointments\n• Navigating the HealthLink dashboard\n\nWhat can I help you with today?`;
    }

    // Default
    const patientCount = knowledgeBase?.patientCount || 0;
    const doctorCount = knowledgeBase?.doctors?.length || 0;
    return `I am here to help with your health questions. HealthLink currently supports ${patientCount} patient(s) with ${doctorCount} doctor(s).\n\nI can assist with:\n• Blood pressure, glucose, heart rate, and oxygen readings\n• Fever, headaches, breathing concerns, and other symptoms\n• Booking appointments or messaging a doctor\n• Navigating the HealthLink dashboard\n\nTell me what you are experiencing or what you need help with, and I will do my best to guide you.`;
  } catch (error) {
    console.error("Error building contextual response:", error);
    return "I am here to help with health guidance. Please tell me your concern and I will assist you.";
  }
};
