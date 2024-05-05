import { Token, tokenType } from "./token";
import { Expression, identifierType, rangeType } from "./expr";
import { exprType } from "./expr";
import { Statement, stmtType } from "./stmt";
import { Variable, fnType } from "./main";
import { Function } from "./main";
import { count, error } from "console";
import { Type, alignTo, f32, myType, u64 } from "./type";


var latestContinueLabel = "";
var latestBreakLabel = "";

var argRegisters = ["rdi", "rsi", "rdx", "rcx", "r8", "r9"];
var dwordArgRegisters = ["edi", "esi", "edx", "ecx", "r8d", "r9d"];
var wordArgRegisters = ["di", "si", "dx", "cx", "r8w", "r9w"];
var byteArgRegisters = ["dil", "sil", "dl", "cl", "r8b", "r9b"];

function getArgRegister(index: number, size: number): string {
    switch (size) {
        case 1: return byteArgRegisters[index];
        case 2: return wordArgRegisters[index];
        case 4: return dwordArgRegisters[index];
        case 8: return argRegisters[index];
        default:
            throw new Error(`inavlid size ${size}`);
    }
}

var l = 0;
function incLabel() {
    return l++;
}

function genDivide() {
    console.log("   cqo");
    console.log("   idiv rdi");
}

function genMod() {
    console.log("   cqo");
    console.log("   idiv rdi");
    console.log("   mov rax, rdx");
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

function genShifLeft() {
    var label = incLabel();
    console.log("   mov rcx, rdi");
    console.log(`.L.shl.${label}:`)
    console.log("   shl rax");
    console.log(`   loop .L.shl.${label}`);
}

function genShiftRight() {
    var label = incLabel();
    console.log("   mov rcx, rdi");
    console.log(`.L.shr.${label}:`)
    console.log("   shr rax");
    console.log(`   loop .L.shr.${label}`);
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
        case tokenType.mod:
            genMod();
            break;
        case tokenType.shl:
            genShifLeft();
            break;
        case tokenType.shr:
            genShiftRight();
            break;
        default:
            throw new error("unhandled operator");
    }
}

function genBang() {
    console.log("   cmp rax, 0");
    console.log("   sete al");
    console.log("   movzb rax, al");
}

function genUnary(operator: Token) {
    switch (operator.type) {
        case tokenType.minus:
            genNegate();
            break;
        case tokenType.bitnot:
            genBitNot();
            break;
        case tokenType.bang:
            genBang();
            break;
    }
}

function genNumber(expr: Expression) {
        console.log("   mov rax, " + expr.val);
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
        console.error(datatype);
        console.error("Invalidx load");
        process.exit(1);
    }
}

function store(datatype: Type) {
    console.log("   pop rdi");
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
    } else if (datatype.size === 8) {
        console.log("   mov [rdi], rax");
    } else {
        console.error(datatype);
        console.error("Invalid store", datatype.size);
        process.exit(1);
    }
}

function storeStruct(datatype: Type) {
    var copied = 0;
    console.log("   pop rdi");
    // todo: use simd
    while (copied < datatype.size) {
        console.log(`   movq rcx, [rax+${copied}]`);
        console.log(`   movq [rdi+${copied}], rcx`);
        copied += 8;
    }
}


function genAddress(expr: Expression) {
    console.log(`   lea rax, [rbp-${expr.variable.offset}]`)
}

function generateAddress(expr: Expression | Statement) {
    switch (expr.type /** */) {
        case exprType.identifier:
            if (expr.variable.is_global) {
                console.log("   push offset " + expr.variable.name);
                pop("rax");
            } else {
                genAddress(expr)
            }
            break;
        case exprType.fn_identifier:
            generateCode(expr);
            break;
        case exprType.get:
            generateAddress(expr.left as Expression);
            console.log("   add rax, " + expr.offset);
            break;
        case exprType.deref_slice_index:
        case exprType.deref_array_index:
        case exprType.deref:
            generateCode(expr.left as Expression);
            break;
        case exprType.decl_anon_for_get:
            generateCode(expr.left as Expression);
            generateAddress(expr.right as Expression);
            break;
        case exprType.call:
            // for struct only
            generateCode(expr);
            break
        case exprType.anon_string:
            generateCode(expr);
            break;
        case exprType.string:
            generateCode(expr);
            break;
        case exprType.if_expr:
            generateCode(expr);
            break;
        default:
            console.error(expr);
            console.error("not an lvalue");
            process.exit(1);
    }
}

function genLvalue(expr: Expression | Statement) {
    if (expr.datatype.kind === myType.array) {
        console.error("not an llvalue");
        process.exit(1);
    }
    generateAddress(expr);
}

function assignLit(offset: number, expr: Expression) {
    expr.setters.forEach((s) => {
        if (s.data_type.kind === myType.struct) {
            assignLit(s.field_offset + offset, s.value);
        } else if (s.data_type.kind === myType.array) {
            assignLit(s.field_offset + offset, s.value);
        } else {
            pop("rdi");
            console.log("   push rdi");
            console.log(`   add rdi, ${s.field_offset + offset}`);
            console.log("   push rdi");
            generateCode(s.value);
            store(s.data_type);
        }
    }
    )
}

function genAssignStructLiteral(expr: Expression) {
    generateAddress(expr.left as Expression);
    push();
    assignLit(0, expr.right as Expression);
    console.log("   add rsp, 8");
}


function assignArrayLiteral(expr: Expression) {
    generateAddress(expr.left as Expression);
    console.log("   add rax, 8");
    push();
    assignLit(0, expr.right as Expression);
    console.log("   add rsp, 8");
}

function genAssign(expr: Expression) {
    if (expr.right?.type === exprType.struct_literal) {
        return genAssignStructLiteral(expr)
    } else if (expr.right?.type === exprType.array_literal) {
        return assignArrayLiteral(expr)
    }
    generateAddress(expr.left as Expression);
    push();
    generateCode(expr.right as Expression);
    store(expr.left?.datatype as Type);
}

function genAssignLarge(expr: Expression) {
    if (expr.right?.type === exprType.struct_literal) {
        return genAssignStructLiteral(expr)
    } else if (expr.right?.type === exprType.array_literal) {
        return assignArrayLiteral(expr)
    }
    generateAddress(expr.left as Expression);
    push();
    generateAddress(expr.right as Expression);
    storeStruct(expr.left?.datatype as Type);
}

function storeSliceFromArrayWithIndex(
    to: Expression,
    from: Expression,
    begin: Expression,
    end: Expression,
    v: boolean
) {
    generateCode(begin);
    console.log("mov rdx, rax");
    push();
    generateCode(end);
    pop("rdi");
    genSubtract();
    console.log("mov rcx, rax");
    v ? genAddress(to) : genLvalue(to);
    console.log("mov [rax], rcx");
    console.log("add rax, 8");
    push();
    generateAddress(from);
    console.log("add rax, 8");
    console.log(`imul rdx, ${to.datatype.members[1].type.base.size}`)
    console.log("add rax, rdx");
    pop("rdi");
    console.log("mov [rdi], rax");
}

function storeSliceFromSliceWithIndex(
    to: Expression,
    from: Expression,
    begin: Expression,
    end: Expression,
    v: boolean
) {
    generateCode(begin);
    console.log("mov rdx, rax");
    push();
    generateCode(end);
    pop("rdi");
    genSubtract();
    console.log("mov rcx, rax");
    v ? genAddress(to) : genLvalue(to);
    console.log("mov [rax], rcx");
    console.log("add rax, 8");
    push();
    generateAddress(from);
    console.log("add rax, 8");
    console.log("mov rax, [rax]");
    console.log(`imul rdx, ${to.datatype.base.size}`)
    console.log("add rax, rdx");
    pop("rdi");
    console.log("mov [rdi], rax");

}

function assignSlice(expr: Expression) {
    switch (expr.right?.type) {
        case exprType.slice_array:
            storeSliceFromArrayWithIndex(
                expr.left as Expression,
                (expr.right as Expression).id,
                (expr.right as Expression).left as Expression,
                (expr.right as Expression).right as Expression, false
            )
            break;
        case exprType.slice_slice:
            storeSliceFromSliceWithIndex(
                expr.left as Expression,
                (expr.right as Expression).id,
                (expr.right as Expression).left as Expression,
                (expr.right as Expression).right as Expression, false
            )
            break;
        default:
            genAddress(expr.left as Expression);
            push();
            generateAddress(expr.right as Expression);
            storeStruct(expr.left?.datatype as Type);
    }
}

function generateCode(expr: Expression) {
    switch (expr.type/**comment */) {
        case exprType.null:
            console.log("mov rax, 0");
            break;
        case exprType.address:
            generateAddress(expr.left as Expression);
            break;
        case exprType.get:
            generateAddress(expr);
            // b.c
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
        case exprType.deref_slice_index:
        case exprType.deref_array_index:
        case exprType.deref:
            // a.*
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
        case exprType.varslice:
            for (let item of expr.defaults) {
                generateCode(item);
            }
            break;
        case exprType.assign_slice_index:
        case exprType.assign_array_index:
        case exprType.assignIndex:
            console.error(expr.datatype)
            if (expr.datatype.size > 8) {
                genAssignLarge(expr);
            } else {
                genAssign(expr);
            }
            break;
        case exprType.assign:
            if (expr.right?.type === exprType.undefnd) {
                if (expr.datatype.kind === myType.array) {
                    generateAddress(expr.left as Expression);
                    push();
                    generateCode(expr.datatype.members[0].default as Expression);
                    store(u64);
                }
                return;
            }
            if (expr.right?.type === exprType.call && expr.right.datatype.size > 8) {
                generateCode(expr.right as Expression);
                return;
            }
            switch (expr.datatype.kind) {
                case myType.slice:
                    assignSlice(expr);
                    break;
                case myType.string:
                    assignSlice(expr);
                    break;
                case myType.struct:
                    if (expr.datatype.size > 8) {
                        genAssignLarge(expr);
                    } else {
                        genAssign(expr);
                    }
                    break;
                case myType.array:
                    if (expr.datatype.size > 8) {
                        genAssignLarge(expr);
                    } else {
                        genAssign(expr);
                    }
                    break;
                default:
                    genAssign(expr);
            }
            break;
        case exprType.identifier:
            generateAddress(expr);
            if (expr.datatype.kind !== myType.array) {
                load(expr.datatype);
            }
            break;
        case exprType.undefnd:
            console.log("   xor rax, rax #undefined");
            break;
        case exprType.call:
            generateCode(expr.callee);
            push();
            expr.params.forEach((p) => {
                if (p.datatype.size > 8) {
                    generateAddress(p);
                } else {
                    generateCode(p);
                }
                push();
            });
            for (let i = expr.params.length - 1; i >= 0; i--) {
                pop(argRegisters[i]);
            }
            if (expr.fntype === fnType.extern) {
                console.log("   lea r15, " + expr.callee.name);
                console.log("   call buitin_glibc_caller");
            } else {
                pop("rax");
                console.log("   call rax");
            }
            break;
        case exprType.string:
            console.log(`   lea rax, .L.data.strings.${expr.label}`);
            break;
        case exprType.anon_string:
            console.log(`   lea rax, .L.data.anon.${expr.offset}`);
            break;
        case exprType.decl_anon_for_get:
            generateCode(expr.left as Expression);
            generateCode(expr.right as Expression);
            break;
        case exprType.fn_identifier:
            console.log(`   lea rax, [${expr.name}]`);
            break;
        case exprType.if_expr:
            var label = incLabel();
            generateCode(expr.cond);
            console.log("cmp rax, 0");
            console.log(`jz .L.else.${label}`);
            console.log(`.L.if.${label}:`);
            generateCode(expr.left as Expression);
            console.log(`jmp .L.endif.${label}`);
            console.log(`.L.else.${label}:`);
            generateCode(expr.right as Expression);
            console.log(`.L.endif.${label}:`);
            break;
        case exprType.struct_literal:
            break;
        default:
            console.error(expr);
            throw new Error("Unexpected expression");
    }
}
function genStmt(stmt: Statement, fnid: number): void {
    //console.error(stmt);
    switch (stmt.type) {
        case stmtType.exprstmt:
            generateCode(stmt.expr);
            break;
        case stmtType.vardeclstmt:
            generateCode(stmt.initializer as Expression);
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
            if (stmt.expr.datatype.kind === myType.string) {
                //console.error(stmt.expr.datatype);
                console.log("   mov rax, [rbp-8]");
                push();
                generateCode(stmt.expr);
                pop("rdi");
                console.log("   mov rcx, [rax]");
                console.log("   mov [rdi], rcx");
                console.log("   lea rcx, [rax + 8]");
                console.log("   mov [rdi+8], rcx");
                console.log("   mov rax, [rbp-8]");
                console.log(`   jmp .L.endfn.${fnid}`);
                return;
            }

            if (stmt.expr.datatype.size > 8) {
                console.log("   mov rax, [rbp-8]");
                push();
                generateAddress(stmt.expr);
                storeStruct(stmt.expr.datatype);
            } else {
                generateCode(stmt.expr);
            }
            console.log(`   jmp .L.endfn.${fnid}`);
            break;
        case stmtType.inline_asm:
            console.log("# [inline asm]");
            stmt.asm_lines.forEach((l) => {
                console.log(`   ${l}`);
            })
            console.log("# [end]");
            break;
        case stmtType.module:
            stmt.stmts.forEach((s, i) => { genStmt(s, fnid); })
            break;
        case stmtType.switch:
            var label = incLabel();
            generateCode(stmt.cond);
            console.error(stmt.cases);
            stmt.cases.forEach((cas) => {
                switch (cas.left?.type) {
                    case exprType.number:
                        console.log(`   cmp rax, ${cas.left?.val}`);
                        console.log(`   je .L.${label}.p.${cas.prong}`);
                        break;
                    case exprType.range:
                        console.log(`cmp rax, ${cas.left.left?.val}`);
                        console.log(`jl .L.${label}.p.else`);
                        console.log(`cmp rax, ${cas.left.right?.val}`);
                        console.log(`jg .L.${label}.p.else`);
                        console.log(`jmp jmp .L.${label}.p.${cas.prong}`);
                        break;
                }
            });
            console.log(`   jmp .L.${label}.p.else`);
            stmt.prongs.forEach((prong, i) => {
                console.log(`.L.${label}.p.${i}:`);
                genStmt(prong, fnid);
                console.log(`   jmp .L.end.${label}`)
            });
            console.log(`.L.${label}.p.else:`)
            genStmt(stmt.else_ as Statement, fnid);
            console.log(`.L.end.${label}:`);
            break;
        case stmtType.intloop:
            var labeloffset = incLabel();

            stmt.metadata.forEach((m) => {
                generateCode(m.range.left as Expression);
                console.log(`   mov [rbp-${m.counter.offset}], rax`)
            })

            latestBreakLabel = ".L.break." + labeloffset;
            latestContinueLabel = ".L.continue." + labeloffset;
            console.log(".L.continue." + labeloffset + ":");
            stmt.metadata.forEach((m) => {
                console.log(`   inc qword ptr [rbp-${m.counter.offset}]`);
                if (m.range_type === rangeType.array) {
                    console.log(`   lea rax, [rbp-${m.index_var?.offset}]`);
                    push();
                    generateAddress(m.array_id as Expression);
                    console.log(`   mov rdi, qword ptr [rbp-${m.counter.offset}]`);
                    console.log(`   imul rdi, ${m.array_id?.datatype.base.size}`);
                    console.log(`   add rdi, 8`);
                    console.log(`   add rax, rdi`);
                    if (m.ptr) {
                        pop("rdi");
                        console.log("   mov [rdi], rax");
                    } else {
                        store(m.index_var?.datatype as Type);
                    }
                } else if (m.range_type === rangeType.slice) {
                    console.log(`   lea rax, [rbp-${m.index_var?.offset}]`);
                    push();
                    generateAddress(m.array_id as Expression);
                    console.log("   add rax, 8");
                    console.log("   mov rax, [rax]");
                    console.log(`   mov rdi, qword ptr [rbp-${m.counter.offset}]`);
                    console.log(`   imul rdi, ${m.array_id?.datatype.base.size}`);
                    console.log(`   add rax, rdi`);
                    if (m.ptr) {
                        pop("rdi");
                        console.log("   mov [rdi], rax");
                    } else {
                        store(m.index_var?.datatype as Type);
                    }
                }
            })
            genStmt(stmt.body, fnid);
            if (stmt.metadata[0].range_type !== rangeType.slice) {
                generateCode(stmt.metadata[0].range.right as Expression);
            } else {
                generateAddress(stmt.metadata[0].array_id as Expression);
                console.log("   mov rax, [rax]");
            }
            console.log(`   cmp [rbp-${stmt.metadata[0].counter.offset}], rax`)
            console.log("   jge .L.break." + labeloffset);
            console.log("   jmp .L.continue." + labeloffset);
            console.log(".L.break." + labeloffset + ":");
            break;
        default:
            throw new Error("unhandled statement");
    }

}

function genGlobalStrings(globs: { value: string }[]): number {
    console.log(".data");
    var loffset = 0;
    globs.forEach((glob, i) => {
        //console.log(".align 1");
        console.log(`.align 8`);
        console.log(".L.data.bytes." + i + ":");
        console.log(`   .quad ${glob.value.length}`);
        for (let i = 0; i < glob.value.length; i++) {
            console.log(`   .byte 0x${glob.value.charCodeAt(i).toString(16)} `);
        }
        console.log("   .byte " + 0);
        loffset = i;
        console.log(`.align 8`);
        console.log(`.L.data.strings.${i}:`);
        console.log(`   .quad ${glob.value.length}`);
        //console.log(`   .quad .L.data.${i}`);
        console.log(`   .quad offset .L.data.bytes.${i} + 8`)

    })

    return loffset + 1;
}


function genArgs(
    params: { name: string, scope: number, datatype: Type, offset: number }[]
) {
    let i = 0;
    for (let p of params) {
        // if(i < params.length - arity) {
        //     console.log(`   mov ${getArgRegister(i, p.datatype.size)}, [${getArgRegister(i, p.datatype.size)}]`)
        // }
        console.log(`   mov [rbp-${p.offset}], ${getArgRegister(i, p.datatype.size)}`);
        i++;
    }
}

function genText(fns: Function[]) {
    console.log(".text");
    fns.forEach((fn) => {
        var i = incLabel();
        if (fn.type === fnType.native) {
            console.log(".global " + fn.name);
            console.log(fn.name + ":");
            console.log("   push rbp");
            console.log("   mov rbp, rsp");
            console.log("   sub rsp, " + alignTo(8, fn.localOffset));
            genArgs(fn.locals.slice(0, fn.impilicit_arity));
            genStmt(fn.body, i);
            //console.log("   xor rax, rax");
            console.log(`.L.endfn.${i}:`);
            console.log("   mov rsp, rbp");
            console.log("   pop rbp");
            console.log("   ret");
            console.log("")
        }
    })
}

function genGlobals(globals: Variable[]) {
    globals.forEach((g) => {
        if (g.initializer) {

            if (g.initializer.type === exprType.undefnd) return;

            console.log(".align " + g.datatype.align);
            console.log(g.name + ":");

            // if (g.datatype.kind === myType.array && g.value.datatype === undefined) {
            //     console.log(`   .quad ${g.datatype.members[1].type.size}`);
            //     console.log(`   .zero ${g.datatype.members[1].type.size}`);
            //     return;
            // }

            // if (g.datatype.kind === myType.slice) {
            //     console.log(`   .quad ${g.value.bytes.length}`);
            //     console.log("   .quad .L.data." + g.value.label);
            //     return;
            // }

            if (g.datatype.kind === myType.slice) {
                console.log(`   .quad ${g.initializer.bytes.length}`)
                console.log(`   .quad offset .L.data.strings.${g.initializer.label} + 8`)
                return;
            }

            if (g.initializer.datatype.size === 1) {
                console.log("   .byte " + g.initializer.right?.val);
            } else {
                console.log("   ." + g.initializer.datatype.size + "byte " + g.initializer.right?.val);
            }
        }
    });

    console.log(".bss");

    globals.forEach((g) => {

        console.error(g);
        if (g.initializer === undefined) {

            console.log(".align " + g.datatype.align);
            console.log(g.name + ":");
            console.log("   .zero " + g.datatype.size);
        }
    });
}

function genAnonStrings(anons: { value: Expression }[]) {
    anons.forEach((item, i) => {
        console.log(".align 8");
        console.log(`.L.data.anon.${i}:`);
        console.log(`   .quad ${item.value.bytes.length}`);
        console.log(`   .quad offset .L.data.strings.${item.value.label} + 8`)
    })
}


function genEntry() {
    console.log(".data");
    console.log(".align 8");
    console.log("__argc__: .quad 0");
    console.log("__argv__: .quad 0");
    console.log(".text");
    console.log("")
    console.log(".global _start");
    console.log("_start:");
    console.log("   mov rax, [rsp]");
    console.log("   mov rcx, [rsp+8]");
    console.log("   mov [__argc__], rax");
    console.log("   mov [__argv__], rcx");
    console.log("   call main");
    console.log("   mov rdi, rax");
    console.log("   mov rax, 60");
    console.log("   syscall");
}

export function genStart(
    globstrings: { value: string }[],
    globals: Variable[],
    anons: { value: Expression }[],
    fns: Function[]
) {
    console.log(".intel_syntax noprefix");
    var offset = genGlobalStrings(globstrings);
    genAnonStrings(anons);
    genGlobals(globals);
    genEntry();
    genText(fns);
}

