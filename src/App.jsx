import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./assets/database/authcontext";
import ProtectedRoute from "./assets/components/protectedRoute"; 
import Login from './assets/views/Login'
import Encabezado from "./assets/components/Encabezado";
import Inicio from "./assets/views/Inicio";
import Categorias from "./assets/views/Categorias";
import Productos from "./assets/views/Productos";
import './App.css'
import Catalogo from "./assets/views/Catalogo";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Encabezado />
        <main className="margen-superior-main">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/inicio" element={<ProtectedRoute element={<Inicio />} />} />
            <Route path="/categorias" element={<ProtectedRoute element={<Categorias />} />} />
            <Route path="/productos" element={<ProtectedRoute element={<Productos />} />} />
            <Route path="/catalogo" element={<ProtectedRoute element={<Catalogo />} />} />
          </Routes>
        </main>
      </Router>
    </AuthProvider>
  );
}

export default App;
