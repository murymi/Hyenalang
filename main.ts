import { Lexer } from "./token";
import { Parser } from "./parser";
import { genStart } from "./codegen";


function compile(text: string) {
    var lexer = new Lexer(text);

    var tokens = lexer.lex();
    var parser = new Parser(tokens);
    var stmts = parser.parse();
    
    genStart(stmts);
}


// make > tmp.s
// gcc -static -o tmp tmp.s
// ./tmp
compile("40+2;69*3;90+8;");

