import React from 'react'
import Header from './components/Header'
import Footer from './components/Footer'
import { Routes, Route } from "react-router-dom";

import Home from './pages/Home'
import Register from './pages/Register'
import Login from "./pages/Login";
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from "./pages/ResetPassword";

export default function App(){
  return (
    <div className="min-h-screen flex flex-col">

      <Header />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

        </Routes>
      </main>

      <Footer />
    </div>
  );
}
