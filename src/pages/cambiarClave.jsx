import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa"; 
import "../styles/login.css";

// --- CAMBIO AQUÍ: Importamos el logo solo (sin texto) ---
import logoSolo from "../assets/images/cl_logo.jpg"; 

export default function CrearPassword() {
  const [passwords, setPasswords] = useState({ new: "", confirm: "" });
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      alert("Las contraseñas no coinciden");
      return;
    }

    const userId = localStorage.getItem("tempUserId");
    console.log("Guardando password para usuario:", userId);
    
    alert("Contraseña creada con éxito.");
    localStorage.removeItem("tempUserId");
    navigate("/resultados");
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="card-right-column" style={{ width: "100%", padding: "60px" }}>
          
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
             {/* --- CAMBIO AQUÍ: Usamos el nuevo logo y reducimos el ancho a 100px --- */}
             <img 
               src={logoSolo} 
               alt="CentraLab Logo" 
               style={{ width: "100px", marginBottom: "20px" }} 
             />
             
             <h1 className="card-title">Crear Contraseña</h1>
             <p className="card-subtitle">
               Es tu primer ingreso. Por seguridad, define tu contraseña personal.
             </p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            
            <div className="field-wrapper">
              <div className="password-container" style={{ position: 'relative' }}>
                <input 
                  type={showPass ? "text" : "password"} 
                  placeholder="Nueva Contraseña"
                  className="password-input"
                  value={passwords.new}
                  onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                  required
                  style={{ paddingLeft: "15px" }} 
                />
                
                <button 
                  type="button" 
                  className="toggle-password-btn" 
                  onClick={() => setShowPass(!showPass)}
                  tabIndex="-1"
                  style={{ 
                    position: 'absolute', 
                    right: '15px', 
                    top: '50%', 
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#94a3b8'
                  }}
                >
                   {showPass ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                </button>
              </div>
            </div>

            <div className="field-wrapper">
               <div className="password-container" style={{ position: 'relative' }}>
                <input 
                  type={showPass ? "text" : "password"} 
                  placeholder="Repetir Contraseña"
                  className="password-input"
                  value={passwords.confirm}
                  onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                  required
                  style={{ paddingLeft: "15px" }}
                />
                
                <button 
                  type="button" 
                  className="toggle-password-btn" 
                  onClick={() => setShowPass(!showPass)}
                  tabIndex="-1"
                  style={{ 
                    position: 'absolute', 
                    right: '15px', 
                    top: '50%', 
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#94a3b8'
                  }}
                >
                   {showPass ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                </button>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "center", marginTop: "30px" }}>
                <button 
                  className="ingresar-btn" 
                  type="submit"
                  style={{ width: "100%", maxWidth: "300px" }} 
                >
                  Guardar y Entrar
                </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}