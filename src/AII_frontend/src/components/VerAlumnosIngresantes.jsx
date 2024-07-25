import React, { useState, useEffect } from 'react';
import { useCanister } from '@connect2ic/react';
import { Principal } from '@dfinity/principal'; // Importa Principal
import '../styles/verAlumnosIngresantesStyles.css';

function VerAlumnosIngresantes() {
  const [AII_backend] = useCanister('AII_backend');
  const [alumnosIngresantes, setAlumnosIngresantes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlumnosIngresantes = async () => {
      try {
        const result = await AII_backend.verAlumnosIngresantes();
        setAlumnosIngresantes(result);
      } catch (error) {
        console.error('Error al obtener los alumnos ingresantes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAlumnosIngresantes();
  }, [AII_backend]);

  const aprobarAlumno = async (principalId) => {
    try {
      const principal = Principal.fromText(principalId);
      const response = await AII_backend.aprobarRegistroDeAlumno(principal);
      console.log(response);
    } catch (error) {
      console.error('Error al aprobar el registro del alumno:', error);
    }
  };

  return (
    <div className="ver-alumnos-ingresantes-container">
      <h2>Alumnos Ingresantes</h2>
      {loading ? (
        <p>Cargando...</p>
      ) : (
        <table className="alumnos-table">
          <thead>
            <tr>
              <th>Principal</th>
              <th>Nombre</th>
              <th>Apellido Paterno</th>
              <th>Apellido Materno</th>
              <th>CURP</th>
              <th>Email Personal</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {alumnosIngresantes.map(([principal, alumno]) => (
              <tr key={principal.toString()}>
                <td>{principal.toString()}</td>
                <td>{alumno.nombre}</td>
                <td>{alumno.apellidoPaterno}</td>
                <td>{alumno.apellidoMaterno}</td>
                <td>{alumno.curp}</td>
                <td>{alumno.emailPersonal}</td>
                <td>
                  <button onClick={() => aprobarAlumno(principal.toString())} className="approve-button">
                    Aprobar
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

export default VerAlumnosIngresantes;