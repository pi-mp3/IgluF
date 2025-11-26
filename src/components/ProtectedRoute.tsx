import React from "react";
import { Navigate } from "react-router-dom";
import { auth } from "../firebaseConfig"; // <-- así se llama en tu proyecto

interface Props {
  children: JSX.Element;
}

export default function ProtectedRoute({ children }: Props) {
  const user = auth.currentUser;

  console.log("[PROTECTED ROUTE] Usuario actual:", user);

  if (!user) {
    console.log("[PROTECTED ROUTE] Usuario NO autenticado → redirigiendo a login");
    return <Navigate to="/login" replace />;
  }

  return children;
}
