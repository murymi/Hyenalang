import { Lexer, Token } from "./token";
import { Parser } from "./parser";
import { genStart } from "./codegen";
import { Statement } from "./stmt";
import { Expression } from "./expr";
import { createWriteStream, readFile, truncate } from "fs";
import { spawn } from "child_process";
import { resolve } from "path"
import { Type, alignTo, getPresentModule, i64, myType, searchStruct, voidtype } from "./type";

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

var resolution_pass = true;

export function addAnonString(val: Expression) {
    if (resolution_pass) return;
    anon_strings.push({ value: val });
    return anon_strings.length - 1;
}

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
        this.arity = params.length;
        this.impilicit_arity = retType.size > 8 ? params.length + 1 : params.length;
        this.data_type = new Type().newFunction(retType, params, type);
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

export function addGenericFunction(fn: Function) {
    functions.push(fn);
}

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


function checkVariableInFn(name: string) {
    for (let i = functions[currentFn].locals.length - 1; i >= 0; i--) {
        if (functions[currentFn].locals[i].name === name && functions[currentFn].locals[i].scope === scopeDepth) {
            throw new Error("Redefination of a variable " + name);
        }
    }
}

function addVariableInFn(name: string, type: Type) {
    var old = functions[currentFn].locals.length;
    functions[currentFn].locals.push(new Variable().local(name, type));
    return functions[currentFn].locals[old];
}

function resolvable(type: Type): boolean {
    return type.kind === myType.enum || type.kind === myType.function || type.kind === myType.struct;
}
// size in 8 bytes (for now)
export function incLocalOffset(name: string, type: Type, initializer?: Expression): Variable {
    if (!resolution_pass && currentFn === -1 && !resolvable(type)) {
        return getLocalOffset(name).variable as Variable;
    }

    if (name === "") {
        if (resolution_pass && currentFn != -1) { } else {
            name = "anon" + anon_count.toString(2);
            anon_count++;
        }
    }

    if (currentFn === -1 && resolution_pass && !resolvable(type)) {
        globals.push(new Variable().global(name, type, initializer));
        return globals[globals.length - 1];
    }

    if (currentFn === -1 && !resolution_pass && resolvable(type)) {
        globals.push(new Variable().global(name, type, initializer));
        return globals[globals.length - 1];
    }

    var dummy = new Variable();
    dummy.datatype = type;
    if (resolution_pass) return dummy;
    checkVariableInFn(name);
    return addVariableInFn(name, type);
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

export function isResolutionPass() {
    return resolution_pass;
}

export function getLocalOffset(name: string): { offset: number, datatype: Type, variable: Variable | undefined } {

    var dummy = new Variable();
    dummy.datatype = voidtype;
    dummy.datatype.return_type = voidtype;
    if (resolution_pass) return { offset: -10, datatype: voidtype, variable: dummy }

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

    if (searchStruct(name)) {
        return { offset: -4, datatype: i64, variable: undefined };
    }

    for (let i = functions.length - 1; i >= 0; i--) {
        if (functions[i].name === name) {
            return { offset: -1, datatype: functions[i].data_type, variable: undefined }
        }
    }

    var locals = functions[currentFn].locals;
    for (let i = locals.length - 1; i >= 0; i--) {
        if (locals[i].name === name && locals[i].scope <= scopeDepth) {
            var type = locals[i].datatype;
            return { offset: i, datatype: type, variable: locals[i] }
        }
    }
    console.error(functions);
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

export function fnExists(name: string): number {
    var index = 0;
    for (let fun of functions) {
        if (fun.name === name) {
            return index;
        }
        index++;
    }
    return -1;
}

export function pushFunction(name: string, params: { name: string, datatype: Type }[], type: fnType, retType: any): number {
    var f = fnExists(name);
    if (f >= 0) {
        return f;
    }
    functions.push(new Function(name, type, params, [], retType));
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
export function restoreFn(num: number) {
    currentFn = num;
}

export function resetCurrentFunction(name: string, body: Statement, tokens?: Token[]) {
    if (!resolution_pass) {
        functions[currentFn].body = body;
    }
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
        p.is_global = false;
    })
}

var parsers:Parser[] = [];

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
                parsers.push(parser);
                await parser.parse();
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
        resolution_pass = true;
        await compile(process.argv[2]);
        resolution_pass = false;
        for(let p of parsers) {
            p.reset();
            await p.parse();
        }

        var bitstream = createWriteStream("./tmp.s", { flags: "a" });
        var orig = console.log;
        console.log = (data) => { bitstream.write(`${data}\n`); }
        functions.forEach((fn) => {
            offsetLocalVariables(fn);
        })
        genStart(globalstrings, globals, anon_strings, functions);
        bitstream.end();
        console.log = orig;
        spawn("make", ["bin"]);
    })

}