import React from 'react';
import { 
  FiChevronLeft, 
  FiChevronRight, 
  FiChevronsLeft, 
  FiChevronsRight 
} from "react-icons/fi";
import '../styles/resultados.css'; // Usamos tus estilos existentes

export const AdvancedPagination = ({ 
  page, 
  onPageChange, 
  hasMoreData, // Prop clave: true si la API trajo resultados llenos
  isLoading 
}) => {
  
  // Función segura para cambiar página
  const handleMove = (newPage) => {
    if (newPage >= 1 && !isLoading) {
      onPageChange(newPage);
    }
  };

  // Renderizar números de página (Ventana deslizante)
  // Mostramos: Actual - 2, Actual - 1, [Actual], Actual + 1, Actual + 2
  const renderPageNumbers = () => {
    const pages = [];
    const range = 2; // Cuántos números a los lados

    for (let i = page - range; i <= page + range; i++) {
      if (i > 0) {
        // Solo mostramos páginas futuras si "parece" haber más datos
        // O si son páginas pasadas (que sabemos que existen)
        const isFuture = i > page;
        if (isFuture && !hasMoreData) continue; 

        pages.push(
          <button
            key={i}
            className={`btn-page ${i === page ? 'active' : ''}`}
            onClick={() => handleMove(i)}
            disabled={isLoading}
          >
            {i}
          </button>
        );
      }
    }
    return pages;
  };

  return (
    <div className="pagination-bar">
      {/* Texto informativo (Opcional, ya que no tenemos total) */}
      <span style={{ color: "#666", fontSize: "0.85rem", fontWeight: 500 }}>
        Página {page}
      </span>

      <div className="pagination-controls">
        {/* --- RETROCESO RÁPIDO (-10) --- */}
        <button 
          className="btn-page" 
          onClick={() => handleMove(page - 10)}
          disabled={page <= 10 || isLoading}
          title="Retroceder 10 páginas"
        >
          <FiChevronsLeft />
        </button>

        {/* --- ANTERIOR (-1) --- */}
        <button 
          className="btn-page" 
          onClick={() => handleMove(page - 1)}
          disabled={page === 1 || isLoading}
          title="Anterior"
        >
          <FiChevronLeft />
        </button>

        {/* --- NÚMEROS CENTRALES --- */}
        {renderPageNumbers()}

        {/* --- SIGUIENTE (+1) --- */}
        <button 
          className="btn-page" 
          onClick={() => handleMove(page + 1)}
          disabled={!hasMoreData || isLoading}
          title="Siguiente"
        >
          <FiChevronRight />
        </button>

        {/* --- AVANCE RÁPIDO (+10) --- */}
        <button 
          className="btn-page" 
          onClick={() => handleMove(page + 10)}
          disabled={!hasMoreData || isLoading} 
          title="Saltar 10 páginas"
        >
          <FiChevronsRight />
        </button>
      </div>
    </div>
  );
};