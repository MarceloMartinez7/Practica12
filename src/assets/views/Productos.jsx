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
import TablaProductos from "../components/Productos/TablaProductos";
import ModalRegistroProducto from "../components/Productos/ModalRegistroProducto";
import ModalEdicionProducto from "../components/Productos/ModalEdicionProducto";
import ModalEliminacionProducto from "../components/Productos/ModalEliminacionProducto";
import CuadroBusquedas from "../components/Busquedas/CuadroBusquedas";
import ModalQR from "../components/Qr/ModalQr";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from 'xlsx';
import { saveAs } from "file-saver";


const Productos = () => {
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedUrl, setSelectedUrl] = useState("");
  const [productos, setProductos] = useState([]);
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [searchText, setSearchText] = useState("");
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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const productosCollection = collection(db, "productos");
  const categoriasCollection = collection(db, "categorias");

  const paginatedProductos = productosFiltrados.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  //Metodos para el QR
  const openQRModal = (url) => {
    setShowQRModal(url);
    setSelectedUrl("");
  };

  const handleCloseQRModal = () => {
    setShowQRModal(false);
    selectedUrl("");
  };

  const handleCopy = (productos) => {
    const rowData = `Nombre: ${productos.nombre}\nPrecio: C$${productos.precio}\nCategoria: ${productos.categoria}`;

    navigator.clipboard.writeText(rowData).then(() => {
      console.log("Error el copiar al portapapeles", err);
    });
  };

  const fetchData = () => {
    // Escuchar productos
    const unsubscribeProductos = onSnapshot(
      productosCollection,
      (snapshot) => {
        const fetchedProductos = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        setProductos(fetchedProductos);
        setProductosFiltrados(fetchedProductos);
        if (isOffline) {
          console.log("Offline: Productos cargados desde caché local.");
        }
      },
      (error) => {
        console.error("Error al escuchar productos:", error);
        if (isOffline) {
          console.log("Offline: Mostrando datos desde caché local.");
        } else {
          alert("Error al cargar productos: " + error.message);
        }
      }
    );

    // Escuchar categorías
    const unsubscribeCategorias = onSnapshot(
      categoriasCollection,
      (snapshot) => {
        const fetchedCategorias = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        setCategorias(fetchedCategorias);
        if (isOffline) {
          console.log("Offline: Categorías cargadas desde caché local.");
        }
      },
      (error) => {
        console.error("Error al escuchar categorías:", error);
        if (isOffline) {
          console.log("Offline: Mostrando categorías desde caché local.");
        } else {
          alert("Error al cargar categorías: " + error.message);
        }
      }
    );

    return () => {
      unsubscribeProductos();
      unsubscribeCategorias();
    };
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSearchChange = (e) => {
    const text = e.target.value.toLowerCase();
    setSearchText(text);
    setCurrentPage(1); // Resetear página al buscar
    setProductosFiltrados(
      productos.filter(
        (producto) =>
          producto.nombre.toLowerCase().includes(text) ||
          producto.precio.toLowerCase().includes(text) ||
          producto.categoria.toLowerCase().includes(text)
      )
    );
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNuevoProducto((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setProductoEditado((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNuevoProducto((prev) => ({ ...prev, imagen: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProductoEditado((prev) => ({ ...prev, imagen: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddProducto = async () => {
    // Validar campos requeridos
    if (
      !nuevoProducto.nombre ||
      !nuevoProducto.precio ||
      !nuevoProducto.categoria ||
      !nuevoProducto.imagen
    ) {
      alert("Por favor, completa todos los campos, incluyendo la imagen.");
      return;
    }

    // Cerrar modal
    setShowModal(false);

    // Crear ID temporal y objeto del producto
    const tempId = `temp_${Date.now()}`;
    const productoConId = {
      ...nuevoProducto,
      id: tempId,
      precio: parseFloat(nuevoProducto.precio), // Asegurar que precio sea número
    };

    try {
      // Actualizar estado local
      setProductos((prev) => [...prev, productoConId]);
      setProductosFiltrados((prev) => [...prev, productoConId]);

      // Mensaje según estado de conexión
      if (isOffline) {
        console.log("Producto agregado localmente (sin conexión).");
        alert(
          "Sin conexión: Producto agregado localmente. Se sincronizará al reconectar."
        );
      } else {
        console.log("Producto agregado exitosamente en la nube.");
      }

      // Guardar en Firestore
      await addDoc(productosCollection, {
        nombre: nuevoProducto.nombre,
        precio: parseFloat(nuevoProducto.precio),
        categoria: nuevoProducto.categoria,
        imagen: nuevoProducto.imagen,
      });

      // Limpiar formulario
      setNuevoProducto({ nombre: "", precio: "", categoria: "", imagen: "" });
    } catch (error) {
      console.error("Error al agregar el producto:", error);
      if (isOffline) {
        console.log("Offline: Producto almacenado localmente.");
      } else {
        // Revertir cambios locales si falla en la nube
        setProductos((prev) => prev.filter((prod) => prod.id !== tempId));
        setProductosFiltrados((prev) =>
          prev.filter((prod) => prod.id !== tempId)
        );
        alert("Error al agregar el producto: " + error.message);
      }
    }
  };

  const handleEditProducto = async () => {
    // Validar campos requeridos
    if (
      !productoEditado.nombre ||
      !productoEditado.precio ||
      !productoEditado.categoria ||
      !productoEditado.imagen
    ) {
      alert("Por favor, completa todos los campos, incluyendo la imagen.");
      return;
    }

    // Cerrar modal
    setShowEditModal(false);

    const productoRef = doc(db, "productos", productoEditado.id);

    try {
      // Actualizar estado local
      setProductos((prev) =>
        prev.map((prod) =>
          prod.id === productoEditado.id
            ? { ...productoEditado, precio: parseFloat(productoEditado.precio) }
            : prod
        )
      );
      setProductosFiltrados((prev) =>
        prev.map((prod) =>
          prod.id === productoEditado.id
            ? { ...productoEditado, precio: parseFloat(productoEditado.precio) }
            : prod
        )
      );

      // Mensaje según estado de conexión
      if (isOffline) {
        console.log("Producto actualizado localmente (sin conexión).");
        alert(
          "Sin conexión: Producto actualizado localmente. Se sincronizará al reconectar."
        );
      } else {
        console.log("Producto actualizado exitosamente en la nube.");
      }

      // Actualizar en Firestore
      await updateDoc(productoRef, {
        nombre: productoEditado.nombre,
        precio: parseFloat(productoEditado.precio),
        categoria: productoEditado.categoria,
        imagen: productoEditado.imagen,
      });
    } catch (error) {
      console.error("Error al actualizar el producto:", error);
      if (isOffline) {
        console.log("Offline: Producto actualizado localmente.");
      } else {
        // Revertir cambios locales si falla en la nube
        setProductos((prev) =>
          prev.map((prod) =>
            prod.id === productoEditado.id ? { ...prod } : prod
          )
        );
        setProductosFiltrados((prev) =>
          prev.map((prod) =>
            prod.id === productoEditado.id ? { ...prod } : prod
          )
        );
        alert("Error al actualizar el producto: " + error.message);
      }
    }
  };

  const handleDeleteProducto = async () => {
    if (!productoAEliminar) return;

    // Cerrar modal
    setShowDeleteModal(false);

    try {
      // Actualizar estado local
      setProductos((prev) =>
        prev.filter((prod) => prod.id !== productoAEliminar.id)
      );
      setProductosFiltrados((prev) =>
        prev.filter((prod) => prod.id !== productoAEliminar.id)
      );

      // Mensaje según estado de conexión
      if (isOffline) {
        console.log("Producto eliminado localmente (sin conexión).");
        alert(
          "Sin conexión: Producto eliminado localmente. Se sincronizará al reconectar."
        );
      } else {
        console.log("Producto eliminado exitosamente en la nube.");
      }

      // Eliminar en Firestore
      const productoRef = doc(db, "productos", productoAEliminar.id);
      await deleteDoc(productoRef);
    } catch (error) {
      console.error("Error al eliminar el producto:", error);
      if (isOffline) {
        console.log("Offline: Eliminación almacenada localmente.");
      } else {
        // Restaurar producto en estado local si falla en la nube
        setProductos((prev) => [...prev, productoAEliminar]);
        setProductosFiltrados((prev) => [...prev, productoAEliminar]);
        alert("Error al eliminar el producto: " + error.message);
      }
    }
  };

  const openEditModal = (producto) => {
    setProductoEditado({ ...producto });
    setShowEditModal(true);
  };

  const openDeleteModal = (producto) => {
    setProductoAEliminar(producto);
    setShowDeleteModal(true);
  };

  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
    };
    const handleOffline = () => {
      setIsOffline(true);
    };
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    setIsOffline(!navigator.onLine);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const generarPDFProductos = () => {
    const doc = new jsPDF();

    // Encabezado con fondo
    doc.setFillColor(40, 53, 88); // Azul oscuro
    doc.rect(0, 0, 210, 30, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.text("Reporte de Productos", 105, 20, { align: "center" });

    // Encabezados de tabla
    const encabezados = [["Nombre", "Precio", "Categoría"]];

    // Filas de la tabla
    const filas = paginatedProductos.map((prod) => [
      prod.nombre,
      `C$${parseFloat(prod.precio).toFixed(2)}`,

      prod.categoria,
    ]);

    autoTable(doc, {
      head: encabezados,
      body: filas,
      startY: 40,
      theme: "grid",
      headStyles: { fillColor: [40, 53, 88], textColor: 255 },
      styles: { fontSize: 12 },
    });

    // Pie de página con fecha
    const fecha = new Date().toLocaleDateString();
    doc.setFontSize(10);
    doc.text(`Fecha: ${fecha}`, 15, 285);

    // Guardar
    doc.save(`Productos_${fecha.replace(/\//g, "-")}.pdf`);
  };

  const generarPDFProductosConImagen = () => {
    const doc = new jsPDF();
    let y = 20;

    doc.setFontSize(18);
    doc.setTextColor(40, 53, 88);
    doc.text("Reporte Detallado de Productos", 105, y, { align: "center" });
    y += 10;

    paginatedProductos.forEach((prod, index) => {
      if (y > 260) {
        doc.addPage();
        y = 20;
      }

      // Imagen
      if (prod.imagen) {
        try {
          doc.addImage(prod.imagen, "JPEG", 15, y, 30, 30); // x, y, width, height
        } catch (e) {
          console.warn("Error al agregar imagen del producto:", prod.nombre);
        }
      }

      // Texto
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Nombre: ${prod.nombre}`, 50, y + 5);
      doc.text(`Precio: C$${parseFloat(prod.precio).toFixed(2)}`, 50, y + 15);
      doc.text(`Categoría: ${prod.categoria}`, 50, y + 25);

      y += 40; // espacio entre productos
    });

    const fecha = new Date().toLocaleDateString();
    doc.save(`Detalle_Productos_${fecha.replace(/\//g, "-")}.pdf`);
  };

  const exportarExcelProductos = () => {
    const fecha = new Date().toLocaleDateString().replace(/\//g, "-");
    const nombreArchivo = `Productos_${fecha}.xlsx`;

    // Usamos precio como número real
    const datos = productos.map((prod) => ({
      Nombre: prod.nombre,
      Precio: parseFloat(prod.precio), // sin símbolo
      Categoría: prod.categoria,
    }));

    const hoja = XLSX.utils.json_to_sheet(datos);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, "Productos");

    // Ajustar ancho de columnas automáticamente (opcional)
    const wscols = [{ wch: 20 }, { wch: 10 }, { wch: 25 }];
    hoja["!cols"] = wscols;

    const excelBuffer = XLSX.write(libro, {
      bookType: "xlsx",
      type: "array",
    });

    const archivo = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });
    saveAs(archivo, nombreArchivo);
  };

return (
  <Container className="mt-5">
    <br />
    <h4>Gestión de Productos</h4>

    <CuadroBusquedas
      searchText={searchText}
      handleSearchChange={handleSearchChange}
    />

    <TablaProductos
      openEditModal={openEditModal}
      openDeleteModal={openDeleteModal}
      handleCopy={handleCopy}
      openQRModal={openQRModal}
      productos={paginatedProductos}
      totalItems={productosFiltrados.length}
      itemsPerPage={itemsPerPage}
      currentPage={currentPage}
      setCurrentPage={setCurrentPage}
    />

    {/* Botones de acción movidos aquí */}
    <div className="d-flex flex-wrap gap-2 mt-4">
      <Button className="mb-3" onClick={() => setShowModal(true)}>
        Agregar producto
      </Button>
      <Button className="mb-3 ms-2 btn-success" onClick={generarPDFProductos}>
        Generar PDF
      </Button>
      <Button
        className="mb-3 ms-2 btn-warning"
        onClick={generarPDFProductosConImagen}
      >
        PDF con Imagen
      </Button>
      <Button
        className="mb-3 ms-2 btn-primary"
        onClick={exportarExcelProductos}
      >
        Generar Excel
      </Button>
    </div>

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

    <ModalQR
      show={showQRModal}
      handleClose={handleCloseQRModal}
      qrUrl={selectedUrl}
    />
  </Container>
);

};

export default Productos;
