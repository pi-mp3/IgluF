// src/pages/ResetPassword.tsx
/**
 * ResetPassword.tsx
 *
 * Component that allows the user to set a new password after clicking the
 * reset link sent by Firebase Auth. It extracts the "oobCode" (reset token)
 * from the URL query parameters and confirms the new password with Firebase.
 *
 * - Backend NOT required.
 * - Documentation: English
 * - UI Text: Spanish
 */

import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { confirmPasswordReset } from "firebase/auth";
import { auth } from "../firebaseConfig";
import translations from "../i18n/es.json";

export default function ResetPassword(): JSX.Element {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Firebase sends the reset token as "oobCode"
  const oobCode = searchParams.get("oobCode") || "";

  const [password, setPassword] = useState<string>("");
  const [confirm, setConfirm] = useState<string>("");
  const [done, setDone] = useState<boolean>(false);

  /**
   * Handles form submission:
   * - Validates passwords
   * - Confirms reset using Firebase "confirmPasswordReset"
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!oobCode) {
      alert("El enlace no es válido o ha expirado.");
      return;
    }

    if (password.length < 6) {
      alert(translations.resetPassword.errors.minLength);
      return;
    }

    if (password !== confirm) {
      alert(translations.resetPassword.errors.mismatch);
      return;
    }

    try {
      // Firebase resets the password using the oobCode
      await confirmPasswordReset(auth, oobCode, password);

      setDone(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      alert(translations.resetPassword.errors.resetFailed);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-wrapper">
        <h1 className="auth-title">{translations.resetPassword.title}</h1>
        <p className="auth-subtitle">{translations.resetPassword.subtitle}</p>

        <div className="auth-card">
          {!done ? (
            <form onSubmit={handleSubmit}>
              <label className="auth-label">
                {translations.resetPassword.newPassword}
                <div className="auth-input-wrapper">
                  <span className="auth-input-icon">🔒</span>
                  <input
                    type="password"
                    className="auth-input"
                    placeholder="••••••••"
                    minLength={6}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </label>

              <label className="auth-label">
                {translations.resetPassword.confirmPassword}
                <div className="auth-input-wrapper">
                  <span className="auth-input-icon">🔒</span>
                  <input
                    type="password"
                    className="auth-input"
                    placeholder="••••••••"
                    minLength={6}
                    required
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                  />
                </div>
              </label>

              <button
                type="submit"
                className="auth-submit"
                style={{ marginTop: "1.5rem" }}
              >
                {translations.resetPassword.saveButton}
              </button>

              <p className="auth-bottom-text">
                <button
                  type="button"
                  className="auth-link"
                  onClick={() => navigate("/login")}
                >
                  {translations.resetPassword.backToLogin}
                </button>
              </p>
            </form>
          ) : (
            <div className="text-center py-6">
              <p className="text-green-600 font-semibold text-lg">
                {translations.resetPassword.success}
              </p>
              <p className="text-gray-600 mt-1 text-sm">
                {translations.resetPassword.redirecting}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
