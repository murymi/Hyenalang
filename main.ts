import { Lexer, Token, colors } from "./token";
import { Parser } from "./parser";
import { genStart } from "./codegen";
import { Statement } from "./stmt";
import { Expression } from "./expr";
import { createWriteStream, readFile, truncate } from "fs";
import { spawn } from "child_process";
import { relative, resolve } from "path"
import { Type, alignTo, beginTagScope, getEnum, getPresentModule, i32, i64, myType, searchStruct, voidtype } from "./type";
import { cwd } from "process";

export enum fnType {
    extern,
    native,
}

var anon_count = 0;
//var localSize = 0;
var scopeDepth = 0;
//var locals: { name:string, offset:number, scope: number }[] = [];


class VariableScope {
    variables: Variable[] = [];
    constructor() {
        this.variables = [];
    }
}

var variable_scopes: VariableScope[] = [];

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


// export class Struct {
//     name: string;
//     size: number;
//     members: { name: string, datatype: Type, default: Expression | undefined }[];
//     is_union: boolean;
//     module_name: string;
// 
//     constructor(name: string, isunion: boolean, members: { name: string, datatype: Type, default: Expression | undefined }[]) {
//         this.name = name;
//         this.size = 0;
//         this.members = members;
//         this.is_union = isunion;
//         this.module_name = getPresentModule() as string;
//     }
// }

export class Variable {
    name: string;
    scope: number;
    offset: number;
    datatype: Type;
    is_global: boolean;
    initializer?: Expression;
    token:Token|undefined

    global(name: string, datatype: Type,  initializer: Expression|undefined = undefined) {
        this.name = name;
        this.initializer = initializer;
        this.datatype = datatype
        return this;
    }

    local(name: string, datatype: Type) {
        this.name = name;
        this.datatype = datatype;
        if (scopeDepth !== 0) {
            variable_scopes[0].variables.push(this);
        }
        return this;
    }

    constructor(token:Token|undefined = undefined) {
        if (currentFn === -1) this.is_global = true;
        this.token = token;
        this.scope = scopeDepth;
    }
}


var functions: Function[] = [];

function checkVariableInCurrScope(name:string, tok: Token) {
    for (let v of variable_scopes[0].variables) {
        if (v.name == name) {
            console.error(`${colors.yellow + relative(cwd(), tok.file_name) + colors.green}:${tok.line}:${tok.col} ${colors.red + `redeclaration variable ${name} previously declared at ${relative(cwd(), (v.token as Token).file_name)}:${v.token?.line}:${v.token?.col}`} ${colors.reset} `);
            process.exit();
        }
    }
}

function addVariableInFn(name: string, type: Type, token:Token|undefined) {
    var old = functions[currentFn].locals.length;
    functions[currentFn].locals.push(new Variable(token).local(name, type));
    return functions[currentFn].locals[old];
}

export function incLocalOffset(name: string, type: Type, token:undefined|Token, initializer?: Expression): Variable {
    var dummy = new Variable();
    dummy.datatype = type;
    if (resolution_pass) return dummy;


    if (name === "") {
        if (resolution_pass && currentFn != -1) { } else {
            name = "anon" + anon_count.toString(2);
            anon_count++;
        }
    }

    if (scopeDepth === 0) {
        globals.push(new Variable(token).global(name, type, initializer));
        return globals[globals.length - 1];
    }

    checkVariableInCurrScope(name, token as Token);
    return addVariableInFn(name, type,token);
}

export function addGlobalString(value: string): number {
    globalstrings.push({ value: value });
    return globalstrings.length - 1;
}

// export function addGlobal(name: string, value: Expression | undefined, datatype: Type): void {
//     globals.push(new );
// }


export function isResolutionPass() {
    return resolution_pass;
}

export function getLocalOffset(name: string, tok: Token): { offset: number, datatype: Type, variable: Variable | undefined } {
    var dummy = new Variable();
    dummy.datatype = voidtype;
    dummy.datatype.return_type = voidtype;
    if (resolution_pass) return { offset: -10, datatype: voidtype, variable: dummy }

    if (getEnum(name)) {
        return { offset: -3, datatype: getEnum(name) as Type, variable: undefined }
    }

    if (searchStruct(name)) {
        return { offset: -4, datatype: i64, variable: undefined };
    }

    for (let i = functions.length - 1; i >= 0; i--) {
        if (functions[i].name === name) {
            return { offset: -1, datatype: functions[i].data_type, variable: undefined }
        }
    }


    for (let scope of variable_scopes) {
        for (let v of scope.variables) {
            if (v.name === name) {
                return { offset: 0, datatype: v.datatype, variable: v };
            }
        }
    }

    if (scopeDepth > 0) {
        for (let v of functions[currentFn].locals.slice(0, functions[currentFn].impilicit_arity)) {
            if (v.name === name) {
                return { offset: 0, datatype: v.datatype, variable: v };
            }
        }
    }

    for (let i = 0; i < globals.length; i++) {
        if (globals[i].name === name) {
            return { offset: -2, datatype: globals[i].datatype, variable: globals[i] }
        }
    }

    console.error(`${colors.yellow + relative(cwd(), tok.file_name) + colors.green}:${tok.line}:${tok.col} ${colors.red + `undefined variable ${name}`} ${colors.reset} `);
    process.exit();
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

var currentFn: number = -1;

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
    variable_scopes.splice(0, 0, new VariableScope());
    scopeDepth++;
}

export function endScope() {
    variable_scopes.splice(0, 1);
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

var parsers: Parser[] = [];

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
        beginTagScope();
        await compile(process.argv[2]);
        resolution_pass = false;
        for (let p of parsers) {
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