import React, { useState, useEffect } from "react";
import { Container, Button } from "react-bootstrap";
import { db } from "../database/firebaseconfig";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";

import TablaCategorias from "../components/Categorias/TablaCategorias";
import ModalRegistroCategoria from "../components/Categorias/ModalRegistroCategoria";
import ModalEdicionCategoria from "../components/Categorias/ModalEdicionCategoria";
import ModalEliminacionCategoria from "../components/Categorias/ModalEliminacionCategoria";

const Categorias = () => {
  const [categorias, setCategorias] = useState([]);
  const [categoriasFiltradas, setCategoriasFiltradas] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [nuevaCategoria, setNuevaCategoria] = useState({ nombre: "", descripcion: "" });
  const [categoriaEditada, setCategoriaEditada] = useState(null);
  const [categoriaAEliminar, setCategoriaAEliminar] = useState(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  const categoriasCollection = collection(db, "categorias");

  // Escuchar cambios de red
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Hook useEffect para carga inicial y escucha de datos
  useEffect(() => {
    const cleanupListener = fetchCategorias();
    return () => cleanupListener();
  }, []);

  const fetchCategorias = () => {
    return onSnapshot(
      categoriasCollection,
      (snapshot) => {
        const fetchedCategorias = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        setCategorias(fetchedCategorias);
        setCategoriasFiltradas(fetchedCategorias);
        console.log("Categorías cargadas desde Firestore:", fetchedCategorias);

        if (!navigator.onLine) {
          console.log("Offline: Mostrando datos desde la caché local.");
        }
      },
      (error) => {
        console.error("Error al escuchar categorías:", error);
        if (!navigator.onLine) {
          console.log("Offline: Mostrando datos desde la caché local.");
        } else {
          alert("Error al cargar las categorías: " + error.message);
        }
      }
    );
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNuevaCategoria((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setCategoriaEditada((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddCategoria = async () => {
    if (!nuevaCategoria.nombre || !nuevaCategoria.descripcion) {
      alert("Por favor, completa todos los campos antes de guardar.");
      return;
    }
    try {
      await addDoc(categoriasCollection, nuevaCategoria);
      setShowModal(false);
      setNuevaCategoria({ nombre: "", descripcion: "" });
    } catch (error) {
      console.error("Error al agregar la categoría:", error);
    }
  };

  const handleEditCategoria = async () => {
    if (!categoriaEditada?.nombre || !categoriaEditada?.descripcion) {
      alert("Por favor, completa todos los campos antes de actualizar.");
      return;
    }

    setShowEditModal(false);

    const categoriaRef = doc(db, "categorias", categoriaEditada.id);

    try {
      await updateDoc(categoriaRef, {
        nombre: categoriaEditada.nombre,
        descripcion: categoriaEditada.descripcion,
      });

      console.log("Red desconectada:", isOffline);

      if (isOffline) {
        // Actualización local si no hay internet
        setCategorias((prev) =>
          prev.map((cat) =>
            cat.id === categoriaEditada.id ? { ...categoriaEditada } : cat
          )
        );
        setCategoriasFiltradas((prev) =>
          prev.map((cat) =>
            cat.id === categoriaEditada.id ? { ...categoriaEditada } : cat
          )
        );
        console.log("Categoría actualizada localmente (sin conexión).");
        alert("Sin conexión: Categoría actualizada localmente. Se sincronizará cuando haya internet.");
      } else {
        console.log("Categoría actualizada exitosamente en la nube.");
      }
    } catch (error) {
      console.error("Error al actualizar la categoría:", error);

      setCategorias((prev) =>
        prev.map((cat) =>
          cat.id === categoriaEditada.id ? { ...categoriaEditada } : cat
        )
      );
      setCategoriasFiltradas((prev) =>
        prev.map((cat) =>
          cat.id === categoriaEditada.id ? { ...categoriaEditada } : cat
        )
      );
      alert("Ocurrió un error al actualizar la categoría: " + error.message);
    }
  };

  const handleDeleteCategoria = async () => {
    if (categoriaAEliminar) {
      try {
        const categoriaRef = doc(db, "categorias", categoriaAEliminar.id);
        await deleteDoc(categoriaRef);
        setShowDeleteModal(false);
      } catch (error) {
        console.error("Error al eliminar la categoría:", error);
      }
    }
  };

  const openEditModal = (categoria) => {
    setCategoriaEditada({ ...categoria });
    setShowEditModal(true);
  };

  const openDeleteModal = (categoria) => {
    setCategoriaAEliminar(categoria);
    setShowDeleteModal(true);
  };

  return (
    <Container className="mt-5">
      <br />
      <h4>Gestión de Categorías</h4>
      <Button className="mb-3" onClick={() => setShowModal(true)}>
        Agregar categoría
      </Button>
      <TablaCategorias
        categorias={categoriasFiltradas}
        openEditModal={openEditModal}
        openDeleteModal={openDeleteModal}
      />
      <ModalRegistroCategoria
        showModal={showModal}
        setShowModal={setShowModal}
        nuevaCategoria={nuevaCategoria}
        handleInputChange={handleInputChange}
        handleAddCategoria={handleAddCategoria}
      />
      <ModalEdicionCategoria
        showEditModal={showEditModal}
        setShowEditModal={setShowEditModal}
        categoriaEditada={categoriaEditada}
        handleEditInputChange={handleEditInputChange}
        handleEditCategoria={handleEditCategoria}
      />
      <ModalEliminacionCategoria
        showDeleteModal={showDeleteModal}
        setShowDeleteModal={setShowDeleteModal}
        handleDeleteCategoria={handleDeleteCategoria}
      />
    </Container>
  );
};

export default Categorias;
