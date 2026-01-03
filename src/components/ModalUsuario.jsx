import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import api from "../api/axios";
import { FiSearch, FiChevronLeft, FiChevronRight, FiX, FiPlus, FiCheck } from "react-icons/fi";

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
          id, 
          label: label || id 
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

  if (isDisabled) return <div style={styles.disabledBox}>Opción "Ver Todos" habilitada. Se ignorará la selección manual.</div>;

  return (
    <div style={styles.selectorContainer}>
      {/* BARRA DE BÚSQUEDA */}
      <div style={styles.searchBar}>
        <input 
          type="text" 
          placeholder={`Buscar ${title}... (Enter)`} 
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          style={styles.searchInput}
        />
        <button 
          type="button" 
          onClick={triggerSearch} 
          style={styles.searchButton}
          title="Buscar"
        >
          <FiSearch color="white" />
        </button>
      </div>

      <div style={styles.selectorBody}>
        {/* LISTA DE RESULTADOS (IZQUIERDA) */}
        <div style={styles.column}>
          <h5 style={styles.colTitle}>Resultados</h5>
          {isLoading ? (
            <p style={{fontSize: '0.8rem', color: '#666', padding: '10px'}}>Cargando...</p>
          ) : isError ? (
            <p style={{fontSize: '0.8rem', color: 'red', padding: '10px'}}>Error al cargar</p>
          ) : (
            <div style={styles.list}>
              {(!data || data.length === 0) && <p style={{fontSize: '0.8rem', padding: '10px'}}>No hay resultados</p>}
              {data?.map((item) => {
                const isSelected = selectedIds.includes(item.id);
                return (
                  <div 
                    key={item.id} 
                    onClick={() => onToggleItem(item)}
                    style={{...styles.listItem, opacity: isSelected ? 0.5 : 1}}
                  >
                    <span style={{flex: 1}}>{item.label}</span>
                    {isSelected ? <FiCheck color="green"/> : <FiPlus color="#007bff"/>}
                  </div>
                );
              })}
            </div>
          )}
          {/* Paginación */}
          <div style={styles.pagination}>
            <button type="button" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={styles.pageBtn}><FiChevronLeft/></button>
            <span style={{fontSize: '0.8rem'}}>Pág {page}</span>
            <button type="button" onClick={() => setPage(p => p + 1)} disabled={!data || data.length < pageSize} style={styles.pageBtn}><FiChevronRight/></button>
          </div>
        </div>

        {/* LISTA DE SELECCIONADOS (DERECHA) */}
        <div style={{...styles.column, borderLeft: '1px solid #eee'}}>
          <h5 style={styles.colTitle}>Seleccionados ({selectedIds.length})</h5>
          <div style={styles.list}>
            {selectedIds.length === 0 && <p style={{fontSize: '0.8rem', color: '#999', fontStyle: 'italic', padding: '10px'}}>Nada seleccionado</p>}
            {selectedIds.map(id => {
               const itemInData = data?.find(d => d.id === id);
               const displayText = itemInData ? itemInData.label : id;

               return (
                  <div key={id} style={styles.selectedTag}>
                    <span>{displayText}</span> 
                    <button type="button" onClick={() => onToggleItem({id})} style={styles.removeBtn}><FiX /></button>
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
      const createdStr = userToEdit ? userToEdit.createdate : today.toISOString().split('T')[0];
      
      const expDate = new Date(today);
      expDate.setFullYear(expDate.getFullYear() + 1);
      const expirationStr = expDate.toISOString().split('T')[0];

      const branchNameList = data.branchidlist.map(() => ""); 
      const forwarderNameList = data.forwarderidlist.map(() => "");

      const payload = {
        ...data,
        userid: userToEdit ? userToEdit.userid : 0,
        status: userToEdit ? userToEdit.status : "Active",
        mustchangepassword: true, 
        createdate: createdStr, 
        expirationdate: expirationStr,
        branchidlist: data.canviewallbranches ? [] : data.branchidlist,
        branchnamelist: data.canviewallbranches ? [] : branchNameList,
        forwarderidlist: data.canviewallforwarders ? [] : data.forwarderidlist,
        forwardernamelist: data.canviewallforwarders ? [] : forwarderNameList,
      };

      if (userToEdit) {
        console.log("Editando...", payload);
      } else {
        await api.post('/users', payload);
      }
      
      onUserSaved && onUserSaved();
      onClose();
    } catch (error) {
      console.error(error);
      alert("Error al guardar usuario: " + (error.response?.data?.message || error.message));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={styles.overlay}>
      <div className="modal-content" style={styles.modal}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20}}>
          <h2 style={{margin: 0}}>{userToEdit ? "Editar Usuario" : "Nuevo Usuario"}</h2>
          <button onClick={onClose} style={{border:'none', background:'transparent', cursor:'pointer'}}><FiX size={24}/></button>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'grid', gap: '15px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={styles.label}>Usuario</label>
              <input {...register("username")} style={styles.input} placeholder="Ej: jdoe" />
              {errors.username && <span style={styles.error}>{errors.username.message}</span>}
            </div>
            <div>
              <label style={styles.label}>Nombre Completo</label>
              <input {...register("fullname")} style={styles.input} placeholder="Juan Perez" />
              {errors.fullname && <span style={styles.error}>{errors.fullname.message}</span>}
            </div>
          </div>

          <div>
            <label style={styles.label}>Email</label>
            <input {...register("email")} style={styles.input} placeholder="juan@empresa.com" />
            {errors.email && <span style={styles.error}>{errors.email.message}</span>}
          </div>

          <div style={{ display: 'flex', gap: 20, background: '#f9f9f9', padding: 10, borderRadius: 6 }}>
            <label style={styles.checkboxLabel}>
              <input type="checkbox" {...register("isadministrator")} /> Es Administrador
            </label>
          </div>

          <hr style={{border: '0', borderTop: '1px solid #eee', margin: '5px 0'}} />

          {/* SELECTOR BRANCHES */}
          <div>
            <div style={{display: 'flex', justifyContent: 'space-between'}}>
                <h4 style={{margin: '0 0 5px 0'}}>Sedes (Branches)</h4>
                <label style={{fontSize: '0.8rem', cursor: 'pointer'}}>
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

          {/* SELECTOR FORWARDERS */}
          <div>
            <div style={{display: 'flex', justifyContent: 'space-between'}}>
                <h4 style={{margin: '0 0 5px 0'}}>Obras Sociales (Forwarders)</h4>
                <label style={{fontSize: '0.8rem', cursor: 'pointer'}}>
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

          <div style={{ marginTop: 10, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button type="button" onClick={onClose} style={styles.btnSecondary}>Cancelar</button>
            <button type="submit" disabled={isSubmitting} style={styles.btnPrimary}>
              {isSubmitting ? "Guardando..." : "Guardar Usuario"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

const styles = {
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(2px)' },
  modal: { background: 'white', padding: '25px', borderRadius: '12px', width: '700px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' },
  input: { width: '100%', padding: '8px 12px', marginTop: 5, border: '1px solid #ddd', borderRadius: '6px', fontSize: '0.95rem' },
  label: { fontSize: '0.9rem', fontWeight: 600, color: '#333' },
  error: { color: '#e00', fontSize: '0.8rem', marginTop: 2 },
  checkboxLabel: { fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer' },
  
  selectorContainer: { border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden', background: '#fff' },
  disabledBox: { padding: '15px', background: '#f3f4f6', color: '#666', borderRadius: '8px', textAlign: 'center', fontSize: '0.9rem' },
  
  searchBar: { padding: '8px', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', gap: 0 },
  searchInput: { border: '1px solid #ddd', borderRight: 'none', borderRadius: '4px 0 0 4px', outline: 'none', width: '100%', fontSize: '0.9rem', padding: '6px 10px', height: '32px' },
  searchButton: { border: '1px solid #0198CC', background: '#0198CC', color: 'white', borderRadius: '0 4px 4px 0', cursor: 'pointer', padding: '0 12px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' },

  selectorBody: { display: 'flex', height: '220px' },
  column: { flex: 1, display: 'flex', flexDirection: 'column', padding: '0' },
  colTitle: { margin: 0, padding: '8px', background: '#f9fafb', borderBottom: '1px solid #eee', fontSize: '0.85rem', color: '#555' },
  list: { flex: 1, overflowY: 'auto', padding: '5px' },
  listItem: { display: 'flex', alignItems: 'center', padding: '6px 10px', cursor: 'pointer', borderRadius: '4px', fontSize: '0.85rem', marginBottom: 2, transition: 'background 0.2s' },
  selectedTag: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#e0f2fe', color: '#0284c7', padding: '4px 8px', borderRadius: '4px', marginBottom: '4px', fontSize: '0.85rem' },
  removeBtn: { border: 'none', background: 'transparent', cursor: 'pointer', color: '#0284c7', padding: 0, marginLeft: 5 },
  
  pagination: { padding: '5px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10 },
  pageBtn: { border: 'none', background: '#fff', cursor: 'pointer', padding: '4px', borderRadius: '4px' },
  
  btnPrimary: { padding: '10px 20px', border: 'none', borderRadius: '6px', background: '#0198CC', color: 'white', fontWeight: 600, cursor: 'pointer' },
  btnSecondary: { padding: '10px 20px', border: '1px solid #ddd', borderRadius: '6px', background: 'white', color: '#333', cursor: 'pointer' },
};

export default ModalUsuario;