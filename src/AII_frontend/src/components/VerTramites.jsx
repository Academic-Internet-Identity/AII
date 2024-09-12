import React, { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/verTramitesStyles.css';

const VerTramites = () => {
  const [tramites, setTramites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tramiteSeleccionado, setTramiteSeleccionado] = useState(null);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [estadoTramite, setEstadoTramite] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [tramiteParaModificar, setTramiteParaModificar] = useState(null);

  useEffect(() => {
    const obtenerTramites = async () => {
      try {
        // Simulación de respuesta de back
        const response = [
          {
            id: 1,
            nombre: 'Juan Pérez',
            matricula: '21010400',
            carrera: 'INGENIERÍA EN DESARROLLO Y GESTIÓN DE SOFTWARE (IDGS)',
            grado: '4',
            tipoTramite: 'Constancia Simple',
            estado: 'Pendiente',
            tramiteSolicitado: 'Visa o Pasaporte',
            comentarios: 'Necesito este documento para tramitar mi visa.',
          },
          {
            id: 2,
            nombre: 'Ana Gómez',
            matricula: '21010401',
            carrera: 'TSU EN NANOTECNOLOGÍA AREA MATERIALES (NANO)',
            grado: '3',
            tipoTramite: 'Historial Académico',
            estado: 'En proceso',
            tramiteSolicitado: 'Motivos personales',
            comentarios: '',
          },
        ];
        setTramites(response);
      } catch (error) {
        toast.error('Error al cargar los trámites');
      } finally {
        setLoading(false);
      }
    };

    obtenerTramites();
  }, []);

  const handleShowInfo = (tramite) => {
    setTramiteSeleccionado(tramite);
    setShowInfoModal(true);
  };

  const handleCloseModal = () => {
    setShowInfoModal(false);
    setTramiteSeleccionado(null);
  };

  const handleEstadoChange = (tramite, nuevoEstado) => {
    setTramiteParaModificar(tramite);
    setEstadoTramite(nuevoEstado);
    setShowConfirmModal(true);
  };

  const confirmarModificacion = async () => {
    try {
      // Aquí se llamara a la función del backend para modificar el estado
      await modificarEstadoTramite(estadoTramite);
      toast.success(`El estado se modificó a "${estadoTramite}"`);
      setTramites((prevTramites) =>
        prevTramites.map((t) =>
          t.id === tramiteParaModificar.id ? { ...t, estado: estadoTramite } : t
        )
      );
    } catch (error) {
      toast.error('Error al modificar el estado del trámite.');
    } finally {
      setShowConfirmModal(false);
      setTramiteParaModificar(null);
      setEstadoTramite('');
    }
  };

  const cancelarModificacion = () => {
    setShowConfirmModal(false);
    setTramiteParaModificar(null);
    setEstadoTramite('');
  };

  return (
    <div className="ver-tramites-container">
      <h2 className="table-heading">Trámites Pendientes</h2>
      {loading ? (
        <p>Cargando...</p>
      ) : (
        <table className="tramites-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Matrícula</th>
              <th>Carrera</th>
              <th>Grado</th>
              <th>Tipo de Trámite</th>
              <th>Comentarios</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {tramites.map((tramite) => (
              <tr key={tramite.id}>
                <td>{tramite.nombre}</td>
                <td>{tramite.matricula}</td>
                <td>{tramite.carrera}</td>
                <td>{tramite.grado}</td>
                <td>{tramite.tipoTramite}</td>
                <td>
                  <button
                    className="info-button"
                    onClick={() => handleShowInfo(tramite)}
                  >
                    Información adicional
                  </button>
                </td>
                <td>
                  <select
                    value={tramite.estado}
                    onChange={(e) =>
                      handleEstadoChange(tramite, e.target.value)
                    }
                  >
                    <option value="Pendiente">Pendiente</option>
                    <option value="En proceso">En proceso</option>
                    <option value="Listo">Listo</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal para mostrar información adicional */}
      {showInfoModal && (
        <div className="info-modal-overlay">
          <div className="info-modal-content">
            <h3>Información adicional</h3>
            <p>
              <strong>Trámite solicitado:</strong>{' '}
              {tramiteSeleccionado?.tramiteSolicitado}
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

      {/* Modal para confirmar cambio de estado */}
      {showConfirmModal && (
        <div className="confirm-modal-overlay">
          <div className="confirm-modal-content">
            <h3>Confirmar cambio de estado</h3>
            <p>
              ¿Estás seguro de que deseas cambiar el estado a{' '}
              <strong>{estadoTramite}</strong> para este trámite?
            </p>
            <button className="confirm-button" onClick={confirmarModificacion}>
              Confirmar
            </button>
            <button className="cancel-button" onClick={cancelarModificacion}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
};

export default VerTramites;