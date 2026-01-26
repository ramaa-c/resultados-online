import React, { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import api from "../api/axios";
import {
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
  FiX,
  FiPlus,
  FiCheck,
  FiSave,
  FiEdit3,
  FiLoader // <--- 1. Importamos el icono de carga
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
            placeholder="Escriba los servicios aquí..."
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

// --- SELECTOR ASÍNCRONO ---
const AsyncSelector = ({
  title, queryKey, fetchUrl, searchParamName,
  selectedIds, onToggleItem, isDisabled,
  hasConfiguration = false, configurations = {}, onConfigureItem = () => {},
  initialLabels = {}
}) => {
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [inputValue, setInputValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [itemsRegistry, setItemsRegistry] = useState({});

  useEffect(() => {
    if (initialLabels && Object.keys(initialLabels).length > 0) {
      setItemsRegistry(prev => ({ ...prev, ...initialLabels }));
    }
  }, [initialLabels]);

  const { data, isLoading, isError } = useQuery({
    queryKey: [queryKey, page, searchQuery],
    queryFn: async () => {
      const params = { page, page_size: pageSize, [searchParamName]: searchQuery };
      const res = await api.get(fetchUrl, { params });
      const rawData = res.data.items || res.data;

      if (Array.isArray(rawData)) {
        return rawData.map((item) => ({
          id: item.id.toString(),
          label: item.name || item.fullname || item.business_name || item.label || item.value || item.id,
        }));
      } else {
        return Object.entries(rawData).map(([id, label]) => ({
          id: id.toString(), label: label || id,
        }));
      }
    },
    keepPreviousData: true,
  });

  useEffect(() => {
    if (data && Array.isArray(data)) {
      setItemsRegistry((prevRegistry) => {
        const newEntries = {};
        data.forEach((item) => { newEntries[item.id] = item.label; });
        return { ...prevRegistry, ...newEntries };
      });
    }
  }, [data]);

  const triggerSearch = () => { setSearchQuery(inputValue); setPage(1); };
  const handleKeyDown = (e) => {
    if (e.key === "Enter") { e.preventDefault(); e.stopPropagation(); triggerSearch(); }
  };

  return (
    <div className="selector-wrapper" style={{ position: "relative" }}>
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

      <div style={{ opacity: isDisabled ? 0.3 : 1, pointerEvents: isDisabled ? "none" : "auto", filter: isDisabled ? "grayscale(100%)" : "none" }}>
        <div className="selector-search-bar">
          <input
            type="text" className="selector-input-search"
            placeholder={`Buscar ${title}... (Enter)`}
            value={inputValue} onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button type="button" className="selector-btn-search" onClick={triggerSearch}><FiSearch /></button>
        </div>

        <div className="selector-body">
          <div className="selector-col">
            <h5 className="selector-col-title">Resultados</h5>
            <div className="selector-list">
              {isLoading ? ( <p style={{ fontSize: "0.8rem", color: "#666", padding: "10px" }}>Cargando...</p> ) 
              : isError ? ( <p style={{ fontSize: "0.8rem", color: "red", padding: "10px" }}>Error al cargar</p> ) 
              : !data || data.length === 0 ? ( <p style={{ fontSize: "0.8rem", padding: "10px" }}>No hay resultados</p> ) 
              : (
                data.map((item) => {
                  const isSelected = selectedIds.includes(item.id);
                  return (
                    <div key={item.id} onClick={() => onToggleItem(item)} className={`selector-item ${isSelected ? "selected" : ""}`}>
                      <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={item.label}>
                        {item.label}
                      </span>
                      {isSelected ? <FiCheck color="green" /> : <FiPlus color="#007bff" />}
                    </div>
                  );
                })
              )}
            </div>
            <div className="selector-pagination">
              <button type="button" className="page-btn" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}><FiChevronLeft /></button>
              <span>Pág {page}</span>
              <button type="button" className="page-btn" onClick={() => setPage((p) => p + 1)} disabled={!data || data.length < pageSize}><FiChevronRight /></button>
            </div>
          </div>

          <div className="selector-col">
            <h5 className="selector-col-title">Seleccionados ({selectedIds.length})</h5>
            <div className="selector-list">
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
                  <div key={id} className="selector-tag" style={{ paddingRight: 5 }}>
                    <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: "0.85rem" }}>
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
                          padding: "4px 8px", borderRadius: "4px", 
                          display: "flex", alignItems: "center", gap: "4px",
                          marginRight: "8px", transition: "all 0.2s",
                          fontSize: "0.75rem", fontWeight: "600"
                        }}
                        onMouseEnter={(e) => { if(!hasText) e.currentTarget.style.backgroundColor = "#f1f5f9"; }}
                        onMouseLeave={(e) => { if(!hasText) e.currentTarget.style.backgroundColor = "transparent"; }}
                      >
                          {hasText ? (
                            <> <FiEdit3 size={12} /> <span>Editar</span> </>
                          ) : (
                            <> <FiPlus size={12} /> <span>Servicios</span> </>
                          )}
                      </button>
                    )}

                    <button type="button" onClick={() => onToggleItem({ id })} style={{ border: "none", background: "transparent", cursor: "pointer", color: "#ef4444", padding: 0, display: "flex", alignItems: "center" }}>
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

// --- COMPONENTE PRINCIPAL UNIFICADO ---
const ModalUsuario = ({ isOpen, onClose, userToEdit = null, onUserSaved }) => {
  const {
    register, handleSubmit, watch, setValue, reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      username: "", fullname: "", email: "",
      isadministrator: false, canviewreserved: false, mustchangepassword: true,
      canviewallbranches: false, branchidlist: [],
      canviewallforwarders: false, forwarderidlist: [],
    },
  });

  const watchAllBranches = watch("canviewallbranches");
  const branchIdList = watch("branchidlist");
  
  const watchAllForwarders = watch("canviewallforwarders");
  const forwarderIdList = watch("forwarderidlist"); 

  const [forwarderServicesMap, setForwarderServicesMap] = useState({});
  const [configuringForwarder, setConfiguringForwarder] = useState(null);

  const getInitialLabels = (ids, names) => {
    const map = {};
    if (ids && names && Array.isArray(ids) && Array.isArray(names)) {
      const limit = Math.min(ids.length, names.length);
      for (let i = 0; i < limit; i++) {
        map[String(ids[i])] = names[i];
      }
    }
    return map;
  };

  const initialBranchLabels = useMemo(() => {
    if (!userToEdit) return {};
    return getInitialLabels(userToEdit.branchidlist, userToEdit.branchnamelist);
  }, [userToEdit]);

  const initialForwarderLabels = useMemo(() => {
    if (!userToEdit) return {};
    return getInitialLabels(userToEdit.forwarderidlist, userToEdit.forwardernamelist);
  }, [userToEdit]);

  useEffect(() => {
    if (userToEdit) {
      const safeBranchIds = userToEdit.branchidlist ? userToEdit.branchidlist.map(String) : [];
      const safeForwarderIds = userToEdit.forwarderidlist ? userToEdit.forwarderidlist.map(String) : [];
      
      const formData = {
         ...userToEdit,
         branchidlist: safeBranchIds,
         forwarderidlist: safeForwarderIds
      };
      
      reset(formData);

      if (userToEdit.forwarderidlist && userToEdit.forwarderservicelist) {
        const servicesMap = {};
        userToEdit.forwarderidlist.forEach((fwId, index) => {
          const servicesString = userToEdit.forwarderservicelist[index];
          servicesMap[fwId] = servicesString || "";
        });
        setForwarderServicesMap(servicesMap);
      }
    } else {
      reset({ 
        username: "", fullname: "", email: "", 
        isadministrator: false, canviewreserved: false, mustchangepassword: true,
        canviewallbranches: false, branchidlist: [], 
        canviewallforwarders: false, forwarderidlist: [] 
      });
      setForwarderServicesMap({});
    }
  }, [userToEdit, reset, isOpen]);

  const handleToggle = (item, fieldName, list) => {
    const itemId = String(item.id);
    const isSelected = list.includes(itemId);
    const newList = isSelected ? list.filter((id) => id !== itemId) : [...list, itemId];
    
    if (isSelected && fieldName === "forwarderidlist") {
        const newMap = { ...forwarderServicesMap };
        delete newMap[itemId];
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
      const today = new Date();
      const createdStr = userToEdit ? userToEdit.createdate : today.toISOString().split("T")[0];
      const expDate = new Date(today); expDate.setFullYear(expDate.getFullYear() + 1);
      const expirationStr = expDate.toISOString().split("T")[0];

      const finalForwarderIds = data.canviewallforwarders ? [] : data.forwarderidlist;
      const finalServiceList = finalForwarderIds.map(fwId => {
        return forwarderServicesMap[fwId] || ""; 
      });

      const payload = {
        ...data,
        userid: userToEdit ? userToEdit.userid : 0,
        status: userToEdit ? userToEdit.status : "activo",
        mustchangepassword: data.mustchangepassword,
        createdate: createdStr,
        expirationdate: expirationStr,
        branchidlist: data.canviewallbranches ? [] : data.branchidlist,
        branchnamelist: [],
        forwarderidlist: finalForwarderIds,
        forwarderservicelist: data.canviewallforwarders ? [] : finalServiceList, 
        forwardernamelist: [],
      };

      if (userToEdit) {
        await api.put("/users", payload);
        toast.success("Usuario actualizado correctamente");
      } else {
        await api.post("/users", payload);
        toast.success("Usuario creado correctamente");
      }

      onUserSaved && onUserSaved();
      onClose();
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || error.message;
      toast.error(`Error: ${msg}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-usuario-overlay">
      
      {/* 2. AGREGAMOS EL CSS KEYFRAME AQUÍ MISMO PARA QUE FUNCIONE DIRECTO */}
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>

      <div className="modal-overlay">
        <div className="modal-container" style={{ position: "relative" }}> 
          
          <div className="modal-header">
             <h2 className="modal-title">
                {userToEdit ? <FiEdit3 /> : <FiPlus />} {userToEdit ? "Editar Usuario" : "Nuevo Usuario"}
             </h2>
             <button type="button" className="modal-close-btn" onClick={onClose}><FiX /></button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="modal-form">
            <div className="modal-body">
              
              {/* --- DATOS DE CUENTA COMPACTADOS --- */}
              <div>
                <h4 className="section-title">Datos de Cuenta</h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: "15px", rowGap: "5px", marginBottom: "-15px" }}>
                  <div className="form-group">
                    <label className="form-label" style={{ marginBottom: "2px" }}>Usuario</label>
                    <input type="text" className={`form-input ${errors.username ? "error" : ""}`} {...register("username")} style={{ height: "32px", padding: "0 8px" }} />
                    {errors.username && <span className="error-msg">{errors.username.message}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ marginBottom: "2px" }}>Nombre Completo</label>
                    <input type="text" className={`form-input ${errors.fullname ? "error" : ""}`} {...register("fullname")} style={{ height: "32px", padding: "0 8px" }} />
                    {errors.fullname && <span className="error-msg">{errors.fullname.message}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ marginBottom: "2px" }}>Email</label>
                    <input type="email" className={`form-input ${errors.email ? "error" : ""}`} {...register("email")} style={{ height: "32px", padding: "0 8px" }} />
                    {errors.email && <span className="error-msg">{errors.email.message}</span>}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: "5px", paddingBottom: "2px" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                      <input type="checkbox" {...register("isadministrator")} style={{ width: "14px", height: "14px", margin: 0, cursor: "pointer" }} />
                      <div style={{ display: "flex", flexDirection: "column", lineHeight: "1" }}>
                          <span style={{ fontSize: "0.8rem", fontWeight: "600", color: "#334155" }}>Es Administrador</span>
                          <span style={{ fontSize: "0.65rem", color: "#94a3b8" }}>(Acceso total)</span>
                      </div>
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                      <input type="checkbox" {...register("canviewreserved")} style={{ width: "14px", height: "14px", margin: 0, cursor: "pointer" }} />
                      <div style={{ display: "flex", flexDirection: "column", lineHeight: "1" }}>
                          <span style={{ fontSize: "0.8rem", fontWeight: "600", color: "#334155" }}>Ver Reservados</span>
                          <span style={{ fontSize: "0.65rem", color: "#94a3b8" }}>(Confidenciales)</span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* --- ACCESOS Y RESTRICCIONES --- */}
              <div>
                <h4 className="section-title" style={{ marginBottom: "5px", marginTop: "10px" }}>Accesos y Restricciones</h4>
                <div className="selectors-row">
                  <div>
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
                      initialLabels={initialBranchLabels}
                    />
                  </div>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2px", alignItems: "center", marginTop: "10px" }}>
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
                      initialLabels={initialForwarderLabels}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
               <button type="button" onClick={onClose} className="btn-cancel">Cancelar</button>
               
               {/* 3. BOTÓN CON ANIMACIÓN DE CARGA */}
               <button 
                type="submit" 
                disabled={isSubmitting} 
                className="btn-save"
                style={{ 
                  display: "flex", alignItems: "center", gap: "8px", 
                  opacity: isSubmitting ? 0.7 : 1, 
                  cursor: isSubmitting ? "not-allowed" : "pointer" 
                }}
               >
                 {isSubmitting ? (
                   <>
                     <FiLoader style={{ animation: "spin 1s linear infinite" }} />
                     {userToEdit ? "Actualizando..." : "Guardando..."}
                   </>
                 ) : (
                   <>
                     <FiSave /> {userToEdit ? "Actualizar" : "Guardar"}
                   </>
                 )}
               </button>

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

export default ModalUsuario;