# Remote Patient Monitoring System

A full-stack MERN (MongoDB, Express.js, React, Node.js) application for remote patient monitoring. This project allows patients and doctors to interact, manage appointments, and monitor health data remotely.

## Features

- **User Authentication:** Secure login and registration for patients and doctors.
- **Patient Dashboard:** Patients can view and update their health data, book appointments, and see their appointment history.
- **Doctor Dashboard:** Doctors can view patient information, manage appointments, and monitor patient health data.
- **Appointment Management:** Patients can book appointments; doctors can approve or manage them.
- **Responsive UI:** Modern, responsive interface built with React and Vite.

## Project Structure

```
remote_patient_monitoring_system/
│
├── client/                # Frontend React application
│   ├── src/
│   │   ├── components/    # React components (Home, Login, Register, Dashboard, etc.)
│   │   ├── Layout/        # Layout components
│   │   ├── assets/        # Images and static assets
│   │   ├── App.jsx        # Main App component
│   │   └── main.jsx       # Entry point
│   ├── public/            # Static files
│   ├── package.json       # Frontend dependencies
│   └── vite.config.js     # Vite configuration
│
├── server/                # Backend Node.js/Express application
│   ├── model/             # Mongoose models (User.js, etc.)
│   ├── middleware/        # Express middleware
│   ├── index.js           # Entry point for Express server
│   └── package.json       # Backend dependencies
│
└── README.md              # Project documentation
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
