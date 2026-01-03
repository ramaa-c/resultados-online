import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/login';
import "./styles/login.css";
import Resultados from './pages/resultados';
import "./styles/resultados.css";
import Registro from "./pages/registro";
import "./styles/registro.css";
import CambiarClave from "./pages/cambiarClave";
import RecuperarClave from "./pages/recuperarClave"

import centraLabLogo from "./assets/images/centraLab_nuevo.png";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/cambiarClave" element={<CambiarClave />} />
        <Route path="/recuperarClave" element={<RecuperarClave />} />

        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/resultados" element={<Resultados />} />

      </Routes>
    </Router>
  );
}

export default App;