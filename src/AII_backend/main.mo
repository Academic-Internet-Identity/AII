import Principal "mo:base/Principal";
import Nat "mo:base/Nat";
import Iter "mo:base/Iter";
import Map "mo:map/Map";
import Text "mo:base/Text";
import Set "mo:map/Set";
import Debug "mo:base/Debug";
import Types "./types";
import Cycles "mo:base/ExperimentalCycles";
import Blob "mo:base/Blob";
import Array "mo:base/Array";
import Bucket "bucket";
import { thash; nhash; phash } "mo:map/Map";
import Prim "mo:⛔";
//import ckbtcLedger "canister:icrc1_ledger";



shared ({ caller }) actor class _Plataforma() {

    stable let deployer = caller;

    public type Usuario = Types.Usuario;
    public type Alumno = Types.Alumno;
    public type Administrativo = Types.Administrativo;
    public type Docente = Types.Docente;
    public type Uid = Types.Uid;
    public type Aid = Types.Aid;
    public type Materia = Types.Materia;
    public type Tramite = Types.Tramite;
    public type Horario = Types.Horario;
    public type Grupo = Types.Grupo;
    public type RegistroGrupo = Types.RegistroGrupo;
    public type Calificaciones = Types.Calificaciones;
    public type RegistroAlumnoForm = Types.RegistroAlumnoForm;
    public type RegistroAdministrativoForm = Types.RegistroAdministrativoForm;
    public type RegistroDocenteForm = Types.RegistroDocenteForm;
    public type MateriaRegistro = Types.MateriaRegistro;
    public type EstadoTramite = Types.EstadoTramite;
    

    stable var actualUid : Nat = 0;
    stable var actualAid : Nat = 0;
    stable var actualTid : Nat = 0;

    stable var grupos = Map.new<Text, Grupo>(); // Mapa de grupos por ID

    func generarUid() : Text {
        actualUid += 1;
        "U" # Nat.toText(actualUid);
    };

    func generarAid() : Text {
        actualAid += 1;
        "A" # Nat.toText(actualAid);
    };
    // Función para generar un nuevo ID de trámite
    func generarTramiteId(): Text {
        actualTid += 1;
        "T" # Nat.toText(actualTid);
    };

    stable let usuarios = Map.new<Principal, Usuario>();
    stable let alumnos = Map.new<Principal, Alumno>();
    stable let alumnoMat = Map.new<Text, Alumno>();

    stable let admins = Set.new<Principal>();
    // Mapa para almacenar las carreras, usando el código de la carrera como clave
    stable var carreras = Map.new<Text, Text>();  // clave: código, valor: nombre de la carrera


    stable let administrativos = Map.new<Principal, Administrativo>();
    stable let docentes = Map.new<Principal, Docente>();
    ignore Set.put<Principal>(admins, phash, deployer);
    ignore Set.put<Principal>(admins, phash, deployer);

    stable let alumnosIngresantes = Map.new<Principal, RegistroAlumnoForm>();
    stable let administrativosIngresantes = Map.new<Principal, RegistroAdministrativoForm>();
    stable let docentesIngresantes = Map.new<Principal, RegistroDocenteForm>();

    stable let materias = Map.new<Text, Materia>();
    stable let horarios = Map.new<Text, [Horario]>();
    // Mapa para almacenar los trámites
    stable var tramites = Map.new<Text, Tramite>(); // Mapa de trámites por ID


    type User = Types.User;
    type Bucket = Bucket.Bucket;
    type StoreRequestResponse = Types.StoreRequestResponse;
    type ReadFileResponse = Types.ReadFileResponse;
    type StorageLocation = Types.StorageLocation;
    type File = Types.File;
    type FileId = Types.FileId;
    type Dir = Types.Dir;
    type Result<O,E> = {#Ok: O; #Err: E};

    stable let buckets = Map.new<Principal, Bucket>();
    stable let cyclesLedger = Map.new<Principal, Nat>();
    stable let users = Map.new<Principal, User>();
    stable let indexFiles = Map.new<FileId, StorageLocation>();

    stable var currentFileId = 0;



    public shared ({ caller }) func getMyUser() : async ?Usuario {
        Map.get(usuarios, phash, caller);

    };

    func getFileId(): FileId{
        currentFileId += 1;
        currentFileId - 1;
    };

    func isUser(p : Principal) : Bool {
        switch (Map.get<Principal, User>(users, phash, p)) {
            case null { false };
            case (_) { true };
        };
    };


    

    ///////////Seccion para verificar roles//////////

    func _esUsuario(p : Principal) : Bool {
        return switch (Map.get<Principal, Usuario>(usuarios, Map.phash, p)) {
            case null { false };
            case _ { true };
        };
    };

    func esAlumno(p: Principal) : Bool {
        switch (Map.get(alumnos, phash, p)) {
            case null { false };
            case _ { true };
        };
    };

    func esAdmin(p : Principal) : Bool {
        Debug.print("Checking if principal is admin: " # Principal.toText(p));
        let result = Set.has<Principal>(admins, Map.phash, p);
        Debug.print("Is admin: " # (if result { "true" } else { "false" }));
        result;
    };

    func esDocente(p: Principal) : Bool {
        switch (Map.get(docentes, phash, p)) {
            case null { false };
            case _ { true };
        };
    };

    func esAdministrativo(p: Principal) : Bool {
        switch (Map.get(administrativos, phash, p)) {
            case null { false };
            case _ { true };
        };
    };

    ///////////Fin Seccion para verificar roles//////////


    // Ver todos los trámites
    public shared query func VerTramites() : async [Tramite] {
        Iter.toArray(Map.vals<Text, Tramite>(tramites));
    };

    // Ver los trámites de un alumno (filtrando por matrícula)
    public shared query ({ caller }) func VerMisTramites() : async [Tramite] {
        // Recuperar la información del alumno basado en el principal (caller)
        let alumnoOpt = Map.get<Principal, Alumno>(alumnos, phash, caller);

        // Verificar que el alumno esté registrado
        switch alumnoOpt {
            case null {
                // Si el alumno no está registrado, devolver un arreglo vacío
                return [];
            };
            case (?alumno) {
                // Filtrar los trámites por la matrícula del alumno registrado
                let matricula = alumno.matricula;

                return Array.filter<Tramite>(Iter.toArray(Map.vals<Text, Tramite>(tramites)), func (t: Tramite) : Bool {
                    t.matricula == matricula;
                });
            };
        };
    };








    // Iniciar un nuevo trámite por parte de un alumno
    public shared ({ caller }) func IniciarTramite(
        tipoSolicitud: Text,
        tramite: Text,
        comentarios: ?Text  // Este campo es opcional
    ) : async Text {
        // Recuperar la información del alumno basado en el principal (caller)
        let alumnoOpt = Map.get<Principal, Alumno>(alumnos, phash, caller);

        // Verificar que el alumno esté registrado
        switch alumnoOpt {
            case null {
                return "Error: El alumno no está registrado en el sistema.";
            };
            case (?alumno) {
                // Generar un nuevo ID de trámite
                let idTramite = generarTramiteId();

                // Crear un nuevo trámite usando los datos del alumno recuperados
                let nuevoTramite : Tramite = {
                    id = idTramite;
                    correoElectronico = alumno.emailInstitucional;  // Usar el email institucional del alumno
                    nombre = alumno.nombre # " " # alumno.apellidoPaterno # " " # alumno.apellidoMaterno;
                    matricula = alumno.matricula;
                    carrera = alumno.carrera;
                    grado = alumno.semestre;
                    tipoSolicitud = tipoSolicitud;
                    tramite = tramite;
                    estado = #Pendiente;  // El trámite se crea con estado "Pendiente"
                    comentarios = comentarios;
                };

                // Guardar el nuevo trámite en el mapa
                ignore Map.put<Text, Tramite>(tramites, thash, idTramite, nuevoTramite);

                return "Trámite iniciado exitosamente con ID: " # idTramite;
            };
        };
    };



    // Modificar el estado de un trámite existente
    public shared ({ caller }) func ModificarEstadoTramite(idTramite: Text, nuevoEstado: EstadoTramite) : async Text {
        let tramiteOpt = Map.get<Text, Tramite>(tramites, thash, idTramite);
        switch tramiteOpt {
            case null { return "Trámite no encontrado."; };
            case (?tramite) {
                let tramiteActualizado : Tramite = {
                    id = tramite.id;
                    correoElectronico = tramite.correoElectronico;
                    nombre = tramite.nombre;
                    matricula = tramite.matricula;
                    carrera = tramite.carrera;
                    grado = tramite.grado;
                    tipoSolicitud = tramite.tipoSolicitud;
                    tramite = tramite.tramite;
                    estado = nuevoEstado;  // Aquí actualizamos el estado
                    comentarios = tramite.comentarios;
                };
                ignore Map.put<Text, Tramite>(tramites, thash, idTramite, tramiteActualizado);
                return "Estado del trámite actualizado exitosamente.";
            };
        };
    };



    // Rechazar un trámite
    public shared ({ caller }) func RechazarTramite(idTramite: Text) : async Text {
        let tramiteOpt = Map.get<Text, Tramite>(tramites, thash, idTramite);
        switch tramiteOpt {
            case null { return "Trámite no encontrado."; };
            case (?tramite) {
                let tramiteActualizado = { tramite with estado = #Rechazado };
                ignore Map.put<Text, Tramite>(tramites, thash, idTramite, tramiteActualizado);
                return "Trámite rechazado exitosamente.";
            };
        };
    };











   

    public shared ({ caller }) func agregarCarrera(codigo: Text, nombre: Text) : async Text {
        assert (esAdmin(caller) or esAdministrativo(caller)); // Verificar permisos

        if (Map.has<Text, Text>(carreras, thash, codigo)) {
            return "Error: Ya existe una carrera con ese código.";
        };
        ignore Map.put<Text, Text>(carreras, thash, codigo, nombre);
        return "Carrera agregada exitosamente";
    };

    public shared ({ caller }) func editarCarrera(codigo: Text, nuevoNombre: Text) : async Text {
        assert (esAdmin(caller) or esAdministrativo(caller)); // Verificar permisos

        let carreraOpt = Map.get<Text, Text>(carreras, thash, codigo);
        switch carreraOpt {
            case null { return "Error: No se encontró la carrera con el código proporcionado."; };
            case (?_) {
                ignore Map.put<Text, Text>(carreras, thash, codigo, nuevoNombre);
                return "Carrera actualizada exitosamente";
            };
        };
    };

    public shared ({ caller }) func eliminarCarrera(codigo: Text) : async Text {
        assert (esAdmin(caller) or esAdministrativo(caller)); // Verificar permisos

        let carreraOpt = Map.remove<Text, Text>(carreras, thash, codigo);
        switch carreraOpt {
            case null { return "Error: No se encontró la carrera con el código proporcionado."; };
            case (?_) { return "Carrera eliminada exitosamente"; };
        };
    };

    public shared query func listarCarreras() : async [(Text, Text)] {
        return Iter.toArray(Map.entries<Text, Text>(carreras));
    };
















    public shared ({ caller }) func agregarAdmin(p : Principal) : async Bool {
        assert esAdmin(caller) and _esUsuario(p);
        ignore Set.put<Principal>(admins, Map.phash, p);
        true;
    };

    public shared ({ caller }) func removerAdmin(p : Principal) : async Bool {
        assert (deployer == caller and p != caller);
        ignore Set.remove<Principal>(admins, Map.phash, p);
        true;
    };

    public shared ({ caller }) func registrarse(nick : Text, email : Text) : async Text {
        Debug.print("Registering user: " # Principal.toText(caller));
        Debug.print("Nickname: " # nick # ", Email: " # email);
        if (Principal.isAnonymous(caller)) {
            Debug.print("Caller cannot be anonymous");
            return "Error: Caller cannot be anonymous";
        };
        if (_esUsuario(caller)) {
            Debug.print("Caller is already registered as a user");
            return "Error: Caller is already registered as a user";
        };
        let nuevoUsuario : Usuario = {
            principal = caller;
            uid = generarUid();
            nick;
            email;
            foto = null;
            rol = #Usuario;
        };
        ignore Map.put<Principal, Usuario>(usuarios, Map.phash, caller, nuevoUsuario);
        "U" # Nat.toText(actualUid);
    };

    public shared ({ caller }) func registrarseComoAlumno(_init : RegistroAlumnoForm) : async Text {
        assert not Principal.isAnonymous(caller);
        let usuario = Map.get<Principal, Usuario>(usuarios, Map.phash, caller);
        switch usuario {
            case null { return "Debe registrarse como usuario previamente"; };
            case (?usuario) {
                if (Map.has<Principal, RegistroAlumnoForm>(alumnosIngresantes, Map.phash, caller)) {
                    return "Usted ya tiene pendiente de aprobación una solicitud de registro como alumno";
                };
                ignore Map.put<Principal, RegistroAlumnoForm>(alumnosIngresantes, Map.phash, caller, _init);
                return "Solicitud de registro como alumno ingresada exitosamente";
            };
        };
    };

    public shared ({ caller }) func aprobarRegistroDeAlumno(solicitante : Principal) : async Text {
        Debug.print("Approving student registration for: " # Principal.toText(solicitante));
        assert ( esAdmin(caller) or esAdministrativo(caller));
        let usuario = Map.get<Principal, Usuario>(usuarios, Map.phash, solicitante);
        switch usuario {
            case null { return "El usuario no está registrado"; };
            case (?usuario) {
                let solicitud = Map.remove<Principal, RegistroAlumnoForm>(alumnosIngresantes, Map.phash, solicitante);
                switch (solicitud) {
                    case null { return "No hay solicitud de registro de alumno para este usuario"; };
                    case (?solicitud) {
                        let nuevoAlumno : Alumno = {
                            principalID = solicitante;
                            aid = generarAid();
                            nombre = solicitud.nombre;
                            apellidoPaterno = solicitud.apellidoPaterno;
                            apellidoMaterno = solicitud.apellidoMaterno;
                            tipoSanguineo = solicitud.tipoSanguineo;
                            fechaNacimiento = solicitud.fechaNacimiento;
                            curp = solicitud.curp;
                            genero = solicitud.genero;
                            lugarNacimiento = solicitud.lugarNacimiento;
                            estadoCivil = solicitud.estadoCivil;
                            emailPersonal = solicitud.emailPersonal;
                            direcciones = solicitud.direcciones;
                            telefonos = solicitud.telefonos;
                            detallesMedicos = solicitud.detallesMedicos;
                            numeroSeguroSocial = solicitud.numeroSeguroSocial;
                            escuelasProcedencia = solicitud.escuelasProcedencia;
                            ocupaciones = solicitud.ocupaciones;
                            tutorJefeFamilia = solicitud.tutorJefeFamilia;
                            familiares = solicitud.familiares;
                            pertenenciaEtniaIndigena = solicitud.pertenenciaEtniaIndigena;
                            hablaLenguaIndigena = solicitud.hablaLenguaIndigena;
                            viveComunidadIndigena = solicitud.viveComunidadIndigena;
                            folioCeneval = solicitud.folioCeneval;
                            emailInstitucional = solicitud.emailInstitucional;
                            matricula = solicitud.matricula;
                            carrera = solicitud.carrera;
                            semestre = solicitud.semestre;
                            nivelDeIngles = solicitud.nivelDeIngles;
                            certificacionDeIngles = solicitud.certificacionDeIngles;
                        };

                        // Añadir a ambos mapas
                        ignore Map.put<Principal, Alumno>(alumnos, Map.phash, solicitante, nuevoAlumno);
                        ignore Map.put<Text, Alumno>(alumnoMat, thash, nuevoAlumno.matricula, nuevoAlumno);

                        ignore Map.put<Principal, Usuario>(usuarios, Map.phash, solicitante, {usuario with rol = #Alumno});
                        return "A" # Nat.toText(actualAid);
                    };
                };
            };
        };
    };

    public shared ({ caller }) func registrarseComoAdministrativo(_init : RegistroAdministrativoForm) : async Text {
        assert not Principal.isAnonymous(caller);
        let usuario = Map.get<Principal, Usuario>(usuarios, Map.phash, caller);
        switch usuario {
            case null { return "Debe registrarse como usuario previamente"; };
            case (?usuario) {
                if (Map.has<Principal, RegistroAdministrativoForm>(administrativosIngresantes, Map.phash, caller)) {
                    return "Usted ya tiene pendiente de aprobación una solicitud de registro como administrativo";
                };
                ignore Map.put<Principal, RegistroAdministrativoForm>(administrativosIngresantes, Map.phash, caller, _init);
                return "Solicitud de registro como administrativo ingresada exitosamente";
            };
        };
    };

    public shared ({ caller }) func aprobarRegistroDeAdministrativo(solicitante : Principal) : async Text {
        Debug.print("Approving administrative registration for: " # Principal.toText(solicitante));
        assert ( esAdmin(caller) or esAdministrativo(caller));
        let usuario = Map.get<Principal, Usuario>(usuarios, Map.phash, solicitante);
        switch usuario {
            case null { return "El usuario no está registrado"; };
            case (?usuario) {
                let solicitud = Map.remove<Principal, RegistroAdministrativoForm>(administrativosIngresantes, Map.phash, solicitante);
                switch (solicitud) {
                    case null { return "No hay solicitud de registro de administrativo para este usuario"; };
                    case (?solicitud) {
                        let nuevoAdministrativo : Administrativo = {
                            solicitud with
                            principalID = solicitante;
                        };
                        ignore Map.put<Principal, Administrativo>(administrativos, Map.phash, solicitante, nuevoAdministrativo);
                        ignore Map.put<Principal, Usuario>(usuarios, Map.phash, solicitante, {usuario with rol = #Administrativo});
                        return "Registro aprobado (Administrativo)";
                    };
                };
            };
        };
    };

    public shared ({ caller }) func registrarseComoDocente(_init : RegistroDocenteForm) : async Text {
        assert not Principal.isAnonymous(caller);
        let usuario = Map.get<Principal, Usuario>(usuarios, Map.phash, caller);
        switch usuario {
            case null { return "Debe registrarse como usuario previamente"; };
            case (?usuario) {
                if (Map.has<Principal, RegistroDocenteForm>(docentesIngresantes, Map.phash, caller)) {
                    return "Usted ya tiene pendiente de aprobación una solicitud de registro como docente";
                };
                ignore Map.put<Principal, RegistroDocenteForm>(docentesIngresantes, Map.phash, caller, _init);
                return "Solicitud de registro como docente ingresada exitosamente";
            };
        };
    };

    public shared ({ caller }) func aprobarRegistroDeDocente(solicitante : Principal) : async Text {
        Debug.print("Approving teacher registration for: " # Principal.toText(solicitante));
        assert ( esAdmin(caller) or esAdministrativo(caller));
        let usuario = Map.get<Principal, Usuario>(usuarios, Map.phash, solicitante);
        switch usuario {
            case null { return "El usuario no está registrado"; };
            case (?usuario) {
                let solicitud = Map.remove<Principal, RegistroDocenteForm>(docentesIngresantes, Map.phash, solicitante);
                switch (solicitud) {
                    case null { return "No hay solicitud de registro de docente para este usuario"; };
                    case (?solicitud) {
                        let nuevoDocente : Docente = {
                            solicitud with
                            principalID = solicitante;
                            materias = solicitud.materias;
                        };
                        ignore Map.put<Principal, Docente>(docentes, Map.phash, solicitante, nuevoDocente);
                        ignore Map.put<Principal, Usuario>(usuarios, Map.phash, solicitante, {usuario with rol = #Profesor});
                        return "Registro aprobado";
                    };
                };
            };
        };
    };

    public shared query ({ caller }) func verAlumnosIngresantes() : async [(Principal, RegistroAlumnoForm)] {
        assert ( esAdmin(caller) or esAdministrativo(caller));
        Iter.toArray(Map.entries<Principal, RegistroAlumnoForm>(alumnosIngresantes));
    };



    public shared query ({ caller }) func verAdministrativosIngresantes() : async [(Principal, RegistroAdministrativoForm)] {
        assert ( esAdmin(caller) or esAdministrativo(caller));
        Iter.toArray(Map.entries<Principal, RegistroAdministrativoForm>(administrativosIngresantes));
    };

    public shared query ({ caller }) func verDocentesIngresantes() : async [(Principal, RegistroDocenteForm)] {
        assert ( esAdmin(caller) or esAdministrativo(caller));
        Iter.toArray(Map.entries<Principal, RegistroDocenteForm>(docentesIngresantes));
    };

    public shared query ({ caller }) func verAdministrativos() : async [Administrativo] {
        assert ( esAdmin(caller) or esAdministrativo(caller));
        Iter.toArray(Map.vals<Principal, Administrativo>(administrativos));
    };

    public shared query ({ caller }) func verDocentes() : async [Docente] {
        assert ( esAdmin(caller) or esAdministrativo(caller));
        Iter.toArray(Map.vals<Principal, Docente>(docentes));
    };

    ////////////funcion desconocida alan??/////////
    func _enArray<T>(a : [T], e : T, equal : (T, T) -> Bool) : Bool {
        for (i in a.vals()) { if (equal(i, e)) { return true } };
        return false;
    };
    ////////////////////////////////////////////

    public shared query ({ caller }) func verAlumnos() : async [Alumno] {
        assert ( esAdmin(caller) or esAdministrativo(caller));
        Iter.toArray(Map.vals<Principal, Alumno>(alumnos));
    };

    public query func statusPlatform(): async [{key: Text; value: Text}] {
        assert ( esAdmin(caller) or esAdministrativo(caller));
        [
            {key = "Users"; value = Nat.toText(Map.size(usuarios))},
            {key = "Alumnos"; value = Nat.toText(Map.size(alumnos))}
        ]
    };

    ///VER PERFIL DEL USUARIO///
    public shared ({ caller }) func getMyAlumno() : async ?Alumno {
        // Buscar en el mapa alumnos usando Principal como clave
        let alumnoPorPrincipal = Map.get(alumnos, phash, caller);
        if (alumnoPorPrincipal != null) {
            return alumnoPorPrincipal;
        };

        // Alternativamente, buscar en el mapa alumnoMat usando la matrícula
        let usuario = Map.get(usuarios, phash, caller);
        switch usuario {
            case null { return null; };
            case (?usuario) {
                return Map.get(alumnoMat, thash, usuario.uid);
            };
        };
    };

    public shared ({ caller }) func getMyDocente() : async ?Docente {
        Map.get(docentes, phash, caller);
    };
    public shared ({ caller }) func getMyAdministrativo() : async ?Administrativo {
        Map.get(administrativos, phash, caller);
    };
    ///FIN DE VER PERFIL DEL USUARIO/// 

    public shared ({ caller }) func agregarMateria(nombre: Text, codigo: Text, creditos: Nat, carreras: [Text], grado: Nat) : async Text {
        assert (esAdmin(caller) or esAdministrativo(caller));
        let nuevaMateria : Materia = { nombre; codigo; creditos; carreras; grado };
        ignore Map.put<Text, Materia>(materias, thash, codigo, nuevaMateria);
        return "Materia agregada exitosamente";
    };


public shared ({ caller }) func eliminarMateria(codigo: Text) : async Text {
        // Verificar si el usuario tiene los permisos correctos
        assert (esAdmin(caller) or esAdministrativo(caller));
    
        // Eliminar la materia del mapa de materias
        let materiaOpt = Map.remove<Text, Materia>(materias, thash, codigo);
        switch materiaOpt {
            case null { return "La materia especificada no existe"; };
            case (?_) {
                // Eliminar la materia de los horarios
                for (grupoHorario in Map.entries<Text, [Horario]>(horarios)) {
                    let (grupoId, listaHorarios) = grupoHorario;
                    let horariosActualizados = Array.filter<Horario>(listaHorarios, func(horario) : Bool {
                        horario.materia != codigo
                    });
                    if (Array.size(horariosActualizados) < Array.size(listaHorarios)) {
                        ignore Map.put<Text, [Horario]>(horarios, thash, grupoId, horariosActualizados);
                    }
                };

                // Eliminar la materia de los registros de los alumnos en los grupos
                for (grupo in Map.entries<Text, Grupo>(grupos)) {
                    let (grupoId, grupoData) = grupo;
                    let alumnosActualizados = Array.map<RegistroGrupo, RegistroGrupo>(grupoData.alumnos, func (registro: RegistroGrupo) : RegistroGrupo {
                        let materiasActualizadas = Array.filter<MateriaRegistro>(registro.materias, func (materiaRegistro: MateriaRegistro) : Bool {
                            materiaRegistro.materia != codigo
                        });
                        { registro with materias = materiasActualizadas };
                    });
                    ignore Map.put<Text, Grupo>(grupos, thash, grupoId, { grupoData with alumnos = alumnosActualizados });
                };

                return "Materia eliminada exitosamente";
            };
        };
    };

    public shared query ({ caller }) func verMaterias() : async [Materia] {
        Iter.toArray(Map.vals<Text, Materia>(materias));
    };

public shared ({ caller }) func agregarHorario(grupoId: Text, materia: Text, dia: Text, horaInicio: Text, horaFin: Text) : async Text {
    assert (esAdmin(caller) or esAdministrativo(caller));

    let grupoOpt = Map.get<Text, Grupo>(grupos, thash, grupoId);
    switch grupoOpt {
        case null { return "Grupo no encontrado"; };
        case (?grupo) {
            let nuevoHorario : Horario = { dia; horaInicio; horaFin; grupoId; materia };
            let horariosExistentes = switch (Map.get<Text, [Horario]>(horarios, thash, grupoId)) {
                case null { []; };
                case (?h) { h };
            };
            ignore Map.put<Text, [Horario]>(horarios, thash, grupoId, Array.append(horariosExistentes, [nuevoHorario]));

            // Actualizar las materias de los alumnos en este grupo
            let alumnosActualizados = Array.map<RegistroGrupo, RegistroGrupo>(grupo.alumnos, func (registro: RegistroGrupo) : RegistroGrupo {
                // Añadir la nueva materia si no está ya presente
                if (Array.find<MateriaRegistro>(registro.materias, func (mat: MateriaRegistro) : Bool { mat.materia == materia }) == null) {
                    let nuevoRegistroMateria: MateriaRegistro = {
                        materia = materia;
                        calificaciones = { p1 = null; p2 = null; p3 = null; final = null };
                    };
                    { registro with materias = Array.append(registro.materias, [nuevoRegistroMateria]) };
                } else {
                    registro;
                }
            });

            let grupoActualizado = { grupo with alumnos = alumnosActualizados };
            ignore Map.put<Text, Grupo>(grupos, thash, grupoId, grupoActualizado);

            return "Horario y materias de alumnos actualizados exitosamente";
        };
    };
};


//NO FUNCIONA AUN, DA ERROR EN let materiaOpt = Map.get<Text, Materia>(materias, thash, horario.materia); :C

/* public shared query ({ caller }) func verMateriasDeGrupoPorDocente(grupoId: Text) : async ?[Materia] {
    // Verificar que el solicitante es un docente
    assert esDocente(caller);

    // Obtener los detalles del grupo solicitado
    let grupoOpt = Map.get<Text, Grupo>(grupos, thash, grupoId);
    switch grupoOpt {
        case null { return null; };  // Si el grupo no existe, retornar null
        case (?grupo) {
            // Buscar los horarios asociados a este grupo
            let horariosOpt = Map.get<Text, [Horario]>(horarios, thash, grupoId);
            switch horariosOpt {
                case null { return null; };  // Si no hay horarios asociados, retornar null
                case (?horarios) {
                    // Filtrar las materias que son impartidas por el docente actual (caller)
                    let materiasDocente = Array.filter<Horario>(horarios, func (horario: Horario) : Bool {
                        // Para cada horario, verificamos si el docente es el que solicita (caller)
                        let docenteOpt = Map.get<Principal, Docente>(docentes, phash, caller);
                        switch docenteOpt {
                            case null { return false; };  // Si no se encuentra el docente, retornamos false
                            case (?docente) {
                                // Verificar si el docente imparte esta materia con Array.find
                                Array.find<Text>(docente.materias, func (materiaDocente: Text) : Bool {
                                    materiaDocente == horario.materia
                                }) != null;
                            };
                        }
                    });

                    // Obtener las materias desde los horarios filtrados
                    let materias = Array.map<Horario, Materia>(materiasDocente, func (horario: Horario) : Materia {
                        // Obtener la materia desde el código almacenado en el horario
                        let materiaOpt = Map.get<Text, Materia>(materias, thash, horario.materia);
                        switch materiaOpt {
                            case null {
                                return {
                                    nombre = "Nombre Desconocido";  // Valor por defecto si no se encuentra la materia
                                    codigo = horario.materia;
                                    creditos = 0;
                                    carreras = [];
                                };
                            };
                            case (?materia) { return materia; };
                        }
                    });

                    return ?materias;
                };
            };
        };
    };
}; */


    public shared ({ caller }) func signUp(name : Text) : () {
        assert not Principal.isAnonymous(caller);
        assert not isUser(caller);
        let user = Map.get<Principal, User>(users, phash, caller);
        switch user {
            case null {   
                let newUser = {name};
                ignore Map.put<Principal, User>(users, phash, caller, newUser); // Registro del usuario
                ignore Map.put<Principal, Nat>(cyclesLedger, phash, caller, 5_000_000_000_000); // Asignacion de ciclos de regalo
                ();
            };
            case _ { () };
        };
    };

    func newBucket(): async {canisterId: Principal; bucket: Bucket}{
        Prim.cyclesAdd<system>(300_000_000_000); // Cantidad de ciclos para desplegar el Bucket y que tenga una vida prolongada
        let newBucket = await Bucket.Bucket(300_000_000_000); // Bytes capacity (Hasta 400GB (ver documentación"))
        let canisterId = Principal.fromActor(newBucket);
        ignore Map.put<Principal, Bucket>(buckets, phash, canisterId, newBucket);
        {canisterId; bucket = newBucket}
    };

    ///////////////////////// Upload File /////////////////////

    public shared ({ caller }) func getStorageFor(fileName : Text, fileSize : Nat) : async StoreRequestResponse {
        assert (esAdmin(caller) or esAdministrativo(caller) or esAlumno(caller) or esDocente(caller));

        var bestCandidate : ?{entry: (Principal, Bucket); size: Nat} = null;
        for ((principal, bucket) in Map.entries(buckets)) {
            let bucketSize = await bucket.getMemoryAllowed();
            if (bucketSize >= fileSize) {
                switch bestCandidate {
                    case null {
                        bestCandidate := ?{entry = (principal, bucket); size = bucketSize}
                    };
                    case (?candidate) {
                        bestCandidate := if(candidate.size < bucketSize) {
                            bestCandidate;
                        } else {
                            ?{entry = (principal, bucket); size = bucketSize}
                        }
                    }
                };     
            };
        };
        let storage = switch bestCandidate {
            case null { await newBucket() };
            case (?best) { {canisterId = best.entry.0; bucket = best.entry.1} };
        };
        let uploadParameters = await storage.bucket.uploadRequest(caller, fileName, fileSize);
        {canisterId = storage.canisterId; uploadParameters};
    };

    public shared ({caller}) func commitStorage(internalBucketId : Nat, owner: Principal): async {#Ok: Nat; #Err: Text}{
        //if(not isUser(owner)){ return #Err("Main err: Is not user") };  // Confirmamos que quien quiere subir el archivo es usuario
        assert(Map.has<Principal, Bucket>(buckets, phash, caller)); //Confirmamos que se esta llamando desde un bucket
        let storageLocation: StorageLocation = {canisterId = caller; fileId = internalBucketId; owner};
        let id = getFileId();
        ignore Map.put<Nat, StorageLocation>(indexFiles, nhash, id, storageLocation);
        return #Ok(id)
    };

    //////////////////////// Read or Download file /////////////

    /// Esta funcion solo inicia el proceso de lectura del archivo y, mediante los datos obtenidos en la repuesta,
    /// se accedera desde el front a la descarga directa de los fragmentos del archivo alojados en el bucket

    public shared ({ caller }) func readRequest(fileId: Nat): async Result<ReadFileResponse, Text> {
        assert (esAdmin(caller) or esAdministrativo(caller) or esAlumno(caller) or esDocente(caller));
        
        let location = Map.get<Nat, StorageLocation>(indexFiles, nhash, fileId);
        switch location{
            case null {#Err("FileId not found in main canister")};
            case (?location){
                let bucket = Map.get<Principal, Bucket>(buckets, phash, location.canisterId);
                switch bucket {
                    case null { #Err("Unexpected error. Error code:") };
                    case(?bucket) {
                        let readResponse = await bucket.readRequestFoUser(location.fileId, caller);
                        switch readResponse {
                            case(#Ok(readResponse)) {#Ok({readResponse with canisterId = location.canisterId}) };
                            case(#Err(e)) {#Err(e)};
                        };
                    };
                }
            }   
             
        }
    };


    public shared ({ caller }) func requestDeleteFile(fileId: Nat): async Result<Text, Text> {
        assert (esAdmin(caller) or esAdministrativo(caller) or esAlumno(caller) or esDocente(caller));

        let location = Map.get<Nat, StorageLocation>(indexFiles, nhash, fileId);
        switch location {
            case null { #Err("FileId not found in main canister");};
            case (?location) {
                let bucket = Map.get<Principal, Bucket>(buckets, phash, location.canisterId);
                switch bucket {
                    case null {#Err("Unexpected error. Error code: Could not find the bucket.");};
                    case (?bucket) {
                        let deleteResult = await bucket.deleteFile(location.fileId, caller);
                        if (deleteResult) {
                            ignore Map.remove<Nat, StorageLocation>(indexFiles, nhash, fileId);
                            return #Ok("Archivo eliminado exitosamente.");
                        } else {
                            return #Err("Error: No se pudo eliminar el archivo.");
                        }
                    };
                };
            };
        }
    };

    ////////////////////////////////////// Compartir archivos /////////////////////////////////////////////////
    public shared ({ caller }) func shareFileWithPrincipalInMain(fileId: Nat, p: Principal): async Result<[Principal], Text> {
        assert (esAdmin(caller) or esAdministrativo(caller) or esAlumno(caller) or esDocente(caller));

        let location = Map.get<Nat, StorageLocation>(indexFiles, nhash, fileId);
        switch location {
            case null { #Err("FileId not found in main canister") };
            case (?location) {
                let bucket = Map.get<Principal, Bucket>(buckets, phash, location.canisterId);
                switch bucket {
                    case null { #Err("Bucket not found") };
                    case (?bucket) {
                        let shareResponse = await bucket.shareFileWithPrincipal(location.fileId, p);
                        #Ok(shareResponse);
                    };
                };
            };
        }
    };

    // Nueva función que solo devuelve el principal del bucket donde está el archivo
    public shared ({ caller }) func getBucketPrincipalForFile(fileId: Nat): async Result<Principal, Text> {
        assert (esAdmin(caller) or esAdministrativo(caller) or esAlumno(caller) or esDocente(caller));

        let location = Map.get<Nat, StorageLocation>(indexFiles, nhash, fileId);
        switch location {
            case null { #Err("FileId not found in main canister") };
            case (?location) {
                // Devolver el Principal del bucket
                #Ok(location.canisterId);
            };
        }
    };


    ///////////////////////////////////// Dejar de compartir archivos ////////////////////////////////////////////
    public shared ({ caller }) func stopShareFileWithPrincipalInMain(fileId: Nat, p: Principal): async Result<(), Text> {
        assert (esAdmin(caller) or esAdministrativo(caller) or esAlumno(caller) or esDocente(caller));

        let location = Map.get<Nat, StorageLocation>(indexFiles, nhash, fileId);
        switch location {
            case null { #Err("FileId not found in main canister") };
            case (?location) {
                let bucket = Map.get<Principal, Bucket>(buckets, phash, location.canisterId);
                switch bucket {
                    case null { #Err("Bucket not found") };
                    case (?bucket) {
                        let _ = await bucket.stopShareFileWithPrincipal(location.fileId, p);
                        #Ok(());
                    };
                };
            };
        }
    };

    public shared ({ caller }) func stopShareFileInMain(fileId: Nat): async Result<(), Text> {
        assert (esAdmin(caller) or esAdministrativo(caller) or esAlumno(caller) or esDocente(caller));
        
        let location = Map.get<Nat, StorageLocation>(indexFiles, nhash, fileId);
        switch location {
            case null { #Err("FileId not found in main canister") };
            case (?location) {
                let bucket = Map.get<Principal, Bucket>(buckets, phash, location.canisterId);
                switch bucket {
                    case null { #Err("Bucket not found") };
                    case (?bucket) {
                        let _ = await bucket.stopShareFile(location.fileId);
                        #Ok(());
                    };
                };
            };
        }
    };





    ////////////////////////////////////// Funciones para gestion de directorio personal de archivos //////////////////////////
    
    // public shared ({caller}) func cd(name: Text): async ? {
        

    // }
    

























    public shared ({ caller }) func eliminarHorario(grupoId: Text, materia: Text, dia: Text, horaInicio: Text, horaFin: Text) : async Text {
        assert (esAdmin(caller) or esAdministrativo(caller));

        let grupo = Map.get<Text, Grupo>(grupos, thash, grupoId);
        switch grupo {
            case null { return "Grupo no encontrado"; };
            case (?grupo) {
                let horariosExistentes = switch (Map.get<Text, [Horario]>(horarios, thash, grupoId)) {
                    case null { []; };
                    case (?h) { h };
                };

                let horariosActualizados = Array.filter<Horario>(horariosExistentes, func (horario) : Bool {
                    return not (horario.materia == materia and horario.dia == dia and horario.horaInicio == horaInicio and horario.horaFin == horaFin);
                });

                if (Array.size(horariosExistentes) == Array.size(horariosActualizados)) {
                    return "No se encontró un horario que coincida con los criterios proporcionados";
                };

                ignore Map.put<Text, [Horario]>(horarios, thash, grupoId, horariosActualizados);
                return "Horario eliminado exitosamente";
            };
        };
    };

    public shared query ({ caller }) func verHorarios(grupoId: Text) : async ?[Horario] {
        assert (esAdmin(caller) or esAdministrativo(caller) or esDocente(caller) or esAlumno(caller));
        Map.get<Text, [Horario]>(horarios, thash, grupoId);
    };

    public shared ({ caller }) func actualizarNivelDeIngles(alumnoId: Text, nuevoNivel: Text) : async Text {
        assert (esAdmin(caller) or esAdministrativo(caller) or esDocente(caller));

        let alumnoOpt = Map.get<Text, Alumno>(alumnoMat, thash, alumnoId);
        switch alumnoOpt {
            case null { return "El alumno especificado no está registrado"; };
            case (?alumno) {
                let alumnoActualizado = { alumno with nivelDeIngles = nuevoNivel };
                ignore Map.put<Text, Alumno>(alumnoMat, thash, alumnoId, alumnoActualizado);
                ignore Map.put<Principal, Alumno>(alumnos, phash, alumnoActualizado.principalID, alumnoActualizado);

                return "Nivel de inglés actualizado exitosamente";
            };
        };
    };

    public shared ({ caller }) func modificarCertificacionDeIngles(alumnoId: Text, nuevoCertificado: Bool) : async Text {
        assert (esAdmin(caller) or esAdministrativo(caller));

        let alumno = Map.get<Text, Alumno>(alumnoMat, thash, alumnoId);
        switch alumno {
            case null { return "El alumno especificado no está registrado"; };
            case (?alumno) {
                let alumnoActualizado = { alumno with certificacionDeIngles = nuevoCertificado };
                ignore Map.put<Text, Alumno>(alumnoMat, thash, alumnoId, alumnoActualizado);
                ignore Map.put<Principal, Alumno>(alumnos, phash, alumnoActualizado.principalID, alumnoActualizado);

                return "Certificación de inglés actualizada exitosamente";
            };
        };
    };

    public shared ({ caller }) func crearGrupo(id: Text, nombre: Text, cuatrimestre: Nat) : async Text {
        assert (esAdmin(caller) or esAdministrativo(caller));

        let nuevoGrupo : Grupo = {
            id;
            nombre;
            cuatrimestre;
            alumnos = [];
        };

        ignore Map.put<Text, Grupo>(grupos, thash, id, nuevoGrupo);
        return "Grupo creado exitosamente";
    };

 public shared ({ caller }) func agregarAlumnoAGrupo(grupoId: Text, matricula: Text) : async Text {
    assert (esAdmin(caller) or esAdministrativo(caller));

    let grupo = Map.get<Text, Grupo>(grupos, thash, grupoId);
    switch grupo {
        case null { return "El grupo especificado no existe"; };
        case (?grupo) {
            let alumnoOpt = Map.get<Text, Alumno>(alumnoMat, thash, matricula);
            switch alumnoOpt {
                case null { return "El alumno especificado no existe"; };
                case (?alumno) {
                    if (alumno.semestre != grupo.cuatrimestre) {
                        return "El cuatrimestre del alumno no coincide con el del grupo";
                    };

                    // Generar los registros de materias para el alumno
                    let materiasGrupo = Map.get<Text, [Horario]>(horarios, thash, grupoId);
                    switch (materiasGrupo) {
                        case null { return "Por favor crea un horario para el grupo espesificado antes de agregar alumnos."; };
                        case (?materias) {
                            let registrosMaterias = Array.map<Horario, MateriaRegistro>(materias, func(horario) : MateriaRegistro {
                                { materia = horario.materia; calificaciones = { p1 = null; p2 = null; p3 = null; final = null } }
                            });

                            let nuevoRegistro : RegistroGrupo = {
                                alumno = matricula;
                                nombre = alumno.nombre;
                                cuatrimestre = grupo.cuatrimestre;
                                materias = registrosMaterias;
                            };

                            let grupoActualizado = { grupo with alumnos = Array.append(grupo.alumnos, [nuevoRegistro]) };
                            ignore Map.put<Text, Grupo>(grupos, thash, grupoId, grupoActualizado);

                            return "Alumno agregado al grupo exitosamente";
                        };
                    };
                };
            };
        };
    };
};

    public shared query ({ caller }) func listarAlumnosDeGrupo(grupoId: Text) : async ?[RegistroGrupo] {
        assert (esAdmin(caller) or esAdministrativo(caller) or esDocente(caller));

        let grupo = Map.get<Text, Grupo>(grupos, thash, grupoId);
        switch grupo {
            case null { return null; };
            case (?grupo) {
                return ?grupo.alumnos;
            };
        };
    };

    public shared query ({ caller }) func verGrupos() : async [Grupo] {
        assert (esAdmin(caller) or esAdministrativo(caller) or esDocente(caller));
        Iter.toArray(Map.vals<Text, Grupo>(grupos));
    };

    public shared query ({ caller }) func verGrupo(grupoId: Text) : async ?Grupo {
        assert(esAdmin(caller) or esAdministrativo(caller) or esDocente(caller));
        Map.get<Text, Grupo>(grupos, thash, grupoId);
    };

    public shared query ({ caller }) func getMyGrupo() : async ?Grupo {
        let alumnoOpt = Map.get(alumnos, phash, caller);

        switch alumnoOpt {
            case null {
                return null;
            };
            case (?alumno) {
                for ((_, grupo) in Map.entries(grupos)) {
                    let alumnoEncontrado = Array.find<RegistroGrupo>(grupo.alumnos, func (registro: RegistroGrupo) : Bool {
                        registro.alumno == alumno.matricula
                    });

                    if (alumnoEncontrado != null) {
                        return ?grupo;
                    };
                };
                return null;
            };
        };
    };

    public shared ({ caller }) func reinscribirAlumno(alumnoId: Text, nuevoGrupoId: ?Text) : async Text {
        assert (esAdmin(caller) or esAdministrativo(caller));

        let alumnoOpt = Map.get<Text, Alumno>(alumnoMat, thash, alumnoId);
        switch alumnoOpt {
            case null { return "El alumno especificado no está registrado"; };
            case (?alumno) {
                let alumnoActualizado = { alumno with semestre = alumno.semestre + 1 };

                // Actualizar el mapa de alumnos
                ignore Map.put<Text, Alumno>(alumnoMat, thash, alumnoId, alumnoActualizado);
                ignore Map.put<Principal, Alumno>(alumnos, phash, alumnoActualizado.principalID, alumnoActualizado);

                // Actualizar los grupos en los que está inscrito el alumno
                for ((grupoId, grupo) in Map.entries(grupos)) {
                    let alumnosActualizados = Array.map<RegistroGrupo, RegistroGrupo>(grupo.alumnos, func (registro: RegistroGrupo) : RegistroGrupo {
                        if (registro.alumno == alumnoId) {
                            { registro with cuatrimestre = alumnoActualizado.semestre };
                        } else {
                            registro;
                        };
                    });
                    ignore Map.put<Text, Grupo>(grupos, thash, grupoId, { grupo with alumnos = alumnosActualizados });
                };

                // Si se especifica un nuevo grupo, mover al alumno al nuevo grupo
                switch nuevoGrupoId {
                    case (?nuevoGrupo) {
                        let grupoOpt = Map.get<Text, Grupo>(grupos, thash, nuevoGrupo);
                        switch grupoOpt {
                            case null { return "El nuevo grupo especificado no existe"; };
                            case (?grupo) {
                                let nuevoRegistro: RegistroGrupo = {
                                    alumno = alumno.matricula;
                                    nombre = alumno.nombre;
                                    cuatrimestre = alumnoActualizado.semestre;
                                    materias = [];
                                };
                                let grupoActualizado = { grupo with alumnos = Array.append(grupo.alumnos, [nuevoRegistro]) };
                                ignore Map.put<Text, Grupo>(grupos, thash, nuevoGrupo, grupoActualizado);
                            };
                        };
                    };
                    case null {};
                };

                return "Alumno reinscrito exitosamente";
            };
        };
    };


    // public shared ({ caller }) func actualizarCalificacionPorMateria(alumnoId: Text, materia: Text, parcial: Text, calificacion: Nat) : async Text {
    //     assert (esAdmin(caller) or esDocente(caller));

    //     let alumnoOpt = Map.get<Text, Alumno>(alumnoMat, thash, alumnoId);
    //     switch alumnoOpt {
    //         case null { return "El alumno especificado no está registrado"; };
    //         case (?_) {
    //             let grupoOpt = Map.get<Text, Grupo>(grupos, thash, alumnoId);
    //             switch grupoOpt {
    //                 case null { return "El grupo especificado no existe"; };
    //                 case (?grupo) {
    //                     var alumnoEncontrado: Bool = false;
    //                     let alumnosActualizados = Array.map<RegistroGrupo, RegistroGrupo>(grupo.alumnos, func (registro: RegistroGrupo) : RegistroGrupo {
    //                         if (registro.alumno == alumnoId) {
    //                             let materiasActualizadas = Array.map<MateriaRegistro, MateriaRegistro>(registro.materias, func (materiaRegistro: MateriaRegistro) : MateriaRegistro {
    //                                 if (materiaRegistro.materia == materia) {
    //                                     alumnoEncontrado := true;
    //                                     let calificacionesActualizadas = switch (parcial) {
    //                                         case ("p1") { { materiaRegistro.calificaciones with p1 = ?calificacion }; };
    //                                         case ("p2") { { materiaRegistro.calificaciones with p2 = ?calificacion }; };
    //                                         case ("p3") { { materiaRegistro.calificaciones with p3 = ?calificacion }; };
    //                                         case ("final") { { materiaRegistro.calificaciones with final = ?calificacion }; };
    //                                         case _ { materiaRegistro.calificaciones };
    //                                     };
    //                                     { materiaRegistro with calificaciones = calificacionesActualizadas };
    //                                 } else {
    //                                     materiaRegistro;
    //                                 }
    //                             });
    //                             { registro with materias = materiasActualizadas };
    //                         } else {
    //                             registro;
    //                         }
    //                     });

    //                     if (not alumnoEncontrado) {
    //                         return "No se encontró la materia especificada para el alumno";
    //                     };

    //                     let grupoActualizado = { grupo with alumnos = alumnosActualizados };
    //                     ignore Map.put<Text, Grupo>(grupos, thash, alumnoId, grupoActualizado);
    //                     return "Calificación actualizada exitosamente para la materia especificada";
    //                 };
    //             };
    //         };
    //     };
    // };

public shared ({ caller }) func actualizarCalificacionPorMateria(grupoId: Text, alumnoId: Text, materia: Text, parcial: Text, calificacion: Nat) : async Text {
    assert (esAdmin(caller) or esDocente(caller));

    let grupoOpt = Map.get<Text, Grupo>(grupos, thash, grupoId);
    switch grupoOpt {
        case null { return "El grupo especificado no existe"; };
        case (?grupo) {
            var alumnoEncontrado: Bool = false;
            let alumnosActualizados = Array.map<RegistroGrupo, RegistroGrupo>(grupo.alumnos, func (registro: RegistroGrupo) : RegistroGrupo {
                if (registro.alumno == alumnoId) {
                    let materiasActualizadas = Array.map<MateriaRegistro, MateriaRegistro>(registro.materias, func (materiaRegistro: MateriaRegistro) : MateriaRegistro {
                        if (materiaRegistro.materia == materia) {
                            alumnoEncontrado := true;
                            let calificacionesActualizadas = switch (parcial) {
                                case ("p1") { { materiaRegistro.calificaciones with p1 = ?calificacion }; };
                                case ("p2") { { materiaRegistro.calificaciones with p2 = ?calificacion }; };
                                case ("p3") { { materiaRegistro.calificaciones with p3 = ?calificacion }; };
                                case ("final") { { materiaRegistro.calificaciones with final = ?calificacion }; };
                                case _ { materiaRegistro.calificaciones };
                            };
                            { materiaRegistro with calificaciones = calificacionesActualizadas };
                        } else {
                            materiaRegistro;
                        }
                    });
                    { registro with materias = materiasActualizadas };
                } else {
                    registro;
                }
            });

            if (not alumnoEncontrado) {
                return "No se encontró la materia especificada para el alumno";
            };

            let grupoActualizado = { grupo with alumnos = alumnosActualizados };
            ignore Map.put<Text, Grupo>(grupos, thash, grupoId, grupoActualizado);
            return "Calificación actualizada exitosamente para la materia especificada";
        };
    };
};








    // Declare IC actor
    let ic : Types.IC = actor "aaaaa-aa"; // Management Canister ID

    // HTTP Outcall functions

    public func fetchAlumnosData() : async Text {
        let url: Text = "https://ingsoftware.uaz.edu.mx/api/alumnos";

        let request_headers = [
            { name = "Host"; value = "ingsoftware.uaz.edu.mx:443" },
            { name = "User-Agent"; value = "Motoko HTTP Agent" },
        ];

        let http_request : Types.HttpRequestArgs = {
            url = url;
            max_response_bytes = null;
            headers = request_headers;
            body = null;
            method = #get;
            transform = null;
        };

        Cycles.add<system>(20_949_972_000);

        let http_response : Types.HttpResponsePayload = await ic.http_request(http_request);

        let response_body: Blob = Blob.fromArray(http_response.body);
        let decoded_text: Text = switch (Text.decodeUtf8(response_body)) {
            case (null) { "No value returned" };
            case (?text) { text };
        };

        return decoded_text;
    };

    public func sendAlumnoData(alumno: Types.Alumno) : async Text {
        let alumnoJson: Text = encodeAlumnoJson(alumno);

        let url: Text = "https://ingsoftware.uaz.edu.mx/api/alumnos";

        let bodyBytesBlob = Text.encodeUtf8(alumnoJson);
        let bodyBytes = Blob.toArray(bodyBytesBlob);

        let request_headers = [
            { name = "Host"; value = "ingsoftware.uaz.edu.mx:443" },
            { name = "Content-Type"; value = "application/json" }
        ];
        let http_request : Types.HttpRequestArgs = {
            url = url;
            max_response_bytes = null;
            headers = request_headers;
            body = ?bodyBytes;
            method = #post;
            transform = null;
        };

        Cycles.add<system>(1_000_000_000_000);

        let http_response : Types.HttpResponsePayload = await ic.http_request(http_request);

        let response_body: Blob = Blob.fromArray(http_response.body);
        let decoded_text: Text = switch (Text.decodeUtf8(response_body)) {
            case (null) { "No value returned" };
            case (?text) { text };
        };

        return decoded_text;
    };

    private func encodeAlumnoJson(alumno: Types.Alumno) : Text {
        "{ \"apellidoMaterno\": \"" # alumno.apellidoMaterno #
        "\", \"apellidoPaterno\": \"" # alumno.apellidoPaterno #
        "\", \"carrera\": \"" # alumno.carrera #
        "\", \"fechaNacimiento\": \"" # alumno.fechaNacimiento #
        "\", \"nombre\": \"" # alumno.nombre #
        "\", \"semestre\": " # Nat.toText(alumno.semestre) #
        "}"
    };


////////////////////////////// PAGOS CON CKBTC //////////////////////////////////

    // public shared ({ caller }) func transferTokens(to: Principal, amount: Nat) : async Text {
    //     //let fromAccount = { owner = caller; subaccount = null };
    //     let toAccount = { owner = to; subaccount = null };
    
    //     let transferArgs = {
    //         from_subaccount = null;
    //         to = toAccount;
    //         amount = amount;
    //         fee = null; // Se aplicará la tarifa predeterminada del ledger
    //         memo = null;
    //         created_at_time = null;
    //     };

    //     let result = await ckbtcLedger.icrc1_transfer(transferArgs);
    
    //     switch (result) {
    //         case (#Ok(txIndex)) {
    //             return "Transferencia exitosa. Índice de transacción: " # Nat.toText(txIndex);
    //         };
    //         case (#Err(error)) {
    //             return "Error en la transferencia: " # debug_show(error);
    //         };
    //     };
    // };

    // public shared ({ caller }) func getBalance() : async Nat {
    //     Debug.print("El caller es: " # Principal.toText(caller));
    //     let account = { owner = caller; subaccount = null };
    //     let balance = await ckbtcLedger.icrc1_balance_of(account);
    //     return balance;
    // };
};