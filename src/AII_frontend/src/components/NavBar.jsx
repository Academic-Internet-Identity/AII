import React, { useEffect } from 'react';
import { Navbar, Nav, NavDropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useConnect, useCanister } from '@connect2ic/react';
import { useUser } from '../UserContext';
import '../styles/navBarStyles.css';
import logo from '/logo-completo-utma.png';

function NavBar() {
  const { isConnected, disconnect, connect, principal: connectPrincipal } = useConnect();
  const { principal, setPrincipal, setRol, rol, resetUser } = useUser();
  const navigate = useNavigate();
  const [AII_backend] = useCanister('AII_backend');

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
      resetUser(); // Resetea el estado cuando se desconecta
    }
  }, [isConnected, connectPrincipal, AII_backend, setPrincipal, setRol, resetUser]);

  const handleLogoClick = () => {
    navigate('/inicio');
  };

  const handleLogout = async () => {
    await disconnect();
    resetUser(); // Resetea el estado del usuario al desconectarse
    navigate('/');
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg">
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
                <NavDropdown.Item as={Link} to="/horarios">Horarios</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/mi-perfil">Mi Perfil</NavDropdown.Item>
              </>
            )}
            {rol === 'Profesor' && (
              <>
                <NavDropdown.Item as={Link} to="/horarios">Horarios</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/mi-perfil">Mi Perfil</NavDropdown.Item>
              </>
            )}
            {rol === 'Administrativo' && (
              <>
                <NavDropdown title={<span className="alumnos-dropdown">Alumnos</span>} id="alumnos-nav-dropdown" className="submenu-right">
                  <NavDropdown.Item as={Link} to="/ver-alumnos-inscritos">Ver Alumnos</NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/ver-alumnos-ingresantes">Aprobar Alumnos</NavDropdown.Item>
                </NavDropdown>
                <NavDropdown title={<span className="administrativos-dropdown">Administrativos</span>} id="administrativos-nav-dropdown" className="submenu-right">
                  <NavDropdown.Item as={Link} to="/ver-administrativos">Ver Administrativos</NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/aprobar-administrativo">Aprobar Administrativo</NavDropdown.Item>
                </NavDropdown>
                <NavDropdown title={<span className="docentes-dropdown">Docentes</span>} id="docentes-nav-dropdown" className="submenu-right">
                  <NavDropdown.Item as={Link} to="/ver-docentes">Ver Docentes</NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/aprobar-docente">Aprobar Docente</NavDropdown.Item>
                </NavDropdown>
                <NavDropdown.Item as={Link} to="/agregar-materia">Agregar Materia</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/listar-materias">Listar Materias</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/gestionar-grupos">Gestionar Grupos</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/mi-perfil">Mi Perfil</NavDropdown.Item>
              </>
            )}
          </NavDropdown>
        </Nav>
        <Nav>
          {isConnected ? (
            <Nav.Link onClick={handleLogout}>Cerrar Sesión</Nav.Link>
          ) : (
            <Nav.Link onClick={connect}>Iniciar Sesión</Nav.Link>
          )}
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
}

export default NavBar;