import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/login.css";
import centraLabLogo from "../assets/centraLab_nuevo.png";

export default function RecuperarClave() {
  const [identifier, setIdentifier] = useState("");
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setIsLoading(true);

    try {
      // Simulación de llamada a la API
      // await recoverPassword(identifier);
      console.log("Enviando recuperación a:", identifier);

      // Simulación de éxito (Reemplaza con tu lógica real)
      setTimeout(() => {
        setMessage(
          "Si los datos coinciden, recibirás un correo con las instrucciones."
        );
        setIsLoading(false);
      }, 1500);
    } catch (err) {
      console.error(err);
      setError("Ocurrió un error al procesar la solicitud. Intenta nuevamente.");
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
        {/* Columna Izquierda (Logo) */}
        <div className="card-left-column">
          <div className="logo-section">
            <img
              src={centraLabLogo}
              alt="CentraLab Logo"
              className="card-logo"
            />
          </div>
          <div className="decorative-image-placeholder"></div>
        </div>

        {/* Columna Derecha (Formulario) */}
        <div className="card-right-column">
          <h1 className="card-title">Recuperar Contraseña</h1>
          <p className="card-subtitle">
            Ingresa tu Email o DNI y te enviaremos los pasos para restablecerla.
          </p>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="field-wrapper">
              <div className="identifier-container">
                <i className="fa-solid fa-user input-icon"></i>
                <input
                  type="text"
                  placeholder="Email o DNI"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {error && (
              <span
                style={{
                  color: "#dc2626",
                  display: "block",
                  marginTop: "10px",
                  marginBottom: "10px",
                  textAlign: "center",
                  fontWeight: "600",
                  fontSize: "0.9rem",
                }}
              >
                {error}
              </span>
            )}

            {message && (
              <span
                style={{
                  color: "#16a34a",
                  display: "block",
                  marginTop: "10px",
                  marginBottom: "10px",
                  textAlign: "center",
                  fontWeight: "600",
                  fontSize: "0.9rem",
                }}
              >
                {message}
              </span>
            )}

            {/* Grupo de Botones */}
            <div className="button-group" style={{ flexDirection: "column" }}>
              <button
                className="ingresar-btn"
                type="submit"
                disabled={isLoading}
                style={{ width: "100%", opacity: isLoading ? 0.7 : 1 }}
              >
                {isLoading ? "Enviando..." : "Restablecer Contraseña"}
              </button>

              <Link
                to="/login"
                style={{
                  marginTop: "20px",
                  textAlign: "center",
                  color: "#64748b",
                  textDecoration: "none",
                  fontSize: "0.95rem",
                  fontWeight: "500",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  transition: "color 0.2s"
                }}
                onMouseOver={(e) => (e.currentTarget.style.color = "#0198CC")}
                onMouseOut={(e) => (e.currentTarget.style.color = "#64748b")}
              >
                <i className="fa-solid fa-arrow-left"></i> Volver al inicio de sesión
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}