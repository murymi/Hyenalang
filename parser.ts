import { Token } from "./token";
import { tokenType } from "./token";
import { Expression, identifierType } from "./expr";
import { exprType } from "./expr";
import { Statement, stmtType } from "./stmt";
import { addGlobal, beginScope, checkStruct, endScope, fnType, getFn, getLocalOffset, getOffsetOfMember, inStruct, incLocalOffset, myType, pushFunction, pushStruct, resetCurrentFunction, resetCurrentStruct, setCurrentFuction, setCurrentStruct } from "./main";

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
                return new Expression().newExprIdentifier(this.previous().value as string, obj.offset, obj.type, identifierType.func);
            }
            var expr = new Expression().newExprIdentifier(this.previous().value as string, obj.offset, obj.type,
             obj.type === myType.struct? identifierType.struct : identifierType.variable);
            expr.CustomType = obj.custom;
            return expr;
        }

        if (this.match([tokenType.string])) {
            var expr = new Expression().newExprString(this.previous().value as string);
            return expr;
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

    call(): Expression {
        var expr = this.primary();// identifier

        // should return identifier

        while (true) {

            if (this.match([tokenType.leftparen])) {
                expr = this.finishCall(expr);
            } else if (this.match([tokenType.dot])) {
                var name = this.expect(tokenType.identifier, "expect property name after dot").value as string;
                if (expr.datatype === myType.struct) {
                    expr = new Expression().newExprGet(getOffsetOfMember(expr.CustomType, name), expr)
                } else {
                    console.log("member access to non struct");
                    process.exit(1);
                }
                // get struct type of expr, find offset of x, get with offset
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
            var operator = this.previous();
            var depth = 1;
            while (this.match([tokenType.andsand])) {
                depth++;
            }
            var right = this.unary();
            return new Expression().newExprDeref(right, depth);
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
                expr.loadaddr = true;
                
                return new Expression().newExprSet(expr, val);
            }

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
            expr.datatype = myType.void;
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

    parseType(): { type: myType | undefined, custom: any } {
        var is_ptr = false;
        if (this.match([tokenType.leftsquare])) {
            is_ptr = true;
            this.expect(tokenType.rightsquare, "] expected");
        }
        var tok = this.advance();
        switch (tok.type) {
            case tokenType.u8:
                if (is_ptr) return { type: myType.u8_ptr, custom: undefined };
                return { type: myType.u8, custom: undefined };
            case tokenType.u16:
                if (is_ptr) return { type: myType.u16_ptr, custom: undefined };
                return { type: myType.u16, custom: undefined };
            case tokenType.u32:
                if (is_ptr) return { type: myType.u32_ptr, custom: undefined };
                return { type: myType.u32, custom: undefined };
            case tokenType.u64:
                if (is_ptr) return { type: myType.u64_ptr, custom: undefined };
                return { type: myType.u64, custom: undefined };
            case tokenType.i8:
                if (is_ptr) return { type: myType.i8_ptr, custom: undefined };
                return { type: myType.i8, custom: undefined };
            case tokenType.i16:
                if (is_ptr) return { type: myType.i16_ptr, custom: undefined };;
                return { type: myType.i16, custom: undefined };
            case tokenType.i32:
                if (is_ptr) return { type: myType.i32_ptr, custom: undefined };
                return { type: myType.i32, custom: undefined };
            case tokenType.i64:
                if (is_ptr) return { type: myType.i64_ptr, custom: undefined };
                return { type: myType.i64, custom: undefined };
            case tokenType.void:
                if (is_ptr) return { type: myType.void_ptr, custom: undefined };
                return { type: myType.void, custom: undefined };
            case tokenType.identifier:
                var stct = checkStruct(tok.value as string);
                if (stct) {
                    return { type: myType.struct, custom: stct };
                }
                this.tokenError("Expected valid type", this.peek());
            default:
                //throw new Error("unhandled case");
                break;
        }

        this.tokenError("Expected type", this.peek());
        return { type: undefined, custom: undefined };
    }

    varDeclaration(): Statement {
        var name = this.expect(tokenType.identifier, "var name");
        var initializer: Expression | undefined;
        var type: { type: myType | undefined, custom: any } = { type: undefined, custom: undefined };

        if (this.match([tokenType.equal])) {
            initializer = this.expression();
            if (initializer.type === exprType.string) {
                addGlobal(name.value as string, initializer.bytes as string, initializer.datatype);
                initializer.name = name.value as string;
            }
            type.type = initializer.datatype;
            type.custom = type.type;
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

        if (type.type === undefined) {
            this.tokenError("Expect type--", this.peek());
        }

        this.expect(tokenType.semicolon, ";");

        var offset = incLocalOffset(name.value as string, 2, type.type as myType, type.custom);
        return new Statement().newVarstatement(name.value as string, initializer, offset, type.type, type.custom);
    }

    externFuncDeclaration(): Statement {
        this.expect(tokenType.fn, "expected fn");
        var name = this.expect(tokenType.identifier, "fn name");
        this.expect(tokenType.leftparen, "( after fn name");
        var params: Token[] = [];
        if (!this.check(tokenType.rightparen)) {
            while (true) {
                var param = this.expect(tokenType.identifier, "param name");
                params.push(param);
                if (!this.check(tokenType.comma)) break;
                this.advance();
            }
        }
        this.expect(tokenType.rightparen, ") after params");
        var type = this.parseType();
        this.expect(tokenType.semicolon, ";");
        pushFunction(name.value as string, params, params.length, fnType.extern, [], type);
        return new Statement().newExternFnStatement(name.value as string, params);
    }

    nativeFuncDeclaration(): Statement {
        var name = this.expect(tokenType.identifier, "fn name");
        this.expect(tokenType.leftparen, "( after fn name");
        var params: Token[] = [];
        if (!this.check(tokenType.rightparen)) {
            while (true) {
                var param = this.expect(tokenType.identifier, "param name");
                params.push(param);
                if (!this.check(tokenType.comma)) break;
                this.advance();
            }
        }
        this.expect(tokenType.rightparen, ") after params");
        var type = this.parseType();
        var currFn = pushFunction(name.value as string, params, params.length, fnType.native, [], type);
        this.expect(tokenType.leftbrace, "function body");
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
