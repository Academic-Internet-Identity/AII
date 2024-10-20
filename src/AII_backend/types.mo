import Nat "mo:base/Nat";
import Map "mo:map/Map";
import Set "mo:map/Set";
module {
    public type Uid = Text; // Usuario id
    public type Aid = Text; // Alumno id
    
    public type Calificaciones = {
        p1: ?Nat; // Primera evaluación
        p2: ?Nat; // Segunda evaluación
        p3: ?Nat; // Tercera evaluación
        final: ?Nat; // Calificación final
    };

    public type RegistroGrupo = {
        alumno: Text; // Cambiado a Text para almacenar la matrícula del alumno
        nombre: Text; // Nombre del alumno
        cuatrimestre: Nat; // Cuatrimestre
        materias: [MateriaRegistro]; // Lista de materias con sus calificaciones
    };

    public type MateriaRegistro = {
        materia: Text; // Nombre o código de la materia
        calificaciones: Calificaciones; // Calificaciones de la materia
    };


    public type Grupo = {
        id: Text; // ID del grupo
        nombre: Text; // Nombre del grupo
        cuatrimestre: Nat; // Cuatrimestre
        alumnos: [RegistroGrupo]; // Lista de registros de alumnos en el grupo
    };


    public type Rol = {
        #Admin;
        #Alumno;
        #Profesor;
        #Usuario;
        #Administrativo;
    };

    public type Usuario = {
        principal: Principal;
        uid: Text;
        nick: Text;
        email: Text;
        foto: ?Blob;
        rol: Rol;
    };

    public type Direccion = {
        calle: Text;
        numero: Text;
        colonia: Text;
        ciudad: Text;
        estado: Text;
        codigoPostal: Text;
    };

    public type Telefono = {
        tipo: Text;
        numero: Text;
    };

    public type DetalleMedico = {
        alergias: [Text];
        medicamentos: [Text];
    };

    public type RegistroAlumnoForm = {
        nombre: Text;
        apellidoPaterno: Text;
        apellidoMaterno: Text;
        tipoSanguineo: Text;
        fechaNacimiento: Text;
        curp: Text;
        genero: Text;
        lugarNacimiento: Text;
        estadoCivil: Text;
        emailPersonal: Text;
        direcciones: [Text];
        telefonos: [Text];
        detallesMedicos: Text;
        numeroSeguroSocial: Text;
        escuelasProcedencia: [Text];
        ocupaciones: [Text];
        tutorJefeFamilia: Text;
        familiares: [Text];
        pertenenciaEtniaIndigena: Bool;
        hablaLenguaIndigena: Bool;
        viveComunidadIndigena: Bool;
        folioCeneval: Text;
        emailInstitucional: Text;
        matricula: Text;
        carrera: Text;
        semestre: Nat;
        nivelDeIngles: Text; // Nuevo campo para el nivel de inglés
        certificacionDeIngles: Bool; // Nuevo campo para la certificación de inglés
    };


    public type RegistroAdministrativoForm = {
        nombre: Text;
        apellidoPaterno: Text;
        apellidoMaterno: Text;
        tipoSanguineo: Text;
        fechaNacimiento: Text;
        curp: Text;
        genero: Text;
        lugarNacimiento: Text;
        estadoCivil: Text;
        emailPersonal: Text;
        direcciones: [Text];
        telefonos: [Text];
        detallesMedicos: Text;
        numeroSeguroSocial: Text;
        cedulaProfesional: Text;
    };

    public type RegistroDocenteForm = {
        nombre: Text;
        apellidoPaterno: Text;
        apellidoMaterno: Text;
        tipoSanguineo: Text;
        fechaNacimiento: Text;
        curp: Text;
        genero: Text;
        lugarNacimiento: Text;
        estadoCivil: Text;
        emailPersonal: Text;
        direcciones: [Text];
        telefonos: [Text];
        detallesMedicos: Text;
        numeroSeguroSocial: Text;
        cedulaProfesional: Text;
        materias: [Text];
    };

    public type Alumno = {
        principalID: Principal;
        aid: Text;
        nombre: Text;
        apellidoPaterno: Text;
        apellidoMaterno: Text;
        tipoSanguineo: Text;
        fechaNacimiento: Text;
        curp: Text;
        genero: Text;
        lugarNacimiento: Text;
        estadoCivil: Text;
        emailPersonal: Text;
        direcciones: [Text];
        telefonos: [Text];
        detallesMedicos: Text;
        numeroSeguroSocial: Text;
        escuelasProcedencia: [Text];
        ocupaciones: [Text];
        tutorJefeFamilia: Text;
        familiares: [Text];
        pertenenciaEtniaIndigena: Bool;
        hablaLenguaIndigena: Bool;
        viveComunidadIndigena: Bool;
        folioCeneval: Text;
        emailInstitucional: Text;
        matricula: Text;
        carrera: Text;
        semestre: Nat;
        nivelDeIngles: Text; // Nuevo campo
        certificacionDeIngles: Bool; // Nuevo campo
    };


    public type Administrativo = {
        principalID: Principal;
        nombre: Text;
        apellidoPaterno: Text;
        apellidoMaterno: Text;
        tipoSanguineo: Text;
        fechaNacimiento: Text;
        curp: Text;
        genero: Text;
        lugarNacimiento: Text;
        estadoCivil: Text;
        emailPersonal: Text;
        direcciones: [Text];
        telefonos: [Text];
        detallesMedicos: Text;
        numeroSeguroSocial: Text;
        cedulaProfesional: Text;
    };

    public type Docente = {
        principalID: Principal;
        nombre: Text;
        apellidoPaterno: Text;
        apellidoMaterno: Text;
        tipoSanguineo: Text;
        fechaNacimiento: Text;
        curp: Text;
        genero: Text;
        lugarNacimiento: Text;
        estadoCivil: Text;
        emailPersonal: Text;
        direcciones: [Text];
        telefonos: [Text];
        detallesMedicos: Text;
        numeroSeguroSocial: Text;
        cedulaProfesional: Text;
        materias: [Text];
    };

    public type Materia = {
        nombre: Text;
        codigo: Text;
        creditos: Nat;
        carreras: [Text];
        grado: Nat;
    };



    public type Horario = {
        dia: Text;
        horaInicio: Text;
        horaFin: Text;
        grupoId: Text;  // Identificador del grupo asociado
        materia: Text;  // Materia asociada al horario
    };


    public type Timestamp = Nat64;

    public type HttpHeader = {
        name : Text;
        value : Text;
    };

    public type HttpMethod = {
        #get;
        #post;
        #head;
    };

    public type HttpResponsePayload = {
        status : Nat;
        headers : [HttpHeader];
        body : [Nat8];
    };

    public type HttpRequestArgs = {
        url : Text;
        max_response_bytes : ?Nat64;
        headers : [HttpHeader];
        body : ?[Nat8];
        method : HttpMethod;
        transform : ?TransformContext;
    };

    public type TransformContext = {
        function : shared query (TransformArgs) -> async HttpResponsePayload;
        context : Blob;
    };

    public type TransformArgs = {
        response : HttpResponsePayload;
        context : Blob;
    };

    public type IC = actor {
        http_request : HttpRequestArgs -> async HttpResponsePayload;
    };

    public type EstadoTramite = {
        #Pendiente;
        #EnProceso;
        #Completado;  // <- Esta variante
        #Rechazado;
    };


    public type Tramite = {
        id: Text;               // ID del trámite
        correoElectronico: Text; // Correo electrónico del alumno
        nombre: Text;            // Nombre del alumno
        matricula: Text;         // Matrícula del alumno
        carrera: Text;           // Carrera del alumno
        grado: Nat;              // Grado del alumno
        tipoSolicitud: Text;     // Tipo de solicitud (Ej. Inscripción, Baja, etc.)
        tramite: Text;           // Nombre del trámite específico
        estado: EstadoTramite;   // Estado del trámite
        comentarios: ?Text;      // Comentarios adicionales (opcional)
    };

    public type BucketManager = actor {
        stop_canister : shared { canister_id : Principal } -> async ();
        delete_canister : shared { canister_id : Principal } -> async ();
    };

    public type FileId = Nat;

    public type Dir = Map.Map<Text,{subDirs: Set.Set<Dir>; files: Set.Set<File>}>;
    // public type Dir = {name: Text; subDirs: [Dir]; files: [File]};

    public type User = {
        name: Text;
        // storage: Dir;
    };

    public type AssetMetadata = {
        fileName : Text;
        total_length : Nat;
    };
    public type TempFile = {
        owner: Principal;
        fileName : Text;
        modified : Int;
        content_chunks : [var Blob];
        chunks_qty: Nat;
        total_length : Nat;
        certified : Bool;
    }; 
    public type File = {
        owner: Principal;
        authorizedReaders: [Principal];
        fileName : Text;
        modified : Int;
        content_chunks : [Blob];
        chunks_qty: Nat;
        total_length : Nat;
        certified : Bool;
    };
    public type StorageLocation = {
        canisterId: Principal; 
        fileId: Nat; 
        owner: Principal
    };
    public type StoreRequestResponse = {
        canisterId: Principal;
        uploadParameters: UploadResponse;
    };
    public type UploadResponse = {
        id: FileID;
        chunksQty: Nat;
        chunkSize: Nat;
    };

    public type ReadResponse = {
        id: Nat;
        file: File;
    };

    public type ReadFileResponse = {
        canisterId: Principal;
        id: Nat;
        file: File;
    };

    public type Chunk = Blob;
    public type FileID = Nat;


};