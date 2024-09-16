import Prim "mo:⛔";
import Principal "mo:base/Principal";
import Map "mo:map/Map";
import Set "mo:map/Set";
import {nhash; phash} "mo:map/Map";
import Types "types";
import Iter "mo:base/Iter";

import {print} "mo:base/Debug";

shared ({caller}) actor class Bucket(maxSize: Nat) = {

    type UploadResponse = Types.UploadResponse;
    type ReadResponse = Types.ReadResponse;
    type TempFile = Types.TempFile;
    type File = Types.File;
    type Chunk = Types.Chunk;
    type Result<T, U> = { #Ok : T; #Err : U };
    type FileID = Nat;

    stable let deployer = caller;
    stable var memorySize = 0;
    stable var fileqty = 0;

    stable var fileId = 0;
    var tempFileId = 0;

    stable let files =  Map.new<Nat, File>();
    let tempFiles = Map.new<Nat, TempFile>();

    /////////////////////// Private functions //////////////
    func authorizedCaller(p: Principal): Bool {
        p == deployer;
    };

    func getId(v: {#File; #Temp}): Nat {
        switch v {
            case (#File) {
                fileId += 1;
                fileId - 1;
            };
            case (#Temp) {
                tempFileId += 1;
                tempFileId -1;
            }
        }
    };

    func frezze<T>(arr: [var T]): [T]{  
        Prim.Array_tabulate<T>(arr.size(), func x = arr[x])
    };

    ///////////////////////// status query functions //////////////////////

    public query func getBalance(): async Nat { Prim.cyclesBalance()};
    public query func geSsize(): async Nat {memorySize};
    public query func getFilesQty(): async Nat {fileqty};
    public query func getMemoryAllowed(): async Nat {maxSize - memorySize};


    //////////////////// Private Functions //////////////////////////////////////
    func isAuthorizedReader(p: Principal, whiteList: [Principal]): Bool {
        for( i in whiteList.vals()){
            if( i == p){ return true}
        };
        return false;
    };
    ////// combina dos Array de T eliminando los repetidos ///////////////////////
    func mergeArray<T>(a: [T], b: [T], hashUtils: (T -> Nat32, (T ,T) -> Bool)): [T]{
        let setT = Set.new<T>();
        for (t in a.vals()){Set.add<T>(setT, hashUtils, t)};
        for (t in b.vals()){Set.add<T>(setT, hashUtils, t)};
        Set.toArray(setT);
    };

    ///////////////////////////////// Upload File ///////////////////////////////////////////

    public shared ({caller}) func uploadRequest(owner: Principal, fileName : Text, fileSize : Nat) : async UploadResponse {
        assert(authorizedCaller(caller));
        let chunkSize = 1_000_000;   // Tamaño en Bytes de los "Chuncks" 1_048_576 //1MB
        let chunksQty = fileSize / chunkSize + (if (fileSize % chunkSize > 0) {1} else {0});
        let content_chunks = Prim.Array_init<Blob>(chunksQty, "");
        let id = getId(#Temp);
        let newAsset = {
            owner;
            fileName;
            modified: Int = Prim.nat64ToNat(Prim.time());
            content_chunks;
            chunks_qty = chunksQty;
            total_length = fileSize;
            certified = false;
        };
        ignore Map.put<FileID, TempFile>(tempFiles, nhash, id, newAsset); // Garbage collector for cases where the load is not completed successfully
        memorySize += fileSize;
        {id; chunksQty; chunkSize};
    };

    public shared ({caller}) func addChunck(tfId :Nat, chunk : Blob, index : Nat) : async Result<(), Text> {
        
        // Debug.print("Guardando " # Nat.toText(chunk.size()) # " Bytes from Chunk Nro " # Nat.toText(index));
        let file = Map.get<Nat, TempFile>(tempFiles, nhash, tfId);
        switch file {
            case null {#Err("Archivo de carga no encontrado")};
            case (?file) {
                assert(caller == file.owner); // Only owner
                file.content_chunks[index] := chunk;
                #Ok
            };
        };
    };

    public shared ({caller}) func commitLoad(tfId : Nat) : async Result<Nat, Text> {
        let file = Map.remove<Nat, TempFile>(tempFiles, nhash, tfId);
        switch file {
            case null { 
                return #Err("Bucket Err: No se encuentra el Id")
            };
            case (?file){
                assert(caller == file.owner); // Only owner
                /////  Verificacion de consistencia de datos recibidos Comentar para pruebas desde CLI
                // var size = 0;
                // for (ch in file.content_chunks.vals()){
                //             size += ch.size();
                // };
                // if(size != file.total_length){
                //     Map.delete(tempFiles, nhash, tfId);
                //     return #Err("Tamaño incorrecto");
                // };
                ////////////////////////////////////////////////////////////////////////////////////////
                let content_chunks = frezze<Chunk>(file.content_chunks);
                let id = getId(#File);
                ignore Map.put<Nat, File>(files, nhash, id, {file with content_chunks; authorizedReaders = []});
                // Comunicar al canister principal
                let actorMain = actor(Principal.toText(deployer)): actor {
                    commitStorage: shared (Nat, Principal) -> async {#Ok: Nat; #Err: Text}
                };
                print("Enviando confirmacion de upload a Canister Main");
                let remoteId = await actorMain.commitStorage(id, caller);
                remoteId
            }
        };
    };

    ////////////////////////// Download Read ///////////////////////////////
    /////// El canister principal inicia solicitud de lectura para el usuario p ///////////

    public query ({caller}) func readRequestFoUser(_fileId : Nat, p: Principal) : async Result<ReadResponse, Text> {
        assert(authorizedCaller(caller));
        let file = Map.get(files, nhash, _fileId);
        switch file {
            case null { #Err("File Not Found") };
            case (?file) {
                if ( not isAuthorizedReader(p, file.authorizedReaders) and p != file.owner){
                    return #Err("No read access")
                };
                #Ok({id = _fileId; file= {file with content_chunks = [] }});
            };
        };
    };

    public query ({caller}) func getChunck(_fileId : Nat, chunckIndex : Nat) : async Result<Blob, Text> {
        // assert(authorizedCaller(caller));
        let file = Map.get(files, nhash, _fileId);
        switch file {
            case null { #Err("File Not Found") };
            case (?file) {
                if ( not isAuthorizedReader(caller, file.authorizedReaders) and caller != file.owner){
                    return #Err("No read access")
                };
                #Ok(file.content_chunks[chunckIndex]);
            };
        };
    };
    ///////////////////////////// Delete File ///////////////////////////
    public shared ({ caller }) func deleteFile(id: Nat, owner: Principal): async Bool {
        assert(authorizedCaller(caller));
        let file = Map.remove<Nat, File>(files, nhash, id);
        switch file {
            case null { return false};
            case (?file){
                assert (file.owner == owner);
                memorySize -= file.total_length;
                true
            };
        };
    };

    /////////////////////////////  Share File  /////////////////////////////////
    public shared ({ caller }) func shareFileWithGroup2(fileId: Nat, users: [Principal]):async  [Principal]{
        let file = Map.get<Nat, File>(files, nhash, fileId);
        switch file {
            case null { return []};
            case (?file){
                assert(caller == file.owner);
                let authorizedReaders = mergeArray<Principal>(users, file.authorizedReaders, phash);
                let updateFile = {file with authorizedReaders};
                ignore Map.put<Nat, File>(files, nhash, fileId, updateFile);
                authorizedReaders;
            }
        }
    };
    public shared ({ caller }) func shareFileWithPrincipal( fileId: Nat, p: Principal): async [Principal]{
        let file = Map.get<Nat, File>(files, nhash, fileId);
        switch file {
            case null { return []};
            case (?file){
                assert(caller == file.owner);
                let authorizedReaders = mergeArray<Principal>([p], file.authorizedReaders, phash);
                let updateFile = {file with authorizedReaders};
                ignore Map.put<Nat, File>(files, nhash, fileId, updateFile);
                authorizedReaders;
            }
        }
    };
    ///////////////////////////////// stop sharing with ////////////////////////////
    public shared ({ caller }) func stopShareFileWithPrincipal( fileId: Nat, p: Principal): async {#Ok; #Err}{
        let file = Map.get<Nat, File>(files, nhash, fileId);
        switch file {
            case null { #Err };
            case (?file){
                assert(caller == file.owner);
                let readersSet = Set.fromIter(Iter.fromArray<Principal>(file.authorizedReaders), phash);
                ignore Set.remove<Principal>(readersSet, phash, p);
                let authorizedReaders = Set.toArray(readersSet);
                let updateFile = {file with authorizedReaders};
                ignore Map.put<Nat, File>(files, nhash, fileId, updateFile);
                #Ok;
            }
        }
    };

    public shared ({ caller }) func stopShareFile( fileId: Nat): async {#Ok; #Err} {
        let file = Map.get<Nat, File>(files, nhash, fileId);
        switch file {
            case null { #Err };
            case (?file){
                assert(caller == file.owner);
                let updateFile = {file with authorizedReaders = []};
                ignore Map.put<Nat, File>(files, nhash, fileId, updateFile);
                #Ok;
            }
        }
    };

    public shared ({caller}) func withdraw(callback: shared () -> async (), amount: Nat): async { refunded : Nat }{
        assert(authorizedCaller(caller));
        assert(amount < Prim.cyclesBalance());
        Prim.cyclesAdd<system>(amount); // Ciclos a enviar al canister principal mediante la siguiente llamada
        await callback();
        { refunded = Prim.cyclesRefunded() };
    };

}