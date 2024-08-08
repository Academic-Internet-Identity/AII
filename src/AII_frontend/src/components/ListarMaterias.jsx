// src/components/ListarMaterias.jsx
import React, { useState, useEffect } from 'react';
import { useCanister } from '@connect2ic/react';
import '../styles/listarMateriasStyles.css';

function ListarMaterias() {
  const [AII_backend] = useCanister('AII_backend');
  const [materias, setMaterias] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMaterias = async () => {
      try {
        const result = await AII_backend.verMaterias();
        setMaterias(result);
      } catch (error) {
        console.error('Error al obtener las materias:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMaterias();
  }, [AII_backend]);

  if (loading) {
    return <p>Cargando...</p>;
  }

  return (
    <div className="listar-materias-container">
      <h2 className="table-heading">Listado de Materias</h2>
      <table className="materias-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Código</th>
            <th>Créditos</th>
          </tr>
        </thead>
        <tbody>
          {materias.map((materia, index) => (
            <tr key={index}>
              <td>{materia.nombre}</td>
              <td>{materia.codigo}</td>
              <td>{materia.creditos.toString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ListarMaterias;