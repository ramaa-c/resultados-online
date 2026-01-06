import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/login.css";
import centraLabLogo from "../assets/centraLab_nuevo.png";
import { loginUser } from "../services/auth.service";
import api from "../api/axios"; 
import { FiUser, FiLock, FiEye, FiEyeOff } from "react-icons/fi";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    jwtusername: "",
    jwtpassword: "",
  });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  // --- LIMPIEZA DE SESIÓN ---
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.log("Limpiando datos de sesión...");
      localStorage.removeItem("userData");
      localStorage.removeItem("tempUserId");
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const loginResponse = await loginUser(formData);

      if (loginResponse.token) {
        localStorage.setItem("token", loginResponse.token);
        const userIdentifier = formData.jwtusername; 

        // --- CASO 1: ADMIN HARDCODEADO ---
        if (userIdentifier.toLowerCase() === "admin") {
            const adminData = {
                fullname: "Administrador",
                email: "admin@sistema",
                userid: 0,
                username: "admin",
                isadministrator: true 
            };
            localStorage.setItem("userData", JSON.stringify(adminData));
            navigate("/resultados");
            setIsLoading(false);
            return;
        }

        // --- CASO 2: USUARIOS API ---
        const encodedIdentifier = encodeURIComponent(userIdentifier);
        const { data: userData } = await api.get(`/users/${encodedIdentifier}/:byname`);

        if (userData.status?.trim().toLowerCase() !== "activo" && userData.status?.trim().toLowerCase() !== "active") {
            setError("Su cuenta no está activa. Contacte al administrador.");
            localStorage.removeItem("token");
            setIsLoading(false);
            return;
        }

        const userStorageInfo = {
          fullname: userData.fullname || userData.FullName || userData.fullName || "Usuario",
          email: userData.email || userData.Email || "Sin Email",
          userid: userData.userid || userData.UserId || userData.id,
          username: userData.username || userData.UserName || "usuario",
          isadministrator: userData.isadministrator || userData.IsAdministrator || false,
          canviewallbranches: userData.canviewallbranches || false,
          canviewallforwarders: userData.canviewallforwarders || false
        };

        localStorage.setItem("userData", JSON.stringify(userStorageInfo));

        if (userData.mustchangepassword === true) {
          localStorage.setItem("tempUserId", userData.userid);
          navigate("/cambiarClave");
        } else {
          navigate("/resultados");
        }

      } else {
        setError("Error: Credenciales inválidas.");
      }
    } catch (err) {
      console.error(err);
      localStorage.removeItem("token"); 
      localStorage.removeItem("userData");
      const msg = err.response?.status === 401
          ? "Usuario o contraseña incorrectos."
          : "Error de conexión o usuario no encontrado.";
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
            <img src={centraLabLogo} alt="CentraLab Logo" className="card-logo" />
            <span className="logo-text"></span>
          </div>
          <div className="decorative-image-placeholder"></div>
        </div>

        <div className="card-right-column">
          <h1 className="card-title">Resultados Online</h1>
          <p className="card-subtitle">Inicia sesión con tus datos personales</p>

          <form className="login-form" onSubmit={handleSubmit}>
            
            {/* INPUT USUARIO */}
            <div className="field-wrapper">
              <div 
                className="identifier-container" 
                // ESTILO CORREGIDO: Relative para que el icono absoluto se ubique aquí dentro
                style={{ position: 'relative', display: 'flex', alignItems: 'center' }}
              >
                {/* ICONO USUARIO (POSICIÓN ABSOLUTA) */}
                <FiUser 
                  size={18} 
                  color="#9ca3af" // Color gris suave
                  style={{ 
                    position: 'absolute', 
                    left: '12px', 
                    top: '50%', 
                    transform: 'translateY(-50%)', // Centrado vertical perfecto
                    pointerEvents: 'none' // Click traspasa al input
                  }} 
                />
                
                <input
                  type="text"
                  placeholder="Email o DNI"
                  name="jwtusername"
                  value={formData.jwtusername}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  // PADDING LEFT: Espacio para que el texto no tape al icono
                  style={{ paddingLeft: '40px', width: '100%' }} 
                />
              </div>
            </div>

            {/* INPUT PASSWORD */}
            <div className="field-wrapper">
              <div 
                className="password-container"
                style={{ position: 'relative', display: 'flex', alignItems: 'center' }}
              >
                {/* ICONO CANDADO (IZQUIERDA) */}
                <FiLock 
                  size={18} 
                  color="#9ca3af"
                  style={{ 
                    position: 'absolute', 
                    left: '12px', 
                    top: '50%', 
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none'
                  }} 
                />
                
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Contraseña"
                  className="password-input"
                  name="jwtpassword"
                  value={formData.jwtpassword}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  style={{ paddingLeft: '40px', paddingRight: '40px', width: '100%' }}
                />

                {/* BOTÓN OJO (DERECHA) */}
                <button
                  type="button"
                  className="toggle-password-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex="-1"
                  style={{ 
                    background: 'transparent', 
                    border: 'none', 
                    cursor: 'pointer', 
                    display: 'flex', 
                    alignItems: 'center',
                    position: 'absolute', // Absoluto a la derecha
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    zIndex: 10
                  }}
                >
                  {showPassword ? (
                    <FiEyeOff size={18} color="#666" />
                  ) : (
                    <FiEye size={18} color="#666" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div style={{ color: "#dc2626", marginTop: "8px", fontSize: "0.85rem", fontWeight: "500", marginLeft: "8px" }}>
                {error}
              </div>
            )}

            <div style={{ textAlign: "right", marginTop: "10px" }}>
              <Link to="/recuperarClave" style={{ fontSize: "0.85rem", color: "#64748b", textDecoration: "none" }}>
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
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}