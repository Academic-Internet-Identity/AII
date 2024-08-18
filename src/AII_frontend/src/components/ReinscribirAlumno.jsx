import React, { useState, useEffect } from 'react';
import { useCanister } from '@connect2ic/react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/reinscribirAlumnoStyles.css';

function ReinscribirAlumno() {
  const [AII_backend] = useCanister('AII_backend');
  const [alumnos, setAlumnos] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [selectedAlumno, setSelectedAlumno] = useState('');
  const [selectedGrupo, setSelectedGrupo] = useState('');

  useEffect(() => {
    const fetchAlumnosYGrupos = async () => {
      try {
        const alumnosResult = await AII_backend.verAlumnos();
        const gruposResult = await AII_backend.verGrupos();
        setAlumnos(alumnosResult);
        setGrupos(gruposResult);
      } catch (error) {
        toast.error('Error al cargar alumnos o grupos.');
        console.error('Error al cargar alumnos o grupos:', error);
      }
    };

    fetchAlumnosYGrupos();
  }, [AII_backend]);

  const handleReinscribir = async () => {
    if (!selectedAlumno) {
      toast.error('Por favor, selecciona un alumno.');
      return;
    }

    try {
      const grupoId = selectedGrupo === '' ? [] : [selectedGrupo]; // Convertimos el string a un array opcional
      const response = await AII_backend.reinscribirAlumno(selectedAlumno, grupoId);
      toast.success(response);
    } catch (error) {
      console.error('Error al reinscribir al alumno:', error);
      toast.error('Error al reinscribir al alumno.');
    }
  };

  return (
    <div className="reinscribir-alumno-container">
      <h2 className="reinscribir-heading">Reinscribir Alumno</h2>
      <form className="reinscribir-form">
        <div className="reinscribir-form-group">
          <label htmlFor="alumno-select">Selecciona un Alumno:</label>
          <select
            id="alumno-select"
            className="reinscribir-select"
            value={selectedAlumno}
            onChange={(e) => setSelectedAlumno(e.target.value)}
          >
            <option value="">Selecciona un Alumno</option>
            {alumnos.map((alumno) => (
              <option key={alumno.matricula} value={alumno.matricula}>
                {alumno.nombre} ({alumno.matricula})
              </option>
            ))}
          </select>
        </div>
        <div className="reinscribir-form-group">
          <label htmlFor="grupo-select">Selecciona un Grupo (opcional):</label>
          <select
            id="grupo-select"
            className="reinscribir-select"
            value={selectedGrupo}
            onChange={(e) => setSelectedGrupo(e.target.value)}
          >
            <option value="">Sin Grupo</option>
            {grupos.map((grupo) => (
              <option key={grupo.id} value={grupo.id}>
                {grupo.nombre} - Cuatrimestre: {grupo.cuatrimestre.toString()} (ID: {grupo.id})
              </option>
            ))}
          </select>
        </div>
        <button type="button" className="reinscribir-button" onClick={handleReinscribir}>
          Reinscribir Alumno
        </button>
      </form>
      <ToastContainer />
    </div>
  );
}

export default ReinscribirAlumno;