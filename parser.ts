import { Lexer, Token, colors } from "./token";
import { tokenType } from "./token";
import { Expression, rangeType } from "./expr";
import { exprType } from "./expr";
import { Statement, stmtType } from "./stmt";
import {
    Function,
    Struct,
    Templatefn,
    Variable,
    addAnonString,
    addGenericFunction,
    beginScope,
    compile,
    endScope,
    fnType,
    getEnum,
    getFn,
    getLocalOffset,
    getOffsetOfMember,
    getTemplate,
    getcurrFn,
    incLocalOffset,
    pushEnum,
    pushFunction,
    pushStruct,
    pushTemplatefn,
    resetCurrentFunction,
    restoreFn,
    setCurrentFuction,
    setCurrentTemplate
} from "./main";
import { Type, bool, f32, getPresentModule, i16, i32, i64, i8, myType, popModule, pushModule, pushStructType, searchStruct, str, u16, u32, u64, u8, voidtype } from "./type";
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
            this.tokenError("Expected " + name + " found ", this.peek());
        }
        return this.advance();
    }

    tokenError(message: string, token: Token): void {
        console.error(`${colors.yellow + token.file_name + colors.green} line: ${token.line} col: ${token.col} ${colors.red + message} '${token.value}'${colors.reset + "."} `);
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

    async createFunction(name: string): Promise<Expression> {
        var template = getTemplate(name);
        //console.error(template);
        //console.log(this.peek().type === tokenType.less);
        this.expect(tokenType.less, "Expect type args ");
        //console.error("=========================");
        var types: Type[] = [];
        while (true) {
            //var T = this.expect(tokenType.identifier, "Expect type arg").value as string;
            types.push(this.parseType(false));
            if (!this.check(tokenType.comma)) break;
            this.advance();
        }

        this.expect(tokenType.greater, "Expect > after type args");
        //console.error(types);
        if (types.length !== template.place_holders.length) {
            this.tokenError(`${template.name} expects ${template.place_holders.length} types args.`, this.peek())
        }

        var tokens: Token[] = this.cloneTokens(template.tokens);
        var fakename = "test_template" + template.getCount();
        tokens.splice(0, 0, new Token(tokenType.identifier, fakename, 0, 0, ""));

        //this.replaceTokens(tokens, template.place_holders);

        template.place_holders.forEach((ph, i) => {
            this.replaceTokens(tokens, ph, types[i].toString())
        })
        var curr_fn = getcurrFn();
        await new Parser(tokens).nativeFuncDeclaration();
        var obj = getFn(fakename);
        restoreFn(curr_fn);
        template.incCount();
        return new Expression().newExprFnIdentifier(obj.name, obj.data_type);
    }

    async structLiteral(name:string):Promise<Expression> {
        var struc_type = searchStruct(name) as Type;
        var setters:{ field_offset:number,data_type:Type, value:Expression }[] = [];
        this.expect(tokenType.leftbrace, "{");
        while(true) {
            this.expect(tokenType.dot,".");
            var fo = getOffsetOfMember(struc_type, this.expect(tokenType.identifier, "identifier").value as string);
            this.expect(tokenType.equal, "=");
            setters.push({field_offset:fo.offset,data_type:fo.datatype, value:await this.expression()})
            if(!this.match([tokenType.comma])) break;
        }
        this.expect(tokenType.rightbrace, "}");
        return new Expression().newStructLiteral(setters, struc_type);
    }

    async primary(): Promise<Expression> {
        if (this.match([tokenType.identifier])) {
            var id = this.previous().value as string;
            var obj = getLocalOffset(id);
            if (obj.offset === -1) {
                return new Expression().newExprFnIdentifier(
                    id,
                    obj.datatype
                );
            }

            if(obj.offset === -4) {
                return await this.structLiteral(id);
            }

            if (obj.offset === -7) {
                return await this.createFunction(id);
            }
            //console.error(this.peek())
            var expr = new Expression().newExprIdentifier(obj.variable as Variable);
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
            var expr = await this.expression();
            this.expect(tokenType.rightparen, ")");
            return new Expression().newExprGrouping(expr);
        }

        if (this.match([tokenType.null])) {
            return new Expression().newExprNull();
        }

        if (this.match([tokenType.at])) {
            var what = this.expect(tokenType.identifier, "expect option");

            switch (what.value) {
                case "sizeof":
                case "alignof":
                    this.expect(tokenType.leftparen, "expect ( ");
                    var size = 0;
                    if (this.check(tokenType.identifier) || this.check(tokenType.number)) {
                        size = what.value === "sizeof" ? (await this.expression()).datatype.size : (await this.expression()).datatype.align;
                    } else {
                        size = what.value === "sizeof" ? this.parseType(false).size : this.parseType(false).align
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
        //console.log(this.peek());
        this.tokenError("unexpected token", this.peek());
        throw new Error("Unexpected token");

    }

    declareAnnonymousString(val: Expression) {
        addAnonString(val)
    }

    makeAnonArg(arg: Expression) {
        var new_var = incLocalOffset("", arg.datatype);
        var vardecl = Statement.anonLargeReturnVar(arg, new_var);
        var get = new Expression().newExprIdentifier(new_var);
        return new Expression().newExprDeclAnonForGet(vardecl, get)
    }

    async finishCall(callee: Expression, optional?: Expression): Promise<Expression> {

        if (callee.datatype.kind !== myType.function) {
            this.tokenError("Not a function", this.previous());
        }
        var args: Expression[] = [];
        if (!this.check(tokenType.rightparen)) {
            do {
                var arg = await this.expression();
                if (arg.datatype.size > 8) {
                    if (arg.type === exprType.call && arg.datatype.size > 8) {
                        args.push(this.makeAnonArg(arg));
                    } else {
                        args.push(new Expression().newExprAddress(arg))
                        //console.error(arg);
                        //throw new error("Large arg detected");
                    }
                } else {
                    args.push(arg);
                }
            } while (this.match([tokenType.comma]));
        }
        var fntok = this.expect(tokenType.rightparen, ") after params");
        if (optional) { args.splice(0, 0, optional); }
        var expr = new Expression().newExprCall(callee, callee.datatype.return_type, args, fnType.native);
        if (callee.datatype.arity !== args.length) {
            this.tokenError(callee.name + " expects " + callee.datatype.arity + " args but " + args.length + " provided.", fntok);
        }
        return expr;
    }

    isStructure(T: Type): boolean {
        if (T.members) {
            return true;
        }
        return false;
    }

    typeEql(a: Type, b: Type): boolean {
        return a.module_name === b.module_name && a.name === b.name;
    }

    async getFunctionFromStruct(expr: Expression, meta: { offset: number, datatype: Type, name: string }): Promise<Expression> {
        var obj = getLocalOffset(meta.name);
        var fakeid = new Expression().newExprFnIdentifier(meta.name, obj.datatype);
        if (obj.datatype.arguments.length === 0 || !this.typeEql(obj.datatype.arguments[0].datatype.base, expr.datatype)) {
            this.tokenError(`${expr.datatype.name} has no such member function`, this.previous());
        }

        this.expect(tokenType.leftparen, "Expect ( ");
        return await this.finishCall(fakeid, new Expression().newExprAddress(expr));
    }


    async getFunctionFromStructPtr(expr: Expression, meta: { offset: number, datatype: Type, name: string }): Promise<Expression> {
        var obj = getLocalOffset(meta.name);
        var fakeid = new Expression().newExprFnIdentifier(meta.name, obj.datatype);
        this.expect(tokenType.leftparen, "Expect ( ");
        if (obj.datatype.arguments.length === 0 || !this.typeEql(obj.datatype.arguments[0].datatype.base, expr.datatype.base)) {
            this.tokenError(`${expr.datatype.base.name} has no such member function`, this.previous());
        }
        return await this.finishCall(fakeid, expr);
    }

    async parseGet(expr: Expression): Promise<Expression> {
        var propname = this.advance();
        if (propname.type === tokenType.identifier || propname.type === tokenType.multiply) { } else {
            this.tokenError("expect property name after dot", this.peek());
        }
        if (this.isStructure(expr.datatype) && expr.type !== exprType.call) {
            var meta = getOffsetOfMember(expr.datatype, propname.value as string);
            if (meta.offset === -1) {
                return await this.getFunctionFromStruct(expr, meta);
            }
            return new Expression().newExprGet(meta.offset, expr, meta.datatype);
        } else if (expr.datatype.kind === myType.ptr && propname.type === tokenType.multiply) {
            return new Expression().newExprDeref(expr);
        } else if (expr.datatype.kind === myType.ptr && expr.datatype.base.kind === myType.struct) {
            var meta = getOffsetOfMember(expr.datatype.base, propname.value as string);
            if (meta.offset === -1) {
                return await this.getFunctionFromStructPtr(expr, meta);
            }
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
            var variable = incLocalOffset("", expr.datatype);
            var get = new Expression().newExprGet(meta.offset,
                new Expression().newExprIdentifier(variable),
                meta.datatype);
            if (expr.datatype.size > 8) {
                var vardecl = Statement.anonLargeReturnVar(expr, variable);
                return new Expression().newExprDeclAnonForGet(vardecl, get);
            }
            var vardecl = Statement.anonSmallReturnVar(expr, variable);
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
            new Expression().newExprBinary(new Token(tokenType.plus, "+", 0, 0, ""), ex,
                new Expression().newExprBinary(
                    new Token(tokenType.multiply, "*", 0, 0, ""),
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

        ret.type = exprType.deref_array_index;
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

    async index(expr: Expression): Promise<Expression> {
        var index = await this.expression();
        var t = this.advance();
        switch (expr.datatype.kind) {
            case myType.slice:// likes char*
                switch (t.type) {
                    case tokenType.range:
                        return this.parseSliceSlide(expr, index)
                    case tokenType.rightsquare:
                        return this.parseSliceIndex(expr, index);
                    default:
                        this.tokenError("Expect ]", t);

                }
                break;
            case myType.array:
                switch (t.type) {
                    case tokenType.range:
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

    parseMemberFunction(name: Token): Expression {
        var struc = searchStruct(name.value as string);
        if (struc === undefined) {
            this.tokenError("No such struct", name);
        }
        var fnname = this.expect(tokenType.identifier, "Expect fn name").value as string;

        if (struc?.member_fn_names.find((f) => f === fnname) === undefined) {
            this.tokenError(`${struc?.name} has no fn ${fnname}`, this.previous());
        }

        var obj = getLocalOffset(struc?.name + fnname);
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
            return new Expression().newExprAddress(left);
        }

        return await this.call();
    }

    async cast():Promise<Expression> {

        if(this.match([tokenType.cast])) {
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
                return tokenType.diveq
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

    async expression(): Promise<Expression> {
        return this.assign();
    }

    async ExprStatement(): Promise<Statement> {

        var expr = await this.expression();
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
            if(stmt.type === stmtType.defer) {
                defers.push(stmt.then);
            }else {
                stmts.push(stmt);
            }
        }
        this.expect(tokenType.rightbrace, "}");
        defers.reverse().forEach((d)=>{
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
        } else if (expr.type === exprType.string) {

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

        //var items:{prong:Statement, cases:Expression[]}[] = [];

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

            //items.push({ prong:pron, cases:casez });

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
            if(this.check(tokenType.comma) || this.check(tokenType.rightparen)) {
                return new Expression().newExprRange(bottom, new Expression().newExprNumber(0xfffffffffffff));
            } else {
                var top = await this.expression();
                return new Expression().newExprRange(bottom, top);
            }
        } else {
            return new Expression().newExprRange(new Expression().newExprNumber(-1), bottom);
        }

    }

    async integerLoop(): Promise<Statement> {
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
        endScope();

        var body = await this.block();
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

        if(this.match([tokenType.defer])) {
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
            case tokenType.str:
                var t = new Type().newStruct("str", [
                    { name: "len", datatype: u64, default: undefined },
                    { name: "ptr", datatype: new Type().newPointer(u8), default: undefined }
                ]);
                t.kind = myType.slice;
                return t;
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

        this.tokenError("Expected type", this.peek());
        return i64;
    }

    // makeStringInitializerFromPtr(off: number, string: Expression): Expression[] {
    //     var exprid = new Expression().newExprIdentifier(
    //         "",
    //         off,
    //         string.datatype
    //     );
    // 
    //     var initExpr: Expression[] = [];
    //     var expr = new Expression().newExprGet(
    //         string.datatype.members[1].offset,
    //         exprid, string.datatype.members[1].type
    //     );
    //     var set = new Expression().newExprSet(expr, string);
    // 
    //     initExpr.push(set);
    // 
    //     var expr2 = new Expression().newExprGet(
    //         string.datatype.members[0].offset,
    //         exprid, string.datatype.members[0].type
    //     );
    //     var set2 = new Expression().newExprSet(expr2,
    //         new Expression().newExprNumber(string.bytes.length, false)
    //     );
    //     initExpr.push(set2);
    // 
    //     return initExpr;
    // }

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

        // if array make it slice
        if (initializer.datatype.kind === myType.array) {
            type = new Type().newStruct("slice", [
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
        var variable = incLocalOffset(name.value as string, type as Type, initializer);

        if (initializer.type === exprType.call && type.size > 8) {
            initializer.params.splice(0, 0, new Expression().newExprAddress(
                new Expression().newExprIdentifier(variable)));
        }

        if (initializer.datatype.kind === myType.string) {
            initializer =
                new Expression().newExprAssign(
                    new Expression().newExprIdentifier(variable),
                    new Expression().newExprSlideString(initializer))
        } else if (initializer.datatype.kind === myType.array) {
            initializer =
                new Expression().newExprAssign(
                    new Expression().newExprIdentifier(variable),
                    new Expression().newExprSlideArray(initializer,
                        new Expression().newExprNumber(0),
                        // len
                        initializer.datatype.members[0].default as Expression
                    ))
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

    copyTokens(start: number, end: number) {
        var toks: Token[] = [];
        for (let i = start; i <= end; i++) {
            toks.push(this.tokens[i]);
        }
        //console.error(toks);
        return toks;
    }

    async nativeFuncDeclaration(name_space?: string): Promise<Statement> {
        var name = this.expect(tokenType.identifier, "fn name").value as string;

        if (name_space) name = name_space + name;

        var is_template = false;
        var holders: string[] = [];
        if (this.match([tokenType.less])) {
            is_template = true;
            while (true) {
                holders.push(this.expect(tokenType.identifier, "Expect type arg").value as string);
                if (!this.check(tokenType.comma)) break;
                this.advance();
            }
            this.expect(tokenType.greater, "Expect closing >");
        }

        this.expect(tokenType.leftparen, "( after fn name");
        var first_tok_index = this.previous().index;

        var params: { name: string, datatype: Type }[] = [];

        if (!this.check(tokenType.rightparen)) {
            while (true) {
                var paramname = this.expect(tokenType.identifier, "param name");
                this.expect(tokenType.colon, "Expect : after name");
                var type = this.parseType(is_template, holders);
                params.push({ name: paramname.value as string, datatype: type });
                if (!this.check(tokenType.comma)) break;
                this.advance();
            }
        }
        this.expect(tokenType.rightparen, ") after params");
        var type = this.parseType(is_template, holders);
        this.expect(tokenType.leftbrace, "function body");

        var currFn = is_template ? pushTemplatefn(name, params, type, holders) : pushFunction(name as string, params, fnType.native, type);
        is_template ? setCurrentTemplate(currFn) : setCurrentFuction(currFn);
        var body = await this.block();
        var last_tok_index = this.previous().index;

        resetCurrentFunction(name, body, this.copyTokens(first_tok_index, last_tok_index));
        return new Statement().newNativeFnStatement(name as string);
    }

    structDeclaration(isunion: boolean): Statement {
        var name = this.expect(tokenType.identifier, "expect struct or union name").value as string;
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
        var struc = new Struct(name, isunion, strucmembers);
        pushStruct(struc);
        pushStructType(isunion ? new Type().newUnion(name, strucmembers) : new Type().newStruct(name, strucmembers))
        return new Statement().newStructDeclStatement();
    }

    enumDeclaration(): Statement {
        var name = this.expect(tokenType.identifier, "expect enum name").value as string;
        this.expect(tokenType.leftbrace, "Expect enum body");
        var enumvalues: { name: string, value: number }[] = [];

        if (this.check(tokenType.rightbrace)) {
            this.advance();
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

            return this.enumDeclaration();
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

    constructor(tokens: Token[]) {
        //console.error(tokens);
        this.tokens = tokens;
        this.current = 0;
    }
}
