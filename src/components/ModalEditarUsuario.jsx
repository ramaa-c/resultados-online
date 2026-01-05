import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import api from "../api/axios"; 
import { FiChevronLeft, FiChevronRight, FiX, FiCheck, FiSave, FiEdit } from "react-icons/fi";
import "../styles/modalUsuario.css"; // Usa los mismos estilos que ya arreglamos

// --- ESQUEMA DE VALIDACIÓN (Mismo que en crear) ---
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

// --- REUTILIZAMOS EL ASYNC SELECTOR ---
// (Idealmente deberías mover este componente a un archivo 'components/AsyncSelector.jsx' e importarlo en ambos modales)
const AsyncSelector = ({ title, queryKey, fetchUrl, searchParamName, selectedIds, onToggleItem, isDisabled }) => {
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [inputValue, setInputValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: [queryKey, page, searchQuery],
    queryFn: async () => {
      const params = { page, page_size: pageSize, [searchParamName]: searchQuery };
      const res = await api.get(fetchUrl, { params });
      const rawData = res.data.items || res.data; 
      if (Array.isArray(rawData)) {
        return rawData.map((item) => ({
          id: item.id.toString(),
          label: item.name || item.fullname || item.description || item.business_name || item.label || item.value || item.id
        }));
      }
      return [];
    },
    keepPreviousData: true,
    enabled: !isDisabled
  });

  const triggerSearch = () => { setSearchQuery(inputValue); setPage(1); };

  if (isDisabled) return <div className="selector-disabled">Opción "Ver Todos" habilitada.</div>;

  return (
    <div className="selector-wrapper">
      <div className="selector-search-bar">
        <input 
          type="text" className="selector-input-search"
          placeholder={`Buscar ${title}...`} value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && triggerSearch()}
        />
        <button type="button" className="selector-btn-search" onClick={triggerSearch}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        </button>
      </div>
      <div className="selector-body">
        <div className="selector-col">
          <div className="selector-list">
             {isLoading ? <p style={{padding:10, fontSize:'0.8rem'}}>Cargando...</p> : data?.map(item => (
                 <div key={item.id} onClick={() => onToggleItem(item)} className={`selector-item ${selectedIds.includes(item.id) ? 'selected' : ''}`}>
                   <span>{item.label}</span>
                   {selectedIds.includes(item.id) ? <FiCheck color="green"/> : <FiCheck color="#e2e8f0"/>}
                 </div>
             ))}
          </div>
          <div className="selector-pagination">
             <button type="button" className="page-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}><FiChevronLeft/></button>
             <button type="button" className="page-btn" onClick={() => setPage(p => p + 1)} disabled={!data || data.length < pageSize}><FiChevronRight/></button>
          </div>
        </div>
        <div className="selector-col">
          <h5 className="selector-col-title">Seleccionados ({selectedIds.length})</h5>
          <div className="selector-list">
             {selectedIds.map(id => (
                <div key={id} className="selector-tag">
                   <span>{data?.find(d => d.id === id)?.label || id}</span> 
                   <button type="button" onClick={() => onToggleItem({id})} style={{border:'none', background:'transparent', color:'#dc2626', cursor:'pointer'}}><FiX/></button>
                </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- COMPONENTE PRINCIPAL PARA EDITAR ---
const ModalEditarUsuario = ({ isOpen, onClose, user, onUserUpdated }) => {
  const { register, handleSubmit, watch, setValue, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema)
  });

  const watchAllBranches = watch("canviewallbranches");
  const branchIdList = watch("branchidlist") || [];
  const watchAllForwarders = watch("canviewallforwarders");
  const forwarderIdList = watch("forwarderidlist") || [];

  // --- EFECTO: CARGAR DATOS DEL USUARIO ---
  useEffect(() => {
    // Solo reseteamos si hay usuario y está abierto
    if (isOpen && user) {
      console.log("Cargando usuario para editar (ID):", user.userid);
      
      const safeBranchIds = user.branchidlist ? user.branchidlist.map(String) : [];
      const safeForwarderIds = user.forwarderidlist ? user.forwarderidlist.map(String) : [];

      reset({
        username: user.username,
        fullname: user.fullname,
        email: user.email,
        isadministrator: user.isadministrator,
        mustchangepassword: user.mustchangepassword,
        canviewallbranches: user.canviewallbranches,
        branchidlist: safeBranchIds,
        canviewallforwarders: user.canviewallforwarders,
        forwarderidlist: safeForwarderIds,
      });
    }
    // CAMBIO CLAVE AQUÍ ABAJO:
    // En vez de depender de [user], dependemos de [user?.userid].
    // Así evitamos que un re-render del padre reinicie tu formulario mientras escribes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.userid, isOpen, reset]);

  const handleToggle = (item, fieldName, list) => {
    const itemIdStr = item.id.toString();
    const newList = list.includes(itemIdStr) ? list.filter(id => id !== itemIdStr) : [...list, itemIdStr];
    setValue(fieldName, newList, { shouldDirty: true });
  };

  const onSubmit = async (data) => {
    try {
      // Arrays vacíos para nombres (el backend los pide para mantener simetría)
      const branchNameList = data.branchidlist.map(() => ""); 
      const forwarderNameList = data.forwarderidlist.map(() => "");

      const payload = {
        // Datos fijos del usuario original
        userid: user.userid,
        status: user.status,
        createdate: user.createdate,
        expirationdate: user.expirationdate,
        canviewreserved: user.canviewreserved, // Mantener valor original
        
        // Datos editables del formulario
        username: data.username,
        fullname: data.fullname,
        email: data.email,
        isadministrator: data.isadministrator,
        mustchangepassword: data.mustchangepassword,
        
        // Lógica de listas
        canviewallbranches: data.canviewallbranches,
        branchidlist: data.canviewallbranches ? [] : data.branchidlist,
        branchnamelist: data.canviewallbranches ? [] : branchNameList,
        
        canviewallforwarders: data.canviewallforwarders,
        forwarderidlist: data.canviewallforwarders ? [] : data.forwarderidlist,
        forwardernamelist: data.canviewallforwarders ? [] : forwarderNameList,
      };

      console.log("Enviando PUT:", payload);
      await api.put('/users', payload);
      
      onUserUpdated && onUserUpdated(); // Refrescar tabla
      onClose(); // Cerrar modal
    } catch (error) {
      console.error(error);
      alert("Error al actualizar: " + (error.response?.data?.message || error.message));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        
        {/* HEADER: Título específico de Edición */}
        <div className="modal-header">
          <h2 className="modal-title">
            <FiEdit /> Editar Usuario: <span style={{color: '#334155', fontWeight: 400}}>{user?.username}</span>
          </h2>
          <button type="button" className="modal-close-btn" onClick={onClose}><FiX /></button>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="modal-form">
          <div className="modal-body">
            
            {/* SECCIÓN 1: DATOS */}
            <div>
               <h4 className="section-title">Datos de Cuenta</h4>
               <div className="form-grid-top">
                  <div className="form-group">
                    <label className="form-label">Usuario</label>
                    <input type="text" className={`form-input ${errors.username ? 'error' : ''}`} {...register("username")} />
                    {errors.username && <span className="error-msg">{errors.username.message}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Nombre Completo</label>
                    <input type="text" className={`form-input ${errors.fullname ? 'error' : ''}`} {...register("fullname")} />
                    {errors.fullname && <span className="error-msg">{errors.fullname.message}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input type="email" className={`form-input ${errors.email ? 'error' : ''}`} {...register("email")} />
                    {errors.email && <span className="error-msg">{errors.email.message}</span>}
                  </div>
                  <div className="admin-box">
                      <label className="checkbox-label">
                          <input type="checkbox" {...register("isadministrator")} /> 
                          Es Administrador
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

                 {/* Obras Sociales */}
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
              <FiSave /> {isSubmitting ? "Guardando..." : "Actualizar Usuario"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalEditarUsuario;