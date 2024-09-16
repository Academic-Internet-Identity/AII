import React, { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { useCanister } from '@connect2ic/react';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/formularioServiciosStyles.css';

const FormularioTramite = () => {
  const [AII_backend] = useCanister('AII_backend');

  // Estado para el formulario
  const [formData, setFormData] = useState({
    tipoSolicitud: '',
    tramite: '',
    comentarios: '',
  });

  // Manejo de cambios en los inputs
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Manejo del envío del formulario
  const handleSubmit = async (event) => {
    event.preventDefault();

    const { tipoSolicitud, tramite, comentarios } = formData;

    // Validaciones básicas
    if (!tipoSolicitud || !tramite) {
      toast.warn('Por favor, completa todos los campos obligatorios.');
      return;
    }

    try {
      // Preparar el campo de comentarios como opcional
      const comentariosOpt = comentarios.trim() === '' ? [] : [comentarios];

      // Llamada al backend para crear el trámite
      const response = await AII_backend.IniciarTramite(
        tipoSolicitud,
        tramite,
        comentariosOpt
      );

      toast.success(response);
    } catch (error) {
      toast.error('Error al iniciar el trámite. Por favor, inténtalo de nuevo.');
      console.error('Error en la creación del trámite:', error);
    }
  };

  return (
    <div className="servicios-form-container">
      <h2 className="servicios-form-title">Solicitud de Trámites de Servicios Escolares</h2>
      <form className="servicios-form" onSubmit={handleSubmit}>
        <div className="servicios-form-group">
          <label htmlFor="tipoSolicitud" className="servicios-form-label">Tipo de Solicitud *</label>
          <select
            id="tipoSolicitud"
            name="tipoSolicitud"
            className="servicios-form-select"
            value={formData.tipoSolicitud}
            onChange={handleInputChange}
            required
          >
            <option value="" disabled>Seleccione el tipo de solicitud</option>
            <option value="constancia-simple">CONSTANCIA SIMPLE</option>
            <option value="constancia-promedio">CONSTANCIA CON PROMEDIO GRAL</option>
            <option value="constancia-cuatrimestre-anterior">CONSTANCIA CON PROMEDIO DEL CUATRIMESTRE ANTERIOR</option>
            <option value="constancia-termino-estudios">CONSTANCIA DE TÉRMINO DE ESTUDIOS (únicamente para egresados)</option>
            <option value="historial-academico">HISTORIAL ACADÉMICO</option>
            <option value="certificado-parcial">CERTIFICADO PARCIAL</option>
            <option value="plan-estudios">PLAN DE ESTUDIOS</option>
          </select>
        </div>

        <div className="servicios-form-group">
          <label htmlFor="tramite" className="servicios-form-label">Trámite *</label>
          <select
            id="tramite"
            name="tramite"
            className="servicios-form-select"
            value={formData.tramite}
            onChange={handleInputChange}
            required
          >
            <option value="" disabled>Seleccione el trámite</option>
            <option value="motivos-personales">MOTIVOS PERSONALES</option>
            <option value="cartilla-militar">CARTILLA MILITAR</option>
            <option value="visa-pasaporte">VISA O PASAPORTE</option>
            <option value="otros">Otros</option>
          </select>
        </div>

        <div className="servicios-form-group">
          <label htmlFor="comentarios" className="servicios-form-label">Comentarios Adicionales (Opcional)</label>
          <textarea
            id="comentarios"
            name="comentarios"
            className="servicios-form-textarea"
            value={formData.comentarios}
            onChange={handleInputChange}
            placeholder="Ingresa comentarios si los tienes"
          />
        </div>

        <button type="submit" className="servicios-form-button">Enviar Solicitud</button>
      </form>
      <ToastContainer />
    </div>
  );
};

export default FormularioTramite;