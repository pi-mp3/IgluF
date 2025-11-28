// src/App.tsx
import React from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { Routes, Route, useLocation } from "react-router-dom";

import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Profile from "./pages/Profile";
import DashboardPage from "./pages/Dashboard";
import MeetingPage from "./pages/MeetingRoom";
import AboutUs from "./pages/AboutUs";

import ProtectedRoute from "./components/ProtectedRoute";

export default function App(): JSX.Element {
  const location = useLocation();

  const hideHeader =
    location.pathname.startsWith("/forgot-password") ||
    location.pathname.startsWith("/reset-password");

  const hideFooter = location.pathname.startsWith("/meeting");

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header solo si NO estamos en recuperación de contraseña */}
      {!hideHeader && <Header />}

      <main className="flex-1">
        <Routes>
          {/* públicas */}
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/about-us" element={<AboutUs />} />

          {/* protegidas */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/meeting/:id"
            element={
              <ProtectedRoute>
                <MeetingPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>

      {/* footer: ocultar en reuniones */}
      {!hideFooter && <Footer />}
    </div>
  );
}
