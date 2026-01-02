# Implementation Checklist & Test Cases

## ✅ What's Been Completed

### Frontend Components

- [x] **SymptomForm.jsx** - New component for symptom input
  - 12+ symptom checkboxes
  - 6 vital measurement inputs with validation
  - Form submission with error handling
  - Real-time result display (HIGH/LOW RISK)
- [x] **Sympthoms.jsx** - Updated with quick assessment button

  - Added prominent "Quick Health Assessment" link
  - Navigates to SymptomForm

- [x] **SymptomDetail.jsx** - Updated with risk assessment link

  - Green "Get Risk Assessment" button on each condition
  - Links directly to SymptomForm

- [x] **App.jsx** - Updated routing

  - Added SymptomForm component import
  - Added `/symptom-form` route

- [x] **DoctorDashboard.jsx** - Already has alert display
  - Real-time Socket.IO listening
  - Alert list with unread badges
  - Measurement details display
  - Mark as read functionality

### Backend API Endpoints

- [x] **POST /api/predict/symptoms** - NEW

  - Accepts patient symptoms + measurements
  - Calls ML service or uses fallback
  - Creates alerts if high-risk
  - Returns prediction result

- [x] **POST /api/measurements** - EXISTING

  - Saves health measurements
  - Links to patient

- [x] **GET /api/alerts** - EXISTING

  - Returns doctor's high-risk alerts
  - Supports ?riskOnly=1 filter

- [x] **GET /api/alerts/:id** - EXISTING

  - Returns single alert with details

- [x] **PATCH /api/alerts/:id/read** - EXISTING
  - Marks alert as read

### Database Collections

- [x] **measurements** - Saves vitals
- [x] **predictions** - Saves AI results
- [x] **alerts** - Stores doctor notifications
- [x] **users** - Patient & doctor accounts

### Real-Time Features

- [x] **Socket.IO Integration**
  - Doctor joins room on dashboard load
  - Alerts emitted in real-time
  - No page refresh needed

### Alert Logic

- [x] **Alert Routing**

  - Finds doctors by symptom specialty
  - Falls back to all doctors if no match
  - Creates separate alert per doctor

- [x] **Risk Detection**
  - ML-based when available
  - Rule-based fallback:
    - Systolic >= 140 → HIGH RISK
    - Heart Rate >= 100 → HIGH RISK
    - O2 Sat < 92% → HIGH RISK

---

## 📋 Test Cases

### Test Case 1: Normal Health Status

**Objective**: Low-risk patient should not generate alerts

**Steps:**

1. Login as patient
2. Go to `/symptom-form`
3. Select no symptoms or minimal symptoms
4. Enter normal measurements:
   - Systolic: 120
   - Diastolic: 80
   - Heart Rate: 72
   - Glucose: 100
   - Temperature: 37
   - O2: 98
5. Submit form

**Expected Result:**

- ✅ GREEN badge "LOW RISK"
- ✅ Message: "Your health status appears normal"
- ✅ No alerts created
- ✅ Doctor dashboard shows NO new alerts

---

### Test Case 2: High-Risk Scenario

**Objective**: High-risk patient generates alerts to specialists

**Steps:**

1. Login as patient (who reported symptoms like "Cardiology" as specialty)
2. Go to `/symptom-form`
3. Select high-risk symptoms:
   - Chest Pain ✓
   - Shortness of Breath ✓
   - Heart Palpitations ✓
4. Enter concerning measurements:
   - Systolic: 155
   - Diastolic: 98
   - Heart Rate: 115
   - Glucose: 140
   - Temperature: 37.2
   - O2: 94
5. Submit form

**Expected Result:**

- ✅ RED badge "HIGH RISK"
- ✅ Message: "Alert has been sent to specialist doctors"
- ✅ Measurement saved to database
- ✅ Prediction saved as 1 (high-risk)
- ✅ Alerts created for cardiologists

---

### Test Case 3: Real-Time Alert Reception (Doctor)

**Objective**: Doctor receives real-time alert without page refresh

**Prerequisites:**

- Two browser windows open
- Patient window logged in as patient
- Doctor window logged in as doctor, on dashboard

**Steps:**

1. In doctor dashboard (ensure Socket.IO connected - check console)
2. Patient submits high-risk form (Test Case 2)
3. Watch doctor dashboard

**Expected Result:**

- ✅ New alert appears at TOP of alert list
- ✅ Alert has RED background (unread)
- ✅ Shows patient symptoms
- ✅ Shows HIGH RISK badge
- ✅ Displays all measurements
- ✅ No page refresh needed
- ✅ Alert received within 1-2 seconds

---

### Test Case 4: Mark Alert as Read

**Objective**: Doctor can mark alerts as read

**Steps:**

1. Doctor sees unread alert (red background)
2. Click "Mark read" button
3. Observe alert status

**Expected Result:**

- ✅ Alert background changes to GRAY
- ✅ Button changes to "Read" label
- ✅ Backend saves read status
- ✅ Alert no longer highlighted as new

---

### Test Case 5: Fallback Prediction (No ML Service)

**Objective**: System works without ML service running

**Prerequisites:**

- Stop Python ML service
- Ensure ML_ALLOW_FALLBACK=true in .env

**Steps:**

1. Patient submits with high BP:
   - Systolic: 145 (triggers fallback)
   - Other values: normal
2. Submit form

**Expected Result:**

- ✅ Form submits successfully
- ✅ Fallback prediction logic activates
- ✅ Systolic >= 140 triggers HIGH RISK
- ✅ Alerts created for doctors
- ✅ No errors in console
- ✅ Doctor receives alert via Socket.IO

---

### Test Case 6: Alert Details View

**Objective**: Doctor can view full alert details

**Steps:**

1. Doctor sees alert in list
2. Click on alert to view details
3. OR click "View Details" / alert card

**Expected Result:**

- ✅ Full patient information displayed
- ✅ All measurements visible in detail
- ✅ Symptoms clearly listed
- ✅ Timestamp shown
- ✅ Can mark as read from detail view

---

### Test Case 7: Multiple Doctors Receive Alerts

**Objective**: Alert sent to multiple doctors when symptoms match

**Prerequisites:**

- Create 2+ doctor accounts
- Set doctor specialties to include "Cardiology"

**Steps:**

1. Patient reports heart symptoms
2. Two cardiologists open dashboards
3. Patient submits high-risk form

**Expected Result:**

- ✅ Doctor 1 receives alert in real-time
- ✅ Doctor 2 receives alert in real-time
- ✅ Both see same patient/symptom data
- ✅ Separate alert documents created (one per doctor)
- ✅ Each doctor can manage independently

---

### Test Case 8: Symptom Selection Validation

**Objective**: Form requires symptom selection

**Steps:**

1. Patient goes to form
2. Skip symptom selection
3. Enter all measurements correctly
4. Try to submit

**Expected Result:**

- ✅ Form shows error: "Please select at least one symptom"
- ✅ Submit button remains disabled
- ✅ User forced to select symptoms

---

### Test Case 9: Measurement Validation

**Objective**: Form validates measurement ranges

**Steps:**

1. Patient selects symptoms
2. Enter invalid systolic: 300 (exceeds max 250)
3. Try to submit

**Expected Result:**

- ✅ Error shown: "Value must be between 50 and 250"
- ✅ Submit button disabled
- ✅ User must correct value

---

### Test Case 10: Patient History

**Objective**: All measurements are saved for history

**Steps:**

1. Patient 1 submits form 3 times
2. Access patient records in MongoDB

**Expected Result:**

- ✅ 3 measurement documents created
- ✅ 3 prediction documents created
- ✅ All linked to same patientId
- ✅ Timestamps show submission order
- ✅ Can retrieve history via API

---

## 🔍 Database Verification

### Check Measurements Collection

```javascript
db.measurements.find({ patientId: ObjectId("...") });
// Should return all vitals submitted by patient
```

### Check Predictions Collection

```javascript
db.predictions.find({ patientId: ObjectId("...") });
// Should return all predictions for patient
// prediction field should be 0 or 1
```

### Check Alerts Collection

```javascript
db.alerts.find({ doctorId: ObjectId("...") });
// Should return all alerts for doctor
// prediction = 1 for high-risk alerts
// symptoms array should contain selected symptoms
```

---

## 🐛 Troubleshooting Tests

### Issue: Alerts Not Appearing

**Test:**

1. Check patient patientId is stored in localStorage correctly
2. Log patient info: `console.log(localStorage.getItem("user"))`
3. Verify prediction returned 1 (check browser Network tab)
4. Check MongoDB: alerts collection for that doctor

**Debug:**

```bash
# Server logs should show:
# "/api/predict/symptoms received body:"
# "Created X alert(s) for doctors"
# "emitting alert to room [doctorId]"
```

### Issue: Socket.IO Not Connecting

**Test:**

1. Open browser DevTools → Console
2. Look for socket connection logs
3. Should see: "socket connected" and "socket join room"
4. Check VITE_BACKEND_URL is correct

**Debug:**

```bash
# Add to DoctorDashboard.jsx:
console.log("Socket connected:", socket.connected)
console.log("Socket ID:", socket.id)
socket.on("connect_error", (error) => console.error("Connect error:", error))
```

### Issue: ML Service Not Being Called

**Test:**

1. Add debug log in predictController:
   ```javascript
   console.log("ML alive check:", mlAlive);
   ```
2. Start ML service: `python ml/app.py`
3. Check service running: `curl http://localhost:5000/predict`
4. Check ML_HOST and ML_PORT in .env

---

## 📊 Performance Tests

### Load Test: Multiple Patients

**Steps:**

1. Simulate 10 patients submitting high-risk forms
2. Measure alert creation time
3. Check Socket.IO delivery latency

**Target:**

- Alert creation: < 500ms
- Socket delivery: < 100ms
- No dropped alerts

### Load Test: Many Alerts

**Steps:**

1. Doctor dashboard with 50+ unread alerts
2. Measure load time
3. Check UI responsiveness

**Target:**

- Page load: < 2s
- Scroll: smooth
- Mark as read: < 200ms response

---

## 🔐 Security Tests

### Authorization Test

**Steps:**

1. Patient tries to access: `GET /api/alerts` (doctor-only)
2. Should receive 401 Unauthorized

**Expected:**

- ✅ 401 response
- ✅ No alert data returned

### CORS Test

**Steps:**

1. Frontend on different port than backend
2. Submit form should work
3. Check no CORS errors

**Expected:**

- ✅ Form submits successfully
- ✅ No CORS errors in console
- ✅ Response received

---

## 📱 UI/UX Tests

### Form Responsiveness

**Test on:**

- Desktop (1920x1080)
- Tablet (768x1024)
- Mobile (375x667)

**Expected:**

- ✅ Symptom buttons stack properly
- ✅ Input fields readable
- ✅ Submit button accessible
- ✅ Results display clearly

### Alert Display

**Test:**

1. Alert with short patient name
2. Alert with long patient name
3. Alert with many symptoms

**Expected:**

- ✅ Text wraps properly
- ✅ Measurements display in grid
- ✅ No UI overlap
- ✅ Read/unread badge visible

---

## ✅ Acceptance Criteria

All of the following should be true:

- [ ] Patient can select symptoms from form
- [ ] Patient can enter health measurements
- [ ] Form validates all inputs
- [ ] Patient sees risk assessment result immediately
- [ ] HIGH RISK shows red badge
- [ ] LOW RISK shows green badge
- [ ] High-risk alerts are created in database
- [ ] Alerts are sent to appropriate doctors
- [ ] Doctors receive real-time Socket.IO notifications
- [ ] Doctor dashboard displays alerts without page refresh
- [ ] Alerts show patient name, symptoms, and measurements
- [ ] Doctor can mark alert as read
- [ ] Read status persists in database
- [ ] All measurements are saved for history
- [ ] System works without ML service (fallback enabled)
- [ ] Multiple doctors can be alerted for same event
- [ ] No console errors during operation
- [ ] API response times under 1 second
- [ ] UI is responsive on mobile/tablet/desktop
- [ ] Socket.IO connection is stable and persistent

---

## 🚀 Deployment Checklist

Before going to production:

- [ ] All test cases pass
- [ ] No console errors
- [ ] Environment variables set correctly
- [ ] Database indexes created (optional but recommended)
- [ ] ML service running or fallback enabled
- [ ] CORS configured correctly
- [ ] SSL/HTTPS enabled
- [ ] Socket.IO configured for production
- [ ] Error handling tested
- [ ] Logging configured
- [ ] Database backup set up
- [ ] Rate limiting configured (optional)
- [ ] User authentication working
- [ ] Role-based access control verified

---

**Created**: January 2, 2026
**Last Updated**: January 2, 2026
