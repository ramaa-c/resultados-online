import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/login';
import "./styles/login.css";
import Resultados from './pages/resultados';
import "./styles/resultados.css";
import ProtectedRoute from './components/ProtectedRoute'; 

function App() {
  return (
    <Router>
      <Routes>
        {/* Rutas Públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/login" />} />

        {/* --- ZONA PROTEGIDA --- */}
        <Route element={<ProtectedRoute />}>
           <Route path="/resultados" element={<Resultados />} />
        </Route>
        {/* ---------------------- */}

        {/* Ruta comodín para redirigir cualquier URL desconocida al login */}
        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
    </Router>
  );
}

export default App;