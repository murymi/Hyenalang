import { Lexer, Token } from "./token";
import { Parser } from "./parser";
import { genStart } from "./codegen";
import { Statement } from "./stmt";
import { Expression } from "./expr";

export enum fnType{
    extern,
    native,
}

export enum myType {
    u8,
    u16,
    u32,
    u64,

    i8,
    i16,
    i32,
    i64,
    u8_ptr,
    u16_ptr,
    u32_ptr,
    u64_ptr,

    i8_ptr,
    i16_ptr,
    i32_ptr,
    i64_ptr,

    f32,
    f64,

    f32_ptr,
    f64_ptr,

    void,
    void_ptr,

    struct
}

//var localSize = 0;
var scopeDepth = 0;
//var locals: { name:string, offset:number, scope: number }[] = [];
var globalstrings: { name: string, value: string, type:any }[] = [];


//class Variable

export class Function {
    name: string;
    arity: number;
    type: fnType;
    locals: { name:string, offset:number, scope: number, type:myType, customtype:any }[];
    localSize: number;
    params: Token[];
    body:Statement;
    returnType: any;

    constructor(
        name: string,
        type: fnType,
        params: Token[],
        arity: number,
        locals: { name:string, offset:number, scope: number, type:myType, customtype:any }[],
        retType: any
    ) { 
        this.localSize = 0; 
        this.name = name;
        this.type = type;
        this.params = params;
        this.arity = arity;
        this.locals = locals;
        this.returnType = retType;
    }
}


export class Struct {
    name: string;
    size: number;
    members: { name:string, size:number, default: number }[];

    constructor(name: string){
        this.name = name;
        this.size = 0;
        this.members = [];
    }
}

var structs: Struct[] = [];

var functions: Function[] = [];

export function checkStruct(name: string) {
    for(let s of structs) {
        if(s.name === name) return s;
    }
    return null;
}

// size in 8 bytes (for now)
export function incLocalOffset(name: string, size: number, type:myType, custom:any): number {
    if(currentFn === -1) return -1;
    for (let i = functions[currentFn].locals.length-1; i >= 0; i--) {
        if(functions[currentFn].locals[i].name === name && functions[currentFn].locals[i].scope === scopeDepth) {
            throw new Error("Redefination of a variable "+name);
        }
    }
    
    functions[currentFn].locals.push({
        name: name,
         offset: functions[currentFn].localSize ,
          scope: scopeDepth, type:type,
           customtype:custom 
        });
    functions[currentFn].localSize += size;// ++;
    // return start point for var
    return (functions[currentFn].localSize - /*-1*/ size) + functions[currentFn].arity;
}

export function addGlobal(name:string, value:string, type:any):void {
    globalstrings.push({name:name, value:value, type:type});
}

// export function addStructMember(name: string, value) {
//     if(inStruct()){
//         var curroffset = structs[currentFn].size;
//         structs[currentStruct].members.push({name:name,offset:curroffset })
//         structs[currentFn].size += 8;
//     } 
// }

export function getOffsetOfMember(struct:Struct, member:string) {
    var offset = 0;
    for(let m of struct.members) {
        if(m.name === member){
            return offset;
        }

        offset+=m.size;
    }

    console.log("struct "+struct.name+" has no member named "+member);
    process.exit(1);
}

export function getLocalOffset(name: string): { offset: number, type:any, custom:any} {
    for (let i = functions[currentFn].locals.length-1; i >= 0; i--) {
        if(functions[currentFn].locals[i].name === name && functions[currentFn].locals[i].scope <= scopeDepth) {
            var off = functions[currentFn].locals[i].offset + functions[currentFn].arity;
            var type = functions[currentFn].locals[i].type;
            var custom = functions[currentFn].locals[i].customtype;

            //console.log(functions[currentFn].locals)

            return { offset:off, type:type, custom:custom }
        }
    }

    for (let i = functions[currentFn].params.length-1; i >= 0; i--) {
        if(functions[currentFn].params[i].value === name) {
            return { offset:i, type:myType.void, custom:undefined }
        }
    }

    for (let i = functions.length-1; i >= 0; i--) {
        if(functions[i].name === name) {
            return { offset:-1, type:myType.void, custom:undefined }
        }
    }

    throw new Error("undefined variable");
}

export function getFn(name: string):Function {
    for (let i = functions.length-1; i >= 0; i--) {
        if(functions[i].name === name) {
            return functions[i];
        }
    }

    throw new Error("undefined function");
}

export function pushFunction(name: string,params: Token[], arity:number, type:fnType, locals:[], retType:any):number {
    functions.push(new Function(name, type, params, arity, locals, retType));
    return functions.length-1;
}

export function pushStruct(name:string) {
    structs.push(new Struct(name));
    return structs.length-1;
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

export function resetCurrentStruct(members: Statement[]) {
    members.forEach((m)=> {
        structs[currentStruct].members.push({ name:m.name, size: 8, default:0/*default:m.expr*/ })
        structs[currentStruct].size += 8;
    })

    //console.log(structs[0]);

    ins_struct = false;
    currentStruct = -1;
}

export function setCurrentFuction(n: number) {
    currentFn = n;
}

export function resetCurrentFunction(body:Statement) {
    functions[currentFn].body = body;
    //console.log(functions[currentFn].body);
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
    genStart(globalstrings, functions);
}

var prog = `
extern fn printf(a, b) void;
extern fn puts(a) void;

struct bar {
    x:u8;
    y:u8;
}


fn main() void {
    var a:bar;
    var fmt = "a.x = %d ";
    a.x = 90;
    a.y = 78;

    printf(fmt, a.y);
}

`
compile(prog);

