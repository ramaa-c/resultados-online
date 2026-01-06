import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import api from "../api/axios";
import { FiSearch, FiChevronLeft, FiChevronRight, FiX, FiPlus, FiCheck, FiSave } from "react-icons/fi";
import "../styles/modalUsuario.css";

// --- ESQUEMA DE VALIDACIÓN ---
const schema = z.object({
  username: z.string().min(3, "Usuario debe tener al menos 3 caracteres"),
  fullname: z.string().min(1, "El nombre completo es obligatorio"),
  email: z.string().email("Formato de email inválido"),
  isadministrator: z.boolean(),
  mustchangepassword: z.boolean(),
  
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
  isDisabled 
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
        [searchParamName]: searchQuery 
      };
      
      const res = await api.get(fetchUrl, { params });
      
      // --- LÓGICA PARA MOSTRAR NOMBRES ---
      const rawData = res.data.items || res.data; 

      if (Array.isArray(rawData)) {
        return rawData.map((item) => ({
          id: item.id.toString(),
          label: item.name || item.fullname || item.description || item.business_name || item.label || item.value || item.id
        }));
      } else {
        return Object.entries(rawData).map(([id, label]) => ({ 
          id, label: label || id 
        }));
      }
    },
    keepPreviousData: true,
    enabled: !isDisabled
  });

  const triggerSearch = () => {
    setSearchQuery(inputValue);
    setPage(1);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
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
      {/* BARRA DE BÚSQUEDA */}
      <div className="selector-search-bar">
        <input 
          type="text" 
          className="selector-input-search"
          placeholder={`Buscar ${title}... (Enter)`} 
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
    <button type="button" class="selector-btn-search">
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="20" 
      height="20" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      stroke-width="2" 
      stroke-linecap="round" 
      stroke-linejoin="round">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
</button>
      </div>

      <div className="selector-body">
        {/* LISTA DE RESULTADOS (IZQUIERDA) */}
        <div className="selector-col">
          <h5 className="selector-col-title">Resultados</h5>
          <div className="selector-list">
            {isLoading ? (
              <p style={{fontSize: '0.8rem', color: '#666', padding: '10px'}}>Cargando...</p>
            ) : isError ? (
              <p style={{fontSize: '0.8rem', color: 'red', padding: '10px'}}>Error al cargar</p>
            ) : (!data || data.length === 0) ? (
              <p style={{fontSize: '0.8rem', padding: '10px'}}>No hay resultados</p>
            ) : (
              data.map((item) => {
                const isSelected = selectedIds.includes(item.id);
                return (
                  <div 
                    key={item.id} 
                    onClick={() => onToggleItem(item)}
                    className={`selector-item ${isSelected ? 'selected' : ''}`}
                  >
                    <span style={{flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}} title={item.label}>
                      {item.label}
                    </span>
                    {isSelected ? <FiCheck color="green"/> : <FiPlus color="#007bff"/>}
                  </div>
                );
              })
            )}
          </div>
          
          {/* Paginación */}
          <div className="selector-pagination">
            <button type="button" className="page-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
              <FiChevronLeft/>
            </button>
            <span>Pág {page}</span>
            <button type="button" className="page-btn" onClick={() => setPage(p => p + 1)} disabled={!data || data.length < pageSize}>
              <FiChevronRight/>
            </button>
          </div>
        </div>

        {/* LISTA DE SELECCIONADOS (DERECHA) */}
        <div className="selector-col">
          <h5 className="selector-col-title">Seleccionados ({selectedIds.length})</h5>
          <div className="selector-list">
            {selectedIds.length === 0 && (
              <p style={{fontSize: '0.8rem', color: '#999', fontStyle: 'italic', padding: '10px'}}>
                Nada seleccionado
              </p>
            )}
            {selectedIds.map(id => {
               const itemInData = data?.find(d => d.id === id);
               const displayText = itemInData ? itemInData.label : id; // Si no está en la página actual, muestra ID (idealmente buscar nombre)

               return (
                  <div key={id} className="selector-tag">
                    <span style={{flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{displayText}</span> 
                    <button type="button" onClick={() => onToggleItem({id})} style={{border:'none', background:'transparent', cursor:'pointer', color:'#0284c7', padding:0, marginLeft:5}}>
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
        username: "", fullname: "", email: "", status: "Active", 
        isadministrator: false, mustchangepassword: true,
        canviewallbranches: false, branchidlist: [],
        canviewallforwarders: false, forwarderidlist: []
      }); 
    }
  }, [userToEdit, reset, isOpen]);

  const handleToggle = (item, fieldName, list) => {
    const newList = list.includes(item.id)
      ? list.filter(id => id !== item.id)
      : [...list, item.id];
    setValue(fieldName, newList, { shouldDirty: true });
  };

  const onSubmit = async (data) => {
    try {
      const today = new Date();
      // Si estamos editando, mantenemos la fecha original, si no, fecha de hoy
      const createdStr = userToEdit ? userToEdit.createdate : today.toISOString().split('T')[0];
      
      const expDate = new Date(today);
      expDate.setFullYear(expDate.getFullYear() + 1);
      const expirationStr = expDate.toISOString().split('T')[0];

      // OPTIMIZACIÓN: No hace falta enviar arrays de strings vacíos si el backend no los valida.
      // Pero si tu backend requiere que tengan la misma longitud que los IDs, tu lógica anterior estaba bien.
      // Asumiremos que el backend es inteligente y puede recibir arrays vacíos.
      
      const payload = {
        ...data,
        userid: userToEdit ? userToEdit.userid : 0,
        status: userToEdit ? userToEdit.status : "Active",
        
        createdate: createdStr, 
        expirationdate: expirationStr,

        // Lógica de listas: Si ve todas, enviamos array vacío. Si no, la lista de IDs.
        branchidlist: data.canviewallbranches ? [] : data.branchidlist,
        // Enviamos arrays vacíos solo si es necesario, o null si la API lo permite
        branchnamelist: [], 

        forwarderidlist: data.canviewallforwarders ? [] : data.forwarderidlist,
        forwardernamelist: [],
      };

      if (userToEdit) {
         // await api.put...
         console.log("Editando usuario...", payload);
      } else {
         await api.post('/users', payload);
      }
      
      onUserSaved && onUserSaved();
      onClose();
    } catch (error) {
      console.error(error);
      alert("Error: " + (error.response?.data?.message || error.message));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        
        {/* HEADER */}
        <div className="modal-header">
          <h2 className="modal-title">
            {userToEdit ? <FiCheck /> : <FiPlus />}
            {userToEdit ? "Editar Usuario" : "Nuevo Usuario"}
          </h2>
          <button type="button" className="modal-close-btn" onClick={onClose}><FiX /></button>
        </div>
        
        {/* FORMULARIO */}
        <form onSubmit={handleSubmit(onSubmit)} className="modal-form">
          <div className="modal-body">
            
            {/* --- SECCIÓN 1: DATOS (GRILLA 2x2) --- */}
            <div>
               <h4 className="section-title">Datos de Cuenta</h4>
               
               <div className="form-grid-top">
                  {/* Fila 1, Col 1 */}
                  <div className="form-group">
                    <label className="form-label">Usuario</label>
                    <input 
                      type="text" 
                      className={`form-input ${errors.username ? 'error' : ''}`}
                       
                      {...register("username")} 
                    />
                    {errors.username && <span className="error-msg">{errors.username.message}</span>}
                  </div>
                  
                  {/* Fila 1, Col 2 */}
                  <div className="form-group">
                    <label className="form-label">Nombre Completo</label>
                    <input 
                      type="text" 
                      className={`form-input ${errors.fullname ? 'error' : ''}`}
                       
                      {...register("fullname")} 
                    />
                    {errors.fullname && <span className="error-msg">{errors.fullname.message}</span>}
                  </div>

                  {/* Fila 2, Col 1 */}
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input 
                      type="email" 
                      className={`form-input ${errors.email ? 'error' : ''}`}
                      
                      {...register("email")} 
                    />
                    {errors.email && <span className="error-msg">{errors.email.message}</span>}
                  </div>

                  {/* Fila 2, Col 2 - Checkbox Admin */}
                  <div className="admin-box">
                      <label className="checkbox-label">
                          <input type="checkbox" {...register("isadministrator")} /> 
                          Es Administrador
                      </label>
                      <span style={{ fontSize: '0.8rem', color: '#64748b', borderLeft: '1px solid #cbd5e1', paddingLeft: '15px' }}>
                        Acceso total al sistema.
                      </span>
                  </div>
               </div>
            </div>

            {/* --- SECCIÓN 2: SELECTORES (GRILLA 1x2) --- */}
            <div>
               <h4 className="section-title">Accesos y Restricciones</h4>
               
               <div className="selectors-row">
                  {/* Caja 1: Branches */}
                  <div>
                    <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '5px', alignItems: 'center'}}>
                        <label className="form-label" style={{margin:0}}>Sedes (Branches)</label>
                        <label style={{fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, color: '#64748b'}}>
                            <input type="checkbox" {...register("canviewallbranches")} /> Ver Todas
                        </label>
                    </div>
                    <AsyncSelector 
                        title="Sedes"
                        queryKey="branches"
                        fetchUrl="/branches"
                        searchParamName="branch_name"
                        isDisabled={watchAllBranches}
                        selectedIds={branchIdList}
                        onToggleItem={(item) => handleToggle(item, "branchidlist", branchIdList)}
                    />
                  </div>

                  {/* Caja 2: Forwarders */}
                  <div>
                    <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '5px', alignItems: 'center'}}>
                        <label className="form-label" style={{margin:0}}>Obras Sociales</label>
                        <label style={{fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, color: '#64748b'}}>
                            <input type="checkbox" {...register("canviewallforwarders")} /> Ver Todas
                        </label>
                    </div>
                    <AsyncSelector 
                        title="Forwarders"
                        queryKey="forwarders"
                        fetchUrl="/forwarders"
                        searchParamName="forwarder_name"
                        isDisabled={watchAllForwarders}
                        selectedIds={forwarderIdList}
                        onToggleItem={(item) => handleToggle(item, "forwarderidlist", forwarderIdList)}
                    />
                  </div>
               </div>
            </div>

          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-cancel">Cancelar</button>
            <button type="submit" disabled={isSubmitting} className="btn-save">
              <FiSave /> {isSubmitting ? "Guardando..." : "Guardar Usuario"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalUsuario;