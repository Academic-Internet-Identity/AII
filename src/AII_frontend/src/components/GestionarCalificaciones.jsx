import React, { useState, useEffect } from 'react';
import { useCanister } from '@connect2ic/react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/gestionarCalificacionesStyles.css';

function GestionarCalificaciones() {
  const [AII_backend] = useCanister('AII_backend');
  const [grupos, setGrupos] = useState([]);
  const [alumnos, setAlumnos] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [selectedGrupo, setSelectedGrupo] = useState('');
  const [selectedAlumno, setSelectedAlumno] = useState('');
  const [selectedMateria, setSelectedMateria] = useState('');
  const [selectedParcial, setSelectedParcial] = useState('');
  const [calificacion, setCalificacion] = useState('');

  useEffect(() => {
    const fetchMaterias = async () => {
      try {
        const materiasResult = await AII_backend.verMaterias();
        setMaterias(materiasResult);
      } catch (error) {
        toast.error('Error al cargar las materias.');
        console.error('Error al cargar las materias:', error);
      }
    };

    const fetchGruposYAlumnos = async () => {
      try {
        const gruposResult = await AII_backend.verGrupos();
        setGrupos(gruposResult);
      } catch (error) {
        toast.error('Error al cargar los grupos.');
        console.error('Error al cargar los grupos:', error);
      }
    };

    fetchMaterias();
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
    if (!selectedGrupo || !selectedAlumno || !selectedMateria || !selectedParcial || !calificacion) {
      toast.error('Todos los campos son obligatorios.');
      return;
    }

    try {
      console.log('Enviando datos al backend:', {
        grupoId: selectedGrupo,
        alumnoId: selectedAlumno,
        materia: selectedMateria,
        parcial: selectedParcial,
        calificacion: parseInt(calificacion),
      });

      const response = await AII_backend.actualizarCalificacionPorMateria(selectedGrupo, selectedAlumno, selectedMateria, selectedParcial, parseInt(calificacion));
      toast.success(response);
    } catch (error) {
      console.error('Error al actualizar la calificación:', error);
      toast.error('Error al actualizar la calificación.');
    }
  };

  const obtenerNombreMateria = (codigoMateria) => {
    const materia = materias.find(m => m.codigo === codigoMateria);
    return materia ? materia.nombre : 'Nombre desconocido';
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
              <option key={alumno.alumno} value={alumno.alumno}>
                {alumno.nombre} ({alumno.alumno})
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
            {alumnos.find(a => a.alumno === selectedAlumno)?.materias?.map((materia) => (
              <option key={materia.materia} value={materia.materia}>
                {obtenerNombreMateria(materia.materia)} (ID: {materia.materia})
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