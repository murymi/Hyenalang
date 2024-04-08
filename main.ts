import { Lexer } from "./token";
import { Parser } from "./parser";
import { genStart } from "./codegen";

var localSize = 0;
var locals: { name:string, offset:number }[] = [];
export function incLocalOffset(name: string){
    locals.push({name: name, offset: localSize });
    localSize++;
    return localSize-1;
}

export function getLocalOffset(name: string): number {
    for (let loc of locals) {
        if(loc.name === name) {
            return loc.offset;
        }
    }

    throw new Error("undefined variable");
}

function compile(text: string) {
    var lexer = new Lexer(text);

    var tokens = lexer.lex();

    var parser = new Parser(tokens);
    var stmts = parser.parse();
    genStart(stmts, localSize*8);
}


compile("var a; a = 90 * 90; print a;");

