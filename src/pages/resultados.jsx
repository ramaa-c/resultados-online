import React, { useState } from "react";
import { useProtocols } from "../hooks/useProtocols";
import { useProtocolResults } from "../hooks/useProtocolResults";
import "../styles/resultados.css";
import centraLabLogo from "../assets/centraLab_nuevo.png";
import Email from "./email.jsx";
import "../styles/email.css";

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
} from "react-icons/fi";

export default function Resultados() {
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
  });

  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  const [activeFilters, setActiveFilters] = useState(formValues);
  const [highlightedProtocol, setHighlightedProtocol] = useState(null);

  const [selectedProtocol, setSelectedProtocol] = useState(null);

  const {
    data: resultsData,
    isLoading: isLoadingResults,
    isError: isErrorResults,
  } = useProtocolResults(selectedProtocol?.protocoloid);

  const handleViewResults = (protocolo) => {
    const target = protocolo || highlightedProtocol;
    if (target) {
      setSelectedProtocol(target);
    }
  };
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading, isError, isFetching } = useProtocols(activeFilters);

  // MANEJADORES
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
    };
    setFormValues(resetValues);
    setActiveFilters(resetValues);
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

  return (
    <div className="dashboard-container">
      {/* SIDEBAR FILTROS */}
      <aside className="sidebar-filters">
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
            {/* FECHA DESDE */}
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

            {/* FECHA HASTA */}
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

            {/* DNI */}
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

            {/* APELLIDO */}
            <div className="filter-group">
              <label>Apellido del Paciente</label>
              <input
                type="text"
                name="apellido_paciente"
                value={formValues.apellido_paciente}
                onChange={handleInputChange}
                className="input-modern"
                placeholder="Buscar apellido..."
              />
            </div>

            {/* NOMBRE */}
            <div className="filter-group">
              <label>Nombre Paciente</label>
              <input
                type="text"
                name="patient_name"
                value={formValues.patient_name}
                onChange={handleInputChange}
                className="input-modern"
                placeholder="Buscar nombre..."
              />
            </div>

            {/* PROTOCOLO ID */}
            <div className="filter-group">
              <label>ID Petición / Protocolo</label>
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

            {/* PAGINADO Y FILAS */}
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

            {/* SERVICIO */}
            <div className="filter-group">
              <label>Servicio Médico</label>
              <input
                type="text"
                name="branch_id"
                value={formValues.branch_id}
                onChange={handleInputChange}
                className="input-modern"
                placeholder="Ej: RET, 766CL..."
              />
            </div>

            {/* BOTONES DE ACCIÓN */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                marginTop: "20px",
              }}
            >
              <button
                type="submit"
                className="btn-filtrar"
                disabled={isLoading}
                style={{ width: "100%" }}
              >
                {isLoading ? (
                  "..."
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
                  marginTop: "0px",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = "#F1F5F9";
                  e.currentTarget.style.borderColor = "#94A3B8";
                  e.currentTarget.style.color = "#334155";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.borderColor = "#CBD5E1";
                  e.currentTarget.style.color = "#64748B";
                }}
              >
                <FiTrash2 /> Limpiar Filtros
              </button>
            </div>
          </form>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="split-view">
        <section className="list-panel">
          <div className="panel-header-actions">
            <button
              className="btn-mini-action"
              onClick={() => setIsEmailModalOpen(true)}
              disabled={!highlightedProtocol}
            >
              <FiMail size={20} /> Enviar por Email
            </button>
            <button className="btn-mini-action">
              <FiFileText size={20} /> Visualizar PDF
            </button>
            <button className="btn-mini-action">
              <FiEye size={20} /> Ver Resultados
            </button>
            <button className="btn-mini-action">
              <FiDownload size={20} /> Descargar
            </button>
          </div>

          <div className="table-wrapper">
            {isFetching && !isLoading && (
              <div
                style={{
                  padding: "5px",
                  background: "#f0f9ff",
                  fontSize: "12px",
                  textAlign: "center",
                }}
              >
                Actualizando datos...
              </div>
            )}

            {isError && (
              <div style={{ color: "red", padding: "20px" }}>
                Error al cargar los datos.
              </div>
            )}

            <table className="resultados-table">
              <thead>
                <tr>
                  <th>Petición ID</th>
                  <th>Fecha</th>
                  <th>Origen</th>
                  <th>DNI Paciente</th>
                  <th>Apellido</th>
                  <th>Nombre</th>
                  <th style={{ textAlign: "center" }}>Debe</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody
                style={{
                  opacity: isFetching ? 0.6 : 1,
                  transition: "opacity 0.2s",
                }}
              >
                {data?.protocolos?.map((item) => (
                  <tr
                    key={item.protocoloid}
                    className={
                      highlightedProtocol?.protocoloid === item.protocoloid
                        ? "selected-row"
                        : ""
                    }
                    onClick={() => setHighlightedProtocol(item)}
                    onDoubleClick={() => handleViewResults(item)}
                    style={{ cursor: "pointer", userSelect: "none" }}
                  >
                    <td className="font-mono">{item.accessionnumber}</td>
                    <td>{formatDate(item.ordereddate)}</td>
                    <td>
                      <span className="badge-service">
                        {item.paclocid || "GRL"}
                      </span>
                    </td>
                    <td className="font-mono">{item.pacid}</td>
                    <td className="font-bold">{item.apellidopaciente}</td>
                    <td>{item.nombrepaciente}</td>
                    <td style={{ textAlign: "center" }}>
                      <span
                        className={`indicator-dot ${
                          item.debe ? "dot-red" : "dot-green"
                        }`}
                        title={item.debe ? "Posee Deuda" : "Sin Deuda"}
                      ></span>
                    </td>
                    <td>
                      {item.completo !== "" ? (
                        <span className="status-badge status-complete">
                          <FiCheckCircle /> Completo
                        </span>
                      ) : (
                        <span className="status-badge status-pending">
                          <FiClock /> Pendiente
                        </span>
                      )}
                    </td>
                  </tr>
                ))}

                {data?.protocolos?.length === 0 && (
                  <tr>
                    <td
                      colSpan="8"
                      style={{ textAlign: "center", padding: "20px" }}
                    >
                      No se encontraron resultados
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <div
              className="pagination-bar"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "1rem",
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

        <section className="detail-panel">
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
                  {/* CABECERA CON DATOS DEL PACIENTE */}
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

                  {/* CONTENIDO DE RESULTADOS DE LA API */}
                  <div className="results-content">
                    {isLoadingResults ? (
                      <div className="loading-results">
                        Cargando análisis...
                      </div>
                    ) : isErrorResults ? (
                      <div className="error-container">
                        ⚠️ Error al conectar con el servidor.
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
                          const mostrarTitulo =
                            index === 0 ||
                            res.grupotitulo !==
                              resultsData.resultados[index - 1].grupotitulo;
                          return (
                            <React.Fragment key={index}>
                              {res.grupotitulo && mostrarTitulo && (
                                <div className="result-category">
                                  {res.grupotitulo}
                                </div>
                              )}

                              <div className="result-item-row">
                                <div className="det-col">
                                  <strong>{res.analisis}</strong>
                                  {res.metodo && (
                                    <small>Método: {res.metodo}</small>
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
              <FiEye size={50} style={{ opacity: 0.3 }} />
              <p>
                Haga <strong>doble clic</strong> en un paciente para ver sus
                resultados
              </p>
            </div>
          )}
        </section>
      </main>
      <Email
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        protocolo={highlightedProtocol}
      />
    </div>
  );
}
