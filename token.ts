//import process from "process";

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
    colon,
    identifier,
    var,
    equal,
    leftbrace,
    rightbrace,
    bang,
    greater,
    less,
    if,
    else,
    while,
    braek,
    contineu,
    extern,
    fn,
    dot,
    comma,
    string,
    return,
    struct,

    leftsquare,
    rightsquare,

    andsand,
    mod,

    u8,
    u16,
    u32,
    u64,

    i8,
    i16,
    i32,
    i64,

    u8ptr,
    u16ptr,
    u32ptr,
    u64ptr,

    i8ptr,
    i16ptr,
    i32ptr,
    i64ptr,

    f32,
    f64,

    f32ptr,
    f64ptr,

    void,
    true,
    false,
    bool,

    eq,
    neq,

    lte,
    gte,

    union,
    enum,

    at,
    and,
    or,

    bitxor,
    bitand,
    bitor,
    bitnot,

    eof
};

export class Token {
    type: tokenType;
    value: string | number;
    line: number;
    col: number;
    isfloat: boolean;

    constructor(type: tokenType, value: string | number, line: number, col: number, isfloat?: boolean) {
        this.type = type;
        this.value = value;
        this.col = col;
        this.line = line;

        if (isfloat) {
            this.isfloat = isfloat;
        }
    }
}

export class Lexer {
    current: number;
    text: string;
    line: number;
    col: number;
    tokens: Token[] = [];

    constructor(text: string) {
        this.current = 0;
        this.text = text;
    }

    expect(char: string) {
        if (this.peek() === char) {
            this.advance();
            return;
        }

        throw new Error("Expected " + char);
    }

    peek() {
        if (!this.moreTokens()) return "eof";
        return this.text[this.current];
    }

    peekNext() {
        if (!this.moreTokens()) return "eof";
        return this.text[this.current + 1];
    }

    advance() {
        this.current++;
        this.col++;
        return this.text[this.current - 1];
    }

    moreTokens() {
        return this.current < this.text.length;
    }

    isSpace(text: string): boolean {
        if (text == ' ' || text === '\t' || text == '\n') return true;
        return false;
    }

    isAlpha(text: string): boolean {
        return /^[a-z]$/.test(text);
    }

    isNumber(text: string): boolean {
        return /^[0-9]$/.test(text);
    }

    isAlnum(text: string): boolean {
        return this.isAlpha(text) || this.isNumber(text)
    }

    number() {
        var start = this.current;
        var isfloat = false;
        while (this.moreTokens()) {
            var pk = this.peek();
            if (!this.isNumber(pk)) {
                if (pk === "." && this.isNumber(this.peekNext())) {} else break;
                isfloat = true;
            }
            this.advance();
        }
        var str = this.text.substring(start, this.current);
        this.tokens.push(new Token(tokenType.number, parseFloat(str), this.line, this.col, isfloat));
    }

    getEscape() {
        switch (this.peekNext()) {
            case "n": return '\n';
            case "t": return '\t';
            case "r": return '\r';
            case "0": return '\0';
            case "b": return '\b';
        }

        console.error(`unsupported escape sequence \\${this.peekNext()}`);
        process.exit(1);
    }

    readString(): Token {
        this.advance();
        var start = this.current;
        var value = "";
        while (this.moreTokens() && this.peek() !== '"' && this.peek() !== "\n") {
            if (this.peek() === "\\") {
                value += this.getEscape();
                this.advance();
            } else {
                value += this.peek();
            }
            this.advance();
        }
        this.expect('"');
        return new Token(tokenType.string, value, this.line, this.col, true);
    }

    identifier(): Token {
        var start = this.current;
        while (this.moreTokens()) {
            if (!this.isAlnum(this.peek())) break;
            this.advance();
        }
        var str = this.text.substring(start, this.current);
        if (str === "var") return new Token(tokenType.var, str, this.line, this.col);
        if (str === "if") return new Token(tokenType.if, str, this.line, this.col);
        if (str === "else") return new Token(tokenType.else, str, this.line, this.col);
        if (str === "while") return new Token(tokenType.while, str, this.line, this.col);
        if (str === "break") return new Token(tokenType.braek, str, this.line, this.col);
        if (str === "continue") return new Token(tokenType.contineu, str, this.line, this.col);
        if (str === "extern") return new Token(tokenType.extern, str, this.line, this.col);
        if (str === "fn") return new Token(tokenType.fn, str, this.line, this.col);
        if (str === "return") return new Token(tokenType.return, str, this.line, this.col);
        if (str === "struct") return new Token(tokenType.struct, str, this.line, this.col);

        if (str === "void") return new Token(tokenType.void, str, this.line, this.col);

        if (str === "u8") return new Token(tokenType.u8, str, this.line, this.col);
        if (str === "u16") return new Token(tokenType.u16, str, this.line, this.col);
        if (str === "u32") return new Token(tokenType.u32, str, this.line, this.col);
        if (str === "u64") return new Token(tokenType.u64, str, this.line, this.col);

        if (str === "i8") return new Token(tokenType.i8, str, this.line, this.col);
        if (str === "i16") return new Token(tokenType.i16, str, this.line, this.col);
        if (str === "i32") return new Token(tokenType.i32, str, this.line, this.col);
        if (str === "i64") return new Token(tokenType.i64, str, this.line, this.col);
        if (str === "true") return new Token(tokenType.true, str, this.line, this.col);
        if (str === "false") return new Token(tokenType.false, str, this.line, this.col);
        if (str === "bool") return new Token(tokenType.bool, str, this.line, this.col);
        if (str === "eq") return new Token(tokenType.eq, str, this.line, this.col);
        if (str === "lte") return new Token(tokenType.lte, str, this.line, this.col);
        if (str === "gte") return new Token(tokenType.gte, str, this.line, this.col);
        if (str === "neq") return new Token(tokenType.neq, str, this.line, this.col);

        if (str === "f32") return new Token(tokenType.f32, str, this.line, this.col);
        if (str === "union") return new Token(tokenType.union, str, this.line, this.col);
        if (str === "enum") return new Token(tokenType.enum, str, this.line, this.col);
        if (str === "and") return new Token(tokenType.and, str, this.line, this.col);
        if (str === "or") return new Token(tokenType.or, str, this.line, this.col);

        return new Token(tokenType.identifier, str, this.line, this.col);
    }

    tokenError(message: string): void {
        console.error(message + " - [ line: " + this.line + " col: " + this.col + " ]");
        process.exit();
    }



    lex(): Token[] {
        this.line = 1;
        this.col = 1;

        while (true) {
            let char = this.peek();

            //console.error("token => ", char);
            if (this.isNumber(char)) {
                this.number();
            } else if (this.isSpace(char)) {
                if (this.advance() === '\n') {
                    this.col = 1; this.line++;
                } else this.col++;
                continue;
            }
            else if (char === "+") {
                this.tokens.push(new Token(tokenType.plus, "+", this.line, this.col));
                this.advance();
            } else if (char === "-") {
                this.tokens.push(new Token(tokenType.minus, "-", this.line, this.col));
                this.advance();
            } else if (char === "/") {
                this.tokens.push(new Token(tokenType.divide, "/", this.line, this.col));
                this.advance();
            } else if (char === "*") {
                this.tokens.push(new Token(tokenType.multiply, "*", this.line, this.col));
                this.advance();
            } else if (char === "@") {
                this.tokens.push(new Token(tokenType.at, "@", this.line, this.col));
                this.advance();
            } else if (char === ",") {
                this.tokens.push(new Token(tokenType.comma, ",", this.line, this.col));
                this.advance();
            } else if (char === '(') {
                this.tokens.push(new Token(tokenType.leftparen, "(", this.line, this.col));
                this.advance();
            } else if (char === ';') {
                this.tokens.push(new Token(tokenType.semicolon, ";", this.line, this.col));
                this.advance();
            } else if (char === '>') {
                this.tokens.push(new Token(tokenType.greater, ">", this.line, this.col));
                this.advance();
            } else if (char === '!') {
                this.tokens.push(new Token(tokenType.bang, "!", this.line, this.col));
                this.advance();
            } else if (char === '<') {
                this.tokens.push(new Token(tokenType.less, "<", this.line, this.col));
                this.advance();
            }
            else if (char === '^') {
                this.tokens.push(new Token(tokenType.bitor, "^", this.line, this.col));
                this.advance();
            } else if (char === '&') {
                this.tokens.push(new Token(tokenType.bitand, "&", this.line, this.col));
                this.advance();
            } else if (char === '|') {
                this.tokens.push(new Token(tokenType.bitor, "|", this.line, this.col));
                this.advance();
            } else if (char === '~') {
                this.tokens.push(new Token(tokenType.bitnot, "~", this.line, this.col));
                this.advance();
            } else if (char === ')') {
                this.tokens.push(new Token(tokenType.rightparen, ")", this.line, this.col));
                this.advance();
            } else if (char === '&') {
                this.tokens.push(new Token(tokenType.andsand, "&", this.line, this.col));
                this.advance();
            } else if (char === '}') {
                this.tokens.push(new Token(tokenType.rightbrace, "}", this.line, this.col));
                this.advance();
            } else if (char === '{') {
                this.tokens.push(new Token(tokenType.leftbrace, "{", this.line, this.col));
                this.advance();
            } else if (char === '=') {
                this.tokens.push(new Token(tokenType.equal, "=", this.line, this.col));
                this.advance();
            } else if (char === ':') {
                this.tokens.push(new Token(tokenType.colon, ":", this.line, this.col));
                this.advance();
            } else if (char === '[') {
                this.tokens.push(new Token(tokenType.leftsquare, "[", this.line, this.col));
                this.advance();
            } else if (char === ']') {
                this.tokens.push(new Token(tokenType.rightsquare, "]", this.line, this.col));
                this.advance();
            } else if (char === '.') {
                this.tokens.push(new Token(tokenType.dot, ".", this.line, this.col));
                this.advance();
            }   else if (char === '%') {
                this.tokens.push(new Token(tokenType.mod, "%", this.line, this.col));
                this.advance();
            }  else if (char === '"') {
                this.tokens.push(this.readString());
            } else if (this.isAlpha(char)) {
                this.tokens.push(this.identifier());
            } else if (char === "eof") {
                this.tokens.push(new Token(tokenType.eof, "eof", this.line, this.col));
                break;
            } else {
                //console.error(char);
                this.tokenError("unexpected token " + char);
            }

        }

        return this.tokens;
    }
}