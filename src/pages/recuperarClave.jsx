import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "../styles/login.css";
import centraLabLogo from "../assets/centraLab_nuevo.png";

export default function RecuperarClave() {
  const [identifier, setIdentifier] = useState("");
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const BASE_URL = import.meta.env.VITE_API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setIsLoading(true);

    try {

      const encodedIdentifier = encodeURIComponent(identifier);

      console.log("Enviando solicitud de reset para:", identifier);

      await axios.put(`${BASE_URL}/users/${encodedIdentifier}/password:reset`);

      setMessage(
        "Se ha enviado una nueva contraseña temporal a tu correo electrónico."
      );
      setIdentifier(""); 

    } catch (err) {
      console.error(err);
      
      if (err.response?.status === 404) {
        setError("No encontramos un usuario con ese Email o DNI.");
      } else if (err.response?.status === 500) {
        setError("Error del servidor. Por favor verifica el formato del usuario/email.");
      } else {
        const msg = err.response?.data?.message || "Ocurrió un error al procesar la solicitud.";
        setError(msg);
      }
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
        {/* Columna Izquierda */}
        <div className="card-left-column">
          <div className="logo-section">
            <img src={centraLabLogo} alt="CentraLab Logo" className="card-logo" />
          </div>
          <div className="decorative-image-placeholder"></div>
        </div>

        {/* Columna Derecha */}
        <div className="card-right-column">
          <h1 className="card-title">Recuperar Contraseña</h1>
          <p className="card-subtitle">
            Ingresa tu Email o Usuario y te enviaremos una nueva clave temporal.
          </p>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="field-wrapper">
              <div className="identifier-container">
                <i className="fa-solid fa-user input-icon"></i>
                <input
                  type="text"
                  placeholder="Email o Usuario"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {error && (
              <div style={{ color: "#dc2626", marginTop: "10px", marginBottom: "10px", textAlign: "center", fontWeight: "500", fontSize: "0.9rem", backgroundColor: "#fee2e2", padding: "10px", borderRadius: "6px" }}>
                {error}
              </div>
            )}

            {message && (
              <div style={{ color: "#15803d", marginTop: "10px", marginBottom: "10px", textAlign: "center", fontWeight: "500", fontSize: "0.9rem", backgroundColor: "#dcfce7", padding: "10px", borderRadius: "6px" }}>
                {message}
              </div>
            )}

            <div className="button-group" style={{ flexDirection: "column" }}>
              <button className="ingresar-btn" type="submit" disabled={isLoading} style={{ width: "100%", opacity: isLoading ? 0.7 : 1 }}>
                {isLoading ? "Procesando..." : "Restablecer Contraseña"}
              </button>

              <Link to="/login" style={{ marginTop: "20px", textAlign: "center", color: "#64748b", textDecoration: "none", fontSize: "0.95rem", fontWeight: "500", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                <i className="fa-solid fa-arrow-left"></i> Volver al inicio de sesión
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}