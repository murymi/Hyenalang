import { tokenType } from "./token";
import { Expression } from "./expr";
import { exprType } from "./expr";
import { Statement, stmtType } from "./stmt";


function genDivide() {
    console.log("   cqo");
    console.log("   idiv rdi");
    console.log("   push rax");
}

function genMultiply() {
    console.log("   imul rax, rdi");
    console.log("   push rax");
}

function genAdd() {
    console.log("   add rax, rdi");
    console.log("   push rax");
}

function genSubtract() {
    console.log("   sub rax, rdi");
    console.log("   push rax");
}

function genNegate() {
    console.log("   neg rax");
    console.log("   push rax");
}

function genBinary(operator: tokenType) {
    console.log("   pop rdi");
    console.log("   pop rax");
    switch (operator) {
        case tokenType.divide:
            genDivide();
            break;
        case tokenType.multiply:
            genMultiply();
            break
        case tokenType.plus:
            genAdd();
            break
        case tokenType.minus:
            genSubtract();
            break
        default:
            break;
    }
}

function genUnary() {
    console.log("   pop rax");
    genNegate();
}

function genPrimary(a: number) {
    console.log("   push " + a);
}

function load() {
    console.log("   pop rax");
    console.log("   mov rax, [rax]");
    console.log("   push rax");
}

function store() {
    console.log("   pop rdi");
    console.log("   pop rax");
    console.log("   mov [rax], rdi");
}

function genAddress(stmt: Statement){
    console.log("   lea rax, [rbp-"+stmt.offset+"]");
    console.log("   push rax")
}


function generateCode(expr: Expression) {
    switch (expr.type) {
        case exprType.binary:
            generateCode(expr.left as Expression);
            generateCode(expr.right as Expression);
            genBinary(expr.operator?.type as tokenType);
            break;
        case exprType.unary:
            generateCode(expr.left as Expression);
            genUnary();
            break;
        case exprType.primary:
            genPrimary(expr.val as number);
            break;
        case exprType.grouping:
            generateCode(expr.left as Expression);
            break;
        default:
            throw new Error("Unexpected expression");
    }
}


function genStmt(stmt: Statement, labeloffset: number):void {

    switch(stmt.type) {
        case stmtType.exprstmt:
            console.log("");
            generateCode(stmt.expr);
            console.log("   sub rsp, 8");
            console.log("");
            break;
        case stmtType.vardeclstmt:
            console.log("");
            genAddress(stmt);
            console.log("");
            generateCode(stmt.expr);
            console.log("");
            store();
            console.log("");
            break;
        default: break;
    }

}

export function genStart(stmts: Statement[], localSize: number) {
    var text = "res = %d";
    console.log(".intel_syntax noprefix");
    console.log(".global fmt")
    console.log(".data");
    console.log(".align 1");
    console.log(".fmtbytes:");
    for (let i = 0; i < text.length; i++) {
        console.log("   .byte '" + text[i] + "'");
    }
    console.log("   .byte " + 10);
    console.log("   .byte " + 0);
    console.log(".align 8");
    console.log("fmt: .quad .fmtbytes");
    console.log(".text");
    console.log(".global main");
    console.log("main:");
    console.log("   push rbp");
    console.log("   mov rbp, rsp");
    console.log("   sub rsp, "+ localSize);

    stmts.forEach((s, i)=> {
        genStmt(s, i);
    })

    console.log("   xor rax, rax");
    console.log("   mov rsp, rbp");
    console.log("   pop rbp");
    console.log("   ret")
}


        // console.log("   pop rax");
        // console.log("   mov rsi, rax");
        // console.log("   mov rdi, fmt");
    // 
        // console.log("   mov rax, rsp");
        // console.log("   and rax, 15");
        // console.log("   jnz .L.call."+i);
        // console.log("   mov rax, 0");
        // console.log("   call printf");
        // console.log("   jmp .L.end."+i);
        // console.log(".L.call."+i+":");
        // console.log("   sub rsp, 8");
        // console.log("   mov rax, 0");
        // console.log("   call printf");
        // console.log("   add rsp, 8");
        // console.log(".L.end."+i+":");
