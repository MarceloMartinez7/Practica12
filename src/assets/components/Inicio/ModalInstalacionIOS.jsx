import React from "react";
import { Modal, Button, Image } from "react-bootstrap";


const ModalInstalacionIOS = ({ mostrar, cerrar }) => {
  return (
    <Modal show={mostrar} onHide={cerrar} centered>
      <Modal.Header closeButton>
        <Modal.Title>Cómo instalar la app en iPhone</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Sigue estos pasos para agregar la app a tu pantalla de inicio:</p>
        <ul>
          <li>Abre esta página en Safari.</li>
          <li>Presiona el botón de compartir (<i className="bi bi-box-arrow-up"></i>).</li>
          <li>Selecciona "Agregar a pantalla de inicio".</li>
          <li>Confirma el nombre y presiona "Agregar".</li>
        </ul>
        
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={cerrar}>
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalInstalacionIOS;