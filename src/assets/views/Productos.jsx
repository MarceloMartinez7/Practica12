import React, { useState, useEffect } from "react";
import { Container, Button } from "react-bootstrap";
import { db } from "../database/firebaseconfig";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import TablaProductos from "../components/Productos/TablaProductos";
import ModalRegistroProducto from "../components/Productos/ModalRegistroProducto";
import ModalEdicionProducto from "../components/Productos/ModalEdicionProducto";
import ModalEliminacionProducto from "../components/Productos/ModalEliminacionProducto";

const Productos = () => {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: "",
    precio: "",
    categoria: "",
    imagen: "",
  });
  const [productoEditado, setProductoEditado] = useState(null);
  const [productoAEliminar, setProductoAEliminar] = useState(null);

  // Firebase references
  const productosCollection = collection(db, "productos");
  const categoriasCollection = collection(db, "categorias");
  const storage = getStorage();

  // Fetch data from Firestore
  const fetchData = async () => {
    try {
      const productosData = await getDocs(productosCollection);
      const fetchedProductos = productosData.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      setProductos(fetchedProductos);

      const categoriasData = await getDocs(categoriasCollection);
      const fetchedCategorias = categoriasData.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      setCategorias(fetchedCategorias);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Image upload to Firebase Storage
  const handleImageUpload = async (file) => {
    const storageRef = ref(storage, `images/${file.name}`);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  };

  // Form handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNuevoProducto((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setProductoEditado((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const url = await handleImageUpload(file);
        setNuevoProducto((prev) => ({ ...prev, imagen: url }));
      } catch (error) {
        console.error("Error uploading image:", error);
      }
    }
  };

  const handleEditImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const url = await handleImageUpload(file);
        setProductoEditado((prev) => ({ ...prev, imagen: url }));
      } catch (error) {
        console.error("Error uploading image:", error);
      }
    }
  };

  // CRUD functions
  const handleAddProducto = async () => {
    if (!nuevoProducto.nombre || !nuevoProducto.precio || !nuevoProducto.categoria) {
      alert("Please fill all required fields.");
      return;
    }
    try {
      await addDoc(productosCollection, nuevoProducto);
      setShowModal(false);
      setNuevoProducto({ nombre: "", precio: "", categoria: "", imagen: "" });
      await fetchData();
    } catch (error) {
      console.error("Error adding product:", error);
    }
  };

  const handleEditProducto = async () => {
    if (!productoEditado.nombre || !productoEditado.precio || !productoEditado.categoria) {
      alert("Please fill all required fields.");
      return;
    }
    try {
      const productoRef = doc(db, "productos", productoEditado.id);
      await updateDoc(productoRef, productoEditado);
      setShowEditModal(false);
      await fetchData();
    } catch (error) {
      console.error("Error editing product:", error);
    }
  };

  const handleDeleteProducto = async () => {
    if (productoAEliminar) {
      try {
        const productoRef = doc(db, "productos", productoAEliminar.id);
        await deleteDoc(productoRef);
        setShowDeleteModal(false);
        await fetchData();
      } catch (error) {
        console.error("Error deleting product:", error);
      }
    }
  };

  // Modal functions
  const openEditModal = (producto) => {
    setProductoEditado({ ...producto });
    setShowEditModal(true);
  };

  const openDeleteModal = (producto) => {
    setProductoAEliminar(producto);
    setShowDeleteModal(true);
  };

  return (
    <Container className="mt-5">
      <h4>Gestión de Productos</h4>
      <Button className="mb-3" onClick={() => setShowModal(true)}>
        Agregar producto
      </Button>
      <TablaProductos
        productos={productos}
        openEditModal={openEditModal}
        openDeleteModal={openDeleteModal}
      />
      <ModalRegistroProducto
        showModal={showModal}
        setShowModal={setShowModal}
        nuevoProducto={nuevoProducto}
        handleInputChange={handleInputChange}
        handleImageChange={handleImageChange}
        handleAddProducto={handleAddProducto}
        categorias={categorias}
      />
      <ModalEdicionProducto
        showEditModal={showEditModal}
        setShowEditModal={setShowEditModal}
        productoEditado={productoEditado}
        handleEditInputChange={handleEditInputChange}
        handleEditImageChange={handleEditImageChange}
        handleEditProducto={handleEditProducto}
        categorias={categorias}
      />
      <ModalEliminacionProducto
        showDeleteModal={showDeleteModal}
        setShowDeleteModal={setShowDeleteModal}
        handleDeleteProducto={handleDeleteProducto}
      />
    </Container>
  );
};

export default Productos;
