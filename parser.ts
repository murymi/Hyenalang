import { Token } from "./token";
import { tokenType } from "./token";
import { Expression, identifierType } from "./expr";
import { exprType } from "./expr";
import { Statement } from "./stmt";
import {
    Struct,
    addAnonString,
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
import { Type, bool, f32, i16, i32, i64, i8, myType, str, u16, u32, u64, u8, voidtype } from "./type";
import { error } from "console";

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


        if (this.match([tokenType.undefined])) {
            return new Expression().newExprUndefined();
        }

        if (this.match([tokenType.squote])) {

            if (this.match([tokenType.number, tokenType.identifier])) {
                var val = this.previous().value.toString();
                if (val.length !== 1) {
                    this.tokenError("expected single character", this.previous());
                }
                this.expect(tokenType.squote, "Expect closing ' ");
                var expr = new Expression().newExprNumber(val.charCodeAt(0));
                expr.datatype = i8;
                return expr;

            }
            this.tokenError("expect character", this.previous());
        }

        console.log(this.peek());

        this.tokenError("unexpected token", this.peek());
        throw new Error("Unexpected token");

    }

    declareAnnonymousString(val: Expression) {
        addAnonString(val)
    }

    makeAnonArg(arg: Expression) {
        var offset = incLocalOffset("", arg.datatype);
        var vardecl = Statement.anonLargeReturnVar(arg, offset);
        var get = new Expression().newExprIdentifier("", offset, arg.datatype, identifierType.variable);
        return new Expression().newExprDeclAnonForGet(vardecl, get)
    }

    finishCall(callee: Expression): Expression {
        var args: Expression[] = [];
        if (!this.check(tokenType.rightparen)) {
            do {
                var arg = this.expression();
                if (arg.type === exprType.string) {
                    args.push(new Expression().newExprAnonString(addAnonString(arg)))
                } else if (arg.datatype.size > 8) {
                    if (arg.type === exprType.call && arg.datatype.kind === myType.struct) {
                        //console.error("==============");
                        args.push(this.makeAnonArg(arg));
                    } else {
                        console.error(arg);
                        throw new error("Large arg detected");
                    }
                } else {
                    args.push(arg);
                }
            } while (this.match([tokenType.comma]));
        }
        var fntok = this.expect(tokenType.rightparen, ") after params");
        var fn = getFn(callee.name as string);

        //console.error(args);

        var expr = new Expression().newExprCall(callee, fn.returnType, args, fn.type);
        if (fn.arity !== args.length) {
            this.tokenError(fn.name + " expects " + fn.arity + " args but " + args.length + " provided.", fntok);
        }

        return expr;
    }

    isStructure(T: Type): boolean {
        if (T.members) {
            return true;
        }
        return false;
    }

    parseGet(expr: Expression): Expression {
        var propname = this.advance();
        if (propname.type === tokenType.identifier || propname.type === tokenType.multiply) { } else {
            this.tokenError("expect property name after dot", this.peek());
        }

        if (this.isStructure(expr.datatype) && expr.type !== exprType.call) {
            var meta = getOffsetOfMember(expr.datatype, propname.value as string);
            return new Expression().newExprGet(meta.offset, expr, meta.datatype);
        } else if (expr.datatype.kind === myType.ptr && propname.type === tokenType.multiply) {
            return new Expression().newExprDeref(expr);
        } else if (expr.datatype.kind === myType.ptr && expr.datatype.base.kind === myType.struct) {
            var meta = getOffsetOfMember(expr.datatype.base, propname.value as string);
            return new Expression().newExprGet(meta.offset,
                new Expression().newExprDeref(expr)
                , meta.datatype);
        } else if (expr.datatype.kind === myType.enum) {
            var val = expr.datatype.enumvalues.find((e) => e.name === propname.value);
            if (val) {
                return new Expression().newExprNumber(val.value);
            }
            console.error(`enum ${expr.name} has no field named ${propname.value}`);
            process.exit(1);
        } else if (expr.type === exprType.call && this.isStructure(expr.datatype)) {
            var meta = getOffsetOfMember(expr.datatype, propname.value as string);
            var offset = incLocalOffset("", expr.datatype);
            var get = new Expression().newExprGet(meta.offset,
                new Expression().newExprIdentifier("", offset, expr.datatype, identifierType.variable),
                meta.datatype);
            if (expr.datatype.size > 8) {
                var vardecl = Statement.anonLargeReturnVar(expr, offset);
                return new Expression().newExprDeclAnonForGet(vardecl, get);
            }
            var vardecl = Statement.anonSmallReturnVar(expr, offset);
            //console.error("-------shold return-------");
            return new Expression().newExprDeclAnonForGet(vardecl, get);

        } else {
            console.error(`${expr.name} has no member ${propname.value}`);
            console.error(expr.datatype);
            process.exit(1);
        }
    }

    // parseArrayIndex(expr: Expression): Expression {
    //     var index = this.expression();
    //     this.expect(tokenType.rightsquare, "Expect ]");
    //     return new Expression().newExprDeref(
    //         new Expression().newExprBinary(
    //             new Token(tokenType.plus, "+", 0, 0), expr,
    //             new Expression().newExprBinary(
    //                 new Token(tokenType.multiply, "*", 0, 0),
    //                 new Expression().newExprNumber(expr.datatype.size),
    //                 index
    //             )
    //         )
    //     )
    // }

    parseSliceIndex(expr: Expression, index: Expression): Expression {
        var meta = getOffsetOfMember(expr.datatype, "ptr");
        var ex = new Expression().newExprGet(meta.offset, expr, meta.datatype);


        var ret = new Expression().newExprDeref(
            new Expression().newExprBinary(new Token(tokenType.plus, "+", 0, 0), ex,
                new Expression().newExprBinary(
                    new Token(tokenType.multiply, "*", 0, 0),
                    new Expression().newExprNumber(expr.datatype.base.size),
                    index
                ))
        )

        ret.type = exprType.deref_slice_index;
        ret.datatype = expr.datatype.base;
        return ret;
    }


    parseArrayIndex(expr: Expression, index: Expression): Expression {
        var ret = new Expression().newExprDeref(
            new Expression().newExprBinary(new Token(tokenType.plus, "+", 0, 0),
                new Expression().newExprBinary(new Token(tokenType.plus, "+", 0, 0), expr,
                    new Expression().newExprBinary(
                        new Token(tokenType.multiply, "*", 0, 0),
                        new Expression().newExprNumber(expr.datatype.base.size),
                        index
                    )),
                new Expression().newExprNumber(8)
            )
        )

        ret.type = exprType.deref_array_index;
        ret.datatype = expr.datatype.base
        return ret;
    }

    parseArraySlide(expr: Expression, index: Expression): Expression {
        var end = this.expression();
        this.expect(tokenType.rightsquare, "Expect ] ");
        var s = new Expression().newExprSlideArray(expr, index, end);
        s.type = exprType.slice_array;
        return s;
    }

    parseSliceSlide(expr: Expression, index: Expression): Expression {
        var end = this.expression();
        this.expect(tokenType.rightsquare, "Expect ] ");
        var s = new Expression().newExprSlideSlice(expr, index, end);
        s.type = exprType.slice_slice;
        return s;
    }

    index(expr: Expression): Expression {
        var index = this.expression();
        var t = this.advance();
        switch (expr.datatype.kind) {
            case myType.slice:// likes char*
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
                        // done
                        return this.parseArrayIndex(expr, index);
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
        var expr = this.primary(); // identifier
        while (true) {
            if (this.match([tokenType.leftparen])) {
                expr = this.finishCall(expr);
                //console.error(expr.datatype);
                //expr.type = exprType.call;
            } else if (this.match([tokenType.dot])) {
                expr = this.parseGet(expr);
            } else if (this.match([tokenType.leftsquare])) {
                expr = this.index(expr);
                //console.error(expr);
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

        if (this.match([tokenType.andsand, tokenType.bitand])) {
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
        // identifier 
        // a.c.foo -> get
        //  a[0] -> deref




        var equals: Token;
        if (this.match([tokenType.equal])) {
            equals = this.previous();
            var val = this.assign();

            if (val.type === exprType.call && expr.datatype.size > 8) {
                var p = new Array(new Expression().newExprAddress(expr))
                p.concat(val.params);
                val.params = p;
            }

            switch (expr.type) {
                case exprType.call:
                    break;
                case exprType.identifier:
                case exprType.deref:
                    // switch (expr.datatype.kind) {
                    //     case myType.slice:
                    //         var off = expr.offset;
                    //         var expr = new Expression().newExprAssign(expr, val);
                    //         expr.defaults = Statement.makeSliceCopy(off, val);
                    //         return expr;
                    //     default:
                    // 
                    // }
                    return new Expression().newExprAssign(expr, val);
                case exprType.get:
                    return new Expression().newExprSet(expr, val);
                case exprType.deref_array_index:
                    return new Expression().newExprAssignArrayIndex(expr, val);
                case exprType.deref_slice_index:
                    return new Expression().newExprAssignSliceIndex(expr, val);
                default:
                    console.error(expr);
                    this.tokenError("Unexpected assignment", equals);
            }
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
            expr.datatype = i64;
            return new Statement().newReturnStatement(expr);
        }

        var expr = this.expression();

        if (expr.type === exprType.call && expr.datatype.size > 8) {
            var offset = incLocalOffset("", expr.datatype)
            expr.params.splice(0, 0, new Expression().newExprAddress(
                new Expression().newExprIdentifier("", offset, expr.datatype, identifierType.variable)))
        } else if (expr.type === exprType.string) {

        }

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

    parseType(): Type {
        if (this.match([tokenType.leftsquare])) {
            var len = this.expect(tokenType.number, "Expect size of array");
            this.expect(tokenType.rightsquare, "] expected");
            var base = this.parseType();
            ///var def = 0
            var holder = new Type().newStruct([
                { name: "len", datatype: u64, default: new Expression().newExprNumber(len.value as number, false) },
            ])
            holder.size = len.value as number + 8;
            holder.kind = myType.array;
            holder.base = base;
            //console.error(holder);
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
            case tokenType.str:
                var t = new Type().newStruct([
                    { name: "len", datatype: u64, default: undefined },
                    { name: "ptr", datatype: new Type().newPointer(u8), default: undefined }
                ]);
                t.kind = myType.slice;
                return t;
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

    makeStringInitializerFromPtr(off: number, string: Expression): Expression[] {
        var exprid = new Expression().newExprIdentifier(
            "",
            off,
            string.datatype,
            identifierType.struct
        );

        var initExpr: Expression[] = [];
        var expr = new Expression().newExprGet(
            string.datatype.members[1].offset,
            exprid, string.datatype.members[1].type
        );
        var set = new Expression().newExprSet(expr, string);

        initExpr.push(set);

        var expr2 = new Expression().newExprGet(
            string.datatype.members[0].offset,
            exprid, string.datatype.members[0].type
        );
        var set2 = new Expression().newExprSet(expr2,
            new Expression().newExprNumber(string.bytes.length, false)
        );
        initExpr.push(set2);

        return initExpr;
    }

    rvalue(): Expression {
        var initializer = this.expression();
        return initializer;
    }

    varDeclaration(isdata: boolean): Statement {
        var name = this.expect(tokenType.identifier, "var name");
        var initializer: Expression;
        var type: Type | undefined = undefined;
        if (this.match([tokenType.colon])) {
            type = this.parseType()
        }
        this.expect(tokenType.equal, "var initializer");
        initializer = this.rvalue();


        if (initializer.type === exprType.undefnd && type === undefined) {
            this.tokenError("Type not known", this.previous());
        }

        // if array make it slice
        if (initializer.datatype.kind === myType.array) {
            type = new Type().newStruct([
                { name: "len", datatype: u64, default: undefined },
                { name: "ptr", datatype: new Type().newPointer(initializer.datatype.base), default: undefined }
            ]);
            type.kind = myType.slice;
            type.base = initializer.datatype.base;
        } else if (initializer.datatype.kind === myType.string) {
            type = str;
            type.base = u8;
            type.kind = myType.slice
        }


        type = type ?? initializer.datatype;
        //console.error(initializer);
        var offset = incLocalOffset(name.value as string, type as Type);

        if (initializer.type === exprType.call && type.size > 8) {
            var p = new Array(new Expression().newExprAddress(
                new Expression().newExprIdentifier(name.value as string, offset, type, identifierType.variable)));
            p.concat(initializer.params);
            initializer.params = p;
        }

        if (initializer.datatype.kind === myType.string) {
            initializer =
                new Expression().newExprAssign(
                    new Expression().newExprIdentifier(name.value as string, offset, type, identifierType.variable),
                    new Expression().newExprSlideString(initializer))
        } else if (initializer.datatype.kind === myType.array) {
            initializer =
                new Expression().newExprAssign(
                    new Expression().newExprIdentifier(name.value as string, offset, type, identifierType.variable),
                    new Expression().newExprSlideArray(initializer,
                        new Expression().newExprNumber(0),
                        // len
                        initializer.datatype.members[0].default as Expression
                    ))
        } else {
            initializer = new Expression().newExprAssign(
                new Expression().newExprIdentifier(name.value as string, offset, type, identifierType.variable)
                , initializer
            );
        }

        this.expect(tokenType.semicolon, ";");
        return new Statement().newVarstatement(name.value as string, initializer, offset, type as Type);
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
