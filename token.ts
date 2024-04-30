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
    f32,
    f64,
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
    squote,
    asm,

    str,
    undefined,
    hash,
    module,
    impl,
    doublecolon,
    import,

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
    tokenMap: any;

    constructor(text: string) {
        this.current = 0;
        this.text = text;
        this.initTokenMap();
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
        return /^[a-zA-Z_]$/.test(text);
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
                if (pk === "." && this.isNumber(this.peekNext())) { } else break;
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

    initTokenMap() {
        this.tokenMap = {
            var: tokenType.var,
            if: tokenType.if,
            else: tokenType.else,
            while: tokenType.while,
            break: tokenType.braek,
            continue: tokenType.contineu,
            extern: tokenType.extern,
            fn: tokenType.fn,
            return: tokenType.return,
            struct: tokenType.struct,
            void: tokenType.void,
            u8: tokenType.u8,
            u16: tokenType.u16,
            u32: tokenType.u32,
            u64: tokenType.u64,
            i8: tokenType.i8,
            i16: tokenType.i16,
            i32: tokenType.i32,
            i64: tokenType.i64,
            true: tokenType.true,
            false: tokenType.false,
            bool: tokenType.bool,
            eq: tokenType.eq,
            lte: tokenType.lte,
            gte: tokenType.gte,
            neq: tokenType.neq,
            f32: tokenType.f32,
            union: tokenType.union,
            enum: tokenType.enum,
            and: tokenType.and,
            or: tokenType.or,
            str: tokenType.str,
            undefined: tokenType.undefined,
            asm: tokenType.asm,
            module: tokenType.module,
            impl: tokenType.impl,
            import: tokenType.import
        }
    }

    identifier(): Token {
        var start = this.current;
        while (this.moreTokens()) {
            if (!this.isAlnum(this.peek())) break;
            this.advance();
        }
        var str = this.text.substring(start, this.current);
        var type = this.tokenMap[str];
        if (type) {
            return new Token(type, str, this.line, this.col);
        }

        return new Token(tokenType.identifier, str, this.line, this.col);
    }

    tokenError(message: string): void {
        console.error(message + " - [ line: " + this.line + " col: " + this.col + " ]");
        process.exit();
    }

    skipComment() {
        while (this.moreTokens() && this.peek() !== '\n') {
            this.advance();
        }
        if (this.moreTokens()) {
            this.advance();
        }
    }

    push(T: tokenType, val: string | number) {
        this.tokens.push(new Token(T, val, this.line, this.col));
        this.advance();
    }

    lex(): Token[] {
        this.line = 1;
        this.col = 1;

        while (true) {
            let char = this.peek();
            if (this.isNumber(char)) {
                this.number();
                continue;
            } else if (this.isSpace(char)) {
                if (this.advance() === '\n') {
                    this.col = 1; this.line++;
                } else this.col++;
                continue;
            } else if (this.isAlpha(char)) {
                this.tokens.push(this.identifier());
                continue;
            } else if (char === "#") {
                this.skipComment();
                continue;
            }

            if (char === "eof") {
                this.tokens.push(new Token(tokenType.eof, "eof", this.line, this.col));
                break;
            }

            switch (char) {
                case "+":
                    this.push(tokenType.plus, char);
                    break;
                case "-":
                    this.push(tokenType.minus, char);
                    break;
                case "/":
                    this.push(tokenType.divide, char);
                    break;
                case "*":
                    this.push(tokenType.multiply, char);
                    break;
                case "@":
                    this.push(tokenType.at, char);
                    break;
                case ",":
                    this.push(tokenType.comma, char);
                    break;
                case '(':
                    this.push(tokenType.leftparen, char);
                    break;
                case ';':
                    this.push(tokenType.semicolon, char);
                    break;
                case '>':
                    this.push(tokenType.greater, char);
                    break;
                case '!':
                    this.push(tokenType.bang, char);
                    break;
                case '<':
                    this.push(tokenType.less, char);
                    break;
                case '^':
                    this.push(tokenType.bitxor, char);
                    break;
                case '&':
                    this.push(tokenType.bitand, char);
                    break;
                case '|':
                    this.push(tokenType.bitor, char);
                    break;
                case '~':
                    this.push(tokenType.bitnot, char);
                    break;
                case ')':
                    this.push(tokenType.rightparen, char);
                    break;
                case '(':
                    this.push(tokenType.leftparen, char);
                    break;
                case '&':
                    this.push(tokenType.andsand, char);
                    break;
                case '}':
                    this.push(tokenType.rightbrace, char);
                    break;
                case '{':
                    this.push(tokenType.leftbrace, char);
                    break;
                case '=':
                    if(this.peekNext() === "=") {
                        this.push(tokenType.eq, "=");
                        this.advance();
                        continue;
                    }
                    this.push(tokenType.equal, char);
                    break;
                case ':':
                    if(this.peekNext() === ":") {
                        this.push(tokenType.doublecolon, "::");
                        this.advance();
                        continue;
                    }
                    this.push(tokenType.colon, char);
                    break;
                case '[':
                    this.push(tokenType.leftsquare, char);
                    break;
                case ']':
                    this.push(tokenType.rightsquare, char);
                    break;
                case '.':
                    this.push(tokenType.dot, char);
                    break;
                case '%':
                    this.push(tokenType.mod, char);
                    break;
                case '"':
                    this.tokens.push(this.readString());
                    break;
                case "'":
                    this.push(tokenType.squote, char);
                    break;
                default:
                    //console.error(char);
                    this.tokenError("unexpected token " + char);
            }
        }

        return this.tokens;
    }
}