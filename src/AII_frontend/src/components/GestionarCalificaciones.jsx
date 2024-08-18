import React, { useState, useEffect } from 'react';
import { useCanister } from '@connect2ic/react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/gestionarCalificacionesStyles.css';

function GestionarCalificaciones() {
  const [AII_backend] = useCanister('AII_backend');
  const [grupos, setGrupos] = useState([]);
  const [selectedGrupo, setSelectedGrupo] = useState('');
  const [alumnos, setAlumnos] = useState([]);
  const [selectedAlumno, setSelectedAlumno] = useState('');
  const [selectedMateria, setSelectedMateria] = useState('');
  const [selectedParcial, setSelectedParcial] = useState('');
  const [calificacion, setCalificacion] = useState('');

  useEffect(() => {
    const fetchGruposYAlumnos = async () => {
      try {
        const gruposResult = await AII_backend.verGrupos();
        setGrupos(gruposResult);
      } catch (error) {
        toast.error('Error al cargar los grupos.');
        console.error('Error al cargar los grupos:', error);
      }
    };

    fetchGruposYAlumnos();
  }, [AII_backend]);

  useEffect(() => {
    const fetchAlumnos = async () => {
      if (selectedGrupo) {
        try {
          const grupo = grupos.find(g => g.id === selectedGrupo);
          if (grupo) {
            setAlumnos(grupo.alumnos);
          }
        } catch (error) {
          toast.error('Error al cargar los alumnos.');
          console.error('Error al cargar los alumnos:', error);
        }
      }
    };

    fetchAlumnos();
  }, [selectedGrupo, grupos]);

  const handleActualizarCalificacion = async () => {
    if (!selectedAlumno || !selectedMateria || !selectedParcial || !calificacion) {
      toast.error('Todos los campos son obligatorios.');
      return;
    }

    try {
      const response = await AII_backend.actualizarCalificacionPorMateria(selectedAlumno, selectedMateria, selectedParcial, parseInt(calificacion));
      toast.success(response);
    } catch (error) {
      console.error('Error al actualizar la calificación:', error);
      toast.error('Error al actualizar la calificación.');
    }
  };

  return (
    <div className="gestionar-calificaciones-container">
      <h2 className="gestionar-calificaciones-heading">Gestionar Calificaciones</h2>
      <form className="gestionar-calificaciones-form">
        <div className="gestionar-calificaciones-form-group">
          <label htmlFor="grupo-select">Selecciona un Grupo:</label>
          <select
            id="grupo-select"
            className="gestionar-calificaciones-select"
            value={selectedGrupo}
            onChange={(e) => setSelectedGrupo(e.target.value)}
          >
            <option value="">Selecciona un Grupo</option>
            {grupos.map((grupo) => (
              <option key={grupo.id} value={grupo.id}>
                {grupo.nombre} - Cuatrimestre: {grupo.cuatrimestre.toString()} (ID: {grupo.id})
              </option>
            ))}
          </select>
        </div>
        <div className="gestionar-calificaciones-form-group">
          <label htmlFor="alumno-select">Selecciona un Alumno:</label>
          <select
            id="alumno-select"
            className="gestionar-calificaciones-select"
            value={selectedAlumno}
            onChange={(e) => setSelectedAlumno(e.target.value)}
            disabled={!selectedGrupo}
          >
            <option value="">Selecciona un Alumno</option>
            {alumnos.map((alumno) => (
              <option key={alumno.matricula} value={alumno.matricula}>
                {alumno.nombre} ({alumno.matricula})
              </option>
            ))}
          </select>
        </div>
        <div className="gestionar-calificaciones-form-group">
          <label htmlFor="materia-select">Selecciona una Materia:</label>
          <select
            id="materia-select"
            className="gestionar-calificaciones-select"
            value={selectedMateria}
            onChange={(e) => setSelectedMateria(e.target.value)}
            disabled={!selectedAlumno}
          >
            <option value="">Selecciona una Materia</option>
            {alumnos.find(a => a.matricula === selectedAlumno)?.materias?.map((materia) => (
              <option key={materia.codigo} value={materia.codigo}>
                {materia.nombre} (ID: {materia.codigo})
              </option>
            ))}
          </select>
        </div>
        <div className="gestionar-calificaciones-form-group">
          <label htmlFor="parcial-select">Selecciona el Parcial:</label>
          <select
            id="parcial-select"
            className="gestionar-calificaciones-select"
            value={selectedParcial}
            onChange={(e) => setSelectedParcial(e.target.value)}
            disabled={!selectedMateria}
          >
            <option value="">Selecciona el Parcial</option>
            <option value="p1">Primer Parcial</option>
            <option value="p2">Segundo Parcial</option>
            <option value="p3">Tercer Parcial</option>
            <option value="final">Final</option>
          </select>
        </div>
        <div className="gestionar-calificaciones-form-group">
          <label htmlFor="calificacion-input">Calificación:</label>
          <input
            type="number"
            id="calificacion-input"
            className="gestionar-calificaciones-input"
            value={calificacion}
            onChange={(e) => setCalificacion(e.target.value)}
            min="0"
            max="100"
            disabled={!selectedParcial}
          />
        </div>
        <button type="button" className="gestionar-calificaciones-button" onClick={handleActualizarCalificacion}>
          Actualizar Calificación
        </button>
      </form>
      <ToastContainer />
    </div>
  );
}

export default GestionarCalificaciones;
