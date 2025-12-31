import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/login.css";
import centraLabLogo from "../assets/centraLab_nuevo.png";
import { loginUser } from "../services/auth.service";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    jwtusername: "",
    jwtpassword: "",
  });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const data = await loginUser(formData);

      if (data.token) {
        localStorage.setItem("token", data.token);
        navigate("/resultados");
      } else {
        setError("Error: El servidor no devolvió un token válido.");
      }
    } catch (err) {
      console.error(err);
      const msg =
        err.response?.status === 401
          ? "Usuario o contraseña incorrectos."
          : "Error de conexión con el servidor.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="decorative-background">
        <div className="shape-top"></div>
        <div className="shape-bottom"></div>
      </div>

      <div className="login-card">
        <div className="card-left-column">
          <div className="logo-section">
            <img
              src={centraLabLogo}
              alt="CentraLab Logo"
              className="card-logo"
            />
            <span className="logo-text"></span>
          </div>
          <div className="decorative-image-placeholder"></div>
        </div>

        <div className="card-right-column">
          <h1 className="card-title">Resultados Online</h1>
          <p className="card-subtitle">
            Inicia sesión con tus datos personales
          </p>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="field-wrapper">
              <div className="identifier-container">
                <i className="fa-solid fa-user input-icon"></i>
                <input
                  type="text"
                  placeholder="Email o DNI"
                  name="jwtusername"
                  value={formData.jwtusername}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="field-wrapper">
              <div className="password-container">
                <i className="fa-solid fa-lock input-icon"></i>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Contraseña"
                  className="password-input"
                  name="jwtpassword"
                  value={formData.jwtpassword}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="toggle-password-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex="-1"
                >
                  <i
                    className={`fa-solid ${
                      showPassword ? "fa-eye-slash" : "fa-eye"
                    }`}
                  ></i>
                </button>
              </div>
            </div>

            {/* --- MENSAJE DE ERROR --- */}
            {error && (
              <div
                style={{
                  color: "#dc2626",
                  marginTop: "8px",
                  fontSize: "0.85rem",
                  fontWeight: "500",
                  marginLeft: "8px",
                }}
              >
                {error}
              </div>
            )}

            {/* --- ENLACE OLVIDO CONTRASEÑA --- */}
            <div style={{ textAlign: "right", marginTop: "10px" }}>
              <Link
                to="/forgot-password"
                style={{
                  fontSize: "0.85rem",
                  color: "#64748b",
                  textDecoration: "none",
                }}
              >
                ¿Olvidó su contraseña?
              </Link>
            </div>

            <div className="button-group">
              <button
                className="ingresar-btn"
                type="submit"
                disabled={isLoading}
                style={{ opacity: isLoading ? 0.7 : 1 }}
              >
                {isLoading ? "Ingresando..." : "Ingresar"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/registro")}
                className="ingresar-btn"
                style={{
                  backgroundColor: "white",
                  color: "var(--primary)",
                  border: "1px solid var(--primary)",
                }}
              >
                Crear Cuenta
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
