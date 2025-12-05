/**
 * ProtectedRoute.tsx
 *
 * Route protection component.
 * Blocks access to private routes if the user is not authenticated.
 * Authentication is validated using the global AuthContext.
 */

import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface Props {
  children: JSX.Element;
}

export default function ProtectedRoute({ children }: Props): JSX.Element {
  const { user, loading } = useAuth();
  const location = useLocation();

  // While auth state is loading, avoid redirecting
  if (loading) {
    return null; // You may place a spinner here if needed
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}

