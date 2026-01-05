import React from "react";
import { FiHelpCircle, FiX } from "react-icons/fi"; 
import "../styles/modalUsuario.css"; 

const ModalConfirmacion = ({ isOpen, onClose, onConfirm, title, message, subMessage, isLoading }) => {
  if (!isOpen) return null;

  const celestialBlue = "#0198CC"; 

  return (
    <div className="modal-overlay" style={{ zIndex: 1100 }}>
      {/* Estilos locales para el spinner sutil */}
      <style>
        {`
          @keyframes spin { 
            0% { transform: rotate(0deg); } 
            100% { transform: rotate(360deg); } 
          }
          .simple-spinner {
            width: 16px;
            height: 16px;
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-top: 2px solid #ffffff;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
            display: inline-block;
          }
        `}
      </style>

      <div 
        className="modal-container" 
        style={{ 
          width: "400px", 
          maxWidth: "90%", 
          padding: "20px",
          textAlign: "center",
          borderTop: `5px solid ${celestialBlue}`
        }}
      >
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          {/* Si está cargando, bloqueamos el botón de cerrar X */}
          <button 
            className="modal-close-btn" 
            onClick={!isLoading ? onClose : undefined}
            style={{ 
              opacity: isLoading ? 0.3 : 1, 
              cursor: isLoading ? 'default' : 'pointer' 
            }}
          >
            <FiX />
          </button>
        </div>

        <div style={{ marginTop: "-10px", marginBottom: "15px", color: celestialBlue }}>
          <FiHelpCircle size={54} />
        </div>

        <h3 style={{ margin: "0 0 10px 0", color: "#1f2937" }}>{title}</h3>
        
        <p style={{ color: "#4b5563", fontSize: "0.95rem", marginBottom: "5px" }}>
          {message}
        </p>
        
        {subMessage && (
          <p style={{ color: "#6b7280", fontSize: "0.85rem", fontStyle: "italic" }}>
            {subMessage}
          </p>
        )}

        <div style={{ display: "flex", gap: "15px", justifyContent: "center", marginTop: "25px" }}>
          
          {/* BOTÓN 1: CONFIRMAR (Ahora a la IZQUIERDA) */}
          <button 
            onClick={onConfirm}
            disabled={isLoading} 
            style={{ 
              backgroundColor: celestialBlue, 
              color: "white", 
              border: "none", 
              padding: "10px 24px", 
              borderRadius: "6px",
              fontWeight: "600",
              cursor: isLoading ? "wait" : "pointer",
              boxShadow: "0 2px 5px rgba(1, 152, 204, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              minWidth: "140px", // Para que no cambie de tamaño al cargar
              opacity: isLoading ? 0.9 : 1
            }}
          >
            {isLoading ? (
              <>
                <div className="simple-spinner"></div>
                <span>Enviando...</span>
              </>
            ) : (
              "Confirmar"
            )}
          </button>

          {/* BOTÓN 2: CANCELAR (Ahora a la DERECHA) */}
          <button 
            onClick={onClose}
            className="btn-cancel"
            disabled={isLoading}
            style={{ 
              padding: "10px 24px",
              opacity: isLoading ? 0.5 : 1,
              cursor: isLoading ? "not-allowed" : "pointer"
            }}
          >
            Cancelar
          </button>

        </div>
      </div>
    </div>
  );
};

export default ModalConfirmacion;