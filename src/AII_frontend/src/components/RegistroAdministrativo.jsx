import React, { useState } from 'react';
import { useCanister } from '@connect2ic/react';
import '../styles/registroAdministrativoStyles.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function RegistroAdministrativo() {
  const [AII_backend] = useCanister('AII_backend');
  const [form, setForm] = useState({
    nombre: '', apellidoPaterno: '', apellidoMaterno: '', tipoSanguineo: '', fechaNacimiento: '',
    curp: '', genero: '', lugarNacimiento: '', estadoCivil: '', emailPersonal: '', direcciones: [''],
    telefonos: [''], detallesMedicos: '', numeroSeguroSocial: '', cedulaProfesional: ''
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await AII_backend.registrarseComoAdministrativo(form);
      if (response.startsWith('Error:')) {
        toast.error(response); // Mostrar mensaje de error
      } else {
        toast.success(response); // Mostrar mensaje de éxito
      }
    } catch (error) {
      toast.error('Error al registrar administrativo.');
      console.error('Error al registrar administrativo:', error);
    }
  };

  return (
    <div className="registro-admin-container">
      <h2>Solicitar Registro como Administrativo</h2>
      <form className="registro-admin-form" onSubmit={handleSubmit}>
        <div className="registro-admin-form-group">
          <input type="text" name="nombre" value={form.nombre} onChange={handleChange} placeholder="Nombre" required />
          <input type="text" name="apellidoPaterno" value={form.apellidoPaterno} onChange={handleChange} placeholder="Apellido Paterno" required />
          <input type="text" name="apellidoMaterno" value={form.apellidoMaterno} onChange={handleChange} placeholder="Apellido Materno" required />
          <select name="tipoSanguineo" value={form.tipoSanguineo} onChange={handleChange} required>
            <option value="">Seleccione Tipo Sanguíneo</option>
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
        <div className="registro-admin-form-group">
          {form.direcciones.map((direccion, index) => (
            <input key={index} type="text" value={direccion} onChange={(e) => handleArrayChange(e, index, 'direcciones')} placeholder="Dirección" required />
          ))}
          <div className="registro-admin-add-button-container">
            <button type="button" className="registro-admin-add-button" onClick={() => addArrayField('direcciones')}>Agregar Dirección</button>
          </div>
          
          {form.telefonos.map((telefono, index) => (
            <input key={index} type="text" value={telefono} onChange={(e) => handleArrayChange(e, index, 'telefonos')} placeholder="Teléfono" required />
          ))}
          <div className="registro-admin-add-button-container">
            <button type="button" className="registro-admin-add-button" onClick={() => addArrayField('telefonos')}>Agregar Teléfono</button>
          </div>
          
          <textarea name="detallesMedicos" value={form.detallesMedicos} onChange={handleChange} placeholder="Detalles Médicos" required />
          <input type="text" name="numeroSeguroSocial" value={form.numeroSeguroSocial} onChange={handleChange} placeholder="Número de Seguro Social" required />
          <input type="text" name="cedulaProfesional" value={form.cedulaProfesional} onChange={handleChange} placeholder="Cédula Profesional" required />
        </div>
        
        <button type="submit" className="registro-admin-form-button">Registrar</button>
      </form>
      <ToastContainer />
    </div>
  );
}

export default RegistroAdministrativo;