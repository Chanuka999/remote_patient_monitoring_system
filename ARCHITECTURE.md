# Symptom Alert Flow - Architecture Diagram

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     REMOTE PATIENT MONITORING SYSTEM                    │
└─────────────────────────────────────────────────────────────────────────┘

                              PATIENT SIDE
                              ============

    ┌─────────────────────────────────────────────────────┐
    │  1. Patient Reports Symptoms & Measurements         │
    │  (/symptom-form)                                    │
    ├─────────────────────────────────────────────────────┤
    │ - Select 12+ symptoms (chest pain, shortness etc)   │
    │ - Enter 6 vitals (BP, HR, glucose, temp, O2, etc)   │
    │ - Click "Get Risk Assessment"                       │
    └────────────────────┬────────────────────────────────┘
                         │
                         │ POST /api/measurements
                         │ (save vitals)
                         ▼
    ┌─────────────────────────────────────────────────────┐
    │  2. Backend Processes Measurement                   │
    │  (Backend: server/index.js → measurementRouter)    │
    ├─────────────────────────────────────────────────────┤
    │ • Save to MongoDB.measurements collection           │
    │ • Linked with patientId                             │
    └────────────────────┬────────────────────────────────┘
                         │
                         │ POST /api/predict/symptoms
                         │ (get prediction)
                         ▼
    ┌─────────────────────────────────────────────────────┐
    │  3. Risk Prediction (NEW ENDPOINT)                  │
    │  predictController.predictFromSymptoms()            │
    ├─────────────────────────────────────────────────────┤
    │ Request includes:                                   │
    │ - patientId, symptoms[], vitals                     │
    │                                                     │
    │ Processing:                                         │
    │ 1. Try ML Service (Python on port 5000)            │
    │    • If available → use ML prediction              │
    │    • If unavailable → use fallback rules            │
    │                                                     │
    │ 2. Fallback Rules (if ML down):                     │
    │    • Systolic >= 140 → HIGH RISK                    │
    │    • Heart Rate >= 100 → HIGH RISK                  │
    │    • O2 Sat < 92% → HIGH RISK                       │
    │                                                     │
    │ 3. Save to MongoDB.predictions                      │
    └────────────────────┬────────────────────────────────┘
                         │
                         │ Prediction Result
                         │ (0=Low Risk, 1=High Risk)
                         ▼
    ┌─────────────────────────────────────────────────────┐
    │  4. Check Risk Level                                │
    ├─────────────────────────────────────────────────────┤
    │                                                     │
    │  IF prediction === 1 (HIGH RISK)                    │
    │  ↓                                                  │
    │  Trigger Alert Creation                             │
    │  └→ createAlertsForRisk()                            │
    │     (see DOCTOR SIDE below)                         │
    │                                                     │
    │  IF prediction === 0 (LOW RISK)                     │
    │  ↓                                                  │
    │  Return success message                             │
    │  No alerts created                                  │
    │                                                     │
    └─────────────────────────────────────────────────────┘
                         │
                         │ Response
                         ▼
    ┌─────────────────────────────────────────────────────┐
    │  5. Patient Sees Result                             │
    │  (SymptomForm.jsx shows result)                     │
    ├─────────────────────────────────────────────────────┤
    │ HIGH RISK:                                          │
    │ • Red badge "HIGH RISK"                             │
    │ • Warning message                                   │
    │ • "Alert sent to specialist doctors"                │
    │                                                     │
    │ LOW RISK:                                           │
    │ • Green badge "LOW RISK"                            │
    │ • Reassurance message                               │
    │ • Advice to continue monitoring                     │
    └─────────────────────────────────────────────────────┘


                              DOCTOR SIDE
                              ===========

    ┌─────────────────────────────────────────────────────┐
    │  1. Alert Created (When Prediction=1)               │
    │  createAlertsForRisk() in predictController         │
    ├─────────────────────────────────────────────────────┤
    │ Logic:                                              │
    │ • Find doctor(s) matching patient symptoms          │
    │ • If no match: notify all doctors (up to 50)        │
    │                                                     │
    │ Data Saved to MongoDB.alerts:                       │
    │ - patientId, doctorId, measurementId                │
    │ - symptoms[], message, prediction flag              │
    │ - patientSnapshot (name, email, number)             │
    │ - read status (default: false)                      │
    │ - timestamp                                         │
    │                                                     │
    └────────────────────┬────────────────────────────────┘
                         │
                         │ Socket.IO Emit
                         │ io.to(doctorId).emit("alert", alertData)
                         ▼
    ┌─────────────────────────────────────────────────────┐
    │  2. Real-Time Notification Sent                     │
    │  via Socket.IO (index.js)                           │
    ├─────────────────────────────────────────────────────┤
    │ • Doctor joined room with: socket.emit("join")      │
    │ • Alert emitted to doctor's room in real-time       │
    │ • No page refresh needed                            │
    │ • Instant notification received                     │
    └────────────────────┬────────────────────────────────┘
                         │
                         │ Alert Event
                         │ Received in DoctorDashboard.jsx
                         ▼
    ┌─────────────────────────────────────────────────────┐
    │  3. Doctor Dashboard Updates                        │
    │  (DoctorDashboard.jsx listens to socket event)     │
    ├─────────────────────────────────────────────────────┤
    │ • New alert added to top of list                    │
    │ • Red background (unread status)                    │
    │ • Shows:                                            │
    │   - Patient name                                    │
    │   - Symptoms reported                               │
    │   - Risk badge "HIGH RISK"                          │
    │   - All health measurements                         │
    │   - Timestamp                                       │
    │   - "Mark read" button                              │
    │                                                     │
    └────────────────────┬────────────────────────────────┘
                         │
                         │ Doctor Actions
                         ▼
    ┌─────────────────────────────────────────────────────┐
    │  4. Doctor Reviews Alert                            │
    ├─────────────────────────────────────────────────────┤
    │ Doctor can:                                         │
    │ • Click "Mark read" → PATCH /api/alerts/:id/read    │
    │   - Alert background changes to gray               │
    │   - Alert removed from unread count                 │
    │                                                     │
    │ • View patient details                              │
    │   - Full health measurements                        │
    │   - Patient contact info                            │
    │   - Previous measurement history                    │
    │                                                     │
    │ • Contact patient                                   │
    │   - Call/SMS using patient phone number             │
    │   - Or email using patient email                    │
    │   - Or send prescription                            │
    │                                                     │
    │ • Schedule appointment                              │
    │   - If urgent: immediate                            │
    │   - If routine: schedule for later                  │
    │                                                     │
    └─────────────────────────────────────────────────────┘


## Database Collections Relationship

```

                 ┌──────────────────┐
                 │   users          │
                 ├──────────────────┤
                 │ _id              │ ◄─┐
                 │ name             │   │
                 │ email            │   │
                 │ role (patient)   │   │
                 │ symptoms[]       │   │
                 └──────────────────┘   │
                                        │
                                        │
           ┌─────────────────────────────────────────────────┐
           │                                                 │
           ▼                                                 ▼

┌──────────────────────────┐ ┌──────────────────────────┐
│ measurements │ │ predictions │
├──────────────────────────┤ ├──────────────────────────┤
│ \_id │ ◄─┐ │ \_id │
│ patientId (userId) │ │ ┌── │ patientId (userId) │
│ systolic: 150 │ │ │ │ measurementId ───────┐ │
│ diastolic: 95 │ │ │ │ model: "symptom" │ │
│ heartRate: 110 │ │ │ │ prediction: 1 │ │
│ glucoseLevel: 110 │ │ │ │ features: [150,...] │ │
│ temperature: 37 │ │ │ └──────────────────────┘ │
│ oxygenSaturation: 96 │ │ │ │
│ createdAt: timestamp │ │ │ │
└──────────────────────────┘ │ │ │
│ │ │
│ │ │
┌──────────────┴──────────────┴────────────┐ │
│ │ │
▼ ▼ │
┌──────────────────────────────────┐ ┌──────────────────────────────┐│
│ alerts │ │ doctors (users) ││
├──────────────────────────────────┤ ├──────────────────────────────┤│
│ \_id │ │ \_id ││
│ patientId (users.\_id) │◄───│ name ││
│ doctorId (users.\_id) │ │ email ││
│ measurementId (measurements.\_id) │ │ role: "doctor" ││
│ prediction: 1 │ │ symptoms[] (specialties) ││
│ message: "Patient... high-risk" │ │ createdAt ││
│ symptoms: ["chest_pain", ...] │ └──────────────────────────────┘│
│ patientSnapshot: { │ │
│ name, email, number │ │
│ } │ │
│ read: false │ │
│ createdAt: timestamp │ │
└──────────────────────────────────┘ │
│
┌────────────────────────────────────────┘
│
└─ Alert links doctor, patient, measurement

```

## API Call Sequence Diagram

```

PATIENT BACKEND DATABASE
│ │ │
│ 1. POST /api/measurements │ │
├────────────────────────────────→ │ │
│ (vitals data) │ │
│ │ Create Measurement doc │
│ ├───────────────────────────────→│
│ │ │
│ 2. POST /api/predict/symptoms │ │
├────────────────────────────────→ │ │
│ (vitals + symptoms + patientId)│ │
│ │ Call ML service (if available) │
│ │ OR use fallback rules │
│ │ │
│ │ Save to Predictions collection │
│ ├───────────────────────────────→│
│ │ │
│ │ IF prediction === 1: │
│ │ │
│ │ - Find matching doctors │
│ ├──────────────────────────────→ │
│ │ (query by symptoms) │
│ │ ◄───────────┤
│ │ │
│ │ - Create alerts │
│ ├───────────────────────────────→│
│ │ │
│ 3. Return Response │ │
│ ←─────────────────────────────────┤ │
│ {prediction: 1, features...} │ │
│ │ │
└─── Show HIGH RISK message ────────┘ │
│ │
│ │
│ Socket.IO Emit Alert │
│ to Doctor's room │
│ │
▼
(Doctor receives
real-time event)

DOCTOR BACKEND DATABASE
│ │ │
│ Socket connects & joins room │ │
├────────────────────────────────→ │ │
│ emit("join", {doctorId}) │ Register doctor in Socket.IO │
│ │ room (room name = doctorId) │
│ │ │
│ Listens for alerts on socket │ │
│ socket.on("alert", ...) │ │
│ │ │
│ Alert event received │◄───────────────────────────────┤
│ (real-time, no refresh needed) │ │
│ │ │
│ 4. GET /api/alerts?riskOnly=1 │ │
├────────────────────────────────→ │ │
│ (load all high-risk alerts) │ Query alerts where │
│ │ doctorId = doctor AND │
│ │ prediction = 1 │
│ │ (sorted by newest first) │
│ ├──────────────────────────────→ │
│ │ ◄────────┤
│ 5. GET /api/alerts/:alertId │ │
├────────────────────────────────→ │ │
│ (view specific alert) │ Populate related data: │
│ │ - patient info │
│ │ - measurement details │
│ │ │
│ ├──────────────────────────────→ │
│ │ ◄────────┤
│ 6. PATCH /api/alerts/:id/read │ │
├────────────────────────────────→ │ │
│ (mark as read) │ Update alert: │
│ │ read = true │
│ │ │
│ ├──────────────────────────────→ │
│ │ ◄────────┤
│ Alert background changes to gray │ │
│ │ │

```

## Risk Prediction Logic Flow

```

                   ┌─────────────────────────────┐
                   │  Patient Submits Symptoms   │
                   │  + Health Measurements      │
                   └────────────┬────────────────┘
                                │
                                ▼
                   ┌─────────────────────────────┐
                   │ Is ML Service Available?    │
                   │ (Can connect to host:port?) │
                   └────────────┬────────────────┘
                                │
                    ┌───────────┴────────────┐
                    │                        │
              YES ▼                      NO ▼
         ┌──────────────────┐    ┌──────────────────────────┐
         │ Call ML Endpoint │    │ Use Fallback Rules       │
         │ POST /predict    │    ├──────────────────────────┤
         │                  │    │ Check any of:            │
         │ Wait for ML to   │    │ • Systolic >= 140        │
         │ process features │    │ • Heart Rate >= 100      │
         └────────┬─────────┘    │ • O2 Sat < 92%           │
                  │              │ • Glucose >= 140         │
                  ▼              │ • Temp >= 38.5           │
         ┌──────────────────┐    │ • Diastolic >= 90        │
         │ ML Returns       │    │                          │
         │ Prediction (0/1) │    │ If ANY match: risk = 1   │
         │                  │    │ Otherwise: risk = 0      │
         │ 0 = Low Risk     │    └────────┬─────────────────┘
         │ 1 = High Risk    │             │
         └────────┬─────────┘             │
                  │                       │
                  └───────────┬───────────┘
                              │
                              ▼
                   ┌─────────────────────────────┐
                   │ Save to Database            │
                   │ - Measurement record        │
                   │ - Prediction record         │
                   │ - Features used             │
                   └────────────┬────────────────┘
                                │
                                ▼
                   ┌─────────────────────────────┐
                   │ Check Prediction Result     │
                   └────────────┬────────────────┘
                                │
                    ┌───────────┴────────────┐
                    │                        │
           Risk=0 ▼                   Risk=1 ▼
         ┌──────────────────┐    ┌──────────────────────────┐
         │ LOW RISK         │    │ HIGH RISK                │
         ├──────────────────┤    ├──────────────────────────┤
         │ • No alerts      │    │ • Find specialist        │
         │   created        │    │   doctors matching       │
         │ • Return success │    │   patient symptoms       │
         │ • Patient sees   │    │                          │
         │   green badge    │    │ • If none found:         │
         │ • Continue       │    │   alert all doctors      │
         │   monitoring     │    │   (up to 50)             │
         └──────────────────┘    │                          │
                                 │ • Create alert documents │
                                 │   for each doctor        │
                                 │                          │
                                 │ • Save to DB             │
                                 │                          │
                                 │ • Emit Socket.IO event   │
                                 │   to each doctor's room  │
                                 │                          │
                                 │ • Doctor receives        │
                                 │   real-time alert        │
                                 │                          │
                                 │ • Return success to      │
                                 │   patient with message   │
                                 │   "Alert sent to         │
                                 │    specialists"          │
                                 │                          │
                                 │ • Patient sees           │
                                 │   red HIGH RISK badge    │
                                 └──────────────────────────┘

```

---

## Key Benefits of This Architecture

✅ **Real-Time Alerts** - Socket.IO instant notifications
✅ **No Page Refresh** - Seamless doctor experience
✅ **Automatic Routing** - Alerts to specialist doctors
✅ **Fallback System** - Works even if ML unavailable
✅ **Data Persistence** - All measurements and alerts saved
✅ **Patient History** - Full tracking of submissions
✅ **Doctor Workflow** - Easy alert management
✅ **Scalable** - Ready for SMS/email notifications

---

**Generated**: January 2, 2026
```
