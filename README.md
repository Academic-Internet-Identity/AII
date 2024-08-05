## Plataforma de Gestión Escolar UTMA

### Descripción

La Plataforma de Gestión Escolar UTMA es un sistema desarrollado para la administración eficiente de usuarios, asignaturas y horarios en la Universidad Tecnológica Metropolitana de Aguascalientes (UTMA). El sistema permite la gestión de perfiles de alumnos, administrativos y docentes, así como la integración de funcionalidades para la consulta de información mediante llamadas HTTP a APIs externas.

### Funcionalidades

- Registro y gestión de usuarios con diferentes roles: alumnos, administrativos y docentes.
- Gestión de asignaturas y horarios.
- Creación y gestión de grupos y asignación de materias.
- Integración con APIs externas para la consulta de datos.
- Panel de administración para aprobación de registros.
- Interfaz de usuario desarrollada en React.

### Tecnologías Utilizadas

- **Frontend:** React.js con CSS para el estilado.
- **Backend:** Motoko en la plataforma Internet Computer.
- **Autenticación:** Internet Identity para la gestión de identidades de usuario.

### Configuración del Entorno

#### Prerrequisitos

- Node.js y npm instalados
- DFX (Dfinity SDK) configurado y funcionando
- Internet Identity configurado para el desarrollo local

#### Instalación

1. **Clonar el repositorio:**

   ```bash
   git clone https://github.com/AngelSaulCorreaMartinez/AII.git
   cd AII
   ```

2. **Instalar las dependencias del frontend:**

   ```bash
   cd AII_frontend
   npm install
   ```

3. **Verificar Mops:**
   
   - Clonar el repositorio de Mops y construir la herramienta:
     ```bash
     git clone https://github.com/ZenVoich/mops.git
     cd mops/cli
     npm install
     npm link
     ```

   - Navegar a la ruta de tu proyecto e inicializar Mops en tu proyecto:
     ```bash
     cd ../../AII
     mops init
     ```

   - Agregar las dependencias necesarias utilizando Mops:
     ```bash
     mops add base
     mops add Map
     mops install
     ```

4. **Hacer deploy:**

   ```bash
   cd ../AII_backend
   dfx start --background
   dfx deploy
   ```

### Información Detallada de Funcionalidades

#### Registro y Gestión de Usuarios

- **Alumnos:** Registro de estudiantes con información detallada como nombre, apellidos, fecha de nacimiento, CURP, género, lugar de nacimiento, estado civil, correo electrónico, direcciones, teléfonos, detalles médicos, número de seguro social, entre otros.
- **Administrativos:** Registro de personal administrativo con información relevante como nombre, apellidos, fecha de nacimiento, CURP, género, lugar de nacimiento, estado civil, correo electrónico, direcciones, teléfonos, detalles médicos, número de seguro social, cédula profesional, etc.
- **Docentes:** Registro de profesores con información similar a la de los administrativos, además de un listado de materias que imparte.

#### Gestión de Asignaturas y Horarios

- **Grupos:** Creación y gestión de grupos de alumnos.
- **Asignaturas:** Asignación de materias a grupos y docentes.
- **Horarios:** Gestión de horarios para cada grupo, incluyendo la asignación de materias y docentes a horarios específicos.

#### Integración con APIs Externas

- Capacidad para realizar consultas a APIs externas para obtener información adicional o verificar datos.

#### Panel de Administración

- **Aprobación de Registros:** Los administradores pueden aprobar o rechazar solicitudes de registro de alumnos, administrativos y docentes.
- **Consulta de Información:** Visualización de los registros de alumnos, administrativos, docentes, grupos y horarios.

#### Interfaz de Usuario

- **React.js:** Desarrollo del frontend utilizando React.js para una experiencia de usuario dinámica y responsiva.
- **Estilos en CSS:** Uso de CSS para el estilado y la presentación visual de la interfaz de usuario.

### Desarrollo y Contribución

1. **Configuración del Entorno de Desarrollo:**

   Asegúrate de tener instalados los siguientes prerrequisitos antes de comenzar con el desarrollo:
   - Node.js y npm
   - DFX (Dfinity SDK)
   - Internet Identity configurado

2. **Pasos para Contribuir:**

   - Clonar el repositorio.
   - Crear una rama nueva para tu característica o corrección de error:
     ```bash
     git checkout -b nombre-de-tu-rama
     ```
   - Realizar los cambios necesarios y hacer commit:
     ```bash
     git commit -m "Descripción de tus cambios"
     ```
   - Hacer push a la rama creada:
     ```bash
     git push origin nombre-de-tu-rama
     ```
   - Crear un Pull Request en GitHub para que tus cambios sean revisados e integrados.

### Preguntas Frecuentes

- **¿Cómo puedo reiniciar el entorno de desarrollo?**
  Para reiniciar el entorno de desarrollo, puedes detener y reiniciar el servicio DFX:
  ```bash
  dfx stop
  dfx start --background
  ```

- **¿Cómo puedo verificar el estado de despliegue de los canisters?**
  Puedes utilizar el comando `dfx canister status` para verificar el estado de despliegue de los canisters:
  ```bash
  dfx canister status nombre_del_canister
  ```

- **¿Dónde puedo encontrar más información sobre el uso de DFX y Motoko?**
  La documentación oficial de Dfinity proporciona guías detalladas y ejemplos sobre el uso de DFX y el desarrollo en Motoko. Visita [Internet Computer Developer Documentation](https://smartcontracts.org/docs/developers-guide/introducing-
