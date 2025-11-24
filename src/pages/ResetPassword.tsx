// src/pages/ResetPassword.tsx
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { resetPassword } from "./api";

/**
 * Component for resetting the user's password.
 * Reads a token from the URL query params, allows the user to enter
 * a new password and confirmation, and calls the API to reset it.
 *
 * After a successful password reset, shows a confirmation message
 * and then redirects the user to the login page.
 *
 * @component
 * @returns {JSX.Element} The password reset form or confirmation UI.
 */
export default function ResetPassword(): JSX.Element {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  /** The new password entered by the user. */
  const [password, setPassword] = useState<string>("");

  /** The password confirmation entered by the user. */
  const [confirm, setConfirm] = useState<string>("");

  /** Boolean for whether the password has been successfully reset. */
  const [done, setDone] = useState<boolean>(false);

  /**
   * Handle the form submission for resetting the password.
   * Validates that the password is at least 6 characters and matches the confirmation.
   * Calls the `resetPassword` API function with the token and new password.
   * Shows an alert if there's an error, or marks the reset as done and redirects.
   *
   * @param {React.FormEvent<HTMLFormElement>} e - The form submission event.
   * @returns {Promise<void>}
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    // Validate minimum length
    if (password.length < 6) {
      alert("The password must be at least 6 characters.");
      return;
    }

    // Validate confirmation
    if (password !== confirm) {
      alert("The passwords do not match.");
      return;
    }

    try {
      // Call API to reset the password using token
      await resetPassword(token, password);
      setDone(true);

      // Redirect to login after short delay
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err: any) {
      alert(err.message || "Error resetting password");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-wrapper">
        <h1 className="auth-title">Set New Password</h1>
        <p className="auth-subtitle">
          Enter a new secure password for your account.
        </p>

        <div className="auth-card">
          {!done ? (
            <form onSubmit={handleSubmit}>
              {/* New password */}
              <label className="auth-label">
                New Password
                <div className="auth-input-wrapper">
                  <span className="auth-input-icon">🔒</span>
                  <input
                    className="auth-input"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={6}
                    required
                  />
                </div>
              </label>

              {/* Confirm password */}
              <label className="auth-label">
                Confirm Password
                <div className="auth-input-wrapper">
                  <span className="auth-input-icon">🔒</span>
                  <input
                    className="auth-input"
                    type="password"
                    placeholder="••••••••"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    minLength={6}
                    required
                  />
                </div>
              </label>

              {/* Submit button */}
              <button
                type="submit"
                className="auth-submit"
                style={{ marginTop: "1.5rem" }}
              >
                Save Password
              </button>

              {/* Back to login link */}
              <p className="auth-bottom-text">
                <button
                  type="button"
                  className="auth-link"
                  onClick={() => navigate("/login")}
                >
                  ← Back to Login
                </button>
              </p>
            </form>
          ) : (
            <div className="text-center py-6">
              <p className="text-green-600 font-semibold text-lg">
                ✔ Password updated
              </p>
              <p className="text-gray-600 mt-1 text-sm">
                Redirecting to login...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

