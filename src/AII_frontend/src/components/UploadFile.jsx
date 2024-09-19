import React, { useState } from 'react';
import { useCanister } from '@connect2ic/react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const UploadFile = () => {
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [AII_backend] = useCanister('AII_backend');

  // Manejador de cambio de archivo
  const handleFileChange = (event) => setFile(event.target.files[0]);

  // Función para dividir el archivo en chunks
  const splitFileIntoChunks = (file, chunkSize = 1_000_000) => {
    const chunks = [];
    for (let offset = 0; offset < file.size; offset += chunkSize) {
      chunks.push(file.slice(offset, offset + chunkSize));
    }
    return chunks;
  };

  // Función para manejar la subida de archivo
  const uploadFile = async (event) => {
    event.preventDefault();
    if (!file) return toast.error('Por favor, selecciona un archivo.');

    try {
      const { name: fileName, size: fileSize } = file;
      setUploadProgress(0);
      console.log(`Iniciando proceso de subida para: ${fileName}, tamaño: ${fileSize}`);

      // Obtener los parámetros de subida del backend
      const response = await AII_backend.getStorageFor(fileName, fileSize);
      console.log('Respuesta del backend en getStorageFor:', response);
      const { canisterId, uploadParameters } = response;

      toast.info('Iniciando subida del archivo...');

      const chunks = splitFileIntoChunks(file);
      console.log(`El archivo fue dividido en ${chunks.length} chunks.`);

      // Subir cada chunk
      for (let i = 0; i < chunks.length; i++) {
        const chunk = new Uint8Array(await chunks[i].arrayBuffer());
        console.log(`Subiendo chunk ${i + 1} de ${chunks.length}...`);
        await AII_backend.addChunck(uploadParameters.id, chunk, i);

        const progress = Math.round(((i + 1) / chunks.length) * 100);
        console.log(`Progreso de subida: ${progress}%`);
        setUploadProgress(progress);
      }

      // Confirmar la subida del archivo
      const commitResponse = await AII_backend.commitStorage(uploadParameters.id, canisterId);
      console.log('Respuesta del backend en commitStorage:', commitResponse);

      if (commitResponse?.Ok) {
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
      <form onSubmit={uploadFile}>
        <input type="file" onChange={handleFileChange} />
        <button type="submit">Subir Archivo</button>
      </form>
      {uploadProgress > 0 && <p>Progreso de subida: {uploadProgress}%</p>}
    </div>
  );
};

export default UploadFile;