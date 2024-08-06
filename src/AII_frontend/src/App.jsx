import React, { useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Inicio from './components/Inicio';
import Login from './components/Login';
import NavBar from './components/NavBar';
import RegistroAlumno from './components/RegistroAlumno';
import RegistroAdministrativo from './components/RegistroAdministrativo';
import RegistroDocente from './components/RegistroDocente';
import VerAlumnosIngresantes from './components/VerAlumnosIngresantes';
import VerAlumnosInscritos from './components/VerAlumnosInscritos';
import VerAdministrativos from './components/VerAdministrativos';
import VerDocentes from './components/VerDocentes';
import AprobarAdministrativo from './components/AprobarAdministrativo';
import AprobarDocente from './components/AprobarDocente';
import DetallesAlumno from './components/DetallesAlumno';
import DetallesAdministrativo from './components/DetallesAdministrativo';
import DetallesDocente from './components/DetallesDocente';
import { Connect2ICProvider, useConnect, useCanister } from '@connect2ic/react';
import { createClient } from '@connect2ic/core';
import { InternetIdentity } from '@connect2ic/core/providers/internet-identity';
import './styles/commonStyles.css';
import { UserProvider, useUser } from './UserContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import * as AII_backend from "declarations/AII_backend";
import ConsultaAlumnos from './components/ConsultaAlumnos';

const client = createClient({
  canisters: {
    AII_backend,
  },
  providers: [
    //new InternetIdentity({ providerUrl: "http://localhost:8000/?canisterId=rdmx6-jaaaa-aaaaa-aaadq-cai" })
    new InternetIdentity({ providerUrl: "https://identity.ic0.app" })
  ],
  globalProviderConfig: {
    dev: false,
  },
});

function AppRoutes() {
  const { isConnected, principal } = useConnect();
  const { setPrincipal, setRol } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [AII_backend] = useCanister('AII_backend');
  const hasCheckedUser = useRef(false);

  useEffect(() => {
    const checkUser = async () => {
      if (isConnected && principal && !hasCheckedUser.current) {
        console.log('Principal:', principal);
        setPrincipal(principal);
        hasCheckedUser.current = true;
        try {
          const user = await AII_backend.getMyUser();
          console.log('Respuesta de getMyUser:', user);
          if (user && user.length > 0) {
            const userRole = user[0]?.rol;
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
            navigate('/inicio');
          } else {
            console.log('Usuario no registrado. Favor de registrarse.');
          }
        } catch (error) {
          console.error('Error al verificar si el usuario está registrado:', error);
        }
      } else if (!isConnected && location.pathname !== '/') {
        navigate('/');
      }
    };

    checkUser();
  }, [isConnected, principal, setPrincipal, navigate, location, AII_backend, setRol]);

  return (
    <>
      {location.pathname !== '/' && <NavBar />}
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/inicio" element={<Inicio />} />
        <Route path="/registro-alumno" element={<RegistroAlumno />} />
        <Route path="/registro-administrativo" element={<RegistroAdministrativo />} />
        <Route path="/registro-docente" element={<RegistroDocente />} />
        <Route path="/ver-alumnos-ingresantes" element={<VerAlumnosIngresantes />} />
        <Route path="/ver-alumnos-inscritos" element={<VerAlumnosInscritos />} />
        <Route path="/ver-administrativos" element={<VerAdministrativos />} />
        <Route path="/ver-docentes" element={<VerDocentes />} />
        <Route path="/aprobar-administrativo" element={<AprobarAdministrativo />} />
        <Route path="/aprobar-docente" element={<AprobarDocente />} />
        <Route path="/detalles-alumno/:principal" element={<DetallesAlumno />} />
        <Route path="/detalles-administrativo/:principal" element={<DetallesAdministrativo />} />
        <Route path="/detalles-docente/:principal" element={<DetallesDocente />} />
        <Route path="/consulta-alumnos" element={<ConsultaAlumnos />} />
        
      </Routes>
    </>
  );
}

function App() {
  return (
    <UserProvider>
      <Connect2ICProvider client={client}>
        <Router>
          <AppRoutes />
        </Router>
      </Connect2ICProvider>
    </UserProvider>
  );
}

export default App;