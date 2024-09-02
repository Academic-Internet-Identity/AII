import React, { useState } from 'react';
import { useCanister } from '@connect2ic/react';
import '../styles/registroAlumnoStyles.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function RegistroAlumno() {
  const [AII_backend] = useCanister('AII_backend');
  const [form, setForm] = useState({
    nombre: '', apellidoPaterno: '', apellidoMaterno: '', tipoSanguineo: '', fechaNacimiento: '',
    curp: '', genero: '', lugarNacimiento: '', estadoCivil: '', emailPersonal: '', direccion: '',
    telefonos: [''], detallesMedicos: '', numeroSeguroSocial: '', escuelaProcedencia: '', ocupaciones: [''],
    tutorJefeFamilia: '', familiares: [''], pertenenciaEtniaIndigena: false, hablaLenguaIndigena: false,
    viveComunidadIndigena: false, folioCeneval: '', emailInstitucional: '', matricula: '', carrera: '', semestre: "",
    nivelDeIngles: '', certificacionDeIngles: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleArrayChange = (e, index, field) => {
    const newArray = form[field].slice();
    newArray[index] = e.target.value;
    setForm({ ...form, [field]: newArray });
  };

  const addArrayField = (field) => {
    setForm({ ...form, [field]: [...form[field], ''] });
  };

  const removeArrayField = (index, field) => {
    const newArray = [...form[field]];
    newArray.splice(index, 1);
    setForm({ ...form, [field]: newArray });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formToSend = { ...form, semestre: Number(form.semestre) };
      const response = await AII_backend.registrarseComoAlumno(formToSend);
      toast.success(response);
    } catch (error) {
      toast.error('Error al registrar alumno.');
      console.error('Error al registrar alumno:', error);
    }
  };

  return (
    <div className="registro-alumno-container">
      <h2>Registrar Alumno</h2>
      <form className="registro-alumno-form" onSubmit={handleSubmit}>
        <div className="registro-alumno-form-group">
          <input type="text" name="nombre" value={form.nombre} onChange={handleChange} placeholder="Nombre" required />
          <input type="text" name="apellidoPaterno" value={form.apellidoPaterno} onChange={handleChange} placeholder="Apellido Paterno" required />
          <input type="text" name="apellidoMaterno" value={form.apellidoMaterno} onChange={handleChange} placeholder="Apellido Materno" required />
          <select name="tipoSanguineo" value={form.tipoSanguineo} onChange={handleChange} required>
            <option value="">Seleccione Tipo Sanguíneo</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
          </select>
          <input type="date" name="fechaNacimiento" value={form.fechaNacimiento} onChange={handleChange} placeholder="Fecha de Nacimiento" required />
          <input type="text" name="curp" value={form.curp} onChange={handleChange} placeholder="CURP" required />
          <select name="genero" value={form.genero} onChange={handleChange} required>
            <option value="">Seleccione Género</option>
            <option value="Femenino">Femenino</option>
            <option value="Masculino">Masculino</option>
          </select>
          <input type="text" name="lugarNacimiento" value={form.lugarNacimiento} onChange={handleChange} placeholder="Lugar de Nacimiento" required />
          <select name="estadoCivil" value={form.estadoCivil} onChange={handleChange} required>
            <option value="">Seleccione Estado Civil</option>
            <option value="soltero/a">Soltero/a</option>
            <option value="casado por lo civil">Casado por lo civil</option>
            <option value="divorciado legalmente">Divorciado legalmente</option>
            <option value="separado legalmente">Separado legalmente</option>
            <option value="viudo de matrimonio civil">Viudo de matrimonio civil</option>
            <option value="viudo de matrimonio religioso">Viudo de matrimonio religioso</option>
            <option value="viudo de matrimonio civil y religioso">Viudo de matrimonio civil y religioso</option>
            <option value="vive en unión libre">Vive en unión libre</option>
            <option value="separado de unión libre">Separado de unión libre</option>
            <option value="viudo de unión libre">Viudo de unión libre</option>
          </select>
          <input type="email" name="emailPersonal" value={form.emailPersonal} onChange={handleChange} placeholder="Email Personal" required />
        </div>
        <div className="registro-alumno-form-group">
          <input type="text" name="direccion" value={form.direccion} onChange={handleChange} placeholder="Dirección" required />
          
          {form.telefonos.map((telefono, index) => (
            <div key={index} className="registro-alumno-field-with-button">
              <input type="text" value={telefono} onChange={(e) => handleArrayChange(e, index, 'telefonos')} placeholder="Teléfono" required />
              <button type="button" className="registro-alumno-remove-button" onClick={() => removeArrayField(index, 'telefonos')}>Eliminar</button>
            </div>
          ))}
          <div className="registro-alumno-add-button-container">
            <button type="button" className="registro-alumno-add-button" onClick={() => addArrayField('telefonos')}>Agregar Teléfono</button>
          </div>
          
          <textarea name="detallesMedicos" value={form.detallesMedicos} onChange={handleChange} placeholder="Detalles Médicos" required />
          <input type="text" name="numeroSeguroSocial" value={form.numeroSeguroSocial} onChange={handleChange} placeholder="Número de Seguro Social" required />
          
          <input type="text" name="escuelaProcedencia" value={form.escuelaProcedencia} onChange={handleChange} placeholder="Escuela de Procedencia" required />
          
          {form.ocupaciones.map((ocupacion, index) => (
            <div key={index} className="registro-alumno-field-with-button">
              <input type="text" value={ocupacion} onChange={(e) => handleArrayChange(e, index, 'ocupaciones')} placeholder="Ocupación" required />
              <button type="button" className="registro-alumno-remove-button" onClick={() => removeArrayField(index, 'ocupaciones')}>Eliminar</button>
            </div>
          ))}
          <div className="registro-alumno-add-button-container">
            <button type="button" className="registro-alumno-add-button" onClick={() => addArrayField('ocupaciones')}>Agregar Ocupación</button>
          </div>
          
          <input type="text" name="tutorJefeFamilia" value={form.tutorJefeFamilia} onChange={handleChange} placeholder="Tutor o Jefe de Familia" required />
          
          {form.familiares.map((familiar, index) => (
            <div key={index} className="registro-alumno-field-with-button">
              <input type="text" value={familiar} onChange={(e) => handleArrayChange(e, index, 'familiares')} placeholder="Familiar" required />
              <button type="button" className="registro-alumno-remove-button" onClick={() => removeArrayField(index, 'familiares')}>Eliminar</button>
            </div>
          ))}
          <div className="registro-alumno-add-button-container">
            <button type="button" className="registro-alumno-add-button" onClick={() => addArrayField('familiares')}>Agregar Familiar</button>
          </div>
          
          <div className="registro-alumno-checkbox-group">
            <label>
              <input type="checkbox" name="pertenenciaEtniaIndigena" checked={form.pertenenciaEtniaIndigena} onChange={handleChange} />
              Pertenencia a Etnia Indígena
              </label>
            <label>
              <input type="checkbox" name="hablaLenguaIndigena" checked={form.hablaLenguaIndigena} onChange={handleChange} />
              Habla Lengua Indígena
            </label>
            <label>
              <input type="checkbox" name="viveComunidadIndigena" checked={form.viveComunidadIndigena} onChange={handleChange} />
              Vive en Comunidad Indígena
            </label>
          </div>
          
          <input type="text" name="folioCeneval" value={form.folioCeneval} onChange={handleChange} placeholder="Folio CENEVAL" required />
          <input type="email" name="emailInstitucional" value={form.emailInstitucional} onChange={handleChange} placeholder="Email Institucional" required />
          <input type="text" name="matricula" value={form.matricula} onChange={handleChange} placeholder="Matrícula" required />
          <select name="carrera" value={form.carrera} onChange={handleChange} required>
            <option value="">Seleccione Carrera</option>
            <option value="TSU TI Inteligencia Artificial">TSU TI Inteligencia Artificial</option>
            <option value="TSU TI Desarrollo de Software">TSU TI Desarrollo de Software</option>
            <option value="TSU Operaciones Comerciales Área Negocios Internacionales">TSU Operaciones Comerciales Área Negocios Internacionales</option>
            <option value="TSU Procesos Industriales Área Gestión de Calidad">TSU Procesos Industriales Área Gestión de Calidad</option>
            <option value="TSU Mecatrónica Área Robótica">TSU Mecatrónica Área Robótica</option>
            <option value="TSU Nanotecnología Área Materiales">TSU Nanotecnología Área Materiales</option>
          </select>
          <input type="number" name="semestre" value={form.semestre} onChange={handleChange} placeholder="Semestre" required min="1" />
          <select name="nivelDeIngles" value={form.nivelDeIngles} onChange={handleChange} required>
            <option value="">Seleccione Nivel de Inglés</option>
            <option value="A1">A1</option>
            <option value="A2">A2</option>
            <option value="B1">B1</option>
            <option value="B2">B2</option>
            <option value="C1">C1</option>
            <option value="C2">C2</option>
          </select>
          <div className="registro-alumno-checkbox-group">
            <label>
              <input type="checkbox" name="certificacionDeIngles" checked={form.certificacionDeIngles} onChange={handleChange} />
              Certificación de Inglés
            </label>
          </div>
        </div>
        <button type="submit" className="registro-alumno-form-button">Registrar</button>
      </form>
      <ToastContainer />
    </div>
  );
}

export default RegistroAlumno;
