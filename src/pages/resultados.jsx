import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { useQuery } from "@tanstack/react-query";
import { useProtocols } from "../hooks/useProtocols";
import { useProtocolResults } from "../hooks/useProtocolResults";
import { useProtocolMutations } from "../hooks/useProtocolMutations";
import { getProtocolPdf } from "../services/protocols.service";
import { ResponsiveToolbar } from "../components/ResponsiveToolbar";
import { AdvancedPagination } from "../components/AdvancedPagination";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import ModalUsuario from "../components/ModalUsuario";
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
  FiUsers,
  FiLayers,
  FiX,
  FiPlus,
  FiAlertTriangle,
  FiCheck,
  FiArrowUp,
  FiArrowDown,
} from "react-icons/fi";

const ErrorStateDisplay = ({ title, message, retryAction }) => (
  <div className="error-state-container">
    <div className="error-icon-wrapper">
      <FiAlertTriangle size={36} />
    </div>
    <h3 className="error-title">{title || "Error de Carga"}</h3>
    <p className="error-message">
      {message ||
        "Ocurrió un inconveniente al intentar obtener los datos. Por favor, verifique su conexión o intente nuevamente."}
    </p>
    {retryAction && (
      <button onClick={retryAction} className="btn-retry" type="button">
        <FiActivity /> Reintentar
      </button>
    )}
  </div>
);

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

  const canViewAll = type === "branch" ? false : user.canviewallforwarders;

  const localOptions = useMemo(() => {
    if (type === "branch") return [];
    const ids = user.forwarderidlist || [];
    const names = user.forwardernamelist || [];

    return ids.map((id, index) => ({
      id: String(id),
      label: names[index] || id,
    }));
  }, [type, user]);

  const useApiSearchMode = canViewAll;
  const useLocalChipsMode = !canViewAll && localOptions.length <= 10;
  const useLocalSelectMode = !canViewAll && localOptions.length > 10;

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

      try {
        const res = await api.get(endpoint, {
          params: { [paramName]: queryTerm, page_size: 5 },
        });

        const raw = res.data.items || res.data;

        if (Array.isArray(raw)) {
          return raw.map((item) => ({
            id: String(item.id),
            label: item.name || item.business_name || item.label || item.id,
          }));
        }

        if (typeof raw === "object" && raw !== null) {
          return Object.entries(raw).map(([id, name]) => ({
            id: String(id),
            label: name,
          }));
        }

        return [];
      } catch (err) {
        console.error("Error fetching data:", err);
        throw err;
      }
    },
    enabled:
      !!queryTerm &&
      queryTerm.trim().length >= 1 &&
      (type === "branch" ? !user.branchidlist : canViewAll),
    staleTime: 1000 * 60,
    retry: false,
  });

  // --- HANDLERS ---

  const handleSelect = (item) => {
    if (!selectedItems.some((i) => String(i.id) === String(item.id))) {
      setSelectedItems((prev) => [...prev, item]);
    }
    setInputValue("");
    setQueryTerm("");
    setShowDropdown(false);
  };

  const handleRemove = (id) =>
    setSelectedItems((prev) => prev.filter((i) => String(i.id) !== String(id)));

  // --- HANDLERS API ---
  const handleTriggerSearch = () => {
    if (inputValue.trim().length >= 1) {
      setQueryTerm(inputValue.toUpperCase());
      setShowDropdown(true);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleTriggerSearch();
    }
  };

  // --- HANDLER LOCAL SELECT ---
  const handleLocalSelectChange = (e) => {
    const selectedId = e.target.value;
    if (!selectedId) return;

    const itemFound = localOptions.find(
      (op) => String(op.id) === String(selectedId),
    );
    if (itemFound) {
      handleSelect(itemFound);
    }
    e.target.value = "";
  };

  // --- RENDERERS ---

  // RENDERER CHIPS ESTATICOS
  const renderStaticChips = () => (
    <div className="chips-grid">
      {localOptions.map((item) => {
        const isSelected = selectedItems.some(
          (i) => String(i.id) === String(item.id),
        );
        return (
          <div
            key={item.id}
            className={`filter-chip ${isSelected ? "active" : ""}`}
            onClick={() =>
              isSelected ? handleRemove(item.id) : handleSelect(item)
            }
          >
            {isSelected && <FiCheckCircle size={12} />}
            <span title={item.label}>{item.label}</span>
          </div>
        );
      })}
    </div>
  );

  // RENDERER SELECT LOCAL
  const renderLocalSelect = () => (
    <div className="local-select-container">
      <div className="input-wrapper">
        <select
          className="input-modern"
          onChange={handleLocalSelectChange}
          defaultValue=""
          style={{ width: "100%", cursor: "pointer" }}
        >
          <option value="" disabled>
            Seleccione una opción...
          </option>
          {localOptions.map((opt) => {
            const isSelected = selectedItems.some(
              (i) => String(i.id) === String(opt.id),
            );
            return (
              <option key={opt.id} value={opt.id} disabled={isSelected}>
                {opt.label} {isSelected ? "(Seleccionado)" : ""}
              </option>
            );
          })}
        </select>
      </div>
    </div>
  );

  // RENDERER INPUT ASINCRONO
  const renderAsyncSearch = () => (
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

      {/* Dropdown de resultados de API */}
      {showDropdown && queryTerm && (
        <div className="search-dropdown">
          {isFetching && (
            <div className="dropdown-item loading">
              <span className="spinner-loader"></span> Buscando...
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
              Error en búsqueda
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
    </div>
  );

  return (
    <div className="sidebar-section">
      <div className="sidebar-header-sub" onClick={onToggle}>
        <Icon />
        <span style={{ flex: 1, textAlign: "center" }}>{title}</span>
        <span className="arrow-icon">{isOpen ? "▲" : "▼"}</span>
      </div>

      <div className={`filters-collapsible ${isOpen ? "show" : ""}`}>
        <div className="location-filter-body">
          {/* Modo Chips Locales */}
          {useLocalChipsMode && renderStaticChips()}

          {/* Modo Select Local */}
          {useLocalSelectMode && renderLocalSelect()}

          {/* Modo Buscador API */}
          {useApiSearchMode && renderAsyncSearch()}

          {!useLocalChipsMode && selectedItems.length > 0 && (
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
      </div>
    </div>
  );
};

// --- HELPER ESTADO ---
const getAnalysisStatus = (resultado, referencia) => {
  if (!resultado || !referencia) return null;

  const valClean = resultado.toString().replace(",", ".");
  const val = parseFloat(valClean);
  if (isNaN(val)) return null;

  if (!referencia.includes("-")) return null;

  const partes = referencia.split("-");
  if (partes.length !== 2) return null;

  const min = parseFloat(partes[0]);
  const max = parseFloat(partes[1]);

  if (isNaN(min) || isNaN(max)) return null;

  if (val < min) return { type: "low", label: "Bajo" };
  if (val > max) return { type: "high", label: "Alto" };

  return { type: "normal", label: "Normal" };
};

export default function Resultados() {
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
    page_size: 20,
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
  const lastValidPageRef = useRef(1);
  const [knownEndPage, setKnownEndPage] = useState(null);
  const { data, isLoading, isError, isFetching, refetch } =
    useProtocols(activeFilters);
  const {
    data: resultsData,
    isLoading: isLoadingResults,
    isError: isErrorResults,
    refetch: refetchResults,
  } = useProtocolResults(selectedProtocol?.protocoloid);

  // --- CÁLCULO DE PAGINACIÓN SIN TOTAL ---
  const currentCount = data?.protocolos?.length || 0;
  const pageSize = Number(formValues.page_size);
  const hasMoreData = currentCount === pageSize;

  // --- EFFECT (DISCOVERY + ROLLBACK) ---
  useEffect(() => {
    if (!isFetching && !isError && data?.protocolos) {
      if (data.protocolos.length === 0 && Number(formValues.page) > 1) {
        const emptyPage = Number(formValues.page);
        setKnownEndPage((prev) =>
          prev === null || emptyPage < prev ? emptyPage : prev,
        );

        const fallbackPage = lastValidPageRef.current;
        setFormValues((prev) => ({ ...prev, page: fallbackPage }));
        setActiveFilters((prev) => ({ ...prev, page: fallbackPage }));
      } else if (data.protocolos.length > 0) {
        lastValidPageRef.current = Number(formValues.page);
        if (knownEndPage !== null && Number(formValues.page) >= knownEndPage) {
          setKnownEndPage(null);
        }
      }
    }
  }, [data, isFetching, isError, formValues.page, knownEndPage]);

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

  // --- LÓGICA DE CLICKS Y DESELECCIÓN ---
  useEffect(() => {
    const handleClickOutside = (event) => {
      const target = event.target;
      const isContextMenuClick = target.closest(".context-menu");
      if (contextMenu) {
        if (!isContextMenuClick) setContextMenu(null);
        return;
      }
      if (selectedItems.length === 0) return;
      const isRowClick = target.closest("tr");
      const isToolbarClick = target.closest(".toolbar-container");
      const isModalClick =
        target.closest(".modal-overlay") ||
        target.closest(".ReactModal__Content");
      const isDetailPanel = target.closest(".detail-panel");
      const isSafeDetailClick = isDetailPanel && selectedProtocol !== null;

      if (
        !isRowClick &&
        !isToolbarClick &&
        !isModalClick &&
        !isContextMenuClick &&
        !isSafeDetailClick
      ) {
        setSelectedItems([]);
        setSelectedProtocol(null);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setSelectedItems([]);
        setSelectedProtocol(null);
        setContextMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [contextMenu, selectedItems, selectedProtocol]);

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
      page: 1,
    }));
  }, [branchFilter, forwarderFilter]);

  // --- HANDLERS ---

  const handleInputChange = (e) => {
    setFormValues((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setKnownEndPage(null);
    lastValidPageRef.current = 1;
    setFormValues((prev) => ({ ...prev, page: 1 }));
    setActiveFilters((prev) => ({ ...prev, ...formValues, page: 1 }));
  };

  const handleToggleState = (key, value) => {
    setKnownEndPage(null);
    lastValidPageRef.current = 1;
    setFormValues((prev) => ({ ...prev, [key]: value, page: 1 }));
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
      page_size: 20,
      branch_id: "",
      private_healthcare_id: "",
      reserved: "",
      unread_only: "",
      complete_only: "",
    };
    setKnownEndPage(null);
    lastValidPageRef.current = 1;
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
    setKnownEndPage(null);
    lastValidPageRef.current = 1;
    setBranchFilter((prev) => (prev === ids ? prev : ids));
  }, []);

  const handleForwarderChange = useCallback((ids) => {
    setKnownEndPage(null);
    lastValidPageRef.current = 1;
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

  const handleUserFound = (userData) => {
    setUserToEdit(userData);
    setIsEditOpen(true);
  };
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleRowClick = (e, item) => {
    if (e.ctrlKey || e.metaKey) {
      setSelectedItems((prev) => {
        const exists = prev.some(
          (p) => String(p.protocoloid) === String(item.protocoloid),
        );
        return exists
          ? prev.filter(
              (p) => String(p.protocoloid) !== String(item.protocoloid),
            )
          : [...prev, item];
      });
    } else {
      setSelectedItems([item]);
      setSelectedProtocol(item);
      if (item.leido === "0") {
        markRead.mutate(item.protocoloid);
        item.leido = "1";
      }
    }
  };

  const isSelected = (id) =>
    selectedItems.some((p) => String(p.protocoloid) === String(id));

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
          `Protocolo_${protocolo.accessionnumber}.pdf`,
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
          `Resultados_${new Date().toISOString().slice(0, 10)}.zip`,
        );
      }
    } catch (error) {
      console.error(error);
      alert("Error en la descarga.");
    } finally {
      setIsDownloadLoading(false);
    }
  };

  const isPdfDisabled =
    selectedItems.length !== 1 ||
    selectedItems[0]?.completo === "" ||
    isPdfLoading;
  const hasDownloadableItems = selectedItems.some((i) => i.completo !== "");
 const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    
    // Validación de seguridad: si no es una fecha válida, devuelve el texto original
    if (isNaN(date.getTime())) return dateString;

    // Formateador nativo (se adapta a la región, ej: es-AR)
    return new Intl.DateTimeFormat("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false, // Pon en true si prefieres AM/PM
    }).format(date);
  };

  const toolbarActions = [
    {
      id: "email",
      label: "Enviar por Email",
      icon: <FiMail />,
      onClick: () => setIsEmailModalOpen(true),
      disabled: selectedItems.length !== 1,
    },
    {
      id: "pdf",
      label: "Visualizar PDF",
      icon: <FiFileText />,
      onClick: () => handleViewPDF(selectedItems[0]?.protocoloid),
      disabled: isPdfDisabled,
    },
    {
      id: "download",
      label: selectedItems.length > 1 ? "Descargar Todo" : "Descargar",
      icon: <FiDownload />,
      onClick: handleDownloadAction,
      disabled: !hasDownloadableItems || isDownloadLoading,
    },
  ];

  return (
    <div className="dashboard-container">
      <aside className="sidebar-filters" data-click-safe="true">
        <div className="sidebar-header">
          {centraLabLogo ? (
            <img src={centraLabLogo} alt="CentraLab" className="sidebar-logo" />
          ) : (
            <h2>CentraLab</h2>
          )}
        </div>

        <div className="sidebar-scrollable-content">
          <div
            className={`filter-toggle-btn ${isGeneralOpen ? "active" : ""}`}
            onClick={handleToggleGeneral}
          >
            <FiFilter />
            <span>Filtros Generales</span>
            <span className="arrow-icon">{isGeneralOpen ? "▲" : "▼"}</span>
          </div>
          <div className={`filters-collapsible ${isGeneralOpen ? "show" : ""}`}>
            <form className="filters-form" onSubmit={handleSearch}>
              {/* --- FECHAS --- */}
              <div className="compact-date-group"
                style={{ marginTop: "15px" }}
                >
                <div className="date-item">
                  <label>Desde</label>
                  <input
                    type="date"
                    name="date_from"
                    value={formValues.date_from}
                    onChange={handleInputChange}
                    className="input-modern compact"
                  />
                </div>
                <div className="date-item">
                  <label>Hasta</label>
                  <input
                    type="date"
                    name="date_to"
                    value={formValues.date_to}
                    onChange={handleInputChange}
                    className="input-modern compact"
                  />
                </div>
              </div>

              {/* --- TOGGLES --- */}
              <div className="toggles-stack-wrapper">
              
                <TriStateToggle
                  label="Estado Protocolo"
                  value={formValues.complete_only}
                  onChange={(val) => handleToggleState("complete_only", val)}
                  labels={{
                    true: "Completo",
                    false: "En Proceso",
                    all: "Todos",
                  }}
                />
                <TriStateToggle
                  label="Estado Lectura"
                  value={formValues.unread_only}
                  onChange={(val) => handleToggleState("unread_only", val)}
                  labels={{ true: "No Leído", false: "Leído", all: "Todos" }}
                />
              </div>

              {/* --- INPUTS --- */}
              <div className="filter-group compact">
                <label>DNI Paciente</label>
                <input
                  type="text"
                  name="patient_id_number"
                  value={formValues.patient_id_number}
                  onChange={handleInputChange}
                  className="input-modern compact"
                  placeholder="Ej: 25459633"
                />
              </div>
              <div className="filter-group compact">
                <label>Apellido</label>
                <input
                  type="text"
                  name="apellido_paciente"
                  value={formValues.apellido_paciente}
                  onChange={handleInputChange}
                  className="input-modern compact"
                  placeholder="Buscar..."
                />
              </div>
              <div className="filter-group compact">
                <label>ID Petición</label>
                <input
                  type="text"
                  name="accession_number"
                  value={formValues.accession_number}
                  onChange={handleInputChange}
                  className="input-modern compact"
                  placeholder="Protocolo / ID"
                />
              </div>

              <div className="filter-row compact-row">
                <div className="filter-group half">
                  <label>Pág.</label>
                  <input
                    type="number"
                    name="page"
                    value={formValues.page}
                    onChange={(e) => handlePageChange(e.target.value)}
                    className="input-modern compact"
                    min={1}
                  />
                </div>
                <div className="filter-group half">
                  <label>Filas</label>
                  <select
                    name="page_size"
                    value={formValues.page_size}
                    onChange={(e) => {
                      handleInputChange(e);
                      setKnownEndPage(null);
                      lastValidPageRef.current = 1;
                      setFormValues((prev) => ({
                        ...prev,
                        page: 1,
                        page_size: e.target.value,
                      }));
                      setActiveFilters((prev) => ({
                        ...prev,
                        page: 1,
                        page_size: e.target.value,
                      }));
                    }}
                    className="input-modern compact"
                  >
                    <option value={15}>15</option>
                    <option value={20}>20</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
              </div>

              {/* --- BOTONES --- */}
              <div className="filter-actions-row">
                <button
                  type="submit"
                  className="btn-filtrar primary"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="spinner-loader"></span>
                  ) : (
                    <>
                      <FiSearch /> Buscar
                    </>
                  )}
                </button>
                <button
                  type="button"
                  className="btn-filtrar secondary"
                  onClick={handleReset}
                  disabled={isLoading}
                >
                  <FiTrash2 />
                </button>
              </div>
            </form>
          </div>

          {/* {shouldShowBranch && (
            <AsyncFilterSection
              title="Sedes"
              icon={FiMapPin}
              type="branch"
              user={user}
              onSelectionChange={handleBranchChange}
              isOpen={openLocations.branch}
              onToggle={() => toggleLocation("branch")}
            />
          )} */}
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
          <div className="sidebar-footer">
            {user.isadministrator && (
              <div style={{ marginBottom: 15 }}>
                <button
                  onClick={() => setIsAdminOpen(true)}
                  className="btn-admin-premium"
                >
                  <FiUsers size={18} /> <span>Administración</span>
                </button>
              </div>
            )}
            <div className="user-card-info">
              <div className="user-avatar-footer">
                <FiUser />
              </div>
              <div style={{ overflow: "hidden" }}>
                <p
                  style={{
                    margin: 0,
                    fontWeight: 700,
                    fontSize: "0.8rem",
                    color: "#334155",
                    whiteSpace: "nowrap",
                    textOverflow: "ellipsis",
                    maxWidth: 130,
                  }}
                >
                  {user.fullname || user.username}
                </p>
                <span
                  style={{
                    fontSize: "0.65rem",
                    color: "#64748b",
                    display: "block",
                  }}
                >
                  {user.email || "Usuario"}
                </span>
              </div>
            </div>
            <button onClick={handleLogout} className="btn-logout-modern">
              <FiLogOut size={14} /> Cerrar Sesión
            </button>
          </div>
        )}
      </aside>

      <main className="split-view">
        <section className="list-panel">
          <ResponsiveToolbar actions={toolbarActions} />
          <div className="table-wrapper">
            <div className="table-scroll">
              {isFetching && !isLoading && (
                <div className="loading-overlay">
                  <div className="spinner"></div>
                </div>
              )}
              {isError ? (
                <ErrorStateDisplay
                  title="No se pudieron cargar los protocolos"
                  message="Hubo un problema al conectar con el servidor para obtener la lista. Por favor, intente recargar."
                  retryAction={refetch}
                />
              ) : (
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
                          className={`${selected ? "selected-row" : ""} ${isUnread ? "font-bold-unread" : ""}`}
                          onClick={(e) => handleRowClick(e, item)}
                          onContextMenu={(e) => handleContextMenu(e, item)}
                        >
                          <td style={{ textAlign: "center" }}>
                            <span
                              className={`indicator-dot ${item.debe ? "dot-red" : "dot-green"}`}
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
                              <div 
                              className="patient-subdata" 
                              style={{ 
                                display: "flex", 
                                alignItems: "center", 
                                gap: "2px",              
                                whiteSpace: "nowrap", 
                                overflow: "hidden", 
                                textOverflow: "ellipsis",
                                fontSize: "0.75rem",     
                                lineHeight: "1"          
                              }}
                            >
                              {/* DNI */}
                              <span title="DNI del paciente" style={{ color: "#334155" }}>
                                <strong style={{ fontWeight: 600, color: "#94a3b8" }}>DNI:</strong> {item.pacid.toString().replace(/DNI/gi, "").trim()}
                              </span>
                              {/* Separador */}
                              <span style={{ color: "#cbd5e1", fontSize: "0.7rem", margin: "0 1px", position: "relative", top: "-1px" }}>|</span>
                              {/* Fecha y Hora */}
                              <span 
                                style={{ 
                                  display: "flex", 
                                  alignItems: "center", 
                                  gap: "2px",            
                                  color: "#64748b" 
                                }}
                              >
                                <FiClock size={10} />  
                                {formatDateTime(item.ordereddate)}
                              </span>
                            </div>

                            </div>
                          </td>
                          <td className="font-mono">{item.protocoloid}</td>
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
              )}
            </div>

            {/* MODIFICADO: Paginación Inteligente */}
            <AdvancedPagination
              page={Number(formValues.page)}
              onPageChange={handlePageChange}
              hasMoreData={hasMoreData}
              isLoading={isFetching}
              knownEndPage={knownEndPage} // <--- Pasamos el límite descubierto
            />
          </div>
        </section>

        {/* DETAIL PANEL (Sin cambios lógicos, solo se mantiene el render) */}
        <section className="detail-panel" data-click-safe="true">
          {selectedProtocol ? (
            <div className="modern-report-container">
              <div className="patient-header-card compact-linear">
                <div className="patient-avatar-area small">
                  <div className="avatar-circle">
                    <FiUser />
                  </div>
                </div>
                <div className="patient-details-linear">
                  <div className="linear-top-row">
                    <h2 className="patient-name-linear">
                      {selectedProtocol.apellidopaciente},{" "}
                      {selectedProtocol.nombrepaciente}
                    </h2>
                  </div>
                  <div className="linear-data-row">
                    <span className="data-item">
                      <span className="lbl">DNI:</span>
                      <span className="val">{selectedProtocol.pacid}</span>
                    </span>
                    <span className="separator">•</span>
                    <span className="data-item">
                      <span className="lbl">Edad:</span>
                      <span className="val">
                        {selectedProtocol.pacage} años{" "}
                        {selectedProtocol.birthdate &&
                          ` (${formatDate(selectedProtocol.birthdate)})`}
                      </span>
                    </span>
                    <span className="separator highlight">•</span>
                    <span className="data-item date-item">
                      <FiClock size={11} style={{ marginRight: 3 }} />
                      <span className="val">
                        {formatDate(selectedProtocol.ordereddate)}
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="results-scroll-area">
                {isLoadingResults ? (
                  <div className="loading-results">
                    <div className="spinner"></div> Cargando resultados...
                  </div>
                ) : isErrorResults ? (
                  <ErrorStateDisplay
                    title="Error al cargar resultados"
                    message="No se pudieron obtener los detalles."
                    retryAction={refetchResults}
                  />
                ) : resultsData?.resultados?.length > 0 ? (
                  <div className="results-list-modern">
                    <div className="results-cols-header">
                      <span className="col-det">Determinación</span>
                      <span className="col-res">Resultado</span>
                      <span className="col-ref">Valores Ref.</span>
                      <span className="col-unit">Unidad</span>
                      <span className="col-status">Estado</span>
                    </div>
                    {resultsData.resultados.map((res, index) => {
                      const prevRes =
                        index > 0 ? resultsData.resultados[index - 1] : null;
                      const isNewGroup =
                        index === 0 || res.grupotitulo !== prevRes?.grupotitulo;
                      const isNewAnalysis =
                        index === 0 ||
                        res.analisis !== prevRes?.analisis ||
                        isNewGroup;
                      const analysisName = (res.analisis || "")
                        .toLowerCase()
                        .trim();
                      const practiceName = (res.descripcionpractica || "")
                        .toLowerCase()
                        .trim();
                      const isRedundantHeader =
                        practiceName.includes(analysisName);

                      return (
                        <React.Fragment key={index}>
                          {res.grupotitulo && isNewGroup && (
                            <div className="group-header-modern">
                              {res.grupotitulo}
                            </div>
                          )}
                          {isNewAnalysis &&
                            res.analisis &&
                            res.analisis !== res.grupotitulo &&
                            !isRedundantHeader && (
                              <div className="analysis-subheader-modern">
                                {res.analisis}
                              </div>
                            )}
                          <div className="result-row-modern group-hover-trigger">
                            <div className="col-det">
                              <span className="test-name">
                                {(res.descripcionpractica || "").replace(
                                  /\s*%$/,
                                  "",
                                )}
                              </span>
                              {res.metodo && (
                                <span className="method-badge">
                                  {res.metodo}
                                </span>
                              )}
                              {res.observaciones && (
                                <div className="hover-tooltip">
                                  <strong>Información:</strong>
                                  <p>{res.observaciones}</p>
                                </div>
                              )}
                            </div>
                            <div className="col-res">
                              <span className="res-value">{res.resultado}</span>
                            </div>
                            <div className="col-ref">
                              {res.valoresreferencia ||
                                res.rangovalidacion ||
                                "-"}
                            </div>
                            <div className="col-unit">{res.unidadmedida}</div>
                            <div className="col-status">
                              {(() => {
                                const calculated = getAnalysisStatus(
                                  res.resultado,
                                  res.valoresreferencia,
                                );

                                if (res.flag === "H") {
                                  return (
                                    <span className="status-pill status-danger">
                                      Alto <FiArrowUp />
                                    </span>
                                  );
                                }
                                if (res.flag === "L") {
                                  return (
                                    <span className="status-pill status-danger">
                                      Bajo <FiArrowDown />
                                    </span>
                                  );
                                }

                                if (calculated) {
                                  if (calculated.type === "high") {
                                    return (
                                      <span className="status-pill status-danger">
                                        Alto <FiArrowUp />
                                      </span>
                                    );
                                  }
                                  if (calculated.type === "low") {
                                    return (
                                      <span className="status-pill status-warning">
                                        Bajo <FiArrowDown />
                                      </span>
                                    );
                                  }
                                  if (calculated.type === "normal") {
                                    return (
                                      <span className="status-pill status-success">
                                        Normal <FiCheck />
                                      </span>
                                    );
                                  }
                                }

                                return null;
                              })()}
                            </div>
                          </div>
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
                    Haga <strong>click</strong> en un paciente para ver sus
                    resultados
                  </p>
                </>
              )}
            </div>
          )}
        </section>
      </main>

      <Email
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        protocolo={selectedItems[0]}
      />
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
          onClick={(e) => e.stopPropagation()}
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
      <ModalAdministracion
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
      />
    </div>
  );
}
