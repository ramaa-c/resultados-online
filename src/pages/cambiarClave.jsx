import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import toast from "react-hot-toast";
import "../styles/login.css";
import logoSolo from "../assets/images/cl_logo.jpg";
import api from "../api/axios";

export default function CambiarClave() {
  const [passwords, setPasswords] = useState({
    old: "",
    new: "",
    confirm: "",
  });

  const [showPassOld, setShowPassOld] = useState(false);
  const [showPassNew, setShowPassNew] = useState(false);
  const [showPassConfirm, setShowPassConfirm] = useState(false);

  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const toggleBtnStyle = {
    position: "absolute",
    right: "15px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#94a3b8",
    display: "flex",
    alignItems: "center",
  };

  const handleChange = (field, value) => {
    setPasswords((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

    if (!passwordRegex.test(passwords.new)) {
      setError(
        "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número."
      );
      return;
    }

    if (passwords.new !== passwords.confirm) {
      setError("La nueva contraseña y la confirmación no coinciden.");
      return;
    }

    if (passwords.old === passwords.new) {
      setError("La nueva contraseña no puede ser igual a la anterior.");
      return;
    }

    setIsLoading(true);

    try {
      const userId = localStorage.getItem("tempUserId");

      if (!userId) {
        toast.error("Error de sesión. Vuelva a ingresar.");
        navigate("/login");
        return;
      }

      const payload = {
        oldpassword: passwords.old,
        newpassword: passwords.new,
      };

      await api.put(`/users/${userId}/password:change`, payload);

      toast.success("Contraseña actualizada correctamente.");

      localStorage.removeItem("tempUserId");
      navigate("/resultados");
    } catch (err) {
      console.error(err);
      if (err.response?.status === 400 || err.response?.status === 401) {
        toast.error("La contraseña actual es incorrecta.");
        setError("La contraseña actual es incorrecta.");
      } else {
        toast.error("Error al cambiar la contraseña. Intente nuevamente.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div
          className="card-right-column"
          style={{ width: "100%", padding: "40px 60px" }}
        >
          <div style={{ textAlign: "center", marginBottom: "30px" }}>
            <img
              src={logoSolo}
              alt="CentraLab Logo"
              style={{ marginBottom: "15px", height: "60px" }}
            />
            <h1 className="card-title">Cambiar Contraseña</h1>
            <p className="card-subtitle">
              Debe tener mín. 8 caracteres, una mayúscula, una minúscula y un
              número.
            </p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            {/* CONTRASEÑA ACTUAL */}
            <div className="field-wrapper">
              <label
                style={{
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  color: "#444",
                  marginBottom: 5,
                  display: "block",
                }}
              >
                Contraseña Actual
              </label>
              <div
                className="password-container"
                style={{ position: "relative" }}
              >
                <input
                  type={showPassOld ? "text" : "password"}
                  placeholder="Ingrese su clave actual"
                  className="password-input"
                  value={passwords.old}
                  onChange={(e) => handleChange("old", e.target.value)}
                  required
                  style={{ paddingLeft: "15px" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassOld(!showPassOld)}
                  style={toggleBtnStyle}
                  tabIndex="-1"
                >
                  {showPassOld ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                </button>
              </div>
            </div>

            {/* NUEVA CONTRASEÑA */}
            <div className="field-wrapper">
              <label
                style={{
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  color: "#444",
                  marginBottom: 5,
                  display: "block",
                }}
              >
                Nueva Contraseña
              </label>
              <div
                className="password-container"
                style={{ position: "relative" }}
              >
                <input
                  type={showPassNew ? "text" : "password"}
                  placeholder="Ej: Hola1234"
                  className="password-input"
                  value={passwords.new}
                  onChange={(e) => handleChange("new", e.target.value)}
                  required
                  style={{ paddingLeft: "15px" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassNew(!showPassNew)}
                  style={toggleBtnStyle}
                  tabIndex="-1"
                >
                  {showPassNew ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                </button>
              </div>
            </div>

            {/* CONFIRMAR NUEVA */}
            <div className="field-wrapper">
              <label
                style={{
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  color: "#444",
                  marginBottom: 5,
                  display: "block",
                }}
              >
                Repetir Nueva
              </label>
              <div
                className="password-container"
                style={{ position: "relative" }}
              >
                <input
                  type={showPassConfirm ? "text" : "password"}
                  placeholder="Repita la nueva contraseña"
                  className="password-input"
                  value={passwords.confirm}
                  onChange={(e) => handleChange("confirm", e.target.value)}
                  required
                  style={{ paddingLeft: "15px" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassConfirm(!showPassConfirm)}
                  style={toggleBtnStyle}
                  tabIndex="-1"
                >
                  {showPassConfirm ? (
                    <FaEyeSlash size={18} />
                  ) : (
                    <FaEye size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* MENSAJE DE ERROR */}
            {error && (
              <div
                style={{
                  color: "#dc2626",
                  marginTop: "15px",
                  fontSize: "0.85rem",
                  textAlign: "center",
                  backgroundColor: "#fee2e2",
                  padding: "10px",
                  borderRadius: "6px",
                  border: "1px solid #fecaca",
                }}
              >
                {error}
              </div>
            )}

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: "30px",
              }}
            >
              <button
                className="ingresar-btn"
                type="submit"
                disabled={isLoading}
                style={{
                  width: "100%",
                  maxWidth: "300px",
                  opacity: isLoading ? 0.7 : 1,
                }}
              >
                {isLoading ? "Guardando..." : "Actualizar Contraseña"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
