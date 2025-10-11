import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import Home from "./components/Home";
import RootLayout from "./Layout/Rootlayout";
import Feature from "./components/Feature";
import About from "./components/About";
import "./App.css";
import React from "react";
import Register from "./components/Register";
import Login from "./components/Login";
import PatientDashboardForm from "./components/PatientDashboardForm";
import PatientDashboard from "./components/PatientDashboard";
import DoctorDashboard from "./components/DoctorDashboard";
import Appointment from "./components/Appointment";
import Sympthoms from "./components/Sympthoms";
import SymptomDetail from "./components/SymptomDetail";
import SymptomAction from "./components/SymptomAction";
import Diabetics from "./components/Sympthoms/DiabeticsForm";
import Asthma from "./components/Sympthoms/Asethma";
import HypertensionForm from "./components/Sympthoms/HypertentionForm";
import Chat from "./Chat";

function App() {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        <Route path="/" element={<RootLayout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="feature" element={<Feature />} />

          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route
            path="patientDashboardForm"
            element={<PatientDashboardForm />}
          />
          <Route path="patientDashboard" element={<PatientDashboard />} />
          <Route path="doctorDashboard" element={<DoctorDashboard />} />
          <Route path="appointment" element={<Appointment />} />
          <Route path="Sympthoms" element={<Sympthoms />} />
          <Route path="Sympthoms/:id" element={<SymptomDetail />} />
          <Route path="Sympthoms/action/:id" element={<SymptomAction />} />
          <Route path="Diabetics" element={<Diabetics />} />
          <Route path="asthma" element={<Asthma />} />
          <Route path="hypertension" element={<HypertensionForm />} />
          <Route path="chat" element={<Chat />} />
        </Route>
      </>
    )
  );
  return <RouterProvider router={router} />;
}

export default App;
