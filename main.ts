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

class Token {
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
        if (!this.moreTokens()) return "eof";
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
        if (text == ' ' || text === '\t' || text == '\n') return true;
        return false;
    }

    isNumber(text: string): boolean {
        return /^[0-9]$/.test(text);
    }

    number(): number {
        var start = this.current;
        while (this.moreTokens()) {
            if (!this.isNumber(this.peek())) break;
            this.advance();
        }
        var str = this.text.substring(start, this.current);
        return parseFloat(str);
    }

    lex(): Token[] {
        var tokens: Token[] = [];

        while (true) {
            let char = this.peek();

            //console.log("token => ", char);
            if (this.isNumber(char)) {
                tokens.push(new Token(tokenType.number, this.number()));
            } else if (this.isSpace(char)) {
                this.advance();
                continue;
            }
            else if (char === "+") {
                tokens.push(new Token(tokenType.plus, "+"));
                this.advance();
            } else if (char === "-") {
                tokens.push(new Token(tokenType.minus, "-"));
                this.advance();
            } else if (char === "/") {
                tokens.push(new Token(tokenType.divide, "/"));
                this.advance();
            } else if (char === "*") {
                tokens.push(new Token(tokenType.multiply, "*"));
                this.advance();
            } else if (char === '(') {
                tokens.push(new Token(tokenType.leftparen, "("));
                this.advance();
            } else if (char === ')') {
                tokens.push(new Token(tokenType.rightparen, ")"));
                this.advance();
            } else if (char === "eof") {
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


enum exprType {
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
    val: Expression | string | number;

    beginPrint() {
        this.print(this);
    }

    print(expr: Expression) {
        switch (expr.type) {
            case exprType.binary:
                this.print(expr.left as Expression);
                console.log(expr.operator?.value);
                this.print(expr.right as Expression)
                break;
            case exprType.unary:
                console.log("==unary==");
                //console.log(expr.operator);
                this.print(expr.left as Expression);
            case exprType.primary:
                console.log("val = " + expr.val);
                break;
            default:
                break;
        }
    }

    beginEvaluate(): number {
        return this.evaluate(this);
    }

    evaluate(expr: Expression): number {
        switch (expr.type) {
            case exprType.binary:

                switch (expr.operator?.type) {
                    case tokenType.divide:
                        return this.evaluate(expr.left as Expression) / this.evaluate(expr.right as Expression);
                    case tokenType.multiply:
                        return this.evaluate(expr.left as Expression) * this.evaluate(expr.right as Expression);

                    case tokenType.plus:
                        return this.evaluate(expr.left as Expression) + this.evaluate(expr.right as Expression);
                    case tokenType.minus:
                        return this.evaluate(expr.left as Expression) - this.evaluate(expr.right as Expression);
                    default:
                        throw new Error("unexpected operator");
                }
            case exprType.unary:
                if (expr.operator?.type == tokenType.minus) return -this.evaluate(expr.left as Expression);
                throw new Error("unexpected operator");
            case exprType.primary:
                return expr.val as number;
            case exprType.grouping:
                return this.evaluate(expr.left as Expression);
            default:
                throw new Error("Unexpected expression");
        }
    }

    constructor(type: exprType, operator: Token | undefined, left: Expression | string | number, right?: Expression) {
        if (type === exprType.primary) {
            this.val = left;
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

    parse(): Expression {
        return this.expression();
    }

    constructor(tokens: Token[]) {
        this.tokens = tokens;
        this.current = 0;
    }
}


function genDivide() {
    console.log("   cqo");
    console.log("   idiv rdi");
    console.log("   push rax");
}

function genMultiply() {
    console.log("   imul rax, rdi");
    console.log("   push rax");
}

function genAdd() {
    console.log("   add rax, rdi");
    console.log("   push rax");
}

function genSubtract() {
    console.log("   sub rax, rdi");
    console.log("   push rax");
}

function genNegate() {
    console.log("   push rax");
}

function genBinary(operator: tokenType) {
    console.log("   pop rdi");
    console.log("   pop rax");
    switch (operator) {
        case tokenType.divide:
            genDivide();
            break;
        case tokenType.multiply:
            genMultiply();
            break
        case tokenType.plus:
            genAdd();
            break
        case tokenType.minus:
            genSubtract();
            break
        default:
            break;
    }
}

function genUnary() {
    genNegate();
}

function genPrimary(a: number) {
    console.log("   push " + a);
}

function genLval() { }


function generateCode(expr: Expression) {
    switch (expr.type) {
        case exprType.binary:
            generateCode(expr.left as Expression);
            generateCode(expr.right as Expression);
            genBinary(expr.operator?.type as tokenType);
            break;
        case exprType.unary:
            generateCode(expr.left as Expression);
            genUnary();
            break;
        case exprType.primary:
            genPrimary(expr.val as number);
            break;
        case exprType.grouping:
            generateCode(expr.left as Expression);
            break;
        default:
            throw new Error("Unexpected expression");
    }
}


function genStart(text: string, ast: Expression) {
    console.log(".intel_syntax noprefix");
    console.log(".global fmt")
    console.log(".data");
    console.log(".align 1");
    console.log(".fmtbytes:");
    for (let i = 0; i < text.length; i++) {
        console.log("   .byte '" + text[i] + "'");
    }
    console.log("   .byte " + 10);
    console.log("   .byte " + 0);
    console.log(".align 8");
    console.log("fmt: .quad .fmtbytes");
    console.log(".text");
    console.log(".global main");
    console.log("main:");
    console.log("   push rbp");
    console.log("   mov rbp, rsp");

    generateCode(ast);

    console.log("   mov rsi, rax");
    console.log("   mov rdi, fmt");

    console.log("  mov rax, rsp");
    console.log("  and rax, 15");
    console.log("  jnz .L.call");
    console.log("  mov rax, 0");
    console.log("  call printf");
    console.log("  jmp .L.end");
    console.log(".L.call:");
    console.log("  sub rsp, 8");
    console.log("  mov rax, 0");
    console.log("  call printf");
    console.log("  add rsp, 8");
    console.log(".L.end:");

    console.log("   xor rax, rax");
    console.log("   mov rsp, rbp");
    console.log("   pop rbp");
    console.log("   ret")
}



function compile(text: string) {
    var lexer = new Lexer(text);

    var tokens = lexer.lex();
    var parser = new Parser(tokens);
    var ast = parser.parse();

    var txt = text + " = %d";

    genStart(txt, ast);
}


// make > tmp.s
// gcc -static -o tmp tmp.s
// ./tmp
compile("(10/2 + 7 * 2)/2");

