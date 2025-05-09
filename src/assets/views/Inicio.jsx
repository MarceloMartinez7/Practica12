import React, { useState, useEffect } from 'react';
import { Button, Container } from 'react-bootstrap';
import ModalInstalacionIOS from '../components/Inicio/ModalInstalacionIOS'; // Asegúrate de tener este componente

const Inicio = () => {
  const [solicitudInstalacion, setSolicitudInstalacion] = useState(null);
  const [mostrarBotonInstalacion, setMostrarBotonInstalacion] = useState(false);
  const [esDispositivoIOS, setEsDispositivoIOS] = useState(false);
  const [mostrarModalInstrucciones, setMostrarModalInstrucciones] = useState(false);

  // Detectar si el dispositivo es iOS
  useEffect(() => {
    const esIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setEsDispositivoIOS(esIOS);
  }, []);

  // Escuchar evento beforeinstallprompt
  useEffect(() => {
    const manejarBeforeInstallPrompt = (evento) => {
      evento.preventDefault();
      setSolicitudInstalacion(evento);
      setMostrarBotonInstalacion(true);
    };

    window.addEventListener('beforeinstallprompt', manejarBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', manejarBeforeInstallPrompt);
    };
  }, []);

  const instalarPWA = async () => {
    if (!solicitudInstalacion) return;
    try {
      await solicitudInstalacion.prompt();
      const { outcome } = await solicitudInstalacion.userChoice;
      console.log(outcome === 'accepted' ? 'Instalación aceptada' : 'Instalación rechazada');
    } catch (error) {
      console.error('Error al intentar instalar la PWA:', error);
    } finally {
      setSolicitudInstalacion(null);
      setMostrarBotonInstalacion(false);
    }
  };

  return (
    <Container className="text-center my-5">
      <h1>¡Bienvenido a Ferretería El Tornillo Feliz!</h1>
      <p>Tu lugar de confianza para herramientas, materiales y mucho más.</p>

      {!esDispositivoIOS && mostrarBotonInstalacion && (
        <div className="my-4">
          <Button className="sombra" variant="primary" onClick={instalarPWA}>
            Instalar app El Tornillo Feliz <i className="bi bi-download"></i>
          </Button>
        </div>
      )}

      {esDispositivoIOS && (
        <div className="my-4">
          <Button className="sombra" variant="primary" onClick={() => setMostrarModalInstrucciones(true)}>
            Cómo instalar en iPhone <i className="bi bi-phone"></i>
          </Button>
        </div>
      )}

      <ModalInstalacionIOS
        mostrar={mostrarModalInstrucciones}
        cerrar={() => setMostrarModalInstrucciones(false)}
      />
    </Container>
  );
};

export default Inicio;
