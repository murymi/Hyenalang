import { Token } from "./token";
import { tokenType } from "./token";
import { Expression } from "./expr";
import { exprType } from "./expr";
import { Statement, stmtType } from "./stmt";
import { getLocalOffset, incLocalOffset } from "./main";

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

    expect(type, name):Token {
        if (this.peek().type !== type) {
            throw new Error("Expected " + name);
        }
        return this.advance();
    }

    primary(): Expression {
        if(this.match([tokenType.identifier])) {
            var offset = getLocalOffset(this.previous().value as string);
            var expr = new Expression(exprType.identifier, undefined, this.previous().value);
            expr.offset = offset;
            return expr;
        }
        
        if (this.match([tokenType.number])) {
            //console.log("=============");
            return new Expression(exprType.primary, undefined, this.previous().value);
        }

        if (this.match([tokenType.leftparen])) {
            var expr = this.expression();
            this.expect(tokenType.rightparen, ")");
            return new Expression(exprType.grouping, undefined, expr);

        }

        console.log(this.peek());
        throw new Error("Unexpected token");
    }

    unary(): Expression {
        if (this.match([tokenType.minus])) {
            var operator = this.previous();
            var right = this.unary();
            return new Expression(exprType.unary, operator, right);
        }

        return this.primary();
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

    assign(): Expression {
        var expr = this.term();

        if(this.match([tokenType.equal])) {
            var val = this.assign();
            if(expr.type === exprType.identifier) {
                var n = new Expression(exprType.assign, undefined, val);
                n.offset = expr.offset;
                return n;
            }

            throw new Error("Unexpected assignment");
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

    statement():Statement {
        if(this.match([tokenType.print])) {
            return this.printStatement();
        }

        return this.ExprStatement();
    }

    varDeclaration():Statement {
        var name = this.expect(tokenType.identifier, "var name");
        var initializer: Expression|undefined;
        if(this.match([tokenType.equal])) {
            initializer = this.expression();
        }
        this.expect(tokenType.semicolon, ";");
        var offset = incLocalOffset(name.value as string);
        return new Statement().newVarstatement(name.value as string, initializer, offset);
    }

    declaration(): Statement {
        if(this.match([tokenType.var])) {
            return this.varDeclaration();
        }
        return this.statement();
    }

    parse(): Statement[] {
        var stmts: Statement[] = [];
        while(this.moreTokens()) {
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
