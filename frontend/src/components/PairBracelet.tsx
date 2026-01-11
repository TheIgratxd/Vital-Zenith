import React, { useState } from "react";
import InputOTP from "./inputOTP";
import { braceletService } from "../services/bracelet.service";
import "./PairBracelet.css";

interface PairBraceletProps {
  onSuccess?: (braceletId: string) => void;
  onCancel?: () => void;
}

const PairBracelet: React.FC<PairBraceletProps> = ({ onSuccess, onCancel }) => {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleOtpChange = (value: string) => {
    setOtp(value);
    setError(""); // Limpiar error al escribir
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (otp.length !== 6) {
      setError("Por favor ingresa un código de 6 dígitos");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const result = await braceletService.pairBracelet(otp);

      if (result.success) {
        setSuccess(true);
        console.log("✅ Brazalete emparejado:", result.bracelet_id);

        // Esperar un momento para mostrar el mensaje de éxito
        setTimeout(() => {
          if (onSuccess && result.bracelet_id) {
            onSuccess(result.bracelet_id);
          }
        }, 1500);
      } else {
        setError(result.message || "Error al emparejar el brazalete");
      }
    } catch (err: any) {
      console.error("Error al emparejar:", err);
      setError(err.message || "Error al emparejar el brazalete");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="pair-bracelet-container">
        <div className="pair-bracelet-card success-card">
          <div className="success-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <h2>¡Brazalete Emparejado!</h2>
          <p>Tu brazalete se ha vinculado correctamente a tu cuenta.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pair-bracelet-container">
      <div className="pair-bracelet-card">
        <div className="card-header">
          <div className="bracelet-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
          </div>
          <h2>Emparejar Brazalete</h2>
          <p className="subtitle">
            Ingresa el código de 6 dígitos que aparece en la pantalla de tu
            brazalete
          </p>
        </div>

        <form onSubmit={handleSubmit} className="pair-form">
          <div className="otp-wrapper">
            <label htmlFor="otp-input" className="otp-label">
              Código de Emparejamiento
            </label>
            <InputOTP length={6} onChange={handleOtpChange} />

            {error && (
              <div className="error-message">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                </svg>
                <span>{error}</span>
              </div>
            )}
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={onCancel}
              className="btn-secondary"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isLoading || otp.length !== 6}
            >
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  Emparejando...
                </>
              ) : (
                "Emparejar"
              )}
            </button>
          </div>
        </form>

        <div className="help-section">
          <h3>¿Dónde encuentro el código?</h3>
          <ol>
            <li>En la parte trasera del brazalete aparece el código</li>
            <li>Ingresa los 6 dígitos en este formulario</li>
            <li>Presiona "Emparejar"</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default PairBracelet;
