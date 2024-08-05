# Plataforma de Gestión Escolar UTMA

## Descripción

La Plataforma de Gestión Escolar UTMA es un sistema desarrollado para la administración eficiente de usuarios, asignaturas y horarios en la Universidad Tecnológica Metropolitana de Aguascalientes (UTMA). El sistema permite la gestión de perfiles de alumnos, administrativos y docentes, así como la integración de funcionalidades para la consulta de información mediante llamadas HTTP a APIs externas.

## Funcionalidades

- Registro y gestión de usuarios con diferentes roles: alumnos, administrativos y docentes.
- Gestión de asignaturas y horarios.
- Integración con APIs externas para la consulta de datos.
- Panel de administración para aprobación de registros.
- Interfaz de usuario desarrollada en React.

## Tecnologías Utilizadas

- **Frontend:** React.js con CSS para el estilado.
- **Backend:** Motoko en la plataforma Internet Computer.
- **Autenticación:** Internet Identity para la gestión de identidades de usuario.

## Configuración del Entorno

### Prerrequisitos

- Node.js y npm instalados
- DFX (Dfinity SDK) configurado y funcionando
- Internet Identity configurado para el desarrollo local

### Instalación

1. **Clonar el repositorio:**

   ```bash
   git clone https://github.com/AngelSaulCorreaMartinez/AII.git
   cd AII

2. **Instalar las dependencias del frontend:**

    ```bash
     cd All_frontend
     npm install

3. **Verificar Mops:**
   
- Clona el repositorio de Mops y construye la herramienta
  
   ```bash
    git clone https://github.com/ZenVoich/mops.git
    cd mops/cli
    npm install
    npm link

- Navega a la ruta de tu proyecto e inicializa Mops en tu proyecto:

   ```bash
    mops init

- Agregar las dependencias necesarias utilizando Mops:
  
   ```bash
    mops add base
    mops add Map
    mops install
  
4.	**Hacer deploy:**

   ```bash
    cd ../All_backend
    dfx start --background
    dfx deploy

   
