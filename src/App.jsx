import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./assets/database/authcontext";
import ProtectedRoute from "./assets/components/protectedRoute"; 
import Login from './assets/views/Login'
import Encabezado from "./assets/components/Encabezado";
import Inicio from "./assets/views/Inicio";

import './App.css'

function App() {

  return (
    <>
      <AuthProvider>
        <Router>
          <div className="App">
            <Encabezado />
            <main>
              <Routes>
                
                <Route path="/" element={<Login />} />
                <Route path="/inicio" element={<ProtectedRoute element={<Inicio />} />} />

              </Routes>
            </main>
          </div>
        </Router>
      </AuthProvider>
    </>
  )
}

export default App