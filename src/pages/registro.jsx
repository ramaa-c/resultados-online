import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/auth.service";
import "../styles/registro.css";
import centraLabLogo from "../assets/centraLab_nuevo.png";

export default function Registro() {
    
  const [isLoading, setIsLoading] = useState(false);
  
  // Eliminamos el campo 'password' del estado
  const [formData, setFormData] = useState({
    username: "",
    fullname: "",
    email: "",
  });

  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const fechaActual = new Date().toISOString();

    // --- PAYLOAD SIN CONTRASEÑA ---
    const userPayload = {
      userid: 0,
      username: formData.username,
      fullname: formData.fullname,
      email: formData.email,
      // No enviamos password; el backend se encarga de generarla
      
      createdate: fechaActual,
      expirationdate: "2099-12-31T23:59:59.999Z",
      status: "Active",
      
      mustchangepassword: true, // Esto forzará el cambio al ingresar
      canviewreserved: true,
      canviewallbranches: true,
      canviewallforwarders: true,
      isadministrator: false,
      
      branchidlist: [],
      forwarderidlist: [],
      branchnamelist: [],
      forwardernamelist: []
    };

    try {
      await registerUser(userPayload);

      alert("Registro exitoso. Revisa tu correo electrónico para obtener tu contraseña temporal.");
      navigate("/login");

    } catch (error) {
      console.error("Error en registro:", error);
      const errorMsg = error.response?.data?.message || "Error al procesar el registro.";
      alert(`Error: ${errorMsg}`);
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
          <Link to="/login">
            <img
              src={centraLabLogo}
              alt="CentraLab Logo"
              className="card-logo"
            />
          </Link>
          <div className="decorative-text">
            <h3>Bienvenido</h3>
            <p>Crea tu cuenta para gestionar tus resultados de laboratorio.</p>
          </div>
        </div>

        <div className="card-right-column">
          <h1 className="card-title">Crear Cuenta</h1>
          <p className="card-subtitle">Completa tus datos para registrarte</p>

          <form className="login-form" onSubmit={handleSubmit}>
            {/* Campo: Nombre Completo */}
            <div className="field-wrapper">
              <div className="identifier-container">
                <i className="fa-solid fa-signature input-icon"></i>
                <input
                  type="text"
                  placeholder="Nombre Completo"
                  name="fullname"
                  required
                  value={formData.fullname}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Campo: Usuario */}
            <div className="field-wrapper">
              <div className="identifier-container">
                <i className="fa-solid fa-user input-icon"></i>
                <input
                  type="text"
                  placeholder="Nombre de Usuario"
                  name="username"
                  required
                  value={formData.username}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Campo: Email */}
            <div className="field-wrapper">
              <div className="identifier-container">
                <i className="fa-solid fa-envelope input-icon"></i>
                <input
                  type="email"
                  placeholder="Correo Electrónico"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* SE ELIMINÓ EL CAMPO DE CONTRASEÑA */}

            <div className="button-group">
              <button
                className="ingresar-btn"
                type="submit"
                disabled={isLoading}
                style={{
                  opacity: isLoading ? 0.7 : 1,
                  cursor: isLoading ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                }}
              >
                {isLoading ? (
                  <>
                    <i className="fa-solid fa-circle-notch fa-spin"></i>
                    Procesando...
                  </>
                ) : (
                  "Registrarme"
                )}
              </button>

              <button 
                type="button"
                className="back-link-btn"
                onClick={() => navigate("/login")}
                disabled={isLoading}
                style={{
                    background: "none",
                    border: "1px solid #ddd",
                    color: "#666",
                    marginTop: "10px",
                    width: "100%",
                    padding: "0.75rem",
                    borderRadius: "8px",
                    cursor: "pointer"
                }}
              >
                Volver
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}