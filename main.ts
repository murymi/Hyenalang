import { Lexer } from "./token";
import { Parser } from "./parser";
import { genStart } from "./codegen";

var localSize = 0;
var scopeDepth = 0;
var locals: { name:string, offset:number, scope: number }[] = [];
var globalstrings: {name: string, value: string}[] = [];
var externFns: {name: string, arity: number}[] = [];
export function incLocalOffset(name: string){
    for (let i = locals.length-1; i >= 0; i--) {
        if(locals[i].name === name && locals[i].scope === scopeDepth) {
            throw new Error("Redefination of a variable "+name);
        }
    }
    
    locals.push({name: name, offset: localSize , scope: scopeDepth });
    localSize++;
    return localSize-1;
}

export function addGlobal(name:string, value:string):void {
    globalstrings.push({name:name, value:value});
}

export function getLocalOffset(name: string): number {
    for (let i = locals.length-1; i >= 0; i--) {
        if(locals[i].name === name && locals[i].scope <= scopeDepth) {
            return locals[i].offset;
        }
    }

    for (let i = externFns.length-1; i >= 0; i--) {
        if(externFns[i].name === name) {
            return 0;
        }
    }

    throw new Error("undefined variable");
}

export function getFn(name: string):{name:string, arity:number} {
    for (let i = externFns.length-1; i >= 0; i--) {
        if(externFns[i].name === name) {
            return externFns[i];
        }
    }

    throw new Error("undefined function");
}

export function pushExtern(name: string, arity:number) {
    externFns.push({name:name, arity:arity});
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
    genStart(globalstrings, stmts, localSize*8);
}

var prog = `
extern fn printf(fmt, others);
var fmt = "hello world %d ";
var i = 0;

while(i < 50) {
    printf(fmt, i);
    i = i + 1;
}
`
compile(prog);

