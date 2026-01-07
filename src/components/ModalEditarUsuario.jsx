import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import api from "../api/axios";
import {
  FiChevronLeft,
  FiChevronRight,
  FiX,
  FiCheck,
  FiSave,
  FiEdit,
  FiSearch,
  FiPlus,
} from "react-icons/fi";
import "../styles/modalUsuario.css";

// --- ESQUEMA DE VALIDACIÓN ---
const schema = z.object({
  username: z.string().min(3, "Usuario debe tener al menos 3 caracteres"),
  fullname: z.string().min(1, "El nombre completo es obligatorio"),
  email: z.string().email("Formato de email inválido"),

  isadministrator: z.boolean(),
  mustchangepassword: z.boolean(),
  canviewreserved: z.boolean(),

  canviewallbranches: z.boolean(),
  branchidlist: z.array(z.string()).optional(),

  canviewallforwarders: z.boolean(),
  forwarderidlist: z.array(z.string()).optional(),
});

// --- COMPONENTE SELECTOR ASÍNCRONO ---
const AsyncSelector = ({
  title,
  queryKey,
  fetchUrl,
  searchParamName,
  selectedIds,
  onToggleItem,
  isDisabled,
}) => {
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [inputValue, setInputValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading, isError } = useQuery({
    queryKey: [queryKey, page, searchQuery],
    queryFn: async () => {
      const params = {
        page: page,
        page_size: pageSize,
        [searchParamName]: searchQuery,
      };
      const res = await api.get(fetchUrl, { params });
      const rawData = res.data.items || res.data;

      if (Array.isArray(rawData)) {
        return rawData.map((item) => ({
          id: item.id.toString(),
          label:
            item.name ||
            item.fullname ||
            item.description ||
            item.business_name ||
            item.label ||
            item.value ||
            item.id,
        }));
      } else {
        return Object.entries(rawData).map(([id, label]) => ({
          id: id.toString(),
          label: label || id,
        }));
      }
    },
    keepPreviousData: true,
  });

  const triggerSearch = () => {
    setSearchQuery(inputValue);
    setPage(1);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      triggerSearch();
    }
  };

  return (
    <div className="selector-wrapper" style={{ position: "relative" }}>
      {/* OVERLAY DE BLOQUEO */}
      {isDisabled && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(240, 242, 245, 0.7)",
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backdropFilter: "blur(1px)",
            color: "#555",
            fontWeight: "600",
            fontSize: "0.9rem",
            borderRadius: "6px",
            border: "1px solid #e5e7eb",
          }}
        >
          <span
            style={{
              backgroundColor: "white",
              padding: "5px 10px",
              borderRadius: "4px",
              boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
            }}
          >
            Visualización total de {title.toLowerCase()}.
          </span>
        </div>
      )}

      {/* CONTENIDO CON OPACIDAD */}
      <div
        style={{
          opacity: isDisabled ? 0.3 : 1,
          pointerEvents: isDisabled ? "none" : "auto",
          filter: isDisabled ? "grayscale(100%)" : "none",
        }}
      >
        <div className="selector-search-bar">
          <input
            type="text"
            className="selector-input-search"
            placeholder={`Buscar ${title}... (Enter)`}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button type="button" className="selector-btn-search">
            <FiSearch />
          </button>
        </div>

        <div className="selector-body">
          <div className="selector-col">
            <h5 className="selector-col-title">Resultados</h5>
            <div className="selector-list">
              {isLoading ? (
                <p
                  style={{
                    fontSize: "0.8rem",
                    color: "#666",
                    padding: "10px",
                  }}
                >
                  Cargando...
                </p>
              ) : isError ? (
                <p
                  style={{
                    fontSize: "0.8rem",
                    color: "red",
                    padding: "10px",
                  }}
                >
                  Error al cargar
                </p>
              ) : !data || data.length === 0 ? (
                <p style={{ fontSize: "0.8rem", padding: "10px" }}>
                  No hay resultados
                </p>
              ) : (
                data.map((item) => {
                  const isSelected = selectedIds.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => onToggleItem(item)}
                      className={`selector-item ${
                        isSelected ? "selected" : ""
                      }`}
                    >
                      <span
                        style={{
                          flex: 1,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                        title={item.label}
                      >
                        {item.label}
                      </span>
                      {isSelected ? (
                        <FiCheck color="green" />
                      ) : (
                        <FiPlus color="#007bff" />
                      )}
                    </div>
                  );
                })
              )}
            </div>
            <div className="selector-pagination">
              <button
                type="button"
                className="page-btn"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <FiChevronLeft />
              </button>
              <span>Pág {page}</span>
              <button
                type="button"
                className="page-btn"
                onClick={() => setPage((p) => p + 1)}
                disabled={!data || data.length < pageSize}
              >
                <FiChevronRight />
              </button>
            </div>
          </div>

          <div className="selector-col">
            <h5 className="selector-col-title">
              Seleccionados ({selectedIds.length})
            </h5>
            <div className="selector-list">
              {selectedIds.length === 0 && (
                <p
                  style={{
                    fontSize: "0.8rem",
                    color: "#999",
                    fontStyle: "italic",
                    padding: "10px",
                  }}
                >
                  Nada seleccionado
                </p>
              )}
              {selectedIds.map((id) => {
                const itemInData = data?.find((d) => d.id === id);
                const displayText = itemInData ? itemInData.label : id;
                return (
                  <div key={id} className="selector-tag">
                    <span
                      style={{
                        flex: 1,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {displayText}
                    </span>
                    <button
                      type="button"
                      onClick={() => onToggleItem({ id })}
                      style={{
                        border: "none",
                        background: "transparent",
                        cursor: "pointer",
                        color: "#0284c7",
                        padding: 0,
                        marginLeft: 5,
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <FiX />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- COMPONENTE PRINCIPAL PARA EDITAR ---
const ModalEditarUsuario = ({ isOpen, onClose, user, onUserUpdated }) => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const watchAllBranches = watch("canviewallbranches");
  const branchIdList = watch("branchidlist") || [];
  const watchAllForwarders = watch("canviewallforwarders");
  const forwarderIdList = watch("forwarderidlist") || [];

  // --- CARGAR DATOS ---
  useEffect(() => {
    if (isOpen && user) {
      const safeBranchIds = user.branchidlist
        ? user.branchidlist.map(String)
        : [];
      const safeForwarderIds = user.forwarderidlist
        ? user.forwarderidlist.map(String)
        : [];

      reset({
        username: user.username,
        fullname: user.fullname,
        email: user.email,
        isadministrator: user.isadministrator,
        mustchangepassword: user.mustchangepassword,
        canviewreserved: user.canviewreserved,

        canviewallbranches: user.canviewallbranches,
        branchidlist: safeBranchIds,

        canviewallforwarders: user.canviewallforwarders,
        forwarderidlist: safeForwarderIds,
      });
    }
  }, [user?.userid, isOpen, reset]);

  const handleToggle = (item, fieldName, list) => {
    const itemIdStr = item.id.toString();
    const newList = list.includes(itemIdStr)
      ? list.filter((id) => id !== itemIdStr)
      : [...list, itemIdStr];
    setValue(fieldName, newList, { shouldDirty: true });
  };

  const onSubmit = async (data) => {
    try {
      const payload = {
        userid: user.userid,
        status: user.status,
        createdate: user.createdate,
        expirationdate: user.expirationdate,

        username: data.username,
        fullname: data.fullname,
        email: data.email,
        isadministrator: data.isadministrator,
        mustchangepassword: data.mustchangepassword,
        canviewreserved: data.canviewreserved,

        canviewallbranches: data.canviewallbranches,
        branchidlist: data.canviewallbranches ? [] : data.branchidlist,
        branchnamelist: [],

        canviewallforwarders: data.canviewallforwarders,
        forwarderidlist: data.canviewallforwarders ? [] : data.forwarderidlist,
        forwardernamelist: [],
      };

      await api.put("/users", payload);

      // --- TOAST DE ÉXITO ---
      toast.success("Usuario actualizado correctamente");

      onUserUpdated && onUserUpdated();
      onClose();
    } catch (error) {
      console.error(error);
      const errorMsg =
        error.response?.data?.message || error.message || "Error desconocido";

      // --- TOAST DE ERROR ---
      toast.error(`Error al actualizar: ${errorMsg}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="edit-modal-overlay">
      <div className="modal-overlay">
        <div className="modal-container">
          <div className="modal-header">
            <h2 className="modal-title">
              <FiEdit /> Editar Usuario:{" "}
              <span style={{ color: "#334155", fontWeight: 400 }}>
                {user?.username}
              </span>
            </h2>
            <button type="button" className="modal-close-btn" onClick={onClose}>
              <FiX />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="modal-form">
            <div className="modal-body">
              {/* SECCIÓN 1: DATOS DE CUENTA */}
              <div>
                <h4 className="section-title">Datos de Cuenta</h4>
                <div className="form-grid-top">
                  <div className="form-group">
                    <label className="form-label">Usuario</label>
                    <input
                      type="text"
                      className={`form-input ${errors.username ? "error" : ""}`}
                      {...register("username")}
                    />
                    {errors.username && (
                      <span className="error-msg">
                        {errors.username.message}
                      </span>
                    )}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Nombre Completo</label>
                    <input
                      type="text"
                      className={`form-input ${errors.fullname ? "error" : ""}`}
                      {...register("fullname")}
                    />
                    {errors.fullname && (
                      <span className="error-msg">
                        {errors.fullname.message}
                      </span>
                    )}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className={`form-input ${errors.email ? "error" : ""}`}
                      {...register("email")}
                    />
                    {errors.email && (
                      <span className="error-msg">{errors.email.message}</span>
                    )}
                  </div>

                  {/* --- CHECKBOXES --- */}
                  <div
                    className="admin-box"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    <label className="checkbox-label">
                      <input type="checkbox" {...register("isadministrator")} />
                      Es Administrador
                      <span
                        style={{
                          fontSize: "0.8rem",
                          color: "#64748b",
                          marginLeft: "10px",
                          fontWeight: "normal",
                        }}
                      >
                        (Acceso total)
                      </span>
                    </label>

                    <label className="checkbox-label">
                      <input type="checkbox" {...register("canviewreserved")} />
                      Ver Protocolos Reservados
                    </label>
                  </div>
                </div>
              </div>

              {/* SECCIÓN 2: SELECTORES */}
              <div>
                <h4 className="section-title">Accesos y Restricciones</h4>
                <div className="selectors-row">
                  {/* Sedes */}
                  <div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "5px",
                        alignItems: "center",
                        marginTop: "10px",
                      }}
                    >
                      <label className="form-label" style={{ margin: 0 }}>
                        Sedes
                      </label>
                      <label
                        style={{
                          fontSize: "0.8rem",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                          color: "#64748b",
                        }}
                      >
                        <input
                          type="checkbox"
                          {...register("canviewallbranches")}
                        />{" "}
                        Ver Todas
                      </label>
                    </div>
                    <AsyncSelector
                      title="Sedes"
                      queryKey="branches"
                      fetchUrl="/branches"
                      searchParamName="branch_name"
                      isDisabled={watchAllBranches}
                      selectedIds={branchIdList}
                      onToggleItem={(item) =>
                        handleToggle(item, "branchidlist", branchIdList)
                      }
                    />
                  </div>

                  {/* Derivadores */}
                  <div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "5px",
                        alignItems: "center",
                        marginTop: "10px",
                      }}
                    >
                      <label className="form-label" style={{ margin: 0 }}>
                        Clientes
                      </label>
                      <label
                        style={{
                          fontSize: "0.8rem",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                          color: "#64748b",
                        }}
                      >
                        <input
                          type="checkbox"
                          {...register("canviewallforwarders")}
                        />{" "}
                        Ver Todos
                      </label>
                    </div>
                    <AsyncSelector
                      title="Clientes"
                      queryKey="forwarders"
                      fetchUrl="/forwarders"
                      searchParamName="forwarder_name"
                      isDisabled={watchAllForwarders}
                      selectedIds={forwarderIdList}
                      onToggleItem={(item) =>
                        handleToggle(item, "forwarderidlist", forwarderIdList)
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" onClick={onClose} className="btn-cancel">
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-save"
              >
                <FiSave />{" "}
                {isSubmitting ? "Guardando..." : "Actualizar Usuario"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ModalEditarUsuario;
