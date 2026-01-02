# Quick Start Guide - Symptom to Alert Flow

## What Was Built

A complete real-time symptom reporting and alert system where:

1. **Patients** report symptoms + health measurements
2. **AI** analyzes data and predicts risk (High/Low)
3. **Alerts** automatically sent to specialist doctors when high-risk
4. **Doctors** receive real-time notifications without page refresh

---

## Setup Instructions

### 1. Frontend Installation

```bash
cd client
npm install
```

### 2. Backend Setup

```bash
cd server
npm install
```

Create `.env` file in server directory:

```
PORT=3000
MONGODB_URI=your_mongodb_connection
JWT_SECRET=your_jwt_secret
ML_HOST=localhost
ML_PORT=5000
ML_ALLOW_FALLBACK=true
VITE_FRONTEND_ORIGIN=http://localhost:5173
```

### 3. ML Service (Optional but Recommended)

Start your Python ML service:

```bash
cd ml
python app.py
# Should run on localhost:5000
```

### 4. Start Application

**Terminal 1 - Backend:**

```bash
cd server
npm start
# Server runs on http://localhost:3000
```

**Terminal 2 - Frontend:**

```bash
cd client
npm run dev
# Frontend runs on http://localhost:5173
```

---

## How to Test

### Test Scenario: Patient Reports High-Risk Symptoms

#### Step 1: Open Patient Account

- Navigate to http://localhost:5173
- Login as patient

#### Step 2: Access Symptom Assessment

- Go to **Symptoms** page
- Click **"Quick Health Assessment"** button
- Or navigate to `/symptom-form`

#### Step 3: Fill Form

- **Select Symptoms:**

  - Check "Chest Pain"
  - Check "Shortness of Breath"
  - Check "Heart Palpitations"

- **Enter Measurements:**
  - Systolic: 150 (high)
  - Diastolic: 95 (high)
  - Heart Rate: 110 (high)
  - Glucose: 110 (normal)
  - Temperature: 37 (normal)
  - O2 Saturation: 96 (good)

#### Step 4: Submit

- Click **"Get Risk Assessment"**
- You should see: **"HIGH RISK"** with red badge
- Message: "An alert has been sent to specialist doctors"

#### Step 5: Doctor Receives Alert

- Open **different browser/incognito window**
- Login as doctor account
- Go to **Doctor Dashboard**
- You should see real-time alert with:
  - Patient name
  - Symptoms listed
  - All measurements displayed
  - "High risk" badge in red
  - "Mark read" button

#### Step 6: Doctor Actions

- Click **"Mark read"** button
- Alert status changes to gray (read)
- Or click the patient name to see more details

---

## Key Files Modified/Created

### New Files Created:

- `client/src/components/SymptomForm.jsx` - Patient symptom input form
- `SYMPTOM_ALERT_FLOW.md` - Complete documentation

### Modified Files:

- `client/src/App.jsx` - Added SymptomForm route
- `client/src/components/Sympthoms.jsx` - Added quick assessment button
- `client/src/components/SymptomDetail.jsx` - Added risk assessment link
- `server/controllers/predictController.js` - Added `predictFromSymptoms()` function
- `server/routes/predictRouter.js` - Added `/predict/symptoms` endpoint

### Already Integrated (No changes needed):

- `client/src/components/DoctorDashboard.jsx` - Already displays alerts
- `server/controllers/alertController.js` - Already handles alerts
- `server/routes/alertRouter.js` - Alert endpoints ready
- `server/lib/socket.js` - Socket.IO already set up

---

## API Endpoints Available

### Patient APIs

**Submit Symptoms & Get Prediction**

```bash
POST /api/predict/symptoms
Content-Type: application/json

{
  "patientId": "6356e1f2b5c1a2b3c4d5e6f7",
  "symptoms": ["chest_pain", "shortness_of_breath"],
  "systolic": 150,
  "diastolic": 95,
  "heartRate": 110,
  "glucoseLevel": 110,
  "temperature": 37,
  "oxygenSaturation": 96
}
```

Response:

```json
{
  "success": true,
  "body": {
    "model": "symptom_based",
    "prediction": 1,
    "features": [150, 95, 110, 110, 37, 96],
    "symptoms": ["chest_pain", "shortness_of_breath"]
  }
}
```

### Doctor APIs

**Get All High-Risk Alerts**

```bash
GET /api/alerts?riskOnly=1
Authorization: Bearer {token}
```

**Get Specific Alert**

```bash
GET /api/alerts/{alertId}
Authorization: Bearer {token}
```

**Mark Alert as Read**

```bash
PATCH /api/alerts/{alertId}/read
Authorization: Bearer {token}
```

---

## Real-Time Features

### Socket.IO Connection

- Doctor joins room on login: `socket.emit("join", { doctorId: "..." })`
- Patient submits high-risk symptoms
- Doctor receives real-time alert event: `socket.on("alert", (alert) => { ... })`
- UI updates instantly without page refresh

### Benefits:

- ✅ Instant notifications
- ✅ No page refresh needed
- ✅ Real-time patient safety
- ✅ Immediate doctor response capability

---

## Database Collections Used

1. **users** - Patient & doctor accounts
2. **measurements** - Health vitals stored
3. **predictions** - AI prediction results
4. **alerts** - Doctor notifications
5. **appointments** - Existing

---

## Troubleshooting

| Issue                      | Solution                                                                    |
| -------------------------- | --------------------------------------------------------------------------- |
| Alerts not appearing       | Check patient has `patientId` in form, prediction is 1, doctor is logged in |
| Socket.IO not connecting   | Verify VITE_BACKEND_URL, check CORS settings, clear browser cache           |
| ML service errors          | Check if Python service running on port 5000, or set ML_ALLOW_FALLBACK=true |
| Doctor not receiving alert | Confirm doctor joined Socket.IO room (check browser console)                |
| Prediction always 0        | Check fallback thresholds or ML service response format                     |

---

## Navigation Guide

### For Patients:

```
Home
└── Symptoms (/Sympthoms)
    └── Select Condition (e.g., Heart Disease)
        └── Learn More (/Sympthoms/:id)
            └── [NEW] Quick Health Assessment (/symptom-form)
                └── Submit Symptoms → Get Risk Alert
```

### For Doctors:

```
Home
└── Doctor Dashboard (/doctorDashboard)
    └── View Real-Time Alerts
        └── See Patient Symptoms & Measurements
            └── Mark as Read
```

---

## Features Summary

✅ **Patient Symptom Input** - 12+ common symptoms  
✅ **Health Measurements** - 6 vital metrics  
✅ **AI Risk Prediction** - ML-based or rule-based fallback  
✅ **Automatic Alerts** - When high-risk detected  
✅ **Real-Time Notifications** - Socket.IO instant updates  
✅ **Doctor Dashboard** - View & manage alerts  
✅ **Specialist Routing** - Alerts to matching doctors  
✅ **Measurement Tracking** - All data saved for history  
✅ **Read Status** - Track which alerts doctors have reviewed

---

## Next Steps (Optional Enhancements)

1. Add SMS/Email notifications to doctors
2. Implement appointment booking from alerts
3. Add patient chat with assigned doctor
4. Create alert escalation levels
5. Add medical history timeline
6. Generate alert reports
7. Add predictive analytics dashboard

---

**Need Help?** Check `SYMPTOM_ALERT_FLOW.md` for detailed technical documentation.
