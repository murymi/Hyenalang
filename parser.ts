import { Token } from "./token";
import { tokenType } from "./token";
import { Expression, identifierType } from "./expr";
import { exprType } from "./expr";
import { Statement } from "./stmt";
import {
    Struct,
    addGlobal,
    beginScope,
    endScope,
    fnType,
    getEnum,
    getFn,
    getLocalOffset,
    getOffsetOfMember,
    getStruct,
    getcurrFn,
    incLocalOffset,
    pushEnum,
    pushFunction,
    pushStruct,
    resetCurrentFunction,
    setCurrentFuction
} from "./main";
import { Type, bool, f32, i16, i32, i64, i8, myType, u16, u32, u64, u8, voidtype } from "./type";

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
            this.tokenError("Expected " + name, this.peek());
        }
        return this.advance();
    }

    tokenError(message: string, token: Token): void {
        console.error(message + " - [ line: " + token.line + " col: " + token.col + " ]");
        process.exit();
    }

    primary(): Expression {
        if (this.match([tokenType.identifier])) {
            var obj = getLocalOffset(this.previous().value as string);
            if (obj.offset === -1) {
                return new Expression().newExprIdentifier(
                    this.previous().value as string, obj.offset,
                    obj.datatype, identifierType.func
                );
            }

            var idtype = identifierType.variable;
            var offset = obj.offset;

            if (obj.datatype.kind === myType.struct) {
                idtype = identifierType.struct;
            } else if (obj.datatype.kind === myType.array) {
                idtype = identifierType.array;
            }

            var expr = new Expression().newExprIdentifier(
                this.previous().value as string,
                offset,
                obj.datatype,
                idtype,
            );

            expr.is_glob = obj.glob;
            return expr;
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
            var expr = this.expression();
            this.expect(tokenType.rightparen, ")");
            return new Expression().newExprGrouping(expr);

        }

        if (this.match([tokenType.at])) {
            var what = this.expect(tokenType.identifier, "expect option");

            switch (what.value) {
                case "sizeof":
                case "alignof":
                    this.expect(tokenType.leftparen, "expect ( ");
                    var size = 0;
                    if (this.check(tokenType.identifier) || this.check(tokenType.number)) {
                        size = what.value === "sizeof" ? this.expression().datatype.size : this.expression().datatype.align;
                    } else {
                        size = size = what.value === "sizeof" ? this.parseType().size : this.parseType().align
                    }
                    this.expect(tokenType.rightparen, "expect ) ");
                    return new Expression().newExprNumber(size, false);
            }
        }



        this.tokenError("unexpected token", this.peek());
        throw new Error("Unexpected token");

    }

    finishCall(callee: Expression): Expression {
        var args: Expression[] = [];
        if (!this.check(tokenType.rightparen)) {
            do {
                args.push(this.expression());
            } while (this.match([tokenType.comma]));
        }
        var fntok = this.expect(tokenType.rightparen, ") after params");
        var fn = getFn(callee.name as string);

        var expr = new Expression().newExprCall(callee, fn.returnType);;
        expr.callee = callee;
        if (fn.arity !== args.length) {
            this.tokenError(fn.name + " expects " + fn.arity + " args but " + args.length + " provided.", fntok);
        }
        expr.params = args;
        expr.fntype = fn.type;
        return expr;
    }

    parseGet(expr: Expression): Expression {
        var propname = this.advance();
        if (propname.type === tokenType.identifier || propname.type === tokenType.multiply) { } else {
            this.tokenError("expect property name after dot", this.peek());
        }

        if (
            expr.datatype.kind === myType.struct ||
            expr.datatype.kind === myType.slice ||
            expr.datatype.kind === myType.array
        ) {
            var meta = getOffsetOfMember(expr.datatype, propname.value as string);
            return new Expression().newExprGet(meta.offset, expr, meta.datatype);
            //console.error("=================");
        } else if (expr.datatype.kind === myType.ptr) {
            return new Expression().newExprDeref(expr);
        } else if (expr.datatype.kind === myType.enum) {
            var val = expr.datatype.enumvalues.find((e) => e.name === propname.value);
            if (val) {
                return new Expression().newExprNumber(val.value);
            }
            console.error(`enum ${expr.name} has no field named ${propname.value}`);
            process.exit(1);
        } else {
            console.error("member access to non struct");
            process.exit(1);
        }
    }

    parseArrayIndex(expr: Expression): Expression {
        var index = this.expression();
        this.expect(tokenType.rightsquare, "Expect ]");
        return new Expression().newExprDeref(
            new Expression().newExprBinary(
                new Token(tokenType.plus, "+", 0, 0), expr,
                new Expression().newExprBinary(
                    new Token(tokenType.multiply, "*", 0, 0),
                    new Expression().newExprNumber(expr.datatype.size),
                    index
                )
            )
        )
    }

    parseSliceIndex(expr: Expression, index: Expression): Expression {
        var meta = getOffsetOfMember(expr.datatype, "ptr");
        var ex = new Expression().newExprGet(meta.offset, expr, meta.datatype);

        ///expr = new Expression().newExprGet(0, expr,)
        //console.error(expr.datatype.members[0].type.base.size);
        return new Expression().newExprDeref(
            new Expression().newExprBinary(new Token(tokenType.plus, "+", 0, 0), ex,
                new Expression().newExprBinary(
                    new Token(tokenType.multiply, "*", 0, 0),
                    new Expression().newExprNumber(expr.datatype.members[1].type.base.size),
                    index
                ))
        )
    }

    parseArraySlide(expr: Expression, index: Expression): Expression {
        //console.error("==========================");
        var end = this.expression();
        //console.log(this.peek());
        this.expect(tokenType.rightsquare, "Expect ] ");
        return new Expression().newExprSlideArray(expr, index, end);
    }

    parseSliceSlide(expr: Expression, index: Expression): Expression {
        //console.error("==========================");
        var end = this.expression();
        //console.log(this.peek());
        this.expect(tokenType.rightsquare, "Expect ] ");
        var s = new Expression().newExprSlideArray(expr, index, end);
        s.type = exprType.asld;
        return s;
    }

    index(expr: Expression): Expression {
        var index = this.expression();
        var t = this.advance();
        switch (expr.datatype.kind) {
            case myType.slice:
                switch (t.type) {
                    case tokenType.colon:
                        return this.parseSliceSlide(expr, index)
                    case tokenType.rightsquare:
                        return this.parseSliceIndex(expr, index);
                    default:
                        this.tokenError("Expect ]", t);

                }
                break;
            case myType.array:
                switch (t.type) {
                    case tokenType.colon:
                        return this.parseArraySlide(expr, index)
                    case tokenType.rightsquare:
                        return this.parseSliceIndex(expr, index);
                    default:
                        this.tokenError("Expect ]", t);

                }
                break;
            default:
                console.error("indexing non array");
                process.exit(1);

        }
        return new Expression();
    }

    // postfix
    call(): Expression {
        var expr = this.primary();
        while (true) {
            if (this.match([tokenType.leftparen])) {
                expr = this.finishCall(expr);
            } else if (this.match([tokenType.dot])) {
                expr = this.parseGet(expr);
            } else if (this.match([tokenType.leftsquare])) {
                expr = this.index(expr);
            } else {
                break;
            }
        }
        return expr;
    }

    unary(): Expression {
        if (this.match([tokenType.minus])) {
            var operator = this.previous();
            var right = this.unary();
            return new Expression().newExprUnary(operator, right);
        }


        if (this.match([tokenType.bitnot])) {
            var operator = this.previous();
            var right = this.unary();
            return new Expression().newExprUnary(operator, right);
        }

        if (this.match([tokenType.andsand])) {
            var left = this.unary();
            if (left.type === exprType.address) {
                console.error("wtf bro!,, thats unsupported here");
                process.exit(1);
            }
            return new Expression().newExprAddress(left);
        }

        return this.call();
    }

    factor(): Expression {
        var expr = this.unary();
        while (this.match([tokenType.divide, tokenType.multiply, tokenType.mod])) {
            var operator = this.previous();
            var right = this.unary();
            expr = new Expression().newExprBinary(operator, expr, right);
        }
        return expr;
    }

    term(): Expression {
        var expr = this.factor();

        while (this.match([tokenType.plus, tokenType.minus])) {
            var operator = this.previous();
            var right = this.factor();
            expr = new Expression().newExprBinary(operator, expr, right);
        }

        return expr;
    }

    comparisson(): Expression {
        var expr = this.term();

        while (this.match([tokenType.less, tokenType.greater, tokenType.gte, tokenType.lte])) {
            var operator = this.previous();
            var right = this.term();
            expr = new Expression().newExprBinary(operator, expr, right);
        }

        return expr;
    }

    relational(): Expression {
        var expr = this.comparisson();

        while (this.match([tokenType.neq, tokenType.eq])) {
            var operator = this.previous();
            var right = this.term();
            expr = new Expression().newExprBinary(operator, expr, right);
        }

        return expr;
    }

    BitwiseAnd(): Expression {
        var expr = this.relational();
        if (this.match([tokenType.bitand])) {
            var operator = this.previous();
            var right = this.relational();
            expr = new Expression().newExprBinary(operator, expr, right);
        }
        return expr;
    }

    bitwiseXor(): Expression {
        var expr = this.BitwiseAnd();
        if (this.match([tokenType.bitxor])) {
            var operator = this.previous();
            var right = this.BitwiseAnd();
            expr = new Expression().newExprBinary(operator, expr, right);
        }
        return expr;
    }

    bitwiseOr(): Expression {
        var expr = this.bitwiseXor();
        if (this.match([tokenType.bitor])) {
            var operator = this.previous();
            var right = this.bitwiseXor();
            expr = new Expression().newExprBinary(operator, expr, right);
        }
        return expr;
    }

    logicalAnd(): Expression {
        var expr = this.bitwiseOr();
        if (this.match([tokenType.and])) {
            var operator = this.previous();
            var right = this.bitwiseOr();
            expr = new Expression().newExprBinary(operator, expr, right);
        }
        return expr;
    }

    logicalOr(): Expression {
        var expr = this.logicalAnd();
        if (this.match([tokenType.or])) {
            var operator = this.previous();
            var right = this.logicalAnd();
            expr = new Expression().newExprBinary(operator, expr, right);
        }
        return expr;
    }

    assign(): Expression {
        var expr = this.logicalOr();

        var equals: Token;
        if (this.match([tokenType.equal])) {
            equals = this.previous();
            var val = this.assign();
            if (expr.type === exprType.identifier) {
                switch (expr.datatype.kind) {
                    case myType.slice:
                        var off = expr.offset;
                        var expr = new Expression().newExprAssign(expr, val);
                        expr.defaults = Statement.makeSliceCopy(off, val);
                        return expr;
                    default:
                        return new Expression().newExprAssign(expr, val);

                }
            } else if (expr.type === exprType.get) {
                var set = new Expression().newExprSet(expr, val);
                return set;
            } else if (expr.type === exprType.deref) {
                return new Expression().newExprAddressSet(expr, val);
            }
            console.error(expr);
            this.tokenError("Unexpected assignment", equals);
        }

        return expr;
    }

    expression(): Expression {
        return this.assign();
    }

    ExprStatement(): Statement {

        var expr = this.expression();
        this.expect(tokenType.semicolon, ";");
        var stmt = new Statement().newExprStatement(expr);
        return stmt;
    }

    block(): Statement {
        beginScope();
        var stmts: Statement[] = [];
        while (!this.check(tokenType.rightbrace) && this.moreTokens()) {
            stmts.push(this.declaration());
        }
        this.expect(tokenType.rightbrace, "}");
        endScope();
        return new Statement().newBlockStatement(stmts);
    }

    re_turn(): Statement {
        if (this.match([tokenType.semicolon])) {
            var expr = new Expression().newExprNumber(0);
            //expr.datatype = myType.void;
            expr.datatype = i64;
            return new Statement().newReturnStatement(expr);
        }

        var expr = this.expression();
        this.expect(tokenType.semicolon, ";");
        return new Statement().newReturnStatement(expr);
    }

    statement(): Statement {

        if (this.match([tokenType.contineu])) {
            this.expect(tokenType.semicolon, ";");
            return new Statement().newContinueStatement();
        }

        if (this.match([tokenType.braek])) {
            this.expect(tokenType.semicolon, ";");
            return new Statement().newBreakStatement();
        }

        if (this.match([tokenType.leftbrace])) {
            return this.block();
        }

        if (this.match([tokenType.return])) {
            return this.re_turn();
        }

        if (this.match([tokenType.if])) {
            this.expect(tokenType.leftparen, "( after if");
            var cond = this.expression();
            this.expect(tokenType.rightparen, ") after condition");
            var then = this.statement();
            var else_: Statement | undefined = undefined;
            if (this.match([tokenType.else])) {
                else_ = this.statement();
            }

            return new Statement().newIfStatement(cond, then, else_);
        }

        if (this.match([tokenType.while])) {
            this.expect(tokenType.leftparen, "( after while");
            var cond = this.expression();
            this.expect(tokenType.rightparen, ") after condition");
            var then = this.statement();

            return new Statement().newWhileStatement(cond, then);
        }

        return this.ExprStatement();
    }

    parseType(): Type {
        if (this.match([tokenType.leftsquare])) {
            var len = this.expect(tokenType.number, "Expect size of array");
            this.expect(tokenType.rightsquare, "] expected");
            var ptr = new Type().newArray(this.parseType(), len.value as number);
            ///var def = 0
            var holder = new Type().newStruct([
                { name: "len", datatype: u64, default: new Expression().newExprNumber(len.value as number, false) },
                { name: "ptr", datatype: ptr, default: undefined }
            ])
            holder.kind = myType.array;
            return holder;
        }
        var tok = this.advance();
        if (tok.type === tokenType.multiply) {
            return new Type().newPointer(this.parseType());
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
            case tokenType.identifier:
                var struc = getStruct(tok.value as string);
                if (struc) {
                    if (struc.is_union) {
                        var un = new Type().newUnion(struc.members);
                        return un;
                    }
                    return new Type().newStruct(struc.members);
                }
                var en = getEnum(tok.value as string);
                if (en) {
                    return en;
                }
                break;
            default:
                break;
        }

        this.tokenError("Expected type", this.peek());
        return i64;
    }


    makeSliceCopy(from: Expression, to: Expression): Expression[] {
        var xpr: Expression[] = [];
        // x.ptr = x.ptr
        // x.len = x.len

        // identifier, get = identifier, get, 
        xpr.push(
            new Expression().newExprSet(
                new Expression().newExprGet(
                    0,
                    new Expression().newExprIdentifier(
                        to.name, to.offset, from.datatype, identifierType.variable
                    ),
                    u64
                ),
                new Expression().newExprGet(
                    0,
                    new Expression().newExprIdentifier(
                        from.name, from.offset, from.datatype, identifierType.variable
                    ),
                    u64
                )
            )
        );

        xpr.push(
            new Expression().newExprSet(
                new Expression().newExprGet(
                    8,
                    new Expression().newExprIdentifier(
                        to.name, to.offset, from.datatype, identifierType.variable
                    ),
                    new Type().newPointer(u8)
                ),
                new Expression().newExprGet(
                    8,
                    new Expression().newExprIdentifier(
                        from.name, from.offset, from.datatype, identifierType.variable
                    ),
                    new Type().newPointer(u8)
                )
            )
        );

        return xpr;
    }

    varDeclaration(isdata: boolean): Statement {
        var name = this.expect(tokenType.identifier, "var name");
        var initializer: Expression | undefined;
        var type: Type | undefined = undefined;

        //var defaults:Expression[];
        var is_string: boolean = false;

        if (this.match([tokenType.equal])) {
            initializer = this.expression();
            if (initializer.datatype.kind === myType.string) {
                is_string = true;
                type = new Type().newStruct([
                    { name: "len", datatype: u64, default: undefined },
                    { name: "ptr", datatype: new Type().newPointer(u8), default: undefined }
                ])

            } else if (initializer.datatype.kind === myType.slice) {
                type = initializer.datatype;
                //console.error("===================================", type);
                //initializer = new Expression().newExprDeref(initializer);
            } else {
                type = initializer.datatype;
            }

        } else if (this.match([tokenType.colon])) {
            type = this.parseType()
        }

        if (this.match([tokenType.equal])) {
            initializer = this.expression();
        }

        if (type === undefined) {
            this.tokenError("Expect type--", this.peek());
        }

        this.expect(tokenType.semicolon, ";");

        var offset = incLocalOffset(name.value as string, type as Type);
        var is_global = false;

        if (offset === -1) {
            is_global = true;
        }

        if (is_string) {
            return new Statement().newStringVarStatement(
                name.value as string,
                offset,
                initializer as Expression,
                type as Type,
                is_global
            )
        }
        //console.error("offset", offset);
        return new Statement().newVarstatement(name.value as string, initializer, offset, type as Type, is_global);
    }

    // member

    externFuncDeclaration(): Statement {
        this.expect(tokenType.fn, "expected fn");
        var name = this.expect(tokenType.identifier, "fn name");
        this.expect(tokenType.leftparen, "( after fn name");
        var params: { name: string, datatype: Type }[] = [];
        if (!this.check(tokenType.rightparen)) {
            while (true) {
                var paramname = this.expect(tokenType.identifier, "param name");

                this.expect(tokenType.colon, "Expect : after name");
                var type = this.parseType();

                params.push({ name: paramname.value as string, datatype: type });
                if (!this.check(tokenType.comma)) break;
                this.advance();
            }
        }
        this.expect(tokenType.rightparen, ") after params");
        var type = this.parseType();
        this.expect(tokenType.semicolon, ";");
        pushFunction(name.value as string, params, fnType.extern, [], type);
        return new Statement().newExternFnStatement(name.value as string, params);
    }

    nativeFuncDeclaration(): Statement {
        var name = this.expect(tokenType.identifier, "fn name");
        this.expect(tokenType.leftparen, "( after fn name");

        var params: { name: string, datatype: Type }[] = [];

        if (!this.check(tokenType.rightparen)) {
            while (true) {
                var paramname = this.expect(tokenType.identifier, "param name");
                this.expect(tokenType.colon, "Expect : after name");
                var type = this.parseType();

                params.push({ name: paramname.value as string, datatype: type });
                if (!this.check(tokenType.comma)) break;
                this.advance();
            }
        }
        this.expect(tokenType.rightparen, ") after params");
        var type = this.parseType();
        this.expect(tokenType.leftbrace, "function body");
        var currFn = pushFunction(name.value as string, params, fnType.native, [], type);
        setCurrentFuction(currFn);
        var body = this.block();
        resetCurrentFunction(body);
        return new Statement().newNativeFnStatement(name.value as string);
    }

    structDeclaration(isunion: boolean): Statement {
        var name = this.expect(tokenType.identifier, "expect struct or union name").value as string;
        this.expect(tokenType.leftbrace, "Expect struct body");
        var strucmembers: { name: string, datatype: Type, default: Expression | undefined }[] = [];

        while (!this.check(tokenType.rightbrace)) {
            var member: { name: string, datatype: Type, default: Expression | undefined } = { name: "", datatype: u8, default: undefined };
            member.name = this.expect(tokenType.identifier, "Expect member name").value as string;
            this.expect(tokenType.colon, "expect : after name");
            member.datatype = this.parseType();

            strucmembers.push(member);
            if (this.check(tokenType.comma)) {
                this.advance();
            } else {
                break;
            }

        }

        this.expect(tokenType.rightbrace, "Expect } after struct body");
        pushStruct(new Struct(name, isunion, strucmembers));
        return new Statement().newStructDeclStatement();
    }

    enumDeclaration(): Statement {
        var name = this.expect(tokenType.identifier, "expect enum name").value as string;
        //var currstruct = pushStruct(name, isunion);
        this.expect(tokenType.leftbrace, "Expect enum body");
        var enumvalues: { name: string, value: number }[] = [];

        if (this.check(tokenType.rightbrace)) {
            this.advance();
            //console.error("=======================");
            return new Statement();
        }

        var currval = 0;
        while (!this.check(tokenType.leftbrace)) {
            var tok = this.expect(tokenType.identifier, "expect enum field");

            if (this.match([tokenType.equal])) {
                var custom = this.expect(tokenType.number, "expect field value");
                enumvalues.push({ name: tok.value as string, value: custom.value as number });
                currval = custom.value as number + 1;
            } else {
                enumvalues.push({ name: tok.value as string, value: currval });
                currval++;
            }
            if (!this.check(tokenType.comma)) {
                break;
            }
            this.advance();
        }
        this.expect(tokenType.rightbrace, "Expect } after enum fields");

        pushEnum(new Type().newEnum(name, enumvalues));

        return new Statement();
    }

    declaration(): Statement {
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

            return this.enumDeclaration();
        }

        if (getcurrFn() >= 0) {
            return this.statement();
        }

        this.tokenError("unexpected token", this.peek());
        return this.statement();
    }



    parse(): Statement[] {
        var stmts: Statement[] = [];
        while (this.moreTokens()) {
            stmts.push(this.declaration());
        }

        return stmts;
    }

    constructor(tokens: Token[]) {
        this.tokens = tokens;
        this.current = 0;
    }
}
