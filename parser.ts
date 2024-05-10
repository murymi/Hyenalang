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
import { Type, alignTo, argv, bool, f32, getEnum, getOffsetOfMember, i16, i32, i64, i8, myType, popModule, pushEnum, pushModule, pushStructType, searchStruct, u16, u32, u64, u8, voidtype } from "./type";
import { relative } from "node:path";
import { cwd } from "node:process";

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
            this.tokenError("Expected " + name + " found ", this.peek());
        }
        return this.advance();
    }

    tokenError(message: string, token: Token): void {
        console.error(`${colors.yellow + relative(cwd(),token.file_name) + colors.green}:${token.line}:${token.col} ${colors.red + message} '${token.value}'${colors.reset} `);
        console.table(isResolutionPass());
        process.exit();
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
                        this.tokenError("unsupported unary operator", expr.operator as Token);
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
                        this.tokenError("unsupported binary operator", expr.operator as Token);
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

    assignBeforeUse(val: Expression): { assign: Expression, id: Expression } {
        var variable = incLocalOffset("", val.datatype);
        var id = new Expression().newExprIdentifier(variable);
        if (val.type === exprType.call && val.datatype.size > 8) {
            val.params.splice(0, 0, new Expression().newExprAddress(id));
        }
        var assign = new Expression().newExprAssign(id, val);
        return { assign: assign, id: id }
    }

    async structLiteral(name: string): Promise<Expression> {
        var struc_type = searchStruct(name) as Type;
        var setters: { field_offset: number, data_type: Type, value: Expression }[] = [];
        this.expect(tokenType.leftbrace, "{");
        if (!this.check(tokenType.rightbrace)) {
            while (true) {
                this.expect(tokenType.dot, ".");
                var member_tok = this.expect(tokenType.identifier, "identifier");
                var fo = getOffsetOfMember(struc_type, member_tok);
                this.expect(tokenType.equal, "=");
                setters.push({ field_offset: fo.offset, data_type: fo.datatype, value: await this.expression() });
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

    async arrayLiteral(): Promise<Expression> {
        this.expect(tokenType.rightsquare, "]");
        var base = this.parseType(false);
        this.expect(tokenType.leftbrace, "{");
        var setters: { field_offset: number, data_type: Type, value: Expression }[] = [];
        var offset = 0;
        while (true) {
            setters.push({ field_offset: offset, data_type: base, value: await this.expression() });
            offset += base.size;
            if (!this.match([tokenType.comma])) break;
        }
        this.expect(tokenType.rightbrace, "}");

        return new Expression().arrayLiteral(setters, new Type().newArray(base, setters.length));
    }

    async nameLessStruct(): Promise<Expression> {
        this.expect(tokenType.leftbrace, "{");
        var setters: { field_offset: number, data_type: Type, value: Expression }[] = [];
        var offset = 0;
        var data_type = new Type();
        data_type.align = 0;
        data_type.members = [];
        while (true) {
            var expr = await this.expression();
            offset = alignTo(expr.datatype.align, offset);
            setters.push({ field_offset: offset, data_type: expr.datatype, value: expr });
            data_type.members.push({ name: "", offset: offset, type: expr.datatype, default: undefined });
            offset += expr.datatype.size;
            if (data_type.align < expr.datatype.align) {
                data_type.align = expr.datatype.align;
            }
            if (!this.match([tokenType.comma])) break;
        }
        //setters.splice(0, 0, { field_offset: 0, data_type:u64 , value:new Expression().newExprNumber(data_type.members.length) });
        //data_type.members.splice(0, 0,{name:"len", offset:0, type:u64, default:undefined})
        data_type.size = alignTo(data_type.align, offset);
        data_type.kind = myType.tuple;
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

        this.tokenError(`enum ${id} has no field`, tok);
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
        this.tokenError(`unsupported escape sequence \\${char.value}`, char);
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

        if (this.match([tokenType.at])) {
            var what = this.expect(tokenType.identifier, "expect option");
            this.expect(tokenType.leftparen, "(");
            var ex: Expression | undefined = undefined;
            switch (what.value) {
                case "sizeof":
                    if (this.check(tokenType.identifier)) {
                        if (this.isTypeId(this.peek().value as string)) {
                            ex = new Expression().newExprNumber(this.parseType(false).size);
                            console.error(ex, isResolutionPass());
                        } else {
                            var size = (await this.expression()).datatype.size;
                            ex = new Expression().newExprNumber(size);
                        }
                    } else if (this.check(tokenType.number)) {
                        var size = (await this.expression()).datatype.size;
                        ex = new Expression().newExprNumber(size);
                    } else {
                        ex = new Expression().newExprNumber(this.parseType(false).size);
                    }
                    break;
                case "alignof":
                    if (this.check(tokenType.identifier)) {
                        if (this.isTypeId(this.peek().value as string)) {
                            ex = new Expression().newExprNumber(this.parseType(false).align);
                        } else {
                            var size = (await this.expression()).datatype.align;
                            ex = new Expression().newExprNumber(size);
                        }
                    } else if (this.check(tokenType.number)) {
                        var size = (await this.expression()).datatype.align;
                        ex = new Expression().newExprNumber(size);
                    } else {
                        ex = new Expression().newExprNumber(this.parseType(false).align);
                    }
                    break;
                    break;
                default:
                    this.tokenError("unknown expression", what);
            }
            this.expect(tokenType.rightparen, ")");
            return ex as Expression;
        }

        if (this.match([tokenType.undefined])) {
            return new Expression().newExprUndefined();
        }

        if (this.match([tokenType.squote])) {
            var tok = this.advance()
            var val = tok.value.toString();

            if (tok.type === tokenType.bslash) {
                val = this.getEscape(this.advance());
            }

            if (val.length !== 1) {
                this.tokenError("expected single character", this.previous());
            }
            this.expect(tokenType.squote, "Expect closing ' ");
            var expr = new Expression().newExprNumber(val.charCodeAt(0));
            expr.datatype = i8;
            return expr
        }
        //console.log(this.peek());
        this.tokenError("unexpected token", this.peek());
        throw new Error("Unexpected token");

    }

    async finishCall(callee: Expression, optional?: Expression): Promise<Expression> {
        if (callee.datatype.kind !== myType.function && !isResolutionPass()) {
            this.tokenError("Not a function", this.previous());
        }
        var args: Expression[] = [];
        if (!this.check(tokenType.rightparen)) {
            do {
                var arg = await this.expression();
                if (arg.datatype.size > 8 && arg.type !== exprType.identifier) {
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
            this.tokenError(callee.name + " expects " + callee.datatype.arity + " args but " + args.length + " provided.", fntok);
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
            this.tokenError(`${expr.datatype.name} has no such member function`, this.previous());
        }

        this.expect(tokenType.leftparen, "Expect ( ");
        return await this.finishCall(fakeid, new Expression().newExprAddress(expr));
    }

    async getFunctionFromStructPtr(expr: Expression, meta: { offset: number, datatype: Type, name: string }, tok: Token): Promise<Expression> {
        var obj = getLocalOffset(meta.name, tok);
        var fakeid = new Expression().newExprFnIdentifier(meta.name, obj.datatype);
        this.expect(tokenType.leftparen, "Expect ( ");
        if (obj.datatype.arguments.length === 0 || !this.typeEql(obj.datatype.arguments[0].datatype.base, expr.datatype.base)) {
            this.tokenError(`${expr.datatype.base.name} has no such member function`, this.previous());
        }
        return await this.finishCall(fakeid, expr);
    }

    async parseGet(expr: Expression): Promise<Expression> {
        var propname = this.advance();

        if (isResolutionPass()) {
            return new Expression().newExprGet(0, new Expression(), voidtype);
        }

        if (expr.datatype === undefined || !this.isStructure(expr.datatype)) {
            console.error(`${expr.name} has no members ${isResolutionPass()}`);
            console.error(expr.datatype);
            process.exit(1);
        }

        if (propname.type === tokenType.identifier || propname.type === tokenType.multiply) { } else {
            this.tokenError("expect property name after dot", this.peek());
        }

        if (expr.datatype.kind === myType.ptr && propname.type === tokenType.multiply) {
            return new Expression().newExprDeref(expr);
        }

        if (expr.datatype === undefined || !this.isStructure(expr.datatype)) {
            console.error(`${expr.name} has no members ${isResolutionPass()}`);
            console.error(expr.datatype);
            process.exit(1);
        }

        if (expr.datatype.kind === myType.ptr) {
            expr = new Expression().newExprDeref(expr);
        }

        var meta = getOffsetOfMember(expr.datatype, propname);
        if (meta.offset === -1) {
            return await this.getFunctionFromStruct(expr, meta, propname);
        }

        if (expr.type !== exprType.identifier) {
            var ab = this.assignBeforeUse(expr);
            var get = new Expression().newExprGet(meta.offset, ab.id, meta.datatype);
            return new Expression().newAssignForUse(ab.assign, get);
        } else {
            return new Expression().newExprGet(meta.offset, expr, meta.datatype);
        }
    }

    parseSliceIndex(expr: Expression, index: Expression): Expression {
        var ex = new Expression().newExprGet(8/*ptr*/, expr, new Type().newPointer(expr.datatype.base));
        var ret = new Expression().newExprDeref(
            this.evalConst(
                new Expression().newExprBinary(new Token(tokenType.plus, "+", 0, 0, ""), ex,
                    new Expression().newExprBinary(
                        new Token(tokenType.multiply, "*", 0, 0, ""),
                        new Expression().newExprNumber(expr.datatype.base.size),
                        index
                    ))
            )
        )
        ret.type = exprType.deref;
        ret.datatype = expr.datatype.base;
        return ret;
    }

    parseArrayIndex(expr: Expression, index: Expression): Expression {
        var ret = new Expression().newExprDeref(
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

        ret.type = exprType.deref;
        ret.datatype = expr.datatype.base
        return ret;
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
            this.tokenError("invalid index", this.previous());
        }
        return new Expression().newExprGet(
            expr.datatype.members[index.val as number].offset,
            expr, expr.datatype.members[index.val as number].type);
    }

    async parseTuplePtrIndex(expr: Expression, index: Expression): Promise<Expression> {
        if (index.val > expr.datatype.base.members.length) {
            this.tokenError("invalid index", this.previous());
        }
        return new Expression().newExprGet(
            expr.datatype.base.members[index.val as number].offset,
            new Expression().newExprDeref(expr), expr.datatype.base.members[index.val as number].type);
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
        if (expr.datatype.kind === myType.ptr) expr = new Expression().newExprDeref(expr);
        switch (expr.datatype.kind) {
            case myType.slice:// likes char*
                switch (t.type) {
                    case tokenType.range:
                        if (expr.type !== exprType.identifier) {
                            var ab = this.assignBeforeUse(expr);
                            var slicer = await this.parseSliceSlide(ab.id, index);
                            return new Expression().newAssignForUse(ab.assign, slicer);
                        }
                        return this.parseSliceSlide(expr, index)
                    case tokenType.rightsquare:
                        if (expr.type !== exprType.identifier) {
                            var ab = this.assignBeforeUse(expr);
                            var slicer = await this.parseSliceIndex(ab.id, index);
                            return new Expression().newAssignForUse(ab.assign, slicer);
                        }
                        return this.parseSliceIndex(expr, index);
                    default:
                        this.tokenError("Expect ]", t);

                }
                break;
            case myType.array:
                switch (t.type) {
                    case tokenType.range:
                        if (expr.type !== exprType.identifier) {
                            var ab = this.assignBeforeUse(expr);
                            var slicer = await this.parseArraySlide(ab.id, index);
                            return new Expression().newAssignForUse(ab.assign, slicer);
                        }
                        return this.parseArraySlide(expr, index)
                    case tokenType.rightsquare:
                        if (expr.type === exprType.call || this.isLiteral(expr)) {
                            var ab = this.assignBeforeUse(expr);
                            var slicer = this.parseArrayIndex(ab.id, index);
                            return new Expression().newAssignForUse(ab.assign, slicer);
                        }
                        return this.parseArrayIndex(expr, index);
                    default:
                        this.tokenError("Expect ]", t);

                }
                break;
            case myType.tuple:
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
            this.tokenError("No such struct", name);
        }
        var tok = this.expect(tokenType.identifier, "Expect fn name")
        var fnname = tok.value as string;

        if (struc?.member_fn_names.find((f) => f === fnname) === undefined) {
            this.tokenError(`${struc?.name} has no fn ${fnname}`, this.previous());
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

            if (this.isLiteral(left)) {
                var ab = this.assignBeforeUse(left);
                return new Expression().newAssignForUse(ab.assign, new Expression().newExprAddress(ab.id));
            }
            return new Expression().newExprAddress(left);
        }

        return await this.call();
    }

    async cast(): Promise<Expression> {
        if (this.match([tokenType.cast])) {
            this.expect(tokenType.leftparen, "(");
            var type = this.parseType(false);
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
            expr = new Expression().newExprBinary(operator, expr, right);
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
        if (this.match([tokenType.bitand])) {
            var operator = this.previous();
            var right = await this.relational();
            expr = new Expression().newExprBinary(operator, expr, right);
        }
        return expr;
    }

    async bitwiseXor(): Promise<Expression> {
        var expr = await this.BitwiseAnd();
        if (this.match([tokenType.bitxor])) {
            var operator = this.previous();
            var right = await this.BitwiseAnd();
            expr = new Expression().newExprBinary(operator, expr, right);
        }
        return expr;
    }

    async bitwiseOr(): Promise<Expression> {
        var expr = await this.bitwiseXor();
        if (this.match([tokenType.bitor])) {
            var operator = this.previous();
            var right = await this.bitwiseXor();
            expr = new Expression().newExprBinary(operator, expr, right);
        }
        return expr;
    }

    async logicalAnd(): Promise<Expression> {
        var expr = await this.bitwiseOr();
        if (this.match([tokenType.and])) {
            var operator = this.previous();
            var right = await this.bitwiseOr();
            expr = new Expression().newExprBinary(operator, expr, right);
        }
        return expr;
    }

    async logicalOr(): Promise<Expression> {
        var expr = await this.logicalAnd();
        if (this.match([tokenType.or])) {
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
                this.tokenError("Unexpected operator", equals);
                return tokenType.addeq
        }
    }

    async ternary(): Promise<Expression> {
        //var expr = await this.logicalOr();
        if (this.match([tokenType.if])) {
            this.expect(tokenType.leftparen, "Expect (");
            var cond = await this.expression();
            this.expect(tokenType.rightparen, "Expect )");
            var if_expr = await this.expression();
            this.expect(tokenType.else, "Expect else ");
            var else_expr = await this.expression();
            return new Expression().newIfExpr(cond, if_expr, else_expr)
        }

        return this.logicalOr();
    }

    async assign(): Promise<Expression> {
        var expr = await this.ternary();
        // identifier 
        // a.c.foo -> get
        //  a[0] -> deref
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

            /**
             * a += 1;
             * a = a + 1;
             */


            if (equals.type !== tokenType.equal) {
                var operator = this.getOperator(equals);
                val = new Expression().newExprBinary(new Token(operator, "", 0, 0, ""), expr, val)
            }
            switch (expr.type) {
                case exprType.identifier:
                case exprType.deref:
                    return new Expression().newExprAssign(expr, val);
                case exprType.get:
                    return new Expression().newExprSet(expr, val);
                default:
                    console.error(expr);
                    this.tokenError("Unexpected assignment", equals);
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
            var variable = incLocalOffset("", expr.datatype)
            expr.params.splice(0, 0, new Expression().newExprAddress(
                new Expression().newExprIdentifier(variable)))
        }
        this.expect(tokenType.semicolon, ";");
        return new Statement().newReturnStatement(expr);
    }

    async ifStatement(): Promise<Statement> {
        this.expect(tokenType.leftparen, "( after if");
        var cond = await this.expression();
        this.expect(tokenType.rightparen, ") after condition");
        var then = await this.statement();
        var else_: Statement | undefined = undefined;
        if (this.match([tokenType.else])) {
            else_ = await this.statement();
        }
        return new Statement().newIfStatement(cond, then, else_);
    }

    async switchStatement(): Promise<Statement> {
        this.expect(tokenType.leftparen, "Expect ( after switch");
        var cond = await this.expression();
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
                    if (this.match([tokenType.range])) {
                        var expr2 = await this.expression();
                        cases.push(new Expression().newExprCase(prongs.length, new Expression().newExprRange(expr, expr2)));
                    } else {
                        cases.push(new Expression().newExprCase(prongs.length, expr));
                    }
                }
                if (!this.check(tokenType.comma)) { can_else = true; break; };
                this.advance();
                can_else = false;
            }

            this.expect(tokenType.plong, "Expect plong");
            var pron = await this.statement();

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
            this.tokenError("missing else branch", this.peek());
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
        this.expect(tokenType.leftbrace, "{");
        beginScope();
        endScope();
        await this.block();
        return new Statement();
    }

    async integerLoop(): Promise<Statement> {
        if (isResolutionPass()) {
            return await this.loopRes();
        }

        var ranges: { range: Expression, range_type: rangeType, id: Expression | undefined }[] = []
        while (true) {
            var bottom = await this.expression();
            if (bottom.datatype.isInteger()) {
                ranges.push({ range: await this.makeIntRange(bottom), range_type: rangeType.int, id: undefined });
            } else {
                switch (bottom.datatype.kind) {
                    case myType.array:
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
                        this.tokenError("attemp to loop unsupported type", this.previous());
                }
            }

            if (!this.check(tokenType.comma)) break;
            this.advance();
        }

        this.expect(tokenType.rightparen, ") after condition");
        this.expect(tokenType.pipe, "loop payload");
        var variables: { ptr: boolean, name: string }[] = [];
        for (let i = 0; i < ranges.length; i++) {
            if (this.match([tokenType.multiply])) {
                variables.push({ ptr: true, name: this.expect(tokenType.identifier, "identifier").value as string });
            } else {
                variables.push({ ptr: false, name: this.expect(tokenType.identifier, "identifier").value as string });
            }
            if (i < ranges.length - 1) {
                this.expect(tokenType.comma, ",");
            }
        }

        this.expect(tokenType.pipe, "|");
        this.expect(tokenType.leftbrace, "{");
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
                var ptr_var = incLocalOffset(variables[i].name, data_type, new Expression().newExprUndefined());
                var counter = incLocalOffset("", u64, ranges[i].range.left);
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
                    counter: incLocalOffset(variables[i].name, u64, ranges[i].range.left),
                    range_type: rangeType.int,
                    range: ranges[i].range,
                    ptr: undefined, array_id: undefined, index_var: undefined
                });
            }
        }

        var body = await this.block();
        endScope();
        return new Statement().newIntLoop(body, metadata);
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

    parseType(is_template: boolean, holders?: string[]): Type {
        if (this.match([tokenType.leftsquare])) {
            var len = this.expect(tokenType.number, "Expect size of array").value;
            this.expect(tokenType.rightsquare, "] expected");
            var base = this.parseType(is_template, holders);
            return new Type().newArray(base, len as number);
        }

        if (this.match([tokenType.bitand])) {
            return new Type().newSlice(this.parseType(is_template, holders));
        }

        var tok = this.advance();
        if (tok.type === tokenType.multiply) {
            return new Type().newPointer(this.parseType(is_template, holders));
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
                if (is_template) {
                    if (holders?.find((h) => h === tok.value)) return new Type().newTemp(tok.value as string);
                }
                var tbn = Type.getTypeByName(tok.value as string)
                if (tbn) {
                    return tbn;
                }
                this.tokenError("Undefined Type", tok);
                break;
            default:
                break;
        }

        this.tokenError("[..]Expect type", tok);
        return i64;
    }

    async rvalue(): Promise<Expression> {
        var initializer = await this.expression();
        return initializer;
    }

    async varDeclaration(is_template: boolean, holders?: string[]): Promise<Statement> {
        var name = this.expect(tokenType.identifier, "var name");
        var initializer: Expression;
        var type: Type | undefined = undefined;
        if (this.match([tokenType.colon])) {
            type = this.parseType(is_template, holders)
        }
        this.expect(tokenType.equal, "var initializer");
        initializer = await this.rvalue();


        if (initializer.type === exprType.undefnd && type === undefined) {
            this.tokenError("Type not known", this.previous());
        }

        if (initializer.datatype.kind === myType.string) {
            new Type().newSlice(u8);
        }
        type = type ?? initializer.datatype;
        //console.error(initializer);
        var variable = incLocalOffset(name.value as string, type as Type, initializer);

        if (initializer.type === exprType.call && type.size > 8) {
            initializer.params.splice(0, 0, new Expression().newExprAddress(new Expression().newExprIdentifier(variable)));
        }

        if (initializer.datatype.kind === myType.string) {
            initializer =
                new Expression().newExprAssign(
                    new Expression().newExprIdentifier(variable),
                    new Expression().newExprSlideString(initializer))
        } else {
            initializer = new Expression().newExprAssign(
                new Expression().newExprIdentifier(variable)
                , initializer
            );
        }
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
                var type = this.parseType(false);

                params.push({ name: paramname.value as string, datatype: type, module_name: "" });
                if (!this.check(tokenType.comma)) break;
                this.advance();
            }
        }
        this.expect(tokenType.rightparen, ") after params");
        var type = this.parseType(false);
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
                var type = this.parseType(false);

                params.push({ name: paramname.value as string, datatype: type, module_name: "" });
                if (!this.check(tokenType.comma)) break;
                this.advance();
            }
        }
        this.expect(tokenType.rightparen, ") after params");
        var type = this.parseType(false);
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

    structDeclaration(isunion: boolean): Statement {
        var name_tok = this.expect(tokenType.identifier, "expect struct or union name")
        var name = name_tok.value as string;
        this.expect(tokenType.leftbrace, "Expect struct body");
        var strucmembers: { name: string, datatype: Type, default: Expression | undefined }[] = [];

        while (!this.check(tokenType.rightbrace)) {
            var member: { name: string, datatype: Type, default: Expression | undefined } = { name: "", datatype: u8, default: undefined };
            member.name = this.expect(tokenType.identifier, "Expect member name").value as string;
            this.expect(tokenType.colon, "expect : after name");
            member.datatype = this.parseType(false);

            strucmembers.push(member);
            if (this.check(tokenType.comma)) {
                this.advance();
            } else {
                break;
            }

        }

        this.expect(tokenType.rightbrace, "Expect } after struct body");
        if (isResolutionPass()) pushStructType(isunion ? new Type().newUnion(name, strucmembers) : new Type().newStruct(name, strucmembers), name_tok)
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
                    this.tokenError("Expect constant expression", equal);
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
            this.tokenError("no such struct", this.previous());
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

        this.tokenError("unexpected token", this.peek());
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
