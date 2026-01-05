import React from "react";
import { FiCheckCircle, FiX } from "react-icons/fi";
import "../styles/modalUsuario.css"; 

const ModalExito = ({ isOpen, onClose, message }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{ zIndex: 1200 }}>
      <div 
        className="modal-container" 
        style={{ 
          width: "350px", 
          maxWidth: "90%", 
          padding: "20px",
          textAlign: "center",
          borderTop: "5px solid #10b981" // Verde éxito
        }}
      >
        <div style={{ marginTop: "10px", marginBottom: "15px", color: "#10b981" }}>
          <FiCheckCircle size={50} />
        </div>

        <h3 style={{ margin: "0 0 10px 0", color: "#1f2937" }}>¡Operación Exitosa!</h3>
        
        <p style={{ color: "#4b5563", fontSize: "0.95rem", marginBottom: "20px" }}>
          {message}
        </p>

        <button 
          onClick={onClose}
          style={{ 
            backgroundColor: "#10b981", 
            color: "white", 
            border: "none", 
            padding: "8px 30px", 
            borderRadius: "6px",
            fontWeight: "600",
            cursor: "pointer",
            width: "100%"
          }}
        >
          Aceptar
        </button>
      </div>
    </div>
  );
};

export default ModalExito;