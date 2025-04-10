import React, { createContext, useContext, useState, useEffect } from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { appfirebase } from "./firebaseconfig";

const AuthContext = createContext();

// Custom hook para usar el contexto de autenticación
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Efecto para manejar cambios en el estado de autenticación
  useEffect(() => {
    const auth = getAuth(appfirebase);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsLoggedIn(!!user);
    });
    return () => unsubscribe();
  }, []);

  // Efecto para detectar el estado de conexión (online / offline)
  useEffect(() => {
    const handleOnline = () => {
      console.log("¡Conexión restablecida!");
      alert("¡Conexión restablecida!");
    };
    const handleOffline = () => {
      console.log("Estás offline. Los cambios se sincronizarán cuando vuelvas a conectarte.");
      alert("Estás offline. Los cambios se sincronizarán cuando vuelvas a conectarte.");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Función para cerrar sesión
  const logout = async () => {
    const auth = getAuth(appfirebase);
    await signOut(auth);
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
