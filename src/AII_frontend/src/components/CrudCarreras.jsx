import React, { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useCanister } from '@connect2ic/react';
import '../styles/crudCarrerasStyles.css';

const CrudCarreras = () => {
  const [AII_backend] = useCanister('AII_backend');
  const [carreras, setCarreras] = useState([]);
  const [codigo, setCodigo] = useState('');
  const [nombre, setNombre] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [codigoAEditar, setCodigoAEditar] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [accionPendiente, setAccionPendiente] = useState(null); 

  // Obtener carreras del backend
  const obtenerCarreras = async () => {
    try {
      const response = await AII_backend.listarCarreras();
      setCarreras(response);
    } catch (error) {
      toast.error('Error al cargar las carreras.');
      console.error('Error al obtener carreras:', error);
    }
  };

  useEffect(() => {
    obtenerCarreras();
  }, [AII_backend]);

  const handleCodigoChange = (e) => setCodigo(e.target.value);
  const handleNombreChange = (e) => setNombre(e.target.value);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!codigo || !nombre) {
      toast.warn('Por favor, completa todos los campos.');
      return;
    }
    setShowConfirmModal(true);
    setAccionPendiente(isEditing ? 'editar' : 'agregar');
  };

  const handleConfirmarAccion = async () => {
    try {
      let response;
      if (accionPendiente === 'editar') {
        response = await AII_backend.editarCarrera(codigoAEditar, nombre);
        setIsEditing(false);
      } else if (accionPendiente === 'agregar') {
        response = await AII_backend.agregarCarrera(codigo, nombre);
      }
      toast.success(response);
      obtenerCarreras();
      limpiarFormulario();
    } catch (error) {
      toast.error('Error al procesar la carrera.');
      console.error('Error en el CRUD de carreras:', error);
    }
    setShowConfirmModal(false);
  };

  const handleEliminar = (codigo) => {
    setCodigo(codigo);
    setAccionPendiente('eliminar');
    setShowConfirmModal(true);
  };

  const handleConfirmarEliminar = async () => {
    try {
      const response = await AII_backend.eliminarCarrera(codigo);
      toast.success(response);
      obtenerCarreras();
    } catch (error) {
      toast.error('Error al eliminar la carrera.');
      console.error('Error al eliminar carrera:', error);
    }
    setShowConfirmModal(false);
  };

  const handleEditar = (codigo, nombre) => {
    setIsEditing(true);
    setCodigo(codigo); 
    setNombre(nombre);
    setCodigoAEditar(codigo);
  };

  const limpiarFormulario = () => {
    setCodigo('');
    setNombre('');
    setIsEditing(false);
    setCodigoAEditar('');
  };

  const cancelarAccion = () => {
    setShowConfirmModal(false);
    limpiarFormulario();
  };

  return (
    <div className="crud-carreras-container">
      <h2>Gestión de Carreras</h2>
      <form onSubmit={handleSubmit} className="crud-form">
        <div className="form-group">
          <label htmlFor="codigo">Código de la carrera *</label>
          <input
            type="text"
            id="codigo"
            value={codigo}
            onChange={handleCodigoChange}
            disabled={isEditing} 
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="nombre">Nombre de la carrera *</label>
          <input
            type="text"
            id="nombre"
            value={nombre}
            onChange={handleNombreChange}
            required
          />
        </div>
        <div className="crud-buttons">
          <button type="submit" className="crud-button">
            {isEditing ? 'Actualizar Carrera' : 'Agregar Carrera'}
          </button>
          {isEditing && (
            <button type="button" className="crud-button cancelar-button" onClick={limpiarFormulario}>
              Cancelar
            </button>
          )}
        </div>
      </form>

      <h3>Lista de Carreras</h3>
      {carreras.length === 0 ? (
        <p>No hay carreras registradas.</p>
      ) : (
        <div className="table-wrapper">
          <table className="carreras-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {carreras.map(([codigo, nombre]) => (
                <tr key={codigo}>
                  <td>{codigo}</td>
                  <td>{nombre}</td>
                  <td>
                    <button
                      onClick={() => handleEditar(codigo, nombre)}
                      className="crud-button edit-button"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleEliminar(codigo)}
                      className="crud-button delete-button"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showConfirmModal && (
        <div className="confirm-modal-overlay">
          <div className="confirm-modal-content">
            <h3>Confirmar acción</h3>
            <p>
              {accionPendiente === 'eliminar' 
                ? `¿Estás seguro de que deseas eliminar la carrera con código "${codigo}"?` 
                : `¿Estás seguro de que deseas ${accionPendiente === 'editar' ? 'actualizar' : 'agregar'} esta carrera?`}
            </p>
            <button className="confirm-button" onClick={accionPendiente === 'eliminar' ? handleConfirmarEliminar : handleConfirmarAccion}>
              Confirmar
            </button>
            <button className="cancel-button" onClick={cancelarAccion}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
};

export default CrudCarreras;