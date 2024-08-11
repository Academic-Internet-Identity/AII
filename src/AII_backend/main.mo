import Principal "mo:base/Principal";
import Nat "mo:base/Nat";
import Iter "mo:base/Iter";
import Map "mo:map/Map";
import { thash; phash } "mo:map/Map";
import Text "mo:base/Text";
import Set "mo:map/Set";
import Debug "mo:base/Debug"; // Import Debug for logging
import Types "./types";
import Cycles "mo:base/ExperimentalCycles";
import Blob "mo:base/Blob";
import Array "mo:base/Array"; // Import Array module

shared ({ caller }) actor class _Plataforma() {

    stable let deployer = caller;

    public type Usuario = Types.Usuario;
    public type Alumno = Types.Alumno;
    public type Administrativo = Types.Administrativo;
    public type Docente = Types.Docente;
    public type Uid = Types.Uid; // Usuario id
    public type Aid = Types.Aid; // Alumno id
    public type Materia = Types.Materia;
    public type Horario = Types.Horario;
    public type Grupo = Types.Grupo;
    public type RegistroGrupo = Types.RegistroGrupo;
    public type Calificaciones = Types.Calificaciones;
    public type RegistroAlumnoForm = Types.RegistroAlumnoForm;
    public type RegistroAdministrativoForm = Types.RegistroAdministrativoForm;
    public type RegistroDocenteForm = Types.RegistroDocenteForm;

    stable var actualUid : Nat = 0;
    stable var actualAid : Nat = 0;

    stable var grupos = Map.new<Text, Grupo>(); // Mapa de grupos por ID

    func generarUid() : Text {
        actualUid += 1;
        "U" # Nat.toText(actualUid);
    };

    func generarAid() : Text {
        actualAid += 1;
        "A" # Nat.toText(actualAid);
    };

    stable let usuarios = Map.new<Principal, Usuario>();
    stable let alumnos = Map.new<Principal, Alumno>();
    stable let admins = Set.new<Principal>();

    stable let administrativos = Map.new<Principal, Administrativo>();
    stable let docentes = Map.new<Principal, Docente>();
    ignore Set.put<Principal>(admins, phash, deployer);
    ignore Set.put<Principal>(admins, phash, deployer);

    stable let alumnosIngresantes = Map.new<Principal, RegistroAlumnoForm>();
    stable let administrativosIngresantes = Map.new<Principal, RegistroAdministrativoForm>();
    stable let docentesIngresantes = Map.new<Principal, RegistroDocenteForm>();

    stable let materias = Map.new<Text, Materia>();
    stable let horarios = Map.new<Text, [Horario]>();

    public shared ({ caller }) func getMyUser() : async ?Usuario {
        Map.get(usuarios, phash, caller);
    };

    func _esUsuario(p : Principal) : Bool {
        return switch (Map.get<Principal, Usuario>(usuarios, Map.phash, p)) {
            case null { false };
            case _ { true };
        };
    };

    func _esAlumno(p : Principal) : Bool {
        return switch (Map.get<Principal, Alumno>(alumnos, Map.phash, p)) {
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

    func _esAdministrativo(p : Principal) : Bool {
        return switch (Map.get<Principal, Administrativo>(administrativos, Map.phash, p)) {
            case null { false };
            case _ { true };
        };
    };

    func _esDocente(p : Principal) : Bool {
        return switch (Map.get<Principal, Docente>(docentes, Map.phash, p)) {
            case null { false };
            case _ { true };
        };
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
        assert esAdmin(caller); // Solo un administrador puede aprobar
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
                            nivelDeIngles = solicitud.nivelDeIngles; // Asignar nivel de inglés
                            certificacionDeIngles = solicitud.certificacionDeIngles; // Asignar certificación de inglés
                        };
                        ignore Map.put<Principal, Alumno>(alumnos, Map.phash, solicitante, nuevoAlumno);
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
        assert esAdmin(caller);
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
        assert esAdmin(caller);
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
        assert esAdmin(caller);
        Iter.toArray(Map.entries<Principal, RegistroAlumnoForm>(alumnosIngresantes));
    };

    public shared query ({ caller }) func verAdministrativosIngresantes() : async [(Principal, RegistroAdministrativoForm)] {
        assert esAdmin(caller);
        Iter.toArray(Map.entries<Principal, RegistroAdministrativoForm>(administrativosIngresantes));
    };

    public shared query ({ caller }) func verDocentesIngresantes() : async [(Principal, RegistroDocenteForm)] {
        assert esAdmin(caller);
        Iter.toArray(Map.entries<Principal, RegistroDocenteForm>(docentesIngresantes));
    };

    public shared query ({ caller }) func verAdministrativos() : async [Administrativo] {
        assert esAdmin(caller);
        Iter.toArray(Map.vals<Principal, Administrativo>(administrativos));
    };

    public shared query ({ caller }) func verDocentes() : async [Docente] {
        assert esAdmin(caller);
        Iter.toArray(Map.vals<Principal, Docente>(docentes));
    };

    func _enArray<T>(a : [T], e : T, equal : (T, T) -> Bool) : Bool {
        for (i in a.vals()) { if (equal(i, e)) { return true } };
        return false;
    };

    public query func statusPlatform(): async [{key: Text; value: Text}] {
        [
            {key = "Users"; value = Nat.toText(Map.size(usuarios))},
            {key = "Alumnos"; value = Nat.toText(Map.size(alumnos))}
        ]
    };

    public shared query ({ caller }) func verAlumnos() : async [Alumno] {
        assert esAdmin(caller);
        Iter.toArray(Map.vals<Principal, Alumno>(alumnos));
    };

    ///VER PERFIL DEL USUARIO///
    public shared ({ caller }) func getMyAlumno() : async ?Alumno {
        Map.get(alumnos, phash, caller);
    };
    public shared ({ caller }) func getMyDocente() : async ?Docente {
        Map.get(docentes, phash, caller);
    };
    public shared ({ caller }) func getMyAdministrativo() : async ?Administrativo {
        Map.get(administrativos, phash, caller);
    };
    ///FIN DE VER PERFIL DEL USUARIO/// 

    public shared ({ caller }) func agregarMateria(nombre: Text, codigo: Text, creditos: Nat) : async Text {
        //assert esAdmin(caller);
        let nuevaMateria : Materia = { nombre; codigo; creditos };
        ignore Map.put<Text, Materia>(materias, thash, codigo, nuevaMateria);
        return "Materia agregada exitosamente";
    };

    public shared query ({ caller }) func verMaterias() : async [Materia] {
        //assert esAdmin(caller);
        Iter.toArray(Map.vals<Text, Materia>(materias));
    };

    public shared ({ caller }) func agregarHorario(codigoMateria: Text, dia: Text, horaInicio: Text, horaFin: Text) : async Text {
        assert esAdmin(caller);
        let materia = Map.get<Text, Materia>(materias, thash, codigoMateria);
        switch materia {
            case null { return "Materia no encontrada"; };
            case (?materia) {
                let nuevoHorario : Horario = { dia; horaInicio; horaFin; materia };
                let horariosExistentes = switch (Map.get<Text, [Horario]>(horarios, thash, codigoMateria)) {
                    case null { []; };
                    case (?h) { h };
                };
                ignore Map.put<Text, [Horario]>(horarios, thash, codigoMateria, Array.append(horariosExistentes, [nuevoHorario]));
                return "Horario agregado exitosamente";
            };
        };
    };

    public shared query ({ caller }) func verHorarios(codigoMateria: Text) : async ?[Horario] {
        assert esAdmin(caller);
        Map.get<Text, [Horario]>(horarios, thash, codigoMateria);
    };

    public shared ({ caller }) func actualizarNivelDeIngles(alumnoId: Principal, nuevoNivel: Text, certificacion: Bool) : async Text {
        // Verificar que el que llama la función es un administrador
        assert esAdmin(caller);

        // Buscar al alumno en el mapa usando el principal especificado
        let alumno = Map.get<Principal, Alumno>(alumnos, Map.phash, alumnoId);
        switch alumno {
            case null { return "El alumno especificado no está registrado"; };
            case (?alumno) {
                // Crear un nuevo registro de alumno con el nivel de inglés actualizado
                let alumnoActualizado = { alumno with nivelDeIngles = nuevoNivel; certificacionDeIngles = certificacion };
                // Guardar el registro actualizado en el mapa
                ignore Map.put<Principal, Alumno>(alumnos, Map.phash, alumnoId, alumnoActualizado);
                return "Nivel de inglés y certificación actualizados exitosamente";
            };
        };
    };

    // Función para crear un nuevo grupo
    public shared ({ caller }) func crearGrupo(id: Text, nombre: Text, materia: Text, cuatrimestre: Text) : async Text {
        assert esAdmin(caller); // Solo un administrador puede crear grupos

        let nuevoGrupo : Grupo = {
            id;
            nombre;
            materia;
            cuatrimestre;
            alumnos = []; // Inicialmente, el grupo no tiene alumnos
        };

        ignore Map.put<Text, Grupo>(grupos, thash, id, nuevoGrupo);
        return "Grupo creado exitosamente";
    };

    // Función para agregar un alumno a un grupo
    public shared ({ caller }) func agregarAlumnoAGrupo(grupoId: Text, alumnoId: Principal, nombre: Text, materia: Text, cuatrimestre: Text) : async Text {
        assert esAdmin(caller); // Solo un administrador puede agregar alumnos a grupos

        let grupo = Map.get<Text, Grupo>(grupos, thash, grupoId);
        switch grupo {
            case null { return "El grupo especificado no existe"; };
            case (?grupo) {
                let nuevoRegistro : RegistroGrupo = {
                    alumno = alumnoId;
                    nombre;
                    calificaciones = { p1 = null; p2 = null; p3 = null; final = null }; // Inicialmente sin calificaciones
                    cuatrimestre;
                    materia;
                };

                // Actualizar el grupo con el nuevo alumno
                let grupoActualizado = { grupo with alumnos = Array.append(grupo.alumnos, [nuevoRegistro]) };
                ignore Map.put<Text, Grupo>(grupos, thash, grupoId, grupoActualizado);

                return "Alumno agregado al grupo exitosamente";
            };
        };
    };

    // Función para listar los alumnos de un grupo
    public shared query ({ caller }) func listarAlumnosDeGrupo(grupoId: Text) : async ?[RegistroGrupo] {
        assert esAdmin(caller); // Solo un administrador puede listar alumnos

        let grupo = Map.get<Text, Grupo>(grupos, thash, grupoId);
        switch grupo {
            case null { return null; };
            case (?grupo) {
                return ?grupo.alumnos;
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
        }
};
