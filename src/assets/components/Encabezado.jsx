import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import { NavDropdown } from "react-bootstrap";
import Navbar from "react-bootstrap/Navbar";
import Offcanvas from "react-bootstrap/Offcanvas";
import { useAuth } from "../database/authcontext";
import logo from "../../assets/components/react.svg";
import 'bootstrap-icons/font/bootstrap-icons.css';
import "../App.css";
import { useTranslation } from 'react-i18next';


const menuItems = [
  { path: "/inicio", icon: "bi-house-door-fill", label: "menu.inicio" },
  { path: "/categorias", label: "menu.categorias" },
  { path: "/productos", label: "menu.productos" },
  { path: "/catalogo", label: "menu.catalogo" },
  { path: "/libros", label: "menu.libros" },
  { path: "/clima", icon: "bi-cloud-sun-fill", label: "menu.clima" },
  { path: "/pronunciacion", label: "menu.pronunciacion" },
  { path: "/empleados", label: "menu.empleados" },
  { path: "/estadisticas", label: "menu.estadisticas" },
];

const Encabezado = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();

  const handleNavigate = (path) => {
    navigate(path);
    setIsCollapsed(false);
  };

  const handleLogout = async () => {
    try {
      setIsCollapsed(false);
      localStorage.removeItem("adminEmail");
      localStorage.removeItem("adminPassword");
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const cambiarIdioma = (lang) => i18n.changeLanguage(lang);

  return (
    <Navbar expand="sm" fixed="top" className="color-navbar">
      <Container>
        <Navbar.Brand
          onClick={() => handleNavigate("/inicio")}
          className="text-white"
          style={{ cursor: "pointer" }}
        >
          <img
            alt="Logo"
            src={logo}
            width="30"
            height="30"
            className="d-inline-block align-top"
          />{" "}
          Ferretería
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="offcanvasNavbar" onClick={() => setIsCollapsed(!isCollapsed)} />
        <Navbar.Offcanvas
          id="offcanvasNavbar"
          placement="end"
          show={isCollapsed}
          onHide={() => setIsCollapsed(false)}
        >
          <Offcanvas.Header closeButton>
            <Offcanvas.Title className="color-texto-marca">
              {t("menu.titulo") || "Menú"}
            </Offcanvas.Title>
          </Offcanvas.Header>

          <Offcanvas.Body>
            <Nav className="justify-content-end flex-grow-1 pe-3">
              {menuItems.map(({ path, icon, label }) => (
                <Nav.Link
                  key={path}
                  onClick={() => handleNavigate(path)}
                  className={isCollapsed ? "color-texto-marca" : "text-white"}
                >
                  {isCollapsed && icon && <i className={`${icon} me-2`}></i>}
                  {t(label)}
                </Nav.Link>
              ))}

              <NavDropdown
                title={
                  <span>
                    <i className="bi-translate me-2"></i>
                    {isCollapsed && <span>{t('menu.idioma')}</span>}
                  </span>
                }
                id="language-dropdown"
                className={isCollapsed ? "color-texto-marca" : "text-white"}
              >
                <NavDropdown.Item onClick={() => cambiarIdioma('es')} className="text-black">
                  {t('menu.español')}
                </NavDropdown.Item>
                <NavDropdown.Item onClick={() => cambiarIdioma('en')} className="text-black">
                  {t('menu.ingles')}
                </NavDropdown.Item>
              </NavDropdown>

              {isLoggedIn ? (
                <Nav.Link onClick={handleLogout} className={isCollapsed ? "text-black" : "text-white"}>
                  {t('menu.cerrarSesion')}
                </Nav.Link>
              ) : location.pathname === "/" ? (
                <Nav.Link onClick={() => handleNavigate("/")} className={isCollapsed ? "text-black" : "text-white"}>
                  {t('menu.iniciarSesion')}
                </Nav.Link>
              ) : null}
            </Nav>
          </Offcanvas.Body>
        </Navbar.Offcanvas>
      </Container>
    </Navbar>
  );
};

export default Encabezado;