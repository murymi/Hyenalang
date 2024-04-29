import { Lexer } from "./token";
import { Parser } from "./parser";
import { genStart } from "./codegen";
import { Statement } from "./stmt";
import { Expression } from "./expr";
import { createWriteStream, readFile, truncate } from "fs";
import { spawn } from "child_process";
import { Module, Type, alignTo, getPresentModule, i64, popModule, pushModule, searchModule, searchModuleById } from "./type";

export enum fnType {
    extern,
    native,
}

var anon_count = 0;
//var localSize = 0;
var scopeDepth = 0;
//var locals: { name:string, offset:number, scope: number }[] = [];
var globalstrings: { value: string }[] = [];
var globals: { name: string, value: Expression | undefined, datatype: Type, mod_id: number }[] = [];
var anon_strings: { value: Expression }[] = [];

export function addAnonString(val: Expression) {
    anon_strings.push({ value: val });
    return anon_strings.length - 1;
}


//class Variable

export class Function {
    name: string;
    arity: number;
    impilicit_arity: number;
    type: fnType;
    locals: { name: string, scope: number, datatype: Type, offset: number, mod_id: number }[];
    localOffset: number;
    params: { name: string, datatype: Type }[];
    body: Statement;
    returnType: any;
    mod_id: number;

    constructor(
        name: string,
        type: fnType,
        params: { name: string, datatype: Type, mod_id: number }[],
        locals: { name: string, scope: number, datatype: Type, offset: number, mod_id: number }[],
        retType: Type
    ) {
        this.mod_id = getPresentModule();
        this.localOffset = 0;
        this.name = name;
        this.type = type;
        this.params = params;

        this.locals = locals;
        //console.error(locals);
        var args: { name: string, scope: number, datatype: Type, offset: number, mod_id: number }[] = [];
        if (type === fnType.native) {
            // implicit ret ptr 
            if (retType.size > 8) {
                this.localOffset = alignTo(8, this.localOffset);
                args.push({
                    name: "",
                    scope: 0,
                    offset: this.localOffset,
                    datatype: new Type().newPointer(retType),
                    mod_id: -1
                });
                this.localOffset += 8;
            }

            params.forEach((p) => {
                this.localOffset = alignTo(p.datatype.align, this.localOffset);
                args.push({
                    name: p.name,
                    scope: 0,
                    offset: this.localOffset,
                    datatype: p.datatype.size > 8 ? new Type().newPointer(p.datatype) : p.datatype,
                    mod_id: getPresentModule()
                });
                this.localOffset += p.datatype.size;
            })
            args.concat(locals);
            this.locals = args;
        }


        this.arity = params.length;
        this.impilicit_arity = retType.size > 8 ? params.length + 1 : params.length;
        this.returnType = retType;
    }
}


export class Struct {
    name: string;
    size: number;
    members: { name: string, datatype: Type, default: Expression | undefined }[];
    is_union: boolean;
    mod_id: number;

    constructor(name: string, isunion: boolean, members: { name: string, datatype: Type, default: Expression | undefined }[]) {
        this.name = name;
        this.size = 0;
        this.members = members;
        this.is_union = isunion;
        this.mod_id = getPresentModule();
    }
}

// export class Enum {
//     name: string;
//     values: { name: string, value: number }[];
//     mod_id:string;
// 
//     constructor(name: string, values: { name: string, value: number }[]) {
//         this.name = name;
//         this.values = values;
//         this.mod_id = getPresentModule() as string
//     }
// }

var files: string[] = [];

export function setCurrentFile(file: string) {
    files.push(file);
}

export function setPreviousFile() {
    files.pop();
}

export function getCurrentFile(): string {
    return files[-1];
}

var structs: Struct[] = [];

var functions: Function[] = [];

var enums: Type[] = [];

export function pushEnum(en: Type) {
    enums.push(en);
}

export function getEnum(name: string) {
    for (let e of enums) {
        if (e.name === name) {
            return e;
        }
    }
    return null;
}

export function checkStruct(name: string) {
    for (let s of structs) {
        if (s.name === name) return s;
    }
    return null;
}

// size in 8 bytes (for now)
export function incLocalOffset(name: string, type: Type, mod_id: number): number {

    if (name === "") {
        name = "anon" + anon_count.toString(2);
        anon_count++;
    }

    if (currentFn === -1) {
        return -1;
    }

    for (let i = functions[currentFn].locals.length - 1; i >= 0; i--) {
        if (functions[currentFn].locals[i].name === name && functions[currentFn].locals[i].scope === scopeDepth) {
            throw new Error("Redefination of a variable " + name);
        }
    }

    functions[currentFn].localOffset = alignTo(type.align, functions[currentFn].localOffset);
    var old = functions[currentFn].localOffset;

    functions[currentFn].locals.push({
        name: name,
        scope: scopeDepth,
        offset: functions[currentFn].localOffset,
        datatype: type,
        mod_id: mod_id
    });
    functions[currentFn].localOffset += type.size;// ++;
    // return start point for var
    return old;
}

export function addGlobalString(value: string): number {
    globalstrings.push({ value: value });
    return globalstrings.length - 1;
}

export function addGlobal(name: string, value: Expression | undefined, datatype: Type): void {
    globals.push({ name: name, value: value, datatype: datatype, mod_id: getPresentModule() });
}


export function getOffsetOfMember(struct: Type, member: string) {
    for (let m of struct.members) {
        if (m.name === member) {
            return { offset: m.offset, datatype: m.type, name: "" };
        }
    }

    //console.error(struct);
    var mod = searchModule(struct.name);

    for (let i = functions.length - 1; i >= 0; i--) {
        if (functions[i].name === member && functions[i].mod_id === mod) {
            return { offset: -1, datatype: i64, name: struct.name + functions[i].name }
        }
    }

    console.error("struct or union has no member named " + member);
    process.exit(1);
}



export function getLocalOffset(name: string, mod_id: number): { offset: number, datatype: Type, glob: boolean, name: string } {
    var fn = functions[currentFn];

    for (let i = fn.locals.length - 1; i >= 0; i--) {
        if (fn.locals[i].name === name && fn.locals[i].mod_id === mod_id && fn.locals[i].scope <= scopeDepth) {
            var off = fn.locals[i].offset;
            var type = fn.locals[i].datatype;

            return { offset: off, datatype: type, glob: false, name: name }
        }
    }

    for (let i = 0; i < globals.length; i++) {
        if (globals[i].name === name && globals[i].mod_id === mod_id) {
            return { offset: -2, datatype: globals[i].datatype, glob: true, name: mod_id + globals[i].name }
        }
    }

    for (let e of enums) {
        if (e.name === name && e.mod_id === mod_id) {
            return { offset: -3, datatype: e, glob: false, name: name }
        }
    }

    for (let i = functions.length - 1; i >= 0; i--) {
        if (functions[i].name === name && functions[i].mod_id === mod_id) {
            return { offset: -1, datatype: i64, glob: true, name: mod_id + functions[i].name }
        }
    }

    throw new Error(`undefined variable ${name} in ${mod_id}`);
}

export function getFn(name: string): Function {
    for (let i = functions.length - 1; i >= 0; i--) {
        if (functions[i].mod_id + functions[i].name === name) {
            return functions[i];
        }
    }

    console.error(`undefined function ${name}`);
    process.exit(1);
}

export function pushFunction(name: string, params: { name: string, datatype: Type, mod_id: number }[], type: fnType, locals: [], retType: any): number {
    functions.push(new Function(name, type, params, locals, retType));
    return functions.length - 1;
}

export function pushStruct(struc: Struct) {
    structs.push(struc);
}

var currentFn: number = -1;

export function getStruct(name: string) {
    for (let s of structs) {
        if (s.name === name) {
            return s;
        }
    }
    return null;
}

export function setCurrentFuction(n: number) {
    currentFn = n;
}

export function getcurrFn() { return currentFn; }

export function resetCurrentFunction(body: Statement) {
    functions[currentFn].body = body;
    //console.error(functions[currentFn].locals);
    currentFn = -1;
}

export function beginScope() {
    scopeDepth++;
}

export function endScope() {
    scopeDepth--;
}

<<<<<<< HEAD
function compile(path: string) {
    readFile(path, { encoding: "utf-8" }, (err, data) => {
        if (err) {
            console.error("failed to open file");
            process.exit(1);
        }

        var lexer = new Lexer(data);

        var tokens = lexer.lex();
        var parser = new Parser(tokens);
        var stmts = parser.parse();
        var bitstream = createWriteStream("./tmp.s");
        var orig = console.log;
        console.log = (data) => { bitstream.write(`${data}\n`); }
        genStart(globalstrings, globals, anon_strings, functions);
        bitstream.end();
        console.log = orig;
        spawn("make", ["bin"]);
=======


export function compile(path: string, mod_name: string) {
    return new Promise((resolve, reject) => {
        readFile(path, { encoding: "utf-8" }, async (err, data) => {
            if (err) {
                reject(err)
            } else {
                setCurrentFile(path);
                pushModule(new Module(mod_name));
                if (err) {
                    console.error("failed to open file");
                    process.exit(1);
                }
                var lexer = new Lexer(data);
                var tokens = lexer.lex();
                var parser = new Parser(tokens);
                var stmts = await parser.parse();
                popModule();
                setPreviousFile();
                resolve(true);
            }
        })
>>>>>>> e952860c0ab910fc3616ee26af5e165b286fb5e3
    })
}

if (process.argv.length < 3) {
    console.error("Usage: make FILE=<file name>");
} else {
    if (process.argv[2] === "") {
        console.error("Usage: make FILE=<file name>");
        process.exit();
    }
    truncate("./tmp.s", async () => {
        compile(process.argv[2], "mod_main")
            .then(() => {
                var bitstream = createWriteStream("./tmp.s", { flags: "a" });
                var orig = console.log;
                console.log = (data) => { bitstream.write(`${data}\n`); }
                genStart(globalstrings, globals, anon_strings, functions);
                bitstream.end();
                console.log = orig;
                spawn("make", ["bin"]);
            })
            .catch((err) => { throw err; });
    })

}

