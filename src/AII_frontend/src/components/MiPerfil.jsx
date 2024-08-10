import React, { useState, useEffect } from 'react';
import { useCanister } from '@connect2ic/react';
import { useUser } from '../UserContext';
import '../styles/detallesStyles.css';

function MiPerfil() {
  const { rol } = useUser(); // Accede al rol del usuario desde el contexto
  const [AII_backend] = useCanister('AII_backend');
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPerfil = async () => {
      try {
        let result;
        switch (rol) {
          case 'Alumno':
            result = await AII_backend.getMyAlumno();
            break;
          case 'Profesor':
            result = await AII_backend.getMyDocente();
            break;
          case 'Administrativo':
            result = await AII_backend.getMyAdministrativo();
            break;
          default:
            setError('Rol no reconocido o sin perfil asociado.');
            return;
        }

        if (result && result.length > 0) {
          setPerfil(result[0]); // Extrae el primer (y único) objeto del array
          console.log("Perfil obtenido:", result[0]);
        } else {
          setError('No se encontró información del perfil.');
        }
      } catch (err) {
        console.error('Error al obtener el perfil:', err);
        setError('Error al obtener el perfil.');
      } finally {
        setLoading(false);
      }
    };

    fetchPerfil();
  }, [AII_backend, rol]);

  if (loading) {
    return <p>Cargando perfil...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (!perfil) {
    return <p>No se encontró información del perfil.</p>;
  }

  return (
    <div className="detalles-dashboard">
      <h2 className="dashboard-heading">Mi Perfil</h2>
      <div className="dashboard-sections">
        <div className="dashboard-section">
          <h3>Información Personal</h3>
          <p><strong>Nombre:</strong> {perfil.nombre}</p>
          <p><strong>Apellido Paterno:</strong> {perfil.apellidoPaterno}</p>
          <p><strong>Apellido Materno:</strong> {perfil.apellidoMaterno}</p>
          <p><strong>Fecha de Nacimiento:</strong> {perfil.fechaNacimiento}</p>
          <p><strong>Género:</strong> {perfil.genero}</p>
          <p><strong>CURP:</strong> {perfil.curp}</p>
          <p><strong>Principal:</strong> {perfil.principalID.toString()}</p>
        </div>
        <div className="dashboard-section">
          <h3>Información de Contacto</h3>
          <p><strong>Email Personal:</strong> {perfil.emailPersonal}</p>
          <p><strong>Teléfonos:</strong> {perfil.telefonos.join(', ')}</p>
          <p><strong>Direcciones:</strong> {perfil.direcciones.join(', ')}</p>
        </div>
        {rol === 'Alumno' && (
          <div className="dashboard-section">
            <h3>Información Académica</h3>
            <p><strong>Matrícula:</strong> {perfil.matricula}</p>
            <p><strong>Carrera:</strong> {perfil.carrera}</p>
            <p><strong>Semestre:</strong> {perfil.semestre.toString()}</p>
            <p><strong>Escuelas de Procedencia:</strong> {perfil.escuelasProcedencia.join(', ')}</p>
          </div>
        )}
        {(rol === 'Profesor' || rol === 'Administrativo') && (
          <div className="dashboard-section">
            <h3>Información Profesional</h3>
            <p><strong>Número de Seguro Social:</strong> {perfil.numeroSeguroSocial}</p>
            <p><strong>Cédula Profesional:</strong> {perfil.cedulaProfesional}</p>
            {rol === 'Profesor' && (
              <p><strong>Materias:</strong> {perfil.materias.join(', ')}</p>
            )}
          </div>
        )}
        <div className="dashboard-section">
          <h3>Información Médica</h3>
          <p><strong>Tipo Sanguíneo:</strong> {perfil.tipoSanguineo}</p>
          <p><strong>Detalles Médicos:</strong> {perfil.detallesMedicos}</p>
        </div>
      </div>
    </div>
  );
}

export default MiPerfil;