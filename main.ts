import { Lexer, Token } from "./token";
import { Parser } from "./parser";
import { genStart } from "./codegen";
import { Statement } from "./stmt";
import { Expression } from "./expr";
import { Type, alignTo, i64 } from "./type";

export enum fnType {
    extern,
    native,
}



//var localSize = 0;
var scopeDepth = 0;
//var locals: { name:string, offset:number, scope: number }[] = [];
var globalstrings: { name: string, value: string, type: any }[] = [];
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

    constructor(name: string) {
        this.name = name;
        this.size = 0;
        this.members = [];
    }
}

var structs: Struct[] = [];

var functions: Function[] = [];

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

export function addGlobalString(name: string, value: string, type: any): number {
    globalstrings.push({ name: name, value: value, type: type });
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

    console.log("struct  has no member named " + member);
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

export function pushStruct(name: string) {
    structs.push(new Struct(name));
    return structs.length - 1;
}

var currentFn: number = -1;
var currentStruct: number = -1;
var ins_struct = false;

export function setCurrentStruct(n: number) {
    ins_struct = true;
    currentStruct = n;
}

export function inStruct() {
    return ins_struct;
}

export function getStructMembers(name: string) {
    for (let s of structs){
        if(s.name === name) {
            return s.members;
        }
    }
    return null;
}

export function resetCurrentStruct(members: Statement[]) {
    members.forEach((m) => {
        structs[currentStruct].members.push({ name: m.name, datatype: m.initializer?.datatype as Type/*default:m.expr*/ })
        //structs[currentStruct].size += m.initializer;
    });

    //console.log(structs[currentStruct]);


    ins_struct = false;
    currentStruct = -1;
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
extern fn puts(ptr: *u8) void;


var a:bool = cap;

fn main() void {
    if(a) {
        return 10;
    }
    return 5;
}

`
compile(prog);

