import React from "react";
import { FiAlertTriangle, FiX } from "react-icons/fi";
import "../styles/modalUsuario.css"; 

const ModalError = ({ isOpen, onClose, message }) => {
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
          borderTop: "5px solid #ef4444" // Rojo Error
        }}
      >
        {/* Botón X para cerrar rápido */}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button className="modal-close-btn" onClick={onClose}>
                <FiX />
            </button>
        </div>

        <div style={{ marginTop: "-10px", marginBottom: "15px", color: "#ef4444" }}>
          <FiAlertTriangle size={50} />
        </div>

        <h3 style={{ margin: "0 0 10px 0", color: "#1f2937" }}>Ocurrió un error</h3>
        
        <p style={{ color: "#4b5563", fontSize: "0.95rem", marginBottom: "20px" }}>
          {message || "No se pudo completar la operación."}
        </p>

        <button 
          onClick={onClose}
          style={{ 
            backgroundColor: "#ef4444", 
            color: "white", 
            border: "none", 
            padding: "8px 30px", 
            borderRadius: "6px",
            fontWeight: "600",
            cursor: "pointer",
            width: "100%",
            boxShadow: "0 2px 5px rgba(239, 68, 68, 0.3)"
          }}
        >
          Cerrar
        </button>
      </div>
    </div>
  );
};

export default ModalError;