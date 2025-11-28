// src/components/ProtectedRoute.tsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface Props {
  children: JSX.Element;
}

export default function ProtectedRoute({ children }: Props): JSX.Element {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Mientras Firebase responde, no redirigimos
  if (loading) {
    return null; // aquí podrías poner un spinner si quieres
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
