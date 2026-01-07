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

        // --- ADMIN ---
        if (userIdentifier.toLowerCase() === "admin") {
          const adminData = {
            fullname: "Administrador",
            email: "admin@sistema",
            userid: 0,
            username: "admin",
            isadministrator: true,
            canviewallbranches: true,
            canviewallforwarders: true,
            branchidlist: [],
            forwarderidlist: [],
            branchnamelist: [],
            forwardernamelist: [],
          };
          localStorage.setItem("userData", JSON.stringify(adminData));
          navigate("/resultados");
          setIsLoading(false);
          return;
        }

        // --- FLUJO PARA USUARIOS NORMALES ---
        const encodedIdentifier = encodeURIComponent(userIdentifier);
        const { data: userData } = await api.get(
          `/users/${encodedIdentifier}/:byname`
        );

        if (userData.status?.trim().toLowerCase() !== "activo") {
          setError("Su cuenta no está activa. Contacte al administrador.");
          localStorage.removeItem("token");
          setIsLoading(false);
          return;
        }

        const canViewAllBranches = userData.canviewallbranches || false;
        const canViewAllForwarders = userData.canviewallforwarders || false;

        const userStorageInfo = {
          fullname: userData.fullname || userData.FullName || "Usuario",
          email: userData.email || userData.Email || "Sin Email",
          userid: userData.userid || userData.UserId || userData.id,
          username: userData.username || userData.UserName || "usuario",
          isadministrator: userData.isadministrator || false,
          canviewreserved: userData.canviewreserved || false,

          canviewallbranches: canViewAllBranches,
          branchidlist: canViewAllBranches ? [] : userData.branchidlist || [],
          branchnamelist: canViewAllBranches
            ? []
            : userData.branchnamelist || [],

          canviewallforwarders: canViewAllForwarders,
          forwarderidlist: canViewAllForwarders
            ? []
            : userData.forwarderidlist || [],
          forwardernamelist: canViewAllForwarders
            ? []
            : userData.forwardernamelist || [],
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
      const msg =
        err.response?.status === 401
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
            {/* INPUT USUARIO */}
            <div className="field-wrapper">
              <div
                className="identifier-container"
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <FiUser
                  size={18}
                  color="#9ca3af"
                  style={{
                    position: "absolute",
                    left: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    pointerEvents: "none",
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
                  style={{ paddingLeft: "40px", width: "100%" }}
                />
              </div>
            </div>

            {/* INPUT PASSWORD */}
            <div className="field-wrapper">
              <div
                className="password-container"
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <FiLock
                  size={18}
                  color="#9ca3af"
                  style={{
                    position: "absolute",
                    left: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    pointerEvents: "none",
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
                  style={{
                    paddingLeft: "40px",
                    paddingRight: "40px",
                    width: "100%",
                  }}
                />

                {/* BOTÓN OJO */}
                <button
                  type="button"
                  className="toggle-password-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex="-1"
                  style={{
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    zIndex: 10,
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

            <div style={{ textAlign: "right", marginTop: "10px" }}>
              <Link
                to="/recuperarClave"
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
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
