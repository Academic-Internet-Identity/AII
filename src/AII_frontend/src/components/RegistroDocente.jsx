import React, { useState, useEffect } from 'react';
import { useCanister } from '@connect2ic/react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/registroDocenteStyles.css';

function RegistroDocente() {
  const [AII_backend] = useCanister('AII_backend');
  const [form, setForm] = useState({
    nombre: '', apellidoPaterno: '', apellidoMaterno: '', tipoSanguineo: '', fechaNacimiento: '',
    curp: '', genero: '', lugarNacimiento: '', estadoCivil: '', emailPersonal: '', direcciones: [''],
    telefonos: [''], detallesMedicos: '', numeroSeguroSocial: '', cedulaProfesional: '', materias: ['']
  });
  const [materiasDisponibles, setMateriasDisponibles] = useState([]);
  const [selectedMaterias, setSelectedMaterias] = useState({});

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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleArrayChange = (e, index, field) => {
    const newArray = [...form[field]];
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

    // Actualizar la lista de materias seleccionadas al eliminar una materia
    if (field === 'materias') {
      const updatedSelectedMaterias = { ...selectedMaterias };
      delete updatedSelectedMaterias[index];
      setSelectedMaterias(updatedSelectedMaterias);
    }
  };

  const handleMateriaChange = (e, index) => {
    const selectedValue = e.target.value;

    const newArray = [...form.materias];
    newArray[index] = selectedValue;

    setForm({ ...form, materias: newArray });

    // Guardar la materia seleccionada
    const updatedSelectedMaterias = { ...selectedMaterias, [index]: selectedValue };
    setSelectedMaterias(updatedSelectedMaterias);
  };

  const addMateriaField = () => {
    setForm({ ...form, materias: [...form.materias, ''] });
  };

  const getFilteredMaterias = (index) => {
    const selectedValues = Object.values(selectedMaterias);
    return materiasDisponibles.filter(
      (materia) => !selectedValues.includes(materia.codigo) || selectedMaterias[index] === materia.codigo
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar que al menos una materia esté seleccionada
    if (form.materias.length === 0 || form.materias.some(m => m === '')) {
      toast.warn('Debe seleccionar al menos una materia.');
      return;
    }

    try {
      const response = await AII_backend.registrarseComoDocente(form);
      toast.success(response);
    } catch (error) {
      toast.error('Error al registrar docente.');
      console.error('Error al registrar docente:', error);
    }
  };

  return (
    <div className="registro-docente-container">
      <h2>Registrar Docente</h2>
      <form className="registro-docente-form" onSubmit={handleSubmit}>
        <div className="registro-docente-form-group">
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
        <div className="registro-docente-form-group">
          {form.direcciones.map((direccion, index) => (
            <div key={index} className="registro-docente-field-with-button">
              <input type="text" value={direccion} onChange={(e) => handleArrayChange(e, index, 'direcciones')} placeholder="Dirección" required />
              <button type="button" className="registro-docente-remove-button" onClick={() => removeArrayField(index, 'direcciones')}>Eliminar</button>
            </div>
          ))}
          <div className="registro-docente-add-button-container">
            <button type="button" className="registro-docente-add-button" onClick={() => addArrayField('direcciones')}>Agregar Dirección</button>
          </div>
          
          {form.telefonos.map((telefono, index) => (
            <div key={index} className="registro-docente-field-with-button">
              <input type="text" value={telefono} onChange={(e) => handleArrayChange(e, index, 'telefonos')} placeholder="Teléfono" required />
              <button type="button" className="registro-docente-remove-button" onClick={() => removeArrayField(index, 'telefonos')}>Eliminar</button>
            </div>
          ))}
          <div className="registro-docente-add-button-container">
            <button type="button" className="registro-docente-add-button" onClick={() => addArrayField('telefonos')}>Agregar Teléfono</button>
          </div>
          
          <textarea name="detallesMedicos" value={form.detallesMedicos} onChange={handleChange} placeholder="Detalles Médicos" required />
          <input type="text" name="numeroSeguroSocial" value={form.numeroSeguroSocial} onChange={handleChange} placeholder="Número de Seguro Social" required />
          
          {form.materias.map((materia, index) => (
            <div key={index} className="registro-docente-field-with-button">
              <select
                value={materia || ''}
                onChange={(e) => handleMateriaChange(e, index)}
                required
              >
                <option value="">Seleccione una Materia</option>
                {getFilteredMaterias(index).map((materia, idx) => (
                  <option key={idx} value={materia.codigo}>{materia.nombre}</option>
                ))}
              </select>
              <button type="button" className="registro-docente-remove-button" onClick={() => removeArrayField(index, 'materias')}>Eliminar</button>
            </div>
          ))}
          <div className="registro-docente-add-button-container">
            <button type="button" className="registro-docente-add-button" onClick={addMateriaField}>Agregar Materia</button>
          </div>

          <input type="text" name="cedulaProfesional" value={form.cedulaProfesional} onChange={handleChange} placeholder="Cédula Profesional" required />
        </div>
        
        <button type="submit" className="registro-docente-form-button">Registrar</button>
      </form>
      <ToastContainer />
    </div>
  );
}

export default RegistroDocente;