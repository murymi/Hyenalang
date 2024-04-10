import { Lexer, Token } from "./token";
import { Parser } from "./parser";
import { genStart } from "./codegen";
import { Statement } from "./stmt";

export enum fnType{
    extern,
    native,
}

//var localSize = 0;
var scopeDepth = 0;
//var locals: { name:string, offset:number, scope: number }[] = [];
var globalstrings: {name: string, value: string}[] = [];

export class Function {
    name: string;
    arity: number;
    type: fnType;
    locals: { name:string, offset:number, scope: number }[];
    localSize: number;
    params: Token[];
    body:Statement;

    constructor(
        name: string,
        type: fnType,
        params: Token[],
        arity: number,
        locals: { name:string, offset:number, scope: number }[],
    ) { 
        this.localSize = 0; 
        this.name = name;
        this.type = type;
        this.params = params;
        this.arity = arity;
        this.locals = locals;
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

export function addGlobal(name:string, value:string):void {
    globalstrings.push({name:name, value:value});
}

export function getLocalOffset(name: string): number {
    for (let i = functions[currentFn].locals.length-1; i >= 0; i--) {
        if(functions[currentFn].locals[i].name === name && functions[currentFn].locals[i].scope <= scopeDepth) {
            return functions[currentFn].locals[i].offset+1;
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

export function getFn(name: string):{name:string, arity:number, type:fnType} {
    for (let i = functions.length-1; i >= 0; i--) {
        if(functions[i].name === name) {
            return functions[i];
        }
    }

    throw new Error("undefined function");
}

export function pushFunction(name: string,params: Token[], arity:number, type:fnType, locals:[]):number {
    functions.push(new Function(name, type, params, arity, locals));
    return functions.length-1;
}

var currentFn: number = -1;
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
    var parser = new Parser(tokens);
    var stmts = parser.parse();
    genStart(globalstrings, functions);
}

var prog = `
extern fn printf(a, b);

fn foo(a) {
    var c = 0;
    var fmt = "hello word %d  ";

    while(c < 10) {
        printf(fmt, c);
        c = c + 1;
    }
}

fn main(){
    foo(70);
}
`
compile(prog);

