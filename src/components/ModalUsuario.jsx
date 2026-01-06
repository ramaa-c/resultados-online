import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import api from "../api/axios";
import {
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
  FiX,
  FiPlus,
  FiCheck,
  FiSave,
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

// --- SUB-COMPONENTE: SELECTOR ASÍNCRONO ---
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
    enabled: !isDisabled,
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

  if (isDisabled) {
    return (
      <div className="selector-disabled">
        Opción "Ver Todos" habilitada. Se ignorará la selección manual.
      </div>
    );
  }

  return (
    <div className="selector-wrapper">
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
              <p style={{ fontSize: "0.8rem", color: "#666", padding: "10px" }}>
                Cargando...
              </p>
            ) : isError ? (
              <p style={{ fontSize: "0.8rem", color: "red", padding: "10px" }}>
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
                    className={`selector-item ${isSelected ? "selected" : ""}`}
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
  );
};

// --- COMPONENTE PRINCIPAL ---
const ModalUsuario = ({ isOpen, onClose, userToEdit = null, onUserSaved }) => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      username: "",
      fullname: "",
      email: "",
      isadministrator: false,
      canviewreserved: false,
      mustchangepassword: true,
      canviewallbranches: false,
      branchidlist: [],
      canviewallforwarders: false,
      forwarderidlist: [],
    },
  });

  const watchAllBranches = watch("canviewallbranches");
  const branchIdList = watch("branchidlist");
  const watchAllForwarders = watch("canviewallforwarders");
  const forwarderIdList = watch("forwarderidlist");

  useEffect(() => {
    if (userToEdit) {
      reset(userToEdit);
    } else {
      reset({
        username: "",
        fullname: "",
        email: "",
        status: "Active",
        isadministrator: false,
        canviewreserved: false, // <--- RESET
        mustchangepassword: true,
        canviewallbranches: false,
        branchidlist: [],
        canviewallforwarders: false,
        forwarderidlist: [],
      });
    }
  }, [userToEdit, reset, isOpen]);

  const handleToggle = (item, fieldName, list) => {
    const itemId = String(item.id);
    const isSelected = list.includes(itemId);

    const newList = isSelected
      ? list.filter((id) => id !== itemId)
      : [...list, itemId];

    setValue(fieldName, newList, { shouldDirty: true });
  };

  const onSubmit = async (data) => {
    try {
      const today = new Date();
      const createdStr = userToEdit
        ? userToEdit.createdate
        : today.toISOString().split("T")[0];
      const expDate = new Date(today);
      expDate.setFullYear(expDate.getFullYear() + 1);
      const expirationStr = expDate.toISOString().split("T")[0];

      const payload = {
        ...data,
        userid: userToEdit ? userToEdit.userid : 0,
        status: userToEdit ? userToEdit.status : "activo",
        mustchangepassword: true,
        createdate: createdStr,
        expirationdate: expirationStr,
        branchidlist: data.canviewallbranches ? [] : data.branchidlist,
        forwarderidlist: data.canviewallforwarders ? [] : data.forwarderidlist,
        branchnamelist: [],
        forwardernamelist: [],
      };

      if (userToEdit) {
        await api.post("/users", payload);
      } else {
        await api.post("/users", payload);
      }

      onUserSaved && onUserSaved();
      onClose();
    } catch (error) {
      console.error(error);
      alert(
        "Error al guardar usuario: " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-usuario-overlay">
      <div className="modal-overlay">
        <div className="modal-container">
          <div className="modal-header">
            <h2 className="modal-title">
              {userToEdit ? <FiCheck /> : <FiPlus />}
              {userToEdit ? "Editar Usuario" : "Nuevo Usuario"}
            </h2>
            <button type="button" className="modal-close-btn" onClick={onClose}>
              <FiX />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="modal-form">
            <div className="modal-body">
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

                  {/* --- CHECKBOXES DE PERMISOS --- */}
                  <div
                    className="admin-box"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    {/* ADMIN */}
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
                        (Acceso total al sistema)
                      </span>
                    </label>

                    {/* VER RESERVADOS (NUEVO) */}
                    <label className="checkbox-label">
                      <input type="checkbox" {...register("canviewreserved")} />
                      Ver Protocolos Reservados
                      <span
                        style={{
                          fontSize: "0.8rem",
                          color: "#64748b",
                          marginLeft: "10px",
                          fontWeight: "normal",
                        }}
                      >
                        (Acceso a datos sensibles)
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="section-title">Accesos y Restricciones</h4>
                <div className="selectors-row">
                  <div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "5px",
                        alignItems: "center",
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
                        Derivadores
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
                        Ver Todas
                      </label>
                    </div>
                    <AsyncSelector
                      title="Forwarders"
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
                <FiSave /> {isSubmitting ? "Guardando..." : "Guardar Usuario"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ModalUsuario;
