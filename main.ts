import { Lexer } from "./token";
import { Parser } from "./parser";
import { genStart } from "./codegen";

var localSize = 0;
export function incLocalOffset(){
    localSize++;
    return localSize-1;
}

function compile(text: string) {
    var lexer = new Lexer(text);

    var tokens = lexer.lex();

    //console.log(tokens);

    var parser = new Parser(tokens);
    var stmts = parser.parse();
    //console.log(localSize);
    genStart(stmts, localSize*8);
}


// make > tmp.s
// gcc -static -o tmp tmp.s
// ./tmp
compile("var a = 90; 10 + 10; var t = 78;");

