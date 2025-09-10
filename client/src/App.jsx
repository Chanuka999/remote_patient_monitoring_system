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
function App() {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        <Route path="/" element={<RootLayout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="feature" element={<Feature />} />
        </Route>
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="patientDashboardForm" element={<PatientDashboardForm />} />
        <Route path="patientDashboard" element={<PatientDashboard />} />
      </>
    )
  );
  return <RouterProvider router={router} />;
}

export default App;
