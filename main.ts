var text ="((-2 + 9)) * (1 + 1)";

enum tokenType {
    plus,
    minus,
    multiply,
    divide,
    number,
    undef,
    leftparen,
    rightparen,
    eof
};

class Token{
    type: tokenType;
    value: string | number;

    constructor(type: tokenType, value: string | number) {
        this.type = type;
        this.value = value;
    }
}

class Lexer {
    current: number;
    text: string;

    constructor(text: string) {
        this.current = 0;
        this.text = text;
    }

    peek() {
        if(!this.moreTokens()) return "eof";
        return this.text[this.current];
    }
    
    advance() {
        this.current++;
        return this.text[this.current - 1];
    }

    moreTokens() {
        return this.current < this.text.length;
    }

    isSpace(text: string): boolean {
        if(text == ' ' || text === '\t' || text == '\n') return true;
        return false;
    }

    isNumber(text: string): boolean {
        return /^[0-9]$/.test(text);
    }

    number(): number {
        var start = this.current;
        while(this.moreTokens()){
            if(!this.isNumber(this.peek())) break;
            this.advance();
        }
        var str = this.text.substring(start, this.current);
        return parseFloat(str);
    }

    lex():  Token[] {
        var tokens: Token[] = [];

        while(true) {
            let char = this.peek();
            
            //console.log("token => ", char);
            if(this.isNumber(char)){
                tokens.push(new Token(tokenType.number,  this.number()));
            } else if(this.isSpace(char)) {
                this.advance();
                continue;
            }
            else if(char === "+") {
                tokens.push(new Token(tokenType.plus, "+"));
                this.advance();
            } else if(char === "-") {
                tokens.push(new Token(tokenType.minus, "-"));
                this.advance();
            } else if(char === "/") {
                tokens.push(new Token(tokenType.divide, "/"));
                this.advance();
            } else if(char === "*") {
                tokens.push(new Token(tokenType.multiply, "*"));
                this.advance();
            } else if(char === '('){
                tokens.push(new Token(tokenType.leftparen, "("));
                this.advance();
            } else if(char === ')'){
                tokens.push(new Token(tokenType.rightparen, ")"));
                this.advance();
            } else if(char === "eof") {
                tokens.push(new Token(tokenType.eof, "eof"));
                break;
            } else {
                console.log(char);
                throw new Error("Unexpeted character");
            }

        }

        return tokens;
    }
}


enum exprType{
    unary,
    binary,
    primary,
    grouping
}

class Expression {
    type: exprType;

    left: Expression | string | number;
    right?: Expression;
    operator: Token | undefined;
    value: Expression | string | number;

    beginPrint(){
        this.print(this);
    }

    print(expr: Expression) {
        switch(expr.type) {
            case exprType.binary:
                this.print(expr.left as Expression);
                console.log(expr.operator?.value);
                this.print(expr.right as Expression)
                break;
            case exprType.unary:
                console.log(expr.operator);
                this.print(expr.left as Expression);
            case exprType.primary:
                console.log(expr.value);
                break;
            default:
                break;
        }
    }

    beginEvaluate(): number {
        return this.evaluate(this);
    }

    evaluate(expr: Expression): number {
        switch(expr.type) {
            case exprType.binary:
                
                switch(expr.operator?.type) {
                    case tokenType.divide: 
                        return this.evaluate(expr.left as Expression)/this.evaluate(expr.right as Expression);
                    case tokenType.multiply:
                        return this.evaluate(expr.left as Expression)*this.evaluate(expr.right as Expression);

                    case tokenType.plus:
                        return this.evaluate(expr.left as Expression)+this.evaluate(expr.right as Expression);
                    case tokenType.minus:
                        return this.evaluate(expr.left as Expression)-this.evaluate(expr.right as Expression);
                    default:
                        throw new Error("unexpected operator");
                }
            case exprType.unary:
                if(expr.operator?.type == tokenType.minus) return -this.evaluate(expr.left as Expression);
                throw new Error("unexpected operator");
            case exprType.primary:
                return expr.value as number;
            case exprType.grouping:
                return this.evaluate(expr.left as Expression);
            default:
                throw new Error("Unexpected expression");
                break;
        }
    }

    constructor(type: exprType, operator: Token | undefined, left: Expression | string | number, right?: Expression) {
        if(type === exprType.primary) {
            this.value = left;
        }

        this.type = type;
        this.operator = operator;
        this.right = right;
        this.left = left;
    }
}

class Parser {
    tokens: Token[];
    current: number;

    match(types: tokenType[]): boolean {
        for (let T of types) {
            if(this.check(T)) {
                this.advance();
                return true;
            }
        }
        return false;
    }

    advance(): Token {
        if(this.moreTokens()) this.current++;
        return this.previous();
    }

    check(type: tokenType): boolean {
        if(!this.moreTokens()) return false;
        return this.peek().type === type;
    }

    moreTokens(): boolean { return this.peek().type != tokenType.eof; }

    peek(): Token { return this.tokens[this.current]; }

    previous(): Token { return this.tokens[this.current - 1]; }

    expect(type, name) {
        if(this.advance().type !== type) {
            throw new Error("Expected "+name);
        }
    }
    
    primary(): Expression {

        if(this.match([tokenType.number])) {
            return new Expression(exprType.primary, undefined ,this.previous().value);
        }

        if(this.match([tokenType.leftparen])) {
            var expr = this.expression();
            this.expect(tokenType.rightparen, ")");
            return new Expression(exprType.grouping, undefined, expr);

        }

        console.log(this.peek());
        throw new Error("Unexpected token");
    }

    unary(): Expression {
        if(this.match([tokenType.minus])) {
            var operator = this.previous();
            var right = this.unary();
            return new Expression(exprType.unary, operator, right);
        }

        return this.primary();
    }

    factor(): Expression {
        var expr = this.unary();
        while(this.match([tokenType.divide, tokenType.multiply])) {
            var operator = this.previous();
            var right = this.unary();
            expr = new Expression(exprType.binary, operator, expr, right);
        }
        return expr;
    }
    
    term(): Expression {
        var expr = this.factor();

        while(this.match([tokenType.plus, tokenType.minus])) {
            var operator = this.previous();
            var right = this.factor();
            expr = new Expression(exprType.binary, operator, expr, right);
        }
        
        return expr;
    }
    
    expression(): Expression {
        return this.term()
    }

    parse(): Expression {
        return this.expression();
    }

    constructor(tokens: Token[]) {
        this.tokens = tokens;
        this.current = 0;
    }
}

var lexer = new Lexer(text);

var tokens = lexer.lex();

var parser = new Parser(tokens);
var ast = parser.parse();

ast.beginPrint();
var z = ast.beginEvaluate();

console.log(text + " = " + z)

