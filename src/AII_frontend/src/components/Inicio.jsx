// Archivo: src/components/Inicio.jsx

import React, { useEffect, useState } from 'react';
import { useUser } from '../UserContext';
import { useCanister } from '@connect2ic/react';
import { useNavigate } from 'react-router-dom';
import '../styles/inicioStyles.css';
import UploadFile from './UploadFile';
import PagarConPlug from './PagarConPlug';

function Inicio() {
  const { principal } = useUser();
  const [AII_backend] = useCanister('AII_backend');
  const [rol, setRol] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Principal in Inicio:', principal);
    const fetchUserRole = async () => {
      try {
        const user = await AII_backend.getMyUser();
        if (user) {
          console.log('User data:', user);
          const userRole = user[0]?.rol;
          if (userRole) {
            const roleKey = Object.keys(userRole)[0]; // Obtener la clave de la variante de rol
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

    if (principal) {
      fetchUserRole();
    }
  }, [principal, AII_backend]);

  const handleConsultaAlumnosClick = () => {
    navigate('/consulta-alumnos');
  };

  return (
    <div className="main-content">
      <h1>Bienvenidos a la Gestión de Alumnos</h1>
      {principal ? (
        <>
          <p className="principal-text">Principal: {principal}</p>
          <p className="rol-text">Rol: {rol}</p>
          <button onClick={handleConsultaAlumnosClick} className="consulta-alumnos-button">
            Consultar Alumnos HTTP outcall
          </button>
        </>
      ) : (
        <p className="principal-text">No se ha encontrado el principal</p>
      )}
      <UploadFile />
    </div>
  );
}

export default Inicio;