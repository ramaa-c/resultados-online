import React, { useState } from "react";
import api from "../api/axios";
import { FiSearch, FiX, FiAlertCircle } from "react-icons/fi";
import "../styles/modalUsuario.css";

const ModalBuscarUsuario = ({ isOpen, onClose, onUserFound }) => {
  const [userId, setUserId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!userId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get(`/users/${userId}`);
      
      if (response.data) {
        onUserFound(response.data);
        setUserId("");
        onClose();
      } else {
        setError("La API no devolvió datos para este ID.");
      }
    } catch (err) {
      console.error(err);
      if (err.response && err.response.status === 404) {
        setError("Usuario no encontrado (ID inválido).");
      } else {
        setError("Error al buscar el usuario.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container" style={{ width: "400px", maxWidth: "90%" }}>
        
        {/* HEADER */}
        <div className="modal-header">
          <h2 className="modal-title">
            <FiSearch /> Buscar Usuario
          </h2>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            <FiX />
          </button>
        </div>

        {/* BODY */}
        <form onSubmit={handleSearch} className="modal-form">
          <div className="modal-body" style={{ overflow: "visible" }}>
            <div className="form-group">
              <label className="form-label">Ingrese ID del Usuario</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ej: 123"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  autoFocus
                />
              </div>
              {error && (
                <div style={{ 
                  marginTop: '10px', 
                  color: '#dc2626', 
                  fontSize: '0.9rem', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '5px' 
                }}>
                  <FiAlertCircle /> {error}
                </div>
              )}
            </div>
          </div>

          {/* FOOTER */}
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-cancel">
              Cancelar
            </button>
            <button 
              type="submit" 
              className="btn-save" 
              disabled={isLoading || !userId}
            >
              {isLoading ? "Buscando..." : "Buscar y Editar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalBuscarUsuario;