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

  const manejarCambioArchivo = (evento) => setArchivo(evento.target.files[0]);

  const crearActorParaBucket = async (canisterId) => {
    let authClient = await AuthClient.create();
    const currentIdentity = authClient.getIdentity();
    if (!currentIdentity) throw new Error("Identidad no disponible. Asegúrate de estar autenticado.");

    // Configuración para entorno local
    const agent = new HttpAgent({ host: 'http://localhost:8000', identity: currentIdentity });
    await agent.fetchRootKey().catch((err) => console.warn('Error fetching root key for local dev', err));

    // Configuración para mainnet (descomentar para producción)
    // const agent = new HttpAgent({ host: 'https://ic0.app', identity: currentIdentity });
    // No es necesario fetchRootKey en mainnet

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
        await bucketActor.addChunk(uploadParameters.id, parte, i);
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
      <ToastContainer />
    </div>
  );
};

export default SubirArchivo;
