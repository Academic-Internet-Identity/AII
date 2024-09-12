//Este es un componente en desarrolo , aun no funciona ni se implementa

import React, { useState } from 'react';
import { useCanister } from '@connect2ic/react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function SubirArchivos() {
  const [AII_backend] = useCanister('AII_backend');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setProgress(0); // Resetear progreso cuando se selecciona un nuevo archivo
  };

  const uploadFile = async () => {
    if (!selectedFile) {
      toast.error('Por favor selecciona un archivo antes de subirlo');
      return;
    }

    try {
      setUploading(true);

      // Paso 1: Solicitar espacio de almacenamiento
      const fileName = selectedFile.name;
      const fileSize = selectedFile.size;

      const response = await AII_backend.getStorageFor(fileName, BigInt(fileSize));
      const { canisterId, uploadParameters } = response;

      // Paso 2: Dividir archivo en chunks y enviarlos
      const chunkSize = Number(uploadParameters.chunkSize);
      const totalChunks = Math.ceil(fileSize / chunkSize);

      for (let index = 0; index < totalChunks; index++) {
        const start = index * chunkSize;
        const end = Math.min(start + chunkSize, fileSize);
        const chunk = selectedFile.slice(start, end);

        const chunkBlob = await chunk.arrayBuffer();
        const chunkBlobData = new Uint8Array(chunkBlob);

        await AII_backend.addChunck(uploadParameters.id, chunkBlobData, index);

        // Actualizar progreso
        setProgress(Math.floor(((index + 1) / totalChunks) * 100));
      }

      // Paso 3: Confirmar la carga
      const commitResponse = await AII_backend.commitLoad(uploadParameters.id);
      if (commitResponse.ok) {
        toast.success('Archivo subido correctamente');
      } else {
        throw new Error('Error al confirmar la subida');
      }
    } catch (error) {
      toast.error(`Error al subir el archivo: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="file-upload-container">
      <h2>Subir Archivo</h2>

      <div className="file-upload-form">
        <input type="file" onChange={handleFileChange} />
        <button onClick={uploadFile} disabled={uploading || !selectedFile}>
          {uploading ? 'Subiendo...' : 'Subir Archivo'}
        </button>
      </div>

      {uploading && (
        <div className="upload-progress">
          <p>Progreso: {progress}%</p>
          <progress value={progress} max="100" />
        </div>
      )}

      <ToastContainer />
    </div>
  );
}

export default SubirArchivos;
