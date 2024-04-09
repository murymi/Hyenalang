import { Lexer } from "./token";
import { Parser } from "./parser";
import { genStart } from "./codegen";

var localSize = 0;
var scopeDepth = 0;
var locals: { name:string, offset:number, scope: number }[] = [];
export function incLocalOffset(name: string){
    var lr = locals.reverse();
    for (let loc of lr) {
        if(loc.name === name && loc.scope === scopeDepth) {
            throw new Error("Redefination of a variable "+name);
        }
    }

    locals.push({name: name, offset: localSize , scope: scopeDepth });
    localSize++;
    return localSize-1;
}

export function getLocalOffset(name: string): number {
    var lr = locals.reverse();
    for (let loc of lr) {
        if(loc.name === name && loc.scope === scopeDepth) {
            return loc.offset;
        }
    }

    throw new Error("undefined variable");
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
    genStart(stmts, localSize*8);
}


compile("while (1 > 0) { print 1; }");

