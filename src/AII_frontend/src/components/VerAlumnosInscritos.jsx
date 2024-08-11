import React, { useState, useEffect } from 'react';
import { useCanister } from '@connect2ic/react';
import { useNavigate } from 'react-router-dom';
import '../styles/verAlumnosInscritosStyles.css';

function VerAlumnosInscritos() {
  const [AII_backend] = useCanister('AII_backend');
  const [alumnosInscritos, setAlumnosInscritos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAlumnosInscritos = async () => {
      try {
        const result = await AII_backend.verAlumnos();
        setAlumnosInscritos(result);
      } catch (error) {
        console.error('Error al obtener los alumnos inscritos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAlumnosInscritos();
  }, [AII_backend]);

  const handleVerDetalles = (principal) => {
    navigate(`/detalles-alumno/${principal}`);
  };

  return (
    <div className="ver-alumnos-inscritos-container">
      <h2 className="table-heading">Alumnos Inscritos</h2>
      {loading ? (
        <p>Cargando...</p>
      ) : (
        <table className="alumnos-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Apellido Paterno</th>
              <th>Apellido Materno</th>
              <th>Matrícula</th>
              <th>Email Institucional</th>
              <th>Carrera</th>
              <th>Semestre</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {alumnosInscritos.map(alumno => (
              <tr key={alumno.principalID.toString()}>
                <td>{alumno.nombre}</td>
                <td>{alumno.apellidoPaterno}</td>
                <td>{alumno.apellidoMaterno}</td>
                <td>{alumno.matricula}</td>
                <td>{alumno.emailInstitucional}</td>
                <td>{alumno.carrera}</td>
                <td>{alumno.semestre.toString()}</td>
                <td>
                  <button onClick={() => handleVerDetalles(alumno.principalID.toString())} className="details-button">
                    Ver Detalles
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default VerAlumnosInscritos;