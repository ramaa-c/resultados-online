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
  FiEdit3,
  FiSettings
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

// --- COMPONENTE: MODAL PARA INPUT DE TEXTO ---
const ServiceConfigModal = ({ forwarderName, initialValue = "", onSave, onClose }) => {
  const [textValue, setTextValue] = useState(initialValue);

  return (
    <div 
      onClick={(e) => e.stopPropagation()} 
      style={{
        position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: "rgba(255, 255, 255, 0.6)", zIndex: 60,
        display: "flex", justifyContent: "center", alignItems: "center",
        borderRadius: "8px", backdropFilter: "blur(3px)" 
      }}
    >
      <div style={{
        backgroundColor: "#ffffff", border: "1px solid #e2e8f0",
        padding: "15px 20px", borderRadius: "12px", width: "280px", 
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)", 
        display: "flex", flexDirection: "column", gap: "10px", animation: "fadeIn 0.2s ease-out"
      }}>
        <div style={{ borderBottom: "1px solid #f1f5f9", paddingBottom: "8px", marginBottom: "0px" }}>
          <h4 style={{ margin: "0", fontSize: "0.85rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: "600" }}>
            Configurar Servicios
          </h4>
          <div style={{ color: "#0198CC", fontSize: "0.95rem", fontWeight: "700", marginTop: "2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {forwarderName}
          </div>
        </div>
        
        <div style={{ position: "relative" }}>
          <textarea
            autoFocus
            value={textValue}
            onChange={(e) => setTextValue(e.target.value)}
            rows={3}
            placeholder="Escriba los códigos aquí..."
            style={{
              width: "100%", backgroundColor: "#f8fafc", color: "#334155",
              border: "1px solid #cbd5e1", borderRadius: "8px", padding: "10px",
              fontFamily: "'Inter', sans-serif", fontSize: "0.9rem", resize: "none",
              outline: "none", boxSizing: "border-box", lineHeight: "1.4"
            }}
            onFocus={(e) => {
              e.target.style.backgroundColor = "#ffffff";
              e.target.style.borderColor = "#0198CC";
              e.target.style.boxShadow = "0 0 0 3px rgba(1, 152, 204, 0.1)";
            }}
            onBlur={(e) => {
              e.target.style.backgroundColor = "#f8fafc";
              e.target.style.borderColor = "#cbd5e1";
              e.target.style.boxShadow = "none";
            }}
          />
          <span style={{ fontSize: "0.7rem", color: "#94a3b8", display: "block", marginTop: "4px" }}>
            Separar con coma
          </span>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "5px" }}>
          <button 
            type="button" onClick={onClose} 
            style={{ 
              border: "1px solid #e2e8f0", background: "white", color: "#64748b",
              padding: "6px 12px", borderRadius: "6px", cursor: "pointer", 
              fontWeight: "500", fontSize: "0.8rem", transition: "all 0.2s"
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = "#f1f5f9"}
            onMouseLeave={(e) => e.target.style.backgroundColor = "white"}
          >
            Cancelar
          </button>
          <button 
            type="button" onClick={() => onSave(textValue)} 
            style={{ 
              background: "linear-gradient(135deg, #0198CC 0%, #006b8f 100%)", 
              color: "white", border: "none", padding: "6px 16px", 
              borderRadius: "6px", cursor: "pointer", fontWeight: "600",
              fontSize: "0.8rem", boxShadow: "0 2px 5px rgba(1, 152, 204, 0.3)"
            }}
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};

// --- SELECTOR ASÍNCRONO (VERSIÓN FIXEADA SCROLL) ---
const AsyncSelector = ({
  title,
  queryKey,
  fetchUrl,
  searchParamName,
  selectedIds,
  onToggleItem,
  isDisabled,
  hasConfiguration = false,
  configurations = {}, 
  onConfigureItem = () => {} 
}) => {
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [inputValue, setInputValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [itemsRegistry, setItemsRegistry] = useState({});

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
          label: item.name || item.fullname || item.business_name || item.label || item.value || item.id,
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

  useEffect(() => {
    if (data && Array.isArray(data)) {
      setItemsRegistry((prevRegistry) => {
        const newEntries = {};
        data.forEach((item) => {
          newEntries[item.id] = item.label;
        });
        return { ...prevRegistry, ...newEntries };
      });
    }
  }, [data]);

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
    // FIX 1: height: "100%" y overflow: hidden en el wrapper para contener a los hijos
    <div className="selector-wrapper" style={{ position: "relative", height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {isDisabled && (
        <div style={{
            position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(240, 242, 245, 0.7)", zIndex: 10,
            display: "flex", alignItems: "center", justifyContent: "center",
            backdropFilter: "blur(1px)", color: "#555", fontWeight: "600",
            fontSize: "0.9rem", borderRadius: "6px", border: "1px solid #e5e7eb",
          }}
        >
          <span style={{ backgroundColor: "white", padding: "5px 10px", borderRadius: "4px", boxShadow: "0 2px 5px rgba(0,0,0,0.1)" }}>
            Visualización total de {title.toLowerCase()}.
          </span>
        </div>
      )}

      {/* FIX 2: minHeight: 0 es CRÍTICO en flexbox para permitir scroll interno */}
      <div style={{ opacity: isDisabled ? 0.3 : 1, pointerEvents: isDisabled ? "none" : "auto", filter: isDisabled ? "grayscale(100%)" : "none", display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
        
        <div className="selector-search-bar" style={{ marginBottom: "5px", flexShrink: 0 }}>
          <input
            type="text" className="selector-input-search"
            placeholder={`Buscar ${title}... (Enter)`}
            value={inputValue} onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{ padding: "6px 10px", fontSize: "0.85rem", height: "32px" }}
          />
          <button type="button" className="selector-btn-search" onClick={triggerSearch} style={{ top: "2px" }}><FiSearch /></button>
        </div>

        {/* FIX 3: El cuerpo tiene overflow: hidden para que no se estire */}
        <div className="selector-body" style={{ flex: 1, display: "flex", minHeight: 0, gap: "10px", overflow: "hidden" }}> 
          
          {/* Columna Resultados */}
          <div className="selector-col" style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
            <h5 className="selector-col-title" style={{ padding: "5px", fontSize: "0.8rem", marginBottom: "0", flexShrink: 0 }}>Resultados</h5>
            
            {/* FIX 4: La lista tiene overflowY: auto y flex: 1. Esto activa el scroll */}
            <div className="selector-list" style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
              {isLoading ? ( <p style={{ fontSize: "0.8rem", color: "#666", padding: "10px" }}>Cargando...</p> ) 
              : isError ? ( <p style={{ fontSize: "0.8rem", color: "red", padding: "10px" }}>Error al cargar</p> ) 
              : !data || data.length === 0 ? ( <p style={{ fontSize: "0.8rem", padding: "10px" }}>No hay resultados</p> ) 
              : (
                data.map((item) => {
                  const isSelected = selectedIds.includes(item.id);
                  return (
                    <div key={item.id} onClick={() => onToggleItem(item)} className={`selector-item ${isSelected ? "selected" : ""}`} style={{ padding: "4px 8px" }}>
                      <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: "0.85rem" }} title={item.label}>
                        {item.label}
                      </span>
                      {isSelected ? <FiCheck size={14} color="green" /> : <FiPlus size={14} color="#007bff" />}
                    </div>
                  );
                })
              )}
            </div>
            
            <div className="selector-pagination" style={{ padding: "5px", flexShrink: 0 }}>
              <button type="button" className="page-btn" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: "2px 5px" }}><FiChevronLeft size={14}/></button>
              <span style={{ fontSize: "0.8rem" }}>Pág {page}</span>
              <button type="button" className="page-btn" onClick={() => setPage((p) => p + 1)} disabled={!data || data.length < pageSize} style={{ padding: "2px 5px" }}><FiChevronRight size={14}/></button>
            </div>
          </div>

          {/* Columna Seleccionados */}
          <div className="selector-col" style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
            <h5 className="selector-col-title" style={{ padding: "5px", fontSize: "0.8rem", marginBottom: "0", flexShrink: 0 }}>Seleccionados ({selectedIds.length})</h5>
            
            <div className="selector-list" style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
              {selectedIds.length === 0 && (
                <p style={{ fontSize: "0.8rem", color: "#999", fontStyle: "italic", padding: "10px" }}>Nada seleccionado</p>
              )}
              {selectedIds.map((id) => {
                const labelFromRegistry = itemsRegistry[id];
                const itemInData = data?.find((d) => d.id === id);
                const displayText = labelFromRegistry || (itemInData ? itemInData.label : `ID: ${id}`);
                
                const rawServiceText = configurations[id] || "";
                const hasText = rawServiceText.trim().length > 0;

                return (
                  <div key={id} className="selector-tag" style={{ padding: "3px 6px", paddingRight: 5 }}>
                    <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: "0.8rem" }}>
                      {displayText}
                    </span>

                    {hasConfiguration && (
                    <button
                        type="button"
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          onConfigureItem({ id, label: displayText }); 
                        }}
                        title={hasText ? `Editar servicios (${rawServiceText})` : "Agregar servicios"}
                        style={{
                          border: hasText ? "1px solid #bae6fd" : "1px dashed #cbd5e1",
                          background: hasText ? "#e0f2fe" : "transparent",
                          cursor: "pointer", color: hasText ? "#0284c7" : "#64748b",
                          padding: "2px 6px", borderRadius: "4px", display: "flex", alignItems: "center",
                          gap: "3px", marginRight: "6px", transition: "all 0.2s",
                          fontSize: "0.7rem", fontWeight: "600"
                        }}
                        onMouseEnter={(e) => { if(!hasText) e.currentTarget.style.backgroundColor = "#f1f5f9"; }}
                        onMouseLeave={(e) => { if(!hasText) e.currentTarget.style.backgroundColor = "transparent"; }}
                      >
                         {hasText ? (
                           <> <FiEdit3 size={10} /> <span>Editar</span> </>
                         ) : (
                           <> <FiPlus size={10} /> <span>Servicios</span> </>
                         )}
                      </button>
                    )}

                    <button type="button" onClick={() => onToggleItem({ id })} style={{ border: "none", background: "transparent", cursor: "pointer", color: "#ef4444", padding: 0, display: "flex", alignItems: "center" }}>
                      <FiX size={14} />
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
    register, handleSubmit, watch, setValue, reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const watchAllBranches = watch("canviewallbranches");
  const branchIdList = watch("branchidlist") || [];
  const watchAllForwarders = watch("canviewallforwarders");
  const forwarderIdList = watch("forwarderidlist") || [];

  const [forwarderServicesMap, setForwarderServicesMap] = useState({});
  const [configuringForwarder, setConfiguringForwarder] = useState(null);

  useEffect(() => {
    if (isOpen && user) {
      const safeBranchIds = user.branchidlist ? user.branchidlist.map(String) : [];
      const safeForwarderIds = user.forwarderidlist ? user.forwarderidlist.map(String) : [];

      if (user.forwarderidlist && user.forwarderservicelist) {
        const servicesMap = {};
        user.forwarderidlist.forEach((fwId, index) => {
          const servicesString = user.forwarderservicelist[index];
          servicesMap[fwId] = servicesString || "";
        });
        setForwarderServicesMap(servicesMap);
      } else {
        setForwarderServicesMap({});
      }

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
    
    if (list.includes(itemIdStr) && fieldName === "forwarderidlist") {
        const newMap = { ...forwarderServicesMap };
        delete newMap[itemIdStr];
        setForwarderServicesMap(newMap);
    }

    setValue(fieldName, newList, { shouldDirty: true });
  };

  const handleSaveServices = (textValue) => {
    if (configuringForwarder) {
      setForwarderServicesMap(prev => ({
        ...prev,
        [configuringForwarder.id]: textValue
      }));
      setConfiguringForwarder(null); 
    }
  };

  const onSubmit = async (data) => {
    try {
      const finalForwarderIds = data.canviewallforwarders ? [] : data.forwarderidlist;
      const finalServiceList = finalForwarderIds.map(fwId => {
        return forwarderServicesMap[fwId] || ""; 
      });

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
        forwarderidlist: finalForwarderIds,
        forwarderservicelist: data.canviewallforwarders ? [] : finalServiceList, 
        forwardernamelist: [],
      };

      await api.put("/users", payload);

      toast.success("Usuario actualizado correctamente");
      onUserUpdated && onUserUpdated();
      onClose();
    } catch (error) {
      console.error(error);
      const errorMsg = error.response?.data?.message || error.message || "Error desconocido";
      toast.error(`Error al actualizar: ${errorMsg}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="edit-modal-overlay">
      <div className="modal-overlay">
        <div className="modal-container" style={{ position: "relative" }}>
          
          <div className="modal-header">
            <h2 className="modal-title">
              <FiEdit /> Editar Usuario:{" "}
              <span style={{ color: "#334155", fontWeight: 400 }}>{user?.username}</span>
            </h2>
            <button type="button" className="modal-close-btn" onClick={onClose}><FiX /></button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="modal-form">
            <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              
              {/* --- DATOS DE CUENTA (COMPACTADO - GRILLA 2x2) --- */}
              <div>
                <h4 className="section-title" style={{ marginBottom: "5px" }}>Datos de Cuenta</h4>
                
                <div style={{ 
                  display: "grid", 
                  gridTemplateColumns: "1fr 1fr", 
                  gap: "10px", 
                  marginBottom: "0px" 
                }}>
                  
                  {/* Usuario */}
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: "0.85rem", marginBottom: "2px" }}>Usuario</label>
                    <input type="text" className={`form-input ${errors.username ? "error" : ""}`} {...register("username")} 
                           style={{ padding: "4px 8px", height: "30px", fontSize: "0.9rem" }} />
                    {errors.username && <span className="error-msg">{errors.username.message}</span>}
                  </div>

                  {/* Nombre Completo */}
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: "0.85rem", marginBottom: "2px" }}>Nombre Completo</label>
                    <input type="text" className={`form-input ${errors.fullname ? "error" : ""}`} {...register("fullname")} 
                           style={{ padding: "4px 8px", height: "30px", fontSize: "0.9rem" }} />
                    {errors.fullname && <span className="error-msg">{errors.fullname.message}</span>}
                  </div>

                  {/* Email */}
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: "0.85rem", marginBottom: "2px" }}>Email</label>
                    <input type="email" className={`form-input ${errors.email ? "error" : ""}`} {...register("email")} 
                           style={{ padding: "4px 8px", height: "30px", fontSize: "0.9rem" }} />
                    {errors.email && <span className="error-msg">{errors.email.message}</span>}
                  </div>

                  {/* CHECKBOXES */}
                  <div style={{ 
                    display: "flex", 
                    flexDirection: "column", 
                    justifyContent: "flex-end", 
                    gap: "6px", 
                    paddingBottom: "2px"
                  }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                      <input 
                        type="checkbox" {...register("isadministrator")} 
                        style={{ width: "14px", height: "14px", margin: 0, cursor: "pointer" }} 
                      />
                      <div style={{ display: "flex", flexDirection: "column", lineHeight: "1" }}>
                         <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "#334155" }}>Es Administrador</span>
                         <span style={{ fontSize: "0.7rem", color: "#94a3b8" }}>(Acceso total)</span>
                      </div>
                    </label>

                    <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                      <input 
                        type="checkbox" {...register("canviewreserved")} 
                        style={{ width: "14px", height: "14px", margin: 0, cursor: "pointer" }} 
                      />
                      <div style={{ display: "flex", flexDirection: "column", lineHeight: "1" }}>
                         <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "#334155" }}>Ver Reservados</span>
                         <span style={{ fontSize: "0.7rem", color: "#94a3b8" }}>(Confidenciales)</span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* --- ACCESOS Y RESTRICCIONES (CON EL SCROLL FIX) --- */}
              <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
                <h4 className="section-title" style={{ marginBottom: "5px", marginTop: "5px" }}>
                  Accesos y Restricciones
                </h4>
                
                <div className="selectors-row" style={{ flex: 1, height: "auto", display: "flex", gap: "15px", minHeight: 0 }}>
                  
                  {/* Sedes */}
                  <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2px", alignItems: "center" }}>
                      <label className="form-label" style={{ margin: 0 }}>Sedes</label>
                      <label style={{ fontSize: "0.8rem", cursor: "pointer", color: "#64748b", display: "flex", alignItems: "center", gap: "4px" }}>
                        <input type="checkbox" {...register("canviewallbranches")} style={{ margin: 0, width: "13px", height: "13px", cursor: "pointer" }} /> 
                        <span style={{ position: "relative", bottom: "1px" }}>Ver Todas</span>
                      </label>
                    </div>
                    <AsyncSelector
                      title="Sedes" queryKey="branches" fetchUrl="/branches" searchParamName="branch_name"
                      isDisabled={watchAllBranches} selectedIds={branchIdList}
                      onToggleItem={(item) => handleToggle(item, "branchidlist", branchIdList)}
                    />
                  </div>

                  {/* Clientes */}
                  <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2px", alignItems: "center", marginTop: "10px" }}> {/* El marginTop: 10px solo si hay colision, sino 0 */}
                       <label className="form-label" style={{ margin: 0 }}>Clientes</label>
                       <label style={{ fontSize: "0.8rem", cursor: "pointer", color: "#64748b", display: "flex", alignItems: "center", gap: "4px" }}>
                         <input type="checkbox" {...register("canviewallforwarders")} style={{ margin: 0, width: "13px", height: "13px", cursor: "pointer" }} /> 
                         <span style={{ position: "relative", bottom: "1px" }}>Ver Todos</span>
                       </label>
                    </div>
                    
                    <AsyncSelector
                      title="Clientes" queryKey="forwarders" fetchUrl="/forwarders" searchParamName="forwarder_name"
                      isDisabled={watchAllForwarders} selectedIds={forwarderIdList}
                      onToggleItem={(item) => handleToggle(item, "forwarderidlist", forwarderIdList)}
                      hasConfiguration={true} configurations={forwarderServicesMap} 
                      onConfigureItem={(item) => setConfiguringForwarder(item)} 
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
               <button type="button" onClick={onClose} className="btn-cancel">Cancelar</button>
               <button type="submit" disabled={isSubmitting} className="btn-save"><FiSave /> Actualizar Usuario</button>
            </div>
          </form>

          {configuringForwarder && (
            <ServiceConfigModal 
              forwarderName={configuringForwarder.label}
              initialValue={forwarderServicesMap[configuringForwarder.id] || ""}
              onSave={handleSaveServices} onClose={() => setConfiguringForwarder(null)}
            />
          )}

        </div>
      </div>
    </div>
  );
};

export default ModalEditarUsuario;