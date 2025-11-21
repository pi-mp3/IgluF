import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from './api';

/**
 * Registration form for new users.
 * Connects with backend using registerUser API function.
 */
export default function Register() {
  const navigate = useNavigate();

  // ============================
  // STATE
  // ============================
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    age: '',
    email: '',
    password: '',
  });

  // ============================
  // HANDLE INPUT CHANGE
  // ============================
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ============================
  // HANDLE FORM SUBMIT
  // ============================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userData = {
        ...form,
        age: Number(form.age), // convert age to number
      };
      const data = await registerUser(userData);
      console.log('Registration successful:', data);
      alert('¡Registro exitoso! Ahora puedes iniciar sesión.');
      navigate('/login'); // redirect to login page
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Error al registrar el usuario');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-wrapper">
        <h1 className="auth-title">Crea tu cuenta</h1>
        <p className="auth-subtitle">Completa el formulario para registrarte</p>

        <form className="auth-card" onSubmit={handleSubmit}>
          {/* First Name */}
          <label className="auth-label">
            Nombre
            <div className="auth-input-wrapper">
              <input
                className="auth-input"
                type="text"
                name="firstName"
                placeholder="Juan"
                value={form.firstName}
                onChange={handleChange}
                required
              />
            </div>
          </label>

          {/* Last Name */}
          <label className="auth-label">
            Apellido
            <div className="auth-input-wrapper">
              <input
                className="auth-input"
                type="text"
                name="lastName"
                placeholder="Pérez"
                value={form.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </label>

          {/* Age */}
          <label className="auth-label">
            Edad
            <div className="auth-input-wrapper">
              <input
                className="auth-input"
                type="number"
                name="age"
                placeholder="25"
                value={form.age}
                onChange={handleChange}
                required
              />
            </div>
          </label>

          {/* Email */}
          <label className="auth-label">
            Correo electrónico
            <div className="auth-input-wrapper">
              <span className="auth-input-icon">@</span>
              <input
                className="auth-input"
                type="email"
                name="email"
                placeholder="tu@email.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
          </label>

          {/* Password */}
          <label className="auth-label">
            Contraseña
            <div className="auth-input-wrapper">
              <span className="auth-input-icon">🔒</span>
              <input
                className="auth-input"
                type="password"
                name="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>
          </label>

          {/* Submit Button */}
          <button type="submit" className="auth-submit">
            Registrarse
          </button>

          {/* Login Link */}
          <p className="auth-bottom-text">
            ¿Ya tienes una cuenta?{' '}
            <button
              type="button"
              className="auth-link"
              onClick={() => navigate('/login')}
            >
              Iniciar sesión
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
