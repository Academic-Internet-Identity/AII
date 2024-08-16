import React, { useState } from 'react';
import { useCanister } from '@connect2ic/react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/inglesManagementStyles.css';  // Importa la nueva hoja de estilos

function InglesManagement() {
  const [AII_backend] = useCanister('AII_backend');
  const [matricula, setMatricula] = useState('');
  const [nuevoNivel, setNuevoNivel] = useState('');
  const [certificacion, setCertificacion] = useState(false);

  const handleNivelChange = async () => {
    try {
      const response = await AII_backend.actualizarNivelDeIngles(matricula, nuevoNivel);
      toast.success(response);
    } catch (error) {
      toast.error('Error al actualizar el nivel de inglés.');
      console.error('Error:', error);
    }
  };

  const handleCertificacionChange = async () => {
    try {
      const response = await AII_backend.modificarCertificacionDeIngles(matricula, certificacion);
      toast.success(response);
    } catch (error) {
      toast.error('Error al modificar la certificación de inglés.');
      console.error('Error:', error);
    }
  };

  return (
    <div className="ingles-management-container">
      <h2>Gestión de Inglés</h2>
      <form className="ingles-management-form">
        <div className="form-group">
          <label>Matrícula del Alumno:</label>
          <input
            type="text"
            value={matricula}
            onChange={(e) => setMatricula(e.target.value)}
            placeholder="Ingrese la matrícula del alumno"
          />
        </div>
        <div className="form-group">
          <label>Nuevo Nivel de Inglés:</label>
          <select value={nuevoNivel} onChange={(e) => setNuevoNivel(e.target.value)}>
            <option value="">Seleccione un nivel</option>
            <option value="A1">A1</option>
            <option value="A2">A2</option>
            <option value="B1">B1</option>
            <option value="B2">B2</option>
            <option value="C1">C1</option>
            <option value="C2">C2</option>
          </select>
          <button type="button" onClick={handleNivelChange}>Actualizar Nivel</button>
        </div>
        <div className="form-group">
          <label>Certificación de Inglés:</label>
          <input
            type="checkbox"
            checked={certificacion}
            onChange={(e) => setCertificacion(e.target.checked)}
          />
          <label>{certificacion ? "Certificado" : "No Certificado"}</label>
          <button type="button" onClick={handleCertificacionChange}>Modificar Certificación</button>
          <small className="text-muted">* Solo disponible para Administrativos</small>
        </div>
      </form>
      <ToastContainer />
    </div>
  );
}

export default InglesManagement;