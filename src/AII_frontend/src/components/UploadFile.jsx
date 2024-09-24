import React, { useState } from 'react';
import { useCanister } from '@connect2ic/react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Principal } from "@dfinity/principal";
import { Actor, HttpAgent } from "@dfinity/agent";
import { idlFactory as bucket_idlFactory } from '../../../declarations/bucket/bucket.did.js';
import { AuthClient } from "@dfinity/auth-client";
import '../styles/UploadFilesStyles.css';

const SubirArchivo = () => {
  const [archivo, setArchivo] = useState(null);
  const [progresoSubida, setProgresoSubida] = useState(0);
  const [AII_backend] = useCanister('AII_backend');
  const [fileId, setFileId] = useState(''); // ID del archivo ingresado por el usuario para descargar/eliminar

  const manejarCambioArchivo = (evento) => setArchivo(evento.target.files[0]);
  const manejarCambioFileId = (evento) => setFileId(evento.target.value);

  const crearActorParaBucket = async (canisterId) => {
    let authClient = await AuthClient.create();
    const currentIdentity = authClient.getIdentity();
    if (!currentIdentity) throw new Error("Identidad no disponible. Asegúrate de estar autenticado.");

    const agent = new HttpAgent({ host: 'http://localhost:8000', identity: currentIdentity });
    await agent.fetchRootKey().catch((err) => console.warn('Error fetching root key for local dev', err));

    return Actor.createActor(bucket_idlFactory, { agent, canisterId });
  };

  const dividirArchivoEnPartes = (archivo, tamanoParte = 1_000_000) => {
    const partes = [];
    for (let offset = 0; offset < archivo.size; offset += tamanoParte) {
      partes.push(archivo.slice(offset, offset + tamanoParte));
    }
    return partes;
  };

  const manejarSubidaArchivo = async (evento) => {
    evento.preventDefault();
    if (!archivo) return toast.error('Por favor, selecciona un archivo.');
    try {
      const { name: nombreArchivo, size: tamanoArchivo } = archivo;
      setProgresoSubida(0);

      const respuesta = await AII_backend.getStorageFor(nombreArchivo, tamanoArchivo);
      const { canisterId, uploadParameters } = respuesta;
      const bucketActor = await crearActorParaBucket(canisterId);

      toast.info('Iniciando subida del archivo...');
      const partes = dividirArchivoEnPartes(archivo);

      for (let i = 0; i < partes.length; i++) {
        const parte = new Uint8Array(await partes[i].arrayBuffer());
        const resultadoChunk = await bucketActor.addChunk(uploadParameters.id, parte, i);
        setProgresoSubida(Math.round(((i + 1) / partes.length) * 100));
      }

      const respuestaConfirmacion = await bucketActor.commitLoad(uploadParameters.id);
      if (respuestaConfirmacion?.Ok) {
        toast.success('Archivo subido exitosamente.');
      } else {
        toast.error('Error al confirmar la subida.');
      }
    } catch (error) {
      toast.error('Error durante la subida del archivo.');
    }
  };

  const manejarDescargarArchivo = async () => {
    if (!fileId) return toast.error('Por favor, ingresa un ID de archivo válido.');
    
    try {
      const archivoId = parseInt(fileId, 10);
      if (isNaN(archivoId)) return toast.error('ID del archivo no es un número válido.');

      const resultado = await AII_backend.readRequest(archivoId);
      if (resultado.Ok) {
        const { canisterId, file } = resultado.Ok;
        const fileWithId = { ...file, id: resultado.Ok.id };

        const bucketActor = await crearActorParaBucket(canisterId);

        const chunksQty = Number(fileWithId.chunks_qty);
        const fileChunks = [];

        for (let i = 0; i < chunksQty; i++) {
          const chunkResponse = await bucketActor.getChunck(Number(fileWithId.id), i);
          if (chunkResponse.Ok) fileChunks.push(chunkResponse.Ok);
          else return toast.error(`Error al obtener el fragmento ${i}.`);
        }

        const archivoBlob = new Blob(fileChunks, { type: 'application/octet-stream' });
        const url = URL.createObjectURL(archivoBlob);

        const enlaceDescarga = document.createElement('a');
        enlaceDescarga.href = url;
        enlaceDescarga.download = fileWithId.fileName;
        document.body.appendChild(enlaceDescarga);
        enlaceDescarga.click();

        toast.success('Archivo descargado exitosamente.');
      } else {
        toast.error('Error al descargar el archivo.');
      }
    } catch (error) {
      toast.error('Error al descargar el archivo.');
    }
  };

  const manejarEliminarArchivo = async () => {
    if (!fileId) return toast.error('Por favor, ingresa un ID de archivo válido.');
    
    try {
      const archivoId = parseInt(fileId, 10);
      if (isNaN(archivoId)) return toast.error('ID del archivo no es un número válido.');

      // Llamar a la función para eliminar el archivo
      const resultado = await AII_backend.requestDeleteFile(archivoId);
      if (resultado.Ok) {
        toast.success('Archivo eliminado exitosamente.');
      } else {
        toast.error('Error al eliminar el archivo: ' + resultado.Err);
      }
    } catch (error) {
      toast.error('Error al eliminar el archivo.');
    }
  };

  return (
    <div className="subir-archivo-container">
      <h2 className="subir-archivo-heading">Subir Archivo</h2>
      <form onSubmit={manejarSubidaArchivo}>
        <input type="file" onChange={manejarCambioArchivo} className="subir-archivo-input" />
        <button type="submit" className="subir-archivo-button">Subir Archivo</button>
      </form>

      {progresoSubida > 0 && <p>Progreso de subida: {progresoSubida}%</p>}

      <h3>Acciones con Archivo</h3>
      <input
        type="text"
        placeholder="Ingresa el ID del archivo"
        value={fileId}
        onChange={manejarCambioFileId}
        className="subir-archivo-input"
      />
      <button onClick={manejarDescargarArchivo} className="subir-archivo-button">
        Descargar Archivo
      </button>
      <button onClick={manejarEliminarArchivo} className="subir-archivo-button">
        Eliminar Archivo
      </button>

      <ToastContainer />
    </div>
  );
};

export default SubirArchivo;
