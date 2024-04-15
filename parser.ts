import { Token } from "./token";
import { tokenType } from "./token";
import { Expression, identifierType } from "./expr";
import { exprType } from "./expr";
import { Statement, stmtType } from "./stmt";
import { addGlobal, beginScope, endScope, fnType, getFn, getLocalOffset, getOffsetOfMember, getStructMembers, incLocalOffset, pushFunction, pushStruct, resetCurrentFunction, resetCurrentStruct, setCurrentFuction, setCurrentStruct } from "./main";
import { Type, i16, i32, i64, i8, isPtr, myType, u8, voidtype } from "./type";

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
        console.log(message + " - [ line: " + token.line + " col: " + token.col + " ]");
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
                idtype
            );
            return expr;
        }

        if (this.match([tokenType.string])) {
            //var expr = new Expression().newExprString(this.previous().value as string);
            return new Expression();
        }

        if (this.match([tokenType.number])) {
            return new Expression().newExprNumber(this.previous().value as number);
        }

        if (this.match([tokenType.leftparen])) {
            var expr = this.expression();
            this.expect(tokenType.rightparen, ")");
            return new Expression().newExprGrouping(expr);

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
        var expr = new Expression().newExprCall(callee);;
        expr.callee = callee;
        if (fn.arity !== args.length) {
            this.tokenError(fn.name + " expects " + fn.arity + " args but " + args.length + " provided.", fntok);
        }
        expr.params = args;
        expr.fntype = fn.type;
        return expr;
    }

    // postfix
    call(): Expression {
        var expr = this.primary();// identifier

        // should return identifier

        while (true) {

            if (this.match([tokenType.leftparen])) {
                expr = this.finishCall(expr);
            } else if (this.match([tokenType.dot])) {
                var propname = this.advance();
                if(propname.type === tokenType.identifier || propname.type === tokenType.multiply) {} else {
                    this.tokenError("expect property name after dot", this.peek());
                }

                if (expr.datatype.kind === myType.struct) {
                    var meta = getOffsetOfMember(expr.datatype, propname.value as string);
                    expr = new Expression().newExprGet(meta.offset, expr, meta.datatype)
                } else if(expr.datatype.kind === myType.ptr){
                    //console.log("=======ptr found ==========");
                    expr = new Expression().newExprDeref(expr);
                } else {
                    console.log("member access to non struct");
                    process.exit(1);
                }
                // get struct type of expr, find offset of x, get with offset
            } else if (this.match([tokenType.leftsquare])) {
                // work around
                if (expr.datatype.kind === myType.array) {
                    var index = this.expression();
                    this.expect(tokenType.rightsquare, "Expect ]");
                    expr = new Expression().newExprDeref(
                        new Expression().newExprBinary(new Token(tokenType.plus, "+", 0, 0), expr, index)
                    )
                    //expr = new Expression().newExprGet(0, expr, expr.datatype);
                    //console.log("================");
                } else {
                    console.log("indexing non array");
                    process.exit(1);
                }
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

        if (this.match([tokenType.andsand])) {
            var left = this.unary();
            if(left.type === exprType.address) {
                console.log("wtf bro!,, thats unsupported here");
                process.exit(1);
            }
            return new Expression().newExprAddress(left);
        }

        return this.call();
    }

    factor(): Expression {
        var expr = this.unary();
        while (this.match([tokenType.divide, tokenType.multiply])) {
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

        while (this.match([tokenType.less, tokenType.greater])) {
            var operator = this.previous();
            var right = this.term();
            expr = new Expression().newExprBinary(operator, expr, right);
        }

        return expr;
    }

    assign(): Expression {
        var expr = this.comparisson();

        var equals: Token;
        if (this.match([tokenType.equal])) {
            equals = this.previous();
            var val = this.assign();
            if (expr.type === exprType.identifier) {
                var n = new Expression().newExprAssign(val, expr.offset);
                return n;
            } else if (expr.type === exprType.get) {
                // expr.loadaddr = true;
                //expr.offset = 33;
                //console.log(expr.offset);
                
                var set = new Expression().newExprSet(expr, val);
                return set;
            } else if(expr.type === exprType.deref) {
                //console.log("pinter set detected");
                // expr.loadaddr = true;
                return new Expression().newExprAddressSet(expr, val);
            } 
            // else if (expr.type === exprType.) {
            //     //expr.loadaddr = true;
            //     return new Expression().newExprSetArrayIndex(expr, val);
            // }

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

    printStatement(): Statement {
        var val = this.expression();
        this.expect(tokenType.semicolon, ";");
        return new Statement().newPrintStatement(val);
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
        var is_ptr = false;
        var is_array = false;
        if (this.match([tokenType.leftsquare])) {
            is_array = true;
            var len = this.expect(tokenType.number, "Expect size of array");
            //console.log(len);
            this.expect(tokenType.rightsquare, "] expected");

            return new Type().newArray(this.parseType(), len.value as number);
        }

        var tok = this.advance();
        if (tok.type === tokenType.multiply) {
            is_ptr = true;
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
            case tokenType.identifier:
                var mems = getStructMembers(tok.value as string);
                if (mems) {
                    return new Type().newStruct(mems)
                }
                break;
            default:
                //throw new Error("unhandled case");
                break;
        }

        this.tokenError("Expected type", this.peek());
        return i64;
    }

    varDeclaration(): Statement {
        var name = this.expect(tokenType.identifier, "var name");
        var initializer: Expression | undefined;
        var type: Type | undefined = undefined;

        if (this.match([tokenType.equal])) {
            initializer = this.expression();
            if (initializer.type === exprType.string) {
                addGlobal(name.value as string, initializer.bytes as string, initializer.datatype);
                initializer.name = name.value as string;
            }
            type = initializer.datatype;
            //type.type = myType.i64;
        } else if (this.match([tokenType.colon])) {
            type = this.parseType()
        }

        if (this.match([tokenType.equal])) {
            initializer = this.expression();

            if (initializer.type === exprType.string) {
                addGlobal(name.value as string, initializer.bytes as string, initializer.datatype);
                initializer.name = name.value as string;
            }
        }

        if (type === undefined) {
            this.tokenError("Expect type--", this.peek());
        }

        this.expect(tokenType.semicolon, ";");

        var offset = incLocalOffset(name.value as string, type as Type);
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

    structDeclaration(): Statement {
        var name = this.expect(tokenType.identifier, "expect struct name").value as string;
        var currstruct = pushStruct(name);
        this.expect(tokenType.leftbrace, "Expect struct body");
        var strucmembers: Statement[] = [];
        setCurrentStruct(currstruct);
        while (!this.check(tokenType.rightbrace)) {
            var tok = this.peek();
            var member = this.varDeclaration();
            if (member.type !== stmtType.vardeclstmt) {
                this.tokenError("Expect var declararion", tok);
            }

            strucmembers.push(member);
        }


        this.expect(tokenType.rightbrace, "Expect } after struct body");
        resetCurrentStruct(strucmembers);
        return new Statement().newStructDeclStatement();
    }

    declaration(): Statement {
        if (this.match([tokenType.var])) {
            return this.varDeclaration();
        }

        if (this.match([tokenType.extern])) {
            return this.externFuncDeclaration();
        }

        if (this.match([tokenType.fn])) {
            return this.nativeFuncDeclaration();
        }

        if (this.match([tokenType.struct])) {
            return this.structDeclaration();
        }

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
