import React, { useState } from "react";
import { useProtocols } from "../hooks/useProtocols";
import "../styles/resultados.css";
import centraLabLogo from "../assets/centraLab_nuevo.png";

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
} from "react-icons/fi";
import { BiCapsule } from "react-icons/bi";

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

  const [activeFilters, setActiveFilters] = useState(formValues);

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
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
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
          <div className="filter-title">
            <FiFilter /> <span>Filtros</span>
          </div>
        </div>

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

          {/* APELLIDO / NOMBRE */}
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

          {/* SERVICIO (BRANCH) */}
          <div className="filter-group">
            <label>Servicio Médico</label>
            <select
              name="branch_id"
              value={formValues.branch_id}
              onChange={handleInputChange}
              className="input-modern"
            >
              <option value="">Todos los servicios</option>
              <option value="RET">RET</option>
              <option value="PHW">PHW</option>
              <option value="CAI">CAI-SSL</option>
            </select>
          </div>

          <button type="submit" className="btn-filtrar" disabled={isLoading}>
            {isLoading ? (
              "Buscando..."
            ) : (
              <>
                <FiSearch /> Buscar
              </>
            )}
          </button>
        </form>
      </aside>

      {/* MAIN CONTENT */}
      <main className="split-view">
        <section className="list-panel">
          <div className="panel-header-actions">
            <button className="btn-mini-action">
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
            {/* INDICADOR DE REFRESH EN BACKGROUND */}
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

            {/* MANEJO DE ERRORES */}
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
                  <tr key={item.protocoloid}>
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
            {/* ... </table> ... */}
          
          {/* BARRA DE PAGINACIÓN */}
          <div className="pagination-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderTop: '1px solid #eee' }}>
            
            <span style={{ color: '#666', fontSize: '0.9rem' }}>
              Mostrando {data?.protocolos?.length || 0} resultados
            </span>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button 
                onClick={handlePreviousPage}
                disabled={formValues.page === 1 || isLoading}
                className="btn-pagination"
                style={{
                  padding: '8px 16px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  background: formValues.page === 1 ? '#f5f5f5' : 'white',
                  cursor: formValues.page === 1 ? 'not-allowed' : 'pointer',
                  color: formValues.page === 1 ? '#aaa' : '#333'
                }}
              >
                &lt; Anterior
              </button>

              <span style={{ fontWeight: 'bold', minWidth: '30px', textAlign: 'center' }}>
                {formValues.page}
              </span>

              <button 
                onClick={handleNextPage}
                // Deshabilitamos si: está cargando O trajo menos registros de los pedidos (fin de lista)
                disabled={isLoading || (data?.protocolos?.length || 0) < Number(formValues.page_size)}
                className="btn-pagination"
                style={{
                  padding: '8px 16px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  background: (data?.protocolos?.length || 0) < Number(formValues.page_size) ? '#f5f5f5' : 'white',
                  cursor: (data?.protocolos?.length || 0) < Number(formValues.page_size) ? 'not-allowed' : 'pointer',
                  color: (data?.protocolos?.length || 0) < Number(formValues.page_size) ? '#aaa' : '#333'
                }}
              >
                Siguiente &gt;
              </button>
            </div>
          </div>
          </div>
        </section>

        <section className="detail-panel">
          <div className="detail-header">
            <div className="patient-info">
              <h2>
                <FiActivity className="icon-title" /> Reporte de Resultados
              </h2>
              <p>
                Protocolo: <strong>480011685</strong> | Paciente:{" "}
                <strong>DE ARMAS, ADRIAN</strong>
              </p>
            </div>
            <button className="btn-print">
              <FiPrinter /> Imprimir
            </button>
          </div>

          <div className="report-canvas">
            <div className="report-paper">
              <div className="report-section">
                <h3 className="section-title">QUÍMICA CLÍNICA</h3>

                <div className="result-grid header">
                  <span>Determinación</span>
                  <span>Resultado</span>
                  <span>Unidades</span>
                  <span>Ref.</span>
                </div>

                <div className="result-grid row">
                  <span className="det-name">Glucemia</span>
                  <span className="det-val normal">0.95</span>
                  <span className="det-unit">g/l</span>
                  <span className="det-ref">0.70 - 1.10</span>
                </div>

                <div className="result-grid row">
                  <span className="det-name">Colesterol Total</span>
                  <span className="det-val warning">2.15</span>
                  <span className="det-unit">g/l</span>
                  <span className="det-ref">hasta 2.00</span>
                </div>

                <div className="result-grid row">
                  <span className="det-name">Triglicéridos</span>
                  <span className="det-val normal">1.50</span>
                  <span className="det-unit">mg/dl</span>
                  <span className="det-ref">40 - 170</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
