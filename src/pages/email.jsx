import React, { useState } from "react";
import {
  FiX,
  FiSend,
  FiUser,
  FiHash,
  FiCalendar,
  FiMapPin,
} from "react-icons/fi";
import "../styles/email.css";

export default function Email({ isOpen, onClose, protocolo }) {
  const [email, setEmail] = useState("");
  const [isSending, setIsSending] = useState(false);

  if (!isOpen || !protocolo) return null;

  const handleSend = async (e) => {
    e.preventDefault();

    if (!protocolo?.protocoloid || !email) return;

    try {
      setIsSending(true);

      const url = `/api/protocols/${protocolo.protocoloid}:sendEmail`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          user: "WebPortal",
        }),
      });

      if (response.ok) {
        alert("¡Protocolo enviado con éxito!");
        setEmail("");
        onClose();
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message || "No se pudo procesar el envío"}`);
      }
    } catch (error) {
      console.error("Error de red:", error);
      alert("No se pudo conectar con el servidor de CentraLab.");
    } finally {
      setIsSending(false);
    }
  };
  const handleClose = (e) => {
    e.stopPropagation();
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>
            <FiSend /> Enviar Resultados por Email
          </h3>
          <button className="close-btn" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <div className="modal-body">
          <div className="info-summary-grid">
            {/* Fila 1 */}
            <div className="info-item">
              <label>
                <FiHash /> PROTOCOLO
              </label>
              <span>{protocolo.protocoloid}</span>
            </div>
            <div className="info-item">
              <label>
                <FiCalendar /> FECHA
              </label>
              <span>{protocolo.ordereddate}</span>
            </div>

            {/* Fila 2 */}
            <div className="info-item full-width">
              <label>
                <FiUser /> PACIENTE
              </label>
              <span>
                {protocolo.apellidopaciente}, {protocolo.nombrepaciente}
              </span>
            </div>

            {/* Fila 3 */}
            <div className="info-item">
              <label>SEXO</label>
              <span>{protocolo.pacsex === "M" ? "Masculino" : "Femenino"}</span>
            </div>
            <div className="info-item">
              <label>
                <FiMapPin /> ORIGEN
              </label>
              <span>{protocolo.paclocid || "RET"}</span>
            </div>

            {/* Fila 4 */}
            <div className="info-item">
              <label>EDAD</label>
              <span>{protocolo.pacage} años</span>
            </div>
          </div>

          <form className="email-form" onSubmit={handleSend}>
            <div className="input-group">
              <label>Correo Electrónico del Destinatario</label>
              <input
                type="email"
                placeholder="ejemplo@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>
            <button
              type="submit"
              className="btn-send-main"
              disabled={isSending}
            >
              {isSending ? (
                "Enviando..."
              ) : (
                <>
                  <FiSend /> Enviar Ahora
                </>
              )}
            </button>
          </form>

          <div className="recent-history">
            <h4>Envíos realizados</h4>
            <div className="empty-history">
              No hay envíos previos para este protocolo.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
