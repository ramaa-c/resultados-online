import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/login.css";
import centraLabLogo from "../assets/centraLab_nuevo.png";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const handleSubmit = (e) => {
    e.preventDefault();
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
            {/* Campo: Email o DNI */}
            <div className="field-wrapper">
              <div className="identifier-container">
                <i className="fa-solid fa-user input-icon"></i>
                <input
                  type="text"
                  placeholder="Email o DNI"
                  name="identifier"
                />
              </div>
            </div>

            {/* Campo: Contraseña */}
            <div className="field-wrapper">
              <div className="password-container">
                <i className="fa-solid fa-lock input-icon"></i>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Contraseña"
                  className="password-input"
                  name="password"
                />
                <button
                  type="button"
                  className="toggle-password-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <i className={`fa-solid ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                </button>
              </div>
            </div>
            
            <Link to="/recuperarclave" className="forgot-password-link">
              ¿Olvidó su contraseña?
            </Link>

            <div className="button-group">
              <button className="ingresar-btn" type="submit">
                Ingresar
              </button>
              <Link to="/registro" className="registro-btn">
                Registrarse
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}