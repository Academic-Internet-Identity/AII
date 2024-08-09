// src/components/AgregarMateria.jsx
import React, { useState } from 'react';
import { useCanister } from '@connect2ic/react';
import '../styles/agregarMateriaStyles.css';

const AgregarMateria = () => {
  const [nombre, setNombre] = useState('');
  const [codigo, setCodigo] = useState('');
  const [creditos, setCreditos] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [AII_backend] = useCanister('AII_backend');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await AII_backend.agregarMateria(nombre, codigo, parseInt(creditos));
      setMensaje(response);
    } catch (error) {
      console.error('Error al agregar materia:', error);
      setMensaje('Error al agregar materia.');
    }
  };

  return (
    <div className="agregar-materia-container">
      <h2>Agregar Materia</h2>
      <form className="agregar-materia-form" onSubmit={handleSubmit}>
        <div className="materia-form-group">
          <input
            type="text"
            name="nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Nombre"
            required
            className="materia-form-input"
          />
          <input
            type="text"
            name="codigo"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            placeholder="Código"
            required
            className="materia-form-input"
          />
          <input
            type="number"
            name="creditos"
            value={creditos}
            onChange={(e) => setCreditos(e.target.value)}
            placeholder="Créditos"
            required
            className="materia-form-input"
          />
        </div>
        <button type="submit" className="materia-form-button">Agregar Materia</button>
      </form>
      {mensaje && <p className="materia-message">{mensaje}</p>}
    </div>
  );
};

export default AgregarMateria;