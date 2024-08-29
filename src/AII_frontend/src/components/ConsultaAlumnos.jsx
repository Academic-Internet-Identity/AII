// Archivo: src/components/ConsultaAlumnos.jsx

import React, { useState, useEffect } from 'react';
import { useCanister } from '@connect2ic/react';
import '../styles/consultaAlumnosStyles.css';

function ConsultaAlumnos() {
  const [alumnos, setAlumnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [AII_backend] = useCanister('AII_backend');

  useEffect(() => {
    const fetchAlumnosData = async () => {
      try {
        const response = await AII_backend.fetchAlumnosData();
        const data = JSON.parse(response);
        if (data && Array.isArray(data.alumnos)) {
          setAlumnos(data.alumnos);
        } else {
          console.error('El formato de los datos no es el esperado:', data);
        }
      } catch (error) {
        setError(error);
        console.error('Error al obtener los datos de los alumnos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAlumnosData();
  }, [AII_backend]);

  if (loading) return <p>Cargando datos de alumnos...</p>;
  if (error) return <p>Ocurrió un error al cargar los datos: {error.message}</p>;

  return (
    <div className="alumnos-table-container">
      <h1 className="table-heading">Listado de Alumnos</h1>
      <table className="alumnos-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Apellido Paterno</th>
            <th>Apellido Materno</th>
            <th>Carrera</th>
            <th>Semestre</th>
            <th>Fecha de Nacimiento</th>
          </tr>
        </thead>
        <tbody>
          {alumnos.map(alumno => (
            <tr key={alumno.id}>
              <td>{alumno.id}</td>
              <td>{alumno.nombre}</td>
              <td>{alumno.apellido_paterno}</td>
              <td>{alumno.apellido_materno}</td>
              <td>{alumno.carrera}</td>
              <td>{alumno.semestre}</td>
              <td>{alumno.fecha_nacimiento}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ConsultaAlumnos;