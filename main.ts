import { Lexer, Token } from "./token";
import { Parser } from "./parser";
import { genStart } from "./codegen";
import { Statement } from "./stmt";

export enum fnType{
    extern,
    native,
}

export const myType = {
    u8: {},
    u16: {},
    u32: {},
    u64: {},

    i8: {},
    i16: {},
    i32: {},
    i64: {},

    u8_ptr: {},
    u16_ptr: {},
    u32_ptr: {},
    u64_ptr: {},

    i8_ptr: {},
    i16_ptr: {},
    i32_ptr: {},
    i64_ptr: {},

    f32: {},
    f64: {},

    f32_ptr: {},
    f64_ptr: {},

    void: {},
    void_ptr: {}
}

//var localSize = 0;
var scopeDepth = 0;
//var locals: { name:string, offset:number, scope: number }[] = [];
var globalstrings: { name: string, value: string, type:any }[] = [];

export class Function {
    name: string;
    arity: number;
    type: fnType;
    locals: { name:string, offset:number, scope: number }[];
    localSize: number;
    params: Token[];
    body:Statement;
    returnType: any;

    constructor(
        name: string,
        type: fnType,
        params: Token[],
        arity: number,
        locals: { name:string, offset:number, scope: number, type:any }[],
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

var functions: Function[] = [];

export function incLocalOffset(name: string){
    for (let i = functions[currentFn].locals.length-1; i >= 0; i--) {
        if(functions[currentFn].locals[i].name === name && functions[currentFn].locals[i].scope === scopeDepth) {
            throw new Error("Redefination of a variable "+name);
        }
    }
    
    functions[currentFn].locals.push({name: name, offset: functions[currentFn].localSize , scope: scopeDepth });
    functions[currentFn].localSize++;
    return (functions[currentFn].localSize-1)+functions[currentFn].arity;
}

export function addGlobal(name:string, value:string, type:any):void {
    globalstrings.push({name:name, value:value, type:type});
}

export function getLocalOffset(name: string): number {
    for (let i = functions[currentFn].locals.length-1; i >= 0; i--) {
        if(functions[currentFn].locals[i].name === name && functions[currentFn].locals[i].scope <= scopeDepth) {
            return functions[currentFn].locals[i].offset + functions[currentFn].arity;
        }
    }

    for (let i = functions[currentFn].params.length-1; i >= 0; i--) {
        if(functions[currentFn].params[i].value === name) {
            return i;
        }
    }

    for (let i = functions.length-1; i >= 0; i--) {
        if(functions[i].name === name) {
            return 0;
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

var currentFn: number = -1;
var currentStruct: number = -1;

export function setCurrentStruct(n: number) {
    currentStruct = n;
}

export function resetCurrentStruct() {
    currentStruct = -1;
}

export function setCurrentFuction(n: number) {
    currentFn = n;
}

export function resetCurrentFunction(body:Statement) {
    functions[currentFn].body = body;
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
    console.log(tokens);
    var parser = new Parser(tokens);
    var stmts = parser.parse();
    //genStart(globalstrings, functions);
}

var prog = `
extern fn printf(a, b) void;
extern fn puts(a) void;

struct bar {
    x: i8;
    y: i8;
}

fn foo() void {
    
    var x = "xxxword";
    var b = &&&&x;
    return;
}

`
compile(prog);

