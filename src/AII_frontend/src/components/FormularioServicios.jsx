import React, { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { useCanister } from '@connect2ic/react';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/formularioServiciosStyles.css';  // Manteniendo tu estilo previo

const FormularioTramite = () => {
  const [AII_backend] = useCanister('AII_backend');

  // Estado del formulario
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    matricula: '',
    carrera: '',
    grado: '',
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

    const { email, name, matricula, carrera, grado, tipoSolicitud, tramite, comentarios } = formData;

    // Validaciones básicas
    if (!email || !name || !matricula || !carrera || !grado || !tipoSolicitud || !tramite) {
      toast.warn('Por favor, completa todos los campos obligatorios.');
      return;
    }

    // Validación del formato de email
    const emailPattern = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
    if (!emailPattern.test(email)) {
      toast.warn('Por favor, introduce un correo electrónico válido.');
      return;
    }

    // Preparar el campo de comentarios como opcional
    const comentariosOpt = comentarios.trim() === '' ? [] : [comentarios];

    try {
      // Llamada al backend para crear el trámite
      const response = await AII_backend.IniciarTramite(
        email,
        name,
        matricula,
        carrera,
        parseInt(grado),
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
          <label htmlFor="email" className="servicios-form-label">Correo electrónico *</label>
          <input
            type="email"
            id="email"
            name="email"
            className="servicios-form-input"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Tu dirección de correo electrónico"
            required
          />
        </div>
        
        <div className="servicios-form-group">
          <label htmlFor="name" className="servicios-form-label">Nombre Completo *</label>
          <input
            type="text"
            id="name"
            name="name"
            className="servicios-form-input"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Ejemplo: Pérez Pérez Juan"
            required
          />
        </div>

        <div className="servicios-form-group">
          <label htmlFor="matricula" className="servicios-form-label">Matrícula *</label>
          <input
            type="text"
            id="matricula"
            name="matricula"
            className="servicios-form-input"
            value={formData.matricula}
            onChange={handleInputChange}
            placeholder="Ejemplo: 21010400"
            required
          />
        </div>

        <div className="servicios-form-group">
          <label htmlFor="carrera" className="servicios-form-label">Carrera *</label>
          <select
            id="carrera"
            name="carrera"
            className="servicios-form-select"
            value={formData.carrera}
            onChange={handleInputChange}
            required
          >
            <option value="" disabled selected>Seleccione su carrera</option>
            <option value="MTR">TSU MECATRONICA ÁREA ROBOTICA (MTR)</option>
            <option value="NANO">TSU EN NANOTECNOLOGIA AREA MATERIALES (NANO)</option>
            <option value="OCINI">TSU EN OPERACIONES COMERCIALES INTERNACIONALES AREA NEGOCIOS INTERNACIONALES (OCINI)</option>
            <option value="TISDM">TSU EN TECNOLOGIAS DE LA INFORMACION AREA DESARROLLO DE SOFTWARE MULTIPLATAFORMA (TISDM)</option>
            <option value="TIIA">TSU EN TECNOLOGIAS DE LA INFORMACION AREA INTELIGENCIA ARTIFICIAL (TIIA)</option>
            <option value="PISGC">TSU EN PROCESOS INDUSTRIALES AREA SISTEMA DE GESTION DE LA CALIDAD (PISGC)</option>
            <option value="IMT">INGENIERÍA EN MECATRÓNICA (IMT)</option>
            <option value="INANO">INGENIERÍA EN NANOTECNOLOGÍA (INANO)</option>
            <option value="IDGS">INGENIERÍA EN DESARROLLO Y GESTIÓN DE SOFTWARE (IDGS)</option>
            <option value="ILI">INGENIERÍA EN LOGÍSTICA INTERNACIONAL (ILI)</option>
          </select>
        </div>

        <div className="servicios-form-group">
          <label htmlFor="grado" className="servicios-form-label">Grado *</label>
          <input
            type="number"
            id="grado"
            name="grado"
            className="servicios-form-input"
            value={formData.grado}
            onChange={handleInputChange}
            placeholder="Ejemplo: 1"
            required
          />
        </div>

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
            <option value="" disabled selected>Seleccione el tipo de solicitud</option>
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
            <option value="" disabled selected>Seleccione el trámite</option>
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