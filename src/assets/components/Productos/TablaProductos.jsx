import React, { useState } from "react";
import { Table, Button, Image } from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";
import Paginacion from "../Ordenamiento/Paginacion";

const TablaProductos = ({ productos, openEditModal, openDeleteModal }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Productos por página
  const totalItems = productos.length;

  // Calcular productos paginados
  const paginatedProductos = productos.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Imagen</th>
            <th>Nombre</th>
            <th>Precio</th>
            <th>Categoría</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {paginatedProductos.map((producto) => (
            <tr key={producto.id}>
              <td>
                {producto.imagen && (
                  <Image src={producto.imagen} width="50" height="50" />
                )}
              </td>
              <td>{producto.nombre}</td>
              <td>C${producto.precio}</td>
              <td>{producto.categoria}</td>
              <td>
                <Button
                  variant="outline-warning"
                  size="sm"
                  className="me-2"
                  onClick={() => openEditModal(producto)}
                >
                  <i className="bi bi-pencil"></i>
                </Button>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => openDeleteModal(producto)}
                >
                  <i className="bi bi-trash"></i>
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Paginacion
        itemsPerPage={itemsPerPage}
        totalItems={totalItems}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />
    </>
  );
};

export default TablaProductos;
