import React, { useState, useEffect } from 'react';
import { useCanister } from '@connect2ic/react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/gestionarGruposStyles.css';

function GestionarGrupos() {
  const [AII_backend] = useCanister('AII_backend');
  const [currentAction, setCurrentAction] = useState('');
  const [grupo, setGrupo] = useState({
    id: '',
    nombre: '',
    cuatrimestre: '',
  });
  const [alumno, setAlumno] = useState({
    matricula: '',
  });
  const [alumnos, setAlumnos] = useState([]);
  const [grupos, setGrupos] = useState([]);

  const handleInputChange = (e, type = 'grupo') => {
    const { name, value } = e.target;
    if (type === 'grupo') {
      setGrupo((prev) => ({ ...prev, [name]: value }));
    } else {
      setAlumno((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCrearGrupo = async () => {
    const { id, nombre, cuatrimestre } = grupo;
    if (!id || !nombre || !cuatrimestre) {
      toast.error('Todos los campos son obligatorios para crear un grupo.');
      return;
    }

    const cuatrimestreNum = Number(cuatrimestre);
    if (isNaN(cuatrimestreNum)) {
      toast.error('El cuatrimestre debe ser un número válido.');
      return;
    }

    try {
      const response = await AII_backend.crearGrupo(id, nombre, cuatrimestreNum);
      toast.success(response);
      resetFields(); 
    } catch (error) {
      toast.error('Error al crear el grupo.');
      console.error('Error al crear el grupo:', error);
    }
  };

  const handleAgregarAlumno = async () => {
    const { id } = grupo;
    const { matricula } = alumno;
    if (!id || !matricula) {
      toast.error('El ID del grupo y la matrícula del alumno son obligatorios para agregar un alumno.');
      return;
    }
    try {
      const response = await AII_backend.agregarAlumnoAGrupo(id, matricula);
      toast.success(response);
      resetFields(); 
    } catch (error) {
      toast.error('Error al agregar el alumno al grupo.');
      console.error('Error al agregar el alumno al grupo:', error);
    }
  };

  const handleListarAlumnos = async () => {
    if (!grupo.id) {
      toast.error('El ID del grupo es obligatorio para listar los alumnos.');
      return;
    }

    try {
      const grupoData = await AII_backend.verGrupo(grupo.id);

      console.log('Respuesta del backend para grupo:', grupoData);

      if (grupoData && grupoData[0]) {
        console.log('Grupo encontrado:', grupoData[0]);

        setGrupo({
          id: grupoData[0].id,
          nombre: grupoData[0].nombre,
          cuatrimestre: grupoData[0].cuatrimestre.toString(),
        });

        const alumnosList = grupoData[0].alumnos;

        if (alumnosList && alumnosList.length > 0) {
          const alumnosConCalificaciones = alumnosList.map(alumno => {
            const materiasConCalificaciones = alumno.materias.map(materia => {
              const { p1, p2, p3, final } = materia.calificaciones;

              return {
                ...materia,
                calificaciones: {
                  p1: p1.length > 0 ? p1.toString() : 'Sin calificación',
                  p2: p2.length > 0 ? p2.toString() : 'Sin calificación',
                  p3: p3.length > 0 ? p3.toString() : 'Sin calificación',
                  final: final.length > 0 ? final.toString() : 'Sin calificación',
                }
              };
            });

            return {
              ...alumno,
              materias: materiasConCalificaciones,
            };
          });

          setAlumnos(alumnosConCalificaciones);
          toast.success('Alumnos listados correctamente.');
        } else {
          toast.info('No se encontraron alumnos para este grupo.');
        }
      } else {
        toast.error('Grupo no encontrado.');
      }
    } catch (error) {
      toast.error('Error al listar los alumnos del grupo.');
      console.error('Error al listar los alumnos del grupo:', error);
    }
  };

  const fetchGrupos = async () => {
    try {
      const gruposList = await AII_backend.verGrupos();
      setGrupos(gruposList);
    } catch (error) {
      toast.error('Error al obtener la lista de grupos.');
      console.error('Error al obtener la lista de grupos:', error);
    }
  };

  useEffect(() => {
    if (currentAction === 'agregar') {
      fetchGrupos();
    }
  }, [currentAction]);

  const resetFields = () => {
    setGrupo({ id: '', nombre: '', cuatrimestre: '' });
    setAlumno({ matricula: '' });
    setAlumnos([]);
  };

  const renderForm = () => {
    switch (currentAction) {
      case 'crear':
        return (
          <div className="gestionar-grupos-form">
            <h3>Crear Grupo</h3>
            <div className="form-group">
              <label>Grupo ID:</label>
              <input placeholder='Ej. 01' type="text" name="id" value={grupo.id} onChange={(e) => handleInputChange(e, 'grupo')} />
            </div>
            <div className="form-group">
              <label>Nombre del Grupo:</label>
              <input placeholder='Ej. TIIA A' type="text" name="nombre" value={grupo.nombre} onChange={(e) => handleInputChange(e, 'grupo')} />
            </div>
            <div className="form-group">
              <label>Cuatrimestre:</label>
              <input placeholder='Ej. 6' type="text" name="cuatrimestre" value={grupo.cuatrimestre} onChange={(e) => handleInputChange(e, 'grupo')} />
            </div>
            <button onClick={handleCrearGrupo}>Crear Grupo</button>
          </div>
        );
      case 'agregar':
        return (
          <div className="d-flex">
            <div className="gestionar-grupos-form flex-grow-1">
              <h3>Agregar Alumno a Grupo</h3>
              <div className="form-group">
                <label>Grupo ID:</label>
                <input type="text" name="id" value={grupo.id} onChange={(e) => handleInputChange(e, 'grupo')} />
              </div>
              <div className="form-group">
                <label>Matrícula del Alumno:</label>
                <input type="text" name="matricula" value={alumno.matricula} onChange={(e) => handleInputChange(e, 'alumno')} />
              </div>
              <button onClick={handleAgregarAlumno}>Agregar Alumno al Grupo</button>
            </div>
            <div className="grupos-list p-3 rounded ml-3" style={{ backgroundColor: '#00385d', maxHeight: '400px', overflowY: 'scroll', minWidth: '250px' }}>
              <h4 style={{ color: '#ffffff' }}>Grupos Existentes</h4>
              {grupos.length > 0 ? (
                <ul className="list-group">
                  {grupos.map((grupo, index) => (
                    <li key={index} className="list-group-item" style={{ backgroundColor: '#004b72', color: '#ffffff' }}>
                      <strong>ID:</strong> {grupo.id} <br />
                      <strong>Nombre:</strong> {grupo.nombre} <br />
                      <strong>Cuatrimestre:</strong> {grupo.cuatrimestre.toString()}
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ color: '#ffffff' }}>No hay grupos disponibles.</p>
              )}
            </div>
          </div>
        );
      case 'listar':
        return (
          <div>
            <div className="gestionar-grupos-form">
              <h3>Listar Alumnos del Grupo</h3>
              <div className="form-group">
                <label>Grupo ID:</label>
                <input
                  type="text"
                  name="id"
                  value={grupo.id}
                  onChange={(e) => handleInputChange(e, 'grupo')}
                />
              </div>
              <button onClick={handleListarAlumnos}>Listar Alumnos</button>
            </div>

            {grupo.nombre && grupo.cuatrimestre && (
              <div className="grupo-info">
                <h4>Información del Grupo</h4>
                <p><strong>ID:</strong> {grupo.id}</p>
                <p><strong>Nombre:</strong> {grupo.nombre}</p>
                <p><strong>Cuatrimestre:</strong> {grupo.cuatrimestre}</p>  
              </div>
            )}

            <div className="alumnos-table-container">
              <h4 className="table-heading">Alumnos del Grupo</h4>
              {alumnos.length > 0 ? (
                <table className="alumnos-table">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Matrícula</th>
                      <th>Cuatrimestre</th>
                      <th>Materia</th>
                      <th>P1</th>
                      <th>P2</th>
                      <th>P3</th>
                      <th>Final</th>
                    </tr>
                  </thead>
                  <tbody>
                    {alumnos.map((alumno, index) => (
                      alumno.materias.map((materia, matIndex) => (
                        <tr key={`${index}-${matIndex}`}>
                          <td>{alumno.nombre}</td>
                          <td>{alumno.alumno}</td>
                          <td>{alumno.cuatrimestre.toString()}</td>  
                          <td>{materia.materia || 'No asignada'}</td>
                          <td>{materia.calificaciones.p1}</td>
                          <td>{materia.calificaciones.p2}</td>
                          <td>{materia.calificaciones.p3}</td>
                          <td>{materia.calificaciones.final}</td>
                        </tr>
                      ))
                    ))}
                  </tbody>

                </table>
              ) : (
                <p>No hay alumnos en este grupo.</p>
              )}
            </div>
          </div>
        );        
      default:
        return <div>Selecciona una opción para comenzar.</div>;
    }
  };

  return (
    <div className="gestionar-grupos-container">
      <h2 className="gestionar-grupos-title">Gestionar Grupos</h2>
      {!currentAction && (
        <div className="gestionar-grupos-menu">
          <button onClick={() => setCurrentAction('crear')} className="menu-button">Crear Grupo</button>
          <button onClick={() => setCurrentAction('agregar')} className="menu-button">Agregar Alumno a Grupo</button>
          <button onClick={() => setCurrentAction('listar')} className="menu-button">Listar Alumnos del Grupo</button>
        </div>
      )}
      {currentAction && (
        <div>
          <button onClick={() => setCurrentAction('')} className="back-button">Volver al Menú</button>
          {renderForm()}
        </div>
      )}
      <ToastContainer />
    </div>
  );
}

export default GestionarGrupos;
