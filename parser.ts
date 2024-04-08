import { Token } from "./token";
import { tokenType } from "./token";
import { Expression } from "./expr";
import { exprType } from "./expr";
import { Statement } from "./stmt";

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

    expect(type, name) {
        if (this.advance().type !== type) {
            throw new Error("Expected " + name);
        }
    }

    primary(): Expression {

        if (this.match([tokenType.number])) {
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

    expression(): Expression {
        return this.term()
    }

    statement(): Statement {
        var expr = this.expression();
        this.expect(tokenType.semicolon, ";");
        return new Statement(expr);
    }

    parse(): Statement[] {
        var stmts: Statement[] = [];
        while(this.moreTokens()) {
            stmts.push(this.statement());
        }

        //console.log(stmts);
        return stmts;
    }

    constructor(tokens: Token[]) {
        this.tokens = tokens;
        this.current = 0;
    }
}
