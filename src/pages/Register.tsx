import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

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
          maxWidth: '500px',
          width: '100%',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          maxHeight: '80vh',
          overflowY: 'auto',
          position: 'relative',
        }}
      >
        <h2 style={{ marginTop: 0 }}>Términos & Condiciones</h2>
        <p>
          Esta plataforma es de carácter académico y experimental, creada únicamente con fines educativos. 
          No está diseñada para uso comercial ni como parte de un producto final.
        </p>
        <p>
          Los datos que ingreses (nombre, correo electrónico, progreso, respuestas, etc.) se recopilan exclusivamente con fines educativos, de prueba y para análisis internos.
        </p>
        <p>
          Esta información <strong>no se utilizará con fines comerciales</strong>, no se empleará para publicidad y no se venderá a terceros. 
          Se puede usar para mejorar la plataforma, corregir errores, agregar funcionalidades y evaluar el desempeño académico de manera anónima.
        </p>
        <p>
          Respetamos tu privacidad. Tu información personal se maneja de manera responsable dentro del alcance de este proyecto académico. 
          No compartiremos tus datos fuera de la plataforma, salvo para cumplir con obligaciones legales o de seguridad.
        </p>
        <p>
          La plataforma se proporciona “tal cual”. No garantizamos que esté libre de errores ni que funcione de manera ininterrumpida. 
          No nos hacemos responsables de decisiones tomadas basadas en la información de la plataforma.
        </p>
        <p>
          Al registrarte y usar esta plataforma, aceptas explícitamente estos términos. 
          Si no estás de acuerdo, por favor no continúes.
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
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isTermsOpen, setIsTermsOpen] = useState(false);

  // Estados para mostrar/ocultar contraseña
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
      setMessage('Las contraseñas no coinciden');
      return;
    }
    if (!acceptTerms) {
      setMessage('Debes aceptar los términos y condiciones');
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
      setTimeout(() => navigate('/login'), 1500);
    } catch (error: any) {
      console.error('Register error:', error);
      setMessage(error.message);
    }
  };

  return (
    <div className="auth-page" style={{ display: 'flex', justifyContent: 'center', padding: '1rem', position: 'relative' }}>
      <div className="auth-wrapper" style={{ maxWidth: '500px', width: '100%', margin: '0 auto' }}>
        <h1 className="auth-title">{t('register.createAccount')}</h1>
        <p className="auth-subtitle">{t('register.fillForm')}</p>

        <form className="auth-card" onSubmit={handleSubmit}>
          {/* First Name */}
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

          {/* Last Name */}
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

          {/* Age */}
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

          {/* Email */}
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

          {/* Password */}
          <label className="auth-label">
            {t('register.password')}
            <div className="auth-input-wrapper" style={{ position: 'relative' }}>
              <span className="auth-input-icon">🔒</span>
              <input
                className="auth-input"
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder={t('register.placeholderPassword')}
                value={form.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '0.5rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1.2rem',
                }}
              >
                {showPassword ? '👁️' : '🙈'}
              </button>
            </div>
          </label>

          {/* Confirm Password */}
          <label className="auth-label">
            {t('register.confirmPassword')}
            <div className="auth-input-wrapper" style={{ position: 'relative' }}>
              <span className="auth-input-icon">🔒</span>
              <input
                className="auth-input"
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                placeholder={t('register.placeholderConfirmPassword')}
                value={confirmPassword}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{
                  position: 'absolute',
                  right: '0.5rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1.2rem',
                }}
              >
                {showConfirmPassword ? '👁️' : '🙈'}
              </button>
            </div>
          </label>

          {/* Terms */}
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
