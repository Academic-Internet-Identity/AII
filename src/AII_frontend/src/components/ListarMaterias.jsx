// src/components/ListarMaterias.jsx
import React, { useState, useEffect } from 'react';
import { useCanister } from '@connect2ic/react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/listarMateriasStyles.css';

function ListarMaterias() {
  const [AII_backend] = useCanister('AII_backend');
  const [materias, setMaterias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [materiaAEliminar, setMateriaAEliminar] = useState(null); // Materia seleccionada para eliminar
  const [showConfirm, setShowConfirm] = useState(false); // Controla la visibilidad del cuadro de confirmación

  useEffect(() => {
    const fetchMaterias = async () => {
      try {
        const result = await AII_backend.verMaterias();
        setMaterias(result);
        toast.success('Materias cargadas correctamente.');
      } catch (error) {
        console.error('Error al obtener las materias:', error);
        toast.error('Error al obtener las materias.');
      } finally {
        setLoading(false);
      }
    };

    fetchMaterias();
  }, [AII_backend]);

  const handleEliminarMateria = async (codigo) => {
    try {
      const response = await AII_backend.eliminarMateria(codigo);
      toast.success(response);
      // Elimina la materia del estado local
      setMaterias(materias.filter(materia => materia.codigo !== codigo));
    } catch (error) {
      console.error('Error al eliminar la materia:', error);
      toast.error('Error al eliminar la materia.');
    }
    setShowConfirm(false); // Cierra el cuadro de confirmación
  };

  const confirmarEliminar = (materia) => {
    setMateriaAEliminar(materia);
    setShowConfirm(true);
  };

  const cancelarEliminar = () => {
    setMateriaAEliminar(null);
    setShowConfirm(false);
  };

  if (loading) {
    return <p>Cargando...</p>;
  }

  return (
    <div className="listar-materias-container">
      <h2 className="listar-materias-table-heading">Listado de Materias</h2>
      <table className="listar-materias-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Código</th>
            <th>Créditos</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {materias.map((materia, index) => (
            <tr key={index}>
              <td>{materia.nombre}</td>
              <td>{materia.codigo}</td>
              <td>{materia.creditos.toString()}</td>
              <td>
                <button
                  className="listar-materias-eliminar-button"
                  onClick={() => confirmarEliminar(materia)}
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showConfirm && (
        <div className="listar-materias-modal-overlay">
          <div className="listar-materias-modal-content">
            <p>¿Estás seguro de que deseas eliminar la materia "{materiaAEliminar?.nombre}"?</p>
            <button
              className="listar-materias-confirm-button"
              onClick={() => handleEliminarMateria(materiaAEliminar.codigo)}
            >
              Confirmar
            </button>
            <button className="listar-materias-cancel-button" onClick={cancelarEliminar}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
}

export default ListarMaterias;
