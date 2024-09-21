import React, { useState } from 'react';
import { useCanister } from '@connect2ic/react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const SubirArchivo = () => {
  const [archivo, setArchivo] = useState(null);
  const [progresoSubida, setProgresoSubida] = useState(0);
  const [AII_backend] = useCanister('AII_backend');

  // Manejador de cambio de archivo
  const manejarCambioArchivo = (evento) => setArchivo(evento.target.files[0]);

  // Función para dividir el archivo en partes (chunks)
  const dividirArchivoEnPartes = (archivo, tamanoParte = 1_000_000) => {
    const partes = [];
    for (let offset = 0; offset < archivo.size; offset += tamanoParte) {
      partes.push(archivo.slice(offset, offset + tamanoParte));
    }
    return partes;
  };

  // Función para manejar la subida de archivo
  const manejarSubidaArchivo = async (evento) => {
    evento.preventDefault();
    if (!archivo) return toast.error('Por favor, selecciona un archivo.');

    try {
      const { name: nombreArchivo, size: tamanoArchivo } = archivo;
      setProgresoSubida(0);
      console.log(`Iniciando proceso de subida para: ${nombreArchivo}, tamaño: ${tamanoArchivo}`);

      // Obtener los parámetros de subida del backend
      const respuesta = await AII_backend.getStorageFor(nombreArchivo, tamanoArchivo);
      console.log('Respuesta del backend en getStorageFor:', respuesta);
      const { canisterId, uploadParameters } = respuesta;

      toast.info('Iniciando subida del archivo...');

      const partes = dividirArchivoEnPartes(archivo);
      console.log(`El archivo fue dividido en ${partes.length} partes.`);

      // Subir cada parte
      for (let i = 0; i < partes.length; i++) {
        const parte = new Uint8Array(await partes[i].arrayBuffer());
        console.log(`Subiendo parte ${i + 1} de ${partes.length}...`);
        await AII_backend.addChunck(uploadParameters.id, parte, i);

        const progreso = Math.round(((i + 1) / partes.length) * 100);
        console.log(`Progreso de subida: ${progreso}%`);
        setProgresoSubida(progreso);
      }

      // Confirmar la subida del archivo
      const respuestaConfirmacion = await AII_backend.commitStorage(uploadParameters.id, canisterId);
      console.log('Respuesta del backend en commitStorage:', respuestaConfirmacion);

      if (respuestaConfirmacion?.Ok) {
        toast.success('Archivo subido exitosamente.');
      } else {
        toast.error('Error al confirmar la subida.');
      }
    } catch (error) {
      console.error('Error al subir el archivo:', error);
      toast.error('Error durante la subida del archivo.');
    }
  };

  return (
    <div>
      <h2>Subir Archivo</h2>
      <form onSubmit={manejarSubidaArchivo}>
        <input type="file" onChange={manejarCambioArchivo} />
        <button type="submit">Subir Archivo</button>
      </form>
      {progresoSubida > 0 && <p>Progreso de subida: {progresoSubida}%</p>}
    </div>
  );
};

export default SubirArchivo;