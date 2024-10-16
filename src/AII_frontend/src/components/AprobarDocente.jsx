// Archivo: src/components/AprobarDocente.jsx
import React, { useState, useEffect } from 'react';
import { useCanister } from '@connect2ic/react';
import { Principal } from '@dfinity/principal';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/aprobarDocenteStyles.css';

function AprobarDocente() {
  const [AII_backend] = useCanister('AII_backend');
  const [docentesIngresantes, setDocentesIngresantes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDocentesIngresantes = async () => {
    try {
      const result = await AII_backend.verDocentesIngresantes();
      setDocentesIngresantes(result);
      toast.success('Docentes ingresantes obtenidos correctamente.');
    } catch (error) {
      console.error('Error al obtener los docentes ingresantes:', error);
      toast.error('Error al obtener los docentes ingresantes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocentesIngresantes();
  }, [AII_backend]);

  const aprobarDocente = async (principalId) => {
    try {
      const principal = Principal.fromText(principalId);
      await AII_backend.aprobarRegistroDeDocente(principal);
      toast.success('Docente aprobado exitosamente.');
      fetchDocentesIngresantes();
    } catch (error) {
      console.error('Error al aprobar el registro del docente:', error);
      toast.error('Error al aprobar el registro del docente.');
    }
  };

  return (
    <div className="aprobar-docente-container">
      <h2 className="table-heading">Aprobar Docentes</h2>
      {loading ? (
        <p>Cargando...</p>
      ) : (
        <table className="docentes-table">
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
            {docentesIngresantes.map(([principal, docente]) => (
              <tr key={principal.toString()}>
                <td>{principal.toString()}</td>
                <td>{docente.nombre}</td>
                <td>{docente.apellidoPaterno}</td>
                <td>{docente.apellidoMaterno}</td>
                <td>{docente.curp}</td>
                <td>{docente.emailPersonal}</td>
                <td>
                  <button onClick={() => aprobarDocente(principal.toString())} className="approve-button">
                    Aprobar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <ToastContainer />
    </div>
  );
}

export default AprobarDocente;
