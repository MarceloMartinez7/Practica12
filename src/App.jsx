import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./assets/database/authcontext";
import ProtectedRoute from "./assets/components/protectedRoute"; 
import Login from './assets/views/Login'
import Encabezado from "./assets/components/Encabezado";
import Inicio from "./assets/views/Inicio";
import Categorias from "./assets/views/Categorias";
import Productos from "./assets/views/Productos";
import Catalogo from "./assets/views/Catalogo";
import Libros from "./assets/views/Libros";
import Clima from "./assets/components/Clima/Clima";
import Pronunciacion from "./assets/views/Pronunciacion";
import Estadisticas from "./assets/views/Estadisticas";
import Empleados from "./assets/views/Empleados"
import './App.css'


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
            <Route path="/libros" element={<ProtectedRoute element={<Libros />} />} />
            <Route path="/clima" element={<ProtectedRoute element={<Clima />} />}/>
            <Route path="/pronunciacion" element={<ProtectedRoute element={<Pronunciacion />} />}/>
            <Route path="/estadisticas" element={<ProtectedRoute element={<Estadisticas />} />}/>
            <Route path="/empleados" element={<ProtectedRoute element={<Empleados />} />}/>
          </Routes>
        </main>
      </Router>
    </AuthProvider>
  );
}

export default App;
