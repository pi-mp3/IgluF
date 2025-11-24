import React from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import { Routes, Route, useLocation } from 'react-router-dom';

import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Profile from './pages/Profile';
import DashboardPage from './pages/Dashboard';
import MeetingPage from './pages/MeetingRoom'; // o como se llame tu componente de reunión

export default function App() {
  const location = useLocation();

  // true cuando estás en /meeting/ALGO
  const isMeetingRoute = location.pathname.startsWith('/meeting');

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* El contenido ocupa el resto de la pantalla */}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/profile" element={<Profile />} />

          {/* Ruta de reunión */}
          <Route path="/meeting/:id" element={<MeetingPage />} />
        </Routes>
      </main>

      {/* ❌ NO mostrar footer en la vista de reunión */}
      {!isMeetingRoute && <Footer />}
    </div>
  );
}
