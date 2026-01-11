import React from "react";

interface RegisterCardProps {
  formData: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  };
  errors: {
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  };
  isLoading: boolean;
  showPassword: boolean;
  showConfirmPassword: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onTogglePassword: () => void;
  onToggleConfirmPassword: () => void;
}

function RegisterCard({
  formData,
  errors,
  isLoading,
  showPassword,
  showConfirmPassword,
  onInputChange,
  onSubmit,
  onTogglePassword,
  onToggleConfirmPassword,
}: RegisterCardProps) {
  return (
    <form key="register" onSubmit={onSubmit} className="login-form">
      <div className="input-group">
        <label htmlFor="name">Nombre Completo</label>
        <input
          id="name"
          name="name"
          type="text"
          value={formData.name}
          onChange={onInputChange}
          className={`input-field ${errors.name ? "error" : ""}`}
          placeholder="Tu nombre"
          disabled={isLoading}
        />
        {errors.name && <span className="error-message">{errors.name}</span>}
      </div>

      <div className="input-group">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={onInputChange}
          className={`input-field ${errors.email ? "error" : ""}`}
          placeholder="usuario@ejemplo.com"
          disabled={isLoading}
        />
        {errors.email && <span className="error-message">{errors.email}</span>}
      </div>

      <div className="input-group">
        <label htmlFor="password">Contraseña</label>
        <div className="password-input-wrapper">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={onInputChange}
            className={`input-field ${errors.password ? "error" : ""}`}
            placeholder="••••••••"
            disabled={isLoading}
          />
          <button
            type="button"
            className="toggle-password-btn"
            onClick={onTogglePassword}
            aria-label={
              showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
            }
          >
            {showPassword ? (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </div>
        {errors.password && (
          <span className="error-message">{errors.password}</span>
        )}
      </div>

      <div className="input-group">
        <label htmlFor="confirmPassword">Confirmar Contraseña</label>
        <div className="password-input-wrapper">
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            value={formData.confirmPassword}
            onChange={onInputChange}
            className={`input-field ${errors.confirmPassword ? "error" : ""}`}
            placeholder="••••••••"
            disabled={isLoading}
          />
          <button
            type="button"
            className="toggle-password-btn"
            onClick={onToggleConfirmPassword}
            aria-label={
              showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"
            }
          >
            {showConfirmPassword ? (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </div>
        {errors.confirmPassword && (
          <span className="error-message">{errors.confirmPassword}</span>
        )}
      </div>

      <button
        type="submit"
        className={`login-button ${isLoading ? "loading" : ""}`}
        disabled={isLoading}
      >
        {isLoading ? <span className="loading-spinner"></span> : "Crear Cuenta"}
      </button>
    </form>
  );
}

export default RegisterCard;
