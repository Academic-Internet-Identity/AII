import React, { useState, useEffect } from 'react';
import { useCanister } from '@connect2ic/react';
import { useParams } from 'react-router-dom';
import '../styles/detallesStyles.css';

function DetallesAlumno() {
  const [AII_backend] = useCanister('AII_backend');
  const { principal } = useParams();
  const [alumno, setAlumno] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlumnoDetalles = async () => {
      try {
        const result = await AII_backend.verAlumnos();
        const alumno = result.find(a => a.principalID.toString() === principal);
        setAlumno(alumno);
      } catch (error) {
        console.error('Error al obtener los detalles del alumno:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAlumnoDetalles();
  }, [AII_backend, principal]);

  if (loading) {
    return <p>Cargando...</p>;
  }

  if (!alumno) {
    return <p>No se encontró información del alumno.</p>;
  }

  return (
    <div className="detalles-dashboard">
      <h2 className="dashboard-heading">Detalles del Alumno</h2>
      <div className="dashboard-sections">
        <div className="dashboard-section">
          <h3>Información Personal</h3>
          <p><strong>Nombre:</strong> {alumno.nombre}</p>
          <p><strong>Apellido Paterno:</strong> {alumno.apellidoPaterno}</p>
          <p><strong>Apellido Materno:</strong> {alumno.apellidoMaterno}</p>
          <p><strong>Fecha de Nacimiento:</strong> {alumno.fechaNacimiento}</p>
          <p><strong>Género:</strong> {alumno.genero}</p>
          <p><strong>CURP:</strong> {alumno.curp}</p>
          <p><strong>Principal ID:</strong> {alumno.principalID.toString()}</p>
        </div>
        <div className="dashboard-section">
          <h3>Información de Contacto</h3>
          <p><strong>Email Personal:</strong> {alumno.emailPersonal}</p>
          <p><strong>Email Institucional:</strong> {alumno.emailInstitucional}</p>
          <p><strong>Teléfonos:</strong> {alumno.telefonos.join(', ')}</p>
          <p><strong>Direcciones:</strong> {alumno.direcciones.join(', ')}</p>
        </div>
        <div className="dashboard-section">
          <h3>Información Académica</h3>
          <p><strong>Matrícula:</strong> {alumno.matricula}</p>
          <p><strong>Carrera:</strong> {alumno.carrera}</p>
          <p><strong>Semestre:</strong> {alumno.semestre.toString()}</p>
          <p><strong>Escuelas de Procedencia:</strong> {alumno.escuelasProcedencia.join(', ')}</p>
          <p><strong>Nivel de Inglés:</strong> {alumno.nivelDeIngles}</p>
          <p><strong>Certificación de Inglés:</strong> {alumno.certificacionDeIngles ? 'Sí' : 'No'}</p>
        </div>
        <div className="dashboard-section">
          <h3>Información Médica</h3>
          <p><strong>Tipo Sanguíneo:</strong> {alumno.tipoSanguineo}</p>
          <p><strong>Detalles Médicos:</strong> {alumno.detallesMedicos}</p>
          <p><strong>Número de Seguro Social:</strong> {alumno.numeroSeguroSocial}</p>
        </div>
        <div className="dashboard-section">
          <h3>Otros Detalles</h3>
          <p><strong>Folio CENEVAL:</strong> {alumno.folioCeneval}</p>
          <p><strong>Pertenencia a Etnia Indígena:</strong> {alumno.pertenenciaEtniaIndigena ? 'Sí' : 'No'}</p>
          <p><strong>Habla Lengua Indígena:</strong> {alumno.hablaLenguaIndigena ? 'Sí' : 'No'}</p>
          <p><strong>Vive en Comunidad Indígena:</strong> {alumno.viveComunidadIndigena ? 'Sí' : 'No'}</p>
        </div>
      </div>
    </div>
  );
}

export default DetallesAlumno;