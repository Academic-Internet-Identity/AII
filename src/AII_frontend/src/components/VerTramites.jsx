import React, { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useCanister } from '@connect2ic/react';
import '../styles/verTramitesStyles.css';

const VerMisTramites = () => {
  const [AII_backend] = useCanister('AII_backend');
  const [misTramites, setMisTramites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tramiteSeleccionado, setTramiteSeleccionado] = useState(null);
  const [showInfoModal, setShowInfoModal] = useState(false);

  // Obtener los trámites del alumno sin pedir la matrícula
  useEffect(() => {
    const obtenerMisTramites = async () => {
      try {
        console.log('Obteniendo mis trámites...');
        const response = await AII_backend.VerMisTramites(); // Ya no se necesita pasar la matrícula
        console.log('Mis trámites obtenidos:', response);
        setMisTramites(response);
      } catch (error) {
        toast.error('Error al cargar tus trámites.');
        console.error('Error al obtener trámites:', error);
      } finally {
        setLoading(false);
      }
    };

    obtenerMisTramites();
  }, [AII_backend]);

  const handleShowInfo = (tramite) => {
    setTramiteSeleccionado(tramite);
    setShowInfoModal(true);
  };

  const handleCloseModal = () => {
    setShowInfoModal(false);
    setTramiteSeleccionado(null);
  };

  return (
    <div className="ver-tramites-container">
      <h2 className="table-heading">Mis Trámites</h2>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <>
          {misTramites.length === 0 ? (
            <p>No tienes trámites registrados.</p>
          ) : (
            <table className="tramites-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Correo Electrónico</th>
                  <th>Nombre</th>
                  <th>Carrera</th>
                  <th>Grado</th>
                  <th>Tipo de Solicitud</th>
                  <th>Estado</th>
                  <th>Comentarios</th>
                </tr>
              </thead>
              <tbody>
                {misTramites.map((tramite) => (
                  <tr key={tramite.id}>
                    <td>{tramite.id}</td>
                    <td>{tramite.correoElectronico}</td>
                    <td>{tramite.nombre}</td>
                    <td>{tramite.carrera}</td>
                    <td>{tramite.grado.toString()}</td>
                    <td>{tramite.tipoSolicitud}</td>
                    <td>{Object.keys(tramite.estado)[0]}</td>
                    <td>
                      <button
                        className="info-button"
                        onClick={() => handleShowInfo(tramite)}
                      >
                        Ver más
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}

      {/* Modal para mostrar información adicional */}
      {showInfoModal && (
        <div className="info-modal-overlay">
          <div className="info-modal-content">
            <h3>Información adicional</h3>
            <p>
              <strong>Trámite solicitado:</strong> {tramiteSeleccionado?.tramite}
            </p>
            <p>
              <strong>Comentarios adicionales:</strong>{' '}
              {tramiteSeleccionado?.comentarios || 'No hay comentarios adicionales.'}
            </p>
            <button className="close-button" onClick={handleCloseModal}>
              Cerrar
            </button>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
};

export default VerMisTramites;