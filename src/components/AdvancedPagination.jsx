import React from "react";
import {
  FiChevronLeft,
  FiChevronRight,
  FiChevronsLeft,
  FiChevronsRight,
} from "react-icons/fi";
import "../styles/resultados.css";

export const AdvancedPagination = ({
  page,
  onPageChange,
  hasMoreData,
  isLoading,
  knownEndPage,
}) => {
  const handleMove = (newPage) => {
    if (knownEndPage !== null && newPage >= knownEndPage) return;

    if (newPage >= 1 && !isLoading) {
      onPageChange(newPage);
    }
  };

  const renderPageNumbers = () => {
    const pages = [];
    const range = 2;

    for (let i = page - range; i <= page + range; i++) {
      if (i > 0) {
        if (knownEndPage !== null && i >= knownEndPage) continue;

        const isFuture = i > page;
        if (isFuture && !hasMoreData) continue;

        pages.push(
          <button
            key={i}
            className={`btn-page ${i === page ? "active" : ""}`}
            onClick={() => handleMove(i)}
            disabled={isLoading}
          >
            {i}
          </button>,
        );
      }
    }
    return pages;
  };

  return (
    <div className="pagination-bar">
      <span style={{ color: "#666", fontSize: "0.85rem", fontWeight: 500 }}>
        Página {page}
      </span>

      <div className="pagination-controls">
        {/* --- RETROCESO (-10) --- */}
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

        {/* --- NÚMEROS DE PÁGINA --- */}
        {renderPageNumbers()}

        {/* --- SIGUIENTE (+1) --- */}
        <button
          className="btn-page"
          onClick={() => handleMove(page + 1)}
          disabled={
            !hasMoreData ||
            isLoading ||
            (knownEndPage !== null && page + 1 >= knownEndPage)
          }
          title="Siguiente"
        >
          <FiChevronRight />
        </button>

        {/* --- SALTO GRANDE (+10) --- */}
        <button
          className="btn-page"
          onClick={() => handleMove(page + 10)}
          disabled={
            !hasMoreData ||
            isLoading ||
            (knownEndPage !== null && page + 10 >= knownEndPage)
          }
          title={
            knownEndPage !== null && page + 10 >= knownEndPage
              ? "Fin de la lista alcanzado"
              : "Saltar 10 páginas"
          }
        >
          <FiChevronsRight />
        </button>
      </div>
    </div>
  );
};
