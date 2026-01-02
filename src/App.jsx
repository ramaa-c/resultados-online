import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/login";
import Registro from "./pages/registro";
import "./styles/login.css";
import Resultados from "./pages/resultados";
import RecuperarClave from "./pages/recuperarClave";
import CambiarClave from './pages/cambiarClave';
import "./styles/resultados.css";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        {/* Rutas Públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/recuperarClave" element={<RecuperarClave />} />
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/cambiarClave" element={<CambiarClave />} />

        {/* --- ZONA PROTEGIDA --- */}
        <Route element={<ProtectedRoute />}>
          <Route path="/resultados" element={<Resultados />} />
        </Route>

        {/* Ruta comodín para redirigir cualquier URL desconocida al login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
