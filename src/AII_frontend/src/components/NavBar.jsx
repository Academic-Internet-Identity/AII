// NavBar.jsx

import React, { useEffect, useState } from 'react';
import { Navbar, Nav, NavDropdown, Button, Modal } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useConnect, useCanister } from '@connect2ic/react';
import { useUser } from '../UserContext';
import PagarConPlug from './PagarConPlug';
import '../styles/navBarStyles.css'; // Importa estilos personalizados
import logo from '/logo-completo-utma.png';

function NavBar() {
  const { isConnected, disconnect, connect, principal: connectPrincipal } = useConnect();
  const { principal, setPrincipal, setRol, rol, resetUser } = useUser();
  const navigate = useNavigate();
  const [AII_backend] = useCanister('AII_backend');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (isConnected && connectPrincipal) {
      setPrincipal(connectPrincipal);
      const fetchUserRole = async () => {
        try {
          const user = await AII_backend.getMyUser();
          if (user && user.length > 0) {
            const userRole = user[0].rol;
            if (userRole) {
              const roleKey = Object.keys(userRole)[0];
              switch (roleKey) {
                case 'Admin':
                  setRol('Administrador');
                  break;
                case 'Alumno':
                  setRol('Alumno');
                  break;
                case 'Profesor':
                  setRol('Profesor');
                  break;
                case 'Usuario':
                  setRol('Usuario');
                  break;
                case 'Administrativo':
                  setRol('Administrativo');
                  break;
                default:
                  setRol('Desconocido');
              }
            }
          }
        } catch (error) {
          console.error('Error al obtener el rol del usuario:', error);
        }
      };

      fetchUserRole();
    } else {
      resetUser();
    }
  }, [isConnected, connectPrincipal, AII_backend, setPrincipal, setRol, resetUser]);

  const handleLogoClick = () => {
    navigate('/inicio');
  };

  const handleLogout = async () => {
    await disconnect();
    resetUser();
    navigate('/');
  };

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  return (
    <>
      <Navbar bg="dark" variant="dark" expand="lg" className="custom-navbar">
        <Navbar.Brand onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
          <img src={logo} alt="Logo" className="nav-logo" />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mr-auto">
            <NavDropdown title="Menú" id="basic-nav-dropdown">
              {rol === 'Usuario' && (
                <>
                  <NavDropdown.Item as={Link} to="/registro-alumno">Registrar Alumno</NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/registro-docente">Registrar Docente</NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/registro-administrativo">Registrar Administrativo</NavDropdown.Item>
                </>
              )}
              {rol === 'Alumno' && (
                <>
                  <NavDropdown.Item as={Link} to="/mi-horario">Mi Horario</NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/formulario-servicios">Iniciar Trámite</NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/mis-tramites">Mis Trámites</NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/gestionar-archivos">Subir Archivo</NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/mi-perfil">Mi Perfil</NavDropdown.Item>
                </>
              )}
              {rol === 'Profesor' && (
                <>
                  <NavDropdown.Item as={Link} to="/gestionar-calificaciones">Calificaciones</NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/horarios">Horarios</NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/ingles">Inglés</NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/gestionar-archivos">Subir Archivo</NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/mi-perfil">Mi Perfil</NavDropdown.Item>
                </>
              )}
              {rol === 'Administrativo' && (
                <>
                  <NavDropdown title={<span className="alumnos-dropdown">Alumnos</span>} id="alumnos-nav-dropdown" className="submenu-right">
                    <NavDropdown.Item as={Link} to="/ver-alumnos-inscritos">Ver Alumnos</NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="/ver-alumnos-ingresantes">Aprobar Alumnos</NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="/reinscripcion">Reinscripcion</NavDropdown.Item>
                  </NavDropdown>
                  <NavDropdown title={<span className="administrativos-dropdown">Administrativos</span>} id="administrativos-nav-dropdown" className="submenu-right">
                    <NavDropdown.Item as={Link} to="/ver-administrativos">Ver Administrativos</NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="/aprobar-administrativo">Aprobar Administrativo</NavDropdown.Item>
                  </NavDropdown>
                  <NavDropdown title={<span className="docentes-dropdown">Docentes</span>} id="docentes-nav-dropdown" className="submenu-right">
                    <NavDropdown.Item as={Link} to="/ver-docentes">Ver Docentes</NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="/aprobar-docente">Aprobar Docente</NavDropdown.Item>
                  </NavDropdown>
                  <NavDropdown title={<span className="materias-dropdown">Materias</span>} id="materias-nav-dropdown" className="submenu-right">
                    <NavDropdown.Item as={Link} to="/agregar-editar-materia">Agregar/Editar Materia</NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="/listar-materias">Listar Materias</NavDropdown.Item>
                  </NavDropdown>
                  <NavDropdown.Item as={Link} to="/horarios">Horarios</NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/gestionar-grupos">Gestionar Grupos</NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/gestionar-carreras">Gestionar Carreras</NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/ingles">Inglés</NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/ver-tramites">Ver Trámites</NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/gestionar-archivos">Subir Archivo</NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/mi-perfil">Mi Perfil</NavDropdown.Item>
                </>
              )}
            </NavDropdown>
          </Nav>
          <Nav className="ml-auto">
            {isConnected ? (
              <>
                <Nav.Link onClick={handleLogout}>Cerrar Sesión</Nav.Link>
                <Button variant="primary" onClick={handleShowModal} className="ml-2 pagar-button">
                  Pagar
                </Button>
              </>
            ) : (
              <Nav.Link onClick={connect}>Iniciar Sesión</Nav.Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Navbar>

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Realizar Pago</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <PagarConPlug />
        </Modal.Body>
      </Modal>
    </>
  );
}

export default NavBar;