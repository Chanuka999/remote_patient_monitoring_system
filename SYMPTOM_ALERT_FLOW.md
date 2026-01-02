# Patient-Doctor Symptom Prediction & Alert System

## Overview

This system enables patients to report their symptoms and health measurements, receive AI-based risk assessments, and automatically alert specialist doctors when high-risk conditions are detected.

## Complete Flow

### 1. **Patient Dashboard - Report Symptoms**

#### Location: `/symptom-form`

- Patients can access this from the Symptoms page or directly from `/Sympthoms`
- **Input Options:**
  - **Symptoms Selection**: Choose from 12+ common symptoms (chest pain, shortness of breath, dizziness, fatigue, etc.)
  - **Health Measurements**: Enter 6 vital measurements:
    - Systolic BP (50-250 mmHg)
    - Diastolic BP (30-150 mmHg)
    - Heart Rate (20-220 bpm)
    - Glucose Level (20-600 mg/dL)
    - Temperature (30-45°C)
    - Oxygen Saturation (50-100%)

### 2. **Backend Prediction Processing**

#### Endpoint: `POST /api/predict/symptoms`

**Request Body:**

```json
{
  "patientId": "user_id",
  "symptoms": ["chest_pain", "shortness_of_breath"],
  "systolic": 150,
  "diastolic": 95,
  "heartRate": 105,
  "glucoseLevel": 180,
  "temperature": 37.5,
  "oxygenSaturation": 95
}
```

**Processing Steps:**

1. **Measurements Saved**: Health data is stored in `Measurement` collection
2. **ML Prediction**:
   - Attempts to call Python ML service on `ML_HOST:ML_PORT`
   - Falls back to rule-based prediction if ML unavailable
3. **Prediction Stored**: Result saved in `Prediction` collection with model type and features
4. **Risk Assessment**:
   - `prediction === 1` → HIGH RISK
   - `prediction === 0` → LOW RISK

**Response:**

```json
{
  "success": true,
  "body": {
    "model": "symptom_based",
    "prediction": 1,
    "features": [150, 95, 105, 180, 37.5, 95],
    "symptoms": ["chest_pain", "shortness_of_breath"]
  }
}
```

### 3. **Automatic Alert Generation**

#### Trigger: When prediction === 1 (HIGH RISK)

**Alert Creation Logic:**

1. **Find Specialist Doctors**: Query doctors whose specialty matches patient's symptoms
2. **Fallback**: If no matching specialists, alert all doctors (limited to 50)
3. **Alert Data Saved**:
   - Patient information snapshot
   - All symptom details
   - Health measurements reference
   - Risk flag (prediction = 1)

**Alert Document Fields:**

```javascript
{
  patientId: ObjectId,
  doctorId: ObjectId,
  measurementId: ObjectId,
  prediction: 1,
  message: "Patient [Name] high-risk detected — symptoms: chest pain, shortness of breath",
  symptoms: ["chest_pain", "shortness_of_breath"],
  patientSnapshot: {
    name: "Patient Name",
    email: "patient@email.com",
    number: "+1234567890"
  },
  read: false,
  createdAt: timestamp
}
```

### 4. **Real-Time Doctor Notifications**

#### Socket.IO Event: `alert`

- Doctor must join Socket.IO room with their ID
- When alert is created, it's emitted to doctor's room in real-time
- Doctors receive instant notification without page refresh

#### Flow:

1. Doctor opens dashboard → `DoctorDashboard.jsx` connects to Socket.IO
2. Doctor's component emits `join` event with their ID
3. Server registers doctor in room (room name = doctorId)
4. When patient submits symptoms with high risk, alert is emitted to doctor's room
5. Doctor's UI updates instantly with new alert

### 5. **Doctor Dashboard - View & Manage Alerts**

#### Location: `/doctorDashboard`

**Features:**

- **Real-Time Alerts Display**:
  - Shows high-risk alerts with unread badge (red background)
  - Read alerts shown with gray background
- **Alert Details**:
  - Patient name, symptoms reported
  - Risk status badge (HIGH RISK in red)
  - All health measurements displayed
  - Timestamp of alert
- **Actions**:
  - Mark alert as read
  - View full patient details
  - Access patient's health history

**Alert Filtering:**

- `GET /api/alerts` → Get all alerts for doctor
- `GET /api/alerts?riskOnly=1` → Get only high-risk alerts (default for dashboard)

## API Endpoints Summary

### Patient Endpoints

| Method | Endpoint                       | Purpose                              |
| ------ | ------------------------------ | ------------------------------------ |
| POST   | `/api/measurements`            | Save health measurements             |
| POST   | `/api/predict/symptoms`        | Get risk prediction with symptoms    |
| POST   | `/api/predict/heart_from_form` | Alternative heart disease prediction |

### Doctor Endpoints

| Method | Endpoint                 | Purpose                   |
| ------ | ------------------------ | ------------------------- |
| GET    | `/api/alerts`            | Get all alerts for doctor |
| GET    | `/api/alerts?riskOnly=1` | Get only high-risk alerts |
| GET    | `/api/alerts/:id`        | Get single alert details  |
| PATCH  | `/api/alerts/:id/read`   | Mark alert as read        |
| PATCH  | `/api/alerts/:id/unread` | Mark alert as unread      |

## Database Models

### Measurement

```javascript
{
  systolic: Number,
  diastolic: Number,
  heartRate: Number,
  glucoseLevel: Number,
  temperature: Number,
  oxygenSaturation: Number,
  patientId: ObjectId,
  createdAt: Date
}
```

### Prediction

```javascript
{
  patientId: ObjectId,
  measurementId: ObjectId,
  model: String, // "heart", "symptom_based"
  prediction: Number, // 0 or 1
  features: [Number],
  mlBody: Mixed,
  createdAt: Date
}
```

### Alert

```javascript
{
  patientId: ObjectId,
  doctorId: ObjectId,
  measurementId: ObjectId,
  prediction: Number,
  message: String,
  symptoms: [String],
  patientSnapshot: {
    name: String,
    email: String,
    number: String
  },
  read: Boolean,
  createdAt: Date
}
```

## Component Structure

### Frontend Components

**SymptomForm.jsx** - NEW

- Patient symptom input and health measurement form
- Displays risk assessment results
- Handles symptom + measurement submission

**Sympthoms.jsx** - UPDATED

- Added "Quick Health Assessment" button
- Quick access to SymptomForm

**SymptomDetail.jsx** - UPDATED

- Added green "Get Risk Assessment" button
- Links to SymptomForm for quick analysis

**DoctorDashboard.jsx** - EXISTING (Enhanced)

- Displays real-time alerts via Socket.IO
- Shows patient symptoms and measurements
- Alert management (read/unread)

### Backend Structure

**predictController.js** - UPDATED

- `predictFromSymptoms()` - NEW endpoint for symptom-based predictions
- `createAlertsForRisk()` - Alert generation logic
- Handles ML service communication with fallback

**alertController.js** - EXISTING

- `getAlertsForDoctor()` - Fetch doctor's alerts
- `getAlertById()` - Get single alert
- `markAlertRead()` / `markAlertUnread()` - Mark status

**Routes:**

- `predictRouter.js` - Added `/api/predict/symptoms` route
- `alertRouter.js` - All alert endpoints

## Risk Prediction Logic

### ML Service (if available)

- Calls Python ML model on configured host:port
- Returns prediction (0 or 1)

### Fallback (Rule-Based)

If ML service unavailable, triggers HIGH RISK if ANY of these conditions:

- Systolic BP ≥ 140 mmHg
- Heart Rate ≥ 100 bpm
- Oxygen Saturation < 92%

## Real-Time Communication

### Socket.IO Setup

```javascript
// Server (index.js)
io.on("connection", (socket) => {
  socket.on("join", (data) => {
    socket.join(String(data.doctorId));
  });
});

// Client (DoctorDashboard.jsx)
socket.emit("join", { doctorId: doctor.id });
socket.on("alert", (alert) => {
  // Update UI with new alert
});

// Alert Emission (predictController.js)
io.to(String(doctorId)).emit("alert", alertData);
```

## User Journey

### Patient

1. Login to patient account
2. Navigate to Symptoms page (`/Sympthoms`)
3. Click "Quick Health Assessment"
4. Report symptoms and enter measurements
5. View instant risk assessment
6. If high-risk:
   - See confirmation message
   - Alert automatically sent to doctors
   - Specialists contacted immediately

### Doctor

1. Login to doctor account
2. Open Doctor Dashboard (`/doctorDashboard`)
3. Socket.IO connects and joins their room
4. View alerts in real-time as they arrive
5. See patient details, symptoms, and measurements
6. Mark alerts as read
7. Contact patient or take appropriate action

## Configuration

### Environment Variables Needed

```
# Server (.env)
ML_HOST=localhost         # Python ML service host
ML_PORT=5000             # Python ML service port
ML_ALLOW_FALLBACK=true   # Use fallback if ML unavailable
JWT_SECRET=your_secret

# Frontend (.env)
VITE_BACKEND_URL=http://localhost:3000
```

### ML Service Integration

- Expected at `http://ML_HOST:ML_PORT/predict`
- POST request with health measurements
- Response should include `prediction` field (0 or 1)

## Testing the Flow

### Test Case: High-Risk Patient

1. Patient reports: Chest pain + High BP (150/95) + High heart rate (110)
2. Prediction should return: `prediction: 1`
3. Alerts automatically created for cardiologists
4. Doctors receive real-time notification
5. Doctor dashboard shows high-risk alert with patient details

### Test Case: Normal Patient

1. Patient reports: No symptoms + Normal BP (120/80) + Normal heart rate (70)
2. Prediction should return: `prediction: 0`
3. No alerts generated
4. Patient sees "Low Risk" message with reassurance

## Future Enhancements

- SMS/Email notifications to doctors
- Multiple alert escalation levels
- Patient medical history timeline
- Doctor-patient messaging integration
- Appointment scheduling from alerts
- Export alert reports
- Analytics dashboard for trends

## Troubleshooting

### Alerts Not Appearing on Doctor Dashboard

1. Check doctor has logged in (token in localStorage)
2. Verify Socket.IO connection (check browser console)
3. Confirm patient prediction returned 1 (high risk)
4. Check MongoDB alert collection

### Symptoms Not Triggering Alerts

1. Verify ML service is running (if used)
2. Check fallback thresholds in predictController
3. Confirm patient has valid patientId
4. Check doctor specialties match symptoms

### Socket.IO Connection Issues

1. Check VITE_BACKEND_URL is correct
2. Verify CORS settings on server
3. Check Socket.IO server initialization in index.js
4. Look for errors in browser console

---

**Last Updated**: January 2, 2026
