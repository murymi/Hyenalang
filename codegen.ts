import { Token, tokenType } from "./token";
import { Expression, identifierType } from "./expr";
import { exprType } from "./expr";
import { Statement, stmtType } from "./stmt";
import { fnType } from "./main";
import { Function } from "./main";
import { error } from "console";
import { Type, myType } from "./type";


var latestContinueLabel = "";
var latestBreakLabel = "";

var argRegisters = ["rdi", "rsi", "rdx", "rcx", "r8", "r9"];
var dwordArgRegisters = ["edi", "esi", "edx", "ecx", "r8d", "r9d"];
var wordArgRegisters = ["di", "si", "dx", "cx", "r8w", "r9w"];
var byteArgRegisters = ["dil", "sil", "dl", "cl", "r8b", "r9b"];



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
            throw new error("unhandled operator");
            break;
    }
}

function genUnary() {
    console.log("   pop rax");
    genNegate();
}

function genNumber(expr: Expression) {
    console.log("   push " + expr.val);
}

function genString(name: string) {
    console.log("   push " + name);
}

function load(datatype: Type) {
    console.log("   pop rax");

    if (datatype.size === 1) {
        console.log("   movsx rax, byte ptr [rax]");
    } else if (datatype.size === 2) {
        console.log("   movsx rax, word ptr [rax]");
    } else if (datatype.size === 4) {
        console.log("   movsxd rax, dword ptr [rax]");
    } else {
        if (datatype.size !== 8) {
            console.log("Invalid load");
            process.exit(1);
        }
        console.log("   mov rax, [rax]");
    }


    console.log("   push rax");
}

function loadWoffset(offset: number) {
    console.log("   pop rax");
    console.log("   mov rax, [rax+" + offset + "]");
    console.log("   push rax");
}

function loadaddrWoffset(offset: number) {
    console.log("   pop rax");
    //console.log("==========");
    console.log("   lea rax, [rax+" + offset + "]");
    console.log("   push rax");
}

function loadWCalcedOffset(datatype: Type) {
    console.log("");
    console.log("   pop rdi");
    console.log("   pop rax");
    console.log("   imul rdi, "+datatype.size);
    console.log("   add rax, rdi");
    console.log("push rax");
    load(datatype);
    console.log("");
}

function loadaddrWCalcedOffset(datatype: Type) {
    //console.log("====================");
    console.log("   pop rdi");
    console.log("   imul rdi, "+datatype.size);
    console.log("   pop rax");
    console.log("   add rax, rdi")
    console.log("   lea rax, [rax]");
    console.log("   push rax");
    //console.log("=====================");
}

function store(datatype: Type) {

    //console.log("==========================================");

    console.log("   pop rdi");
    console.log("   pop rax");


    if (datatype.size === 1) {
        console.log("   mov [rax], dil");
    } else if (datatype.size === 2) {
        console.log("   mov [rax], di");
    } else if (datatype.size === 4) {
        console.log("   mov [rax], edi");
    } else {
        if (datatype.size !== 8) {
            console.log("Invalid store");
            process.exit(1);
        }
        console.log("   mov [rax], rdi");
    }

    //console.log("push rdi");
}

function genAddress(stmt: Statement | Expression) {
    //console.log("   lea rax, [rbp-" + (stmt.offset + 1) * 8 + "]");
    console.log("   lea rax, [rbp-" + (stmt.offset + stmt.datatype.size) + "]");
    console.log("   push rax")
}

function genFnAddress(expr: Expression) {
    console.log("   lea rax, [" + expr.name + "]");
    console.log("   push rax");
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

function genarateAddress(expr: Expression) {
    //console.log("hello");
    switch (expr.type) {
        case exprType.assign:
            genAddress(expr)
            generateCode(expr.left as Expression);
            return;
        case exprType.arrayset:
            generateCode(expr.left as Expression);
            loadaddrWCalcedOffset(expr.datatype);
            generateCode(expr.right as Expression);
            return;
        case exprType.set:
            generateCode(expr.left as Expression);
            var offset = expr.left?.offset;
            loadaddrWoffset(offset as number);
            generateCode(expr.right as Expression);
            //console.log("==========", expr.right);
            return;
    }
}

function genLvalue(expr: Expression) {
    // if (expr.datatype.kind === myType.array) {
    //     console.log("not an lvalue");
    //     process.exit(1);
    // }
    genarateAddress(expr);
}

function generateCode(expr: Expression) {
    switch (expr.type) {
        case exprType.address_set:
            //console.log("set");
            generateCode(expr.left as Expression);
            //console.log("set");
            generateCode(expr.right as Expression);
            store(expr.datatype);
            break;
        case exprType.address:
            //console.log("address detected");
            generateCode(expr.left as Expression);
            //console.log("address detected");
            break;
        case exprType.arrayget:
            generateCode(expr.left as Expression);
            generateCode(expr.offsetExpr as Expression);
            if (expr.loadaddr) {
            } else {
                loadWCalcedOffset(expr.left?.datatype.base as Type);
            }
            break;
        case exprType.arrayset:
        case exprType.set:
            genLvalue(expr);
            store(expr.datatype);

            break;
        case exprType.get:
            generateCode(expr.left as Expression);
            if (expr.loadaddr) {} else {
                loadWoffset(expr.offset);
            }
            break;
        case exprType.binary:
            generateCode(expr.left as Expression);
            generateCode(expr.right as Expression);
            genBinary(expr.operator?.type as tokenType);
            break;
        case exprType.deref:
            generateCode(expr.left as Expression);
            if(!expr.loadaddr) {
                load(expr.datatype);
            }
            break;
        case exprType.unary:
            generateCode(expr.right as Expression);
            genUnary();
            break;
        case exprType.number:
            genNumber(expr);
            break;
        case exprType.grouping:
            generateCode(expr.left as Expression);
            break;
        case exprType.assign:
            genLvalue(expr);
            store(expr.datatype);
            break;
        case exprType.identifier:
            if (expr.idtype === identifierType.func) {
                genFnAddress(expr);
            } else if (expr.idtype === identifierType.struct) {
                genAddress(expr);
            } else if (expr.idtype === identifierType.array) {
                //console.log("======================");
                genAddress(expr);
            }
            else {
                genAddress(expr);
                if(!expr.loadaddr) {
                    load(expr.datatype);
                }
            }
            break;
        case exprType.call:
            generateCode(expr.callee);
            switch (expr.fntype) {
                case fnType.extern:
                    expr.params.forEach((p) => {
                        generateCode(p);
                    });

                    for (let i = expr.params.length - 1; i >= 0; i--) {
                        if (expr.params[i].datatype.size === 1) {
                            console.log("pop " + argRegisters[i]);
                            console.log("movsx "+ argRegisters[i] + ", "+ byteArgRegisters[i]);
                        } if (expr.params[i].datatype.size === 2) {
                            console.log("pop " + argRegisters[i]);
                            console.log("movsx "+ argRegisters[i] + ", "+ wordArgRegisters[i]);
                        } if (expr.params[i].datatype.size === 4) {
                            console.log("pop " + argRegisters[i]);
                            console.log("movsx "+ argRegisters[i] + ", "+ dwordArgRegisters[i]);
                        } if (expr.params[i].datatype.size === 8) {
                            console.log("pop " + argRegisters[i]);
                        }
                    }

                    console.log("   pop r15");
                    console.log("   call buitin_glibc_caller");
                    break;
                case fnType.native:
                    expr.params.forEach((p) => {
                        generateCode(p);
                    });

                    for (let i = expr.params.length - 1; i >= 0; i--) {
                        console.log("pop " + argRegisters[i]);
                    }
                    console.log("   pop rax");
                    console.log("   call rax");
                    break;
                default: break;
            }
            break;
        case exprType.string:
            //console.log("==============");
            genString(expr.name);
            //console.log("==============");
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


function genStmt(stmt: Statement, labeloffset: number, fnid: number): void {
    switch (stmt.type) {
        case stmtType.exprstmt:
            generateCode(stmt.expr);
            break;
        case stmtType.vardeclstmt:
            genAddress(stmt);
            if (stmt.expr.type === exprType.string) {
                console.log("   push " + (stmt.expr.name as string));
                store(stmt.expr.datatype);
            } else {
                if (stmt.expr.datatype.kind !== myType.struct && stmt.expr.datatype.kind !== myType.array) {
                    generateCode(stmt.expr);
                    store(stmt.expr.datatype);
                } else {
                    console.log("sub rsp, 8")
                }
            }
            break;
        case stmtType.block:
            stmt.stmts.forEach((s, i) => { genStmt(s, i + labeloffset + 1, fnid); })
            break
        case stmtType.ifStmt:
            generateCode(stmt.cond);
            console.log("   pop rax");
            console.log("   cmp rax, 0");
            console.log("   je .L.else." + labeloffset);
            genStmt(stmt.then, labeloffset + 1, fnid);
            console.log("   jmp .L.end." + labeloffset);
            console.log(".L.else." + labeloffset + ":");
            if (stmt.else_) {
                genStmt(stmt.else_, labeloffset + 1, fnid);
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
            genStmt(stmt.then, labeloffset + 1, fnid);
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
        case stmtType.ret:
            generateCode(stmt.expr);
            console.log("   pop rax");
            console.log(`   jmp .L.endfn.${fnid}`);
            break;
        default: break;
    }

}

function genGlobalStrings(globs: { name: string, value: string }[]) {
    console.log(".intel_syntax noprefix");
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
    names.forEach((_, i) => {
        console.log("   lea rax, [rbp-" + (i + 1) * 8 + "]");
        console.log("   mov [rax], " + argRegisters[i])
    })
}

function genText(fns: Function[]) {
    console.log(".text");
    fns.forEach((fn, i) => {
        if (fn.type === fnType.native) {
            console.log(".global " + fn.name);
            console.log(fn.name + ":");
            console.log("   push rbp");
            console.log("   mov rbp, rsp");
            console.log("   sub rsp, " + (fn.localOffset));

            //genArgs(fn.params);

            genStmt(fn.body, 0, i);
            console.log("   xor rax, rax");
            console.log(`.L.endfn.${i}:`);
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

