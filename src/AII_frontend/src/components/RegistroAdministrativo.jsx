import React, { useState } from 'react';
import { useCanister } from '@connect2ic/react';
import '../styles/registroAdministrativoStyles.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Función para extraer datos del CURP
const extractCurpData = (curp) => {
  if (curp.length !== 18) {
    return null;
  }

  const year = curp.slice(4, 6);
  const month = curp.slice(6, 8);
  const day = curp.slice(8, 10);
  const gender = curp[10];
  const placeCode = curp.slice(11, 13);

  const placeMap = {
    AS: "Aguascalientes",
    BC: "Baja California",
    BS: "Baja California Sur",
    CC: "Campeche",
    CL: "Coahuila de Zaragoza",
    CM: "Colima",
    CS: "Chiapas",
    CH: "Chihuahua",
    DF: "Ciudad de México",
    DG: "Durango",
    GT: "Guanajuato",
    GR: "Guerrero",
    HG: "Hidalgo",
    JC: "Jalisco",
    MC: "México",
    MN: "Michoacán de Ocampo",
    MS: "Morelos",
    NT: "Nayarit",
    NL: "Nuevo León",
    OC: "Oaxaca",
    PL: "Puebla",
    QT: "Querétaro",
    QR: "Quintana Roo",
    SP: "San Luis Potosí",
    SL: "Sinaloa",
    SR: "Sonora",
    TC: "Tabasco",
    TS: "Tamaulipas",
    TL: "Tlaxcala",
    VZ: "Veracruz",
    YN: "Yucatán",
    ZS: "Zacatecas",
    NE: "Nacido en el Extranjero"
  };

  const birthYear = parseInt(year, 10) > 22 ? `19${year}` : `20${year}`;
  const birthDate = `${birthYear}-${month}-${day}`;
  const placeOfBirth = placeMap[placeCode] || "Lugar desconocido";

  return {
    birthDate,
    gender: gender === "H" ? "Masculino" : "Femenino",
    placeOfBirth,
  };
};

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

    // Auto-completar campos basado en el CURP
    if (name === 'curp' && value.length === 18) {
      const curpData = extractCurpData(value);
      if (curpData) {
        setForm(prevForm => ({
          ...prevForm,
          fechaNacimiento: curpData.birthDate,
          genero: curpData.gender,
          lugarNacimiento: curpData.placeOfBirth
        }));
      }
    }
  };

  const handleArrayChange = (e, index, field) => {
    const newArray = form[field].slice();
    const newValue = e.target.value;

    // Permitir el campo vacío y validar que contenga solo números si tiene contenido
    if (field === 'telefonos') {
      const isNumeric = newValue === '' || /^\d+$/.test(newValue);
      if (!isNumeric) {
        toast.error('El teléfono debe contener solo números.');
        return;
      }
    }

    newArray[index] = newValue;
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
      const response = await AII_backend.registrarseComoAdministrativo(form);
      if (response.startsWith('Error:')) {
        toast.error(response);
      } else {
        toast.success(response);
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
          <label htmlFor="nombre">Nombre:</label>
          <input type="text" id="nombre" name="nombre" value={form.nombre} onChange={handleChange} placeholder="Ej. Juan" required />
          
          <label htmlFor="apellidoPaterno">Apellido Paterno:</label>
          <input type="text" id="apellidoPaterno" name="apellidoPaterno" value={form.apellidoPaterno} onChange={handleChange} placeholder="Ej. Pérez" required />
          
          <label htmlFor="apellidoMaterno">Apellido Materno:</label>
          <input type="text" id="apellidoMaterno" name="apellidoMaterno" value={form.apellidoMaterno} onChange={handleChange} placeholder="Ej. López" required />
          
          <label htmlFor="tipoSanguineo">Tipo Sanguíneo:</label>
          <select id="tipoSanguineo" name="tipoSanguineo" value={form.tipoSanguineo} onChange={handleChange} required>
            <option value="">Seleccione Tipo Sanguíneo</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
          </select>

          <label htmlFor="curp">CURP:</label>
          <input type="text" id="curp" name="curp" value={form.curp} onChange={handleChange} placeholder="Ej. AAPR630321HDFLRN00" required maxLength="18" />

          <label htmlFor="fechaNacimiento">Fecha de Nacimiento:</label>
          <input type="date" id="fechaNacimiento" name="fechaNacimiento" value={form.fechaNacimiento} onChange={handleChange} required />
          
          <label htmlFor="genero">Género:</label>
          <select id="genero" name="genero" value={form.genero} onChange={handleChange} required>
            <option value="">Seleccione Género</option>
            <option value="Femenino">Femenino</option>
            <option value="Masculino">Masculino</option>
          </select>

          <label htmlFor="lugarNacimiento">Lugar de Nacimiento:</label>
          <input type="text" id="lugarNacimiento" name="lugarNacimiento" value={form.lugarNacimiento} onChange={handleChange} placeholder="Ej. Guadalajara" required />
          
          <label htmlFor="estadoCivil">Estado Civil:</label>
          <select id="estadoCivil" name="estadoCivil" value={form.estadoCivil} onChange={handleChange} required>
            <option value="">Seleccione Estado Civil</option>
            <option value="soltero/a">Soltero/a</option>
            <option value="casado por lo civil">Casado por lo civil</option>
            <option value="divorciado legalmente">Divorciado legalmente</option>
            <option value="separado legalmente">Separado legalmente</option>
            <option value="viudo de matrimonio civil">Viudo de matrimonio civil</option>
            <option value="viudo de matrimonio religioso">Viudo de matrimonio religioso</option>
            <option value="vive en unión libre">Vive en unión libre</option>
          </select>

          <label htmlFor="emailPersonal">Email Personal:</label>
          <input type="email" id="emailPersonal" name="emailPersonal" value={form.emailPersonal} onChange={handleChange} placeholder="Ej. email@personal.com" required />
        </div>

        <div className="registro-admin-form-group">
          <label htmlFor="direccion">Dirección:</label>
          {form.direcciones.map((direccion, index) => (
            <div key={index} className="registro-admin-field-with-button">
              <input type="text" id={`direccion${index}`} value={direccion} onChange={(e) => handleArrayChange(e, index, 'direcciones')} placeholder="Ej. Calle Falsa #123" required />
              <button type="button" className="registro-admin-remove-button" onClick={() => removeArrayField(index, 'direcciones')}>Eliminar</button>
            </div>
          ))}
          <div className="registro-admin-add-button-container">
            <button type="button" className="registro-admin-add-button" onClick={() => addArrayField('direcciones')}>Agregar Dirección</button>
          </div>

          <label htmlFor="telefono">Teléfono:</label>
          {form.telefonos.map((telefono, index) => (
            <div key={index} className="registro-admin-field-with-button">
              <input type="text" id={`telefono${index}`} value={telefono} onChange={(e) => handleArrayChange(e, index, 'telefonos')} placeholder="Ej. 4491234567" required />
              <button type="button" className="registro-admin-remove-button" onClick={() => removeArrayField(index, 'telefonos')}>Eliminar</button>
            </div>
          ))}
          <div className="registro-admin-add-button-container">
            <button type="button" className="registro-admin-add-button" onClick={() => addArrayField('telefonos')}>Agregar Teléfono</button>
          </div>

          <label htmlFor="detallesMedicos">Detalles Médicos:</label>
          <textarea id="detallesMedicos" name="detallesMedicos" value={form.detallesMedicos} onChange={handleChange} placeholder="Ej. Alergias, medicamentos, etc." required />
          
          <label htmlFor="numeroSeguroSocial">Número de Seguro Social:</label>
          <input type="text" id="numeroSeguroSocial" name="numeroSeguroSocial" value={form.numeroSeguroSocial} onChange={handleChange} placeholder="Ej. 71823289091" required />
          
          <label htmlFor="cedulaProfesional">Cédula Profesional:</label>
          <input type="text" id="cedulaProfesional" name="cedulaProfesional" value={form.cedulaProfesional} onChange={handleChange} placeholder="Ej. 0000001" required />
        </div>
        
        <button type="submit" className="registro-admin-form-button">Registrar</button>
      </form>
      <ToastContainer />
    </div>
  );
}

export default RegistroAdministrativo;