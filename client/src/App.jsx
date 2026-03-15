import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import Home from "./components/Home";
import RootLayout from "./Layout/RootLayout";
import About from "./components/About";
import "./App.css";
import React from "react";
import Register from "./components/Register";
import Login from "./components/Login";
import PatientDashboardForm from "./components/PatientDashboardForm";
import PatientDashboard from "./components/PatientDashboard";
import DoctorDashboard from "./components/DoctorDashboard";
import AdminDashboard from "./components/AdminDashboard";
import Appointment from "./components/Appointment";
import BookAppointment from "./components/BookAppointment";
import Sympthoms from "./components/Sympthoms";
import SymptomDetail from "./components/SymptomDetail";
import SymptomAction from "./components/SymptomAction";
import Diabetics from "./components/Sympthoms/DiabeticsForm";
import Asthma from "./components/Sympthoms/Asethma";
import HypertensionForm from "./components/Sympthoms/HypertentionForm";
import Chat from "./Chat";
import Contact from "./pages/Contact";
import Hospital from "./pages/HospitalCare";
import Doctors from "./pages/Doctors";
import Messages from "./components/Messages";
import Settings from "./components/Settings";
function App() {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<RootLayout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="hospital" element={<Hospital />} />
        <Route path="doctor" element={<Doctors />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="patientDashboardForm" element={<PatientDashboardForm />} />
        <Route path="patientDashboard" element={<PatientDashboard />} />
        <Route path="doctorDashboard" element={<DoctorDashboard />} />
        <Route path="adminDashboard" element={<AdminDashboard />} />
        <Route path="appointment" element={<Appointment />} />
        <Route path="book-appointment" element={<BookAppointment />} />
        <Route path="Sympthoms" element={<Sympthoms />} />
        <Route path="Sympthoms/:id" element={<SymptomDetail />} />
        <Route path="Sympthoms/action/:id" element={<SymptomAction />} />
        <Route path="Diabetics" element={<Diabetics />} />
        <Route path="asthma" element={<Asthma />} />
        <Route path="hypertension" element={<HypertensionForm />} />
        <Route path="chat" element={<Chat />} />
        <Route path="contact" element={<Contact />} />
        <Route path="messages" element={<Messages />} />
        <Route path="settings" element={<Settings />} />
      </Route>,
    ),
  );
  return <RouterProvider router={router} />;
}

export default App;
