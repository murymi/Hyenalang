export enum tokenType {
    plus,
    minus,
    multiply,
    divide,
    number,
    undef,
    leftparen,
    rightparen,
    semicolon,
    eof
};

export class Token {
    type: tokenType;
    value: string | number;

    constructor(type: tokenType, value: string | number) {
        this.type = type;
        this.value = value;
    }
}

export class Lexer {
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
            } else if (char === ';') {
                tokens.push(new Token(tokenType.semicolon, ";"));
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