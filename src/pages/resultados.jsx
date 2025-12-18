import React from "react";
import "../styles/resultados.css";
import centraLabLogo from "../assets/centraLab_nuevo.png";

import {
  FiCalendar,
  FiUser,
  FiSearch,
  FiFilter,
  FiFileText,
  FiEye,
  FiDownload,
  FiPrinter,
  FiActivity,
  FiHash,
  FiCheckCircle,
  FiClock,
} from "react-icons/fi";
import { BiCapsule, BiPaste } from "react-icons/bi";

export default function Resultados() {
  const resultadosFake = [
    {
      dni: "25.459.023",
      apellido: "DE ARMAS",
      nombre: "ADRIAN ALFREDO",
      fecha: "26/01/2024",
      servicio: "RET",
      id: "480011685",
      estado: "Completo",
      debe: false,
    },
    {
      dni: "25.459.633",
      apellido: "DE ARMAS",
      nombre: "ADRIAN ALFREDO",
      fecha: "09/03/2022",
      servicio: "PHW",
      id: "450011830",
      estado: "En Proceso",
      debe: true,
    },
    {
      dni: "44.724.320",
      apellido: "TORRES",
      nombre: "MATIAS ALEXIS",
      fecha: "07/11/2025",
      servicio: "CAI-SSL",
      id: "SSLLA32511",
      estado: "Completo",
      debe: false,
    },
    {
      dni: "29.941.506",
      apellido: "HERMIDA",
      nombre: "CHRISTIAN MATIAS",
      fecha: "06/11/2025",
      servicio: "GUA-SSL",
      id: "SSLLA22511",
      estado: "Completo",
      debe: true,
    },
    {
      dni: "38.691.179",
      apellido: "MONICAT",
      nombre: "MATIAS AGUSTIN",
      fecha: "05/11/2025",
      servicio: "AMB-SSL",
      id: "SSLLA42511",
      estado: "Completo",
      debe: false,
    },
  ];

  return (
    <div className="dashboard-container">
      <aside className="sidebar-filters">
        <div className="sidebar-header">
          {/* Logo o Texto de respaldo */}
          {centraLabLogo ? (
            <img src={centraLabLogo} alt="CentraLab" className="sidebar-logo" />
          ) : (
            <h2>CentraLab</h2>
          )}
          <div className="filter-title">
            <FiFilter /> <span>Filtros</span>
          </div>
        </div>

        <form className="filters-form">
          {/* Grupo: Fecha Desde */}
          <div className="filter-group">
            <label>Fecha Desde</label>
            <div className="input-wrapper">
              <input type="date" className="input-modern pl-icon" />
            </div>
          </div>

          {/* Grupo: Fecha Hasta */}
          <div className="filter-group">
            <label>Fecha Hasta</label>
            <div className="input-wrapper">
              <input type="date" className="input-modern pl-icon" />
            </div>
          </div>

          {/* Grupo: Datos Paciente */}
          <div className="filter-group">
            <label>DNI Paciente</label>
            <input
              type="text"
              className="input-modern"
              placeholder="Ej: 25459633"
            />
          </div>

          <div className="filter-group">
            <label>Apellido del Paciente</label>
            <input
              type="text"
              className="input-modern"
              placeholder="Buscar apellido..."
            />
          </div>

          <div className="filter-group">
            <label>Nombre Paciente</label>
            <input
              type="text"
              className="input-modern"
              placeholder="Buscar nombre..."
            />
          </div>

          {/* Grupo: Protocolo */}
          <div className="filter-group">
            <label>ID Petición / Protocolo</label>
            <div className="input-wrapper">
              <input
                type="text"
                className="input-modern pl-icon"
                placeholder="Protocolo / ID"
              />
            </div>
          </div>

          {/* Grupo: Paginación y Servicio */}
          <div className="filter-row">
            <div className="filter-group half">
              <label>Pág.</label>
              <input
                type="number"
                className="input-modern"
                defaultValue={1}
                min={1}
              />
            </div>
            <div className="filter-group half">
              <label>Filas</label>
              <select className="input-modern">
                <option>25</option>
                <option>50</option>
                <option>100</option>
              </select>
            </div>
          </div>

          <div className="filter-group">
            <label>Servicio Médico</label>
            <select className="input-modern">
              <option value="">Todos los servicios</option>
              <option value="RET">RET</option>
              <option value="PHW">PHW</option>
              <option value="CAI">CAI-SSL</option>
            </select>
          </div>

          <button type="button" className="btn-filtrar">
            <FiSearch /> Buscar
          </button>
        </form>
      </aside>

      {/* --- ÁREA PRINCIPAL (SPLIT VIEW) --- */}
      <main className="split-view">
        {/* Tabla de Resultados */}
        <section className="list-panel">
          {/* Barra de Acciones */}
          <div className="panel-header-actions">
            <button className="btn-mini-action">
              <BiPaste size={20} /> Historia Clínica
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
            <button className="btn-mini-action">
              <BiCapsule size={20} /> Vademecum
            </button>
          </div>

          {/* Tabla */}
          <div className="table-wrapper">
            <table className="resultados-table">
              <thead>
                <tr>
                  <th>DNI Paciente</th>
                  <th>Apellido</th>
                  <th>Nombre</th>
                  <th>Fecha</th>
                  <th>Servicio</th>
                  <th>Petición ID</th>
                  <th style={{ textAlign: "center" }}>Debe</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {resultadosFake.map((item, index) => (
                  <tr key={index} className={index === 0 ? "selected-row" : ""}>
                    <td className="font-mono">{item.dni}</td>
                    <td className="font-bold">{item.apellido}</td>
                    <td>{item.nombre}</td>
                    <td>{item.fecha}</td>
                    <td>
                      <span className="badge-service">{item.servicio}</span>
                    </td>
                    <td className="font-mono">{item.id}</td>

                    <td style={{ textAlign: "center" }}>
                      <span
                        className={`indicator-dot ${
                          item.debe ? "dot-red" : "dot-green"
                        }`}
                        title={item.debe ? "Posee Deuda" : "Sin Deuda"}
                      ></span>
                    </td>

                    <td>
                      {item.estado === "Completo" ? (
                        <span className="status-badge status-complete">
                          <FiCheckCircle /> {item.estado}
                        </span>
                      ) : (
                        <span className="status-badge status-pending">
                          <FiClock /> {item.estado}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Detalle / Reporte */}
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
