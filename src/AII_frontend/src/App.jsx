import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import ConsultaAlumnos from './components/ConsultaAlumnos';
import CargaAlumnos from './components/CargaAlumnos';
import Inicio from './components/Inicio';
import Login from './components/Login';
import NavBar from './components/NavBar';
import { Connect2ICProvider, useConnect } from '@connect2ic/react';
import { createClient } from '@connect2ic/core';
import { defaultProviders } from '@connect2ic/core/providers';
import './styles/commonStyles.css';

const client = createClient({
  providers: defaultProviders,
  globalProviderConfig: {
    dev: import.meta.env.DEV,
  },
});

function AppRoutes() {
  const { isConnected } = useConnect();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isConnected && location.pathname !== '/') {
      navigate('/');
    }
  }, [isConnected, navigate, location]);

  return (
    <>
      {location.pathname !== '/' && <NavBar />}
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/inicio" element={<Inicio />} />
        <Route path="/consultar" element={<ConsultaAlumnos />} />
        <Route path="/cargar" element={<CargaAlumnos />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Connect2ICProvider client={client}>
      <Router>
        <AppRoutes />
      </Router>
    </Connect2ICProvider>
  );
}

export default App;
