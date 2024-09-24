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
  const [fileId, setFileId] = useState(''); // ID del archivo ingresado por el usuario para descargar

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
      console.log('Respuesta de getStorageFor:', respuesta);
      const { canisterId, uploadParameters } = respuesta;
      const bucketActor = await crearActorParaBucket(canisterId);

      toast.info('Iniciando subida del archivo...');
      const partes = dividirArchivoEnPartes(archivo);

      for (let i = 0; i < partes.length; i++) {
        const parte = new Uint8Array(await partes[i].arrayBuffer());
        const resultadoChunk = await bucketActor.addChunk(uploadParameters.id, parte, i);
        console.log(`Resultado de añadir chunk ${i}:`, resultadoChunk);
        setProgresoSubida(Math.round(((i + 1) / partes.length) * 100));
      }

      const respuestaConfirmacion = await bucketActor.commitLoad(uploadParameters.id);
      console.log('Respuesta de commitLoad:', respuestaConfirmacion);
      if (respuestaConfirmacion?.Ok) {
        toast.success('Archivo subido exitosamente.');
        console.log(`ID del archivo subido: ${respuestaConfirmacion.Ok}`);
      } else {
        console.error('Error al confirmar la subida:', respuestaConfirmacion);
        toast.error('Error al confirmar la subida.');
      }
    } catch (error) {
      console.error('Error durante la subida del archivo:', error);
      toast.error('Error durante la subida del archivo.');
    }
  };

  const manejarDescargarArchivo = async () => {
    if (!fileId) return toast.error('Por favor, ingresa un ID de archivo válido.');
    
    try {
      const archivoId = parseInt(fileId, 10);
      if (isNaN(archivoId)) {
        return toast.error('ID del archivo no es un número válido.');
      }
  
      // Llamar a la función readRequest para obtener detalles del archivo
      const resultado = await AII_backend.readRequest(archivoId);
      console.log('Resultado de readRequest:', resultado); // Log de la respuesta de la solicitud
  
      if (resultado.Ok) {
        // Aquí incluimos explícitamente el ID en los detalles del archivo
        const { canisterId, file } = resultado.Ok;
        const fileWithId = { ...file, id: resultado.Ok.id }; // Añadir el ID al objeto del archivo
        console.log('Detalles del archivo:', fileWithId);
  
        if (!fileWithId || !fileWithId.chunks_qty || !fileWithId.id) {
          throw new Error('Datos del archivo incompletos o inválidos.');
        }
  
        const bucketActor = await crearActorParaBucket(canisterId);
  
        // Verificamos que chunks_qty sea un número y no un BigInt
        const chunksQty = Number(fileWithId.chunks_qty); // Convertimos chunks_qty a un número regular
        const fileChunks = [];
  
        // Iteramos sobre los fragmentos del archivo (chunks) para descargarlos
        for (let i = 0; i < chunksQty; i++) {
          console.log(`Descargando fragmento ${i + 1} de ${chunksQty}...`);
  
          // Obtener cada chunk del archivo
          const chunkResponse = await bucketActor.getChunck(Number(fileWithId.id), i); // Usamos el ID ahora incluido en fileWithId
          console.log(`Resultado de getChunck(${i}):`, chunkResponse);
  
          if (chunkResponse.Ok) {
            fileChunks.push(chunkResponse.Ok);
          } else {
            console.error(`Error al obtener el chunk ${i}:`, chunkResponse.Err);
            toast.error(`Error al obtener el fragmento ${i}.`);
            return;
          }
        }
  
        // Concatenar los fragmentos descargados en un Blob
        const archivoBlob = new Blob(fileChunks, { type: 'application/octet-stream' });
        const url = URL.createObjectURL(archivoBlob);
  
        // Crear un enlace para descargar el archivo
        const enlaceDescarga = document.createElement('a');
        enlaceDescarga.href = url;
        enlaceDescarga.download = fileWithId.fileName; // Nombre del archivo original
        document.body.appendChild(enlaceDescarga);
        enlaceDescarga.click();
  
        toast.success('Archivo descargado exitosamente.');
        console.log(`Archivo descargado: ${fileWithId.fileName}`);
      } else {
        console.error('Error al descargar el archivo:', resultado);
        toast.error('Error al descargar el archivo.');
      }
    } catch (error) {
      console.error('Error al descargar el archivo:', error);
      toast.error('Error al descargar el archivo.');
    }
  };  

  return (
    <div className="subir-archivo-container">
      <h2 className="subir-archivo-heading">Subir Archivo</h2>
      <form onSubmit={manejarSubidaArchivo}>
        <input
          type="file"
          onChange={manejarCambioArchivo}
          className="subir-archivo-input"
        />
        <button type="submit" className="subir-archivo-button">
          Subir Archivo
        </button>
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

      <ToastContainer />
    </div>
  );
};

export default SubirArchivo;
