import React, { useState, useEffect, useRef, useCallback } from "react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useProtocols } from "../hooks/useProtocols";
import { useProtocolResults } from "../hooks/useProtocolResults";
import { useProtocolMutations } from "../hooks/useProtocolMutations";
import { getProtocolPdf } from "../services/protocols.service";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import ModalUsuario from "../components/ModalUsuario";
import ModalEditarUsuario from "../components/ModalEditarUsuario";
import ModalBuscarUsuario from "../components/ModalBuscarUsuario";
import ModalAdministracion from "../components/ModalAdministracion";
import "../styles/resultados.css";
import centraLabLogo from "../assets/centraLab_nuevo.png";
import "../styles/email.css";
import JSZip from "jszip";
import Email from "../pages/email";
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
  FiMapPin,
  FiLayers,
  FiX,
  FiPlus,
  FiAlertCircle, 
  FiAlertTriangle, 
  FiCheck
} from "react-icons/fi";

// --- SUBCOMPONENTE: BOTÓN TRI-ESTADO ---
const TriStateToggle = ({
  label,
  value,
  onChange,
  labels = { true: "Sí", false: "No", all: "Todos" },
}) => {
  return (
    <div className="filter-group">
      <label>{label}</label>

      <div className="tri-toggle-container">
        <button
          type="button"
          className={`tri-toggle-btn ${value === "" ? "active" : ""}`}
          onClick={() => onChange("")}
        >
          {labels.all}
        </button>

        <button
          type="button"
          className={`tri-toggle-btn ${value === true ? "active" : ""}`}
          onClick={() => onChange(true)}
        >
          {labels.true}
        </button>

        <button
          type="button"
          className={`tri-toggle-btn ${value === false ? "active" : ""}`}
          onClick={() => onChange(false)}
        >
          {labels.false}
        </button>
      </div>
    </div>
  );
};

// --- SUBCOMPONENTE REUTILIZABLE: SECCIÓN DE FILTRO ASÍNCRONO ---
const AsyncFilterSection = ({
  title,
  icon: Icon,
  type,
  user,
  onSelectionChange,
  isOpen,
  onToggle,
}) => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [queryTerm, setQueryTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef(null);

  const canViewAll =
    type === "branch" ? user.canviewallbranches : user.canviewallforwarders;
  const restrictedList =
    type === "branch" ? user.branchidlist || [] : user.forwarderidlist || [];
  const useChipsMode =
    !canViewAll && restrictedList.length > 0 && restrictedList.length <= 10;

  useEffect(() => {
    const ids = selectedItems.map((i) => i.id).join(",");
    onSelectionChange(ids);
  }, [selectedItems, onSelectionChange]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const {
    data: searchResults = [],
    isFetching,
    isError,
    error,
  } = useQuery({
    queryKey: ["searchLocation", type, queryTerm],
    queryFn: async () => {
      const endpoint = type === "branch" ? "/branches" : "/forwarders";
      const paramName = type === "branch" ? "branch_name" : "forwarder_name";
      const res = await api.get(endpoint, {
        params: { [paramName]: queryTerm, page_size: 5 },
      });
      const raw = res.data.items || res.data;
      if (Array.isArray(raw))
        return raw.map((item) => ({
          id: item.id,
          label: item.name || item.business_name || item.label || item.id,
        }));
      if (typeof raw === "object" && raw !== null)
        return Object.entries(raw).map(([id, name]) => ({ id, label: name }));
      return [];
    },
    enabled: !!queryTerm && !useChipsMode && queryTerm.trim().length >= 1,
    staleTime: 1000 * 60,
    retry: false,
  });

  const handleTriggerSearch = () => {
    if (inputValue.trim().length >= 1) {
      setQueryTerm(inputValue);
      setShowDropdown(true);
    }
  };
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleTriggerSearch();
    }
  };
  const handleSelect = (item) => {
    if (!selectedItems.some((i) => i.id === item.id))
      setSelectedItems((prev) => [...prev, item]);
    setInputValue("");
    setQueryTerm("");
    setShowDropdown(false);
  };
  const handleRemove = (id) =>
    setSelectedItems((prev) => prev.filter((i) => i.id !== id));

  const idNameMap = React.useMemo(() => {
    const ids =
      type === "branch" ? user.branchidlist || [] : user.forwarderidlist || [];
    const names =
      type === "branch"
        ? user.branchnamelist || []
        : user.forwardernamelist || [];
    const map = {};
    ids.forEach((id, index) => {
      map[id] = names[index] || id;
    });
    return map;
  }, [type, user]);

  const renderStaticChips = () => (
    <div className="chips-grid">
      {restrictedList.map((id) => {
        const isSelected = selectedItems.some((i) => i.id === id);
        const label = idNameMap[id] || id;
        return (
          <div
            key={id}
            className={`filter-chip ${isSelected ? "active" : ""}`}
            onClick={() =>
              isSelected ? handleRemove(id) : handleSelect({ id, label })
            }
          >
            {isSelected && <FiCheckCircle size={12} />}
            <span title={label}>{label}</span>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="sidebar-section">
      <div className="sidebar-header-sub" onClick={onToggle}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Icon />
          <span>{title}</span>
        </div>
        <span className="arrow-icon">{isOpen ? "▲" : "▼"}</span>
      </div>
      <div className={`filters-collapsible ${isOpen ? "show" : ""}`}>
        <div className="location-filter-body">
          {useChipsMode ? (
            renderStaticChips()
          ) : (
            <div
              className="async-search-container"
              ref={containerRef}
              style={{ position: "relative" }}
            >
              <div className="input-wrapper">
                <input
                  type="text"
                  className="input-modern"
                  placeholder={`Buscar ${title.toLowerCase()}...`}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  style={{ paddingRight: 35 }}
                />
                {inputValue || queryTerm ? (
                  <button
                    type="button"
                    onClick={() => {
                      setInputValue("");
                      setQueryTerm("");
                      setShowDropdown(false);
                    }}
                    className="search-icon-btn"
                    style={{
                      position: "absolute",
                      right: "5px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      color: "#dc2626",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <FiX size={18} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleTriggerSearch}
                    className="search-icon-btn"
                    style={{
                      position: "absolute",
                      right: "5px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      color: "#0198CC",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <FiSearch size={18} />
                  </button>
                )}
              </div>
              {showDropdown && queryTerm && (
                <div className="search-dropdown">
                  {isFetching && (
                    <div className="dropdown-item loading">
                      <span
                        className="spinner-loader"
                        style={{
                          width: 12,
                          height: 12,
                          border: "2px solid #ccc",
                          borderTopColor: "#0198CC",
                        }}
                      ></span>{" "}
                      Buscando...
                    </div>
                  )}
                  {!isFetching && searchResults.length === 0 && !isError && (
                    <div
                      className="dropdown-item loading"
                      style={{ fontStyle: "italic", color: "#999" }}
                    >
                      No se encontraron resultados
                    </div>
                  )}
                  {isError && (
                    <div className="dropdown-item" style={{ color: "red" }}>
                      Error: {error?.message || "Falló la búsqueda"}
                    </div>
                  )}
                  {!isFetching &&
                    searchResults.map((item) => (
                      <div
                        key={item.id}
                        className="dropdown-item"
                        onClick={() => handleSelect(item)}
                      >
                        <span>{item.label}</span>
                        <FiPlus className="add-icon" />
                      </div>
                    ))}
                </div>
              )}
              {selectedItems.length > 0 && (
                <div className="selected-chips-area">
                  {selectedItems.map((item) => (
                    <div key={item.id} className="selected-chip">
                      <span className={`chip-dot ${type}`}></span>
                      <span
                        title={item.label}
                        style={{
                          maxWidth: 130,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {item.label}
                      </span>
                      <FiX
                        className="remove-icon"
                        onClick={() => handleRemove(item.id)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function Resultados() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // --- ESTADO DEL FORMULARIO ---
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
    private_healthcare_id: "",
    reserved: "",
    unread_only: "",
    complete_only: "",
  });

  // --- ESTADO DE FILTROS ACTIVOS ---
  const [activeFilters, setActiveFilters] = useState({ ...formValues });
  const [branchFilter, setBranchFilter] = useState("");
  const [forwarderFilter, setForwarderFilter] = useState("");

  const [isGeneralOpen, setIsGeneralOpen] = useState(false);
  const [openLocations, setOpenLocations] = useState({
    branch: false,
    forwarder: false,
  });

  const [user, setUser] = useState({ fullname: "Usuario" });
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedProtocol, setSelectedProtocol] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);

  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
  const [isSearchUserModalOpen, setIsSearchUserModalOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [isDownloadLoading, setIsDownloadLoading] = useState(false);
  const { markRead, markUnread } = useProtocolMutations();
  const { data, isLoading, isError, isFetching } = useProtocols(activeFilters);

  const {
    data: resultsData,
    isLoading: isLoadingResults,
    isError: isErrorResults,
  } = useProtocolResults(selectedProtocol?.protocoloid);

  useEffect(() => {
    const storedUser = localStorage.getItem("userData");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  useEffect(() => {
    setActiveFilters((prev) => ({
      ...prev,
      branch_id: branchFilter,
      private_healthcare_id: forwarderFilter,
      page: 1,
    }));
    setFormValues((prev) => ({
      ...prev,
      branch_id: branchFilter,
      private_healthcare_id: forwarderFilter,
    }));
  }, [branchFilter, forwarderFilter]);

  // --- HANDLERS ---

  const handleInputChange = (e) => {
    setFormValues((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setActiveFilters((prev) => ({
      ...prev,
      ...formValues,
      page: 1,
    }));
  };

  const handleToggleState = (key, value) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
    setActiveFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
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
      private_healthcare_id: "",
      reserved: "",
      unread_only: "",
      complete_only: "",
    };
    setFormValues(resetValues);
    setActiveFilters(resetValues);
    setSelectedItems([]);
  };

  const handlePageChange = (n) => {
    const page = Number(n);
    setFormValues((p) => ({ ...p, page }));
    setActiveFilters((p) => ({ ...p, page }));
  };

  const handleBranchChange = useCallback((ids) => {
    setBranchFilter((prev) => (prev === ids ? prev : ids));
  }, []);

  const handleForwarderChange = useCallback((ids) => {
    setForwarderFilter((prev) => (prev === ids ? prev : ids));
  }, []);

  const handleToggleGeneral = () => setIsGeneralOpen(!isGeneralOpen);
  const toggleLocation = (key) =>
    setOpenLocations((prev) => ({ ...prev, [key]: !prev[key] }));

  const shouldShowBranch =
    !isGeneralOpen || (branchFilter && branchFilter.length > 0);
  const shouldShowForwarder =
    !isGeneralOpen || (forwarderFilter && forwarderFilter.length > 0);
  const showFooter =
    !isGeneralOpen && !openLocations.branch && !openLocations.forwarder;

  // ... (Resto de handlers como handleLogout, handleRowClick, pdf, etc. se mantienen igual)
  const handleUserFound = (userData) => {
    setUserToEdit(userData);
    setIsEditOpen(true);
  };
  const handlePreviousPage = () => {
    if (formValues.page > 1) handlePageChange(formValues.page - 1);
  };
  const handleNextPage = () => {
    if (data?.protocolos?.length === Number(formValues.page_size))
      handlePageChange(formValues.page + 1);
  };
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleRowClick = (e, item) => {
    if (e.ctrlKey || e.metaKey) {
      setSelectedItems((prev) => {
        const exists = prev.find((p) => p.protocoloid === item.protocoloid);
        return exists
          ? prev.filter((p) => p.protocoloid !== item.protocoloid)
          : [...prev, item];
      });
    } else {
      setSelectedItems([item]);
    }
  };

  const isSelected = (id) => selectedItems.some((p) => p.protocoloid === id);

  const handleViewResults = (item = null) => {
    const target =
      item || (selectedItems.length === 1 ? selectedItems[0] : null);
    if (target) {
      setSelectedProtocol(target);
      if (target.leido === "0") {
        markRead.mutate(target.protocoloid);
        target.leido = "1";
      }
    }
  };

  const handleContextMenu = (e, item) => {
    e.preventDefault();
    setSelectedItems([item]);
    setContextMenu({ mouseX: e.clientX, mouseY: e.clientY, item });
  };

  const handleViewPDF = async (protocolId) => {
    if (!protocolId || isPdfLoading) return;
    setIsPdfLoading(true);
    try {
      const blob = await getProtocolPdf(protocolId);
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
      setTimeout(() => window.URL.revokeObjectURL(url), 5000);
    } catch (error) {
      console.error(error);
      alert("Error al abrir el PDF.");
    } finally {
      setIsPdfLoading(false);
    }
  };

  const handleDownloadAction = async () => {
    const itemsToDownload = selectedItems.filter((p) => p.completo !== "");
    if (itemsToDownload.length === 0 || isDownloadLoading) return;
    setIsDownloadLoading(true);
    try {
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
      } else {
        const zip = new JSZip();
        const promesas = itemsToDownload.map(async (p) => {
          try {
            const blob = await getProtocolPdf(p.protocoloid);
            zip.file(`Protocolo_${p.accessionnumber}.pdf`, blob);
          } catch (e) {
            console.error(e);
          }
        });
        await Promise.all(promesas);
        const content = await zip.generateAsync({ type: "blob" });
        saveAs(
          content,
          `Resultados_${new Date().toISOString().slice(0, 10)}.zip`
        );
      }
    } catch (error) {
      console.error(error);
      alert("Error en la descarga.");
    } finally {
      setIsDownloadLoading(false);
    }
  };

  // Variable helper
  const isPdfDisabled =
    selectedItems.length !== 1 ||
    selectedItems[0]?.completo === "" ||
    isPdfLoading;
  const hasDownloadableItems = selectedItems.some((i) => i.completo !== "");
  const formatDate = (d) => (!d ? "-" : d);

  // Render
  return (
    <div className="dashboard-container">
      <aside className="sidebar-filters" data-click-safe="true">
        <div className="sidebar-header">
          {centraLabLogo ? (
            <img src={centraLabLogo} alt="CentraLab" className="sidebar-logo" />
          ) : (
            <h2>CentraLab</h2>
          )}
          <div
            className={`filter-toggle-btn ${isGeneralOpen ? "active" : ""}`}
            onClick={handleToggleGeneral}
          >
            <FiFilter />
            <span>Filtros Grales.</span>
            <span className="arrow-icon">{isGeneralOpen ? "▲" : "▼"}</span>
          </div>
        </div>

        <div className="sidebar-scrollable-content">
          <div className={`filters-collapsible ${isGeneralOpen ? "show" : ""}`}>
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

              {/* --- BOTONES TRI-ESTADO (Disparan búsqueda al cambiar) --- */}
              <TriStateToggle
                label="Reservados"
                value={formValues.reserved}
                onChange={(val) => handleToggleState("reserved", val)}
                labels={{ true: "Sí", false: "No", all: "Todos" }}
              />
              <TriStateToggle
                label="Estado Protocolo"
                value={formValues.complete_only}
                onChange={(val) => handleToggleState("complete_only", val)}
                labels={{ true: "Completo", false: "En Proceso", all: "Todos" }}
              />
              <TriStateToggle
                label="Estado Lectura"
                value={formValues.unread_only}
                onChange={(val) => handleToggleState("unread_only", val)}
                labels={{ true: "No Leídos", false: "Leídos", all: "Todos" }}
              />

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
                  marginTop: "10px",
                  gap: "10px",
                }}
              >
                <button
                  type="submit"
                  className="btn-filtrar"
                  disabled={isLoading}
                  style={{ width: "100%", opacity: isLoading ? 0.7 : 1 }}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner-loader"></span> Buscando...
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
                  }}
                >
                  <FiTrash2 /> Limpiar
                </button>
              </div>
            </form>
          </div>

          {shouldShowBranch && (
            <AsyncFilterSection
              title="Sedes"
              icon={FiMapPin}
              type="branch"
              user={user}
              onSelectionChange={handleBranchChange}
              isOpen={openLocations.branch}
              onToggle={() => toggleLocation("branch")}
            />
          )}
          {shouldShowForwarder && (
            <AsyncFilterSection
              title="Clientes"
              icon={FiLayers}
              type="forwarder"
              user={user}
              onSelectionChange={handleForwarderChange}
              isOpen={openLocations.forwarder}
              onToggle={() => toggleLocation("forwarder")}
            />
          )}
        </div>

        {showFooter && (
          <div
            style={{
              marginTop: "auto",
              padding: "1rem",
              borderTop: "1px solid #e2e8f0",
              backgroundColor: "#f8fafc",
              marginBottom: "15px",
            }}
          >
            {user.isadministrator && (
              <div style={{ marginBottom: 10 }}>
                <p
                  style={{
                    fontSize: "0.7rem",
                    fontWeight: "700",
                    color: "#94a3b8",
                    textTransform: "uppercase",
                    marginBottom: "15px",
                    marginTop: 0,
                    textAlign: "center",
                  }}
                >
                  Administración
                </p>
                <button
                  onClick={() => setIsAdminOpen(true)}
                  className="btn-filtrar"
                  style={{
                    backgroundColor: "#0198CC",
                    color: "white",
                    width: "100%",
                    padding: "8px",
                    justifyContent: "center",
                  }}
                >
                  <FiUser size={16} /> Panel de Usuarios
                </button>
              </div>
            )}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 10,
                paddingBottom: 10,
                borderBottom: "1px dashed #e2e8f0",
              }}
            >
              <div
                style={{
                  width: 35,
                  height: 35,
                  borderRadius: "50%",
                  background: "#e0f2fe",
                  color: "#0284c7",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <FiUser />
              </div>
              <div style={{ overflow: "hidden" }}>
                <p
                  style={{
                    margin: 0,
                    fontWeight: 600,
                    fontSize: "0.85rem",
                    color: "#334155",
                    whiteSpace: "nowrap",
                    textOverflow: "ellipsis",
                    maxWidth: 140,
                  }}
                >
                  {user.fullname || user.username}
                </p>
                <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                  {user.email || "Sin email"}
                </span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="btn-filtrar"
              style={{
                backgroundColor: "white",
                color: "#dc2626",
                borderColor: "#fecaca",
                width: "100%",
                justifyContent: "center",
              }}
            >
              <FiLogOut /> Cerrar Sesión
            </button>
          </div>
        )}
      </aside>

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
              style={{ opacity: !hasDownloadableItems ? 0.5 : 1 }}
            >
              {isDownloadLoading ? (
                "Procesando..."
              ) : (
                <>
                  <FiDownload size={20} />{" "}
                  {selectedItems.length > 1 ? " Descargar Todo" : " Descargar"}
                </>
              )}
            </button>
          </div>

          <div className="table-wrapper">
            <div className="table-scroll">
              {isFetching && !isLoading && (
                <div className="loading-overlay">
                  <div className="spinner"></div>
                </div>
              )}
              {isError && (
                <div
                  style={{ color: "red", padding: "20px", textAlign: "center" }}
                >
                  Error al cargar los datos.
                </div>
              )}

              <table className="resultados-table" data-click-safe="true">
                <thead>
                  <tr>
                    <th style={{ textAlign: "center" }}>Debe</th>
                    <th>Apellido y Nombre / Datos</th>
                    <th>Protocolo</th>
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
                        <td style={{ textAlign: "center" }}>
                          <span
                            className={`indicator-dot ${
                              item.debe ? "dot-red" : "dot-green"
                            }`}
                            title={item.debe ? "Posee Deuda" : "Sin Deuda"}
                          ></span>
                        </td>
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
                            <div className="patient-subdata">
                              <span>
                                DNI:{" "}
                                {item.pacid
                                  .toString()
                                  .replace(/DNI/gi, "")
                                  .trim()}
                              </span>
                              <span className="separator">•</span>
                              <span>
                                Ingreso: {formatDate(item.ordereddate)}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="font-mono">{item.accessionnumber}</td>
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
            </div>
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
                style={{ display: "flex", gap: "10px", alignItems: "center" }}
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

        {/* DETAIL PANEL */}
        <section className="detail-panel" data-click-safe="true">
          {selectedProtocol ? (
            <div className="modern-report-container">
              {/* --- 1. CABECERA TIPO TARJETA DEL PACIENTE --- */}
              <div className="patient-header-card compact-linear">
              <div className="patient-avatar-area small">
                <div className="avatar-circle">
                  <FiUser />
                </div>
              </div>

              <div className="patient-details-linear">
                {/* Fila 1: Nombre Principal */}
                <div className="linear-top-row">
                  <h2 className="patient-name-linear">
                    {selectedProtocol.apellidopaciente}, {selectedProtocol.nombrepaciente}
                  </h2>
                </div>

                {/* Fila 2: Datos secundarios en una sola línea separados por puntos */}
                <div className="linear-data-row">
                  <span className="data-item">
                    <span className="lbl">DNI:</span>
                    <span className="val">{selectedProtocol.pacid}</span>
                  </span>
                  
                  <span className="separator">•</span>
                  
                  <span className="data-item">
                  <span className="lbl">Edad:</span>
                  <span className="val">
                    {selectedProtocol.pacage} años
                    {/* Solo mostramos la fecha si existe */}
                    {selectedProtocol.birthdate && ` (${formatDate(selectedProtocol.birthdate)})`}
                  </span>
                </span>

                  <span className="separator">•</span>
                  
                  <span className="data-item">
                    <span className="lbl">Dr:</span>
                    <span className="val doc-name" title={selectedProtocol.doctor_name}>{selectedProtocol.doctor_name || "No especificado"}</span>
                  </span>

                  {/* Fecha destacada al final */}
                  <span className="separator highlight">•</span>
                  <span className="data-item date-item">
                    <FiClock size={11} style={{ marginRight: 3 }} />
                    <span className="val">{formatDate(selectedProtocol.ordereddate)}</span>
                  </span>
                </div>
              </div>
            </div>

              {/* --- 2. LISTA DE RESULTADOS --- */}
              <div className="results-scroll-area">
                {isLoadingResults ? (
                  <div className="loading-results">
                    <div className="spinner"></div> Cargando resultados...
                  </div>
                ) : isErrorResults ? (
                  <div className="error-container">Error al cargar resultados.</div>
                ) : resultsData?.resultados?.length > 0 ? (
                  <div className="results-list-modern">
                    
                    {/* Encabezados de columnas generales */}
                    <div className="results-cols-header">
                        <span className="col-det">Determinación</span>
                        <span className="col-res">Resultado</span>
                        <span className="col-ref">Valores Ref.</span>
                        <span className="col-unit">Unidad</span>
                        <span className="col-status">Estado</span>
                    </div>

                    {resultsData.resultados.map((res, index) => {
                      const prevRes = index > 0 ? resultsData.resultados[index - 1] : null;
                      
                      // Detectar cambio de Grupo (Bioquímica, Hematología...)
                      const isNewGroup = index === 0 || res.grupotitulo !== prevRes?.grupotitulo;
                      
                      // Detectar cambio de Subtítulo/Analisis
                      const isNewAnalysis = index === 0 || res.analisis !== prevRes?.analisis || isNewGroup;

                      return (
                        <React.Fragment key={index}>
                          {/* GRUPO PRINCIPAL (Header Azul) */}
                          {res.grupotitulo && isNewGroup && (
                            <div className="group-header-modern">
                              {res.grupotitulo}
                            </div>
                          )}

                          {/* SUBTITULO (Si aplica) */}
                          {isNewAnalysis && res.analisis && res.analisis !== res.grupotitulo && (
                             <div className="analysis-subheader-modern">
                                {res.analisis}
                             </div>
                          )}

                          {/* FILA DE RESULTADO */}
                          <div className="result-row-modern group-hover-trigger">
                            
                            {/* Columna 1: Nombre y Badges */}
                            <div className="col-det">
                                <span className="test-name">{res.descripcionpractica}</span>
                                {/* Ejemplo de badges (puedes condicionarlos) */}
                                {res.metodo && <span className="method-badge">{res.metodo}</span>}
                                
                                {/* TOOLTIP FLOTANTE (Como en la imagen) */}
                                {res.observaciones && (
                                    <div className="hover-tooltip">
                                        <strong>Información:</strong>
                                        <p>{res.observaciones}</p>
                                    </div>
                                )}
                            </div>

                            {/* Columna 2: Resultado */}
                            <div className="col-res">
                                <span className="res-value">{res.resultado}</span>
                            </div>

                            {/* Columna 3: Referencia */}
                            <div className="col-ref">
                                {res.valoresreferencia || res.rangovalidacion || "-"}
                            </div>

                            {/* Columna 4: Unidad */}
                            <div className="col-unit">
                                {res.unidadmedida}
                            </div>

                            {/* Columna 5: Estado (Simulado visualmente) */}
                            <div className="col-status">
                                {/* LÓGICA DE ESTADO: 
                                    Aquí deberías usar una propiedad real de tu backend si existe (ej: res.flag).
                                    Como ejemplo, renderizo 'Normal' por defecto. */}
                                {res.flag === 'H' || res.flag === 'L' ? (
                                    <span className="status-pill status-danger">
                                        Elevado <FiAlertCircle />
                                    </span>
                                ) : (
                                    <span className="status-pill status-success">
                                        Normal <FiCheck />
                                    </span>
                                )}
                            </div>
                          </div>
                          
                          {/* Nota debajo del resultado si existe */}
                          {res.notaresultado && (
                              <div className="result-note-row">
                                  Nota: {res.notaresultado}
                              </div>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                ) : (
                  <div className="no-data-message">
                    <FiInfo size={30} />
                    <p>No hay resultados visualizables.</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="no-selection-message">
               <FiActivity size={60} style={{ opacity: 0.1, color: "#0198CC" }} />
               <h3>Seleccione un protocolo</h3>
               <p>Haga doble clic en la lista izquierda para ver el detalle.</p>
            </div>
          )}
        </section>
      </main>

      <Email
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        protocolo={selectedItems[0]}
      />

      {/* Context Menu y Modales */}
      {contextMenu && (
        <div
          className="context-menu"
          style={{
            position: "fixed",
            zIndex: 9999,
            top: contextMenu.mouseY,
            left: contextMenu.mouseX,
            backgroundColor: "white",
            border: "1px solid #ccc",
            borderRadius: "4px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
            padding: "5px 0",
            minWidth: "180px",
          }}
        >
          {contextMenu.item.leido === "1" ? (
            <div
              className="context-menu-item"
              style={{
                padding: "8px 15px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                fontSize: "0.9rem",
                color: "#333",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#f0f0f0")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "white")
              }
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
              style={{
                padding: "8px 15px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                fontSize: "0.9rem",
                color: "#333",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#f0f0f0")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "white")
              }
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
      <ModalUsuario
        isOpen={isCreateUserModalOpen}
        onClose={() => setIsCreateUserModalOpen(false)}
        onUserSaved={() => alert("¡Usuario creado exitosamente!")}
      />
      <ModalBuscarUsuario
        isOpen={isSearchUserModalOpen}
        onClose={() => setIsSearchUserModalOpen(false)}
        onUserFound={handleUserFound}
      />
      <ModalAdministracion
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
      />
      <ModalEditarUsuario
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        user={userToEdit}
        onUserUpdated={() => alert("Usuario actualizado correctamente")}
      />
    </div>
  );
}