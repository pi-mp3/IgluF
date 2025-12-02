/**
 * Header.tsx
 *
 * UPDATED: All pre-login buttons consistent.
 * "Crear Reunión" post-login highlighted.
 */

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { auth } from "../firebaseConfig";
import ConfirmLogoutModal from "./ConfirmLogoutModal";

export default function Header(): JSX.Element {
  const navigate = useNavigate();
  const { user, logoutFirebase, logout, loadingUser } = useAuth() as any;

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // 🔹 Lógica real de cerrar sesión
  const performLogout = async () => {
    try {
      const logoutFn =
        typeof logoutFirebase === "function"
          ? logoutFirebase
          : typeof logout === "function"
          ? logout
          : null;

      if (logoutFn) {
        await logoutFn();
      } else {
        await auth.signOut();
      }

      setIsMobileMenuOpen(false);
      navigate("/login");
    } catch (err) {
      console.error("Error al cerrar sesión:", err);
      alert("Ocurrió un error al cerrar sesión.");
    } finally {
      setShowLogoutConfirm(false);
    }
  };

  // 🔹 Botones cuando no hay sesión
  const PublicNavButtons = () => (
    <>
      <button
        type="button"
        className="btn-pill btn-pill--outline"
        onClick={() => {
          navigate("/about-us");
          setIsMobileMenuOpen(false);
        }}
      >
        Sobre Nosotros
      </button>
      <button
        type="button"
        className="btn-pill btn-pill--primary"
        onClick={() => {
          navigate("/login");
          setIsMobileMenuOpen(false);
        }}
      >
        Iniciar Sesión
      </button>
      <button
        type="button"
        className="btn-pill btn-pill--outline"
        onClick={() => {
          navigate("/register");
          setIsMobileMenuOpen(false);
        }}
      >
        Registrarse
      </button>
    </>
  );

  // 🔹 Botones cuando SÍ hay sesión
  const PrivateNavButtons = () => (
    <>
      <button
        type="button"
        className="btn-pill btn-pill--outline"
        onClick={() => {
          navigate("/dashboard");
          setIsMobileMenuOpen(false);
        }}
      >
        Reuniones
      </button>
      <button
        type="button"
        className="btn-pill btn-pill--outline"
        onClick={() => {
          navigate("/profile");
          setIsMobileMenuOpen(false);
        }}
      >
        Perfil
      </button>
      <button
        type="button"
        className="btn-pill btn-pill--primary"
        onClick={() => setShowLogoutConfirm(true)}
      >
        Cerrar Sesión
      </button>
    </>
  );

  return (
    <>
      <header className="header">
        <div className="header-inner">
          {/* Logo */}
          <Link to="/" className="header-logo">
            <img src="/logo.png" alt="Logo Iglú" />
            <span>Iglú</span>
          </Link>

          {/* NAV DESKTOP */}
          <nav className="header-nav header-nav--desktop">
            {loadingUser ? (
              <span className="header-loading">Cargando sesión...</span>
            ) : user ? (
              <PrivateNavButtons />
            ) : (
              <PublicNavButtons />
            )}
          </nav>

          {/* BOTÓN HAMBURGUESA (solo móvil) */}
          <button
            type="button"
            className="header-burger"
            aria-label="Abrir menú"
            aria-expanded={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>

        {/* MENÚ MÓVIL */}
        {isMobileMenuOpen && (
          <div className="header-mobile-menu">
            {loadingUser ? (
              <div className="header-mobile-item">Cargando sesión...</div>
            ) : user ? (
              <>
                <button
                  type="button"
                  className="header-mobile-item"
                  onClick={() => {
                    navigate("/dashboard");
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Reuniones
                </button>
                <button
                  type="button"
                  className="header-mobile-item"
                  onClick={() => {
                    navigate("/profile");
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Perfil
                </button>
                <button
                  type="button"
                  className="header-mobile-item header-mobile-item--danger"
                  onClick={() => setShowLogoutConfirm(true)}
                >
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="header-mobile-item"
                  onClick={() => {
                    navigate("/about-us");
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Sobre Nosotros
                </button>
                <button
                  type="button"
                  className="header-mobile-item"
                  onClick={() => {
                    navigate("/login");
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Iniciar Sesión
                </button>
                <button
                  type="button"
                  className="header-mobile-item"
                  onClick={() => {
                    navigate("/register");
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Registrarse
                </button>
              </>
            )}
          </div>
        )}
      </header>

      {/* 🔹 Modal de confirmación de logout */}
      <ConfirmLogoutModal
        open={showLogoutConfirm}
        onConfirm={performLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </>
  );
}
