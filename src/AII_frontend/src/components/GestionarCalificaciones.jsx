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
  const [materiasDetalle, setMateriasDetalle] = useState([]);
  const [selectedGrupo, setSelectedGrupo] = useState('');
  const [selectedMateria, setSelectedMateria] = useState('');
  const [calificaciones, setCalificaciones] = useState([]);
  const [editable, setEditable] = useState(false);

  useEffect(() => {
    const fetchGruposYMaterias = async () => {
      try {
        const gruposResult = await AII_backend.verGrupos();
        setGrupos(gruposResult);
        const materiasResult = await AII_backend.verMaterias();
        setMateriasDetalle(materiasResult);
      } catch (error) {
        toast.error('Error al cargar los grupos y materias.');
      }
    };

    fetchGruposYMaterias();
  }, [AII_backend]);

  useEffect(() => {
    const fetchAlumnosYMaterias = async () => {
      if (selectedGrupo) {
        try {
          const grupoData = await AII_backend.verGrupo(selectedGrupo);

          if (grupoData && grupoData[0]) {
            const alumnosList = grupoData[0].alumnos;

            if (alumnosList && alumnosList.length > 0) {
              const alumnosConCalificaciones = alumnosList.map(alumno => {
                const materiasConCalificaciones = alumno.materias.map(materia => {
                  const { p1, p2, p3, final } = materia.calificaciones;

                  return {
                    ...materia,
                    calificaciones: {
                      p1: p1?.length > 0 ? p1.toString() : '',
                      p2: p2?.length > 0 ? p2.toString() : '',
                      p3: p3?.length > 0 ? p3.toString() : '',
                      final: final?.length > 0 ? final.toString() : '',
                    },
                  };
                });

                return {
                  ...alumno,
                  materias: materiasConCalificaciones,
                };
              });

              setAlumnos(alumnosConCalificaciones);

              const materiasDelGrupo = alumnosList[0].materias.map((materia) => {
                const detalleMateria = materiasDetalle.find(
                  (mat) => mat.codigo === materia.materia
                );
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
        }
      }
    };

    fetchAlumnosYMaterias();
  }, [selectedGrupo, materiasDetalle, AII_backend]);

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
      setCalificaciones([]);
    }
  }, [selectedMateria, alumnos]);

  const handleCalificacionChange = (index, campo, valor) => {
    const nuevasCalificaciones = [...calificaciones];
    nuevasCalificaciones[index][campo] = valor;
    setCalificaciones(nuevasCalificaciones);
  };

  const handleActualizarCalificaciones = async () => {
    for (const calificacion of calificaciones) {
      const updates = [
        { parcial: 'p1', valor: calificacion.p1 },
        { parcial: 'p2', valor: calificacion.p2 },
        { parcial: 'p3', valor: calificacion.p3 },
        { parcial: 'final', valor: calificacion.final }
      ];

      const alumnoData = alumnos.find(al => al.nombre === calificacion.alumno);
      const alumnoId = alumnoData ? alumnoData.alumno : null;

      if (!alumnoId) {
        toast.error(`No se encontró el ID del alumno para ${calificacion.alumno}`);
        continue;
      }

      try {
        for (const { parcial, valor } of updates) {
          if (valor !== '') {
            await AII_backend.actualizarCalificacionPorMateria(
              selectedGrupo,
              alumnoId,
              selectedMateria,
              parcial,
              parseInt(valor) || 0
            );
          }
        }
        toast.success(`Calificaciones actualizadas para ${calificacion.alumno}`);
      } catch (error) {
        toast.error(`Error al actualizar las calificaciones para ${calificacion.alumno}`);
      }
    }

    const grupoData = await AII_backend.verGrupo(selectedGrupo);
    if (grupoData && grupoData[0]) {
      const alumnosList = grupoData[0].alumnos;
      setAlumnos(alumnosList);
    }
  };

  const toggleEditarCalificaciones = () => {
    setEditable(!editable);
  };

  return (
    <div className="gestionar-calificaciones-container">
      <h2 className="gestionar-calificaciones-heading">Gestionar Calificaciones</h2>

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
                {materia.codigo} - {materia.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

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
                      disabled={!editable}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={calificacion.p2}
                      onChange={(e) => handleCalificacionChange(index, 'p2', e.target.value)}
                      disabled={!editable}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={calificacion.p3}
                      onChange={(e) => handleCalificacionChange(index, 'p3', e.target.value)}
                      disabled={!editable}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={calificacion.final}
                      onChange={(e) => handleCalificacionChange(index, 'final', e.target.value)}
                      disabled={!editable}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button className="gestionar-calificaciones-button" onClick={toggleEditarCalificaciones}>
            {editable ? 'Deshabilitar Edición' : 'Habilitar Edición'}
          </button>

          {editable && (
            <button className="gestionar-calificaciones-button" onClick={handleActualizarCalificaciones}>
              Actualizar Calificaciones
            </button>
          )}
        </>
      )}

      <ToastContainer />
    </div>
  );
}

export default GestionarCalificaciones;