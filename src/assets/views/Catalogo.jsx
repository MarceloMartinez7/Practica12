import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../database/firebaseconfig";

import TarjetaProducto from "../components/Productos/TarjetaProducto";
import ModalEdicionProducto from "../components/Productos/ModalEdicionProducto";
import CuadroBusqueda from "../components/Busquedas/CuadroBusquedas";

const Catalogo = () => {
  const [productos, setProductos] = useState([]);
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("Todas");
  const [searchText, setSearchText] = useState("");

  const [showEditModal, setShowEditModal] = useState(false);
  const [productoEditado, setProductoEditado] = useState(null);

  const productosCollection = collection(db, "productos");
  const categoriasCollection = collection(db, "categorias");

  // Obtener productos y categorías desde Firestore
  const fetchData = async () => {
    try {
      const productosSnapshot = await getDocs(productosCollection);
      const productosList = productosSnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
      }));
      setProductos(productosList);

      const categoriasSnapshot = await getDocs(categoriasCollection);
      const categoriasList = categoriasSnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
      }));
      setCategorias(categoriasList);
    } catch (error) {
      console.error("Error al obtener datos:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtro dinámico por categoría y búsqueda
  useEffect(() => {
    let filtrados = [...productos];

    if (categoriaSeleccionada !== "Todas") {
      filtrados = filtrados.filter(
        producto => producto.categoria === categoriaSeleccionada
      );
    }

    if (searchText.trim() !== "") {
      const texto = searchText.toLowerCase();
      filtrados = filtrados.filter(
        producto =>
          producto.nombre.toLowerCase().includes(texto) ||
          producto.categoria.toLowerCase().includes(texto)
      );
    }

    setProductosFiltrados(filtrados);
  }, [productos, categoriaSeleccionada, searchText]);

  // Abrir modal de edición
  const handleEditClick = (producto) => {
    setProductoEditado(producto);
    setShowEditModal(true);
  };

  // Actualización en los campos del modal
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setProductoEditado(prev => ({ ...prev, [name]: value }));
  };

  const handleEditImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setProductoEditado(prev => ({ ...prev, imagen: imageUrl }));
    }
  };

  // Guardar cambios editados
  const handleEditProducto = async () => {
    if (!productoEditado) return;
    try {
      const productoRef = doc(db, "productos", productoEditado.id);
      await updateDoc(productoRef, {
        nombre: productoEditado.nombre,
        precio: productoEditado.precio,
        categoria: productoEditado.categoria,
        imagen: productoEditado.imagen,
      });

      alert("Producto actualizado correctamente");
      setShowEditModal(false);
      fetchData();
    } catch (error) {
      console.error("Error al actualizar el producto:", error);
      alert("Error al actualizar el producto");
    }
  };

  return (
    <Container className="mt-5">
      <h4>Catálogo de Productos</h4>

      {/* Filtros: Categoría y búsqueda */}
      <Row className="mb-3">
        <Col lg={3} md={4} sm={6}>
          <Form.Group>
            <Form.Label>Filtrar por categoría:</Form.Label>
            <Form.Select
              value={categoriaSeleccionada}
              onChange={(e) => setCategoriaSeleccionada(e.target.value)}
            >
              <option value="Todas">Todas</option>
              {categorias.map((cat) => (
                <option key={cat.id} value={cat.nombre}>
                  {cat.nombre}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <Button className="mt-2" variant="primary" onClick={fetchData}>
            Actualizar
          </Button>
        </Col>

        <Col lg={6} md={8} sm={12}>
          <CuadroBusqueda
            searchText={searchText}
            handleSearchChange={(e) => setSearchText(e.target.value)}
          />
        </Col>
      </Row>

      {/* Lista de productos */}
      <Row>
        {productosFiltrados.length > 0 ? (
          productosFiltrados.map((producto) => (
            <TarjetaProducto
              key={producto.id}
              producto={producto}
              onEdit={handleEditClick}
            />
          ))
        ) : (
          <p>No hay productos que coincidan con la búsqueda o la categoría.</p>
        )}
      </Row>

      {/* Modal de edición de producto */}
      <ModalEdicionProducto
        showEditModal={showEditModal}
        setShowEditModal={setShowEditModal}
        productoEditado={productoEditado}
        handleEditInputChange={handleEditInputChange}
        handleEditImageChange={handleEditImageChange}
        handleEditProducto={handleEditProducto}
        categorias={categorias}
      />
    </Container>
  );
};

export default Catalogo;
