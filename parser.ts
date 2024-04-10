import { Token } from "./token";
import { tokenType } from "./token";
import { Expression } from "./expr";
import { exprType } from "./expr";
import { Statement, stmtType } from "./stmt";
import { addGlobal, beginScope, endScope, fnType, getFn, getLocalOffset, incLocalOffset, pushFunction, resetCurrentFunction, setCurrentFuction } from "./main";

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

    tokenError(message: string, token:Token):void {
        console.log(message+" - [ line: " + token.line + " col: " + token.col+" ]");
        process.exit();
    }

    primary(): Expression {
        if (this.match([tokenType.identifier])) {
            var offset = getLocalOffset(this.previous().value as string);
            var expr = new Expression(exprType.identifier, undefined, this.previous().value);
            expr.offset = offset;
            //console.log(this.previous().value);
            expr.name = this.previous().value as string;
            return expr;
        }

        if(this.match([tokenType.string])) {
            var expr = new Expression(exprType.string, undefined, this.previous().value);
            expr.val = this.previous().value;
            return expr;
        }

        if (this.match([tokenType.number])) {
            return new Expression(exprType.primary, undefined, this.previous().value);
        }

        if (this.match([tokenType.leftparen])) {
            var expr = this.expression();
            this.expect(tokenType.rightparen, ")");
            return new Expression(exprType.grouping, undefined, expr);

        }

        //console.log(this.peek());
        this.tokenError("unexpected token", this.peek());
        throw new Error("Unexpected token");
        
    }

    finishCall(callee: Expression):Expression {
        var args: Expression[] = [];
        if(!this.check(tokenType.rightparen)) {
            do {
                args.push(this.expression());
            } while (this.match([tokenType.comma]));
        }
        var fntok = this.expect(tokenType.rightparen,") after params");
        var expr = new Expression(exprType.call,undefined, "");
        expr.callee = callee;
        var fn = getFn(callee.name as string);
        if(fn.arity !== args.length) {
            this.tokenError(fn.name+" expects "+fn.arity+" args but "+args.length+" provided.", fntok);
        }
        expr.params = args;
        expr.fntype = fn.type;
        return expr;
    }

    call(): Expression {
        var expr = this.primary();

        if(this.match([tokenType.leftparen])) {
            //console.log("==================");
            expr = this.finishCall(expr);
        }

        return expr;
    }

    unary(): Expression {
        if (this.match([tokenType.minus])) {
            var operator = this.previous();
            var right = this.unary();
            return new Expression(exprType.unary, operator, right);
        }
        return this.call();
    }

    factor(): Expression {
        var expr = this.unary();
        while (this.match([tokenType.divide, tokenType.multiply])) {
            var operator = this.previous();
            var right = this.unary();
            expr = new Expression(exprType.binary, operator, expr, right);
        }
        return expr;
    }

    term(): Expression {
        var expr = this.factor();

        while (this.match([tokenType.plus, tokenType.minus])) {
            var operator = this.previous();
            var right = this.factor();
            expr = new Expression(exprType.binary, operator, expr, right);
        }

        return expr;
    }

    comparisson(): Expression {
        var expr = this.term();

        while (this.match([tokenType.less, tokenType.greater])) {
            var operator = this.previous();
            var right = this.term();
            expr = new Expression(exprType.binary, operator, expr, right);
        }

        return expr;
    }

    assign(): Expression {
        var expr = this.comparisson();
        var equals:Token;
        if (this.match([tokenType.equal])) {
            var val = this.assign();
            equals = this.previous();
            if (expr.type === exprType.identifier) {
                var n = new Expression(exprType.assign, undefined, val);
                n.offset = expr.offset;
                return n;
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

    statement(): Statement {

        if (this.match([tokenType.contineu])) {
            this.expect(tokenType.semicolon, ";");
            return new Statement().newContinueStatement();
        }

        if (this.match([tokenType.braek])) {
            this.expect(tokenType.semicolon, ";");
            return new Statement().newBreakStatement();
        }

        if (this.match([tokenType.print])) {
            return this.printStatement();
        }

        if (this.match([tokenType.leftbrace])) {
            return this.block();
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

    varDeclaration(): Statement {
        var name = this.expect(tokenType.identifier, "var name");
        var initializer: Expression | undefined;
        if (this.match([tokenType.equal])) {
            initializer = this.expression();
            if(initializer.type === exprType.string) {
                addGlobal(name.value as string, initializer.val as string);
                initializer.name = name.value as string;
            }
        }
        this.expect(tokenType.semicolon, ";");
        var offset = incLocalOffset(name.value as string);
        return new Statement().newVarstatement(name.value as string, initializer, offset);
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
        this.expect(tokenType.semicolon, ";");
        pushFunction(name.value as string, params, params.length, fnType.extern, []);
        return new Statement().newExternFnStatement(name.value as string, params);
    }

    nativeFuncDeclaration():Statement {
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
        this.expect(tokenType.leftbrace, "function body");
        var currFn = pushFunction(name.value as string,params, params.length, fnType.native, []);
        setCurrentFuction(currFn);
        var body = this.block();
        resetCurrentFunction(body);
        return new Statement().newNativeFnStatement(name.value as string);
    }

    declaration(): Statement {
        if (this.match([tokenType.var])) {
            return this.varDeclaration();
        }

        if (this.match([tokenType.extern])) {
            return this.externFuncDeclaration();
        }

        if(this.match([tokenType.fn])) {
            return this.nativeFuncDeclaration();
        }

        return this.statement();
    }

    parse(): Statement[] {
        var stmts: Statement[] = [];
        while (this.moreTokens()) {
            stmts.push(this.declaration());
        }

        //console.log(stmts.length);
        return stmts;
    }

    constructor(tokens: Token[]) {
        this.tokens = tokens;
        this.current = 0;
    }
}
