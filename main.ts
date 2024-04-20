import { Lexer, Token } from "./token";
import { Parser } from "./parser";
import { genStart } from "./codegen";
import { Statement } from "./stmt";
import { Expression } from "./expr";
import { Type, alignTo, enm, i32, i64 } from "./type";

export enum fnType {
    extern,
    native,
}



//var localSize = 0;
var scopeDepth = 0;
//var locals: { name:string, offset:number, scope: number }[] = [];
var globalstrings: { value: string }[] = [];
var globals: { name: string, value: Expression|undefined, datatype:Type }[] = [];


//class Variable

export class Function {
    name: string;
    arity: number;
    type: fnType;
    locals: { name: string, scope: number, datatype: Type, offset: number }[];
    localOffset: number;
    params: { name: string, datatype: Type }[];
    body: Statement;
    returnType: any;

    constructor(
        name: string,
        type: fnType,
        params: { name: string, datatype: Type }[],
        locals: { name: string, scope: number, datatype: Type, offset: number }[],
        retType: any
    ) {
        this.localOffset = 0;
        this.name = name;
        this.type = type;
        this.params = params;

        this.locals = locals;
        var args: { name: string, scope: number, datatype: Type, offset: number }[] = [];
        if(type === fnType.native) {
            params.forEach((p)=>{
                this.localOffset = alignTo(p.datatype.align, this.localOffset);
                args.push({
                    name: p.name,
                    scope: scopeDepth,
                    offset: this.localOffset,
                    datatype: p.datatype
                });
                this.localOffset += p.datatype.size;
            })
            args.concat(locals);
            this.locals = args;
        }


        this.arity = params.length;
        this.returnType = retType;
    }
}


export class Struct {
    name: string;
    size: number;
    members: { name: string, datatype: Type }[];
    is_union:boolean;

    constructor(name: string, isunion:boolean, members: { name: string, datatype: Type }[]) {
        this.name = name;
        this.size = 0;
        this.members = members;
        this.is_union= isunion;
    }
}

export class Enum {
    name: string;
    values:{name:string, value:number}[];

    constructor(name:string, values:{name:string, value:number}[]) {
        this.name = name;
        this.values = values;
    }
}


var structs: Struct[] = [];

var functions: Function[] = [];

var enums: Type[] = [];

export function pushEnum(en:Type) {
    enums.push(en);
}

export function getEnum(name:string) {
    for(let e of enums){
        if(e.name === name) {
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
export function incLocalOffset(name: string, type: Type): number {
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
        datatype: type
    });
    functions[currentFn].localOffset += type.size;// ++;
    // return start point for var
    return old;
}

export function addGlobalString( value: string): number {
    globalstrings.push({ value: value });
    return globalstrings.length - 1;
}

export function addGlobal(name: string, value:Expression|undefined, datatype:Type): void {
    globals.push({name:name, value:value, datatype:datatype});
}


export function getOffsetOfMember(struct: Type, member: string) {
    for (let m of struct.members) {
        if (m.name === member) {
            return { offset:m.offset, datatype:m.type };
        }
    }

    console.log("struct or union has no member named " + member);
    process.exit(1);
}

export function getLocalOffset(name: string): { offset: number, datatype: Type, glob:boolean } {
    for (let i = functions[currentFn].locals.length - 1; i >= 0; i--) {
        if (functions[currentFn].locals[i].name === name && functions[currentFn].locals[i].scope <= scopeDepth) {
            var off = functions[currentFn].locals[i].offset + functions[currentFn].arity;
            var type = functions[currentFn].locals[i].datatype;

            return { offset: off, datatype: type, glob:false }
        }
    }

    for(let i = 0; i < globals.length; i++) {
        if(globals[i].name === name) {
            return { offset: -2, datatype: globals[i].datatype, glob:true }
        }
    }

    for(let e of enums) {
        if(e.name === name) {
            return { offset: -3, datatype: e, glob:false }
        }
    }

    for (let i = functions.length - 1; i >= 0; i--) {
        if (functions[i].name === name) {
            return { offset: -1, datatype:i64, glob:true}
        }
    }

    throw new Error("undefined variable");
}

export function getFn(name: string): Function {
    for (let i = functions.length - 1; i >= 0; i--) {
        if (functions[i].name === name) {
            return functions[i];
        }
    }

    throw new Error("undefined function");
}

export function pushFunction(name: string, params: { name: string, datatype: Type }[], type: fnType, locals: [], retType: any): number {
    functions.push(new Function(name, type, params, locals, retType));
    return functions.length - 1;
}

export function pushStruct(struc:Struct) {
    structs.push(struc);
}

var currentFn: number = -1;

export function getStruct(name: string) {
    for (let s of structs){
        if(s.name === name) {
            return s;
        }
    }
    return null;
}

export function setCurrentFuction(n: number) {
    currentFn = n;
}

export function resetCurrentFunction(body: Statement) {
    functions[currentFn].body = body;
    //console.log(functions[currentFn]);
    currentFn = -1;
}

export function beginScope() {
    scopeDepth++;
}

export function endScope() {
    scopeDepth--;
}

function compile(text: string) {
    var lexer = new Lexer(text);

    var tokens = lexer.lex();
    //console.log(tokens);
    var parser = new Parser(tokens);
    var stmts = parser.parse();
    //console.log(stmts);
    genStart(globalstrings,globals, functions);
}

var prog = `

extern fn puts(m:*u8) void;

struct pig {
    age:u8,
    du:u8
}

struct goat {
    p:pig
}

struct cow {
    g:goat
}

fn main() void {
    var c:cow;

    c.g.p.du = 2;

    return c.g.p.du;
}

`
compile(prog);

