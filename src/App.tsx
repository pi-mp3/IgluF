// src/App.tsx
// -----------------------------------------------------------
// Este archivo controla todas las rutas de la aplicación,
// mostrando u ocultando el Header y Footer según la página.
// Incluye rutas públicas y protegidas.
// -----------------------------------------------------------

import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";

/* ---------------------------------------------------------
 * COMPONENTES PRINCIPALES
 * --------------------------------------------------------- */
import Header from "./components/Header";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

/* ---------------------------------------------------------
 * PÁGINAS
 * --------------------------------------------------------- */
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Profile from "./pages/Profile";
import DashboardPage from "./pages/Dashboard";
import MeetingPage from "./pages/MeetingRoom";
import AboutUs from "./pages/AboutUs";
import OAuthCallback from "./pages/OAuthCallback";

/* ---------------------------------------------------------
 * APP PRINCIPAL
 * --------------------------------------------------------- */
export default function App(): JSX.Element {
  const location = useLocation();

  // Ocultar header en páginas especiales
  const hideHeader =
    location.pathname.startsWith("/forgot-password") ||
    location.pathname.startsWith("/reset-password");

  // Ocultar footer cuando estás en una reunión
  const isMeetingRoute = location.pathname.startsWith("/meeting");

  return (
    <div className="min-h-screen flex flex-col bg-white text-black">

      {/* ---------------------------------------------------
       * HEADER
       * Se oculta solo en las páginas de recuperación de contraseña.
       * --------------------------------------------------- */}
      {!hideHeader && <Header />}

      {/* ---------------------------------------------------
       * CUERPO DE LA APLICACIÓN
       * --------------------------------------------------- */}
      <main className="flex-1">
        <Routes>

          {/* -----------------------------------------------
           * RUTAS PÚBLICAS
           * ----------------------------------------------- */}
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/auth/google/callback" element={<OAuthCallback />} />


          {/* -----------------------------------------------
           * RUTAS PROTEGIDAS
           * ----------------------------------------------- */}
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

      {/* ---------------------------------------------------
       * FOOTER
       * No se muestra en las reuniones porque ocupan pantalla completa.
       * --------------------------------------------------- */}
      {!isMeetingRoute && <Footer />}
    </div>
  );
}
