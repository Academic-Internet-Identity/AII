import React, { useState, useEffect } from 'react';
import { useCanister } from '@connect2ic/react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/horariosManagementStyles.css';

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
    "07:00 a 08:00", "08:00 a 09:00", "09:00 a 10:00", "10:00 a 11:00", "11:00 a 12:00", 
    "12:00 a 13:00", "13:00 a 14:00", "14:00 a 15:00", "15:00 a 16:00", 
    "16:00 a 17:00", "17:00 a 18:00", "18:00 a 19:00", "19:00 a 20:00",
    "20:00 a 21:00"
  ];

  const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

  useEffect(() => {
    const fetchMaterias = async () => {
      try {
        const result = await AII_backend.verMaterias();
        setMateriasDisponibles(result);
      } catch (error) {
        toast.error('Error al obtener las materias.');
      }
    };
    fetchMaterias();
  }, [AII_backend]);

  const cargarHorarios = async (grupoId) => {
    try {
      const horariosData = await AII_backend.verHorarios(grupoId);
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
    }
  };

  const handleAgregarHorario = async () => {
    try {
      if (!grupoId || !materia || !dia || !horaInicio || !horaFin) {
        toast.error('Todos los campos son obligatorios.');
        return;
      }

      const selectedMateria = materiasDisponibles.find(m => m.nombre === materia);
      if (!selectedMateria) {
        toast.error('Seleccione una materia válida.');
        return;
      }

      if (!horas.some(h => h.startsWith(horaInicio))) {
        toast.error('Hora de inicio fuera del rango.');
        return;
      }

      if (!horas.some(h => h.endsWith(horaFin))) {
        toast.error('Hora de fin fuera del rango.');
        return;
      }

      const response = await AII_backend.agregarHorario(grupoId, selectedMateria.codigo, dia, horaInicio, horaFin);
      toast.success(response);
      await cargarHorarios(grupoId);
    } catch (error) {
      toast.error('Error al agregar el horario.');
    }
  };

  const handleEliminarHorario = async () => {
    try {
      if (!grupoId || !materia || !dia || !horaInicio || !horaFin) {
        toast.error('Todos los campos son obligatorios.');
        return;
      }

      const selectedMateria = materiasDisponibles.find(m => m.nombre === materia);
      if (!selectedMateria) {
        toast.error('Seleccione una materia válida.');
        return;
      }

      const response = await AII_backend.eliminarHorario(grupoId, selectedMateria.codigo, dia, horaInicio, horaFin);
      toast.success(response);
      await cargarHorarios(grupoId);
    } catch (error) {
      toast.error('Error al eliminar el horario.');
    }
  };

  useEffect(() => {
    if (grupoId && materiasDisponibles.length > 0) {
      cargarHorarios(grupoId);
    }
  }, [grupoId, materiasDisponibles]);

  const handleVerHorarios = () => {
    cargarHorarios(grupoId);
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
      <h2>Gestión de Horarios</h2>
      <form className="horarios-management-form">
        <div className="horarios-management-form-group">
          <label>ID del Grupo:</label>
          <input
            type="text"
            className="horarios-management-input-text"
            value={grupoId}
            onChange={(e) => setGrupoId(e.target.value)}
            placeholder="Ingrese el ID del grupo"
            required
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
          <label>Hora de Inicio: <span className="horarios-management-time-label">(24 horas)</span></label>
          <input
            type="time"
            className="horarios-management-input-time"
            value={horaInicio}
            onChange={(e) => setHoraInicio(e.target.value)}
            required
          />
        </div>
        <div className="horarios-management-form-group">
          <label>Hora de Fin: <span className="horarios-management-time-label">(24 horas)</span></label>
          <input
            type="time"
            className="horarios-management-input-time"
            value={horaFin}
            onChange={(e) => setHoraFin(e.target.value)}
            required
          />
        </div>
        <div className="horarios-management-buttons">
          <button type="button" className="horarios-management-button" onClick={handleAgregarHorario}>
            Agregar Horario
          </button>
          <button type="button" className="horarios-management-button eliminar" onClick={handleEliminarHorario}>
            Eliminar Horario
          </button>
        </div>
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