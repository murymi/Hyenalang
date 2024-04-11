import { Token, tokenType } from "./token";
import { Expression, identifierType } from "./expr";
import { exprType } from "./expr";
import { Statement, stmtType } from "./stmt";
import { fnType } from "./main";
import { Function } from "./main";


var latestContinueLabel = "";
var latestBreakLabel = "";

var argRegisters = ["rdi", "rsi", "rdx", "rcx", "r8", "r9"];
var usedRegs: string[] = [];

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

function genLess() {
    console.log("   cmp rax, rdi");
    console.log("   setl al");
    console.log("   movzb rax, al")
    console.log("   push rax");
}

function genGreater() {
    console.log("   cmp rax, rdi");
    console.log("   setg al");
    console.log("   movzb rax, al")
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
        case tokenType.greater:
            genGreater();
            break;
        case tokenType.less:
            genLess();
            break;
        default:
            break;
    }
}

function genUnary() {
    console.log("   pop rax");
    genNegate();
}

function genNumber(a: number) {
    console.log("   push " + a);
}

function genString(name: string) {
    console.log("   push " + name);
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

function genAddress(stmt: Statement | Expression) {
    console.log("   lea rax, [rbp-" + (stmt.offset + 1) * 8 + "]");
    console.log("   push rax")
}

function genFnAddress(expr: Expression) {
    console.log("lea rax, [" + expr.name + "]");
    console.log("push rax");
}

function saveRegisters(): string[] {
    return usedRegs.map((reg) => {
        console.log("   push " + reg);
        return reg;
    })
}

function restore(saved: string[]): void {
    for (let i = saved.length - 1; i >= 0; i--) {
        console.log("   pop " + saved[i]);
    }
}


function generateCode(expr: Expression) {
    //console.log(expr);
    switch (expr.type) {
        case exprType.binary:
            generateCode(expr.left as Expression);
            generateCode(expr.right as Expression);
            genBinary(expr.operator?.type as tokenType);
            break;
        case exprType.deref:
            generateCode(expr.left as Expression);
            console.log("sub rsp, 8");
            for (let i = 0; i < expr.depth; i++) {
                console.log("lea rax, rax");
            }
            console.log("push rax");
            break;
        case exprType.unary:
            generateCode(expr.left as Expression);
            genUnary();
            break;
        case exprType.primary:
            genNumber(expr.val);
            break;
        case exprType.number:
            genNumber(expr.val);
            break;
        case exprType.grouping:
            generateCode(expr.left as Expression);
            break;
        case exprType.assign:
            genAddress(expr)
            generateCode(expr.left as Expression);
            store();
            break;
        case exprType.identifier:
            //console.log("===================", expr.type);
            if (expr.idtype === identifierType.func) {
                genFnAddress(expr);
            } else {
                genAddress(expr);
                load();
            }
            break;
        case exprType.call:
            generateCode(expr.callee);
            switch (expr.fntype) {
                case fnType.extern:
                    expr.params.forEach((p, i) => {
                        var saved: string[] = [];
                        var isCall = false;
                        if (p.type === exprType.call) {
                            isCall = true;
                            saved = saveRegisters();
                        }
                        generateCode(p);
                        if (isCall) {
                            restore(saved);
                            console.log("   push rax");
                        }
                        console.log("   pop " + argRegisters[i]);
                        usedRegs.push(argRegisters[i]);
                    });
                    // console.log("   lea r15, [" + expr.callee.name + "]");
                    // console.log("   call buitin_glibc_caller");
                    // console.log("   push rax");
                    break;
                case fnType.native:
                    //genAddress()

                    expr.params.forEach((p, i) => {
                        var saved: string[] = [];
                        var isCall = false;
                        if (p.type === exprType.call) {
                            isCall = true;
                            saved = saveRegisters();
                        }
                        generateCode(p);
                        if (isCall) {
                            restore(saved);
                            console.log("   push rax");
                        }
                        console.log("   pop " + argRegisters[i]);
                        usedRegs.push(argRegisters[i]);
                    });
                    break;
                default: break;
            }
            console.log("   pop rax");
            console.log("   call rax");
            break;
        case exprType.string:
            genString(expr.name);
            break;
        default:
            throw new Error("Unexpected expression");
    }
}

function genAlignedCall() {
    console.log(".global buitin_glibc_caller")
    console.log("buitin_glibc_caller:")
    console.log("   push rbp");
    console.log("   mov rbp, rsp");
    console.log("   mov rax, rsp");
    console.log("   and rax, 15");
    console.log("   jnz .L.call");
    console.log("   mov rax, 0");
    console.log("   call r15");
    console.log("   jmp .L.end");
    console.log(".L.call:");
    console.log("   sub rsp, 8");
    console.log("   mov rax, 0");
    console.log("   call r15");
    console.log("   add rsp, 8");
    console.log(".L.end:");
    console.log("   mov rsp, rbp");
    console.log("   pop rbp");
    console.log("   ret")
}


function genStmt(stmt: Statement, labeloffset: number): void {
    switch (stmt.type) {
        case stmtType.exprstmt:
            generateCode(stmt.expr);
            //console.log("   sub rsp, 8");
            break;
        case stmtType.vardeclstmt:
            genAddress(stmt);
            if (stmt.expr.type === exprType.string) {
                console.log("   push " + (stmt.expr.name as string));
            } else {
                //console.log(stmt.expr);
                generateCode(stmt.expr);
            }
            store();
            break;
        case stmtType.block:
            stmt.stmts.forEach((s, i) => { genStmt(s, i + labeloffset + 1); })
            break
        case stmtType.ifStmt:
            generateCode(stmt.cond);
            console.log("   pop rax");
            console.log("   cmp rax, 0");
            console.log("   je .L.else." + labeloffset);
            genStmt(stmt.then, labeloffset + 1);
            console.log("   jmp .L.end." + labeloffset);
            console.log(".L.else." + labeloffset + ":");
            if (stmt.else_) {
                genStmt(stmt.else_, labeloffset + 1);
            }
            console.log(".L.end." + labeloffset + ":");
            break;
        case stmtType.whileStmt:
            latestBreakLabel = ".L.break." + labeloffset;
            latestContinueLabel = ".L.continue." + labeloffset;
            console.log(".L.continue." + labeloffset + ":");
            generateCode(stmt.cond);
            console.log("   pop rax");
            console.log("   cmp rax, 0");
            console.log("   je .L.break." + labeloffset);
            genStmt(stmt.then, labeloffset + 1);
            console.log("   jmp .L.continue." + labeloffset);
            console.log(".L.break." + labeloffset + ":");
            break;
        case stmtType.braek:
            if (latestBreakLabel === "") throw new Error("Stray break");
            console.log("jmp " + latestBreakLabel);
            break;
        case stmtType.contineu:
            if (latestContinueLabel === "") throw new Error("Stray continue");
            console.log("jmp " + latestContinueLabel);
            break;
        case stmtType.print:
            generateCode(stmt.expr);
            console.log("   pop rax");
            console.log("   mov rsi, rax");
            console.log("   mov rdi, fmt");

            console.log("   mov rax, rsp");
            console.log("   and rax, 15");
            console.log("   jnz .L.call." + labeloffset);
            console.log("   mov rax, 0");
            console.log("   call printf");
            console.log("   jmp .L.end." + labeloffset);
            console.log(".L.call." + labeloffset + ":");
            console.log("   sub rsp, 8");
            console.log("   mov rax, 0");
            console.log("   call printf");
            console.log("   add rsp, 8");
            console.log(".L.end." + labeloffset + ":");
            break;
        case stmtType.ret:
            generateCode(stmt.expr);
            console.log("   pop rax");
            break;
        default: break;
    }

}

function genGlobalStrings(globs: { name: string, value: string }[]) {
    console.log(".intel_syntax noprefix");
    //console.log(".global ")
    console.log(".data");
    globs.forEach((glob, i) => {
        console.log(".align 1");
        console.log(".L.data." + i + ":");
        for (let i = 0; i < glob.value.length; i++) {
            console.log("   .byte '" + glob.value[i] + "'");
        }
        console.log("   .byte " + 0);
        console.log(".align 8");
        console.log(glob.name + ": .quad .L.data." + i);
    })
}

function genArgs(names: Token[]) {
    names.forEach((n, i) => {
        console.log("   lea rax, [rbp-" + (i + 1) * 8 + "]");
        console.log("   mov [rax], " + argRegisters[i])
    })
}

function genText(fns: Function[]) {
    console.log(".text");
    fns.forEach((fn) => {
        if (fn.type === fnType.native) {
            console.log(".global " + fn.name);
            console.log(fn.name + ":");
            console.log("   push rbp");
            console.log("   mov rbp, rsp");
            console.log("   sub rsp, " + (fn.localSize * 8 + fn.arity * 8));

            genArgs(fn.params);

            genStmt(fn.body, 0);

            console.log("   mov rsp, rbp");
            console.log("   pop rbp");
            console.log("   ret");
            console.log("")
        }
    })
}

export function genStart(globs: { name: string, value: string }[], fns: Function[]) {
    genGlobalStrings(globs);
    genText(fns);
    genAlignedCall();
}

