import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../api/axios";
import {
  FiSearch,
  FiUserPlus,
  FiEdit,
  FiChevronLeft,
  FiChevronRight,
  FiX,
  FiKey,
  FiSlash,
  FiCheckCircle,
} from "react-icons/fi";
import ModalUsuario from "./modalUsuario";
import ModalEditarUsuario from "./ModalEditarUsuario";
import ModalConfirmacion from "./ModalConfirmacion";
import ModalExito from "./ModalExito";
import ModalError from "./ModalError";
import {
  resetUserPassword,
  blockUser,
  unblockUser,
} from "../services/user.service";
import "../styles/modalUsuario.css";

const normalizeUsersData = (rawList) => {
  if (!Array.isArray(rawList)) return [];
  const usersMap = new Map();

  rawList.forEach((user) => {
    if (usersMap.has(user.userid)) {
      const existingUser = usersMap.get(user.userid);
      const combinedBranches = [
        ...(existingUser.branchidlist || []),
        ...(user.branchidlist || []),
      ].filter((id) => id && id !== "");
      existingUser.branchidlist = [...new Set(combinedBranches)];

      const combinedForwarders = [
        ...(existingUser.forwarderidlist || []),
        ...(user.forwarderidlist || []),
      ].filter((id) => id && id !== "");
      existingUser.forwarderidlist = [...new Set(combinedForwarders)];
    } else {
      user.branchidlist = (user.branchidlist || []).filter((id) => id !== "");
      user.forwarderidlist = (user.forwarderidlist || []).filter((id) => id !== "");
      usersMap.set(user.userid, { ...user });
    }
  });
  return Array.from(usersMap.values());
};

const ModalAdministracion = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();

  // --- FILTROS ---
  const initialFilters = {
    page: 1,
    pageSize: 10,
    userid: "",
  };
  const [filters, setFilters] = useState(initialFilters);

  const {
    data: users = [],
    isLoading,
    isError,
  } = useQuery({
    // La query depende de 'filters.searchTerm', NO de 'inputValue'
    queryKey: ["usersList", filters.page, filters.searchTerm],
    queryFn: async () => {
      // 1. SI HAY BÚSQUEDA CONFIRMADA
      if (filters.searchTerm && filters.searchTerm.trim() !== "") {
        try {
          const term = encodeURIComponent(filters.searchTerm.trim());
          const res = await api.get(`/users/${term}/:byname`);
          const result = res.data ? (Array.isArray(res.data) ? res.data : [res.data]) : [];
          return normalizeUsersData(result);
        } catch (err) {
          console.error("Error buscando usuario:", err);
          return [];
        }
      } 
      
      const params = {
        page: filters.page,
        page_size: filters.pageSize,
      };
      const res = await api.get("/users", { params });
      const rawList = res.data.list || res.data.items || [];
      
      return normalizeUsersData(rawList);
    },
    keepPreviousData: true,
    enabled: isOpen,
    refetchOnWindowFocus: false,
  });

  // --- ESTADOS LOCALES PARA MODALES DE ACCIÓN ---
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [userToReset, setUserToReset] = useState(null);

  const [isBlockConfirmOpen, setIsBlockConfirmOpen] = useState(false);
  const [userToBlock, setUserToBlock] = useState(null);
  const [actionType, setActionType] = useState("");

  const [loadingAction, setLoadingAction] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [showError, setShowError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // --- MANEJADORES ---

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters((prev) => ({ 
        ...prev, 
        page: 1, 
        searchTerm: inputValue
    })); 
  };

  const handleClearFilters = () => {
    setInputValue("");
    setFilters(initialFilters);
  };

  const handleUserSaved = () => {
    queryClient.invalidateQueries(["usersList"]);
  };

  const handleEditClick = (user) => {
    setUserToEdit(user);
    setIsEditOpen(true);
  };

  // --- RESET PASSWORD ---
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
      setSuccessMsg(`Correo enviado a ${userToReset.email}`);
      setShowSuccess(true);
    } catch (error) {
      console.error(error);
      setIsConfirmOpen(false);
      setErrorMsg("Error al enviar correo.");
      setShowError(true);
    } finally {
      setLoadingAction(false);
      setUserToReset(null);
    }
  };

  // --- BLOQUEAR / DESBLOQUEAR ---
  const handleStatusClick = (user) => {
    const currentStatus = user.status ? user.status.toLowerCase().trim() : "";
    const action = currentStatus === "activo" || currentStatus === "active" ? "block" : "release";
    setUserToBlock(user);
    setActionType(action);
    setIsBlockConfirmOpen(true);
  };

  const handleConfirmStatusChange = async () => {
    if (!userToBlock) return;
    setLoadingAction(true);

    try {
      if (actionType === "block") {
        await blockUser(userToBlock.userid);
        setSuccessMsg(`Usuario ${userToBlock.username} BLOQUEADO.`);
      } else {
        await unblockUser(userToBlock.userid);
        setSuccessMsg(`Usuario ${userToBlock.username} DESBLOQUEADO.`);
      }

      setIsBlockConfirmOpen(false);
      setShowSuccess(true);
      queryClient.invalidateQueries(["usersList"]);

    } catch (error) {
      console.error(error);
      setIsBlockConfirmOpen(false);
      setErrorMsg("No se pudo cambiar el estado.");
      setShowError(true);
    } finally {
      setLoadingAction(false);
      setUserToBlock(null);
    }
  };

  if (!isOpen) return null;

  // --- ESTILOS ---
  const getPaginationBtnStyle = (isDisabled) => ({
    backgroundColor: isDisabled ? "#cbd5e1" : "#0198CC",
    color: "white",
    border: "none",
    padding: "8px 16px",
    borderRadius: "6px",
    cursor: isDisabled ? "not-allowed" : "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontWeight: "500",
    opacity: isDisabled ? 0.7 : 1,
  });

  return (
    <div className="modal-overlay" style={{ zIndex: 1000 }}>
      <div
        className="modal-container"
        style={{
          width: "950px",
          maxWidth: "95%",
          height: "90vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div className="modal-header">
          <h2 className="modal-title">Administración de Usuarios</h2>
          <button className="modal-close-btn" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <div className="modal-body" style={{ flex: 1, display: "flex", flexDirection: "column", gap: "15px", overflow: "hidden" }}>
          
          {/* BARRA SUPERIOR (BÚSQUEDA) */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
            
            {/* FORMULARIO DE BÚSQUEDA */}
            <form onSubmit={handleSearch} style={{ flex: 1, maxWidth: '400px' }}>
              <div className="input-group-wrapper" style={{ display: "flex", alignItems: "center", border: "1px solid #ccc", borderRadius: "6px", backgroundColor: "white", padding: "0 8px", width: "100%", height: "38px", gap: "5px" }}>
                
                <button type="submit" style={{ background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", color: "#666" }} title="Buscar">
                  <FiSearch size={18} />
                </button>
                
                <input
                  type="text"
                  placeholder="Usuario o Email..." 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  style={{ border: "none", outline: "none", background: "transparent", flex: 1, height: "100%", fontSize: "14px", color: "#333" }}
                />
                
                {(inputValue || filters.searchTerm) && (
                    <button type="button" onClick={handleClearFilters} style={{ background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", color: "#dc2626" }} title="Limpiar filtro">
                    <FiX size={16} />
                    </button>
                )}
              </div>
            </form>

            <button
              className="btn-save"
              onClick={() => setIsCreateOpen(true)}
              style={{ backgroundColor: "#0198CC", border: "none", height: "38px" }}
            >
              <FiUserPlus size={18} style={{ marginRight: 5 }} /> Nuevo Usuario
            </button>
          </div>

          {/* TABLA */}
          <div className="table-wrapper" style={{ flex: 1, overflow: "auto", border: "1px solid #e2e8f0", borderRadius: "8px" }}>
            <table className="resultados-table" style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead style={{ position: "sticky", top: 0, zIndex: 10, backgroundColor: "#f8fafc" }}>
                <tr>
                  <th style={{ textAlign: "left", paddingLeft: "15px", width: "15%" }}>Usuario</th>
                  <th style={{ textAlign: "left", width: "35%" }}>Nombre Completo</th>
                  <th style={{ textAlign: "left" }}>Email</th>
                  <th style={{ width: "80px", textAlign: "center" }}>Admin</th>
                  <th style={{ width: "100px", textAlign: "center" }}>Estado</th>
                  <th style={{ width: "140px", textAlign: "center" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center", padding: "40px" }}>Cargando usuarios...</td>
                  </tr>
                ) : isError ? (
                   <tr>
                    <td colSpan="6" style={{ textAlign: "center", padding: "40px", color: "red" }}>Error al cargar datos.</td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center", padding: "40px" }}>No se encontraron resultados</td>
                  </tr>
                ) : (
                  users.map((u) => {
                    const isBlocked = u.status?.toLowerCase().includes("bloqueado") || u.status?.toLowerCase() === "suspendido";
                    return (
                      <tr key={u.userid} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ fontWeight: "600", paddingLeft: "15px" }}>{u.username}</td>
                        <td style={{ color: "#334155", whiteSpace: "nowrap" }}>{u.fullname}</td>
                        <td>{u.email}</td>
                        <td style={{ textAlign: "center" }}>
                          {u.isadministrator && (
                            <span style={{ color: "#7c3aed", background: "#f3e8ff", padding: "2px 8px", borderRadius: "10px", fontSize: "0.8rem", fontWeight: "bold" }}>
                              Admin
                            </span>
                          )}
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <span className={`status-badge ${isBlocked ? "status-pending" : "status-complete"}`}
                            style={isBlocked ? { backgroundColor: "#fee2e2", color: "#dc2626" } : {}}
                          >
                            {u.status}
                          </span>
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <div style={{ display: "flex", justifyContent: "center", gap: "8px" }}>
                            <button className="btn-mini-action" onClick={() => handleEditClick(u)} title="Editar">
                              <FiEdit size={16} />
                            </button>
                            <button className="btn-mini-action" onClick={() => handleResetClick(u)} title="Reset Password" style={{ color: "#0198CC", borderColor: "#BAE6FD", backgroundColor: "#F0F9FF" }}>
                              <FiKey size={16} />
                            </button>
                            <button className="btn-mini-action" onClick={() => handleStatusClick(u)} title={isBlocked ? "Desbloquear" : "Bloquear"} style={{ color: isBlocked ? "#16a34a" : "#ef4444", borderColor: isBlocked ? "#bbf7d0" : "#fecaca", backgroundColor: isBlocked ? "#f0fdf4" : "#fef2f2" }}>
                              {isBlocked ? <FiCheckCircle size={16} /> : <FiSlash size={16} />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINACIÓN - Se oculta si hay una búsqueda activa */}
          {filters.searchTerm === "" && (
            <div className="pagination-bar" style={{ marginTop: "auto", borderTop: "1px solid #e2e8f0", padding: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <button
                disabled={filters.page === 1}
                onClick={() => setFilters((prev) => ({ ...prev, page: prev.page - 1 }))}
                style={getPaginationBtnStyle(filters.page === 1)}
              >
                <FiChevronLeft /> Anterior
              </button>
              <span style={{ fontWeight: "600", color: "#64748b" }}>Página {filters.page}</span>
              <button
                disabled={users.length < filters.pageSize}
                onClick={() => setFilters((prev) => ({ ...prev, page: prev.page + 1 }))}
                style={getPaginationBtnStyle(users.length < filters.pageSize)}
              >
                Siguiente <FiChevronRight />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* MODALES */}
      <ModalUsuario
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onUserSaved={handleUserSaved}
      />
      <ModalEditarUsuario
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        user={userToEdit}
        onUserUpdated={handleUserSaved}
      />

      <ModalConfirmacion
        isOpen={isConfirmOpen}
        onClose={() => !loadingAction && setIsConfirmOpen(false)}
        onConfirm={handleConfirmReset}
        isLoading={loadingAction}
        title="¿Restablecer Contraseña?"
        message={`¿Estás seguro de resetear la contraseña de ${userToReset?.username}?`}
        subMessage={`Se enviará un correo a: ${userToReset?.email}`}
      />

      <ModalConfirmacion
        isOpen={isBlockConfirmOpen}
        onClose={() => !loadingAction && setIsBlockConfirmOpen(false)}
        onConfirm={handleConfirmStatusChange}
        isLoading={loadingAction}
        title={actionType === "block" ? "¿Bloquear Usuario?" : "¿Desbloquear Usuario?"}
        message={actionType === "block" ? `¿Bloquear a ${userToBlock?.username}?` : `¿Restituir a ${userToBlock?.username}?`}
        subMessage={actionType === "block" ? "No podrá ingresar al sistema." : "Podrá ingresar nuevamente."}
      />

      <ModalExito isOpen={showSuccess} onClose={() => setShowSuccess(false)} message={successMsg} />
      <ModalError isOpen={showError} onClose={() => setShowError(false)} message={errorMsg} />
    </div>
  );
};

export default ModalAdministracion;