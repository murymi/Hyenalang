import { Token, tokenType } from "./token";
import { Expression, identifierType } from "./expr";
import { exprType } from "./expr";
import { Statement, stmtType } from "./stmt";
import { fnType } from "./main";
import { Function } from "./main";
import { count, error } from "console";
import { Type, alignTo, f32, myType } from "./type";


var latestContinueLabel = "";
var latestBreakLabel = "";

var argRegisters = ["rdi", "rsi", "rdx", "rcx", "r8", "r9"];
var dwordArgRegisters = ["edi", "esi", "edx", "ecx", "r8d", "r9d"];
var wordArgRegisters = ["di", "si", "dx", "cx", "r8w", "r9w"];
var byteArgRegisters = ["dil", "sil", "dl", "cl", "r8b", "r9b"];

var l = 0;
function incLabel() {
    return l++;
}

function genDivide() {
    console.log("   cqo");
    console.log("   idiv rdi");
}

function genMultiply() {
    console.log("   imul rax, rdi");
}

function genAdd(datatype: Type) {
    if (datatype === f32) {
        return;
    }

    console.log("   add rax, rdi");
}

function genSubtract() {
    console.log("   sub rax, rdi");
}

function genLess() {
    console.log("   cmp rax, rdi");
    console.log("   setl al");
    console.log("   movzb rax, al");
}

function genGreater() {
    console.log("   cmp rax, rdi");
    console.log("   setg al");
    console.log("   movzb rax, al")
}

function genLessEq() {
    console.log("   cmp rax, rdi");
    console.log("   setle al");
    console.log("   movzb rax, al")
}

function genGreaterEq() {
    console.log("   cmp rax, rdi");
    console.log("   setge al");
    console.log("   movzb rax, al")
}

function genEq() {
    console.log("   cmp rax, rdi");
    console.log("   sete al");
    console.log("   movzb rax, al")
}

function genNotEq() {
    console.log("   cmp rax, rdi");
    console.log("   setne al");
    console.log("   movzb rax, al")
}

function genNegate() {
    console.log("   neg rax");
}

function push() {
    console.log("   push rax");
}

function pop(reg: string) {
    console.log(`   pop ${reg}`);
}

function pushf32() {
    console.log("   sub rsp, 8");
    console.log("   movss [rsp], xmm0");
}

function popf32(xmm: number) {
    console.log(`   movss xmm${xmm}, [rsp]`);
    console.log("   add rsp, 8");
}

function genBitAnd() {
    console.log("   and rax, rdi");
}

function genBitOr() {
    console.log("   or rax, rdi");
}

function genBitXor() {
    console.log("   xor rax, rdi");
}

function genBitNot() {
    console.log("   not rax");
}

function genLogicalAnd() {
    var label = incLabel();
    console.log(`   cmp rax, 0`);
    console.log(`   je .L.fail.${label}`);
    console.log(`   cmp rdi, 0`);
    console.log(`   je .L.fail.${label}`);
    console.log(`   mov rax, 1`);
    console.log(`   jmp .L.finish.${label}`);
    console.log(`.L.fail.${label}:`);
    console.log(`   xor rax, rax`);
    console.log(`.L.finish.${label}:`);
}

function genLogicalOr() {
    var label = incLabel();
    console.log(`   cmp rax, 0`);
    console.log(`   je .L.step2.${label}`);
    console.log(`   mov rax, 1`);
    console.log(`   jmp .L.finish.${label}`);
    console.log(`.L.step2.${label}:`);
    console.log(`   cmp rdi, 0`);
    console.log(`   je .L.finish.${label}`);
    console.log(`   mov rax, 1`);
    console.log(`.L.finish.${label}:`);

}

function genBinary(operator: tokenType, datatype: Type) {

    console.log("   pop rdi");

    switch (operator) {
        case tokenType.divide:
            genDivide();
            break;
        case tokenType.multiply:
            genMultiply();
            break
        case tokenType.plus:
            genAdd(datatype);
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
        case tokenType.eq:
            genEq();
            break;
        case tokenType.lte:
            genLessEq();
            break;
        case tokenType.gte:
            genGreaterEq();
            break;
        case tokenType.neq:
            genNotEq();
            break;
        case tokenType.bitnot:
            genBitNot();
            break;
        case tokenType.bitand:
            genBitAnd();
            break;
        case tokenType.bitxor:
            genBitXor();
            break;
        case tokenType.bitor:
            genBitOr();
            break;
        case tokenType.and:
            genLogicalAnd();
            break
        case tokenType.or:
            genLogicalOr();
            break;
        default:
            throw new error("unhandled operator");
    }
}

function genUnary(operator: Token) {
    switch (operator.type) {
        case tokenType.minus:
            genNegate();
            break;
        case tokenType.bitnot:
            genBitNot();
            break;
    }
}

function genNumber(expr: Expression) {
    if (expr.datatype === f32) {
        //console.log("sub rsp, 8");
        //console.log(`movq [rsp], ${expr.val}`)
    } else {
        console.log("   mov rax, " + expr.val);
    }

}

function load(datatype: Type) {
    if (datatype.size === 1) {
        console.log("   movsx rax, byte ptr [rax]");
    } else if (datatype.size === 2) {
        console.log("   movsx rax, word ptr [rax]");
    } else if (datatype.size === 4) {
        if (datatype === f32) {
            console.log("   movss xmm0, dword ptr [rax]");
        } else {
            console.log("   movsxd rax, dword ptr [rax]");
        }
    } else if (datatype.size === 8) {
        console.log("   mov rax, [rax]");
    } else if (datatype.kind === myType.slice) {
        console.error("Invalid load");
        process.exit(1);
    } else {
        console.error("Invalid load");
        process.exit(1);
    }

}

function store(datatype: Type) {

    console.log("   pop rdi");
    //console.log("   pop rax");

    if (datatype.size === 1) {
        console.log("   mov [rdi], al");
    } else if (datatype.size === 2) {
        console.log("   mov [rdi], ax");
    } else if (datatype.size === 4) {
        if (datatype === f32) {
            console.log("   movss [rdi], xmm0");
        } else {
            console.log("   mov [rdi], eax");
        }
    } else {
        if (datatype.size !== 8) {
            console.log("Invalid store");
            process.exit(1);
        }
        console.log("   mov [rdi], rax");
    }
}

function genAddress(stmt: Statement | Expression) {
    console.log("   lea rax, [rbp-" + (stmt.datatype.size + stmt.offset) + "]");
}

function generateAddress(expr: Expression | Statement) {
    switch (expr.type) {
        case exprType.identifier:
            if (expr.is_glob) {
                console.log("   push offset " + expr.name);
                pop("rax");
            } else {
                genAddress(expr);
            }
            break;
        case exprType.get:
            generateAddress(expr.left as Expression);
            console.log("   add rax, " + expr.offset);
            break;

        case exprType.deref:
            generateCode(expr.left as Expression);
            break;

        default:
            console.error("not an lvalue");
            process.exit(1);
    }
}

function genLvalue(expr: Expression | Statement) {
    if (expr.datatype.kind === myType.array) {
        console.error("not an lvalue");
        process.exit(1);
    }
    generateAddress(expr);
}

function generateCode(expr: Expression) {
    switch (expr.type) {
        case exprType.address:
            generateAddress(expr.left as Expression);
            break;
        case exprType.get:
            generateAddress(expr);
            if (expr.datatype.kind !== myType.array) {
                load(expr.datatype);
            }
            break;
        case exprType.binary:
            generateCode(expr.right as Expression);
            push();
            generateCode(expr.left as Expression);
            genBinary(expr.operator?.type as tokenType, expr.datatype);
            break;
        case exprType.deref:
            generateCode(expr.left as Expression);
            if (expr.datatype.kind !== myType.array) {
                load(expr.datatype);
            }
            break;
        case exprType.unary:
            generateCode(expr.right as Expression);
            genUnary(expr.operator as Token);
            break;
        case exprType.number:
            genNumber(expr);
            break;
        case exprType.grouping:
            generateCode(expr.left as Expression);
            break;
        case exprType.assign:
            switch (expr.datatype.kind) {
                case myType.slice:
                    for(let item of expr.defaults) {
                        generateCode(item);
                    }
                    break
                default:
                    genLvalue(expr.left as Expression);
                    push();
                    generateCode(expr.right as Expression);
                    store(expr.left?.datatype as Type);
            }
            break;
        case exprType.identifier:
            generateAddress(expr);
            if (expr.datatype.kind !== myType.array) {
                load(expr.datatype);
            }
            break;
        case exprType.call:
            expr.params.forEach((p) => {
                generateCode(p);
                push();
            });

            for (let i = expr.params.length - 1; i >= 0; i--) {
                pop(argRegisters[i]);
                //console.log(`movsx  ${argRegisters[i]}, ${dwordArgRegisters[i]}`);

            }

            if (expr.fntype === fnType.extern) {
                console.log("   lea r15, " + expr.callee.name);
                console.log("   call buitin_glibc_caller");
            } else {
                console.log("   call " + expr.callee.name);
            }
            break;
        case exprType.string:
            //genString(expr.name);
            console.log(`   lea rax, .L.data.${expr.label}`);
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


function genStmt(stmt: Statement, fnid: number): void {
    switch (stmt.type) {
        case stmtType.exprstmt:
            generateCode(stmt.expr);
            break;
        case stmtType.vardeclstmt:
            if (stmt.expr.datatype.kind === myType.slice) {
                if (stmt.defaults) {
                    for (let item of stmt.defaults) { generateCode(item); }
                }
            } else if (stmt.expr.datatype.kind == myType.array) {
                // for(let item of stmt.datatype.members) {
                //     if(item.default) {
                //         
                //     }
                // }
            } else {
                genAddress(stmt);
                push();
                generateCode(stmt.expr);
                store(stmt.expr.datatype);
            }
            break;
        case stmtType.block:
            stmt.stmts.forEach((s, i) => { genStmt(s, fnid); })
            break
        case stmtType.ifStmt:
            var labeloffset = incLabel();
            generateCode(stmt.cond);
            console.log("   cmp rax, 0");
            console.log("   je .L.else." + labeloffset);
            genStmt(stmt.then, fnid);
            console.log("   jmp .L.end." + labeloffset);
            console.log(".L.else." + labeloffset + ":");
            if (stmt.else_) {
                genStmt(stmt.else_, fnid);
            }
            console.log(".L.end." + labeloffset + ":");
            break;
        case stmtType.whileStmt:
            var labeloffset = incLabel();
            latestBreakLabel = ".L.break." + labeloffset;
            latestContinueLabel = ".L.continue." + labeloffset;
            console.log(".L.continue." + labeloffset + ":");
            generateCode(stmt.cond);
            console.log("   cmp rax, 0");
            console.log("   je .L.break." + labeloffset);
            genStmt(stmt.then, fnid);
            console.log("   jmp .L.continue." + labeloffset);
            console.log(".L.break." + labeloffset + ":");
            break;
        case stmtType.braek:
            if (latestBreakLabel === "") throw new Error("Stray break");
            console.log("   jmp " + latestBreakLabel);
            break;
        case stmtType.contineu:
            if (latestContinueLabel === "") throw new Error("Stray continue");
            console.log("   jmp " + latestContinueLabel);
            break;
        case stmtType.ret:
            generateCode(stmt.expr);
            console.log(`   jmp .L.endfn.${fnid}`);
            break;
        default: break;
    }

}

function genGlobalStrings(globs: { value: string }[]): number {
    console.log(".intel_syntax noprefix");
    console.log(".data");
    var loffset = 0;
    globs.forEach((glob, i) => {
        console.log(".align 1");
        console.log(".L.data." + i + ":");
        for (let i = 0; i < glob.value.length; i++) {
            console.log("   .byte '" + glob.value[i] + "'");
        }
        console.log("   .byte " + 0);
        loffset = i;
    })

    return loffset + 1;
}

function genText(fns: Function[]) {
    console.log(".text");
    var i = incLabel();
    fns.forEach((fn) => {
        if (fn.type === fnType.native) {
            console.log(".global " + fn.name);
            console.log(fn.name + ":");
            console.log("   push rbp");
            console.log("   mov rbp, rsp");
            console.log("   sub rsp, " + alignTo(8, fn.localOffset));

            //genArgs(fn.params);

            genStmt(fn.body, 0);
            console.log("   xor rax, rax");
            console.log(`.L.endfn.${i}:`);
            console.log("   mov rsp, rbp");
            console.log("   pop rbp");
            console.log("   ret");
            console.log("")
        }
    })
}

function genGlobals(globals: { name: string, value: Expression | undefined, datatype: Type }[]) {
    globals.forEach((g) => {
        if (g.value) {

            console.log(".align " + g.datatype.align);
            console.log(g.name + ":");

            // if (g.value.labelinitialize) {
            //     console.log(`   .quad ${g.value.bytes.length}`);
            //     console.log("   .quad .L.data." + g.value.label);
            //     return;
            // }

            if (g.datatype.kind === myType.slice) {
                console.log(`   .quad ${g.value.bytes.length}`);
                console.log("   .quad .L.data." + g.value.label);
                return;
            }

            if (g.value.datatype.size === 1) {
                console.log("   .byte " + g.value.val);
            } else {
                console.log("   ." + g.value.datatype.size + "byte " + g.value.val);
            }
        }
    });

    console.log(".bss");

    globals.forEach((g) => {
        if (g.value === undefined) {

            console.log(".align " + g.datatype.align);
            console.log(g.name + ":");
            console.log("   .zero " + g.datatype.size);
        }
    });
}

export function genStart(
    globstrings: { value: string }[],
    globals: { name: string, value: Expression | undefined, datatype: Type }[],
    fns: Function[]
) {
    var offset = genGlobalStrings(globstrings);
    genGlobals(globals);
    genText(fns);
    genAlignedCall();
}

