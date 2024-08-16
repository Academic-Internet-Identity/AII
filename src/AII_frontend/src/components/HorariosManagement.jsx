import React, { useState, useEffect } from 'react';
import { useCanister } from '@connect2ic/react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/horariosManagementStyles.css';  // Importa la hoja de estilos para horarios

function HorariosManagement() {
  const [AII_backend] = useCanister('AII_backend');
  const [grupoId, setGrupoId] = useState('');
  const [materia, setMateria] = useState('');
  const [dia, setDia] = useState('');
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFin, setHoraFin] = useState('');
  const [horarios, setHorarios] = useState([]);
  const [materiasDisponibles, setMateriasDisponibles] = useState([]);

  const horas = [
    "8:00 a 9:00", "9:00 a 10:00", "10:00 a 11:00", "11:00 a 12:00", 
    "12:00 a 13:00", "15:00 a 16:00", "16:00 a 17:00", "17:00 a 18:00"
  ];
  const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

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

  // Cargar los horarios de un grupo específico
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

  // Recargar horarios tras añadir o modificar un horario
  const handleAgregarHorario = async () => {
    try {
      const selectedMateria = materiasDisponibles.find(m => m.nombre === materia);
      if (!selectedMateria) {
        toast.error('Seleccione una materia válida.');
        return;
      }

      const response = await AII_backend.agregarHorario(grupoId, selectedMateria.codigo, dia, horaInicio, horaFin);
      toast.success(response);
      await cargarHorarios(grupoId); // Asegurar que los horarios se recarguen después de agregar
    } catch (error) {
      toast.error('Error al agregar el horario.');
      console.error('Error al agregar el horario:', error);
    }
  };

  // Este efecto asegura que los horarios se carguen cada vez que cambien las materias disponibles o el grupoId
  useEffect(() => {
    if (grupoId && materiasDisponibles.length > 0) {
      cargarHorarios(grupoId);
    }
  }, [grupoId, materiasDisponibles]);

  const handleVerHorarios = () => {
    cargarHorarios(grupoId);
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
      <h2>Gestión de Horarios</h2>
      <p className="horarios-management-instruction">Ingrese el ID del grupo y seleccione una materia para agregar o ver horarios.</p>
      <form className="horarios-management-form">
        <div className="horarios-management-form-group">
          <label>ID del Grupo:</label>
          <input
            type="text"
            className="horarios-management-input-text"
            value={grupoId}
            onChange={(e) => setGrupoId(e.target.value)}
            placeholder="Ingrese el ID del grupo"
          />
        </div>
        <div className="horarios-management-form-group">
          <label>Materia:</label>
          <select
            className="horarios-management-select"
            value={materia}
            onChange={(e) => setMateria(e.target.value)}
            required
          >
            <option value="">Seleccione una Materia</option>
            {materiasDisponibles.map((materia, idx) => (
              <option key={idx} value={materia.nombre}>{materia.nombre}</option>
            ))}
          </select>
        </div>
        <div className="horarios-management-form-group">
          <label>Día:</label>
          <select
            className="horarios-management-select"
            value={dia}
            onChange={(e) => setDia(e.target.value)}
            required
          >
            <option value="">Seleccione un Día</option>
            {diasSemana.map((dia, idx) => (
              <option key={idx} value={dia}>{dia}</option>
            ))}
          </select>
        </div>
        <div className="horarios-management-form-group">
          <label>Hora de Inicio:</label>
          <input
            type="time"
            className="horarios-management-input-time"
            value={horaInicio}
            onChange={(e) => setHoraInicio(e.target.value)}
          />
        </div>
        <div className="horarios-management-form-group">
          <label>Hora de Fin:</label>
          <input
            type="time"
            className="horarios-management-input-time"
            value={horaFin}
            onChange={(e) => setHoraFin(e.target.value)}
          />
        </div>
        <button type="button" className="horarios-management-button" onClick={handleAgregarHorario}>
          Agregar Horario
        </button>
      </form>

      <div className="horarios-management-list">
        <button type="button" className="horarios-management-button" onClick={handleVerHorarios}>
          Ver Horarios
        </button>
        {horarios.length > 0 && (
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
        )}
      </div>
      <ToastContainer />
    </div>
  );
}

export default HorariosManagement;
