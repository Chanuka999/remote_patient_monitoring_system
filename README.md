# Remote Patient Monitoring System

A full-stack MERN (MongoDB, Express.js, React, Node.js) application for remote patient monitoring. This project allows patients and doctors to interact, manage appointments, monitor health data, and automatically alert specialists when high-risk conditions are detected.

## ✨ Key Features

### Patient Features

- **User Authentication:** Secure login and registration for patients
- **Symptom Reporting:** Report symptoms with 12+ common health conditions
- **Health Measurements:** Track vital signs (BP, HR, glucose, temperature, O2, etc.)
- **Risk Assessment:** AI-powered instant risk prediction (High/Low)
- **Patient Dashboard:** View and update health data, book appointments
- **Appointment Management:** Schedule appointments with doctors

### Doctor Features

- **Real-Time Alerts:** Receive instant notifications when patients report high-risk conditions
- **Alert Dashboard:** View all high-risk patient alerts without page refresh
- **Patient Details:** See patient symptoms and health measurements
- **Measurement Tracking:** Access patient's full measurement history
- **Alert Management:** Mark alerts as read/unread, take action
- **Doctor Dashboard:** Monitor assigned patients and appointments

### System Features

- **AI-Powered Predictions:** ML-based risk assessment with rule-based fallback
- **Real-Time Notifications:** Socket.IO instant alert delivery to doctors
- **Automatic Alert Routing:** Alerts sent to specialist doctors based on symptoms
- **Responsive UI:** Modern, responsive interface built with React and Vite
- **Comprehensive Logging:** Track all patient measurements and predictions

## 📚 Documentation

### Getting Started

- [QUICK_START.md](QUICK_START.md) - Setup and basic usage guide

### Technical Documentation

- [SYMPTOM_ALERT_FLOW.md](SYMPTOM_ALERT_FLOW.md) - Complete feature documentation
- [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture and data flow diagrams
- [TEST_CASES.md](TEST_CASES.md) - Testing checklist and test scenarios

## Project Structure

```
remote_patient_monitoring_system/
│
├── client/                # Frontend React application
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── SymptomForm.jsx        # NEW: Patient symptom input form
│   │   │   ├── Sympthoms.jsx          # UPDATED: Symptom browse page
│   │   │   ├── SymptomDetail.jsx      # UPDATED: Symptom details
│   │   │   ├── DoctorDashboard.jsx    # ENHANCED: Real-time alerts display
│   │   │   ├── PatientDashboard.jsx   # Patient dashboard
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── ...
│   │   ├── Layout/        # Layout components
│   │   ├── assets/        # Images and static assets
│   │   ├── App.jsx        # Main App component (updated routing)
│   │   └── main.jsx       # Entry point
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── server/                # Backend Node.js/Express application
│   ├── controllers/
│   │   ├── predictController.js      # UPDATED: Added predictFromSymptoms()
│   │   ├── alertController.js        # Alert management
│   │   ├── userController.js
│   │   ├── healthController.js
│   │   └── ...
│   ├── models/            # Mongoose schemas
│   │   ├── Measurement.js
│   │   ├── Prediction.js
│   │   ├── Alert.js
│   │   ├── User.js
│   │   └── ...
│   ├── routes/
│   │   ├── predictRouter.js          # UPDATED: Added /predict/symptoms
│   │   ├── alertRouter.js
│   │   └── ...
│   ├── lib/
│   │   ├── db.js          # Database connection
│   │   └── socket.js      # Socket.IO setup
│   ├── index.js           # Express server entry point
│   └── package.json
│
├── ml/                    # Python ML service (optional)
│   ├── app.py
│   ├── requirements.txt
│   └── ...
│
├── QUICK_START.md         # Quick setup guide
├── SYMPTOM_ALERT_FLOW.md  # Feature documentation
├── ARCHITECTURE.md        # System architecture
├── TEST_CASES.md          # Test cases and verification
└── README.md              # This file
```

## Getting Started

### Prerequisites

- Node.js (v16 or above recommended)
- npm or yarn
- MongoDB (local or cloud instance)

### Installation

1. **Clone the repository:**

   ```sh
   git clone https://github.com/Chanuka999/remote_patient_monitoring_system.git
   cd remote_patient_monitoring_system
   ```

2. **Install server dependencies:**

   ```sh
   cd server
   npm install
   ```

3. **Install client dependencies:**

   ```sh
   cd ../client
   npm install
   ```

4. **Set up environment variables:**

   - Create a `.env` file in the `server` directory with the following variables:
     ```env
     MONGO_URI=your_mongodb_connection_string
     JWT_SECRET=your_jwt_secret
     PORT=5000
     ```

   ### Chatbot / API key security

   If you plan to use a third-party chat/LLM provider, do NOT put secret API keys in `client/.env` (they become public). Instead:

   1. Create `server/.env` (do not commit this file) and add your chat API configuration, for example:

   ```env
   API_CHAT_URL=https://generativelanguage.googleapis.com/v1/models/gemini-2.5-pro:generateContent?key=YOUR_KEY
   # or separate key
   API_CHAT_URL=https://generativelanguage.googleapis.com/v1/models/gemini-2.5-pro:generateContent
   API_CHAT_KEY=YOUR_SECRET_KEY
   ```

   2. Restart the backend. The frontend will call the server proxy endpoint `/api/chat`, which forwards requests to the configured API without exposing secrets to the browser.

   3. Remove any keys from `client/.env` and rotate keys if they were previously leaked.

5. **Start the backend server:**

   ```sh
   cd server
   npm start
   ```

6. **Start the frontend app:**

   ```sh
   cd client
   npm run dev
   ```

7. **Access the app:**
   - Frontend: [http://localhost:5173](http://localhost:5173)
   - Backend API: [http://localhost:5000](http://localhost:5000)

## Technologies Used

- **Frontend:** React, Vite, CSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB, Mongoose
- **Authentication:** JWT (jsonwebtoken)

## Folder Details

### client/src/components

- `Home.jsx`, `About.jsx`, `Feature.jsx`, `Solution.jsx`: Landing and info pages
- `Login.jsx`, `Register.jsx`: Authentication
- `PatientDashboard.jsx`, `PatientDashboardForm.jsx`: Patient features
- `DoctorDashboard.jsx`: Doctor features
- `Appointment.jsx`: Appointment management
- `Navbar.jsx`, `Footer.jsx`: Layout

### server/model

- `User.js`: Mongoose schema for users (patients/doctors)

### server/middleware

- Custom Express middleware (e.g., authentication)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Open a pull request

## License

This project is licensed under the MIT License.

## Author

- [Chanuka999](https://github.com/Chanuka999)

## ML API (FastAPI) — how to run

This project contains a small FastAPI wrapper for the ML models in `ml/` that can be called from the React client.

1. Create a Python virtual environment and install dependencies (Windows PowerShell):

```powershell
python -m venv .venv; .\.venv\Scripts\Activate.ps1; pip install -r ml/requirements.txt
```

2. Run the ML API from the project root:

```powershell
python -m ml.app
```

The API listens on http://localhost:8000 by default. The React form in `client/src/components/PatientDashboardForm.jsx` posts to `http://localhost:8000/predict`.

If the pickle files `h.pickle` or `brest_cancer.pickle` are missing from `ml/`, prediction endpoints will return an error explaining that the model isn't available.
