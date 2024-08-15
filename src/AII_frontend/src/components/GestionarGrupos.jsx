import React, { useState } from 'react';
import { useCanister } from '@connect2ic/react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
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
    id: '',
    nombre: '',
    cuatrimestre: '',
  });
  const [alumnos, setAlumnos] = useState([]);

  // Manejo de los cambios en los campos de entrada
  const handleInputChange = (e, type = 'grupo') => {
    const { name, value } = e.target;
    if (type === 'grupo') {
      setGrupo((prev) => ({ ...prev, [name]: value }));
    } else {
      setAlumno((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Función para crear un grupo
  const handleCrearGrupo = async () => {
    const { id, nombre, cuatrimestre } = grupo;
    if (!id || !nombre || !cuatrimestre) {
      toast.error('Todos los campos son obligatorios para crear un grupo.');
      return;
    }
    try {
      const response = await AII_backend.crearGrupo(id, nombre, cuatrimestre);
      toast.success(response);
      resetFields(); // Reiniciar los campos después de crear el grupo
    } catch (error) {
      toast.error('Error al crear el grupo.');
      console.error('Error al crear el grupo:', error);
    }
  };

  // Función para agregar un alumno a un grupo
  const handleAgregarAlumno = async () => {
    const { id, cuatrimestre } = grupo;
    const { id: alumnoId, nombre: nombreAlumno } = alumno;
    if (!id || !alumnoId || !nombreAlumno || !cuatrimestre) {
      toast.error('Todos los campos son obligatorios para agregar un alumno.');
      return;
    }
    try {
      const response = await AII_backend.agregarAlumnoAGrupo(id, alumnoId, nombreAlumno, cuatrimestre);
      toast.success(response);
      resetFields(); // Reiniciar los campos después de agregar un alumno
    } catch (error) {
      toast.error('Error al agregar el alumno al grupo.');
      console.error('Error al agregar el alumno al grupo:', error);
    }
  };

  // Función para listar los alumnos de un grupo
  const handleListarAlumnos = async () => {
    if (!grupo.id) {
      toast.error('El ID del grupo es obligatorio para listar los alumnos.');
      return;
    }
    try {
      const alumnosList = await AII_backend.listarAlumnosDeGrupo(grupo.id);
      if (alumnosList && alumnosList.length > 0) {
        setAlumnos(alumnosList);
        toast.success('Alumnos listados correctamente.');
      } else {
        toast.info('No se encontraron alumnos para este grupo.');
      }
    } catch (error) {
      toast.error('Error al listar los alumnos del grupo.');
      console.error('Error al listar los alumnos del grupo:', error);
    }
  };

  // Reiniciar los campos del formulario
  const resetFields = () => {
    setGrupo({ id: '', nombre: '', cuatrimestre: '' });
    setAlumno({ id: '', nombre: '', cuatrimestre: '' });
    setAlumnos([]);
  };

  // Renderizado del formulario basado en la acción seleccionada
  const renderForm = () => {
    switch (currentAction) {
      case 'crear':
        return (
          <div className="gestionar-grupos-form">
            <h3>Crear Grupo</h3>
            <div className="form-group">
              <label>Grupo ID:</label>
              <input type="text" name="id" value={grupo.id} onChange={(e) => handleInputChange(e, 'grupo')} />
            </div>
            <div className="form-group">
              <label>Nombre del Grupo:</label>
              <input type="text" name="nombre" value={grupo.nombre} onChange={(e) => handleInputChange(e, 'grupo')} />
            </div>
            <div className="form-group">
              <label>Cuatrimestre:</label>
              <input type="text" name="cuatrimestre" value={grupo.cuatrimestre} onChange={(e) => handleInputChange(e, 'grupo')} />
            </div>
            <button onClick={handleCrearGrupo}>Crear Grupo</button>
          </div>
        );
      case 'agregar':
        return (
          <div className="gestionar-grupos-form">
            <h3>Agregar Alumno a Grupo</h3>
            <div className="form-group">
              <label>Grupo ID:</label>
              <input type="text" name="id" value={grupo.id} onChange={(e) => handleInputChange(e, 'grupo')} />
            </div>
            <div className="form-group">
              <label>ID del Alumno:</label>
              <input type="text" name="id" value={alumno.id} onChange={(e) => handleInputChange(e, 'alumno')} />
            </div>
            <div className="form-group">
              <label>Nombre del Alumno:</label>
              <input type="text" name="nombre" value={alumno.nombre} onChange={(e) => handleInputChange(e, 'alumno')} />
            </div>
            <div className="form-group">
              <label>Cuatrimestre:</label>
              <input type="text" name="cuatrimestre" value={grupo.cuatrimestre} onChange={(e) => handleInputChange(e, 'grupo')} />
            </div>
            <button onClick={handleAgregarAlumno}>Agregar Alumno al Grupo</button>
          </div>
        );
      case 'listar':
        return (
          <div className="gestionar-grupos-form">
            <h3>Listar Alumnos del Grupo</h3>
            <div className="form-group">
              <label>Grupo ID:</label>
              <input type="text" name="id" value={grupo.id} onChange={(e) => handleInputChange(e, 'grupo')} />
            </div>
            <button onClick={handleListarAlumnos}>Listar Alumnos</button>

            {alumnos.length > 0 && (
              <ul className="alumnos-list">
                {alumnos[0].map((alumno, index) => (
                  <li key={index}>
                    <strong>Nombre:</strong> {alumno.nombre} <br />
                    <strong>Matrícula:</strong> {alumno.alumno} <br />
                    <strong>Cuatrimestre:</strong> {alumno.cuatrimestre} <br />
                    <strong>Materia:</strong> {alumno.materia || 'No asignada'} <br />
                    <strong>Calificaciones:</strong>
                    <ul>
                      <li><strong>P1:</strong> {alumno.calificaciones.p1 || 'Sin calificación'}</li>
                      <li><strong>P2:</strong> {alumno.calificaciones.p2 || 'Sin calificación'}</li>
                      <li><strong>P3:</strong> {alumno.calificaciones.p3 || 'Sin calificación'}</li>
                      <li><strong>Final:</strong> {alumno.calificaciones.final || 'Sin calificación'}</li>
                    </ul>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      default:
        return <div>Selecciona una opción para comenzar.</div>;
    }
  };

  return (
    <div className="gestionar-grupos-container">
      <h2>Gestionar Grupos</h2>
      {!currentAction && (
        <div className="gestionar-grupos-menu">
          <button onClick={() => setCurrentAction('crear')}>Crear Grupo</button>
          <button onClick={() => setCurrentAction('agregar')}>Agregar Alumno a Grupo</button>
          <button onClick={() => setCurrentAction('listar')}>Listar Alumnos del Grupo</button>
        </div>
      )}
      {currentAction && (
        <div>
          <button onClick={() => setCurrentAction('')}>Volver al Menú</button>
          {renderForm()}
        </div>
      )}
      <ToastContainer />
    </div>
  );
}

export default GestionarGrupos;