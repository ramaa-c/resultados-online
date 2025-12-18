import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/login';
import "./styles/login.css";
import Resultados from './pages/resultados';
import "./styles/resultados.css";
import centraLabLogo from "./assets/images/centraLab_nuevo.png";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/resultados" element={<Resultados />} />

      </Routes>
    </Router>
  );
}

export default App;