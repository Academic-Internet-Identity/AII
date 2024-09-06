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
  const [materiasDetalle, setMateriasDetalle] = useState([]); // Detalle de todas las materias
  const [selectedGrupo, setSelectedGrupo] = useState('');
  const [selectedMateria, setSelectedMateria] = useState('');
  const [calificaciones, setCalificaciones] = useState([]);
  const [editableAlumno, setEditableAlumno] = useState(null); // Alumno actualmente editable

  // Cargar grupos y materias al montar el componente
  useEffect(() => {
    const fetchGruposYMaterias = async () => {
      try {
        const gruposResult = await AII_backend.verGrupos();
        setGrupos(gruposResult);

        // Obtener todas las materias del backend para tener los nombres y códigos
        const materiasResult = await AII_backend.verMaterias();
        setMateriasDetalle(materiasResult); // Guardar el detalle completo de las materias
      } catch (error) {
        toast.error('Error al cargar los grupos y materias.');
      }
    };

    fetchGruposYMaterias();
  }, [AII_backend]);

  // Cargar alumnos y materias del grupo seleccionado
  useEffect(() => {
    const fetchAlumnosYMaterias = async () => {
      if (selectedGrupo) {
        try {
          // Obtener información del grupo seleccionado
          const grupoData = await AII_backend.verGrupo(selectedGrupo);
          console.log("Grupo Obtenido: ", grupoData);

          if (grupoData && grupoData[0]) {
            const alumnosList = grupoData[0].alumnos;

            if (alumnosList && alumnosList.length > 0) {
              const alumnosConCalificaciones = alumnosList.map(alumno => {
                const materiasConCalificaciones = alumno.materias.map(materia => {
                  const { p1, p2, p3, final } = materia.calificaciones;

                  return {
                    ...materia,
                    calificaciones: {
                      p1: p1?.length > 0 ? p1.toString() : 'Sin calificación',
                      p2: p2?.length > 0 ? p2.toString() : 'Sin calificación',
                      p3: p3?.length > 0 ? p3.toString() : 'Sin calificación',
                      final: final?.length > 0 ? final.toString() : 'Sin calificación',
                    },
                  };
                });

                return {
                  ...alumno,
                  materias: materiasConCalificaciones,
                };
              });

              setAlumnos(alumnosConCalificaciones);
              toast.success('Alumnos listados correctamente.');

              // Mapeamos las materias del grupo con los nombres reales desde materiasDetalle
              const materiasDelGrupo = alumnosList[0].materias.map((materia) => {
                const detalleMateria = materiasDetalle.find(
                  (mat) => mat.codigo === materia.materia // Busca el nombre de la materia en el detalle
                );
                console.log('Materia encontrada: ', detalleMateria);

                return {
                  codigo: materia.materia,
                  nombre: detalleMateria ? detalleMateria.nombre : 'Nombre no encontrado',
                };
              });
              setMaterias(materiasDelGrupo);
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
      }
    };

    fetchAlumnosYMaterias();
  }, [selectedGrupo, materiasDetalle, AII_backend]);

  // Filtrar las calificaciones para la materia seleccionada
  useEffect(() => {
    if (selectedMateria && alumnos.length > 0) {
      const calificacionesMateriaSeleccionada = alumnos.map(alumno => {
        const materiaSeleccionada = alumno.materias.find(
          (materia) => materia.materia === selectedMateria
        );

        return {
          alumno: alumno.nombre,
          p1: materiaSeleccionada?.calificaciones?.p1 || '',
          p2: materiaSeleccionada?.calificaciones?.p2 || '',
          p3: materiaSeleccionada?.calificaciones?.p3 || '',
          final: materiaSeleccionada?.calificaciones?.final || '',
        };
      });

      setCalificaciones(calificacionesMateriaSeleccionada);
    } else {
      setCalificaciones([]); // Si no hay materia seleccionada, no mostramos calificaciones
    }
  }, [selectedMateria, alumnos]);

  const handleCalificacionChange = (index, campo, valor) => {
    const nuevasCalificaciones = [...calificaciones];
    nuevasCalificaciones[index][campo] = valor;
    setCalificaciones(nuevasCalificaciones);
  };

  const handleActualizarCalificaciones = async () => {
    for (const calificacion of calificaciones) {
      try {
        await AII_backend.actualizarCalificacionPorMateria(
          selectedGrupo,
          calificacion.alumno,
          selectedMateria,
          'p1',
          parseInt(calificacion.p1)
        );
        await AII_backend.actualizarCalificacionPorMateria(
          selectedGrupo,
          calificacion.alumno,
          selectedMateria,
          'p2',
          parseInt(calificacion.p2)
        );
        await AII_backend.actualizarCalificacionPorMateria(
          selectedGrupo,
          calificacion.alumno,
          selectedMateria,
          'p3',
          parseInt(calificacion.p3)
        );
        await AII_backend.actualizarCalificacionPorMateria(
          selectedGrupo,
          calificacion.alumno,
          selectedMateria,
          'final',
          parseInt(calificacion.final)
        );
        toast.success(`Calificaciones actualizadas para ${calificacion.alumno}`);
      } catch (error) {
        toast.error(`Error al actualizar las calificaciones para ${calificacion.alumno}`);
      }
    }
  };

  return (
    <div className="gestionar-calificaciones-container">
      <h2 className="gestionar-calificaciones-heading">Gestionar Calificaciones</h2>

      {/* Formulario de selección de grupo y materia */}
      <div className="gestionar-calificaciones-form">
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
          <label htmlFor="materia-select">Selecciona una Materia:</label>
          <select
            id="materia-select"
            className="gestionar-calificaciones-select"
            value={selectedMateria}
            onChange={(e) => setSelectedMateria(e.target.value)}
            disabled={!selectedGrupo}
          >
            <option value="">Selecciona una Materia</option>
            {materias.map((materia) => (
              <option key={materia.codigo} value={materia.codigo}>
                {materia.codigo} - {materia.nombre} {/* Mostrar ID y nombre */}
              </option>
            ))}
          </select>
        </div>

      </div>

      {/* Mostrar la tabla solo si se ha seleccionado un grupo y una materia */}
      {selectedGrupo && selectedMateria && calificaciones.length > 0 && (
        <>
          <h4 className="table-heading">Calificaciones de Alumnos</h4>
          <table className="alumnos-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>P1</th>
                <th>P2</th>
                <th>P3</th>
                <th>Final</th>
              </tr>
            </thead>
            <tbody>
              {calificaciones.map((calificacion, index) => (
                <tr key={index}>
                  <td>{calificacion.alumno}</td>
                  <td>
                    <input
                      type="number"
                      value={calificacion.p1}
                      onChange={(e) => handleCalificacionChange(index, 'p1', e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={calificacion.p2}
                      onChange={(e) => handleCalificacionChange(index, 'p2', e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={calificacion.p3}
                      onChange={(e) => handleCalificacionChange(index, 'p3', e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={calificacion.final}
                      onChange={(e) => handleCalificacionChange(index, 'final', e.target.value)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button className="gestionar-calificaciones-button" onClick={handleActualizarCalificaciones}>
            Actualizar Calificaciones
          </button>
        </>
      )}

      <ToastContainer />
    </div>
  );
}

export default GestionarCalificaciones;