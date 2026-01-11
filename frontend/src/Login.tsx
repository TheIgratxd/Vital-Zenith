import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import LoginCard from "./components/loginCard.tsx";
import RegisterCard from "./components/registerCard.tsx";
import { authService } from "./services/auth.service";

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData extends LoginData {
  name: string;
  confirmPassword: string;
}

function Login() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState<RegisterData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Partial<RegisterData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Limpiar errores al escribir
    if (errors[name as keyof LoginData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<RegisterData> = {};

    if (!isLogin && !formData.name.trim()) {
      newErrors.name = "El nombre es requerido";
    }

    if (!formData.email) {
      newErrors.email = "El email es requerido";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Formato de email inválido";
    }

    if (!formData.password) {
      newErrors.password = "La contraseña es requerida";
    } else if (formData.password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";
    }

    if (!isLogin) {
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = "Confirma tu contraseña";
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Las contraseñas no coinciden";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      if (isLogin) {
        // LOGIN con Firebase
        const user = await authService.login({
          email: formData.email,
          password: formData.password,
        });

        console.log("✅ Login exitoso:", user.email);

        // Opcional: Obtener el token para verificar
        const token = await user.getIdToken();
        console.log("🔑 Token generado:", token.substring(0, 50) + "...");

        navigate("/dashboard");
      } else {
        // REGISTRO con Firebase
        const user = await authService.register({
          email: formData.email,
          password: formData.password,
          name: formData.name,
        });

        console.log("✅ Registro exitoso:", user.email);
        console.log("👤 Usuario creado con nombre:", formData.name);

        navigate("/dashboard");
      }
    } catch (error: any) {
      console.error("❌ Error:", error);

      // Mostrar errores específicos de Firebase
      let errorMessage = "Error desconocido";

      if (error.code === "auth/email-already-in-use") {
        errorMessage = "Este email ya está registrado";
        setErrors({ email: errorMessage });
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Email inválido";
        setErrors({ email: errorMessage });
      } else if (error.code === "auth/weak-password") {
        errorMessage = "La contraseña es muy débil";
        setErrors({ password: errorMessage });
      } else if (error.code === "auth/user-not-found") {
        errorMessage = "Usuario no encontrado";
        setErrors({ email: errorMessage });
      } else if (error.code === "auth/wrong-password") {
        errorMessage = "Contraseña incorrecta";
        setErrors({ password: errorMessage });
      } else {
        errorMessage = error.message;
      }

      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setErrors({});
    setFormData({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
  };

  return (
    <>
      <div className="login-container">
        <div className="login-wrapper">
          {/* Columna izquierda - Imagen/Video */}
          <div className="media-section">
            <div className="media-overlay">
              <div className="brand-content">
                <div className="medical-icon-large">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 8h-2v3h-3v2h3v3h2v-3h3v-2h-3V8M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </div>
                <h1 className="brand-title">Ixchel Medical</h1>
                <p className="brand-subtitle">
                  Sistema de Monitoreo de Signos Vitales
                </p>
                <p className="brand-description">
                  Monitoreo confiable para el cuidado diario de la salud
                </p>
              </div>
            </div>
            {/* Aquí puedes agregar tu video o imagen */}
            <div className="media-placeholder">
              {
                <video autoPlay loop muted playsInline>
                  <source src="/public/leftLoginVideo.mp4" type="video/mp4" />
                </video>
              }
              {/* O una imagen: <img src="/tu-imagen.jpg" alt="Natural" /> */}
            </div>
          </div>

          {/* Columna derecha - Formulario */}
          <div className="form-section">
            <div className="form-content">
              {/* Toggle Switch */}
              <div className="mode-toggle-container">
                <div className="mode-toggle">
                  <button
                    type="button"
                    className={`toggle-option ${isLogin ? "active" : ""}`}
                    onClick={() => !isLogin && switchMode()}
                  >
                    Iniciar Sesión
                  </button>
                  <button
                    type="button"
                    className={`toggle-option ${!isLogin ? "active" : ""}`}
                    onClick={() => isLogin && switchMode()}
                  >
                    Registrarse
                  </button>
                  <div
                    className={`toggle-slider ${!isLogin ? "right" : ""}`}
                  ></div>
                </div>
              </div>

              <div className="form-header">
                <h2>{isLogin ? "Bienvenido de nuevo" : "Crea tu cuenta"}</h2>
                <p>
                  {isLogin
                    ? "Ingresa tus credenciales para continuar"
                    : "Completa el formulario para registrarte"}
                </p>
              </div>

              {isLogin ? (
                <LoginCard
                  formData={formData}
                  errors={errors}
                  isLoading={isLoading}
                  showPassword={showPassword}
                  onInputChange={handleInputChange}
                  onSubmit={handleSubmit}
                  onTogglePassword={togglePasswordVisibility}
                />
              ) : (
                <RegisterCard
                  formData={formData}
                  errors={errors}
                  isLoading={isLoading}
                  showPassword={showPassword}
                  showConfirmPassword={showConfirmPassword}
                  onInputChange={handleInputChange}
                  onSubmit={handleSubmit}
                  onTogglePassword={togglePasswordVisibility}
                  onToggleConfirmPassword={toggleConfirmPasswordVisibility}
                />
              )}

              <div className="security-note">
                <small>🔒 Conexión segura - Tus datos están protegidos</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;
