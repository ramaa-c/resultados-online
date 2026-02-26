import React from "react";
import { FiX, FiUser, FiCalendar, FiMapPin, FiActivity, FiShield } from "react-icons/fi";
import "../styles/modalUsuario.css"; 

const ModalDetalleUsuario = ({ isOpen, onClose, user }) => {
  if (!isOpen || !user) return null;

  const renderList = (list) => {
    const validItems = list?.filter(item => item && item.trim() !== "");
    
    if (!validItems || validItems.length === 0) {
      return <span style={{ color: "#94a3b8", fontStyle: "italic", fontSize: "0.85rem" }}>Ninguna asignada</span>;
    }

    return (
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "4px" }}>
        {validItems.map((item, index) => (
          <span 
            key={index} 
            style={{ 
              backgroundColor: "#f8fafc", 
              color: "#475569", 
              padding: "2px 8px", 
              borderRadius: "4px", 
              fontSize: "0.75rem",
              border: "1px solid #e2e8f0",
              fontWeight: "500"
            }}
          >
            {item}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 1100 }}>
      <div className="modal-container" style={{ width: "750px", maxWidth: "95%", display: "flex", flexDirection: "column", maxHeight: "90vh" }}>
        
        {/* HEADER */}
        <div className="modal-header" style={{ padding: "15px 20px", borderBottom: "1px solid #f1f5f9" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ 
              width: "42px", height: "42px", borderRadius: "50%", 
              backgroundColor: "#0198CC", color: "white", 
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 2px 5px rgba(1, 152, 204, 0.2)"
            }}>
              <FiUser size={22} />
            </div>
            <div>
              <h2 className="modal-title" style={{ margin: 0, fontSize: "1.1rem", color: "#1e293b" }}>
                {user.fullname || user.username}
              </h2>
              <span style={{ fontSize: "0.8rem", color: "#64748b" }}>@{user.username}</span>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}><FiX /></button>
        </div>

        {/* BODY CON SCROLL */}
        <div className="modal-body" style={{ padding: "20px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "15px" }}>
          
          {/* SECCIÓN 1: DATOS PRINCIPALES */}
          <div style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", 
              gap: "15px",
              backgroundColor: "#f8fafc",
              padding: "15px",
              borderRadius: "8px",
              border: "1px solid #e2e8f0"
          }}>
            {/* Email */}
            <div>
              <label style={{ fontSize: "0.7rem", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", display: "block", marginBottom: "3px" }}>Email</label>
              <div style={{ fontSize: "0.85rem", color: "#334155", fontWeight: "500", wordBreak: "break-all" }}>{user.email || "-"}</div>
            </div>

            {/* Estado */}
            <div>
              <label style={{ fontSize: "0.7rem", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", display: "block", marginBottom: "3px" }}>Estado</label>
              <span className={`status-badge-modal ${user.status?.toLowerCase().includes("bloqueado") ? "status-pending" : "status-complete"}`} style={{ fontSize: "0.75rem", padding: "2px 8px" }}>
                  {user.status}
              </span>
            </div>

            {/* Rol */}
            <div>
               <label style={{ fontSize: "0.7rem", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", display: "block", marginBottom: "3px" }}>Rol</label>
               <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: "0.85rem", color: "#334155" }}>
                  <FiShield size={14} color="#0198CC"/>
                  {user.isadministrator ? "Admin" : "Usuario"}
               </div>
            </div>

            {/* Fechas */}
             <div>
              <label style={{ fontSize: "0.7rem", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", display: "block", marginBottom: "3px" }}>Vencimiento</label>
              <div style={{ fontSize: "0.85rem", color: "#334155", display: 'flex', alignItems: 'center', gap: "5px" }}>
                  <FiCalendar size={14} color="#64748b"/> {user.expirationdate || "-"}
              </div>
            </div>
          </div>

          {/* SECCIÓN 2: PERMISOS Y LISTAS */}
          <div style={{ display: "flex", flexDirection: "column", gap: "15px", marginTop: "5px" }}>
            
            {/* BRANCHES */}
            <div>
                <h4 style={{ fontSize: "0.85rem", color: "#1e293b", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px", borderBottom: "1px solid #f1f5f9", paddingBottom: "5px" }}>
                    <FiMapPin size={16} color="#0198CC" /> Sedes
                </h4>
                {user.canviewallbranches ? (
                    <div style={{ background: "#ecfdf5", color: "#047857", padding: "6px 10px", borderRadius: "6px", fontSize: "0.8rem", border: "1px solid #d1fae5", display: "inline-block" }}>
                        🌍 Acceso Total
                    </div>
                ) : (
                    renderList(user.branchnamelist) 
                )}
            </div>

            {/* FORWARDERS */}
            <div>
                <h4 style={{ fontSize: "0.85rem", color: "#1e293b", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px", borderBottom: "1px solid #f1f5f9", paddingBottom: "5px" }}>
                    <FiActivity size={16} color="#0198CC" /> Clientes
                </h4>
                {user.canviewallforwarders ? (
                    <div style={{ background: "#ecfdf5", color: "#047857", padding: "6px 10px", borderRadius: "6px", fontSize: "0.8rem", border: "1px solid #d1fae5", display: "inline-block" }}>
                         🏥 Acceso Total
                    </div>
                ) : (
                    renderList(user.forwardernamelist)
                )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default ModalDetalleUsuario;