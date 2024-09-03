import React, { useState, useEffect } from 'react';
import { useCanister } from '@connect2ic/react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/reinscribirAlumnoStyles.css';

function ReinscribirAlumno() {
  const [AII_backend] = useCanister('AII_backend');
  const [alumnos, setAlumnos] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [searchType, setSearchType] = useState('grupo'); // Default search type
  const [selectedGrupo, setSelectedGrupo] = useState('');
  const [searchMatricula, setSearchMatricula] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedAlumnos, setSelectedAlumnos] = useState([]);
  const [nuevoGrupo, setNuevoGrupo] = useState(''); // Nuevo campo para seleccionar un grupo opcional

  useEffect(() => {
    const fetchGrupos = async () => {
      try {
        const gruposResult = await AII_backend.verGrupos();
        setGrupos(gruposResult);
      } catch (error) {
        toast.error('Error al cargar los grupos.');
        console.error('Error al cargar los grupos:', error);
      }
    };

    fetchGrupos();
  }, [AII_backend]);

  const handleSearch = async () => {
    setLoading(true);
    try {
      if (searchType === 'grupo' && selectedGrupo) {
        const grupoData = await AII_backend.listarAlumnosDeGrupo(selectedGrupo);

        console.log('Respuesta del backend para listarAlumnosDeGrupo:', grupoData);

        if (grupoData && grupoData[0]) {
          const matriculas = grupoData[0].map(alumno => alumno.alumno);
          
          const allAlumnos = await AII_backend.verAlumnos();
          const alumnosFiltrados = allAlumnos.filter(alumno => matriculas.includes(alumno.matricula));
          
          setAlumnos(alumnosFiltrados);
        } else {
          setAlumnos([]);
        }
      } else if (searchType === 'matricula' && searchMatricula) {
        const allAlumnos = await AII_backend.verAlumnos();
        const alumno = allAlumnos.find(a => a.matricula === searchMatricula);
        setAlumnos(alumno ? [alumno] : []);
      } else {
        toast.error('Por favor, selecciona un grupo o ingresa una matrícula.');
      }
    } catch (error) {
      toast.error('Error al realizar la búsqueda.');
      console.error('Error al realizar la búsqueda:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = (matricula) => {
    if (selectedAlumnos.includes(matricula)) {
      setSelectedAlumnos(selectedAlumnos.filter((id) => id !== matricula));
    } else {
      setSelectedAlumnos([...selectedAlumnos, matricula]);
    }
  };

  const handleReinscribir = async () => {
    try {
      for (const alumnoId of selectedAlumnos) {
        const response = await AII_backend.reinscribirAlumno(alumnoId, nuevoGrupo || []);
        console.log(`Respuesta del backend al reinscribir ${alumnoId}:`, response);
        toast.success(`Alumno ${alumnoId} reinscrito exitosamente.`);
      }
      setSelectedAlumnos([]);
      setNuevoGrupo('');
    } catch (error) {
      toast.error('Error al reinscribir alumnos.');
      console.error('Error al reinscribir alumnos:', error);
    }
  };
  

  const renderSearchFields = () => {
    if (searchType === 'grupo') {
      return (
        <div className="reinscribir-form-group">
          <label htmlFor="grupo-select">Selecciona un Grupo:</label>
          <select
            id="grupo-select"
            className="reinscribir-select"
            value={selectedGrupo}
            onChange={(e) => setSelectedGrupo(e.target.value)}
          >
            <option value="">Seleccione un grupo</option>
            {grupos.map((grupo) => (
              <option key={grupo.id} value={grupo.id}>
                {grupo.nombre} - Cuatrimestre: {grupo.cuatrimestre.toString()} (ID: {grupo.id})
              </option>
            ))}
          </select>
        </div>
      );
    } else if (searchType === 'matricula') {
      return (
        <div className="reinscribir-form-group">
          <label htmlFor="matricula-input">Buscar por Matrícula:</label>
          <input
            id="matricula-input"
            type="text"
            className="reinscribir-input"
            value={searchMatricula}
            onChange={(e) => setSearchMatricula(e.target.value)}
            placeholder="Ingresa matrícula"
          />
        </div>
      );
    }
  };

  return (
    <div className="reinscribir-alumno-container">
      <h2 className="reinscribir-heading">Reinscribir Alumnos</h2>

      <div className="reinscribir-form">
        <div className="reinscribir-form-group">
          <label htmlFor="search-type-select">Tipo de Búsqueda:</label>
          <select
            id="search-type-select"
            className="reinscribir-select"
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
          >
            <option value="grupo">Buscar por Grupo</option>
            <option value="matricula">Buscar por Matrícula</option>
          </select>
        </div>

        {renderSearchFields()}

        <button type="button" className="reinscribir-button" onClick={handleSearch}>
          Buscar Alumnos
        </button>
      </div>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <div>
          <table className="reinscribir-table">
            <thead>
              <tr>
                <th>Seleccionar</th>
                <th>Nombre</th>
                <th>Apellido Paterno</th>
                <th>Apellido Materno</th>
                <th>Matrícula</th>
                <th>Email Institucional</th>
                <th>Carrera</th>
                <th>Semestre</th>
              </tr>
            </thead>
            <tbody>
              {alumnos.map(alumno => (
                <tr key={alumno.matricula}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedAlumnos.includes(alumno.matricula)}
                      onChange={() => handleCheckboxChange(alumno.matricula)}
                    />
                  </td>
                  <td>{alumno.nombre}</td>
                  <td>{alumno.apellidoPaterno}</td>
                  <td>{alumno.apellidoMaterno}</td>
                  <td>{alumno.matricula}</td>
                  <td>{alumno.emailInstitucional}</td>
                  <td>{alumno.carrera}</td>
                  <td>{alumno.semestre ? alumno.semestre.toString() : 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="reinscribir-form-group">
            <label htmlFor="nuevo-grupo-select">Reasignar a Nuevo Grupo (opcional):</label>
            <select
              id="nuevo-grupo-select"
              className="reinscribir-select"
              value={nuevoGrupo}
              onChange={(e) => setNuevoGrupo(e.target.value)}
            >
              <option value="">Sin reasignación de grupo</option>
              {grupos.map((grupo) => (
                <option key={grupo.id} value={grupo.id}>
                  {grupo.nombre} - Cuatrimestre: {grupo.cuatrimestre.toString()} (ID: {grupo.id})
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            className="reinscribir-button"
            onClick={handleReinscribir}
            disabled={selectedAlumnos.length === 0}
          >
            Reinscribir Seleccionados
          </button>
        </div>
      )}

      <ToastContainer />
    </div>
  );
}

export default ReinscribirAlumno;