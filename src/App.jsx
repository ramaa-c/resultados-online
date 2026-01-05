import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Login from "./pages/login";
import "./styles/login.css";
import Resultados from "./pages/resultados";
import RecuperarClave from "./pages/recuperarClave";
import CambiarClave from "./pages/cambiarClave";
import "./styles/resultados.css";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          duration: 4000,
          style: {
            background: "#333",
            color: "#fff",
          },
        }}
      />
      <Routes>
        {/* Rutas Públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/recuperarClave" element={<RecuperarClave />} />
        <Route path="/" element={<Navigate to="/login" />} />

        {/* --- ZONA PROTEGIDA --- */}
        <Route element={<ProtectedRoute />}>
          <Route path="/resultados" element={<Resultados />} />
          <Route path="/cambiarClave" element={<CambiarClave />} />
        </Route>

        {/* Ruta comodín para redirigir cualquier URL desconocida al login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
