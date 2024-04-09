import { Lexer } from "./token";
import { Parser } from "./parser";
import { genStart } from "./codegen";

var localSize = 0;
var scopeDepth = 0;
var locals: { name:string, offset:number, scope: number }[] = [];
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

export function getLocalOffset(name: string): number {
    for (let i = locals.length-1; i >= 0; i--) {
        if(locals[i].name === name && locals[i].scope <= scopeDepth) {
            return locals[i].offset;
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

var prog = `
var a = 10; 
{ 
    var b = 11; 
    {
        var c = 10;
        {
            var d = 90;
            {
                var e = 89;
                while (e < 100) {
                    print e;
                    e = e + 1;
                }
            }
        }
    }
}

`
compile(prog);

