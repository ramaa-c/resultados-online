import React, { useState, useEffect } from "react";
import api from "../api/axios";
import { 
  FiX, FiSearch, FiUserPlus, FiEdit, 
  FiChevronLeft, FiChevronRight, FiTrash2,
  FiKey, 
  FiSlash,       // NUEVO: Icono para Bloquear
  FiCheckCircle  // NUEVO: Icono para Desbloquear
} from "react-icons/fi";
import ModalUsuario from "./ModalUsuario";       
import ModalEditarUsuario from "./ModalEditarUsuario"; 
import ModalConfirmacion from "./ModalConfirmacion";
import ModalExito from "./ModalExito";
import ModalError from "./ModalError";
// Importamos las nuevas funciones
import { resetUserPassword, blockUser, unblockUser } from "../services/user.service"; 
import "../styles/modalUsuario.css"; 

const ModalAdministracion = ({ isOpen, onClose }) => {
  // --- ESTADOS ---
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const initialFilters = {
    page: 1,
    pageSize: 10,
    userid: "", 
  };

  const [filters, setFilters] = useState(initialFilters);

  // Estados para modales existentes
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);

  // Estados para Reset Password
  const [isConfirmOpen, setIsConfirmOpen] = useState(false); 
  const [userToReset, setUserToReset] = useState(null);      

  // NUEVOS ESTADOS PARA BLOQUEO/DESBLOQUEO
  const [isBlockConfirmOpen, setIsBlockConfirmOpen] = useState(false);
  const [userToBlock, setUserToBlock] = useState(null);
  const [actionType, setActionType] = useState(""); // 'block' o 'release'

  // Estados compartidos de carga y feedback
  const [loadingAction, setLoadingAction] = useState(false); // Spinner general para acciones
  const [showSuccess, setShowSuccess] = useState(false);   
  const [successMsg, setSuccessMsg] = useState("");        
  const [showError, setShowError] = useState(false); 
  const [errorMsg, setErrorMsg] = useState("");      

  // --- LÓGICA DE CARGA ---
  const fetchUsers = async (currentFilters = filters) => {
    setLoading(true);
    try {
      if (currentFilters.userid && currentFilters.userid.trim() !== "") {
        try {
          const res = await api.get(`/users/${currentFilters.userid}`);
          if (res.data) setUsers([res.data]);
          else setUsers([]);
        } catch (err) {
          setUsers([]);
        }
      } 
      else {
        const params = {
          page: currentFilters.page,
          page_size: currentFilters.pageSize,
        };
        const res = await api.get("/users", { params });
        const lista = res.data.list || res.data.items || [];
        setUsers(lista);
      }
    } catch (error) {
      console.error("Error general:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, filters.page]); 

  // --- MANEJADORES DE FILTROS ---
  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleClearFilters = () => {
    setFilters(initialFilters);
    fetchUsers(initialFilters);
  };

  const handleEditClick = (user) => {
    setUserToEdit(user);
    setIsEditOpen(true);
  };

  const handleUserSaved = () => {
    fetchUsers(); 
  };

  // --- LÓGICA DE RESET PASSWORD ---
  const handleResetClick = (user) => {
    setUserToReset(user);
    setIsConfirmOpen(true);
  };

  const handleConfirmReset = async () => {
    if (!userToReset) return;
    setLoadingAction(true); 

    try {
      await resetUserPassword(userToReset.username);
      setIsConfirmOpen(false); 
      setSuccessMsg(`Se ha enviado correctamente el correo a ${userToReset.email}`);
      setShowSuccess(true);    
    } catch (error) {
      console.error("Error reset:", error);
      setIsConfirmOpen(false); 
      setErrorMsg("No se pudo enviar el correo de recuperación.");
      setShowError(true); 
    } finally {
      setLoadingAction(false); 
      setUserToReset(null);   
    }
  };

  // --- NUEVA LÓGICA: BLOQUEAR / DESBLOQUEAR ---
  const handleStatusClick = (user) => {
    // Determinamos la acción opuesta al estado actual
    // Si dice "blocked" o "bloqueado", la acción será desbloquear ('release')
    // Ajusta la condición 'blocked' según cómo venga EXACTAMENTE de tu BD
    const isBlocked = user.status?.toLowerCase().includes('block') || user.status?.toLowerCase() === 'suspendido';
    const nextAction = isBlocked ? 'release' : 'block';
    
    setUserToBlock(user);
    setActionType(nextAction);
    setIsBlockConfirmOpen(true);
  };

  const handleConfirmStatusChange = async () => {
    if (!userToBlock) return;
    setLoadingAction(true);

    try {
      if (actionType === 'block') {
        await blockUser(userToBlock.userid); // Llamamos API bloquear
        setSuccessMsg(`El usuario ${userToBlock.username} ha sido BLOQUEADO.`);
      } else {
        await unblockUser(userToBlock.userid); // Llamamos API desbloquear
        setSuccessMsg(`El usuario ${userToBlock.username} ha sido DESBLOQUEADO.`);
      }

      setIsBlockConfirmOpen(false);
      setShowSuccess(true);
      fetchUsers(); // Recargamos la lista para ver el nuevo estado
    } catch (error) {
      console.error("Error status:", error);
      setIsBlockConfirmOpen(false);
      setErrorMsg("No se pudo cambiar el estado del usuario.");
      setShowError(true);
    } finally {
      setLoadingAction(false);
      setUserToBlock(null);
    }
  };


  if (!isOpen) return null;

  // --- ESTILOS ---
  const squareBtnStyle = {
    width: '38px', height: '38px', padding: 0, display: 'flex', 
    alignItems: 'center', justifyContent: 'center', borderRadius: '6px'
  };

  const getPaginationBtnStyle = (isDisabled) => ({
    backgroundColor: isDisabled ? '#cbd5e1' : '#0198CC', 
    color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px',
    cursor: isDisabled ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center',
    gap: '8px', fontWeight: '500', transition: 'background-color 0.2s', opacity: isDisabled ? 0.7 : 1
  });

  return (
    <div className="modal-overlay" style={{ zIndex: 1000 }}>
      <div className="modal-container" style={{ width: "950px", maxWidth: "95%", height: "90vh", display: 'flex', flexDirection: 'column' }}>
        
        <div className="modal-header">
          <h2 className="modal-title">Administración de Usuarios</h2>
          <button className="modal-close-btn" onClick={onClose}><FiX /></button>
        </div>

        <div className="modal-body" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '15px', overflow: 'hidden' }}>
          
          {/* BARRA SUPERIOR */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <div className="form-group" style={{ marginBottom: 0, width: '250px' }}>
                <input 
                  type="text" className="form-input" placeholder="ID de Usuario..." 
                  value={filters.userid} onChange={(e) => setFilters({...filters, userid: e.target.value})}
                  style={{ height: '38px' }}
                />
              </div>
              <button type="submit" className="btn-save" style={squareBtnStyle} title="Buscar"><FiSearch size={18} /></button>
              <button type="button" className="btn-cancel" onClick={handleClearFilters} style={{...squareBtnStyle, color: '#dc2626', borderColor: '#fca5a5'}} title="Limpiar"><FiTrash2 size={18} /></button>
            </form>
            <button className="btn-save" onClick={() => setIsCreateOpen(true)} style={{ backgroundColor: '#0198CC', border: 'none', height: '38px' }}><FiUserPlus size={18} style={{ marginRight: 5 }} /> Nuevo Usuario</button>
          </div>

          {/* TABLA */}
          <div className="table-wrapper" style={{ flex: 1, overflow: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
            <table className="resultados-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ position: 'sticky', top: 0, zIndex: 10, backgroundColor: '#f8fafc' }}>
  <tr>
    {/* 1. ID bien pegadito (60px es suficiente para un número) */}
    <th style={{ width: '60px', textAlign: 'center' }}>ID</th>
    
    {/* 2. Usuario y Nombre ocupan espacio automático */}
    <th style={{ textAlign: 'left' }}>Usuario</th>
    <th style={{ textAlign: 'left' }}>Nombre Completo</th>
    <th style={{ textAlign: 'left' }}>Email</th>
    
    {/* 3. Admin y Estado con ancho fijo para que no bailen */}
    <th style={{ width: '80px', textAlign: 'center' }}>Admin</th>
    <th style={{ width: '100px', textAlign: 'center' }}>Estado</th>
    
    {/* 4. Acciones con espacio justo para los 3 botones (140px aprox) */}
    <th style={{ width: '140px', textAlign: 'center' }}>Acciones</th>
  </tr>
</thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>Cargando...</td></tr>
                ) : users.length === 0 ? (
                  <tr><td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>No se encontraron resultados</td></tr>
                ) : (
                  users.map((u) => {
                    // Verificamos si está bloqueado para decidir color e icono
                    const isBlocked = u.status?.toLowerCase().includes('bloqueado') || u.status?.toLowerCase() === 'suspendido';
                    
                    return (
                    <tr key={u.userid} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ color: '#64748b', textAlign: 'center' }}>{u.userid}</td>
                      <td style={{ fontWeight: '600' }}>{u.username}</td>
                      <td>{u.fullname}</td>
                      <td>{u.email}</td>
                      <td style={{ textAlign: 'center' }}>
                        {u.isadministrator && <span style={{ color: '#7c3aed', background: '#f3e8ff', padding: '2px 8px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 'bold' }}>Admin</span>}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                         {/* Badge de estado dinámico */}
                         <span className={`status-badge ${isBlocked ? 'status-pending' : 'status-complete'}`} 
                               style={isBlocked ? {backgroundColor: '#fee2e2', color: '#dc2626'} : {}}>
                           {u.status}
                         </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                            {/* BOTÓN EDITAR */}
                            <button className="btn-mini-action" onClick={() => handleEditClick(u)} title="Editar"><FiEdit size={16} /></button>
                            
                            {/* BOTÓN RESET PASSWORD */}
                            <button 
                                className="btn-mini-action" onClick={() => handleResetClick(u)} 
                                title="Restablecer Contraseña"
                                style={{ color: '#0198CC', borderColor: '#BAE6FD', backgroundColor: '#F0F9FF' }}
                            >
                                <FiKey size={16} />
                            </button>

                            {/* NUEVO BOTÓN BLOQUEAR/DESBLOQUEAR */}
                            <button 
                                className="btn-mini-action" 
                                onClick={() => handleStatusClick(u)} 
                                title={isBlocked ? "Desbloquear Usuario" : "Bloquear Usuario"}
                                style={{ 
                                    // Si está bloqueado (queremos desbloquear) -> VERDE
                                    // Si está activo (queremos bloquear) -> ROJO
                                    color: isBlocked ? '#16a34a' : '#ef4444',       
                                    borderColor: isBlocked ? '#bbf7d0' : '#fecaca', 
                                    backgroundColor: isBlocked ? '#f0fdf4' : '#fef2f2' 
                                }}
                            >
                                {isBlocked ? <FiCheckCircle size={16} /> : <FiSlash size={16} />}
                            </button>
                        </div>
                      </td>
                    </tr>
                  )})
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINACIÓN */}
          {filters.userid === "" && (
            <div className="pagination-bar" style={{ marginTop: 'auto', borderTop: '1px solid #e2e8f0', padding: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button disabled={filters.page === 1} onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))} style={getPaginationBtnStyle(filters.page === 1)}>
                <FiChevronLeft /> Anterior
              </button>
              <span style={{ fontWeight: '600', color: '#64748b' }}>Página {filters.page}</span>
              <button disabled={users.length < filters.pageSize} onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))} style={getPaginationBtnStyle(users.length < filters.pageSize)}>
                Siguiente <FiChevronRight />
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* MODALES */}
      <ModalUsuario isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} onUserSaved={handleUserSaved} />
      <ModalEditarUsuario isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} user={userToEdit} onUserUpdated={handleUserSaved} />
      
      {/* 1. Modal Confirmación RESET PASSWORD */}
      <ModalConfirmacion 
        isOpen={isConfirmOpen}
        onClose={() => !loadingAction && setIsConfirmOpen(false)}
        onConfirm={handleConfirmReset}
        isLoading={loadingAction}
        title="¿Restablecer Contraseña?"
        message={`¿Estás seguro de resetear la contraseña de ${userToReset?.username}?`}
        subMessage={`Se enviará un correo a: ${userToReset?.email}`}
      />

      {/* 2. Modal Confirmación BLOQUEO/DESBLOQUEO (NUEVO) */}
      <ModalConfirmacion 
        isOpen={isBlockConfirmOpen}
        onClose={() => !loadingAction && setIsBlockConfirmOpen(false)}
        onConfirm={handleConfirmStatusChange}
        isLoading={loadingAction}
        title={actionType === 'block' ? "¿Bloquear Usuario?" : "¿Desbloquear Usuario?"}
        message={
            actionType === 'block' 
            ? `¿Estás seguro de BLOQUEAR el acceso a ${userToBlock?.username}?` 
            : `¿Estás seguro de RESTITUIR el acceso a ${userToBlock?.username}?`
        }
        subMessage={actionType === 'block' ? "El usuario no podrá ingresar al sistema." : "El usuario podrá volver a ingresar normalmente."}
      />

      <ModalExito isOpen={showSuccess} onClose={() => setShowSuccess(false)} message={successMsg} />
      <ModalError isOpen={showError} onClose={() => setShowError(false)} message={errorMsg} />

    </div>
  );
};

export default ModalAdministracion;