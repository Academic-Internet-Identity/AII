import React, { useState, useEffect } from 'react';
import { useCanister } from '@connect2ic/react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/horariosManagementStyles.css';  // Importa la hoja de estilos para horarios

function MiHorario() {
  const [AII_backend] = useCanister('AII_backend');
  const [grupo, setGrupo] = useState(null);
  const [horarios, setHorarios] = useState([]);
  const [materiasDisponibles, setMateriasDisponibles] = useState([]);
  
  const horas = [
    "8:00 a 9:00", "9:00 a 10:00", "10:00 a 11:00", "11:00 a 12:00", 
    "12:00 a 13:00", "15:00 a 16:00", "16:00 a 17:00", "17:00 a 18:00"
  ];
  const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

  // Obtener el grupo del alumno basado en el `caller`
  useEffect(() => {
    const fetchGrupoData = async () => {
      try {
        const grupoAlumno = await AII_backend.getMyGrupo();
        if (grupoAlumno) {
          setGrupo(grupoAlumno);
          await cargarHorarios(grupoAlumno.id);
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

  // Cargar materias disponibles desde el backend
  useEffect(() => {
    const fetchMaterias = async () => {
      try {
        const result = await AII_backend.verMaterias();
        setMateriasDisponibles(result);
      } catch (error) {
        toast.error('Error al obtener las materias.');
        console.error('Error al obtener las materias:', error);
      }
    };
    fetchMaterias();
  }, [AII_backend]);

  // Cargar los horarios del grupo específico
  const cargarHorarios = async (grupoId) => {
    try {
      const horariosData = await AII_backend.verHorarios(grupoId);
      console.log('Horarios Data:', horariosData); // Log para depuración
      if (horariosData && horariosData.length > 0) {
        const horariosConMaterias = horariosData[0].map(h => {
          const materiaEncontrada = materiasDisponibles.find(m => m.codigo === h.materia);
          return { ...h, materia: materiaEncontrada ? materiaEncontrada.nombre : h.materia };
        });
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

  // Renderizar la materia en la tabla de horarios
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
          <p className="horarios-management-instruction">Horario para el grupo <strong>{grupo.nombre}</strong> (ID: {grupo.id}) - Cuatrimestre: {grupo.cuatrimestre.toString()}</p>
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