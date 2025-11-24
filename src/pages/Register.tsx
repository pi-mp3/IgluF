import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

/**
 * Modal component to display Terms & Conditions.
 *
 * @param props - Props for the modal.
 * @param props.isOpen - Whether the modal is visible.
 * @param props.onClose - Callback to close the modal.
 * @returns The modal JSX or null if not open.
 */
function TermsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        padding: '1rem',
      }}
    >
      <div
        style={{
          background: 'white',
          padding: '2rem',
          maxWidth: '480px',
          width: '100%',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
          maxHeight: '80vh',
          overflowY: 'auto',
          position: 'relative',
        }}
      >
        <h2 style={{ marginTop: 0 }}>Términos y Condiciones</h2>
        <p>
          Este entorno es una plataforma de carácter académico y experimental, diseñada para fines formativos solamente. Su uso no pretende generar beneficios comerciales ni ser parte de un producto final.
        </p>
        <p>
          Los datos que los usuarios ingresan (como su nombre, correo, progreso, respuestas, etc.) se recolectan exclusivamente para propósitos educativos, de prueba y análisis interno.
        </p>
        <p>
          Estos datos <strong>no serán utilizados con fines comerciales</strong>, publicitarios ni serán vendidos a terceros. La información puede usarse para mejorar la plataforma, corregir errores, agregar funcionalidades y evaluar el rendimiento académico de forma anónima.
        </p>
        <p>
          Respetamos la privacidad de cada usuario. Toda la información personal se maneja con responsabilidad dentro del marco de este proyecto académico. No compartiremos tus datos con entidades externas para ningún otro fin distinto al formativo, salvo que sea necesario para cumplir con obligaciones legales o de seguridad.
        </p>
        <p>
          La plataforma se ofrece “tal cual” (as is). No garantizamos que estará libre de errores ni de interrupciones. No somos responsables por decisiones que tomes con base en la información o resultados obtenidos en este entorno, ya que es una herramienta de simulación / prueba.
        </p>
        <p>
          Al registrarte y usar esta plataforma, aceptas explícitamente estos términos y condiciones. Si no estás de acuerdo con alguna parte, por favor no continúes con el registro.
        </p>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'none',
            border: 'none',
            fontSize: '1.4rem',
            cursor: 'pointer',
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
}

/**
 * Registration form component for creating a new user account.
 * Handles form submission, password confirmation, and terms acceptance.
 *
 * @component
 * @returns {JSX.Element} - The registration page UI.
 */
export default function Register(): JSX.Element {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    age: '',
    email: '',
    password: '',
  });
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [acceptTerms, setAcceptTerms] = useState<boolean>(false);

  const [message, setMessage] = useState<string | null>(null);
  const [isTermsOpen, setIsTermsOpen] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value, checked } = e.target;
    if (name === 'confirmPassword') {
      setConfirmPassword(value);
    } else if (name === 'acceptTerms') {
      setAcceptTerms(checked);
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    if (form.password !== confirmPassword) {
      alert(t('register.passwordMismatch'));
      return;
    }

    if (!acceptTerms) {
      alert(t('register.mustAcceptTerms'));
      return;
    }

    try {
      const payload = { ...form, age: Number(form.age) };
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error en el registro');
      }

      setMessage('Registro exitoso');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (error: any) {
      console.error('Register error:', error);
      setMessage(error.message);
    }
  };

  return (
    <div
      className="auth-page"
      style={{
        position: 'relative',
        padding: '1rem',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <div
        className="auth-wrapper"
        style={{
          maxWidth: '500px',
          width: '100%',
          margin: '0 auto',
        }}
      >
        <h1 className="auth-title">{t('register.createAccount')}</h1>
        <p className="auth-subtitle">{t('register.fillForm')}</p>

        <form className="auth-card" onSubmit={handleSubmit}>
          <label className="auth-label">
            {t('register.firstName')}
            <div className="auth-input-wrapper">
              <input
                className="auth-input"
                type="text"
                name="firstName"
                placeholder={t('register.placeholderFirstName')}
                value={form.firstName}
                onChange={handleChange}
                required
              />
            </div>
          </label>

          <label className="auth-label">
            {t('register.lastName')}
            <div className="auth-input-wrapper">
              <input
                className="auth-input"
                type="text"
                name="lastName"
                placeholder={t('register.placeholderLastName')}
                value={form.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </label>

          <label className="auth-label">
            {t('register.age')}
            <div className="auth-input-wrapper">
              <input
                className="auth-input"
                type="number"
                name="age"
                placeholder={t('register.placeholderAge')}
                value={form.age}
                onChange={handleChange}
                required
              />
            </div>
          </label>

          <label className="auth-label">
            {t('register.email')}
            <div className="auth-input-wrapper">
              <span className="auth-input-icon">@</span>
              <input
                className="auth-input"
                type="email"
                name="email"
                placeholder={t('register.placeholderEmail')}
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
          </label>

          <label className="auth-label">
            {t('register.password')}
            <div className="auth-input-wrapper">
              <span className="auth-input-icon">🔒</span>
              <input
                className="auth-input"
                type="password"
                name="password"
                placeholder={t('register.placeholderPassword')}
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>
          </label>

          <label className="auth-label">
            {t('register.confirmPassword')}
            <div className="auth-input-wrapper">
              <span className="auth-input-icon">🔒</span>
              <input
                className="auth-input"
                type="password"
                name="confirmPassword"
                placeholder={t('register.placeholderConfirmPassword')}
                value={confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
          </label>

          <div className="auth-terms-wrapper">
            <label className="auth-terms" style={{ display: 'flex', alignItems: 'center' }}>
              <input
                type="checkbox"
                name="acceptTerms"
                checked={acceptTerms}
                onChange={handleChange}
                style={{ marginRight: '0.5rem' }}
              />
              <span>
                {t('register.acceptTerms')}{' '}
                <button
                  type="button"
                  onClick={() => setIsTermsOpen(true)}
                  style={{
                    textDecoration: 'underline',
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    color: '#05668D',
                    cursor: 'pointer',
                  }}
                >
                  {t('register.termsAndConditions')}
                </button>
              </span>
            </label>
          </div>

          <button type="submit" className="auth-submit" style={{ marginTop: '1rem' }}>
            {t('register.registerButton')}
          </button>

          <p className="auth-bottom-text" style={{ marginTop: '1rem' }}>
            {t('register.alreadyHaveAccount')}{' '}
            <button
              type="button"
              className="auth-link"
              onClick={() => navigate('/login')}
              style={{ background: 'none', border: 'none', padding: 0, color: '#05668D', cursor: 'pointer' }}
            >
              {t('register.login')}
            </button>
          </p>
        </form>

        {message && (
          <div
            className="simple-message"
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              backgroundColor: message === 'Registro exitoso' ? '#d4edda' : '#f8d7da',
              color: message === 'Registro exitoso' ? '#155724' : '#721c24',
              borderRadius: '4px',
              textAlign: 'center',
            }}
          >
            {message}
          </div>
        )}
      </div>

      <TermsModal isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} />
    </div>
  );
}
