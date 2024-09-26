import React, { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useCanister } from '@connect2ic/react';
import '../styles/verTramitesStyles.css';

const VerTramites = () => {
  const [AII_backend] = useCanister('AII_backend');
  const [tramites, setTramites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tramiteSeleccionado, setTramiteSeleccionado] = useState(null);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [estadoTramite, setEstadoTramite] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [tramiteParaModificar, setTramiteParaModificar] = useState(null);

  // Estado para la paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const tramitesPorPagina = 15;

  // Estado para el filtro
  const [filtroEstado, setFiltroEstado] = useState('todos');

  // Obtener trámites del backend
  const obtenerTramites = async () => {
    try {
      setLoading(true);  // Mostrar indicador de carga mientras se actualiza
      const response = await AII_backend.VerTramites();
      setTramites(response);
    } catch (error) {
      toast.error('Error al cargar los trámites');
      console.error('Error al obtener trámites:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    obtenerTramites();
  }, [AII_backend]);

  // Función para mapear el estado al formato de variantes de Motoko
  const mapEstadoToVariant = (estado) => {
    switch (estado) {
      case 'Pendiente':
        return { Pendiente: null };
      case 'EnProceso':
        return { EnProceso: null };
      case 'Completado':
        return { Completado: null };
      case 'Rechazado':
        return { Rechazado: null };
      default:
        return { Pendiente: null };
    }
  };

  const handleFiltroEstado = (e) => {
    setFiltroEstado(e.target.value);
    setPaginaActual(1);
  };

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

      const estadoVariant = mapEstadoToVariant(estadoTramite);

      const response = await AII_backend.ModificarEstadoTramite(tramiteParaModificar.id, estadoVariant);

      toast.success(response);

      // Volver a consultar los trámites para asegurarnos de que los cambios se reflejen en la UI
      await obtenerTramites();
    } catch (error) {
      toast.error('Error al modificar el estado del trámite.');
      console.error('Error al modificar el trámite:', error);
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

  // Filtrar trámites según el estado
  const tramitesFiltrados = filtroEstado === 'todos'
    ? tramites
    : tramites.filter(tramite => tramite.estado[Object.keys(tramite.estado)[0]] === null && Object.keys(tramite.estado)[0] === filtroEstado);

  // Paginación
  const indexOfLastTramite = paginaActual * tramitesPorPagina;
  const indexOfFirstTramite = indexOfLastTramite - tramitesPorPagina;
  const tramitesPaginados = tramitesFiltrados.slice(indexOfFirstTramite, indexOfLastTramite);

  return (
    <div className="ver-tramites-container">
      <h2 className="table-heading">Trámites</h2>

      {/* Filtro por estado */}
      <div className="filter-container">
        <label htmlFor="estado">Filtrar por estado:</label>
        <select id="estado" name="estado" value={filtroEstado} onChange={handleFiltroEstado}>
          <option value="todos">Todos</option>
          <option value="Pendiente">Pendiente</option>
          <option value="EnProceso">En proceso</option>
          <option value="Completado">Completado</option>
          <option value="Rechazado">Rechazado</option>
        </select>
      </div>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <>
          <table className="tramites-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Matrícula</th>
                <th>Carrera</th>
                <th>Grado</th>
                <th>Tipo de Solicitud</th>
                <th>Comentarios</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {tramitesPaginados.map((tramite) => (
                <tr key={tramite.id}>
                  <td>{tramite.nombre}</td>
                  <td>{tramite.matricula}</td>
                  <td>{tramite.carrera}</td>
                  <td>{tramite.grado.toString()}</td> {/* Convertir el grado a string */}
                  <td>{tramite.tipoSolicitud}</td>
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
                      value={tramite.estado[Object.keys(tramite.estado)[0]] === null ? Object.keys(tramite.estado)[0] : ""}
                      onChange={(e) => handleEstadoChange(tramite, e.target.value)}
                    >
                      <option value="Pendiente">Pendiente</option>
                      <option value="EnProceso">En proceso</option>
                      <option value="Completado">Completado</option>
                      <option value="Rechazado">Rechazado</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Paginación */}
          <div className="pagination">
            {[...Array(Math.ceil(tramitesFiltrados.length / tramitesPorPagina)).keys()].map(numero => (
              <button
                key={numero + 1}
                onClick={() => setPaginaActual(numero + 1)}
                className={paginaActual === numero + 1 ? 'active' : ''}
              >
                {numero + 1}
              </button>
            ))}
          </div>
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