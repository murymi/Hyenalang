import { Token, tokenType } from "./token";
import { Expression, identifierType, rangeType } from "./expr";
import { exprType } from "./expr";
import { Statement, stmtType } from "./stmt";
import { Variable, fnType } from "./main";
import { Function } from "./main";
import { count, error } from "console";
import { Type, alignTo, f32, myType, u64, u8, voidtype } from "./type";
import { tokenError } from "./parser";


var continueLabels:string []= [];
var breakLabels:string[] = [];

function pushLabels(cont:string, br:string) {
    continueLabels.push(cont);
    breakLabels.push(br);
}

function popLabels() {
    continueLabels.pop();
    breakLabels.pop();
}

function breakLabel() {
    return breakLabels[breakLabels.length-1];
}

function continueLable (){
    return continueLabels[breakLabels.length-1];
}

var defers: Statement[] = [];

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
            console.error(operator)
            throw new Error("unhandled operator");
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
        console.log(`   mov cl, [rax+${copied}]`);
        console.log(`   mov [rdi+${copied}], cl`);
        copied += 1;
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
        case exprType.deref_index:
        case exprType.deref:
            generateCode(expr.left as Expression);
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
        case exprType.assigned_for_use:
            generateCode(expr);
            break;
        case exprType.grouping:
            generateAddress(expr.left as Expression);
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
        if ((s.data_type.kind === myType.struct || s.data_type.kind === myType.tuple) && s.value.isLiteral()) {
            assignLit(s.field_offset + offset, s.value);
        } else if (s.data_type.kind === myType.array && s.value.isLiteral()) {
            pop("rdi");
            console.log("   push rdi");
            console.log(`   mov qword ptr [rdi+${s.field_offset + offset}], ${s.value.datatype.arrayLen}`);
            assignLit(s.field_offset + offset + 8, s.value);
        } else {

            if(s.value.type === exprType.undefnd) return;

            pop("rdi");
            console.log("   push rdi");
            console.log(`   add rdi, ${s.field_offset + offset}`);
            console.log("   push rdi");
            if (s.data_type.size > 8) {
                if (s.value.type === exprType.call) {
                    //console.log("# ====call found=====");
                    //console.log("pop r14");
                    s.value.call_in_lit = true;
                    generateCode(s.value);
                } else if(s.value.type === exprType.slice_array) {
                    generateCode(s.value.left as Expression);
                    console.log("   mov rdx, rax");
                    push();
                    generateCode(s.value.right as Expression);
                    pop("rdi");
                    genSubtract();
                    console.log("   mov rcx, rax");
                    pop("rax");
                    console.log("   mov [rax], rcx");
                    console.log("   add rax, 8");
                    push();
                    generateAddress(s.value.id);
                    console.log("   add rax, 8");
                    console.log(`   imul rdx, ${s.value.datatype.base.size}`)
                    console.log("   add rax, rdx");
                    pop("rdi");
                    console.log("   mov [rdi], rax");
                } else if(s.value.type === exprType.slice_slice) {
                    generateCode(s.value.left as Expression);
                    console.log("   mov rdx, rax");
                    push();
                    generateCode(s.value.right as Expression);
                    pop("rdi");
                    genSubtract();
                    console.log("   mov rcx, rax");
                    pop("rax");
                    console.log("   mov [rax], rcx");
                    console.log("   add rax, 8");
                    push();
                    generateAddress(s.value.id);
                    console.log("   add rax, 8");
                    console.log("   mov rax, [rax]");
                    console.log(`   imul rdx, ${s.value.datatype.base.size}`)
                    console.log("   add rax, rdx");
                    pop("rdi");
                    console.log("   mov [rdi], rax");
                } else{
                    generateAddress(s.value);
                    storeStruct(s.data_type);
                }
            } else {
                generateCode(s.value);
                store(s.data_type);
            }
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
    console.log(`   mov qword ptr [rax], ${expr.left?.datatype.arrayLen}`);
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
    if (expr.right?.type === exprType.assigned_for_use) {
        generateCode(expr.right.left as Expression);
        generateAddress(expr.right.right as Expression);
    } else {
        //console.error("====================", expr);
        generateAddress(expr.right as Expression);
    }
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
    console.log("   mov rdx, rax");
    push();
    generateCode(end);
    pop("rdi");
    genSubtract();
    console.log("   mov rcx, rax");
    v ? genAddress(to) : genLvalue(to);
    console.log("   mov [rax], rcx");
    console.log("   add rax, 8");
    push();
    generateAddress(from);
    console.log("   add rax, 8");
    console.log(`   imul rdx, ${to.datatype.members[1].type.base.size}`)
    console.log("   add rax, rdx");
    pop("rdi");
    console.log("   mov [rdi], rax");
}

function storeSliceFromSliceWithIndex(
    to: Expression,
    from: Expression,
    begin: Expression,
    end: Expression,
    v: boolean
) {
    generateCode(begin);
    console.log("   mov rdx, rax");
    push();
    generateCode(end);
    pop("rdi");
    genSubtract();
    console.log("   mov rcx, rax");
    v ? genAddress(to) : genLvalue(to);
    console.log("   mov [rax], rcx");
    console.log("   add rax, 8");
    push();
    generateAddress(from);
    console.log("   add rax, 8");
    console.log("   mov rax, [rax]");
    console.log(`   imul rdx, ${to.datatype.base.size}`)
    console.log("   add rax, rdx");
    pop("rdi");
    console.log("   mov [rdi], rax");

}

function assignSlice(expr: Expression) {
    switch (expr.right?.type) {
        case exprType.slice_array:
            storeSliceFromArrayWithIndex(
                expr.left as Expression,
                (expr.right as Expression).id,
                expr.right?.left as Expression,
                expr.right?.right as Expression, false
            )
            break;
        case exprType.slice_slice:
            storeSliceFromSliceWithIndex(
                expr.left as Expression,
                (expr.right as Expression).id,
                expr.right?.left as Expression,
                expr.right?.right as Expression, false
            )
            break;
        case exprType.assigned_for_use:
            var afu = expr.right;
            generateCode(afu.left as Expression);
            switch (afu.right?.type) {
                case exprType.slice_array:
                    storeSliceFromArrayWithIndex(
                        expr.left as Expression,
                        (afu.right as Expression).id,
                        afu.right?.left as Expression,
                        afu.right?.right as Expression, false
                    )
                    break;
                case exprType.slice_slice:
                    storeSliceFromSliceWithIndex(
                        expr.left as Expression,
                        (afu.right as Expression).id,
                        afu.right?.left as Expression,
                        afu.right?.right as Expression, false
                    )
                    break;
            }
            return;
        default:
            generateAddress(expr.left as Expression);
            push();
            generateAddress(expr.right as Expression);
            storeStruct(expr.left?.datatype as Type);
    }
}

function generateCode(expr: Expression) {
    switch (expr.type/**comment */) {
        case exprType.null:
            console.log("   mov rax, 0");
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
        case exprType.binary_op:
            generateCode(expr.right as Expression);
            push();
            generateCode(expr.left as Expression);
            genBinary(expr.operator?.type as tokenType, expr.datatype);
            break;
        case exprType.deref_index:
        case exprType.deref:
            // a.*
            generateCode(expr.left as Expression);
            //console.error(expr.datatype, "====================");
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
                default:
                    if (expr.datatype.size > 8) {
                        genAssignLarge(expr);
                    } else {
                        genAssign(expr);
                    }
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

            var arg_count = expr.params.length - 1;
            var arg_end = 0;
            if (expr.call_in_lit) {
                arg_count++;
                arg_end++;
            }

            expr.params.forEach((p) => {
                if (p.datatype.size > 8) {
                    generateAddress(p);
                } else {
                    generateCode(p);
                }
                //console.error(p.datatype.size);
                push();
            });

            //console.error(expr.params.length, "len");
            for (let i = arg_count; i >= arg_end; i--) {
                pop(argRegisters[i]);
            }

            if (expr.callee.datatype.fn_type === fnType.native) {
                pop("rax");
                if (expr.call_in_lit) pop("rdi");
                console.log("   call rax");
            } else {
                pop("r15");
                var label = incLabel();
                console.log(`   mov rax, rsp`);
                console.log(`   and rax, 15`);
                console.log(`   jnz .L.call.${label}`);
                console.log(`   xor rax, rax`);
                console.log(`   call r15`);
                console.log(`   jmp .L.end.${label}`);
                console.log(`.L.call.${label}:`)
                console.log(`   sub rsp, 8`);
                console.log(`   xor rax, rax`);
                console.log(`   call r15`);
                console.log(`   add rsp, 8`);
                console.log(`.L.end.${label}:`);
            }
            break;
        case exprType.string:
            console.log(`   lea rax, .L.data.strings.${expr.label}`);
            break;
        case exprType.anon_string:
            console.log(`   lea rax, .L.data.anon.${expr.offset}`);
            break;
        case exprType.assigned_for_use:
            generateCode(expr.left as Expression);//assign 
            generateCode(expr.right as Expression);// use
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
        case exprType.slice_array:
            assignSlice(expr);
            break;
        default:
            console.error(expr);
            throw new Error("Unexpected expression");
    }
}
function genStmt(stmt: Statement, fnid: number): void {
    switch (stmt.type) {
        case stmtType.exprstmt:
            generateCode(stmt.expr);
            break;
        case stmtType.vardeclstmt:
            generateCode(stmt.initializer as Expression);
            break;
        case stmtType.block:
            var found_defers = 0;
            stmt.stmts.forEach((s, i) => { 
                switch(s.type) {
                    case stmtType.defer_ph:
                        found_defers++;
                    break
                    case stmtType.braek:
                    case stmtType.contineu:
                    case stmtType.ret:
                        for (let i = stmt.defers.length-1; i > stmt.defers.length - found_defers - 1; i--) {
                            genStmt(stmt.defers[i], fnid);
                        }
                        genStmt(s, fnid);
                        break;
                    default:
                        genStmt(s, fnid);
                }
            })
            //console.error(found_defers);

            stmt.defers.forEach((d)=> {
                genStmt(d, fnid);
            })
            break
        case stmtType.ifStmt:
            var labeloffset = incLabel();
            if (stmt.initializer) {
                generateCode(stmt.initializer);
            }
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
            if(stmt.name !== "") {
                pushLabels(`.L.continue.${stmt.name}`,`.L.break.${stmt.name}`);
            } else {
                var labeloffset = incLabel();
                pushLabels(`.L.continue.${labeloffset}`,`.L.break.${labeloffset}`)
            }
            console.log(continueLable()+":");
            generateCode(stmt.cond);
            console.log("   cmp rax, 0");
            console.log(`   je ${breakLabel()}`);
            genStmt(stmt.then, fnid);
            console.log(`   jmp ${continueLable()}`);
            console.log(breakLabel()+":");
            popLabels();
            break;
        case stmtType.braek:
            if (breakLabels.length === 0) throw new Error("Stray break");
            if(stmt.name.length > 0) {
                console.log(`   jmp .L.break.${stmt.name}`);
            } else {
                console.log("   jmp " + breakLabel());
            }
            break;
        case stmtType.contineu:
            if (continueLabels.length === 0) throw new Error("Stray continue");
            if(stmt.name.length > 0) {
                console.log(`   jmp .L.continue.${stmt.name}`);
            } else {
                console.log("   jmp " + continueLable());
            }
            break;
        case stmtType.ret:
            if (stmt.expr.datatype === voidtype) {
                console.log(`   jmp .L.endfn.${fnid}`);
                return;
            }
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

            if (stmt.expr.type === exprType.array_literal) {
                //generateAddress(expr.left as Expression);
                console.log("   mov rax, [rbp-8]");
                console.log(`   mov qword ptr [rax], ${stmt.expr.datatype.arrayLen}`);
                console.log("   add rax, 8");
                push();
                assignLit(0, stmt.expr);
                console.log("   add rsp, 8");
                console.log("   mov rax, [rbp-8]");
                console.log(`   jmp .L.endfn.${fnid}`);
                return;
            }

            if (stmt.expr.type === exprType.struct_literal && stmt.expr.datatype.size > 8) {
                console.log("   mov rax, [rbp-8]");
                push();
                assignLit(0, stmt.expr);
                console.log("   add rsp, 8");
                console.log("   mov rax, [rbp-8]");
                console.log(`   jmp .L.endfn.${fnid}`);
                return;
            }

            if (stmt.expr.type === exprType.struct_literal) {
                console.log("   sub rsp, 8");
                console.log("   lea rax, [rbp-8]");
                push();
                assignLit(0, stmt.expr);
                console.log("   add rsp, 8");
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
                if (prong.capture) {
                    generateCode(prong.capture);
                }
                genStmt(prong, fnid);
                console.log(`   jmp .L.end.${label}`)
            });
            console.log(`.L.${label}.p.else:`)
            if (stmt.else_?.capture) {
                generateCode(stmt.else_.capture);
            }
            genStmt(stmt.else_ as Statement, fnid);
            console.log(`.L.end.${label}:`);
            break;
        case stmtType.intloop:
            var labeloffset = incLabel();

            stmt.loop_var_assigns.forEach((lpa) => {
                generateCode(lpa);
            })

            stmt.metadata.forEach((m) => {
                generateCode(m.range.left as Expression);
                console.log(`   mov [rbp-${m.counter.offset}], rax`)
            })

            if(stmt.name !== "") {
                pushLabels(`.L.continue.${stmt.name}`,`.L.break.${stmt.name}`);
            } else {
                var labeloffset = incLabel();
                pushLabels(`.L.continue.${labeloffset}`,`.L.break.${labeloffset}`)
            }
            console.log(`${continueLable()}:`);
            
            if(stmt.metadata[0].range_type === rangeType.slice || stmt.metadata[0].range_type === rangeType.array) {
                generateAddress(stmt.metadata[0].array_id as Expression);
                console.log("   mov rax, [rax]");
            } else {
                generateCode(stmt.metadata[0].range.right as Expression);
            }

            console.log("   dec rax");
            console.log(`   cmp [rbp-${stmt.metadata[0].counter.offset}], rax`)
            console.log(`   jge ${breakLabel()}`);

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
                        if((m.index_var as Variable).datatype.size > 8) {
                            storeStruct(m.index_var?.datatype as Type);
                        } else {
                            console.log("   mov rax, [rax]");
                            store(m.index_var?.datatype as Type);
                        }
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
                        if((m.index_var as Variable).datatype.size > 8) {
                            storeStruct(m.index_var?.datatype as Type);
                        } else {
                            console.log("   mov rax, [rax]");
                            store(m.index_var?.datatype as Type);
                        }
                    }
                }
            })
            genStmt(stmt.body, fnid);
            console.log(`   jmp ${continueLable()}`);
            console.log(`${breakLabel()}:`);
            popLabels();
            break;
        case stmtType.defer:
            //genStmt(stmt.then, fnid);
            //defers.push(stmt.then);
            break;
        case stmtType.enumdecl:
        case stmtType.structdecl:
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
            console.log(`   .byte ${glob.value.charCodeAt(i)} `);
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

function genArgs(params: { name: string, scope: number, datatype: Type, offset: number }[]) {
    let i = 0;
    for (let p of params) {
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
            if (fn.body) {
                genStmt(fn.body, i);
            }
            console.log(`.L.endfn.${i}:`);
            console.log("   mov rsp, rbp");
            console.log("   pop rbp");
            console.log("   ret");
            console.log("")
        }
    })
}

function isPtrForId(expr: Expression): boolean {
    if (expr.type === exprType.address) {
        if (expr.left?.type === exprType.identifier) {
            return true;
        }
    }

    if (expr.type === exprType.assigned_for_use) {
        return true;
    }

    return false;
}


function isConstExpr(expr: Expression) {
    return expr.datatype.isInteger() ||
     expr.isLiteral() || isPtrForId(expr) || expr.datatype.isString()
      || expr.type === exprType.undefnd || expr.datatype.kind === myType.enum;
}

function genGlobalLit(expr: Expression, data_type: Type) {
    switch (expr.type) {
        case exprType.array_literal:
            console.log(`   .quad ${expr.datatype.arrayLen}`);
            expr.setters.forEach((s) => {
                if (!isConstExpr(s.value)) {
                    tokenError("Expect const expression in array literal", s.token);
                }
                genGlobalLit(s.value, s.data_type);
            })
            break;
        case exprType.struct_literal:
            var i = 0;
            expr.setters.forEach((s) => {
                if (!isConstExpr(s.value)) {
                    tokenError("Expect const expression in struct literal", s.token);
                }
                console.log(`   .align ${expr.datatype.members[i].type.align}`);
                genGlobalLit(s.value, s.data_type);
                i++;
            })
            break;
        default:
            if (expr.type === exprType.undefnd) {
                console.log(`   .zero ${data_type.size}`);
                return;
            }

            if (data_type.kind === myType.slice && data_type.base === u8) {
                console.log(`   .quad ${expr.bytes.length}`)
                console.log(`   .quad offset .L.data.bytes.${expr.label} + 8`)
                return;
            }

            if (expr.datatype.isPtr()) {
                if (expr.type === exprType.assigned_for_use) {
                    console.log("   .quad " + expr.left?.left?.variable.name);
                } else {
                    console.log("   .quad " + expr.left?.variable.name);
                }
                return;
            }

            if (data_type.size === 1) {
                console.log(`   .byte ${expr.val}`);
            } else {
                console.log(`   .${data_type.size}byte ${expr.val}`);
            }
            break;
    }
}

function genGlobals(globals: Variable[]) {
    globals.forEach((g) => {
        if (g.initializer) {
            if (g.initializer.type === exprType.undefnd) return;
            if (g.initializer.datatype.kind === myType.void) {
                return;
            }
            console.log(".align " + g.datatype.align);
            console.log(g.name + ":");
            if (g.datatype.kind === myType.slice && g.datatype.base === u8) {
                console.log(`   .quad ${g.initializer.bytes.length}`)
                console.log(`   .quad offset .L.data.bytes.${g.initializer.label} + 8`)
                return;
            }

            if (g.datatype.kind === myType.array) {
                genGlobalLit(g.initializer, g.datatype);
                // console.log(`   .quad ${g.initializer.datatype.arrayLen}`);
                // g.initializer.setters.forEach((s) => {
                //     var base_size = g.initializer?.datatype.base.size;
                //     if(base_size === 1) {
                //         console.log(`   .byte ${s.value.val}`);
                //     } else {
                //         console.log(`   .${base_size}byte ${s.value.val}`);
                //     }
                // })
                return;
            }

            if (g.datatype.kind === myType.struct) {
                genGlobalLit(g.initializer, g.datatype);
                // var i = 0;
                // g.initializer.setters.forEach((s) => {
                //     if(s.value.type === exprType.undefnd) {
                //         console.log(`   .zero ${g.datatype.members[i].type.size}`);
                //     } else {
                //         console.log(`   .${g.datatype.members[i].type.size}byte ${s.value.val}`);
                //     }
                //     if (i < g.datatype.members.length - 1) { console.log(`   .align ${g.datatype.members[i + 1].type.align}`); }
                //     i++;
                // })
                return;
            }
            // to do
            if (g.datatype.isPtr()) {
                if (g.initializer.type === exprType.assigned_for_use) {
                    console.log("   .quad " + g.initializer.left?.left?.variable.name);
                } else {
                    console.log("   .quad " + g.initializer.left?.variable.name);
                }
                return
            }

            if (g.initializer.type === exprType.assigned_for_use) {
                return;
            }

            if (g.datatype.size === 1) {
                console.log("   .byte " + g.initializer.val);
            } else {
                console.log("   ." + g.datatype.size + "byte " + g.initializer.val);
            }
        }
    });

    console.log(".bss");
    globals.forEach((g) => {

        if (g.initializer?.type === exprType.undefnd) {
            console.log(".align " + g.datatype.align);
            console.log(g.name + ":");
            console.log("   .zero " + g.datatype.size);
            return;
        }

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
    console.log("   lea rcx, [rsp+8]");
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

