import React, { useState } from 'react';
import { useCanister } from '@connect2ic/react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/agregarEditarMateriaStyles.css';

const AgregarEditarMateria = () => {
  const [nombre, setNombre] = useState('');
  const [codigo, setCodigo] = useState('');
  const [creditos, setCreditos] = useState('');
  const [grado, setGrado] = useState('');  // Estado para el grado
  const [carreras, setCarreras] = useState(['']);
  const [AII_backend] = useCanister('AII_backend');

  const handleCarreraChange = (index, value) => {
    const updatedCarreras = [...carreras];
    updatedCarreras[index] = value;
    setCarreras(updatedCarreras);
  };

  const addCarreraField = () => {
    setCarreras([...carreras, '']);
  };

  const removeCarreraField = (index) => {
    const updatedCarreras = carreras.filter((_, i) => i !== index);
    setCarreras(updatedCarreras);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await AII_backend.agregarMateria(nombre, codigo, parseInt(creditos), carreras, parseInt(grado));
      toast.success(response);
    } catch (error) {
      toast.error('Error al agregar materia.');
    }
  };

  return (
    <div className="agregar-materia-container">
      <h2>Agregar/Editar Materia</h2>
      <form className="agregar-materia-form" onSubmit={handleSubmit}>
        <div className="materia-form-group">
          <label htmlFor="nombre">Materia:</label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej. Cálculo Diferencial 1"
            required
            className="materia-form-input"
          />
          
          <label htmlFor="codigo">Código:</label>
          <input
            type="text"
            id="codigo"
            name="codigo"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            placeholder="Ej. 01"
            required
            className="materia-form-input"
          />
          
          <label htmlFor="creditos">Créditos:</label>
          <input
            type="number"
            id="creditos"
            name="creditos"
            value={creditos}
            onChange={(e) => setCreditos(e.target.value)}
            placeholder="Ej. 100"
            required
            className="materia-form-input"
          />
          
          <label htmlFor="grado">Grado:</label>
          <input
            type="number"
            id="grado"
            name="grado"
            value={grado}
            onChange={(e) => setGrado(e.target.value)}
            placeholder="Ej. 3"
            required
            className="materia-form-input"
          />
        </div>

        <div className="materia-carreras-group">
          <h4>Carreras Relacionadas</h4>
          {carreras.map((carrera, index) => (
            <div key={index} className="carrera-field">
              <input
                type="text"
                value={carrera}
                onChange={(e) => handleCarreraChange(index, e.target.value)}
                placeholder={`Carrera #${index + 1} (Ej. Ingeniería en Sistemas)`}
                required
                className="materia-form-input"
              />
              {index > 0 && (
                <button
                  type="button"
                  className="remove-carrera-button"
                  onClick={() => removeCarreraField(index)}
                >
                  Eliminar
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            className="add-carrera-button"
            onClick={addCarreraField}
          >
            Agregar Carrera
          </button>
        </div>

        <button type="submit" className="materia-form-button">Agregar/Actualizar Materia</button>
      </form>
      <ToastContainer />
    </div>
  );
};

export default AgregarEditarMateria;