import { Lexer } from "./token";
import { Parser } from "./parser";
import { genStart } from "./codegen";
import { Statement } from "./stmt";
import { Expression } from "./expr";
import { createWriteStream, readFile, truncate } from "fs";
import { spawn } from "child_process";
import { resolve } from "path"
import { Type, alignTo, getPresentModule, i64, searchModule, searchStruct } from "./type";

export enum fnType {
    extern,
    native,
}

var anon_count = 0;
//var localSize = 0;
var scopeDepth = 0;
//var locals: { name:string, offset:number, scope: number }[] = [];
var globalstrings: { value: string }[] = [];
var globals: Variable[] = [];
var anon_strings: { value: Expression }[] = [];

export function addAnonString(val: Expression) {
    anon_strings.push({ value: val });
    return anon_strings.length - 1;
}

//             // implicit ret ptr 
//             if (retType.size > 8) {
//                 this.localOffset = alignTo(8, this.localOffset);
//                 args.push({
//                     name: "",
//                     scope: 0,
//                     offset: this.localOffset,
//                     datatype: new Type().newPointer(retType),
//                     module_name:""
//                 });
//                 this.localOffset += 8;
//                 //arg_types.push({name:"", type:new Type().newPointer(retType)});
//             }
// 
//             params.forEach((p) => {
//                 this.localOffset = alignTo(p.datatype.align, this.localOffset);
//                 var arg_data_type = p.datatype.size > 8 ? new Type().newPointer(p.datatype):p.datatype
//                 args.push({
//                     name: p.name,
//                     scope: 0,
//                     offset: this.localOffset,
//                     datatype: arg_data_type,
//                     module_name:getPresentModule()
//                 });
//                 this.localOffset += p.datatype.size;
//                 arg_types.push({name:p.name, type:arg_data_type});
//             })
//             args.concat(locals);
//             this.locals = args;


//class Variable

export class Function {
    name: string;
    arity: number;
    impilicit_arity: number;
    type: fnType;
    locals: Variable[];
    localOffset: number;
    body: Statement;
    module_name: string;
    data_type: Type;

    constructor(
        name: string,
        type: fnType,
        params: { name: string, datatype: Type }[],
        locals: Variable[],
        retType: Type
    ) {
        this.name = name;
        this.type = type;
        this.locals = locals;
        var arg_types: { name: string, type: Type }[] = [];
        //console.error(locals);
        //var args: Variable[] = [];
        if (type === fnType.native) {
            var i = 0;
            params.forEach((p) => {
                var arg_data_type = p.datatype.size > 8 ? new Type().newPointer(p.datatype) : p.datatype
                this.locals.splice(i, 0, new Variable().local(p.name, arg_data_type));
                i++;
            })
        }

        if (retType.size > 8) {
            this.locals.splice(0, 0, new Variable().local("", new Type().newPointer(retType)))
        }

        //console.error(this.locals);


        this.arity = params.length;
        this.impilicit_arity = retType.size > 8 ? params.length + 1 : params.length;
        this.data_type = new Type().newFunction(retType, arg_types);
    }
}


export class Struct {
    name: string;
    size: number;
    members: { name: string, datatype: Type, default: Expression | undefined }[];
    is_union: boolean;
    module_name: string;

    constructor(name: string, isunion: boolean, members: { name: string, datatype: Type, default: Expression | undefined }[]) {
        this.name = name;
        this.size = 0;
        this.members = members;
        this.is_union = isunion;
        this.module_name = getPresentModule() as string;
    }
}

class FnZombie {
    name: string;
    arity: number;
    impilicit_arity: number;
    type: fnType;
    locals: { name: string, scope: number, datatype: Type | string, offset: number, module_name: string }[];
    localOffset: number;
    params: { name: string, datatype: Type | string }[];
    body: Statement;
    returnType: any | string;
    data_type: Type | string;


    constructor(
        name: string,
        type: fnType,
        params: { name: string, datatype: Type | string, module_name: string }[],
        locals: { name: string, scope: number, datatype: Type | string, offset: number, module_name: string }[],
        retType: Type | string
    ) {
        this.name = name;
        this.type = type;
        this.params = params;
        this.locals = locals;
        this.returnType = retType;
    }

}

// export class Enum {
//     name: string;
//     values: { name: string, value: number }[];
//     module_name:string;
// 
//     constructor(name: string, values: { name: string, value: number }[]) {
//         this.name = name;
//         this.values = values;
//         this.module_name = getPresentModule() as string
//     }
// }

export class Variable {
    name: string;
    scope: number;
    offset: number;
    datatype: Type;
    is_global: boolean;
    initializer?: Expression;

    global(name: string, datatype: Type, initializer?: Expression) {
        this.name = name;
        this.initializer = initializer;
        this.datatype = datatype
        return this;
    }

    local(name: string, datatype: Type) {
        this.name = name;
        this.datatype = datatype;
        return this;
    }

    constructor() {
        if (currentFn === -1) this.is_global = true;
        this.scope = scopeDepth;
    }
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
export function incLocalOffset(name: string, type: Type, initializer?: Expression): Variable {

    if (name === "") {
        name = "anon" + anon_count.toString(2);
        anon_count++;
    }

    if (currentFn === -1) {
        //return -1;
        globals.push(new Variable().global(name, type, initializer));
        return globals[globals.length - 1];
    }

    for (let i = functions[currentFn].locals.length - 1; i >= 0; i--) {
        if (functions[currentFn].locals[i].name === name && functions[currentFn].locals[i].scope === scopeDepth) {
            throw new Error("Redefination of a variable " + name);
        }
    }

    var old = functions[currentFn].locals.length;
    functions[currentFn].locals.push(new Variable().local(name, type));
    console.error(functions[currentFn].locals);
    return functions[currentFn].locals[old];
}

export function addGlobalString(value: string): number {
    globalstrings.push({ value: value });
    return globalstrings.length - 1;
}

// export function addGlobal(name: string, value: Expression | undefined, datatype: Type): void {
//     globals.push(new );
// }


export function getOffsetOfMember(struct: Type, member: string) {
    for (let m of struct.members) {
        if (m.name === member) {
            return { offset: m.offset, datatype: m.type, name: "" };
        }
    }

    if (struct.member_fn_names.find((n) => n === member)) {
        return { offset: -1, datatype: i64, name: struct.name + member }
    }

    console.error("struct or union has no member named " + member);
    process.exit(1);
}



export function getLocalOffset(name: string): { offset: number, datatype: Type, variable: Variable | undefined } {
    var fn = functions[currentFn];

    // todo remove offset

    for (let i = fn.locals.length - 1; i >= 0; i--) {
        if (fn.locals[i].name === name && fn.locals[i].scope <= scopeDepth) {
            //var off = fn.locals[i].offset;
            var type = fn.locals[i].datatype;

            return { offset: i, datatype: type, variable: fn.locals[i] }
        }
    }

    for (let i = 0; i < globals.length; i++) {
        if (globals[i].name === name) {
            return { offset: -2, datatype: globals[i].datatype, variable: globals[i] }
        }
    }

    for (let e of enums) {
        if (e.name === name) {
            return { offset: -3, datatype: e, variable: undefined }
        }
    }

    for (let i = functions.length - 1; i >= 0; i--) {
        if (functions[i].name === name) {
            return { offset: -1, datatype: functions[i].data_type, variable: undefined }
        }
    }

    if (searchStruct(name)) {
        return { offset: -4, datatype: i64, variable: undefined };
    }

    //console.error(fn.locals);
    throw new Error(`undefined variable ${name}`);
}

export function getFn(name: string): Function {
    for (let i = functions.length - 1; i >= 0; i--) {
        if (functions[i].name === name) {
            return functions[i];
        }
    }

    console.error(`undefined function ${name}`);
    //console.error(functions);
    process.exit(1);
}

export function pushFunction(name: string, params: { name: string, datatype: Type, module_name: string }[], type: fnType, locals: [], retType: any): number {
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

var compiled_files: string[] = [];

function offsetLocalVariables(fn: Function) {
    fn.localOffset = 0;
    fn.locals.forEach((p) => {
        fn.localOffset = alignTo(p.datatype.align, fn.localOffset);
        fn.localOffset += p.datatype.size;
        p.offset = fn.localOffset;
    })
}

export function compile(path: string) {
    return new Promise((resolv, reject) => {
        var abs_path = resolve(path);
        if (compiled_files.find((p) => p === abs_path)) {
            resolv(true);
            return;
        }

        readFile(path, { encoding: "utf-8" }, async (err, data) => {
            if (err) {
                throw err
            } else {


                compiled_files.push(abs_path);

                if (err) {
                    console.error("failed to open file");
                    process.exit(1);
                }
                var lexer = new Lexer(data, abs_path);
                var tokens = lexer.lex();
                var parser = new Parser(tokens);
                var stmts = await parser.parse();
                resolv(true);
            }
        })
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
        compile(process.argv[2])
            .then(() => {
                var bitstream = createWriteStream("./tmp.s", { flags: "a" });
                var orig = console.log;
                console.log = (data) => { bitstream.write(`${data}\n`); }
                functions.forEach((fn)=>{
                    offsetLocalVariables(fn);
                })
                genStart(globalstrings, globals, anon_strings, functions);
                bitstream.end();
                console.log = orig;
                spawn("make", ["bin"]);
            })
            .catch((err) => { throw err; });
    })

}