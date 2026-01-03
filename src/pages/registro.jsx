import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/registro.css"; // Reutilizamos estilos
import centraLabLogo from "../assets/centraLab_nuevo.png";

export default function Registro() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    fullname: "",
    email: "",
    branchidlist: [] // Inicializado para la API
  });
  
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

const handleSubmit = async (e) => { // <--- Abre función
    e.preventDefault();
    setIsLoading(true);

    const fechaActual = new Date().toISOString();

    const userPayload = { // <--- Abre objeto payload
      userid: 0,
      username: formData.username,
      fullname: formData.fullname,
      email: formData.email,
      password: "", 
      mustchangepassword: true, 
      status: "Active",
      createdate: fechaActual,
      expirationdate: "2099-12-31T23:59:59.999Z",
      canviewreserved: false,
      canviewallbranches: true,
      canviewallforwarders: false,
      isadministrator: false,
      branchidlist: [],
      forwarderidlist: [],
      branchnamelist: [],
      forwardernamelist: []
    }; // <--- Cierra objeto payload (asegúrate que esté este punto y coma)

    try { // <--- Abre TRY
      const response = await fetch("http://192.168.2.103:8075/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userPayload),
      });

      if (response.ok) {
        alert("Usuario registrado con éxito. Por favor inicia sesión.");
        navigate("/login"); 
      } else {
        const errorData = await response.json();
        alert("Error en el registro: " + (errorData.message || "Verifique los datos"));
      }
    } catch (error) { // <--- Cierra TRY, Abre CATCH
      console.error("Error de red:", error);
      alert("Error de red: No se pudo conectar con el servidor");
    } finally { // <--- Cierra CATCH, Abre FINALLY
      setIsLoading(false); 
    } // <--- Cierra FINALLY

  }; // <--- ¡ESTA ES LA LLAVE FINAL DE LA FUNCIÓN! (Asegúrate de tenerla)

  return (
    <div className="login-page">
      <div className="decorative-background">
        <div className="shape-top"></div>
        <div className="shape-bottom"></div>
      </div>

      <div className="login-card">
        <div className="card-left-column">
          <Link to="/login">
             <img src={centraLabLogo} alt="CentraLab Logo" className="card-logo" />
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
                />
              </div>
            </div>

            {/* Campo: Usuario / DNI */}
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
                />
              </div>
            </div>

            

            <div className="button-group">
              <button 
    className="ingresar-btn" 
    type="submit"
    disabled={isLoading} // Evita dobles clics
    style={{ 
      opacity: isLoading ? 0.7 : 1, 
      cursor: isLoading ? 'not-allowed' : 'pointer',
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      gap: '10px'
    }}
  >
    {isLoading ? (
      <>
        {/* Si tienes FontAwesome cargado, esto mostrará un spinner girando */}
        <i className="fa-solid fa-circle-notch fa-spin"></i> 
        Procesando...
      </>
    ) : (
      "Registrarme"
    )}
  </button>

  <Link to="/login" className="back-link-btn">
    <button type="button" disabled={isLoading}>Volver</button>
  </Link>
</div>
            
          </form>
        </div>
      </div>
    </div>
  );
}