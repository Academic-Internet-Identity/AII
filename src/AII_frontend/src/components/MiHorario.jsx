import React, { useState, useEffect } from 'react';
import { useCanister } from '@connect2ic/react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/horariosManagementStyles.css';

function MiHorario() {
  const [AII_backend] = useCanister('AII_backend');
  const [grupo, setGrupo] = useState(null);
  const [horarios, setHorarios] = useState([]);
  const [materiasDisponibles, setMateriasDisponibles] = useState([]);

  const horas = [
    "07:00 a 08:00", "08:00 a 09:00", "09:00 a 10:00", "10:00 a 11:00", "11:00 a 12:00", 
    "12:00 a 13:00", "13:00 a 14:00", "14:00 a 15:00", "15:00 a 16:00", 
    "16:00 a 17:00", "17:00 a 18:00", "18:00 a 19:00", "19:00 a 20:00",
    "20:00 a 21:00"
  ];
  
  const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

  useEffect(() => {
    const fetchGrupoData = async () => {
      try {
        const grupoAlumno = await AII_backend.getMyGrupo();
        console.log("Grupo obtenido del backend: ", grupoAlumno);
        if (grupoAlumno && grupoAlumno.length > 0) {
          const grupoInfo = grupoAlumno[0];
          setGrupo({
            id: grupoInfo.id,
            nombre: grupoInfo.nombre,
            cuatrimestre: grupoInfo.cuatrimestre.toString()
          });
          await fetchMateriasYHorarios(grupoInfo.id);
        } else {
          toast.info('No se encontró el grupo del alumno.');
        }
      } catch (error) {
        toast.error('Error al cargar los datos del grupo.');
        console.error('Error al cargar los datos del grupo:', error);
      }
    };

    fetchGrupoData();
  }, [AII_backend]);

  const fetchMateriasYHorarios = async (grupoId) => {
    try {
      const [materias, horariosData] = await Promise.all([
        AII_backend.verMaterias(),
        AII_backend.verHorarios(grupoId)
      ]);

      console.log("Materias disponibles: ", materias);
      setMateriasDisponibles(materias);

      if (horariosData && horariosData[0] && horariosData[0].length > 0) {
        const horariosConMaterias = horariosData[0].map(h => {
          const materiaEncontrada = materias.find(m => m.codigo.toString() === h.materia.toString());
          return { ...h, materia: materiaEncontrada ? materiaEncontrada.nombre : h.materia };
        });

        console.log('Horarios con materias asignadas:', horariosConMaterias);
        setHorarios(horariosConMaterias);
      } else {
        setHorarios([]);
        toast.info('No hay horarios disponibles para este grupo.');
      }
    } catch (error) {
      toast.error('Error al cargar los horarios.');
      console.error('Error al cargar los horarios:', error);
    }
  };

  const renderHorario = (dia, hora) => {
    const [horaInicio] = hora.split(' a ');
    const horarioEncontrado = horarios.filter(h => h.dia === dia && h.horaInicio === horaInicio);

    if (horarioEncontrado.length > 0) {
      return horarioEncontrado.map(h => h.materia).join(', ');
    }
    return '';
  };

  return (
    <div className="horarios-management-container">
      <h2>Mi Horario</h2>
      {grupo ? (
        <div>
          <p className="horarios-management-instruction">
            Horario para el grupo <strong>{grupo.nombre}</strong> (ID: {grupo.id}) - Cuatrimestre: {grupo.cuatrimestre !== 'undefined' ? grupo.cuatrimestre : 'N/A'}
          </p>
          {horarios.length > 0 ? (
            <table className="horarios-table">
              <thead>
                <tr>
                  <th>Horario</th>
                  {diasSemana.map(dia => (
                    <th key={dia}>{dia}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {horas.map((hora, idx) => (
                  <tr key={idx}>
                    <td>{hora}</td>
                    {diasSemana.map(dia => (
                      <td key={dia}>{renderHorario(dia, hora)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No hay horarios disponibles para este grupo.</p>
          )}
        </div>
      ) : (
        <p>Cargando datos del grupo...</p>
      )}
      <ToastContainer />
    </div>
  );
}

export default MiHorario;
