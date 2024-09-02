import React from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/formularioServiciosStyles.css';

const FormularioServicios = () => {

  const handleSubmit = (event) => {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const name = document.getElementById('name').value;
    const matricula = document.getElementById('matricula').value;
    const carrera = document.getElementById('carrera').value;
    const grado = document.getElementById('grado').value;
    const solicitud = document.getElementById('solicitud').value;
    const tramite = document.getElementById('tramite').value;

    // Verificación de campos
    if (!email || !name || !matricula || !carrera || !grado || !solicitud || !tramite) {
      toast.warn('Por favor, completa todos los campos obligatorios.');
      return;
    }

    // Validación del formato de email
    const emailPattern = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
    if (!emailPattern.test(email)) {
      toast.warn('Por favor, introduce un correo electrónico válido.');
      return;
    }

    // Si todo está correcto
    toast.success('Envío exitoso');
  };

  return (
    <div className="servicios-form-container">
      <h2 className="servicios-form-title">Solicitud de Trámites de Servicios Escolares</h2>
      <form className="servicios-form" noValidate onSubmit={handleSubmit}>
        <div className="servicios-form-group">
          <label htmlFor="email" className="servicios-form-label">Correo electrónico *</label>
          <input
            type="email"
            id="email"
            className="servicios-form-input"
            placeholder="Tu dirección de correo electrónico"
            required
            pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
            title="Por favor, introduce un correo electrónico válido."
          />
        </div>
        
        <div className="servicios-form-group">
          <label htmlFor="name" className="servicios-form-label">NOMBRE *</label>
          <input
            type="text"
            id="name"
            className="servicios-form-input"
            placeholder="EJEMPLO: PEREZ PEREZ JUAN"
            required
          />
        </div>

        <div className="servicios-form-group">
          <label htmlFor="matricula" className="servicios-form-label">MATRÍCULA *</label>
          <input
            type="text"
            id="matricula"
            className="servicios-form-input"
            placeholder="EJEMPLO: 21010400"
            required
          />
        </div>

        <div className="servicios-form-group">
          <label htmlFor="carrera" className="servicios-form-label">CARRERA *</label>
          <select id="carrera" className="servicios-form-select" required>
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
          <label htmlFor="grado" className="servicios-form-label">GRADO *</label>
          <input
            type="text"
            id="grado"
            className="servicios-form-input"
            placeholder="Tu respuesta"
            required
          />
        </div>

        <div className="servicios-form-group">
          <label htmlFor="solicitud" className="servicios-form-label">TIPO DE SOLICITUD *</label>
          <select id="solicitud" className="servicios-form-select" required>
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
          <label htmlFor="tramite" className="servicios-form-label">INDICAR EL TRÁMITE PARA EL QUE NECESITA EL DOCUMENTO *</label>
          <select id="tramite" className="servicios-form-select" required>
            <option value="" disabled selected>Seleccione el trámite</option>
            <option value="motivos-personales">MOTIVOS PERSONALES</option>
            <option value="cartilla-militar">CARTILLA MILITAR</option>
            <option value="visa-pasaporte">VISA O PASAPORTE</option>
            <option value="otros">Otros</option>
          </select>
        </div>

        <div className="servicios-form-group">
          <label htmlFor="comments" className="servicios-form-label">COMENTARIOS ADICIONALES</label>
          <textarea
            id="comments"
            className="servicios-form-textarea"
            placeholder="Tu respuesta"
          ></textarea>
        </div>

        <button type="submit" className="servicios-form-button">Enviar Solicitud</button>
      </form>
      <ToastContainer />
    </div>
  );
}

export default FormularioServicios;
