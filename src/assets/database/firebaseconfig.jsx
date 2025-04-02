// Importa las funciones necesarias del SDK de Firebase
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage"; // Agrega Firebase Storage

// Configuración de Firebase con tus credenciales
const firebaseConfig = {
  apiKey: "AIzaSyDTxATOw1Yp5zuRVz4hkCQvb2ffYtFjXIs",
  authDomain: "vite123-f468e.firebaseapp.com",
  projectId: "vite123-f468e",
  storageBucket: "vite123-f468e.firebasestorage.app",
  messagingSenderId: "630046869483",
  appId: "1:630046869483:web:170c1d9b3e0b65b9f13bae",
  measurementId: "G-K18WKHMWJ6",
};

// Inicializa Firebase
const appfirebase = initializeApp(firebaseConfig);

// Inicializa Firestore
const db = getFirestore(appfirebase);

// Inicializa Storage
const storage = getStorage(appfirebase);

// Inicializa Authentication
const auth = getAuth(appfirebase);

export { appfirebase, db, auth, storage };
