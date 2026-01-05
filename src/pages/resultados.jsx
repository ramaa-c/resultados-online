import React, { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useProtocols } from "../hooks/useProtocols";
import { useProtocolResults } from "../hooks/useProtocolResults";
import { useProtocolMutations } from "../hooks/useProtocolMutations";
import { getProtocolPdf } from "../services/protocols.service";
import { useNavigate } from "react-router-dom";
import ModalUsuario from "../components/modalUsuario";
import ModalEditarUsuario from '../components/ModalEditarUsuario';
import ModalBuscarUsuario from '../components/ModalBuscarUsuario';
import "../styles/resultados.css";
import centraLabLogo from "../assets/centraLab_nuevo.png";
import Email from "./email";
import "../styles/email.css";
import JSZip from "jszip";
import { saveAs } from "file-saver";

import {
  FiFilter,
  FiSearch,
  FiFileText,
  FiEye,
  FiDownload,
  FiPrinter,
  FiActivity,
  FiCheckCircle,
  FiClock,
  FiMail,
  FiInfo,
  FiTrash2,
  FiBookOpen,
  FiBookmark,
  FiLogOut,
  FiUser,
  FiUserPlus,
  FiEdit,
} from "react-icons/fi";

export default function Resultados() {
  const queryClient = useQueryClient();

  const [formValues, setFormValues] = useState({
    date_from: "",
    date_to: "",
    patient_id_number: "",
    patient_name: "",
    apellido_paciente: "",
    accession_number: "",
    page: 1,
    page_size: 15,
    branch_id: "",
    unread_only: false,
    complete_only: false,
  });
  const navigate = useNavigate();
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState(formValues);
  const [user, setUser] = useState({ fullname: "Usuario" });
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
  const [isModifyUserModalOpen, setIsModifyUserModalOpen] = useState(false);
  const [isSearchUserModalOpen, setIsSearchUserModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("userData");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
      } catch (e) {
        console.error("Error leyendo usuario", e);
      }
    }
  }, []);

  const handleUserFound = (userData) => {
  // 1. Guardamos el usuario que vino de la API en el estado
  setUserToEdit(userData);
  // 2. Abrimos el modal de EDICIÓN (el que ya tenías)
  setIsEditOpen(true); 
};
  const handleProfileUpdated = () => {
    // 1. Cerramos el modal
    setIsModifyUserModalOpen(false);
    
    // 2. Opcional: Si tu API devuelve el usuario actualizado, podrías actualizar el estado 'user'.
    // Como mínimo, mostramos confirmación.
    alert("Datos de usuario actualizados correctamente.");
    
    // 3. Si cambiaste datos críticos (como el nombre que se muestra en el sidebar),
    // podrías necesitar recargar los datos del usuario desde localStorage o API.
    const storedUser = localStorage.getItem("userData");
    if (storedUser) {
       setUser(JSON.parse(storedUser));
    }
  };

  // --- SELECCIÓN MÚLTIPLE ---
  const [selectedItems, setSelectedItems] = useState([]);

  const [selectedProtocol, setSelectedProtocol] = useState(null);

  const [contextMenu, setContextMenu] = useState(null);

  const { markRead, markUnread } = useProtocolMutations();
  const { data, isLoading, isError, isFetching } = useProtocols(activeFilters);

  const {
    data: resultsData,
    isLoading: isLoadingResults,
    isError: isErrorResults,
  } = useProtocolResults(selectedProtocol?.protocoloid);

  const [showFilters, setShowFilters] = useState(false);
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [isDownloadLoading, setIsDownloadLoading] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // --- LÓGICA DE CLICS (CORREGIDA) ---
  useEffect(() => {
    const handleClick = (e) => {
      setContextMenu(null);

      const isClickInsideTable = e.target.closest(".resultados-table");
      const isClickInsideToolbar = e.target.closest(".panel-header-actions");
      const isClickInsidePagination = e.target.closest(".pagination-bar");
      const isClickInsideSidebar = e.target.closest(".sidebar-filters");
      const isClickInsideContextMenu = e.target.closest(".context-menu");
      const isClickInsideDetailPanel = e.target.closest(".detail-panel");

      if (
        !isClickInsideTable &&
        !isClickInsideToolbar &&
        !isClickInsidePagination &&
        !isClickInsideSidebar &&
        !isClickInsideContextMenu
      ) {
        if (isClickInsideDetailPanel && selectedProtocol) {
          return;
        }

        setSelectedItems([]);
        setSelectedProtocol(null);
      }
    };

    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, [selectedProtocol]);

  // --- MANEJADORES DE SELECCIÓN ---
  const handleRowClick = (e, item) => {
    if (e.ctrlKey || e.metaKey) {
      setSelectedItems((prev) => {
        const exists = prev.find((p) => p.protocoloid === item.protocoloid);
        if (exists) {
          return prev.filter((p) => p.protocoloid !== item.protocoloid);
        } else {
          return [...prev, item];
        }
      });
    } else {
      setSelectedItems([item]);
    }
  };

  const isSelected = (id) => selectedItems.some((p) => p.protocoloid === id);

  // --- MANEJADORES DE ACCIONES ---
  const handleViewResults = (protocoloOverride = null) => {
    const target =
      protocoloOverride ||
      (selectedItems.length === 1 ? selectedItems[0] : null);

    if (target) {
      setSelectedProtocol(target);

      if (target.leido === "0") {
        markRead.mutate(target.protocoloid);
        target.leido = "1";

        setSelectedItems((prev) =>
          prev.map((item) =>
            item.protocoloid === target.protocoloid
              ? { ...item, leido: "1" }
              : item
          )
        );
      }
    }
  };

  // --- PREFETCH  ---
  useEffect(() => {
    if (selectedItems.length === 1) {
      const protocolo = selectedItems[0];

      if (protocolo.completo !== "") {
        queryClient.prefetchQuery({
          queryKey: ["protocolResults", String(protocolo.protocoloid)],
          queryFn: () => getProtocolResults(protocolo.protocoloid),
          staleTime: 1000 * 60 * 5,
        });
      }
    }
  }, [selectedItems, queryClient]);

  const handleContextMenu = (e, item) => {
    e.preventDefault();
    setSelectedItems([item]);
    setContextMenu({
      mouseX: e.clientX,
      mouseY: e.clientY,
      item: item,
    });
  };

  // --- VISUALIZAR PDF (SOLO UNO) ---
  const handleViewPDF = async (protocolId) => {
    if (!protocolId || isPdfLoading) return;
    setIsPdfLoading(true);
    try {
      const blob = await getProtocolPdf(protocolId);

      const url = window.URL.createObjectURL(blob);
      const width = 1000;
      const height = 800;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;
      window.open(
        url,
        `PDF_${protocolId}`,
        `width=${width},height=${height},top=${top},left=${left}`
      );
      setTimeout(() => window.URL.revokeObjectURL(url), 100);
    } catch (error) {
      console.error(error);
      alert("Error al abrir el PDF. Verifique su sesión.");
    } finally {
      setIsPdfLoading(false);
    }
  };

  const handleDownloadAction = async () => {
    const itemsToDownload = selectedItems.filter((p) => p.completo !== "");

    if (itemsToDownload.length === 0 || isDownloadLoading) return;

    setIsDownloadLoading(true);

    try {
      // --- CASO A: SOLO UN ARCHIVO (Descarga directa PDF) ---
      if (itemsToDownload.length === 1) {
        const protocolo = itemsToDownload[0];

        const blob = await getProtocolPdf(protocolo.protocoloid);

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
          "download",
          `Protocolo_${protocolo.accessionnumber}.pdf`
        );
        document.body.appendChild(link);
        link.click();

        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);
      }

      // --- CASO B: MÚLTIPLES ARCHIVOS (Generar ZIP) ---
      else {
        const zip = new JSZip();

        const promesas = itemsToDownload.map(async (protocolo) => {
          try {
            const blob = await getProtocolPdf(protocolo.protocoloid);
            zip.file(`Protocolo_${protocolo.accessionnumber}.pdf`, blob);
          } catch (err) {
            console.error(
              `Error descargando protocolo ${protocolo.accessionnumber}`,
              err
            );
          }
        });

        await Promise.all(promesas);
        const content = await zip.generateAsync({ type: "blob" });
        const fechaHoy = new Date().toISOString().slice(0, 10);
        saveAs(content, `Resultados_CentraLab_${fechaHoy}.zip`);
      }
    } catch (error) {
      console.error(error);
      alert("Error en la descarga: " + error.message);
    } finally {
      setIsDownloadLoading(false);
    }
  };

  // --- FILTROS Y PAGINACIÓN ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };
  const handleSearch = (e) => {
    e.preventDefault();
    const newFilters = { ...formValues, page: 1 };
    setFormValues(newFilters);
    setActiveFilters(newFilters);
  };
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: checked }));
  };
  const handleReset = () => {
    const resetValues = {
      date_from: "",
      date_to: "",
      patient_id_number: "",
      patient_name: "",
      apellido_paciente: "",
      accession_number: "",
      page: 1,
      page_size: 15,
      branch_id: "",
      unread_only: false,
      complete_only: false,
    };
    setFormValues(resetValues);
    setActiveFilters(resetValues);
    setSelectedItems([]);
  };
  const handlePageChange = (newPage) => {
    const updatedValues = { ...formValues, page: Number(newPage) };
    setFormValues(updatedValues);
    setActiveFilters(updatedValues);
  };
  const handlePreviousPage = () => {
    if (formValues.page > 1) {
      handlePageChange(formValues.page - 1);
    }
  };
  const handleNextPage = () => {
    if (data?.protocolos?.length === Number(formValues.page_size)) {
      handlePageChange(formValues.page + 1);
    }
  };
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return dateString;
  };

  const hasDownloadableItems = selectedItems.some(
    (item) => item.completo !== ""
  );

  const isPdfDisabled =
    selectedItems.length !== 1 ||
    selectedItems[0]?.completo === "" ||
    isPdfLoading;

  return (
    <div className="dashboard-container">
      {/* SIDEBAR FILTROS */}
      <aside className="sidebar-filters" data-click-safe="true">
        <div className="sidebar-header">
          {centraLabLogo ? (
            <img src={centraLabLogo} alt="CentraLab" className="sidebar-logo" />
          ) : (
            <h2>CentraLab</h2>
          )}
          <div
            className={`filter-toggle-btn ${showFilters ? "active" : ""}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <FiFilter />
            <span>{showFilters ? "Ocultar Filtros" : "Mostrar Filtros"}</span>
            <span className="arrow-icon">{showFilters ? "▲" : "▼"}</span>
          </div>
        </div>

        <div className={`filters-collapsible ${showFilters ? "show" : ""}`}>
          <form className="filters-form" onSubmit={handleSearch}>
            <div className="filter-group">
              <label>Fecha Desde</label>
              <div className="input-wrapper">
                <input
                  type="date"
                  name="date_from"
                  value={formValues.date_from}
                  onChange={handleInputChange}
                  className="input-modern pl-icon"
                />
              </div>
            </div>
            <div className="filter-group">
              <label>Fecha Hasta</label>
              <div className="input-wrapper">
                <input
                  type="date"
                  name="date_to"
                  value={formValues.date_to}
                  onChange={handleInputChange}
                  className="input-modern pl-icon"
                />
              </div>
            </div>

            <div className="filter-group">
              <label>DNI Paciente</label>
              <input
                type="text"
                name="patient_id_number"
                value={formValues.patient_id_number}
                onChange={handleInputChange}
                className="input-modern"
                placeholder="Ej: 25459633"
              />
            </div>
            <div className="filter-group">
              <label>Apellido</label>
              <input
                type="text"
                name="apellido_paciente"
                value={formValues.apellido_paciente}
                onChange={handleInputChange}
                className="input-modern"
                placeholder="Buscar apellido..."
              />
            </div>
            <div className="filter-group">
              <label>Estado del Protocolo</label>
              <div className="filter-checkbox-container">
                {/* Checkbox Completo */}
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="complete_only"
                    checked={formValues.complete_only}
                    onChange={handleCheckboxChange}
                  />
                  Completo
                </label>

                {/* Checkbox En Proceso */}
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="in_process"
                    checked={formValues.in_process || false}
                    onChange={handleCheckboxChange}
                  />
                  En Proceso
                </label>
              </div>
            </div>
            <div className="filter-group">
              <label>ID Petición</label>
              <div className="input-wrapper">
                <input
                  type="text"
                  name="accession_number"
                  value={formValues.accession_number}
                  onChange={handleInputChange}
                  className="input-modern pl-icon"
                  placeholder="Protocolo / ID"
                />
              </div>
            </div>
            <div className="filter-row">
              <div className="filter-group half">
                <label>Pág.</label>
                <input
                  type="number"
                  name="page"
                  value={formValues.page}
                  onChange={(e) => handlePageChange(e.target.value)}
                  className="input-modern"
                  min={1}
                />
              </div>
              <div className="filter-group half">
                <label>Filas</label>
                <select
                  name="page_size"
                  value={formValues.page_size}
                  onChange={handleInputChange}
                  className="input-modern"
                >
                  <option value={15}>15</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                marginTop: "-10px",
              }}
            >
              <button
                type="submit"
                className="btn-filtrar"
                disabled={isLoading}
                style={{
                  width: "100%",
                  opacity: isLoading ? 0.7 : 1,
                  cursor: isLoading ? "wait" : "pointer",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                {isLoading ? (
                  <>
                    <span className="spinner-loader"></span>
                    Buscando...
                  </>
                ) : (
                  <>
                    <FiSearch /> Buscar
                  </>
                )}
              </button>
              <button
                type="button"
                className="btn-filtrar"
                onClick={handleReset}
                disabled={isLoading}
                style={{
                  width: "100%",
                  backgroundColor: "transparent",
                  color: "#64748B",
                  border: "1px solid #CBD5E1",
                  boxShadow: "none",
                  marginTop: "-10px",
                }}
              >
                <FiTrash2 /> Limpiar Filtros
              </button>
            </div>
          </form>
        </div>

        {!showFilters && (
          <div
            style={{
              marginTop: "auto",
              padding: "1rem",
              borderTop: "1px solid #e2e8f0",
              backgroundColor: "#f8fafc",
              display: "flex",
              flexDirection: "column",
              gap: "15px",
            }}
          >
            {/* --- BOTONES ADMINISTRATIVOS --- */}
            <div>
              <p
                style={{
                  fontSize: "0.7rem",
                  fontWeight: "700",
                  color: "#94a3b8",
                  marginBottom: "8px",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  textAlign: "center",
                  width: "100%",
                }}
              >
                Administración
              </p>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1px",
                }}
              >
                {/* Botón Nuevo Usuario */}
                <button
                  onClick={() => setIsCreateUserModalOpen(true)}
                  className="btn-filtrar"
                  style={{
                    backgroundColor: "#0198CC",
                    color: "white",
                    border: "none",
                    width: "100%",
                    justifyContent: "flex-start",
                    padding: "10px 12px",
                    fontSize: "0.9rem",
                    fontWeight: "600",
                    borderRadius: "6px",
                    boxShadow: "0 2px 4px rgba(1, 152, 204, 0.2)",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <FiUserPlus size={18} />
                  Nuevo Usuario
                </button>

                {/* Botón Modificar Usuario */}
                <button
                  onClick={() => setIsSearchUserModalOpen(true)}
                  className="btn-filtrar"
                  style={{
                    backgroundColor: "white",
                    color: "#475569",
                    border: "1px solid #cbd5e1",
                    width: "100%",
                    justifyContent: "flex-start",
                    padding: "10px 12px",
                    fontSize: "0.9rem",
                    fontWeight: "600",
                    borderRadius: "6px",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    transition: "all 0.2s ease",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = "#0198CC";
                    e.currentTarget.style.color = "#0198CC";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = "#cbd5e1";
                    e.currentTarget.style.color = "#475569";
                  }}
                >
                  <FiEdit size={18} />
                  Modificar Usuario
                </button>
              </div>
            </div>

            <div style={{ borderTop: "1px dashed #cbd5e1", margin: "5px 0" }} />
            {/* --- SECCIÓN DE USUARIO --- */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "15px",
                paddingBottom: "15px",
                borderBottom: "1px dashed #e2e8f0",
              }}
            >
              <div
                style={{
                  width: "35px",
                  height: "35px",
                  borderRadius: "50%",
                  backgroundColor: "#e0f2fe",
                  color: "#0284c7",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <FiUser size={18} />
              </div>
              <div style={{ overflow: "hidden" }}>
                <p
                  style={{
                    margin: 0,
                    fontWeight: "600",
                    fontSize: "0.85rem",
                    color: "#334155",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: "140px",
                  }}
                  title={user.fullname}
                >
                  {user.fullname}
                </p>
                <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                  Usuario
                </span>
              </div>
            </div>

            {/* --- BOTÓN CERRAR SESIÓN --- */}
            <button
              onClick={handleLogout}
              className="btn-filtrar"
              style={{
                backgroundColor: "white",
                color: "#dc2626",
                borderColor: "#fecaca",
                width: "100%",
                justifyContent: "center",
                transition: "all 0.2s",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.backgroundColor = "#fff0f0")
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.backgroundColor = "white")
              }
            >
              <FiLogOut /> Cerrar Sesión
            </button>
          </div>
        )}
      </aside>

      {/* PANEL DE RESULTADOS */}
      <main className="split-view">
        <section className="list-panel">
          <div className="panel-header-actions">
            <button
              className="btn-mini-action"
              onClick={() => setIsEmailModalOpen(true)}
              disabled={selectedItems.length !== 1}
              style={{ opacity: selectedItems.length !== 1 ? 0.5 : 1 }}
            >
              <FiMail size={20} /> Enviar por Email
            </button>

            {/* --- BOTÓN VISUALIZAR PDF --- */}
            <button
              className="btn-mini-action"
              onClick={() => handleViewPDF(selectedItems[0]?.protocoloid)}
              disabled={isPdfDisabled}
              style={{ opacity: isPdfDisabled ? 0.5 : 1 }}
            >
              {isPdfLoading ? (
                "..."
              ) : (
                <>
                  <FiFileText size={20} /> Visualizar PDF
                </>
              )}
            </button>

            <button
              className="btn-mini-action"
              onClick={() => handleViewResults()}
              disabled={selectedItems.length !== 1}
              style={{ opacity: selectedItems.length !== 1 ? 0.5 : 1 }}
            >
              <FiEye size={20} /> Ver Resultados
            </button>

            <button
              className="btn-mini-action"
              onClick={handleDownloadAction}
              disabled={!hasDownloadableItems || isDownloadLoading}
              title={
                !hasDownloadableItems
                  ? "Seleccione al menos un protocolo completo"
                  : ""
              }
              style={{ opacity: !hasDownloadableItems ? 0.5 : 1 }}
            >
              {isDownloadLoading ? (
                "Procesando..."
              ) : (
                <>
                  <FiDownload size={20} />
                  {selectedItems.length > 1 ? " Descargar Todo" : " Descargar"}
                </>
              )}
            </button>
          </div>

          <div className="table-wrapper">
            {isFetching && !isLoading && (
              <div className="loading-overlay">
                <div className="spinner"></div>
              </div>
            )}
            {isError && (
              <div
                style={{
                  color: "red",
                  padding: "20px",
                  textAlign: "center",
                }}
              >
                Error al cargar los datos.
              </div>
            )}

            <table className="resultados-table" data-click-safe="true">
              <thead>
                <tr>
                  <th>Apellido y Nombre / Datos</th>
                  <th>Protocolo</th>
                  <th style={{ textAlign: "center" }}>Debe</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {data?.protocolos?.map((item) => {
                  const isUnread = item.leido === "0";
                  const selected = isSelected(item.protocoloid);
                  return (
                    <tr
                      key={item.protocoloid}
                      className={`${selected ? "selected-row" : ""} ${
                        isUnread ? "font-bold-unread" : ""
                      }`}
                      onClick={(e) => handleRowClick(e, item)}
                      onDoubleClick={() => handleViewResults(item)}
                      onContextMenu={(e) => handleContextMenu(e, item)}
                    >
                      {/* Columna combinada de Nombre, DNI y Fecha */}
                      <td className="patient-info-cell">
                        <div className="patient-main-info">
                          <div className="name-with-dot">
                            {item.leido === "0" && (
                              <span
                                className="unread-dot-inline"
                                title="No leído"
                              ></span>
                            )}
                            <span className="name-text">
                              {item.apellidopaciente}, {item.nombrepaciente}
                            </span>
                          </div>

                          {/* Segunda línea: DNI y Fecha */}
                          <div className="patient-subdata">
                            <span>
                              DNI{" "}
                              {item.pacid
                                .toString()
                                .replace(/DNI/gi, "")
                                .trim()}
                            </span>
                            <span className="separator">•</span>
                            <span>Ingreso: {formatDate(item.ordereddate)}</span>
                          </div>
                        </div>
                      </td>

                      {/* Columna de Protocolo */}
                      <td className="font-mono">{item.accessionnumber}</td>

                      {/* Indicador del DEBE */}
                      <td style={{ textAlign: "center" }}>
                        <span
                          className={`indicator-dot ${
                            item.debe ? "dot-red" : "dot-green"
                          }`}
                          title={item.debe ? "Posee Deuda" : "Sin Deuda"}
                        ></span>
                      </td>

                      {/* Estado */}
                      <td>
                        {item.completo !== "" ? (
                          <span className="status-badge status-complete">
                            <FiCheckCircle /> Completo
                          </span>
                        ) : (
                          <span className="status-badge status-pending">
                            <FiClock /> En proceso
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div
              className="pagination-bar"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "0.8rem",
                borderTop: "1px solid #eee",
              }}
            >
              <span style={{ color: "#666", fontSize: "0.9rem" }}>
                Mostrando {data?.protocolos?.length || 0} resultados
              </span>
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  alignItems: "center",
                }}
              >
                <button
                  onClick={handlePreviousPage}
                  disabled={formValues.page === 1 || isLoading}
                  className="btn-pagination"
                  style={{
                    padding: "8px 16px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    background: formValues.page === 1 ? "#f5f5f5" : "white",
                    cursor: formValues.page === 1 ? "not-allowed" : "pointer",
                    color: formValues.page === 1 ? "#aaa" : "#333",
                  }}
                >
                  &lt; Anterior
                </button>
                <span
                  style={{
                    fontWeight: "bold",
                    minWidth: "30px",
                    textAlign: "center",
                  }}
                >
                  {formValues.page}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={
                    isLoading ||
                    (data?.protocolos?.length || 0) <
                      Number(formValues.page_size)
                  }
                  className="btn-pagination"
                  style={{
                    padding: "8px 16px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    background:
                      (data?.protocolos?.length || 0) <
                      Number(formValues.page_size)
                        ? "#f5f5f5"
                        : "white",
                    cursor:
                      (data?.protocolos?.length || 0) <
                      Number(formValues.page_size)
                        ? "not-allowed"
                        : "pointer",
                    color:
                      (data?.protocolos?.length || 0) <
                      Number(formValues.page_size)
                        ? "#aaa"
                        : "#333",
                  }}
                >
                  Siguiente &gt;
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* DETALLE PANEL*/}
        <section className="detail-panel" data-click-safe="true">
          {selectedProtocol ? (
            <>
              <div className="detail-header">
                <div className="patient-info">
                  <h2>
                    <FiActivity className="icon-title" /> Visualización de
                    Resultados
                  </h2>
                  <div className="protocol-main-badge">
                    Protocolo:{" "}
                    <strong>{selectedProtocol.accessionnumber}</strong>
                  </div>
                </div>
                <button className="btn-print" onClick={() => window.print()}>
                  <FiPrinter /> Imprimir Resultados
                </button>
              </div>

              <div className="report-canvas">
                <div className="report-paper">
                  <div className="patient-data-grid">
                    <div className="data-row">
                      <div className="data-cell">
                        <label>Paciente</label>
                        <span className="val-important">
                          {selectedProtocol.apellidopaciente},{" "}
                          {selectedProtocol.nombrepaciente}
                        </span>
                      </div>
                      <div className="data-cell">
                        <label>ID Interno</label>
                        <span>{selectedProtocol.protocoloid}</span>
                      </div>
                      <div className="data-cell">
                        <label>Fecha</label>
                        <span>{formatDate(selectedProtocol.ordereddate)}</span>
                      </div>
                    </div>
                    <div className="data-row">
                      <div className="data-cell">
                        <label>Loc / Origen</label>
                        <span>
                          {selectedProtocol.paclocid} -{" "}
                          {selectedProtocol.paclocname || "S/D"}
                        </span>
                      </div>
                      <div className="data-cell">
                        <label>Sexo</label>
                        <span>
                          {selectedProtocol.pacsex === "M"
                            ? "Masculino"
                            : "Femenino"}
                        </span>
                      </div>
                      <div className="data-cell">
                        <label>Edad</label>
                        <span>{selectedProtocol.pacage} años</span>
                      </div>
                    </div>
                    <div className="data-row">
                      <div className="data-cell">
                        <label>ID Externo</label>
                        <span className="font-mono">
                          {selectedProtocol.idexterno || "-"}
                        </span>
                      </div>
                      <div className="data-cell">
                        <label>Estado</label>
                        <span
                          className={`status-text ${
                            selectedProtocol.completo
                              ? "text-complete"
                              : "text-pending"
                          }`}
                        >
                          {selectedProtocol.completo
                            ? "Resultados Completos"
                            : "Resultados Parciales"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <hr className="divider" />

                  {/* --- AREA DE RESULTADOS CORREGIDA --- */}
                  <div className="results-content">
                    {isLoadingResults ? (
                      <div className="loading-results">
                        Cargando análisis...
                      </div>
                    ) : isErrorResults ? (
                      <div className="error-container">
                        Error al conectar con el servidor.
                      </div>
                    ) : resultsData?.resultados?.length > 0 ? (
                      <>
                        <div className="results-table-header">
                          <span>Determinación</span>
                          <span>Resultado</span>
                          <span>Unidades</span>
                          <span>Valores de Referencia</span>
                        </div>
                        {resultsData.resultados.map((res, index) => {
                          const prevRes =
                            index > 0
                              ? resultsData.resultados[index - 1]
                              : null;

                          const showSectionTitle =
                            index === 0 ||
                            res.grupotitulo !== prevRes.grupotitulo;

                          const showAnalysisTitle =
                            index === 0 ||
                            res.analisis !== prevRes?.analisis ||
                            showSectionTitle;

                          return (
                            <React.Fragment key={index}>
                              {res.grupotitulo && showSectionTitle && (
                                <div className="result-category">
                                  {res.grupotitulo}
                                </div>
                              )}

                              {showAnalysisTitle && (
                                <div
                                  className="analysis-header"
                                  style={{
                                    backgroundColor: "#f1f5f9",
                                    padding: "8px 12px",
                                    fontWeight: "bold",
                                    color: "#334155",
                                    fontSize: "0.95rem",
                                    borderBottom: "1px solid #e2e8f0",
                                    marginTop: showSectionTitle ? "0" : "5px",
                                  }}
                                >
                                  {res.analisis}
                                </div>
                              )}

                              {/* Fila del Resultado */}
                              <div className="result-item-row">
                                <div className="det-col">
                                  <span style={{ fontWeight: 500 }}>
                                    {res.descripcionpractica}
                                  </span>
                                  {res.metodo && (
                                    <div
                                      style={{
                                        fontSize: "0.75rem",
                                        color: "#64748b",
                                        marginTop: "2px",
                                      }}
                                    >
                                      Mtd: {res.metodo}
                                    </div>
                                  )}
                                </div>
                                <div className="res-col highlighted">
                                  {res.resultado}
                                  {res.notaresultado && (
                                    <div className="res-note">
                                      {res.notaresultado}
                                    </div>
                                  )}
                                </div>
                                <div className="uni-col">
                                  {res.unidadmedida || "-"}
                                </div>
                                <div className="ref-col">
                                  {res.valoresreferencia ||
                                    res.rangovalidacion ||
                                    "-"}
                                </div>
                              </div>
                              {res.observaciones && (
                                <div className="res-obs">
                                  Obs: {res.observaciones}
                                </div>
                              )}
                            </React.Fragment>
                          );
                        })}
                        {resultsData?.comentarios?.length > 0 && (
                          <div className="general-comments">
                            <h4>Comentarios Generales:</h4>
                            {resultsData.comentarios.map((c, i) => (
                              <p key={i}>{c.comentario}</p>
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="no-data-message">
                        <FiInfo size={30} />
                        <p>
                          Este protocolo no contiene resultados registrados aún.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="no-selection-message">
              {selectedItems.length > 1 ? (
                <>
                  <FiCheckCircle
                    size={50}
                    style={{ opacity: 0.3, color: "#2563eb" }}
                  />
                  <p>{selectedItems.length} protocolos seleccionados</p>
                  <small>
                    Presione "Descargar Todo" para bajar los protocolos
                    completados.
                  </small>
                </>
              ) : (
                <>
                  <FiEye size={50} style={{ opacity: 0.3 }} />
                  <p>
                    Haga <strong>doble clic</strong> en un paciente para ver sus
                    resultados
                  </p>
                </>
              )}
            </div>
          )}
        </section>
      </main>

      {contextMenu && (
        <div
          className="context-menu"
          style={{ top: contextMenu.mouseY, left: contextMenu.mouseX }}
        >
          {contextMenu.item.leido === "1" ? (
            <div
              className="context-menu-item"
              onClick={() => {
                markUnread.mutate(contextMenu.item.protocoloid);
                contextMenu.item.leido = "0";
                setContextMenu(null);
              }}
            >
              <FiBookmark /> Marcar como no leído
            </div>
          ) : (
            <div
              className="context-menu-item"
              onClick={() => {
                markRead.mutate(contextMenu.item.protocoloid);
                contextMenu.item.leido = "1";
                setContextMenu(null);
              }}
            >
              <FiBookOpen /> Marcar como leído
            </div>
          )}
        </div>
      )}

      <Email
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        protocolo={selectedItems[0]}
      />
      <ModalUsuario
        isOpen={isCreateUserModalOpen}
        onClose={() => setIsCreateUserModalOpen(false)}
        onUserSaved={() => {
          alert("¡Usuario creado exitosamente!");
        }}
      />
      <ModalBuscarUsuario 
        isOpen={isSearchUserModalOpen}
        onClose={() => setIsSearchUserModalOpen(false)}
        onUserFound={handleUserFound} // Conecta con la edición
      />

      {/*  Modal de Edición */}
      <ModalEditarUsuario 
        isOpen={isEditOpen} 
        onClose={() => setIsEditOpen(false)}
        user={userToEdit}
        onUserUpdated={() => {
          alert("Usuario actualizado correctamente");
        }}
      />
    </div>
  );
}