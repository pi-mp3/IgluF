// src/App.tsx
// -----------------------------------------------------------
// Control central de rutas de la aplicación.
// Define qué pantallas muestran Header/Footer y administra
// las rutas públicas, privadas y el callback OAuth unificado.
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
import OAuthCallback from "./pages/OAuthCallback"; // <-- Maneja Google/GitHub callback

/* ---------------------------------------------------------
 * APP PRINCIPAL
 * --------------------------------------------------------- */
export default function App(): JSX.Element {
  const location = useLocation();

  // Ocultar header en pantallas de recuperación
  const hideHeader =
    location.pathname.startsWith("/forgot-password") ||
    location.pathname.startsWith("/reset-password");

  // No mostrar footer en modo reunión (pantalla completa)
  const isMeetingRoute = location.pathname.startsWith("/meeting");

  return (
    <div className="min-h-screen flex flex-col bg-white text-black">

      {/* ---------------------------------------------------
       * HEADER (oculto solo en recuperación de contraseña)
       * --------------------------------------------------- */}
      {!hideHeader && <Header />}

      {/* ---------------------------------------------------
       * CUERPO PRINCIPAL
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

          {/* -------------------------------------------------------
           * RUTA ÚNICA DE CALLBACK PARA GOOGLE / GITHUB / FIREBASE
           * Captura token y uid y redirige automáticamente
           * ------------------------------------------------------- */}
          <Route path="/auth/success" element={<OAuthCallback />} />

          {/* -----------------------------------------------
           * RUTAS PRIVADAS (requieren sesión activa)
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
       * FOOTER (oculto en reuniones)
       * --------------------------------------------------- */}
      {!isMeetingRoute && <Footer />}

    </div>
  );
}
