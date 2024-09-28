import React, { useState, useRef } from 'react';
import { useCanister } from '@connect2ic/react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Principal } from '@dfinity/principal';
import { Actor, HttpAgent } from '@dfinity/agent';
import { idlFactory as bucket_idlFactory } from '../../../declarations/bucket/bucket.did.js';
import { AuthClient } from '@dfinity/auth-client';
import '../styles/UploadFilesStyles.css';

const StreamingVideo = () => {
  const [archivo, setArchivo] = useState(null);
  const [progresoSubida, setProgresoSubida] = useState(0);
  const [AII_backend] = useCanister('AII_backend');
  const [fileId, setFileId] = useState('');
  const videoRef = useRef(null);

  const manejarCambioArchivo = (evento) => {
    const file = evento.target.files[0];
    if (file && file.type.startsWith('video/')) {
      setArchivo(file);
    } else {
      toast.error('Por favor, selecciona un archivo de video.');
    }
  };

  const manejarCambioFileId = (evento) => setFileId(evento.target.value);

  const crearActorParaBucket = async (canisterId) => {
    const authClient = await AuthClient.create();
    const currentIdentity = authClient.getIdentity();
    if (!currentIdentity) throw new Error('Identidad no disponible. Asegúrate de estar autenticado.');

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
      console.error('Error durante la subida del archivo:', error);
      toast.error('Error durante la subida del archivo.');
    }
  };

  const manejarReproducirVideo = async () => {
    if (!fileId) return toast.error('Por favor, ingresa un ID de archivo válido.');

    try {
      const archivoId = parseInt(fileId, 10);
      if (isNaN(archivoId)) return toast.error('ID del archivo no es un número válido.');

      const resultado = await AII_backend.readRequest(archivoId);
      if (resultado.Ok) {
        const { canisterId, file } = resultado.Ok;
        const fileWithId = { ...file, id: resultado.Ok.id };

        const bucketActor = await crearActorParaBucket(canisterId);

        const video = videoRef.current;
        if (!video) {
          toast.error('El reproductor de video no está disponible.');
          return;
        }

        const mediaSource = new MediaSource();
        video.src = URL.createObjectURL(mediaSource);

        mediaSource.addEventListener('sourceopen', async () => {
          const fileName = fileWithId.fileName;
          const fileExtension = fileName.split('.').pop().toLowerCase();

          let mimeCodec;

          switch (fileExtension) {
            case 'mp4':
              mimeCodec = 'video/mp4; codecs="avc1.42E01E, mp4a.40.2"';
              break;
            case 'webm':
              mimeCodec = 'video/webm; codecs="vp9, opus"';
              break;
            case 'ogv':
              mimeCodec = 'video/ogg; codecs="theora, vorbis"';
              break;
            default:
              mimeCodec = 'video/mp4; codecs="avc1.42E01E, mp4a.40.2"';
          }

          if (!MediaSource.isTypeSupported(mimeCodec)) {
            console.error('El códec no es soportado por este navegador.');
            toast.error('El formato del video no es soportado por este navegador.');
            mediaSource.endOfStream();
            return;
          }

          let sourceBuffer;
          try {
            sourceBuffer = mediaSource.addSourceBuffer(mimeCodec);
          } catch (e) {
            console.error('Error al agregar SourceBuffer:', e);
            toast.error('Error al configurar el reproductor de video.');
            mediaSource.endOfStream();
            return;
          }

          sourceBuffer.addEventListener('error', (e) => {
            console.error('Error en sourceBuffer:', e);
            mediaSource.endOfStream();
          });

          mediaSource.addEventListener('error', (e) => {
            console.error('Error en mediaSource:', e);
          });

          const chunksQty = Number(fileWithId.chunks_qty);
          console.log('Cantidad total de chunks:', chunksQty);

          let currentIndex = 0;

          const descargarYAgregarChunks = async () => {
            while (currentIndex < chunksQty) {
              if (!sourceBuffer.updating) {
                console.log(`Descargando chunk ${currentIndex} de ${chunksQty}`);
                const chunkResponse = await bucketActor.getChunck(Number(fileWithId.id), currentIndex);
                if (chunkResponse.Ok) {
                  const chunk = new Uint8Array(chunkResponse.Ok);
                  try {
                    sourceBuffer.appendBuffer(chunk);
                    await new Promise((resolve, reject) => {
                      sourceBuffer.addEventListener('updateend', resolve, { once: true });
                      sourceBuffer.addEventListener('error', reject, { once: true });
                    });
                    console.log(`Chunk ${currentIndex} agregado al sourceBuffer`);
                    currentIndex++;
                  } catch (e) {
                    console.error('Error al agregar chunk al sourceBuffer:', e);
                    toast.error('Error al reproducir el video.');
                    mediaSource.endOfStream();
                    break;
                  }
                } else {
                  console.error(`Error al obtener el fragmento ${currentIndex}:`, chunkResponse.Err);
                  toast.error(`Error al obtener el fragmento ${currentIndex}.`);
                  mediaSource.endOfStream();
                  break;
                }
              } else {
                await new Promise((resolve) => setTimeout(resolve, 50));
              }
            }

            if (currentIndex >= chunksQty) {
              mediaSource.endOfStream();
              console.log('Todos los chunks han sido agregados.');
            }
          };

          descargarYAgregarChunks();
        });

        toast.success('Reproduciendo video.');
      } else {
        console.error('Error en readRequest:', resultado.Err);
        toast.error('Error al obtener el archivo para reproducción.');
      }
    } catch (error) {
      console.error('Error al reproducir el video:', error);
      toast.error('Error al reproducir el video.');
    }
  };

  return (
    <div className="subir-archivo-container">
      <h2 className="subir-archivo-heading">Subir Video</h2>
      <form onSubmit={manejarSubidaArchivo}>
        <input type="file" onChange={manejarCambioArchivo} className="subir-archivo-input" accept="video/*" />
        <button type="submit" className="subir-archivo-button">
          Subir Video
        </button>
      </form>

      {progresoSubida > 0 && <p>Progreso de subida: {progresoSubida}%</p>}

      <h3>Reproducir Video</h3>
      <input
        type="text"
        placeholder="Ingresa el ID del video"
        value={fileId}
        onChange={manejarCambioFileId}
        className="subir-archivo-input"
      />

      <button onClick={manejarReproducirVideo} className="subir-archivo-button">
        Reproducir Video
      </button>

      {/* Elemento de video para reproducir */}
      <video
        ref={videoRef}
        controls
        style={{
          width: '100%',
          maxWidth: '600px',
          marginTop: '20px',
          display: 'block',
        }}
      ></video>

      <ToastContainer />
    </div>
  );
};

export default StreamingVideo;