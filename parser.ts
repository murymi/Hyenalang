import { Token, colors } from "./token";
import { tokenType } from "./token";
import { Expression, rangeType } from "./expr";
import { exprType } from "./expr";
import { Statement, stmtType } from "./stmt";
import {
    Variable,
    beginScope,
    compile,
    endScope,
    fnType,
    getLocalOffset,
    getcurrFn,
    incLocalOffset,
    isResolutionPass,
    pushFunction,
    resetCurrentFunction,
    setCurrentFuction
} from "./main";
import { Type, alignTo, argv, bool, f32, getEnum, getOffsetOfMember, i16, i32, i64, i8, myType, popModule, pushEnum, pushModule, pushStructType, searchStruct, self_ref, u16, u32, u64, u8, voidtype } from "./type";
import { relative } from "node:path";
import { cwd } from "node:process";


export function tokenError(message: string, token: Token): void {
    console.error(`${colors.yellow + relative(cwd(), token.file_name) + colors.green}:${token.line}:${token.col} ${colors.red + message} '${token.value}'${colors.reset} `);
    console.table(isResolutionPass());
    process.exit();
}

export class Parser {
    tokens: Token[];
    current: number;

    match(types: tokenType[]): boolean {
        for (let T of types) {
            if (this.check(T)) {
                this.advance();
                return true;
            }
        }
        return false;
    }

    advance(): Token {
        if (this.moreTokens()) this.current++;
        return this.previous();
    }

    check(type: tokenType): boolean {
        if (!this.moreTokens()) return false;
        return this.peek().type === type;
    }

    moreTokens(): boolean { return this.peek().type != tokenType.eof; }

    peek(): Token { return this.tokens[this.current]; }

    previous(): Token { return this.tokens[this.current - 1]; }

    expect(type, name): Token {
        if (this.peek().type !== type) {
            console.error(isResolutionPass());
            tokenError("Expected " + name + " found ", this.peek());
        }
        return this.advance();
    }

    getTempPos(templates: string[], char: string): number {
        let j = 0;
        for (let i of templates) {
            if (i === char) return j;
            j++;
        }
        return -20;
    }

    replaceTokens(tokens: Token[], old: string, nu: string) {
        tokens.forEach((tok) => {
            if (tok.value === old) {
                tok.value = nu;
            }
        })
    }

    cloneTokens(tokens: Token[]) {
        var toks: Token[] = [];
        for (let i of tokens) {
            toks.push(i.clone());
        }
        //console.error(toks);
        return toks;
    }

    isConstExpr(expr: Expression): boolean {
        switch (expr.type) {
            case exprType.unary:
                return this.isConstExpr(expr.right as Expression);
            case exprType.binary_op:
                return this.isConstExpr(expr.left as Expression) && this.isConstExpr(expr.right as Expression)
            case exprType.grouping:
                return this.isConstExpr(expr.left as Expression)
            case exprType.number:
            case exprType.null:
                return true;
            default:
                return false;
        }
    }

    evalConstExpr(expr: Expression): number {
        switch (expr.type) {
            case exprType.unary:
                var right = this.evalConstExpr(expr.right as Expression);
                switch (expr.operator?.type) {
                    case tokenType.bang:
                        return !right ? 1 : 0;
                    case tokenType.minus:
                        return -right;
                    case tokenType.bitnot:
                        return ~right;
                    default:
                        tokenError("unsupported unary operator", expr.operator as Token);
                }
            case exprType.binary_op:
                var left = this.evalConstExpr(expr.left as Expression);
                var right = this.evalConstExpr(expr.right as Expression);
                switch (expr.operator?.type) {
                    case tokenType.divide:
                        return left / right;
                    case tokenType.multiply:
                        return left * right;
                    case tokenType.plus:
                        return left + right;
                    case tokenType.minus:
                        return left - right;
                    case tokenType.greater:
                        return left > right ? 1 : 0;
                    case tokenType.less:
                        return left < right ? 1 : 0;
                    case tokenType.eq:
                        return left === right ? 1 : 0;
                    case tokenType.lte:
                        return left <= right ? 1 : 0;
                    case tokenType.gte:
                        return left >= right ? 1 : 0;
                    case tokenType.neq:
                        return left != right ? 1 : 0;
                    case tokenType.bitand:
                        return left & right;
                    case tokenType.bitxor:
                        return left ^ right;
                    case tokenType.bitor:
                        return left | right;
                    case tokenType.and:
                        return left && right;
                    case tokenType.or:
                        return left || right;
                    case tokenType.mod:
                        return left % right;
                    case tokenType.shl:
                        return left << right;
                    case tokenType.shr:
                        return left >> right;
                    default:
                        tokenError("unsupported binary operator", expr.operator as Token);
                }
            case exprType.grouping:
                return this.evalConstExpr(expr.left as Expression)
            case exprType.number:
                return expr.val as number;
            case exprType.null:
                return 0;
        }
        throw new Error("unreachable");
    }

    evalConst(expr: Expression) {
        if (this.isConstExpr(expr)) {
            var val = new Expression().newExprNumber(this.evalConstExpr(expr));
            val.datatype = expr.datatype;
            return val;
        }

        return expr;
    }

    assignBeforeUse(val: Expression, name = ""): { assign: Expression, id: Expression } {
        var variable = incLocalOffset(name, val.datatype, undefined, val);
        var id = new Expression().newExprIdentifier(variable);
        if (val.type === exprType.call && val.datatype.size > 8) {
            val.params.splice(0, 0, new Expression().newExprAddress(id));
        }
        var assign = new Expression().newExprAssign(id, val, this.previous());
        return { assign: assign, id: id }
    }

    async taggedUnionLiteral(struc_type: Type): Promise<Expression> {
        var setters: { field_offset: number, data_type: Type, value: Expression, token:Token }[] = [];
        this.expect(tokenType.leftbrace, "{");
        this.expect(tokenType.dot, ".");
        var member_tok = this.expect(tokenType.identifier, "identifier");
        var fo = getOffsetOfMember(struc_type, member_tok);

        var eq = this.expect(tokenType.equal, "=");
        var tag_value = struc_type.tag.enumvalues.find((v) => v.name === member_tok.value)?.value;
        var field_value = await this.expression();
        if(!fo.datatype.eql(field_value.datatype)) {
            tokenError(`Literal Expects type ${fo.datatype.toString()} found ${field_value.datatype.toString()}`, eq);
        }
        setters.push({ field_offset: 0, data_type: struc_type.tag, value: tag_value as Expression, token:member_tok/**work around */ });
        setters.push({ field_offset: fo.offset, data_type: fo.datatype, value: field_value, token:member_tok });
        this.expect(tokenType.rightbrace, "}");
        return new Expression().newStructLiteral(setters, struc_type);
    }

    async structLiteral(name: string): Promise<Expression> {
        var struc_type = searchStruct(name) as Type;
        if (struc_type.is_tagged_union) return this.taggedUnionLiteral(struc_type);
        var setters: { field_offset: number, data_type: Type, value: Expression, token:Token }[] = [];
        this.expect(tokenType.leftbrace, "{");
        if (!this.check(tokenType.rightbrace)) {
            while (true) {
                this.expect(tokenType.dot, ".");
                var member_tok = this.expect(tokenType.identifier, "identifier");
                var fo = getOffsetOfMember(struc_type, member_tok);
                var eq = this.expect(tokenType.equal, "=");
                var val = await this.expression();
                if(!fo.datatype.eql(val.datatype)) {
                    tokenError(`Literal Expects type ${fo.datatype.toString()} found ${val.datatype.toString()}`, eq);
                }
                setters.push({ field_offset: fo.offset, data_type: fo.datatype, value:val ,token:member_tok });
                if (!this.match([tokenType.comma])) break;
            }
        }
        this.expect(tokenType.rightbrace, "}");
        return new Expression().newStructLiteral(setters, struc_type);
    }

    async structLiteralRes(): Promise<Expression> {
        this.expect(tokenType.leftbrace, "{");
        if (!this.check(tokenType.rightbrace)) {
            while (true) {
                this.expect(tokenType.dot, ".");
                this.expect(tokenType.identifier, "identifier")
                this.expect(tokenType.equal, "=");
                await this.expression();
                if (!this.match([tokenType.comma])) break;
            }
        }
        this.expect(tokenType.rightbrace, "}");
        return new Expression().newStructLiteral([], voidtype);
    }

    async arrayLiteralRes(): Promise<Expression> {
        this.expect(tokenType.rightsquare, "]");
        this.parseType();
        this.expect(tokenType.leftbrace, "{");
        if (!this.check(tokenType.rightbrace)) {
            while (true) {
                await this.expression();
                if (!this.match([tokenType.comma])) break;
            }
        }
        this.expect(tokenType.rightbrace, "}");

        return new Expression().arrayLiteral([], voidtype);
    }

    async arrayLiteral(): Promise<Expression> {
        if (isResolutionPass()) return this.arrayLiteralRes();
        this.expect(tokenType.rightsquare, "]");
        var base = this.parseType();
        this.expect(tokenType.leftbrace, "{");
        var setters: { field_offset: number, data_type: Type, value: Expression, token:Token }[] = [];
        var offset = 0;
        if (!this.check(tokenType.rightbrace)) {
            while (true) {
                var v = await this.expression();
                if (base.isInteger() && v.datatype.isInteger()) {
                    v.datatype = base;
                }
                if (!base.eql(v.datatype)) {
                    tokenError(`Literal Expects type ${base.toString()} found ${v.datatype.toString()}`, this.previous());
                }
                setters.push({ field_offset: offset, data_type: base, value: v, token:this.previous() });
                offset += base.size;
                if (!this.match([tokenType.comma])) break;
            }
        }
        this.expect(tokenType.rightbrace, "}");

        return new Expression().arrayLiteral(setters, new Type().newArray(base, setters.length));
    }

    async nameLessStructRes(): Promise<Expression> {
        this.expect(tokenType.leftbrace, "{");
        if (!this.check(tokenType.rightbrace)) {
            while (true) {
                await this.expression();
                if (!this.match([tokenType.comma])) break;
            }
        }
        this.expect(tokenType.rightbrace, "}");
        return new Expression().newStructLiteral([], voidtype);
    }

    async nameLessStruct(): Promise<Expression> {
        if (isResolutionPass()) return this.nameLessStructRes();
        this.expect(tokenType.leftbrace, "{");
        var setters: { field_offset: number, data_type: Type, value: Expression, token:Token }[] = [];
        var offset = 8;
        var data_type = new Type();
        data_type.align = 8;
        data_type.members = [];
        if (!this.check(tokenType.rightbrace)) {
            while (true) {
                var expr = await this.expression();
                if(expr.datatype.size > 8 && expr.datatype.size !== 16) {
                   tokenError(`Large field ${expr.datatype.toString()} not allowed in tuple `, this.previous());
                }
                offset = alignTo(8, offset);
                setters.push({ field_offset: offset, data_type: expr.datatype, value: expr, token:this.previous() });
                data_type.members.push({ name: "", offset: offset, type: expr.datatype, default: undefined });
                offset += expr.datatype.size;
                if (data_type.align < expr.datatype.align) {
                    data_type.align = expr.datatype.align;
                }
                if (!this.match([tokenType.comma])) break;
            }
        }
        setters.splice(0, 0, { field_offset: 0, data_type: u64, value: new Expression().newExprNumber(data_type.members.length), token:this.peek() });
        data_type.members.splice(0, 0, { name: "len", offset: 0, type: u64, default: undefined });
        data_type.size = alignTo(data_type.align, offset);
        data_type.kind = myType.tuple;
        //console.error(data_type.members);
        this.expect(tokenType.rightbrace, "}");
        return new Expression().newStructLiteral(setters, data_type);
    }

    async idRef(vari: Variable): Promise<Expression> {
        if (this.check(tokenType.leftbrace)) {
            return await this.structLiteralRes();
        }

        return new Expression().newExprIdentifier(vari);
    }


    enumField(id: string, data_type: Type): Expression {
        this.expect(tokenType.dot, "Enum field");
        var tok = this.expect(tokenType.identifier, "Enum field");
        var field = tok.value as string;
        var val = data_type.enumvalues.find((e) => e.name === field);
        if (val) {
            return val.value;
        }

        tokenError(`enum ${id} has no field`, tok);
        return new Expression();
    }

    getEscape(char: Token) {
        switch (char.value.toString()) {
            case "n": return '\n';
            case "t": return '\t';
            case "r": return '\r';
            case "0": return '\0';
            case "b": return '\b';
        }
        tokenError(`unsupported escape sequence \\${char.value}`, char);
        process.exit(1);
    }


    isTypeId(name: string): boolean {
        if (searchStruct(name) || getEnum(name)) {
            return true;
        }
        return false;
    }

    async primary(): Promise<Expression> {
        if (this.match([tokenType.identifier])) {
            var id = this.previous().value as string;
            var obj = getLocalOffset(id, this.previous());

            if (isResolutionPass()) return this.idRef(obj.variable as Variable);

            if (obj.offset === -1) {
                return new Expression().newExprFnIdentifier(
                    id,
                    obj.datatype
                );
            }

            if (obj.offset === -3) {
                return this.enumField(id, obj.datatype);
            }

            if (obj.offset === -4) {
                if (this.check(tokenType.leftbrace)) {
                    return await this.structLiteral(id);
                }
            }

            var expr = new Expression().newExprIdentifier(obj.variable as Variable);
            return expr;
        }

        if (this.match([tokenType.leftsquare])) {
            return await this.arrayLiteral();
        }

        if (this.match([tokenType.dot])) {
            return await this.nameLessStruct();
        }

        if (this.match([tokenType.string])) {
            var expr = new Expression().newExprString(this.previous().value as string);
            return expr;
        }

        if (this.match([tokenType.false])) {
            return new Expression().newExprBoolean(0);
        }

        if (this.match([tokenType.true])) {
            return new Expression().newExprBoolean(1);
        }

        if (this.match([tokenType.number])) {
            return new Expression().newExprNumber(this.previous().value as number, this.previous().isfloat);
        }

        if (this.match([tokenType.leftparen])) {
            var expr = await this.expression();
            this.expect(tokenType.rightparen, ")");
            return new Expression().newExprGrouping(expr);
        }

        if (this.match([tokenType.null])) {
            return new Expression().newExprNull();
        }

        if (this.match([tokenType.sizeof])) {
            var ex: Expression | undefined = undefined;
            this.expect(tokenType.leftparen, "(");
            if (this.check(tokenType.identifier)) {
                if (this.isTypeId(this.peek().value as string)) {
                    ex = new Expression().newExprNumber(this.parseType().size);
                } else {
                    var size = (await this.expression()).datatype.size;
                    ex = new Expression().newExprNumber(size);
                }
            } else if (this.check(tokenType.number)) {
                var size = (await this.expression()).datatype.size;
                ex = new Expression().newExprNumber(size);
            } else {
                ex = new Expression().newExprNumber(this.parseType().size);
            }
            this.expect(tokenType.rightparen, ")");
            return ex as Expression;
        }


        if (this.match([tokenType.alignof])) {
            var ex: Expression | undefined = undefined;
            this.expect(tokenType.leftparen, "(");
            if (this.check(tokenType.identifier)) {
                if (this.isTypeId(this.peek().value as string)) {
                    ex = new Expression().newExprNumber(this.parseType().align);
                } else {
                    var size = (await this.expression()).datatype.align;
                    ex = new Expression().newExprNumber(size);
                }
            } else if (this.check(tokenType.number)) {
                var size = (await this.expression()).datatype.align;
                ex = new Expression().newExprNumber(size);
            } else {
                ex = new Expression().newExprNumber(this.parseType().align);
            }
            this.expect(tokenType.rightparen, ")");
            return ex as Expression;
        }

        if (this.match([tokenType.undefined])) {
            return new Expression().newExprUndefined();
        }

        if (this.match([tokenType.character])) {
            var expr = new Expression().newExprNumber(this.previous().value.toString().charCodeAt(0));
            expr.datatype = i8;
            return expr
        }
        //console.log(this.peek());
        tokenError("unexpected token", this.peek());
        throw new Error("Unexpected token");

    }

    isIdentifier(expr: Expression) {
        return expr.type === exprType.string || expr.type === exprType.identifier;
    }

    async finishCall(callee: Expression, optional?: Expression): Promise<Expression> {
        if (callee.datatype.kind !== myType.function && !isResolutionPass()) {
            tokenError("Not a function", this.previous());
        }
        var args: Expression[] = [];
        if (!this.check(tokenType.rightparen)) {
            do {
                var arg = await this.expression();
                if (arg.datatype.size > 8 && !this.isIdentifier(arg)) {
                    var ab = this.assignBeforeUse(arg);
                    args.push(new Expression().newAssignForUse(ab.assign, new Expression().newExprAddress(ab.id)))
                } else if (arg.datatype.size > 8) {
                    args.push(new Expression().newExprAddress(arg));
                } else {
                    if (arg.type === exprType.struct_literal) {
                        var ab = this.assignBeforeUse(arg);
                        args.push(new Expression().newAssignForUse(ab.assign, ab.id));
                    } else {
                        args.push(arg);
                    }
                }
            } while (this.match([tokenType.comma]));
        }
        var fntok = this.expect(tokenType.rightparen, ") after params");
        if (optional) { args.splice(0, 0, optional); }
        var expr = new Expression().newExprCall(callee, callee.datatype.return_type, args, fnType.native);
        if (callee.datatype.arity !== args.length && !isResolutionPass()) {
            tokenError(callee.name + " expects " + callee.datatype.arity + " args but " + args.length + " provided.", fntok);
        }

        return expr;
    }

    isStructure(T: Type): boolean {
        if (isResolutionPass()) return true;
        if (T.members || T.kind) {
            return true;
        }
        return false;
    }

    typeEql(a: Type, b: Type): boolean {
        return a.module_name === b.module_name && a.name === b.name;
    }

    async getFunctionFromStruct(expr: Expression, meta: { offset: number, datatype: Type, name: string }, tok: Token): Promise<Expression> {
        var obj = getLocalOffset(meta.name, tok);
        var fakeid = new Expression().newExprFnIdentifier(meta.name, obj.datatype);
        if (obj.datatype.arguments.length === 0 || !this.typeEql(obj.datatype.arguments[0].datatype.base, expr.datatype)) {
            tokenError(`${expr.datatype.name} has no such member function`, this.previous());
        }

        this.expect(tokenType.leftparen, "Expect ( ");
        return await this.finishCall(fakeid, new Expression().newExprAddress(expr));
    }

    async getFunctionFromStructPtr(expr: Expression, meta: { offset: number, datatype: Type, name: string }, tok: Token): Promise<Expression> {
        var obj = getLocalOffset(meta.name, tok);
        var fakeid = new Expression().newExprFnIdentifier(meta.name, obj.datatype);
        this.expect(tokenType.leftparen, "Expect ( ");
        if (obj.datatype.arguments.length === 0 || !this.typeEql(obj.datatype.arguments[0].datatype.base, expr.datatype.base)) {
            tokenError(`${expr.datatype.base.name} has no such member function`, this.previous());
        }
        return await this.finishCall(fakeid, expr);
    }

    async parseGet(expr: Expression): Promise<Expression> {
        var dot = this.previous();
        var propname = this.advance();

        if (isResolutionPass()) {
            return new Expression().newExprGet(0, new Expression(), voidtype);
        }

        if (propname.type === tokenType.identifier || propname.type === tokenType.multiply) { } else {
            tokenError("expect property name after dot", this.peek());
        }

        if (propname.type === tokenType.multiply) {
            if (!expr.datatype.isPtr()) {
                tokenError(`attempt to dereference non ptr type ${expr.datatype.toString()}`, propname);
            }
            return new Expression().newExprDeref(expr);
        }

        if (expr.datatype.kind === myType.ptr) {
            expr = new Expression().newExprDeref(expr);
        }

        if (expr.datatype === undefined || !expr.datatype.hasMembers()) {
            tokenError(`type ${expr.datatype.toString()} has no members`, dot);
        }

        var meta = getOffsetOfMember(expr.datatype, propname);
        if (meta.offset === -1) {
            return await this.getFunctionFromStruct(expr, meta, propname);
        }

        if (expr.type === exprType.get || expr.type === exprType.deref) {
            return new Expression().newExprGet(meta.offset, expr, meta.datatype);
        }

        if (!(this.isIdentifier(expr))) {
            var ab = this.assignBeforeUse(expr);
            var get = new Expression().newExprGet(meta.offset, ab.id, meta.datatype);
            return new Expression().newAssignForUse(ab.assign, get);
        } else {
            return new Expression().newExprGet(meta.offset, expr, meta.datatype);
        }
    }

    parseSliceIndex(expr: Expression, index: Expression): Expression {
        var ex = new Expression().newExprGet(8/*ptr*/, expr, new Type().newPointer(expr.datatype.base));
        return new Expression().newExprDeref(
            this.evalConst(
                new Expression().newExprBinary(new Token(tokenType.plus, "+", 0, 0, ""), ex,
                    new Expression().newExprBinary(
                        new Token(tokenType.multiply, "*", 0, 0, ""),
                        new Expression().newExprNumber(expr.datatype.base.size),
                        index
                    ))
            )
        )

    }

    parseArrayIndex(expr: Expression, index: Expression): Expression {
        return new Expression().newExprDeref(
            this.evalConst(
                new Expression().newExprBinary(new Token(tokenType.plus, "+", 0, 0, ""),
                    new Expression().newExprBinary(new Token(tokenType.plus, "+", 0, 0, ""), expr,
                        new Expression().newExprBinary(
                            new Token(tokenType.multiply, "*", 0, 0, ""),
                            new Expression().newExprNumber(expr.datatype.base.size),
                            index
                        )),
                    new Expression().newExprNumber(8)
                )
            )
        )
    }

    async parseArraySlide(expr: Expression, index: Expression): Promise<Expression> {
        var end = await this.expression();
        this.expect(tokenType.rightsquare, "Expect ] ");
        var s = new Expression().newExprSlideArray(expr, index, end);
        s.type = exprType.slice_array;
        return s;
    }

    async parseSliceSlide(expr: Expression, index: Expression): Promise<Expression> {
        var end = await this.expression();
        this.expect(tokenType.rightsquare, "Expect ] ");
        var s = new Expression().newExprSlideSlice(expr, index, end);
        s.type = exprType.slice_slice;
        return s;
    }

    async parseTupleIndex(expr: Expression, index: Expression): Promise<Expression> {
        if (index.val > expr.datatype.members.length) {
            tokenError("invalid index", this.previous());
        }
        var idx = index.val as number;
        return new Expression().newExprGet(
            expr.datatype.members[idx + 1].offset,
            expr, expr.datatype.members[idx + 1].type);
    }

    async parseTuplePtrIndex(expr: Expression, index: Expression): Promise<Expression> {
        if (index.val > expr.datatype.base.members.length) {
            tokenError("invalid index", this.previous());
        }
        var idx = index.val as number
        return new Expression().newExprGet(
            expr.datatype.base.members[idx + 1].offset,
            new Expression().newExprDeref(expr), expr.datatype.base.members[idx + 1].type);
    }

    async index(expr: Expression): Promise<Expression> {
        if (isResolutionPass()) {
            var index = await this.expression();
            if (this.match([tokenType.range])) {
                await this.expression();
            }
            this.expect(tokenType.rightsquare, "]");

            return expr;
        }

        var index = await this.expression();
        var t = this.advance();

        if (expr.datatype.kind === myType.ptr) {
            expr = new Expression().newExprDeref(expr);
        }

        switch (expr.datatype.kind) {
            case myType.slice:// likes char*
                switch (t.type) {
                    case tokenType.range:
                        if (!this.isIdentifier(expr)) {
                            var ab = this.assignBeforeUse(expr);
                            var slicer = await this.parseSliceSlide(ab.id, index);
                            return new Expression().newAssignForUse(ab.assign, slicer);
                        }
                        return this.parseSliceSlide(expr, index)
                    case tokenType.rightsquare:
                        if (expr.type === exprType.deref) {
                            return this.parseSliceIndex(expr, index);
                        }
                        if (!this.isIdentifier(expr)) {
                            var ab = this.assignBeforeUse(expr);
                            var slicer = await this.parseSliceIndex(ab.id, index);
                            return new Expression().newAssignForUse(ab.assign, slicer);
                        }
                        return this.parseSliceIndex(expr, index);
                    default:
                        tokenError("Expect ]", t);

                }
                break;
            case myType.array:
                switch (t.type) {
                    case tokenType.range:
                        if (!this.isIdentifier(expr)) {
                            var ab = this.assignBeforeUse(expr);
                            var slicer = await this.parseArraySlide(ab.id, index);
                            return new Expression().newAssignForUse(ab.assign, slicer);
                        }
                        return this.parseArraySlide(expr, index)
                    case tokenType.rightsquare:
                        if (expr.type === exprType.deref) {
                            return this.parseArrayIndex(expr, index);
                        }
                        if (!this.isIdentifier(expr)) {
                            var ab = this.assignBeforeUse(expr);
                            var slicer = this.parseArrayIndex(ab.id, index);
                            return new Expression().newAssignForUse(ab.assign, slicer);
                        }
                        return this.parseArrayIndex(expr, index);
                    default:
                        tokenError("Expect ]", t);

                }
                break;
            case myType.tuple:
                if (!this.isConstExpr(index)) {
                    tokenError("Tuple index must be const expr", t);
                }
                return this.parseTupleIndex(expr, index);
            default:
                console.error("indexing non array", expr.datatype);
                process.exit(1);

        }
        return new Expression();
    }

    parseMemberFunction(name: Token): Expression {
        if (isResolutionPass()) {
            this.expect(tokenType.identifier, "Expect fn name");
            return new Expression().newExprFnIdentifier("", new Type().newFunction(voidtype, [], fnType.native));
        }

        var struc = searchStruct(name.value as string);
        if (struc === undefined) {
            tokenError("No such struct", name);
        }
        var tok = this.expect(tokenType.identifier, "Expect fn name")
        var fnname = tok.value as string;

        if (struc?.member_fn_names.find((f) => f === fnname) === undefined) {
            tokenError(`${struc?.name} has no fn ${fnname}`, this.previous());
        }

        var obj = getLocalOffset(struc?.name + fnname, tok);
        // todo
        return new Expression().newExprFnIdentifier(
            struc?.name + fnname,
            obj.datatype
        );

    }

    // postfix
    async call(): Promise<Expression> {
        var expr = await this.primary(); // identifier
        var name = this.previous();
        while (true) {
            if (this.match([tokenType.leftparen])) {
                expr = await this.finishCall(expr);
            } else if (this.match([tokenType.dot])) {
                expr = await this.parseGet(expr);
            } else if (this.match([tokenType.leftsquare])) {
                expr = await this.index(expr);
            } else if (this.match([tokenType.doublecolon])) {
                expr = this.parseMemberFunction(name);
            } else {
                break;
            }
        }
        return expr;
    }

    isLiteral(left: Expression): boolean {
        return left.type === exprType.array_literal || left.type === exprType.struct_literal;
    }

    async unary(): Promise<Expression> {
        if (this.match([tokenType.bitnot, tokenType.minus, tokenType.bang])) {
            var operator = this.previous();
            var right = await this.unary();
            return new Expression().newExprUnary(operator, right);
        }

        if (this.match([tokenType.bitand])) {
            var left = await this.unary();
            if (left.type === exprType.address) {
                console.error("wtf bro!,, thats unsupported here");
                process.exit(1);
            }

            if (!this.isIdentifier(left)) {
                var ab = this.assignBeforeUse(left);
                return new Expression().newAssignForUse(ab.assign, new Expression().newExprAddress(ab.id));
            }
            return new Expression().newExprAddress(left);
        }

        return await this.call();
    }

    async cast(): Promise<Expression> {
        while (this.match([tokenType.cast])) {
            this.expect(tokenType.leftparen, "(");
            var type = this.parseType();
            this.expect(tokenType.rightparen, ")");
            var expr = await this.cast();
            expr.datatype = type;
            return expr;
        }
        return await this.unary();
    }

    async factor(): Promise<Expression> {
        var expr = await this.cast();
        while (this.match([tokenType.divide, tokenType.multiply, tokenType.mod])) {
            var operator = this.previous();
            var right = await this.cast();
            expr = new Expression().newExprBinary(operator, expr, right);
        }
        return expr;
    }


    async term(): Promise<Expression> {
        var expr = await this.factor();

        while (this.match([tokenType.plus, tokenType.minus])) {
            var operator = this.previous();
            var right = await this.factor();
            if (expr.datatype.isPtr() && !right.datatype.isPtr()) {
                right = new Expression().newExprBinary(
                    new Token(tokenType.multiply, "", 0, 0, ""), right, new Expression().newExprNumber(expr.datatype.base.size)
                )
            }
            expr = new Expression().newExprBinary(operator, expr, right);

            if (expr.datatype.isPtr() && right.datatype.isPtr() && operator.type === tokenType.minus) {
                expr = new Expression().newExprBinary(new Token(tokenType.divide, "", 0, 0, ""), expr, new Expression().newExprNumber(expr.datatype.base.size))
            }
        }

        return expr;
    }

    async shift(): Promise<Expression> {
        var expr = await this.term();
        while (this.match([tokenType.shl, tokenType.shr])) {
            var operator = this.previous();
            var right = await this.term();
            expr = new Expression().newExprBinary(operator, expr, right);
        }
        return expr;
    }

    async comparisson(): Promise<Expression> {
        var expr = await this.shift();
        while (this.match([tokenType.less, tokenType.greater, tokenType.gte, tokenType.lte])) {
            var operator = this.previous();
            var right = await this.shift();
            expr = new Expression().newExprBinary(operator, expr, right);
        }

        return expr;
    }

    async relational(): Promise<Expression> {
        var expr = await this.comparisson();
        while (this.match([tokenType.neq, tokenType.eq])) {
            var operator = this.previous();
            var right = await this.comparisson();
            expr = new Expression().newExprBinary(operator, expr, right);
        }

        return expr;
    }

    async BitwiseAnd(): Promise<Expression> {
        var expr = await this.relational();
        while(this.match([tokenType.bitand])) {
            var operator = this.previous();
            var right = await this.relational();
            expr = new Expression().newExprBinary(operator, expr, right);
        }
        return expr;
    }

    async bitwiseXor(): Promise<Expression> {
        var expr = await this.BitwiseAnd();
        while(this.match([tokenType.bitxor])) {
            var operator = this.previous();
            var right = await this.BitwiseAnd();
            expr = new Expression().newExprBinary(operator, expr, right);
        }
        return expr;
    }

    async bitwiseOr(): Promise<Expression> {
        var expr = await this.bitwiseXor();
        while(this.match([tokenType.bitor])) {
            var operator = this.previous();
            var right = await this.bitwiseXor();
            expr = new Expression().newExprBinary(operator, expr, right);
        }
        return expr;
    }

    async logicalAnd(): Promise<Expression> {
        var expr = await this.bitwiseOr();
        while(this.match([tokenType.and])) {
            var operator = this.previous();
            var right = await this.bitwiseOr();
            expr = new Expression().newExprBinary(operator, expr, right);
        }
        return expr;
    }

    async logicalOr(): Promise<Expression> {
        var expr = await this.logicalAnd();
        while(this.match([tokenType.or])) {
            var operator = this.previous();
            var right = await this.logicalAnd();
            expr = new Expression().newExprBinary(operator, expr, right);
        }
        return expr;
    }

    getOperator(equals: Token): tokenType {
        switch (equals.type) {
            case tokenType.addeq:
                return tokenType.plus
            case tokenType.subeq:
                return tokenType.minus;
            case tokenType.muleq:
                return tokenType.multiply;
            case tokenType.diveq:
                return tokenType.divide
            case tokenType.modeq:
                return tokenType.mod;
            case tokenType.bitandeq:
                return tokenType.bitand
            case tokenType.bitnoteq:
                return tokenType.bitnot;
            case tokenType.bitxoreq:
                return tokenType.bitxor;
            case tokenType.bitnoteq:
                return tokenType.bitnot;
            case tokenType.shreq:
                return tokenType.shr;
            case tokenType.shleq:
                return tokenType.shl;
            default:
                tokenError("Unexpected operator", equals);
                return tokenType.addeq
        }
    }

    async ternary(): Promise<Expression> {
        var expr = await this.logicalOr();

        if (this.match([tokenType.qmark])) {
            var if_expr = await this.logicalOr();
            this.expect(tokenType.colon, ":");
            var else_expr = await this.ternary();
            return new Expression().newIfExpr(expr, if_expr, else_expr)
        }

        return expr;
    }

    async assign(): Promise<Expression> {
        var expr = await this.ternary();
        var equals: Token;
        if (this.match([
            tokenType.equal,
            tokenType.addeq,
            tokenType.subeq,
            tokenType.diveq,
            tokenType.muleq,
            tokenType.modeq,
            tokenType.bitandeq,
            tokenType.bitnoteq,
            tokenType.bitxoreq,
            tokenType.bitnoteq,
            tokenType.shleq,
            tokenType.shleq
        ])) {
            equals = this.previous();
            var val = await this.assign();

            if (val.type === exprType.call && expr.datatype.size > 8) {
                val.params.splice(0, 0, new Expression().newExprAddress(expr))
            }
            if (equals.type !== tokenType.equal) {
                var operator = this.getOperator(equals);
                val = new Expression().newExprBinary(new Token(operator, "", 0, 0, ""), expr, val)
            }
            switch (expr.type) {
                case exprType.identifier:
                case exprType.deref:
                case exprType.deref_index:
                    return new Expression().newExprAssign(expr, val, equals);
                case exprType.get:
                    return new Expression().newExprSet(expr, val, equals);
                default:
                    if (isResolutionPass()) return expr;
                    console.error(expr);
                    tokenError(`Unexpected assignment target ${expr.datatype.toString()}`, equals);
            }
        }
        return expr;
    }

    async expression(): Promise<Expression> {
        return this.evalConst(await this.assign());
    }

    async ExprStatement(): Promise<Statement> {
        var expr = await this.expression();

        if (expr.type === exprType.assign) {
            this.expect(tokenType.semicolon, ";");
            return new Statement().newExprStatement(expr);
        }

        if (expr.datatype.size > 8 || expr.type === exprType.struct_literal) {
            if (expr.type === exprType.assigned_for_use) {
            }
            var ab = this.assignBeforeUse(expr);
            expr = new Expression().newAssignForUse(ab.assign, new Expression().newExprAddress(ab.id));
        }
        this.expect(tokenType.semicolon, ";");
        var stmt = new Statement().newExprStatement(expr);
        return stmt;
    }

    async block(): Promise<Statement> {
        beginScope();
        var stmts: Statement[] = [];
        var defers: Statement[] = [];
        while (!this.check(tokenType.rightbrace) && this.moreTokens()) {
            var stmt = await this.declaration();
            if (stmt.type === stmtType.defer) {
                defers.push(stmt.then);
            } else {
                stmts.push(stmt);
            }
        }
        this.expect(tokenType.rightbrace, "}");
        defers.reverse().forEach((d) => {
            stmts.push(d);
        })
        endScope();
        return new Statement().newBlockStatement(stmts);
    }

    async re_turn(): Promise<Statement> {
        if (this.match([tokenType.semicolon])) {
            var expr = new Expression().newExprNumber(0);
            expr.datatype = i64;
            return new Statement().newReturnStatement(expr);
        }
        var expr = await this.expression();
        if (expr.type === exprType.call && expr.datatype.size > 8) {
            var variable = incLocalOffset("", expr.datatype, undefined)
            expr.params.splice(0, 0, new Expression().newExprAddress(
                new Expression().newExprIdentifier(variable)))
        }
        this.expect(tokenType.semicolon, ";");
        return new Statement().newReturnStatement(expr);
    }

    async ifStatement(): Promise<Statement> {
        this.expect(tokenType.leftparen, "( after if");
        var cond = await this.expression();
        if(cond.datatype.isInteger() || cond.datatype.isPtr()) {} else {
            if(!isResolutionPass()) {
                console.error(cond.datatype);
                tokenError("Expression should be bool, ptr or int", this.previous());
            }
        }
        this.expect(tokenType.rightparen, ") after condition");
        beginScope();
        var assign:Expression|undefined = undefined;
        if(this.match([tokenType.pipe])) {
            var captok = this.expect(tokenType.identifier, "capture");
            var cap_name = captok.value as string;
            var obj = this.assignBeforeUse(cond, cap_name);
            cond = obj.id;
            assign = obj.assign;
            this.expect(tokenType.pipe,"|");
        }
        var then = await this.statement();
        var else_: Statement | undefined = undefined;
        if (this.match([tokenType.else])) {
            else_ = await this.statement();
        }
        endScope();
        return new Statement().newIfStatement(cond, then, else_, assign);
    }

    async switchEnum(tgu: Expression): Promise<Statement> {
        if (this.isLiteral(tgu)) tokenError("switch on literal", this.previous());
        this.expect(tokenType.rightparen, ") after condition");
        this.expect(tokenType.leftbrace, "Expect switch body");
        var prongs: Statement[] = [];
        var cases: Expression[] = [];
        var default_prong = new Statement();
        var default_prong_found = false;
        var cond = new Expression().newExprGet(0, tgu, tgu.datatype.tag);
        while (!this.check(tokenType.rightbrace) && this.moreTokens()) {
            var mem_tok: Token | undefined = undefined;
            if (this.match([tokenType.else])) {
                default_prong_found = true;
            } else {
                var first_round = true;
                var group_data_type: Type | undefined = undefined;
                while (true) {
                    this.expect(tokenType.dot, ".");
                    mem_tok = this.expect(tokenType.identifier, "enum field name");
                    var mem_name = mem_tok.value as string;
                    var enum_value = tgu.datatype.tag.enumvalues.find((e) => e.name == mem_name);
                    var meta = getOffsetOfMember(tgu.datatype, mem_tok as Token);
                    if (first_round) {
                        group_data_type = meta.datatype;
                    } else {
                        if (!group_data_type?.eql(meta.datatype)) {
                            tokenError(`Expect ${group_data_type?.toString()} found ${meta.datatype.toString()}`, mem_tok);
                        }
                    }

                    if (enum_value) {
                        cases.push(new Expression().newExprCase(prongs.length, enum_value.value));
                    } else {
                        tokenError(`${mem_name} is not member of ${cond.datatype.toString()}`, mem_tok);
                    }

                    if (!this.match([tokenType.comma])) break;
                    first_round = false;
                }
            }

            this.expect(tokenType.plong, "Expect plong");
            var has_capture = false;
            var capture: Expression | undefined = undefined;
            if (this.match([tokenType.pipe])) {
                var is_ref = false;
                if (default_prong_found) {
                    tokenError("cannot capture on else", this.previous());
                }

                if (this.match([tokenType.multiply])) {
                    is_ref = true;
                }

                var cap_tok = this.expect(tokenType.identifier, "capture name");
                var cap_name = cap_tok.value as string;
                this.expect(tokenType.pipe, "|");
                beginScope();
                var meta = getOffsetOfMember(tgu.datatype, mem_tok as Token);

                if (is_ref) {
                    var vbl = incLocalOffset(cap_name, new Type().newPointer(meta.datatype), cap_tok);
                    capture = new Expression().newExprAssign(new Expression().newExprIdentifier(vbl),
                        new Expression().newExprAddress(new Expression().newExprGet(meta.offset, tgu, meta.datatype)), cap_tok);
                } else {
                    var vbl = incLocalOffset(cap_name, meta.datatype, cap_tok);
                    capture = new Expression().newExprAssign(new Expression().newExprIdentifier(vbl),
                        new Expression().newExprGet(meta.offset, tgu, meta.datatype), cap_tok);
                }
                has_capture = true;
            }
            var pron = await this.statement();

            if (has_capture) {
                pron.capture = capture as Expression;
                endScope()
            }

            if (default_prong_found) {
                default_prong = pron;
            } else {
                prongs.push(pron);
            }
            if (!this.check(tokenType.rightbrace)) {
                this.expect(tokenType.comma, "Expect comma after plong");
            }

            if (default_prong_found) break;
        }
        if (default_prong_found === false) {
            tokenError("missing else branch", this.peek());
        }
        this.expect(tokenType.rightbrace, "Expect } after switch body");
        return new Statement().newSwitch(cond, cases, prongs, default_prong);
    }

    async switchRes(): Promise<Statement> {
        this.expect(tokenType.leftparen, "Expect ( after switch");
        await this.expression();
        this.expect(tokenType.rightparen, ") after condition");
        this.expect(tokenType.leftbrace, "Expect switch body");
        while (!this.check(tokenType.rightbrace) && this.moreTokens()) {
            var can_else = true;
            while (true) {
                if (this.match([tokenType.else]) && can_else) {
                    break;
                } else if (this.match([tokenType.dot])) {
                    this.expect(tokenType.identifier, "enum field name");
                } else {
                    await this.expression();
                    if (this.match([tokenType.range])) {
                        await this.expression();
                    }
                }
                if (!this.match([tokenType.comma])) {
                    can_else = true;
                    break;
                };
                can_else = false;
            }
            this.expect(tokenType.plong, "Expect plong");
            if (this.match([tokenType.pipe])) {
                this.match([tokenType.multiply]);
                this.expect(tokenType.identifier, "capture name");
                this.expect(tokenType.pipe, "|");
            }
            await this.statement();

            if (!this.check(tokenType.rightbrace)) {
                this.expect(tokenType.comma, "Expect comma after plong");
            }
        }

        this.expect(tokenType.rightbrace, "Expect } after switch body");
        return new Statement();
    }

    async switchStatement(): Promise<Statement> {
        if (isResolutionPass()) return this.switchRes();

        this.expect(tokenType.leftparen, "Expect ( after switch");
        var cond = await this.expression();

        if (cond.datatype.is_tagged_union) {
            return this.switchEnum(cond);
        }

        if (!cond.datatype.isInteger()) {
            tokenError("Switch expects integer or tagged union", this.previous());
        }

        this.expect(tokenType.rightparen, ") after condition");
        this.expect(tokenType.leftbrace, "Expect switch body");
        var prongs: Statement[] = [];
        var cases: Expression[] = [];
        var default_prong = new Statement();
        var default_prong_found = false;
        while (!this.check(tokenType.rightbrace) && this.moreTokens()) {
            var can_else = true;
            while (true) {
                if (this.check(tokenType.else) && can_else) {
                    this.advance();
                    default_prong_found = true;
                    break;
                } else {
                    var expr = await this.expression();
                    if (!this.isConstExpr(expr)) {
                        tokenError("Expect const expression", this.previous());
                    }
                    if (this.match([tokenType.range])) {
                        var expr2 = await this.expression();
                        if (!this.isConstExpr(expr2)) {
                            tokenError("Expect const expression", this.previous());
                        }
                        cases.push(new Expression().newExprCase(prongs.length, new Expression().newExprRange(expr, expr2)));
                    } else {
                        cases.push(new Expression().newExprCase(prongs.length, expr));
                    }
                }
                if (!this.match([tokenType.comma])) {
                    can_else = true;
                    break;
                };
                can_else = false;
            }
            this.expect(tokenType.plong, "Expect plong");
            var has_capture = false;
            var capture: Expression | undefined = undefined;
            if (this.match([tokenType.pipe])) {
                var cap_tok = this.expect(tokenType.identifier, "capture name");
                var cap_name = cap_tok.value as string;
                this.expect(tokenType.pipe, "|");
                beginScope();
                var vbl = incLocalOffset(cap_name, cond.datatype, cap_tok);
                capture = new Expression().newExprAssign(new Expression().newExprIdentifier(vbl), cond, cap_tok);
                has_capture = true;
            }
            var pron = await this.statement();

            if (has_capture) {
                pron.capture = capture as Expression;
                endScope()
            }

            if (default_prong_found) {
                default_prong = pron;
            } else {
                prongs.push(pron);
            }
            if (!this.check(tokenType.rightbrace)) {
                this.expect(tokenType.comma, "Expect comma after plong");
            }
        }
        if (default_prong_found === false) {
            tokenError("missing else branch", this.peek());
        }
        this.expect(tokenType.rightbrace, "Expect } after switch body");
        return new Statement().newSwitch(cond, cases, prongs, default_prong);
    }

    async makeIntRange(bottom: Expression): Promise<Expression> {
        if (this.match([tokenType.range])) {
            bottom.val -= 1;
            if (this.check(tokenType.comma) || this.check(tokenType.rightparen)) {
                return new Expression().newExprRange(bottom, new Expression().newExprNumber(0xfffffffffffff));
            } else {
                var top = await this.expression();
                return new Expression().newExprRange(bottom, top);
            }
        } else {
            return new Expression().newExprRange(new Expression().newExprNumber(-1), bottom);
        }
    }

    async loopRes(): Promise<Statement> {
        while (true) {
            var bottom = await this.expression();
            await this.makeIntRange(bottom);
            if (!this.check(tokenType.comma)) break;
            this.advance();
        }

        this.expect(tokenType.rightparen, ") after condition");
        this.expect(tokenType.pipe, "loop payload");
        while (true) {
            if (this.match([tokenType.multiply])) {
                this.expect(tokenType.identifier, "identifier");
            } else {
                this.expect(tokenType.identifier, "identifier");
            }
            if (!this.check(tokenType.comma)) break;
            this.advance();
        }

        this.expect(tokenType.pipe, "|");
        beginScope();
        endScope();
        await this.statement();
        return new Statement();
    }

    async integerLoop(): Promise<Statement> {
        if (isResolutionPass()) {
            return await this.loopRes();
        }

        var assigns: Expression[] = [];

        var ranges: { range: Expression, range_type: rangeType, id: Expression | undefined }[] = []
        while (true) {
            var bottom = await this.expression();
            if (bottom.datatype.isInteger()) {
                ranges.push({ range: await this.makeIntRange(bottom), range_type: rangeType.int, id: undefined });
            } else {
                if(bottom.datatype.isPtr()) bottom = new Expression().newExprDeref(bottom);
                switch (bottom.datatype.kind) {
                    case myType.array:
                        if (bottom.isLiteral()) {
                            var obj = this.assignBeforeUse(bottom);
                            bottom = obj.id;
                            assigns.push(obj.assign);
                        }
                        ranges.push({
                            range: new Expression().newExprRange(
                                new Expression().newExprNumber(-1),
                                new Expression().newExprNumber(bottom.datatype.arrayLen)),
                            range_type: rangeType.array,
                            id: bottom
                        }
                        )
                        break;
                    case myType.slice:
                        ranges.push({
                            range: new Expression().newExprRange(
                                new Expression().newExprNumber(-1),
                                new Expression().newExprNumber(bottom.datatype.arrayLen)),
                            range_type: rangeType.slice,
                            id: bottom
                        }
                        )
                        break;
                    default:
                        console.error(bottom.datatype);
                        tokenError("attemp to loop unsupported type", this.previous());
                }
            }

            if (!this.check(tokenType.comma)) break;
            this.advance();
        }

        this.expect(tokenType.rightparen, ") after condition");
        this.expect(tokenType.pipe, "loop payload");
        var variables: { ptr: boolean, name: Token }[] = [];
        for (let i = 0; i < ranges.length; i++) {
            if (this.match([tokenType.multiply])) {
                variables.push({ ptr: true, name: this.expect(tokenType.identifier, "identifier") });
            } else {
                variables.push({ ptr: false, name: this.expect(tokenType.identifier, "identifier") });
            }
            if (i < ranges.length - 1) {
                this.expect(tokenType.comma, ",");
            }
        }

        this.expect(tokenType.pipe, "|");
        var metadata: {
            counter: Variable,
            range_type: rangeType,
            range: Expression,
            ptr: boolean | undefined, array_id: Expression | undefined, index_var: Variable | undefined
        }[] = [];
        beginScope();
        for (let i = 0; i < ranges.length; i++) {
            if (ranges[i].range_type === rangeType.array || ranges[i].range_type === rangeType.slice) {
                var r_id = ranges[i].id as Expression;
                var is_ptr = variables[i].ptr;
                var data_type = is_ptr ? new Type().newPointer(r_id.datatype.base) : r_id.datatype.base;
                var ptr_var = incLocalOffset(variables[i].name.value as string, data_type, variables[i].name, new Expression().newExprUndefined());
                var counter = incLocalOffset("", u64, undefined, ranges[i].range.left);
                metadata.push({
                    counter: counter,
                    range_type: ranges[i].range_type,
                    range: ranges[i].range,
                    ptr: is_ptr,
                    array_id: r_id,
                    index_var: ptr_var
                })

            } else {
                metadata.push({
                    counter: incLocalOffset(variables[i].name.value as string, u64, variables[i].name, ranges[i].range.left),
                    range_type: rangeType.int,
                    range: ranges[i].range,
                    ptr: undefined, array_id: undefined, index_var: undefined
                });
            }
        }

        var body = await this.statement();
        endScope();
        return new Statement().newIntLoop(body, metadata, assigns);
    }

    async forStatement(): Promise<Statement> {
        this.expect(tokenType.leftparen, "( after while");

        return await this.integerLoop();
    }

    async whileStatement(): Promise<Statement> {
        this.expect(tokenType.leftparen, "( after while");
        var cond = await this.expression();
        this.expect(tokenType.rightparen, ") after condition");
        var then = await this.statement();

        return new Statement().newWhileStatement(cond, then);
    }

    async statement(): Promise<Statement> {

        if (this.match([tokenType.contineu])) {
            this.expect(tokenType.semicolon, ";");
            return new Statement().newContinueStatement();
        }

        if (this.match([tokenType.braek])) {
            this.expect(tokenType.semicolon, ";");
            return new Statement().newBreakStatement();
        }

        if (this.match([tokenType.leftbrace])) {
            return await this.block();
        }

        if (this.match([tokenType.return])) {
            return this.re_turn();
        }

        if (this.match([tokenType.if])) {
            return await this.ifStatement();
        }

        if (this.match([tokenType.for])) {
            return await this.forStatement();
        }

        if (this.match([tokenType.while])) {
            return await this.whileStatement();
        }

        if (this.match([tokenType.switch])) {
            return this.switchStatement
                ();
        }

        if (this.match([tokenType.defer])) {
            var stmt = await this.statement();
            return new Statement().newDefer(stmt);
        }

        if (this.match([tokenType.asm])) {
            var lines: string[] = []
            this.expect(tokenType.leftbrace, "expect { after asm");
            while (!this.check(tokenType.rightbrace)) {
                lines.push(this.expect(tokenType.string, "expect asm statements").value as string);
            }
            this.expect(tokenType.rightbrace, "Expect } after asm body");
            return new Statement().newAsmStatement(lines);
        }

        return this.ExprStatement();
    }

    parseType(curr_struct?: string): Type {
        if (this.match([tokenType.leftsquare])) {
            var len = this.expect(tokenType.number, "Expect size of array").value;
            this.expect(tokenType.rightsquare, "] expected");
            var base = this.parseType(curr_struct);
            return new Type().newArray(base, len as number);
        }

        if (this.match([tokenType.bitand])) {
            return new Type().newSlice(this.parseType(curr_struct));
        }
        var prev = this.previous();
        var tok = this.advance();
        if (tok.type === tokenType.multiply) {
            return new Type().newPointer(this.parseType(curr_struct));
        }


        switch (tok.type) {
            case tokenType.void:
                return voidtype;
            case tokenType.i8:
                return i8;
            case tokenType.i16:
                return i16;
            case tokenType.i32:
                return i32;
            case tokenType.i64:
                return i64;
            case tokenType.u8:
                return u8;
            case tokenType.u16:
                return u16;
            case tokenType.u32:
                return u32;
            case tokenType.u64:
                return u64;
            case tokenType.bool:
                return bool;
            case tokenType.f32:
                return f32;
            case tokenType.argv:
                return argv;
            case tokenType.identifier:
                var struc = searchStruct(tok.value as string);
                if (struc) {
                    return struc;
                }
                var en = getEnum(tok.value as string);
                if (en) {
                    return en;
                }

                var tbn = Type.getTypeByName(tok.value as string)
                if (tbn) {
                    return tbn;
                }

                if (curr_struct) {
                    if (tok.value === curr_struct) {
                        if(prev.type === tokenType.rightsquare) {
                            tokenError(`Attempt to declare recursive struct`, tok);
                        }
                        return self_ref;
                    }
                }
                tokenError("Undefined Type", tok);
                break;
            default:
                break;
        }

        tokenError("[..]Expect type", tok);
        return i64;
    }

    async rvalue(): Promise<Expression> {
        var initializer = await this.expression();
        return initializer;
    }

    validGlobalInitializer(expr: Expression): boolean {
        if (expr.type === exprType.identifier) return false;
        if (this.isLiteral(expr)) return true;
        if (this.isConstExpr(expr)) return true;
        if (expr.datatype.kind === myType.slice && expr.datatype.base === u8) {
            return true;
        }

        if (expr.type === exprType.address && expr.left?.type === exprType.identifier) {
            return true;
        }

        if(expr.type === exprType.assigned_for_use) return true;

        if(expr.type  === exprType.undefnd) return true;

        return false;
    }

    async varDeclaration(is_template: boolean, holders?: string[]): Promise<Statement> {
        var name = this.expect(tokenType.identifier, "var name");
        var initializer: Expression;
        var type: Type | undefined = undefined;
        if (this.match([tokenType.colon])) {
            type = this.parseType();
        }
        var eq = this.expect(tokenType.equal, "var initializer");
        initializer = await this.rvalue();


        if (initializer.type === exprType.undefnd && type === undefined) {
            tokenError("Type not known", this.previous());
        }

        type = type ?? initializer.datatype;
        //console.error(initializer);
        var variable = incLocalOffset(name.value as string, type as Type, name, initializer);
        
        //if(!isResolutionPass()) console.error(initializer,"=======");
        if (variable.is_global && !this.validGlobalInitializer(initializer)) {
            tokenError("Global initializer should be const expression", eq)
        }

        if (initializer.type === exprType.call && type.size > 8) {
            initializer.params.splice(0, 0, new Expression().newExprAddress(new Expression().newExprIdentifier(variable)));
        }


        initializer = new Expression().newExprAssign(
            new Expression().newExprIdentifier(variable)
            , initializer, eq
        );


        this.expect(tokenType.semicolon, ";");
        return new Statement().newVarstatement(initializer);
    }

    // member

    externFuncDeclaration(): Statement {
        this.expect(tokenType.fn, "expected fn");
        var name = this.expect(tokenType.identifier, "fn name");
        this.expect(tokenType.leftparen, "( after fn name");
        var params: { name: string, datatype: Type, module_name: string }[] = [];
        if (!this.check(tokenType.rightparen)) {
            while (true) {
                var paramname = this.expect(tokenType.identifier, "param name");

                this.expect(tokenType.colon, "Expect : after name");
                var type = this.parseType();

                params.push({ name: paramname.value as string, datatype: type, module_name: "" });
                if (!this.check(tokenType.comma)) break;
                this.advance();
            }
        }
        this.expect(tokenType.rightparen, ") after params");
        var type = this.parseType();
        this.expect(tokenType.semicolon, ";");
        pushFunction(name.value as string, params, fnType.extern, type);
        return new Statement().newExternFnStatement(name.value as string, params);
    }

    async nativeFuncDeclaration(name_space?: string): Promise<Statement> {
        //this.expect(tokenType.fn, "expected fn");
        var name = this.expect(tokenType.identifier, "fn name").value as string;
        if (name_space) name = name_space + name;
        this.expect(tokenType.leftparen, "( after fn name");
        var params: { name: string, datatype: Type, module_name: string }[] = [];
        if (!this.check(tokenType.rightparen)) {
            while (true) {
                var paramname = this.expect(tokenType.identifier, "param name");

                this.expect(tokenType.colon, "Expect : after name");
                var type = this.parseType();

                params.push({ name: paramname.value as string, datatype: type, module_name: "" });
                if (!this.check(tokenType.comma)) break;
                this.advance();
            }
        }
        this.expect(tokenType.rightparen, ") after params");
        var type = this.parseType();
        var curr_fn = pushFunction(name, params, fnType.native, type);
        if (this.match([tokenType.semicolon])) {
            return new Statement().newNativeFnStatement(name as string);
        }
        setCurrentFuction(curr_fn);
        this.expect(tokenType.leftbrace, "{");
        var body = await this.block();
        resetCurrentFunction(name, body);
        return new Statement().newNativeFnStatement(name as string);
    }

    anonTaggedUnionDeclaration(): Statement {
        var name_tok = this.expect(tokenType.identifier, "name");
        var name = name_tok.value as string;
        this.expect(tokenType.leftbrace, "{");

        var strucmembers: { name: string, datatype: Type, default: Expression | undefined }[] = [];
        var enumvalues: { name: string, value: Expression }[] = [];

        var i = 0;

        if (!this.check(tokenType.rightbrace)) {
            while (true) {
                var field_tok = this.expect(tokenType.identifier, "field name");
                var field_name = field_tok.value as string;
                this.expect(tokenType.colon, ":");
                var field_type = this.parseType(name);
                strucmembers.push({ name: field_name, datatype: field_type, default: undefined });
                enumvalues.push({ name: field_name, value: new Expression().newExprNumber(i) });
                i++;
                if (!this.match([tokenType.comma])) break;
            }
        }
        var enum_ = new Type().newEnum("", enumvalues);
        var tg = new Type().newTaggedUnion(name, strucmembers, enum_)
        tg.replaceSelfRef();
        if (isResolutionPass()) pushEnum(enum_, name_tok);
        if (isResolutionPass()) pushStructType(tg, name_tok);
        this.expect(tokenType.rightbrace, "}");
        return new Statement();
    }

    taggedUnionDeclaration(): Statement {
        if (this.match([tokenType.rightparen])) {
            return this.anonTaggedUnionDeclaration();
        }
        var tag_name = this.expect(tokenType.identifier, "Tag Enum name");
        var tag_enum = getEnum(tag_name.value as string);
        if (!tag_enum) {
            tokenError("Undefined enum", tag_name);
        }
        this.expect(tokenType.rightparen, ")");
        var name_tok = this.expect(tokenType.identifier, "name");
        var name = name_tok.value as string;
        this.expect(tokenType.leftbrace, "{");

        var strucmembers: { name: string, datatype: Type, default: Expression | undefined }[] = [];

        //strucmembers.push({name:"tag", datatype:tag_enum as Type, default:undefined})

        var handled: string[] = [];

        if (!this.check(tokenType.rightbrace)) {
            while (true) {
                var field_tok = this.expect(tokenType.identifier, "field name");
                var field_name = field_tok.value as string;
                if (!tag_enum?.enumvalues.find((v) => v.name === field_name)) {
                    tokenError(`${field_name} is not a member of ${tag_enum?.name}`, field_tok);
                }
                handled.push(field_name);
                this.expect(tokenType.colon, ":");
                var field_type = this.parseType(name);
                strucmembers.push({ name: field_name, datatype: field_type, default: undefined });
                if (!this.match([tokenType.comma])) break;
            }
        }

        tag_enum?.enumvalues.forEach((v) => {
            if (!handled.find((h) => h === v.name)) {
                tokenError(`${tag_enum?.name}.${v.name} not handled`, this.peek());
            }
        })

        var tg = new Type().newTaggedUnion(name, strucmembers, tag_enum as Type);
        tg.replaceSelfRef();

        if (isResolutionPass()) pushStructType(tg, name_tok);
        this.expect(tokenType.rightbrace, "}");
        return new Statement();
    }

    structDeclaration(isunion: boolean): Statement {
        var first_pass = true;

        if (this.match([tokenType.leftparen])) {
            return this.taggedUnionDeclaration();
        }

        var struc: Type | undefined = undefined;
        var name_tok = this.expect(tokenType.identifier, "expect struct or union name")
        var name = name_tok.value as string;
        this.expect(tokenType.leftbrace, "Expect struct body");
        var strucmembers: { name: string, datatype: Type, default: Expression | undefined }[] = [];

        while (!this.check(tokenType.rightbrace)) {
            var member: { name: string, datatype: Type, default: Expression | undefined } = { name: "", datatype: u8, default: undefined };
            member.name = this.expect(tokenType.identifier, "Expect member name").value as string;
            this.expect(tokenType.colon, "expect : after name");

            if(this.peek().type === tokenType.identifier) {
                if(this.peek().value === name) {
                    tokenError(`Attempt to declare recursive struct`, this.peek());
                }
            }

            member.datatype = this.parseType(name);
            strucmembers.push(member);

            if (this.check(tokenType.comma)) {
                this.advance();
            } else {
                break;
            }

        }

        this.expect(tokenType.rightbrace, "Expect } after struct body");


        if (isunion) {
            struc = new Type().newUnion(name, strucmembers)
        } else {
            struc = new Type().newStruct(name, strucmembers)
        }
        struc.replaceSelfRef();
        if (isResolutionPass() ) pushStructType(struc, name_tok);

        return new Statement().newStructDeclStatement();
    }

    async enumDeclaration(): Promise<Statement> {
        var name_tok = this.expect(tokenType.identifier, "expect enum name");
        var name = name_tok.value as string;
        this.expect(tokenType.leftbrace, "Expect enum body");
        var enumvalues: { name: string, value: Expression }[] = [];

        if (this.check(tokenType.rightbrace)) {
            this.expect(tokenType.leftbrace, "enum field")
        }

        var currval = 0;
        while (!this.check(tokenType.leftbrace)) {
            var tok = this.expect(tokenType.identifier, "expect enum field");

            if (this.match([tokenType.equal])) {
                var equal = this.previous();
                var expr = await this.expression();
                if (!this.isConstExpr(expr)) {
                    tokenError("Expect constant expression", equal);
                }
                expr = this.evalConst(expr);
                enumvalues.push({ name: tok.value as string, value: expr });
                currval += expr.val + 1;
            } else {
                enumvalues.push({ name: tok.value as string, value: new Expression().newExprNumber(currval) });
                currval++;
            }
            if (!this.check(tokenType.comma)) {
                break;
            }
            this.advance();
        }
        this.expect(tokenType.rightbrace, "Expect } after enum fields");
        if (isResolutionPass()) pushEnum(new Type().newEnum(name, enumvalues), name_tok);
        return new Statement().newEnum();
    }

    async moduleDeclaration(): Promise<Statement> {
        var statements: Statement[] = [];
        var name = this.expect(tokenType.identifier, "Expect module name").value;
        pushModule(name as string);
        this.expect(tokenType.leftbrace, "Expect module body");
        while (!this.check(tokenType.rightbrace)) {
            statements.push(await this.declaration());
        }
        this.expect(tokenType.rightbrace, "Expect } after module body");
        popModule();
        return new Statement().newModule(name as string, statements);
    }

    async implModuleDeclaration(): Promise<Statement> {
        var statements: Statement[] = [];
        var name = this.expect(tokenType.identifier, "Expect module name").value as string;
        pushModule(name as string);
        var struc = searchStruct(name as string);
        if (struc === undefined) {
            tokenError("no such struct", this.previous());
        }
        this.expect(tokenType.leftbrace, "Expect module body");
        while (!this.check(tokenType.rightbrace)) {
            var member = await this.nativeFuncDeclaration(name as string);
            struc?.member_fn_names.push(member.name.substring(name.length));
            statements.push(member);
        }
        this.expect(tokenType.rightbrace, "Expect } after module body");
        popModule();
        return new Statement().newModule(name as string, statements);
    }

    async moduleImport() {
        var path = this.expect(tokenType.string, "Expect path").value as string;
        await compile(path);
        return new Statement();
    }

    async declaration(): Promise<Statement> {
        if (this.match([tokenType.impl])) {
            return this.implModuleDeclaration();
        }

        if (this.match([tokenType.import])) {
            return await this.moduleImport()
        }

        if (this.match([tokenType.var])) {
            return this.varDeclaration(false);
        }

        if (this.match([tokenType.extern])) {
            return this.externFuncDeclaration();
        }

        if (this.match([tokenType.fn])) {
            return this.nativeFuncDeclaration();
        }

        if (this.match([tokenType.struct, tokenType.union])) {
            return this.structDeclaration(this.previous().type === tokenType.union ? true : false);
        }

        if (this.match([tokenType.enum])) {
            return await this.enumDeclaration();
        }

        if (getcurrFn() >= 0) {
            return this.statement();
        }

        tokenError("unexpected token", this.peek());
        return this.statement();
    }

    async parse(): Promise<Statement[]> {
        var stmts: Statement[] = [];
        while (this.moreTokens()) {
            stmts.push(await this.declaration());
        }

        return stmts;
    }

    reset() {
        this.current = 0;
    }

    constructor(tokens: Token[]) {
        this.tokens = tokens;
        this.current = 0;
    }
}
