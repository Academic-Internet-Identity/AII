import React, { useState } from 'react';
import { useCanister } from '@connect2ic/react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/horariosManagementStyles.css';  // Importa la hoja de estilos para horarios

function HorariosManagement() {
  const [AII_backend] = useCanister('AII_backend');
  const [grupoId, setGrupoId] = useState('');
  const [dia, setDia] = useState('');
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFin, setHoraFin] = useState('');
  const [horarios, setHorarios] = useState([]);

  const handleAgregarHorario = async () => {
    try {
      const response = await AII_backend.agregarHorario(grupoId, dia, horaInicio, horaFin);
      toast.success(response);
      cargarHorarios(grupoId); // Recargar los horarios
    } catch (error) {
      toast.error('Error al agregar el horario.');
      console.error('Error:', error);
    }
  };

  const cargarHorarios = async (grupoId) => {
    try {
      const horariosData = await AII_backend.verHorarios(grupoId);
      if (horariosData[0]) {  // Verifica si hay datos en la respuesta
        setHorarios(horariosData[0]);
      } else {
        setHorarios([]);
        toast.info('No hay horarios disponibles para este grupo.');
      }
    } catch (error) {
      toast.error('Error al cargar los horarios.');
      console.error('Error:', error);
    }
  };

  const handleVerHorarios = () => {
    cargarHorarios(grupoId);
  };

  return (
    <div className="horarios-management-container">
      <h2>Gestión de Horarios</h2>
      <p className="horarios-management-instruction">Ingrese el ID del grupo para ver los horarios correspondientes.</p>
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
          <label>Día:</label>
          <input
            type="text"
            className="horarios-management-input-text"
            value={dia}
            onChange={(e) => setDia(e.target.value)}
            placeholder="Ingrese el día"
          />
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
                <th>Día</th>
                <th>Hora de Inicio</th>
                <th>Hora de Fin</th>
              </tr>
            </thead>
            <tbody>
              {horarios.map((horario, index) => (
                <tr key={index}>
                  <td>{horario.dia}</td>
                  <td>{horario.horaInicio}</td>
                  <td>{horario.horaFin}</td>
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
