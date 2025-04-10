// Importa las funciones necesarias del SDK de Firebase
import { initializeApp } from "firebase/app";
import {
  initializeFirestore,
  persistentLocalCache,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Configuración de Firebase con tus credenciales
const firebaseConfig = {
  apiKey: "AIzaSyDTxATOw1Yp5zuRVz4hkCQvb2ffYtFjXIs",
  authDomain: "vite123-f468e.firebaseapp.com",
  projectId: "vite123-f468e",
  storageBucket: "vite123-f468e.appspot.com", // Corregido: .app → .appspot.com
  messagingSenderId: "630046869483",
  appId: "1:630046869483:web:170c1d9b3e0b65b9f13bae",
  measurementId: "G-K18WKHMWJ6",
};

// Inicializa Firebase
const appfirebase = initializeApp(firebaseConfig);

// Inicializa Firestore con persistencia offline
let db;
try {
  db = initializeFirestore(appfirebase, {
    localCache: persistentLocalCache({
      cacheSizeBytes: 100 * 1024 * 1024, // 100 MB (opcional)
    }),
  });
  console.log("Firestore inicializado con persistencia offline.");
} catch (error) {
  console.error("Error al inicializar Firestore con persistencia:", error);
  // Fallback: inicializar sin persistencia
  db = initializeFirestore(appfirebase, {});
}

// Inicializa Storage
const storage = getStorage(appfirebase);

// Inicializa Authentication
const auth = getAuth(appfirebase);

// Exporta las instancias
export { appfirebase, db, auth, storage };
