import React, { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  onSnapshot,
  orderBy,
  query,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../database/firebaseconfig";
import { Button, Form, ListGroup, Spinner, Modal } from "react-bootstrap";

const ChatIA = ({ showChatModal, setShowChatModal }) => {
  const [mensaje, setMensaje] = useState("");
  const [mensajes, setMensajes] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [intencion, setIntencion] = useState(null);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);

  const chatCollection = collection(db, "chat");
  const categoriasCollection = collection(db, "categorias");

  useEffect(() => {
    const q = query(chatCollection, orderBy("timestamp", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const mensajesObtenidos = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMensajes(mensajesObtenidos);
    });
    return () => unsubscribe();
  }, []);

  const obtenerCategorias = async () => {
    const snapshot = await getDocs(categoriasCollection);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  };

  const enviarMensaje = async () => {
    if (!mensaje.trim()) return;

    const nuevoMensaje = {
      texto: mensaje,
      emisor: "usuario",
      timestamp: new Date(),
    };

    setCargando(true);
    setMensaje("");

    try {
      await addDoc(chatCollection, nuevoMensaje);
      const respuestaIA = await obtenerRespuestaIA(mensaje);

      const categorias = await obtenerCategorias();

      switch (respuestaIA.intencion) {
        case "listar":
          if (categorias.length === 0) {
            await agregarMensajeIA("No hay categorías registradas.");
          } else {
            const lista = categorias.map((cat, i) => `${i + 1}. ${cat.nombre}: ${cat.descripcion}`).join("\n");
            await agregarMensajeIA(`Categorías disponibles:\n${lista}`);
          }
          break;

        case "crear":
          if (respuestaIA.datos?.nombre && respuestaIA.datos?.descripcion) {
            await addDoc(categoriasCollection, respuestaIA.datos);
            await agregarMensajeIA(`Categoría "${respuestaIA.datos.nombre}" registrada con éxito.`);
          } else {
            await agregarMensajeIA("No se pudo registrar la categoría. Faltan datos válidos.");
          }
          break;

        case "eliminar":
          if (categorias.length === 0) {
            await agregarMensajeIA("No hay categorías registradas para eliminar.");
          } else if (respuestaIA.seleccion) {
            const cat = buscarCategoria(categorias, respuestaIA.seleccion);
            if (cat) {
              await deleteDoc(doc(db, "categorias", cat.id));
              await agregarMensajeIA(`Categoría "${cat.nombre}" eliminada con éxito.`);
            } else {
              await agregarMensajeIA("No se encontró la categoría especificada.");
            }
          } else {
            setIntencion("eliminar");
            const lista = categorias.map((cat, i) => `${i + 1}. ${cat.nombre}: ${cat.descripcion}`).join("\n");
            await agregarMensajeIA(`Selecciona una categoría para eliminar:\n${lista}`);
          }
          break;

        case "actualizar":
          if (categorias.length === 0) {
            await agregarMensajeIA("No hay categorías para actualizar.");
          } else if (respuestaIA.seleccion) {
            const cat = buscarCategoria(categorias, respuestaIA.seleccion);
            if (cat) {
              setCategoriaSeleccionada(cat);
              setIntencion("actualizar");
              await agregarMensajeIA(`Seleccionaste "${cat.nombre}". Proporciona los nuevos datos.`);
            } else {
              await agregarMensajeIA("Categoría no encontrada.");
            }
          } else {
            setIntencion("actualizar");
            const lista = categorias.map((cat, i) => `${i + 1}. ${cat.nombre}: ${cat.descripcion}`).join("\n");
            await agregarMensajeIA(`Selecciona una categoría para actualizar:\n${lista}`);
          }
          break;

        case "seleccionar_categoria":
          if (intencion === "eliminar" || intencion === "actualizar") {
            const cat = buscarCategoria(categorias, mensaje);
            if (cat) {
              if (intencion === "eliminar") {
                await deleteDoc(doc(db, "categorias", cat.id));
                await agregarMensajeIA(`Categoría "${cat.nombre}" eliminada con éxito.`);
              } else if (intencion === "actualizar") {
                setCategoriaSeleccionada(cat);
                await agregarMensajeIA(`Seleccionaste "${cat.nombre}". Proporciona los nuevos datos.`);
              }
              setIntencion(null);
            } else {
              await agregarMensajeIA("Selección inválida. Intenta con un número o nombre válido.");
            }
          }
          break;

        case "actualizar_datos":
          if (categoriaSeleccionada && intencion === "actualizar") {
            const ref = doc(db, "categorias", categoriaSeleccionada.id);
            await updateDoc(ref, {
              nombre: respuestaIA.datos.nombre || categoriaSeleccionada.nombre,
              descripcion: respuestaIA.datos.descripcion || categoriaSeleccionada.descripcion,
            });
            await agregarMensajeIA(`Categoría "${categoriaSeleccionada.nombre}" actualizada con éxito.`);
            setIntencion(null);
            setCategoriaSeleccionada(null);
          }
          break;

        case "desconocida":
          await agregarMensajeIA("No entendí tu solicitud. Usa crear, listar, actualizar o eliminar.");
          break;

        case "error":
          await agregarMensajeIA(respuestaIA.mensaje);
          break;

        default:
          await agregarMensajeIA("Ocurrió un problema inesperado.");
      }
    } catch (error) {
      console.error("Error al enviar mensaje:", error);
      await agregarMensajeIA("Ocurrió un error. Intenta más tarde.");
    } finally {
      setCargando(false);
    }
  };

  const agregarMensajeIA = (texto) =>
    addDoc(chatCollection, {
      texto,
      emisor: "ia",
      timestamp: new Date(),
    });

  const buscarCategoria = (categorias, seleccion) => {
    return categorias.find(
      (cat, i) =>
        cat.nombre.toLowerCase() === seleccion.toLowerCase() ||
        parseInt(seleccion) === i + 1
    );
  };

  const obtenerRespuestaIA = async (promptUsuario) => {
    const apiKey = import.meta.env.VITE_GOOGLE_AI_API_KEY;
    const prompt = `
      Analiza el mensaje del usuario: "${promptUsuario}".
      Determina la intención del usuario respecto a operaciones con categorías...
      [aquí sigue el prompt completo como en tu código original]
    `;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              response_mime_type: "application/json",
            },
          }),
        }
      );

      if (response.status === 429) {
        return { intencion: "error", mensaje: "Has alcanzado el límite de solicitudes. Intenta de nuevo más tarde." };
      }

      const data = await response.json();
      const texto = data.candidates?.[0]?.content?.parts?.[0]?.text;
      return JSON.parse(texto || "{}");
    } catch (error) {
      console.error("Error al obtener respuesta de la IA:", error);
      return { intencion: "error", mensaje: "No se pudo conectar con la IA." };
    }
  };

  return (
    <Modal show={showChatModal} onHide={() => setShowChatModal(false)} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Chat con IA</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <ListGroup style={{ maxHeight: "300px", overflowY: "auto" }}>
          {mensajes.map((msg) => (
            <ListGroup.Item key={msg.id} variant={msg.emisor === "ia" ? "light" : "primary"}>
              <strong>{msg.emisor === "ia" ? "IA" : "Tú"}:</strong> {msg.texto}
            </ListGroup.Item>
          ))}
        </ListGroup>
        <Form className="mt-3" onSubmit={(e) => { e.preventDefault(); enviarMensaje(); }}>
          <Form.Control
            type="text"
            placeholder="Escribe tu mensaje..."
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            disabled={cargando}
          />
          <Button className="mt-2" type="submit" disabled={cargando}>
            {cargando ? <Spinner size="sm" animation="border" /> : "Enviar"}
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default ChatIA;
