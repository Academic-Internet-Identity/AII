module {
    public type Uid = Text; // Usuario id
    public type Aid = Text; // Alumno id

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
        principal: Principal;
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
    };

    public type Horario = {
        dia: Text;
        horaInicio: Text;
        horaFin: Text;
        materia: Materia;
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
};